import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const items = await prisma.certificateTemplate.findMany({
    where: { clinicId: session.clinicId },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  let body: { name?: string; type?: string; content?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return jsonError("JSON inválido.");
  }

  const name = body.name?.trim();
  const content = body.content?.trim();
  const type = body.type?.trim() || "personalizado";
  if (!name || !content) return jsonError("Nome e conteúdo são obrigatórios.");

  const item = await prisma.certificateTemplate.create({
    data: {
      clinicId: session.clinicId,
      name,
      type,
      content,
    },
  });
  return NextResponse.json({ item }, { status: 201 });
}
