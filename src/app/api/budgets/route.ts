import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import type { DentalBudget } from "@/lib/budget-types";

function parseExtras(notes: string | null) {
  if (!notes) return null;
  try {
    const parsed = JSON.parse(notes) as { dental?: DentalBudget; text?: string };
    if (parsed?.dental) return parsed;
  } catch {
    return { text: notes };
  }
  return { text: notes };
}

function serializeBudget(row: {
  id: string;
  clinicId: string;
  patientId: string;
  professionalId: string | null;
  status: string;
  total: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  patient: { id: string; name: string };
  items: { id: string; description: string; quantity: number; unitPrice: number }[];
}) {
  const extras = parseExtras(row.notes);
  return {
    id: row.id,
    clinicId: row.clinicId,
    patientId: row.patientId,
    patientName: row.patient.name,
    professionalId: row.professionalId,
    status: row.status,
    total: row.total,
    notes: extras?.text || (typeof extras === "object" && !extras?.dental ? row.notes : "") || "",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    items: row.items.map((i) => ({
      id: i.id,
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
    dental: extras?.dental ?? null,
  };
}

export async function GET(req: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const patientId = new URL(req.url).searchParams.get("patientId");
  const rows = await prisma.budget.findMany({
    where: {
      clinicId: session.clinicId,
      ...(patientId ? { patientId } : {}),
    },
    include: { patient: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ budgets: rows.map(serializeBudget) });
}

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = (await req.json()) as {
    patientId?: string;
    professionalId?: string | null;
    status?: string;
    notes?: string;
    dental?: DentalBudget;
    items?: { description: string; quantity?: number; unitPrice?: number }[];
  };

  if (!body.patientId) return jsonError("patientId é obrigatório.");

  const patient = await prisma.patient.findFirst({
    where: { id: body.patientId, clinicId: session.clinicId },
  });
  if (!patient) return jsonError("Paciente não encontrado.", 404);

  const items =
    body.dental?.procedures?.map((p) => ({
      description: p.name + (p.tooth ? ` (dente ${p.tooth})` : ""),
      quantity: p.quantity || 1,
      unitPrice: p.finalValue / Math.max(p.quantity || 1, 1),
    })) ||
    body.items ||
    [];

  const total =
    body.dental?.total ??
    items.reduce((s, i) => s + (i.quantity || 1) * (i.unitPrice || 0), 0);

  const notesPayload = JSON.stringify({
    text: body.notes || body.dental?.notes || "",
    dental: body.dental || undefined,
  });

  const row = await prisma.budget.create({
    data: {
      clinicId: session.clinicId,
      patientId: body.patientId,
      professionalId: body.professionalId || null,
      status: body.dental?.status || body.status || "rascunho",
      total,
      notes: notesPayload,
      items: {
        create: items.map((i) => ({
          description: i.description,
          quantity: i.quantity || 1,
          unitPrice: i.unitPrice || 0,
        })),
      },
    },
    include: { patient: true, items: true },
  });

  if (row.status === "aprovado") {
    const { createCommissionFromApprovedBudget } = await import(
      "@/lib/commission-from-production"
    );
    await createCommissionFromApprovedBudget({
      clinicId: session.clinicId,
      budgetId: row.id,
      budgetTotal: row.total,
      patientName: row.patient.name,
      professionalId: row.professionalId,
      dentistName: body.dental?.dentist || null,
    });
  }

  return NextResponse.json({ budget: serializeBudget(row) }, { status: 201 });
}
