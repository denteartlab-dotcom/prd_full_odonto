import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";

function serialize(row: {
  id: string;
  clinicId: string;
  patientId: string | null;
  description: string;
  amount: number;
  dueDate: Date;
  paidAt: Date | null;
  status: string;
  method: string | null;
  createdAt: Date;
  patient: { id: string; name: string } | null;
}) {
  return {
    id: row.id,
    clinicId: row.clinicId,
    patientId: row.patientId,
    patientName: row.patient?.name || null,
    description: row.description,
    amount: row.amount,
    dueDate: row.dueDate.toISOString().slice(0, 10),
    paidAt: row.paidAt ? row.paidAt.toISOString().slice(0, 10) : null,
    status: row.status,
    method: row.method,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const rows = await prisma.receivable.findMany({
    where: { clinicId: session.clinicId },
    include: { patient: true },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json({ receivables: rows.map(serialize) });
}

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = (await req.json()) as {
    patientId?: string | null;
    description?: string;
    amount?: number;
    dueDate?: string;
    method?: string;
    status?: string;
  };

  if (!body.description?.trim()) return jsonError("Descrição obrigatória.");
  if (!body.amount || body.amount <= 0) return jsonError("Valor inválido.");
  if (!body.dueDate) return jsonError("Vencimento obrigatório.");

  if (body.patientId) {
    const patient = await prisma.patient.findFirst({
      where: { id: body.patientId, clinicId: session.clinicId },
    });
    if (!patient) return jsonError("Paciente não encontrado.", 404);
  }

  const row = await prisma.receivable.create({
    data: {
      clinicId: session.clinicId,
      patientId: body.patientId || null,
      description: body.description.trim(),
      amount: body.amount,
      dueDate: new Date(`${body.dueDate}T12:00:00`),
      method: body.method || null,
      status: body.status || "aberto",
    },
    include: { patient: true },
  });

  return NextResponse.json({ receivable: serialize(row) }, { status: 201 });
}
