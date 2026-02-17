import { Room } from "../rooms/Room";

export function handleChatSend(
  room: Room,
  userId: string,
  username: string,
  content: string
): void {
  const trimmed = content.trim();
  if (!trimmed || trimmed.length > 500) return;

  const message = room.addChatMessage(userId, username, trimmed);
  room.broadcast({ type: "chat:message", message });
}

export function sendChatHistory(room: Room, userId: string): void {
  const messages = room.getChatHistory();
  room.sendTo(userId, { type: "chat:history", messages });
}
