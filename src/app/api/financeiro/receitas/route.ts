import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, requireApiSession } from "@/lib/api-helpers";
import { buildContasAReceberData } from "@/lib/build-financeiro";

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const receivables = await prisma.receivable.findMany({
    where: { clinicId: session.clinicId },
    include: { patient: true },
    orderBy: { dueDate: "asc" },
  });

  const data = buildContasAReceberData({ receivables });
  return NextResponse.json({ data });
}
