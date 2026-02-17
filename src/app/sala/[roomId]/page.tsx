import { getAuthUser } from "@/lib/auth/middleware";
import { redirect } from "next/navigation";
import RoomLobbyClient from "@/components/room/RoomLobbyClient";

interface Props {
  params: Promise<{ roomId: string }>;
}

export default async function RoomPage({ params }: Props) {
  const { roomId } = await params;
  const user = await getAuthUser();

  if (!user) redirect("/auth/login");

  return <RoomLobbyClient roomId={roomId} userId={user.userId} username={user.username} />;
}
