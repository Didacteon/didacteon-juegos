"use client";

import type { SopaWord } from "./types";

interface SopaWordListProps {
  words: SopaWord[];
  scores: Record<string, number>;
  playerIds: string[];
  currentPlayerId: string;
  timeRemaining: number;
}

export default function SopaWordList({
  words,
  scores,
  playerIds,
  currentPlayerId,
  timeRemaining,
}: SopaWordListProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = Math.floor(timeRemaining % 60);

  const foundCount = words.filter((w) => w.foundBy !== null).length;

  return (
    <div className="flex flex-col gap-4 min-w-48 bg-dock-bg border border-dock-border rounded-xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground/70">
          Tiempo
        </span>
        <span
          className={`text-lg font-mono font-bold ${
            timeRemaining < 60 ? "text-red-400" : "text-sea-accent"
          }`}
        >
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm text-foreground/60">
        <span>Palabras</span>
        <span>
          {foundCount}/{words.length}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {words.map((word, i) => (
          <div
            key={i}
            className={`text-sm px-2 py-1 rounded ${
              word.foundBy
                ? word.foundBy === currentPlayerId
                  ? "bg-sea-accent/20 text-sea-accent line-through"
                  : "bg-white/5 text-foreground/40 line-through"
                : "text-foreground/80"
            }`}
          >
            {word.foundBy ? word.word : "???"}
          </div>
        ))}
      </div>

      <div className="border-t border-dock-border pt-3 mt-2">
        <span className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">
          Puntuación
        </span>
        <div className="flex flex-col gap-1 mt-2">
          {playerIds
            .map((id) => ({
              id,
              score: scores[id] || 0,
            }))
            .sort((a, b) => b.score - a.score)
            .map((player) => (
              <div
                key={player.id}
                className={`flex justify-between text-sm ${
                  player.id === currentPlayerId
                    ? "text-sea-accent font-semibold"
                    : "text-foreground/70"
                }`}
              >
                <span>
                  {player.id === currentPlayerId ? "Tú" : player.id.slice(0, 8)}
                </span>
                <span>{player.score}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
