import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/lib/db";
import { rooms } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/middleware";
import { eq } from "drizzle-orm";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const createRoomSchema = z.object({
  gameSlug: z.string().min(1),
  maxPlayers: z.number().int().min(1).max(8).default(4),
  config: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const data = createRoomSchema.parse(body);

    const [room] = await db
      .insert(rooms)
      .values({
        code: generateCode(),
        gameSlug: data.gameSlug,
        hostId: user.userId,
        maxPlayers: data.maxPlayers,
        config: data.config || null,
      })
      .returning();

    return NextResponse.json({ room });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }
    console.error("Create room error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");

    if (code) {
      const [room] = await db
        .select()
        .from(rooms)
        .where(eq(rooms.code, code.toUpperCase()))
        .limit(1);

      if (!room) {
        return NextResponse.json(
          { error: "Sala no encontrada" },
          { status: 404 }
        );
      }

      return NextResponse.json({ room });
    }

    // List active rooms
    const activeRooms = await db
      .select()
      .from(rooms)
      .where(eq(rooms.status, "waiting"))
      .limit(20);

    return NextResponse.json({ rooms: activeRooms });
  } catch (error) {
    console.error("Get rooms error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
