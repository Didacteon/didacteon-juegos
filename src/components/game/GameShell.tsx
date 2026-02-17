"use client";

import { useState, useCallback, useEffect, type ComponentType } from "react";
import { useWebSocket } from "@/lib/ws/client";
import { loadGameClient } from "@/games/registry";
import type { GameBoardProps } from "@/games/types";
import NavBar from "@/components/layout/NavBar";
import GameHeader from "./GameHeader";
import GameOverModal from "./GameOverModal";

interface GameShellProps {
  gameSlug: string;
  roomId: string;
  userId: string;
  username: string;
}

export default function GameShell({
  gameSlug,
  roomId,
  userId,
  username,
}: GameShellProps) {
  const [gameState, setGameState] = useState<Record<string, unknown> | null>(
    null
  );
  const [results, setResults] = useState<{
    rankings: Array<{ playerId: string; score: number; rank: number }>;
  } | null>(null);
  const [Board, setBoard] = useState<ComponentType<GameBoardProps> | null>(
    null
  );

  // Load game client module
  useEffect(() => {
    loadGameClient(gameSlug).then((client) => {
      if (client) {
        const gameClient = client as { Board: ComponentType<GameBoardProps> };
        setBoard(() => gameClient.Board);
      }
    });
  }, [gameSlug]);

  const onGameStarted = useCallback((state: Record<string, unknown>) => {
    setGameState(state);
  }, []);

  const onGameState = useCallback((state: Record<string, unknown>) => {
    setGameState(state);
  }, []);

  const onGameFinished = useCallback(
    (res: {
      rankings: Array<{ playerId: string; score: number; rank: number }>;
    }) => {
      setResults(res);
    },
    []
  );

  const { connected, sendAction } = useWebSocket({
    roomId,
    onGameStarted,
    onGameState,
    onGameFinished,
  });

  if (!connected || !Board) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <p className="text-foreground/50">Cargando juego...</p>
      </div>
    );
  }

  const timeRemaining =
    gameState && typeof gameState.timeRemaining === "number"
      ? gameState.timeRemaining
      : undefined;

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <NavBar username={username} />

      {gameState && (
        <>
          <GameHeader
            gameSlug={gameSlug}
            timeRemaining={timeRemaining}
          />

          <main className="flex-1 flex items-center justify-center p-6">
            <Board
              state={gameState}
              playerId={userId}
              sendAction={sendAction}
              timeRemaining={timeRemaining}
            />
          </main>
        </>
      )}

      {!gameState && (
        <main className="flex-1 flex items-center justify-center">
          <p className="text-foreground/50">Esperando inicio de partida...</p>
        </main>
      )}

      {results && (
        <GameOverModal results={results} playerId={userId} />
      )}
    </div>
  );
}
