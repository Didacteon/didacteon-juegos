import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken, type JWTPayload } from "./jwt";

export async function getAuthUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<JWTPayload> {
  const user = await getAuthUser();
  if (!user) {
    throw NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return user;
}
