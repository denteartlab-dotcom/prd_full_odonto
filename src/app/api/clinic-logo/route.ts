import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";

const MAX_DATA_URL_LENGTH = 900_000; // ~675KB base64

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = (await req.json()) as { logoUrl?: string | null };
  const logoUrl = body.logoUrl === null ? null : (body.logoUrl || "").trim();

  if (logoUrl !== null) {
    if (!logoUrl.startsWith("data:image/")) {
      return jsonError("Envie uma imagem válida.");
    }
    if (logoUrl.length > MAX_DATA_URL_LENGTH) {
      return jsonError("Imagem muito grande. Use um arquivo menor.");
    }
  }

  const clinic = await prisma.clinic.update({
    where: { id: session.clinicId },
    data: { logoUrl },
    select: { id: true, name: true, logoUrl: true },
  });

  return NextResponse.json({ clinic });
}
