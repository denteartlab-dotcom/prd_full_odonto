import { NextResponse } from "next/server";
import { getApiSession, type SessionPayload } from "@/lib/auth";

export async function requireApiSession(): Promise<
  SessionPayload | NextResponse
> {
  const session = await getApiSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  return session;
}

export function isSession(
  value: SessionPayload | NextResponse
): value is SessionPayload {
  return !(value instanceof NextResponse);
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
