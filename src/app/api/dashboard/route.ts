import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, requireApiSession } from "@/lib/api-helpers";
import { buildDashboardData } from "@/lib/build-dashboard";

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const clinicId = session.clinicId;

  const [
    patients,
    appointments,
    budgets,
    receivables,
    payables,
    cashMovements,
    treatments,
    odontogram,
    commissions,
  ] = await Promise.all([
    prisma.patient.findMany({ where: { clinicId } }),
    prisma.appointment.findMany({
      where: { clinicId },
      include: { patient: true },
    }),
    prisma.budget.findMany({ where: { clinicId } }),
    prisma.receivable.findMany({
      where: { clinicId },
      include: { patient: true },
    }),
    prisma.payable.findMany({ where: { clinicId } }),
    prisma.cashMovement.findMany({ where: { clinicId } }),
    prisma.treatment.findMany({ where: { clinicId } }),
    prisma.odontogramEntry.findMany({
      where: { patient: { clinicId } },
    }),
    prisma.commission.findMany({
      where: { clinicId },
      include: { professional: true },
    }),
  ]);

  const data = buildDashboardData({
    patients,
    appointments,
    budgets,
    receivables,
    payables,
    cashMovements,
    treatments,
    odontogram,
    commissions,
  });

  return NextResponse.json({ dashboard: data });
}
