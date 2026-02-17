"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWebSocket } from "@/lib/ws/client";
import NavBar from "@/components/layout/NavBar";
import Button from "@/components/shared/Button";
import PlayerList from "./PlayerList";
import ChatPanel from "./ChatPanel";

interface RoomLobbyClientProps {
  roomId: string;
  userId: string;
  username: string;
}

export default function RoomLobbyClient({
  roomId,
  userId,
  username,
}: RoomLobbyClientProps) {
  const router = useRouter();

  const onGameStarted = useCallback(() => {
    // Redirect to game view when game starts
  }, []);

  const {
    connected,
    room,
    chatMessages,
    error,
    sendChat,
    setReady,
    startGame,
    leaveRoom,
  } = useWebSocket({
    roomId,
    onGameStarted,
  });

  const isHost = room?.hostId === userId;
  const currentPlayer = room?.players.find((p) => p.id === userId);
  const nonHostPlayers = room?.players.filter((p) => p.id !== room.hostId) ?? [];
  const allReady =
    room && nonHostPlayers.length >= 1 && nonHostPlayers.every((p) => p.isReady);

  const handleLeave = useCallback(() => {
    leaveRoom();
    router.push("/");
  }, [leaveRoom, router]);

  useEffect(() => {
    if (room?.status === "playing") {
      router.push(`/juego/${room.gameSlug}/${roomId}`);
    }
  }, [room?.status, room?.gameSlug, roomId, router]);

  if (room?.status === "playing") {
    return null;
  }

  return (
    <div className="min-h-dvh bg-background">
      <NavBar username={username} />

      <main className="max-w-2xl mx-auto px-6 py-10">
        {!connected && (
          <div className="text-center py-20">
            <p className="text-foreground/50">Conectando...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={handleLeave} variant="secondary">
              Volver
            </Button>
          </div>
        )}

        {room && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Sala de espera
                </h1>
                <p className="text-sm text-foreground/50">
                  Código:{" "}
                  <span className="font-mono text-sea-accent">
                    {room.code}
                  </span>
                </p>
              </div>
              <Button onClick={handleLeave} variant="ghost">
                Salir
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <PlayerList
                  players={room.players}
                  hostId={room.hostId}
                  currentPlayerId={userId}
                />

                <div className="flex gap-2">
                  {!isHost && (
                    <Button
                      onClick={() => setReady(!currentPlayer?.isReady)}
                      variant={currentPlayer?.isReady ? "secondary" : "primary"}
                    >
                      {currentPlayer?.isReady ? "No listo" : "Listo"}
                    </Button>
                  )}

                  {isHost && (
                    <Button
                      onClick={startGame}
                      disabled={!allReady}
                    >
                      {allReady ? "Iniciar partida" : "Esperando jugadores..."}
                    </Button>
                  )}
                </div>
              </div>

              <ChatPanel
                messages={chatMessages}
                onSend={sendChat}
                currentUserId={userId}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
