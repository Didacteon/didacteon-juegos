interface GameHeaderProps {
  gameSlug: string;
  timeRemaining?: number;
}

export default function GameHeader({
  gameSlug,
  timeRemaining,
}: GameHeaderProps) {
  const gameName = gameSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="flex items-center justify-between px-6 py-2 bg-dock-bg/50 border-b border-dock-border">
      <span className="text-sm font-medium text-foreground/70">{gameName}</span>
      {timeRemaining !== undefined && (
        <span
          className={`text-sm font-mono font-bold ${
            timeRemaining < 60 ? "text-red-400" : "text-sea-accent"
          }`}
        >
          {Math.floor(timeRemaining / 60)}:
          {Math.floor(timeRemaining % 60)
            .toString()
            .padStart(2, "0")}
        </span>
      )}
    </div>
  );
}
