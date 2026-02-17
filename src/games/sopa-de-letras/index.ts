import type { GameModule } from "@/games/types";
import SopaBoard from "./SopaBoard";
import adapter from "@/server/games/adapters/sopa-de-letras";

const sopaDeLetras: GameModule = {
  meta: {
    slug: "sopa-de-letras",
    name: "Sopa de Letras",
    description:
      "Encuentra las palabras ocultas en la cuadrícula antes que tus rivales",
    category: "palabras",
    minPlayers: 1,
    maxPlayers: 4,
    estimatedDuration: "5-10 min",
  },
  client: {
    Board: SopaBoard,
  },
  server: adapter,
};

export default sopaDeLetras;
