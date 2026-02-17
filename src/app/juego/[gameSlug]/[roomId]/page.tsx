import { getAuthUser } from "@/lib/auth/middleware";
import { redirect } from "next/navigation";
import GameShell from "@/components/game/GameShell";

interface Props {
  params: Promise<{ gameSlug: string; roomId: string }>;
}

export default async function GamePage({ params }: Props) {
  const { gameSlug, roomId } = await params;
  const user = await getAuthUser();

  if (!user) redirect("/auth/login");

  return (
    <GameShell
      gameSlug={gameSlug}
      roomId={roomId}
      userId={user.userId}
      username={user.username}
    />
  );
}
