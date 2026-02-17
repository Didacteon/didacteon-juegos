"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/shared/Button";

interface GameOverModalProps {
  results: {
    rankings: Array<{ playerId: string; score: number; rank: number }>;
  };
  playerId: string;
}

export default function GameOverModal({
  results,
  playerId,
}: GameOverModalProps) {
  const router = useRouter();
  const myResult = results.rankings.find((r) => r.playerId === playerId);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-dock-bg border border-dock-border rounded-xl p-6 max-w-sm w-full mx-4">
        <h2 className="text-xl font-semibold text-foreground text-center mb-1">
          Partida terminada
        </h2>
        {myResult && (
          <p className="text-center text-sea-accent text-sm mb-6">
            Posición #{myResult.rank} — {myResult.score} puntos
          </p>
        )}

        <div className="flex flex-col gap-2 mb-6">
          {results.rankings.map((r) => (
            <div
              key={r.playerId}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                r.playerId === playerId
                  ? "bg-sea-accent/10 text-sea-accent font-semibold"
                  : "text-foreground/70"
              }`}
            >
              <span>
                #{r.rank}{" "}
                {r.playerId === playerId ? "Tú" : r.playerId.slice(0, 8)}
              </span>
              <span>{r.score} pts</span>
            </div>
          ))}
        </div>

        <Button
          onClick={() => router.push("/")}
          className="w-full"
        >
          Volver al lobby
        </Button>
      </div>
    </div>
  );
}
