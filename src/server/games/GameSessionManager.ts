import type { Room } from "../rooms/Room";
import { GameSession, type GameServerAdapter } from "./GameSession";

// Server-side game adapters registry
const adapterRegistry: Record<
  string,
  () => Promise<{ default: GameServerAdapter }>
> = {
  "sopa-de-letras": () => import("./adapters/sopa-de-letras"),
};

export class GameSessionManager {
  private sessions: Map<string, GameSession> = new Map();

  async startGame(room: Room): Promise<GameSession | null> {
    const loader = adapterRegistry[room.gameSlug];
    if (!loader) {
      console.log("[GameSessionManager] No adapter for:", room.gameSlug);
      return null;
    }

    try {
      const mod = await loader();
      const adapter = mod.default;

      const config = room.config || adapter.defaultConfig;
      const session = new GameSession(room, adapter, config);

      this.sessions.set(room.id, session);
      session.start();
      console.log("[GameSessionManager] Game started:", room.gameSlug, "room:", room.id);

      return session;
    } catch (err) {
      console.error("[GameSessionManager] Failed to start game:", err);
      return null;
    }
  }

  getSession(roomId: string): GameSession | undefined {
    return this.sessions.get(roomId);
  }

  removeSession(roomId: string): void {
    const session = this.sessions.get(roomId);
    if (session) {
      session.stop();
      this.sessions.delete(roomId);
    }
  }

  destroy(): void {
    for (const session of this.sessions.values()) {
      session.stop();
    }
    this.sessions.clear();
  }
}
