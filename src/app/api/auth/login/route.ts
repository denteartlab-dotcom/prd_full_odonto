import { NextResponse } from "next/server";
import { loginWithCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "");
  const password = String(body.password || "");
  if (!email || !password) {
    return NextResponse.json({ error: "Informe e-mail e senha." }, { status: 400 });
  }
  const session = await loginWithCredentials(email, password);
  if (!session) {
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
  }
  return NextResponse.json({ ok: true, user: session });
}
