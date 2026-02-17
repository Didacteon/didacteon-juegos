import Link from "next/link";
import type { GameMeta } from "@/games/types";

interface GameCardProps {
  game: GameMeta;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <Link
      href={`/juego/${game.slug}`}
      className="flex flex-col gap-3 p-5 rounded-xl bg-dock-bg border border-dock-border hover:border-sea-accent/30 transition-colors group"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground group-hover:text-sea-accent transition-colors">
          {game.name}
        </h3>
        <span className="text-xs text-foreground/40 bg-white/5 px-2 py-0.5 rounded">
          {game.category}
        </span>
      </div>

      <p className="text-sm text-foreground/60 leading-relaxed">
        {game.description}
      </p>

      <div className="flex items-center gap-4 text-xs text-foreground/40 mt-auto pt-2 border-t border-dock-border">
        <span>
          {game.minPlayers === game.maxPlayers
            ? `${game.minPlayers} jugadores`
            : `${game.minPlayers}-${game.maxPlayers} jugadores`}
        </span>
        <span>{game.estimatedDuration}</span>
      </div>
    </Link>
  );
}
