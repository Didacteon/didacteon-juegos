import {
  clientMessageSchema,
  type ClientMessage,
  type ServerMessage,
} from "./messages";

export function decodeClientMessage(raw: string): ClientMessage | null {
  try {
    const parsed = JSON.parse(raw);
    const result = clientMessageSchema.safeParse(parsed);
    if (result.success) return result.data;
    return null;
  } catch {
    return null;
  }
}

export function encodeServerMessage(message: ServerMessage): string {
  return JSON.stringify(message);
}
