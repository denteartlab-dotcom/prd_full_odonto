import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiSession, isSession, jsonError } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;
  const { id } = await params;

  const existing = await prisma.prescription.findFirst({
    where: { id, clinicId: session.clinicId },
  });
  if (!existing) return jsonError("Prescrição não encontrada.", 404);

  await prisma.prescription.update({
    where: { id },
    data: { status: "cancelada" },
  });

  return NextResponse.json({ ok: true });
}
