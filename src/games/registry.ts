import type { GameMeta } from "./types";

interface GameRegistryEntry {
  meta: GameMeta;
  load: () => Promise<{ default: { client: unknown; server: unknown } }>;
}

export const GAME_REGISTRY: Record<string, GameRegistryEntry> = {
  "sopa-de-letras": {
    meta: {
      slug: "sopa-de-letras",
      name: "Sopa de Letras",
      description: "Encuentra las palabras ocultas en la cuadrícula antes que tus rivales",
      category: "palabras",
      minPlayers: 1,
      maxPlayers: 4,
      estimatedDuration: "5-10 min",
    },
    load: () => import("./sopa-de-letras"),
  },
};

export function getGameMetas(): GameMeta[] {
  return Object.values(GAME_REGISTRY).map((entry) => entry.meta);
}

export async function loadGameClient(slug: string) {
  const entry = GAME_REGISTRY[slug];
  if (!entry) return null;
  const mod = await entry.load();
  return (mod.default as { client: unknown }).client;
}

export function getGameMeta(slug: string): GameMeta | null {
  return GAME_REGISTRY[slug]?.meta || null;
}
