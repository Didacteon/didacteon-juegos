import { NextResponse } from "next/server";
import { getGameMetas } from "@/games/registry";

export async function GET() {
  const games = getGameMetas();
  return NextResponse.json({ games });
}
