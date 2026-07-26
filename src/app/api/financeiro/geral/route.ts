import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, requireApiSession } from "@/lib/api-helpers";
import { buildFinanceiroGeralData } from "@/lib/build-financeiro";

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const clinicId = session.clinicId;
  const [receivables, payables, professionals] = await Promise.all([
    prisma.receivable.findMany({
      where: { clinicId },
      include: { patient: true },
      orderBy: { dueDate: "desc" },
    }),
    prisma.payable.findMany({
      where: { clinicId },
      orderBy: { dueDate: "desc" },
    }),
    prisma.professional.findMany({
      where: { clinicId, active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const data = buildFinanceiroGeralData({ receivables, payables, professionals });
  return NextResponse.json({ data });
}
