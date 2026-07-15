import { NextResponse } from "next/server";
import { loginWithCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "");
    const password = String(body.password || "");
    if (!email || !password) {
      return NextResponse.json({ error: "Informe e-mail e senha." }, { status: 400 });
    }
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "DATABASE_URL não configurada no ambiente." },
        { status: 500 }
      );
    }
    const session = await loginWithCredentials(email, password);
    if (!session) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }
    return NextResponse.json({ ok: true, user: session });
  } catch (error) {
    console.error("[login]", error);
    const message =
      error instanceof Error ? error.message : "Erro interno no login.";
    return NextResponse.json(
      { error: `Falha no banco/login: ${message}` },
      { status: 500 }
    );
  }
}
