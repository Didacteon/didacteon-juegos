import { getAuthUser } from "@/lib/auth/middleware";
import { getGameMeta } from "@/games/registry";
import { redirect } from "next/navigation";
import NavBar from "@/components/layout/NavBar";
import CreateRoomForm from "@/components/lobby/CreateRoomForm";

interface Props {
  params: Promise<{ gameSlug: string }>;
}

export default async function GameLobbyPage({ params }: Props) {
  const { gameSlug } = await params;
  const user = await getAuthUser();

  if (!user) redirect("/auth/login");

  const meta = getGameMeta(gameSlug);
  if (!meta) redirect("/");

  return (
    <div className="min-h-dvh bg-background">
      <NavBar username={user.username} />

      <main className="max-w-lg mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-foreground mb-1">
          {meta.name}
        </h1>
        <p className="text-sm text-foreground/50 mb-8">
          {meta.description}
        </p>

        <CreateRoomForm gameSlug={gameSlug} maxPlayers={meta.maxPlayers} />
      </main>
    </div>
  );
}
