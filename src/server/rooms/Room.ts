import type { WebSocket } from "ws";
import type {
  PlayerInfo,
  RoomSnapshot,
  ServerMessage,
  ChatMessageData,
} from "../protocol/messages";
import { encodeServerMessage } from "../protocol/codec";

export interface RoomPlayer {
  userId: string;
  username: string;
  ws: WebSocket;
  isReady: boolean;
}

export class Room {
  public readonly id: string;
  public readonly code: string;
  public readonly gameSlug: string;
  public readonly hostId: string;
  public readonly maxPlayers: number;
  public config: Record<string, unknown> | null;
  public status: "waiting" | "playing" | "finished" = "waiting";

  private players: Map<string, RoomPlayer> = new Map();
  private chatHistory: ChatMessageData[] = [];
  private chatIdCounter = 0;

  constructor(params: {
    id: string;
    code: string;
    gameSlug: string;
    hostId: string;
    maxPlayers: number;
    config: Record<string, unknown> | null;
  }) {
    this.id = params.id;
    this.code = params.code;
    this.gameSlug = params.gameSlug;
    this.hostId = params.hostId;
    this.maxPlayers = params.maxPlayers;
    this.config = params.config;
  }

  get playerCount(): number {
    return this.players.size;
  }

  get isEmpty(): boolean {
    return this.players.size === 0;
  }

  hasPlayer(userId: string): boolean {
    return this.players.has(userId);
  }

  getPlayer(userId: string): RoomPlayer | undefined {
    return this.players.get(userId);
  }

  getPlayerIds(): string[] {
    return Array.from(this.players.keys());
  }

  addPlayer(userId: string, username: string, ws: WebSocket): boolean {
    if (this.status === "finished") return false;

    // Allow reconnection if player was already in the room
    const existing = this.players.get(userId);
    if (existing) {
      existing.ws = ws;
      return true;
    }

    // New players can only join during waiting phase
    if (this.status !== "waiting") return false;
    if (this.players.size >= this.maxPlayers) return false;

    this.players.set(userId, { userId, username, ws, isReady: false });
    return true;
  }

  removePlayer(userId: string): void {
    // During active game, keep player in the room but disconnect their WS
    if (this.status === "playing") {
      const player = this.players.get(userId);
      if (player) {
        player.ws = null as unknown as WebSocket;
      }
      return;
    }
    this.players.delete(userId);
  }

  setReady(userId: string, ready: boolean): void {
    const player = this.players.get(userId);
    if (player) player.isReady = ready;
  }

  allReady(): boolean {
    if (this.players.size < 2) return false;
    for (const player of this.players.values()) {
      if (!player.isReady) return false;
    }
    return true;
  }

  addChatMessage(userId: string, username: string, content: string): ChatMessageData {
    const message: ChatMessageData = {
      id: `chat-${++this.chatIdCounter}`,
      userId,
      username,
      content,
      timestamp: Date.now(),
    };
    this.chatHistory.push(message);
    if (this.chatHistory.length > 100) {
      this.chatHistory = this.chatHistory.slice(-100);
    }
    return message;
  }

  getChatHistory(): ChatMessageData[] {
    return this.chatHistory;
  }

  getSnapshot(): RoomSnapshot {
    const players: PlayerInfo[] = [];
    for (const p of this.players.values()) {
      players.push({
        id: p.userId,
        username: p.username,
        isReady: p.isReady,
      });
    }
    return {
      id: this.id,
      code: this.code,
      gameSlug: this.gameSlug,
      hostId: this.hostId,
      status: this.status,
      maxPlayers: this.maxPlayers,
      players,
      config: this.config,
    };
  }

  broadcast(message: ServerMessage, excludeUserId?: string): void {
    const encoded = encodeServerMessage(message);
    for (const player of this.players.values()) {
      if (player.userId === excludeUserId) continue;
      if (player.ws.readyState === player.ws.OPEN) {
        player.ws.send(encoded);
      }
    }
  }

  sendTo(userId: string, message: ServerMessage): void {
    const player = this.players.get(userId);
    if (player && player.ws.readyState === player.ws.OPEN) {
      player.ws.send(encodeServerMessage(message));
    }
  }
}
