import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPrescriberToken } from "@/lib/memed/client";
import { getMemedScriptUrl, isMemedConfigured, resolvePrescriberExternalId } from "@/lib/memed/config";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  if (!isMemedConfigured()) {
    return NextResponse.json({
      configured: false,
      scriptUrl: getMemedScriptUrl(),
      message: "Configure MEMED_API_KEY e MEMED_SECRET_KEY no ambiente.",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { memedExternalId: true },
    });

    const externalId = resolvePrescriberExternalId(session.userId, user?.memedExternalId);
    const token = await getPrescriberToken(externalId);

    return NextResponse.json({
      configured: true,
      token,
      scriptUrl: getMemedScriptUrl(),
      prescriberExternalId: externalId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao obter token Memed.";
    return NextResponse.json({ error: message, configured: true }, { status: 400 });
  }
}
