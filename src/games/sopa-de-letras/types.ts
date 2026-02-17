export interface SopaConfig {
  gridSize: number;
  wordCount: number;
  timeLimit: number; // seconds, 0 = no limit
  category: string;
}

export interface SopaWord {
  word: string;
  startRow: number;
  startCol: number;
  direction: Direction;
  foundBy: string | null;
}

export type Direction =
  | "horizontal"
  | "vertical"
  | "diagonal-down"
  | "diagonal-up";

export interface SopaState {
  phase: "waiting" | "playing" | "finished";
  grid: string[][];
  words: SopaWord[];
  scores: Record<string, number>;
  playerIds: string[];
  timeRemaining: number;
  gridSize: number;
}

export interface SopaSelectAction {
  type: "select-word";
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}
