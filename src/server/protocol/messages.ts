import { z } from "zod/v4";

// ─── Client → Server ───

export const clientMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("room:join"), roomId: z.string() }),
  z.object({ type: z.literal("room:leave") }),
  z.object({ type: z.literal("room:ready"), ready: z.boolean() }),
  z.object({ type: z.literal("room:start") }),
  z.object({ type: z.literal("room:kick"), userId: z.string() }),
  z.object({ type: z.literal("chat:send"), content: z.string().max(500) }),
  z.object({
    type: z.literal("game:action"),
    action: z.record(z.string(), z.unknown()),
  }),
  z.object({ type: z.literal("ping") }),
]);

export type ClientMessage = z.infer<typeof clientMessageSchema>;

// ─── Server → Client ───

export interface PlayerInfo {
  id: string;
  username: string;
  isReady: boolean;
}

export interface RoomSnapshot {
  id: string;
  code: string;
  gameSlug: string;
  hostId: string;
  status: string;
  maxPlayers: number;
  players: PlayerInfo[];
  config: Record<string, unknown> | null;
}

export interface ChatMessageData {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
}

export type ServerMessage =
  | { type: "room:state"; room: RoomSnapshot }
  | { type: "room:player-joined"; player: PlayerInfo }
  | { type: "room:player-left"; playerId: string }
  | { type: "room:player-ready"; playerId: string; ready: boolean }
  | { type: "chat:message"; message: ChatMessageData }
  | { type: "chat:history"; messages: ChatMessageData[] }
  | { type: "game:state"; state: Record<string, unknown> }
  | { type: "game:started"; state: Record<string, unknown> }
  | {
      type: "game:finished";
      results: {
        rankings: Array<{
          playerId: string;
          score: number;
          rank: number;
        }>;
      };
    }
  | { type: "error"; code: string; message: string }
  | { type: "pong" };
