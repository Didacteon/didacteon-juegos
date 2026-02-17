import type { WebSocket } from "ws";
import { eq } from "drizzle-orm";
import { Room } from "./Room";
import type { ServerMessage } from "../protocol/messages";
import { encodeServerMessage } from "../protocol/codec";
import { db } from "@/lib/db";
import { rooms } from "@/lib/db/schema";

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private playerRooms: Map<string, string> = new Map(); // userId → roomId
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor() {
    // Clean up stale rooms every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  createRoom(params: {
    id: string;
    code: string;
    gameSlug: string;
    hostId: string;
    maxPlayers: number;
    config: Record<string, unknown> | null;
  }): Room {
    const room = new Room(params);
    this.rooms.set(room.id, room);
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getRoomByCode(code: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.code === code) return room;
    }
    return undefined;
  }

  getPlayerRoom(userId: string): Room | undefined {
    const roomId = this.playerRooms.get(userId);
    if (!roomId) return undefined;
    return this.rooms.get(roomId);
  }

  async joinRoom(
    roomId: string,
    userId: string,
    username: string,
    ws: WebSocket
  ): Promise<Room | null> {
    // Leave current room first
    this.leaveCurrentRoom(userId);

    let room = this.rooms.get(roomId);

    // If room not in memory, load from database
    if (!room) {
      const [dbRoom] = await db
        .select()
        .from(rooms)
        .where(eq(rooms.id, roomId))
        .limit(1);

      if (!dbRoom || dbRoom.status !== "waiting") return null;

      room = this.createRoom({
        id: dbRoom.id,
        code: dbRoom.code,
        gameSlug: dbRoom.gameSlug,
        hostId: dbRoom.hostId,
        maxPlayers: dbRoom.maxPlayers,
        config: dbRoom.config as Record<string, unknown> | null,
      });
    }

    const joined = room.addPlayer(userId, username, ws);
    if (!joined) return null;

    this.playerRooms.set(userId, roomId);
    return room;
  }

  leaveCurrentRoom(userId: string): void {
    const roomId = this.playerRooms.get(userId);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (room) {
      room.removePlayer(userId);

      // Don't broadcast leave or clean up during active game
      if (room.status !== "playing") {
        room.broadcast({ type: "room:player-left", playerId: userId });

        if (room.isEmpty) {
          this.rooms.delete(roomId);
        }
      }
    }

    // Keep playerRooms mapping during active game so they can rejoin
    if (!room || room.status !== "playing") {
      this.playerRooms.delete(userId);
    }
  }

  private cleanup(): void {
    for (const [id, room] of this.rooms) {
      if (room.isEmpty && room.status !== "playing") {
        this.rooms.delete(id);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.rooms.clear();
    this.playerRooms.clear();
  }
}
