"use client";

interface SopaCellProps {
  letter: string;
  isSelected: boolean;
  foundColor: string | null;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  onTouchStart: () => void;
  onTouchMove: () => void;
}

export default function SopaCell({
  letter,
  isSelected,
  foundColor,
  onMouseDown,
  onMouseEnter,
  onTouchStart,
  onTouchMove,
}: SopaCellProps) {
  const bgStyle = foundColor
    ? { backgroundColor: foundColor }
    : isSelected
      ? { backgroundColor: "rgba(51, 153, 255, 0.2)" }
      : {};

  return (
    <div
      className={`flex items-center justify-center aspect-square text-sm font-mono font-semibold rounded cursor-pointer transition-colors select-none ${
        foundColor
          ? "text-foreground"
          : isSelected
            ? "text-sea-accent"
            : "text-foreground/80 hover:bg-white/5"
      }`}
      style={bgStyle}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
    >
      {letter}
    </div>
  );
}
