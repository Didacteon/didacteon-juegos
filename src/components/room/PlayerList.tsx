import type { PlayerInfo } from "@/server/protocol/messages";

interface PlayerListProps {
  players: PlayerInfo[];
  hostId: string;
  currentPlayerId: string;
}

export default function PlayerList({
  players,
  hostId,
  currentPlayerId,
}: PlayerListProps) {
  return (
    <div className="bg-dock-bg border border-dock-border rounded-xl p-4">
      <h2 className="text-sm font-semibold text-foreground/60 mb-3">
        Jugadores ({players.length})
      </h2>
      <div className="flex flex-col gap-2">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between text-sm"
          >
            <span
              className={`${
                player.id === currentPlayerId
                  ? "text-sea-accent font-semibold"
                  : "text-foreground/80"
              }`}
            >
              {player.username}
              {player.id === hostId && (
                <span className="text-foreground/40 ml-1.5 text-xs">
                  (anfitrión)
                </span>
              )}
            </span>
            <span
              className={`text-xs ${
                player.isReady ? "text-green-400" : "text-foreground/30"
              }`}
            >
              {player.isReady ? "Listo" : "Esperando"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
