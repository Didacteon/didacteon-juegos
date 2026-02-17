import type { Room } from "../rooms/Room";

export interface GameServerAdapter {
  createInitialState(
    config: Record<string, unknown>,
    playerIds: string[]
  ): Record<string, unknown>;
  applyAction(
    state: Record<string, unknown>,
    action: Record<string, unknown> & { playerId: string }
  ): Record<string, unknown>;
  validateAction(
    state: Record<string, unknown>,
    action: Record<string, unknown> & { playerId: string }
  ): boolean;
  isFinished(state: Record<string, unknown>): boolean;
  calculateResults(state: Record<string, unknown>): {
    rankings: Array<{ playerId: string; score: number; rank: number }>;
  };
  tick?(state: Record<string, unknown>, deltaMs: number): Record<string, unknown>;
  defaultConfig: Record<string, unknown>;
}

export class GameSession {
  public state: Record<string, unknown>;
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private lastTick: number = Date.now();

  constructor(
    private room: Room,
    private adapter: GameServerAdapter,
    config: Record<string, unknown>
  ) {
    const playerIds = room.getPlayerIds();
    this.state = adapter.createInitialState(config, playerIds);
  }

  start(): void {
    this.room.status = "playing";
    this.room.broadcast({ type: "game:started", state: this.state });

    if (this.adapter.tick) {
      this.lastTick = Date.now();
      this.tickInterval = setInterval(() => this.processTick(), 1000);
    }
  }

  handleAction(
    playerId: string,
    action: Record<string, unknown>
  ): void {
    const fullAction = { ...action, playerId };

    if (!this.adapter.validateAction(this.state, fullAction)) {
      this.room.sendTo(playerId, {
        type: "error",
        code: "INVALID_ACTION",
        message: "Acción no válida",
      });
      return;
    }

    this.state = this.adapter.applyAction(this.state, fullAction);
    this.room.broadcast({ type: "game:state", state: this.state });

    if (this.adapter.isFinished(this.state)) {
      this.finish();
    }
  }

  private processTick(): void {
    if (!this.adapter.tick) return;

    const now = Date.now();
    const delta = now - this.lastTick;
    this.lastTick = now;

    this.state = this.adapter.tick(this.state, delta);
    this.room.broadcast({ type: "game:state", state: this.state });

    if (this.adapter.isFinished(this.state)) {
      this.finish();
    }
  }

  private finish(): void {
    this.stop();
    this.room.status = "finished";
    const results = this.adapter.calculateResults(this.state);
    this.room.broadcast({ type: "game:finished", results });
  }

  stop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }
}
