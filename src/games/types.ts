import type { ComponentType } from "react";
import type { GameServerAdapter } from "@/server/games/GameSession";

export type GameCategory =
  | "palabras"
  | "logica"
  | "matematicas"
  | "ciencias"
  | "historia"
  | "geografia";

export interface GameMeta {
  slug: string;
  name: string;
  description: string;
  category: GameCategory;
  minPlayers: number;
  maxPlayers: number;
  estimatedDuration: string;
}

export interface GameBoardProps {
  state: Record<string, unknown>;
  playerId: string;
  sendAction: (action: Record<string, unknown>) => void;
  timeRemaining?: number;
}

export interface GameConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export interface GameResultsProps {
  results: {
    rankings: Array<{ playerId: string; score: number; rank: number }>;
  };
  playerId: string;
}

export interface GameClientModule {
  Board: ComponentType<GameBoardProps>;
  ConfigPanel?: ComponentType<GameConfigProps>;
  ResultsView?: ComponentType<GameResultsProps>;
}

export interface GameModule {
  meta: GameMeta;
  client: GameClientModule;
  server: GameServerAdapter;
}
