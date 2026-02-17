// Load env vars BEFORE any other imports that use process.env
import { config } from "dotenv";
config({ path: ".env.local" });

import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { verifyWSToken, type WSUser } from "./auth";
import { decodeClientMessage } from "./protocol/codec";
import { encodeServerMessage } from "./protocol/codec";
import { RoomManager } from "./rooms/RoomManager";
import { GameSessionManager } from "./games/GameSessionManager";
import { handleChatSend, sendChatHistory } from "./chat/ChatHandler";

const PORT = parseInt(process.env.WS_PORT || "3001", 10);

const roomManager = new RoomManager();
const gameSessionManager = new GameSessionManager();

// Map WebSocket → authenticated user
const wsUsers = new Map<WebSocket, WSUser>();

const server = createServer();
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", async (request, socket, head) => {
  const url = new URL(request.url || "/", `http://localhost:${PORT}`);
  const token = url.searchParams.get("token");

  if (!token) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  const user = await verifyWSToken(token);
  if (!user) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  wss.handleUpgrade(request, socket, head, (ws) => {
    wsUsers.set(ws, user);
    wss.emit("connection", ws, request);
  });
});

wss.on("connection", (ws: WebSocket) => {
  const user = wsUsers.get(ws);
  if (!user) {
    ws.close();
    return;
  }

  ws.on("message", async (raw: Buffer) => {
    const message = decodeClientMessage(raw.toString());
    if (!message) {
      ws.send(
        encodeServerMessage({
          type: "error",
          code: "INVALID_MESSAGE",
          message: "Mensaje no válido",
        })
      );
      return;
    }

    switch (message.type) {
      case "ping": {
        ws.send(encodeServerMessage({ type: "pong" }));
        break;
      }

      case "room:join": {
        console.log("[room:join] user:", user.userId, "roomId:", message.roomId);
        const room = await roomManager.joinRoom(
          message.roomId,
          user.userId,
          user.username,
          ws
        );
        if (!room) {
          ws.send(
            encodeServerMessage({
              type: "error",
              code: "JOIN_FAILED",
              message: "No se pudo unir a la sala",
            })
          );
          break;
        }

        // Send room state to the joining player
        room.sendTo(user.userId, {
          type: "room:state",
          room: room.getSnapshot(),
        });

        // Send chat history
        sendChatHistory(room, user.userId);

        // If game is in progress, send current game state
        if (room.status === "playing") {
          const session = gameSessionManager.getSession(room.id);
          if (session) {
            room.sendTo(user.userId, {
              type: "game:started",
              state: session.state,
            });
          }
        } else {
          // Broadcast to others (exclude the joining player)
          room.broadcast(
            {
              type: "room:player-joined",
              player: {
                id: user.userId,
                username: user.username,
                isReady: false,
              },
            },
            user.userId
          );
        }
        break;
      }

      case "room:leave": {
        roomManager.leaveCurrentRoom(user.userId);
        break;
      }

      case "room:ready": {
        const room = roomManager.getPlayerRoom(user.userId);
        if (!room) break;

        room.setReady(user.userId, message.ready);
        room.broadcast({
          type: "room:player-ready",
          playerId: user.userId,
          ready: message.ready,
        });
        break;
      }

      case "room:start": {
        console.log("[room:start] user:", user.userId, "host attempt");
        const room = roomManager.getPlayerRoom(user.userId);
        console.log("[room:start] room found:", !!room, room ? `hostId=${room.hostId} status=${room.status}` : "");
        if (!room || room.hostId !== user.userId) {
          ws.send(
            encodeServerMessage({
              type: "error",
              code: "NOT_HOST",
              message: "Solo el anfitrión puede iniciar la partida",
            })
          );
          break;
        }

        const session = await gameSessionManager.startGame(room);
        if (!session) {
          ws.send(
            encodeServerMessage({
              type: "error",
              code: "GAME_NOT_FOUND",
              message: "Juego no encontrado",
            })
          );
        }
        break;
      }

      case "room:kick": {
        const room = roomManager.getPlayerRoom(user.userId);
        if (!room || room.hostId !== user.userId) break;

        const kicked = room.getPlayer(message.userId);
        if (kicked) {
          kicked.ws.send(
            encodeServerMessage({
              type: "error",
              code: "KICKED",
              message: "Has sido expulsado de la sala",
            })
          );
          roomManager.leaveCurrentRoom(message.userId);
        }
        break;
      }

      case "chat:send": {
        const room = roomManager.getPlayerRoom(user.userId);
        if (!room) break;
        handleChatSend(room, user.userId, user.username, message.content);
        break;
      }

      case "game:action": {
        const room = roomManager.getPlayerRoom(user.userId);
        if (!room || room.status !== "playing") break;

        const session = gameSessionManager.getSession(room.id);
        if (session) {
          session.handleAction(user.userId, message.action);
        }
        break;
      }
    }
  });

  ws.on("close", () => {
    roomManager.leaveCurrentRoom(user.userId);
    wsUsers.delete(ws);
  });
});

server.listen(PORT, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down...");
  roomManager.destroy();
  gameSessionManager.destroy();
  wss.close();
  server.close();
  process.exit(0);
});
