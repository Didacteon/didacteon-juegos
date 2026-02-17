"use client";

import { useState, useRef, useCallback } from "react";
import type { GameBoardProps } from "@/games/types";
import type { SopaState } from "./types";
import SopaCell from "./SopaCell";
import SopaWordList from "./SopaWordList";

// Player colors for found words
const PLAYER_COLORS = [
  "rgba(51, 153, 255, 0.3)", // sea-accent
  "rgba(255, 153, 51, 0.3)", // orange
  "rgba(51, 255, 153, 0.3)", // green
  "rgba(255, 51, 153, 0.3)", // pink
];

export default function SopaBoard({
  state,
  playerId,
  sendAction,
}: GameBoardProps) {
  const sopaState = state as unknown as SopaState;
  const [selecting, setSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const handleCellDown = useCallback((row: number, col: number) => {
    setSelecting(true);
    setSelectionStart({ row, col });
    setSelectionEnd({ row, col });
  }, []);

  const handleCellMove = useCallback(
    (row: number, col: number) => {
      if (selecting) {
        setSelectionEnd({ row, col });
      }
    },
    [selecting]
  );

  const handleCellUp = useCallback(() => {
    if (selecting && selectionStart && selectionEnd) {
      sendAction({
        type: "select-word",
        startRow: selectionStart.row,
        startCol: selectionStart.col,
        endRow: selectionEnd.row,
        endCol: selectionEnd.col,
      });
    }
    setSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  }, [selecting, selectionStart, selectionEnd, sendAction]);

  // Determine which cells are in the current selection
  const getSelectedCells = (): Set<string> => {
    const cells = new Set<string>();
    if (!selectionStart || !selectionEnd) return cells;

    const dr = Math.sign(selectionEnd.row - selectionStart.row);
    const dc = Math.sign(selectionEnd.col - selectionStart.col);
    const rowDiff = Math.abs(selectionEnd.row - selectionStart.row);
    const colDiff = Math.abs(selectionEnd.col - selectionStart.col);
    const length = Math.max(rowDiff, colDiff) + 1;

    // Only highlight valid lines
    if (rowDiff !== 0 && colDiff !== 0 && rowDiff !== colDiff) return cells;

    for (let i = 0; i < length; i++) {
      cells.add(`${selectionStart.row + dr * i},${selectionStart.col + dc * i}`);
    }
    return cells;
  };

  // Determine which cells belong to found words
  const getFoundCells = (): Map<string, string> => {
    const cells = new Map<string, string>();
    const dirDeltas: Record<string, [number, number]> = {
      horizontal: [0, 1],
      vertical: [1, 0],
      "diagonal-down": [1, 1],
      "diagonal-up": [-1, 1],
    };

    for (const word of sopaState.words) {
      if (!word.foundBy) continue;
      const [dr, dc] = dirDeltas[word.direction];
      const playerIndex = sopaState.playerIds.indexOf(word.foundBy);
      const color = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];

      for (let i = 0; i < word.word.length; i++) {
        cells.set(
          `${word.startRow + dr * i},${word.startCol + dc * i}`,
          color
        );
      }
    }
    return cells;
  };

  const selectedCells = getSelectedCells();
  const foundCells = getFoundCells();

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center w-full max-w-4xl mx-auto">
      <div
        className="grid gap-0.5 select-none touch-none"
        style={{
          gridTemplateColumns: `repeat(${sopaState.gridSize}, minmax(0, 1fr))`,
          width: `min(100%, ${sopaState.gridSize * 2.5}rem)`,
        }}
        onMouseUp={handleCellUp}
        onMouseLeave={handleCellUp}
        onTouchEnd={handleCellUp}
      >
        {sopaState.grid.map((row, rowIdx) =>
          row.map((letter, colIdx) => {
            const key = `${rowIdx},${colIdx}`;
            return (
              <SopaCell
                key={key}
                letter={letter}
                isSelected={selectedCells.has(key)}
                foundColor={foundCells.get(key) || null}
                onMouseDown={() => handleCellDown(rowIdx, colIdx)}
                onMouseEnter={() => handleCellMove(rowIdx, colIdx)}
                onTouchStart={() => handleCellDown(rowIdx, colIdx)}
                onTouchMove={() => handleCellMove(rowIdx, colIdx)}
              />
            );
          })
        )}
      </div>

      <SopaWordList
        words={sopaState.words}
        scores={sopaState.scores}
        playerIds={sopaState.playerIds}
        currentPlayerId={playerId}
        timeRemaining={sopaState.timeRemaining}
      />
    </div>
  );
}
