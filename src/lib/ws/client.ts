"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type {
  ServerMessage,
  RoomSnapshot,
  ChatMessageData,
} from "@/server/protocol/messages";

interface UseWebSocketOptions {
  roomId: string;
  onGameStarted?: (state: Record<string, unknown>) => void;
  onGameState?: (state: Record<string, unknown>) => void;
  onGameFinished?: (results: {
    rankings: Array<{ playerId: string; score: number; rank: number }>;
  }) => void;
}

interface UseWebSocketReturn {
  connected: boolean;
  room: RoomSnapshot | null;
  chatMessages: ChatMessageData[];
  error: string | null;
  sendAction: (action: Record<string, unknown>) => void;
  sendChat: (content: string) => void;
  setReady: (ready: boolean) => void;
  startGame: () => void;
  leaveRoom: () => void;
}

export function useWebSocket({
  roomId,
  onGameStarted,
  onGameState,
  onGameFinished,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessageData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reconnectAttempts = useRef(0);

  const send = useCallback((data: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const sendAction = useCallback(
    (action: Record<string, unknown>) => {
      send({ type: "game:action", action });
    },
    [send]
  );

  const sendChat = useCallback(
    (content: string) => {
      send({ type: "chat:send", content });
    },
    [send]
  );

  const setReady = useCallback(
    (ready: boolean) => {
      send({ type: "room:ready", ready });
    },
    [send]
  );

  const startGame = useCallback(() => {
    send({ type: "room:start" });
  }, [send]);

  const leaveRoom = useCallback(() => {
    send({ type: "room:leave" });
    wsRef.current?.close();
  }, [send]);

  useEffect(() => {
    let destroyed = false;

    async function connect() {
      try {
        // Get WS token
        const res = await fetch("/api/auth/ws-token");
        if (!res.ok) {
          setError("No autorizado");
          return;
        }
        const { token } = await res.json();

        if (destroyed) return;

        const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setConnected(true);
          setError(null);
          reconnectAttempts.current = 0;
          // Join room
          ws.send(JSON.stringify({ type: "room:join", roomId }));
        };

        ws.onmessage = (event) => {
          const message: ServerMessage = JSON.parse(event.data as string);

          switch (message.type) {
            case "room:state":
              setRoom(message.room);
              break;

            case "room:player-joined":
              setRoom((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  players: [...prev.players, message.player],
                };
              });
              break;

            case "room:player-left":
              setRoom((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  players: prev.players.filter(
                    (p) => p.id !== message.playerId
                  ),
                };
              });
              break;

            case "room:player-ready":
              setRoom((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  players: prev.players.map((p) =>
                    p.id === message.playerId
                      ? { ...p, isReady: message.ready }
                      : p
                  ),
                };
              });
              break;

            case "chat:history":
              setChatMessages(message.messages);
              break;

            case "chat:message":
              setChatMessages((prev) => [...prev, message.message]);
              break;

            case "game:started":
              setRoom((prev) =>
                prev ? { ...prev, status: "playing" } : prev
              );
              onGameStarted?.(message.state);
              break;

            case "game:state":
              onGameState?.(message.state);
              break;

            case "game:finished":
              setRoom((prev) =>
                prev ? { ...prev, status: "finished" } : prev
              );
              onGameFinished?.(message.results);
              break;

            case "error":
              setError(message.message);
              break;

            case "pong":
              break;
          }
        };

        ws.onclose = () => {
          setConnected(false);
          wsRef.current = null;

          if (!destroyed && reconnectAttempts.current < 5) {
            const delay = Math.min(
              1000 * Math.pow(2, reconnectAttempts.current),
              30000
            );
            reconnectAttempts.current++;
            reconnectTimeoutRef.current = setTimeout(connect, delay);
          }
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        setError("Error de conexión");
      }
    }

    connect();

    // Ping every 30 seconds to keep alive
    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);

    return () => {
      destroyed = true;
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [roomId, onGameStarted, onGameState, onGameFinished]);

  return {
    connected,
    room,
    chatMessages,
    error,
    sendAction,
    sendChat,
    setReady,
    startGame,
    leaveRoom,
  };
}
