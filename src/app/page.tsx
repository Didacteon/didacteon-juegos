import { getAuthUser } from "@/lib/auth/middleware";
import { getGameMetas } from "@/games/registry";
import NavBar from "@/components/layout/NavBar";
import GameCard from "@/components/lobby/GameCard";

export default async function HomePage() {
  const user = await getAuthUser();
  const games = getGameMetas();

  return (
    <div className="min-h-dvh bg-background">
      <NavBar username={user?.username} />

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Juegos
        </h1>
        <p className="text-sm text-foreground/50 mb-8">
          Elige un juego para crear o unirte a una sala
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>

        {games.length === 0 && (
          <p className="text-center text-foreground/40 py-20">
            No hay juegos disponibles todavía
          </p>
        )}
      </main>
    </div>
  );
}
