import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/middleware";
import { signWSToken } from "@/lib/auth/jwt";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const wsToken = await signWSToken({
    userId: user.userId,
    username: user.username,
  });

  return NextResponse.json({ token: wsToken });
}
