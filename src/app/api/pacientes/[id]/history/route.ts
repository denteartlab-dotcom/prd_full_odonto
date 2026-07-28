import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import { buildHistoryEventsFromDb } from "@/lib/patient-history-build";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const { id } = await params;

  const patient = await prisma.patient.findFirst({
    where: { id, clinicId: session.clinicId },
    include: {
      appointments: {
        include: { professional: true },
        orderBy: { startsAt: "desc" },
      },
      treatments: {
        include: { professional: true },
        orderBy: { createdAt: "desc" },
      },
      budgets: {
        include: {
          professional: true,
          items: true,
        },
        orderBy: { createdAt: "desc" },
      },
      receivables: {
        orderBy: { createdAt: "desc" },
      },
      documents: {
        orderBy: { createdAt: "desc" },
      },
      prescriptions: {
        include: { professional: true },
        orderBy: { createdAt: "desc" },
      },
      medicalNotes: {
        orderBy: { createdAt: "desc" },
      },
      anamnesis: true,
      odontogram: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!patient) return jsonError("Paciente não encontrado.", 404);

  const odontogramUpdatedAt =
    patient.odontogram.length > 0
      ? patient.odontogram.reduce(
          (max, row) => (row.createdAt > max ? row.createdAt : max),
          patient.odontogram[0].createdAt
        )
      : null;

  const events = buildHistoryEventsFromDb({
    patientCreatedAt: patient.createdAt,
    appointments: patient.appointments.map((a) => ({
      id: a.id,
      startsAt: a.startsAt,
      status: a.status,
      type: a.type,
      notes: a.notes,
      professionalName: a.professional?.name ?? null,
      professionalSpecialty: a.professional?.specialty ?? null,
    })),
    treatments: patient.treatments.map((t) => ({
      id: t.id,
      name: t.name,
      tooth: t.tooth,
      status: t.status,
      price: t.price,
      createdAt: t.createdAt,
      startedAt: t.startedAt,
      finishedAt: t.finishedAt,
      professionalName: t.professional?.name ?? null,
    })),
    budgets: patient.budgets.map((b) => ({
      id: b.id,
      status: b.status,
      total: b.total,
      createdAt: b.createdAt,
      itemDescriptions: b.items.map((i) => i.description),
      professionalName: b.professional?.name ?? null,
    })),
    receivables: patient.receivables.map((r) => ({
      id: r.id,
      description: r.description,
      amount: r.amount,
      dueDate: r.dueDate,
      paidAt: r.paidAt,
      status: r.status,
      method: r.method,
      createdAt: r.createdAt,
    })),
    documents: patient.documents.map((d) => ({
      id: d.id,
      title: d.title,
      type: d.type,
      createdAt: d.createdAt,
    })),
    prescriptions: patient.prescriptions.map((p) => ({
      id: p.id,
      content: p.content,
      status: p.status,
      createdAt: p.createdAt,
      professionalName: p.professional?.name ?? null,
    })),
    medicalNotes: patient.medicalNotes.map((n) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      createdAt: n.createdAt,
    })),
    anamnesis: patient.anamnesis
      ? {
          updatedAt: patient.anamnesis.updatedAt,
          allergies: patient.anamnesis.allergies,
          medications: patient.anamnesis.medications,
          chronicDiseases: patient.anamnesis.chronicDiseases,
        }
      : null,
    odontogramCount: patient.odontogram.length,
    odontogramUpdatedAt,
  });

  return NextResponse.json({ events });
}
