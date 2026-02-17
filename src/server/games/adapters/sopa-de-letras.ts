import type { GameServerAdapter } from "../GameSession";
import type { SopaState, SopaSelectAction, SopaConfig } from "@/games/sopa-de-letras/types";
import {
  generateGrid,
  checkSelection,
  isAllWordsFound,
  calculateScores,
} from "@/games/sopa-de-letras/logic";

const adapter: GameServerAdapter = {
  defaultConfig: {
    gridSize: 12,
    wordCount: 8,
    timeLimit: 300, // 5 minutes
    category: "general",
  },

  createInitialState(
    config: Record<string, unknown>,
    playerIds: string[]
  ): Record<string, unknown> {
    const sopaConfig = config as unknown as SopaConfig;
    const { grid, words } = generateGrid(sopaConfig);

    const scores: Record<string, number> = {};
    for (const id of playerIds) {
      scores[id] = 0;
    }

    const state: SopaState = {
      phase: "playing",
      grid,
      words,
      scores,
      playerIds,
      timeRemaining: sopaConfig.timeLimit || 300,
      gridSize: sopaConfig.gridSize || 12,
    };

    return state as unknown as Record<string, unknown>;
  },

  applyAction(
    state: Record<string, unknown>,
    action: Record<string, unknown> & { playerId: string }
  ): Record<string, unknown> {
    const sopaState = state as unknown as SopaState;
    const sopaAction = action as unknown as SopaSelectAction & {
      playerId: string;
    };

    if (sopaAction.type !== "select-word") return state;

    const foundWord = checkSelection(
      sopaState,
      sopaAction,
      sopaAction.playerId
    );

    if (!foundWord) return state;

    // Mark word as found
    const newWords = sopaState.words.map((w) =>
      w.word === foundWord.word && w.foundBy === null
        ? { ...w, foundBy: sopaAction.playerId }
        : w
    );

    const newState: SopaState = {
      ...sopaState,
      words: newWords,
      scores: {
        ...sopaState.scores,
        [sopaAction.playerId]:
          (sopaState.scores[sopaAction.playerId] || 0) + 1,
      },
    };

    if (isAllWordsFound(newState)) {
      newState.phase = "finished";
    }

    return newState as unknown as Record<string, unknown>;
  },

  validateAction(
    state: Record<string, unknown>,
    action: Record<string, unknown> & { playerId: string }
  ): boolean {
    const sopaState = state as unknown as SopaState;
    if (sopaState.phase !== "playing") return false;

    const sopaAction = action as unknown as SopaSelectAction;
    if (sopaAction.type !== "select-word") return false;

    const { startRow, startCol, endRow, endCol } = sopaAction;
    const size = sopaState.gridSize;

    // Check bounds
    if (
      startRow < 0 ||
      startRow >= size ||
      startCol < 0 ||
      startCol >= size ||
      endRow < 0 ||
      endRow >= size ||
      endCol < 0 ||
      endCol >= size
    )
      return false;

    return true;
  },

  isFinished(state: Record<string, unknown>): boolean {
    const sopaState = state as unknown as SopaState;
    return (
      sopaState.phase === "finished" || sopaState.timeRemaining <= 0
    );
  },

  calculateResults(state: Record<string, unknown>) {
    const sopaState = state as unknown as SopaState;
    const scores = calculateScores(sopaState);

    const rankings = sopaState.playerIds
      .map((playerId) => ({
        playerId,
        score: scores[playerId] || 0,
        rank: 0,
      }))
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    return { rankings };
  },

  tick(state: Record<string, unknown>, deltaMs: number): Record<string, unknown> {
    const sopaState = state as unknown as SopaState;
    if (sopaState.timeRemaining <= 0) return state;

    const newTime = Math.max(0, sopaState.timeRemaining - deltaMs / 1000);
    const newState: SopaState = {
      ...sopaState,
      timeRemaining: newTime,
      phase: newTime <= 0 ? "finished" : sopaState.phase,
    };

    return newState as unknown as Record<string, unknown>;
  },
};

export default adapter;
