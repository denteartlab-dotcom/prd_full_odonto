import { prisma } from "@/lib/db";

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Garante Professional espelhado do usuário (para agenda/orçamento/comissões).
 */
export async function syncProfessionalCommissionFromUser(input: {
  clinicId: string;
  name: string;
  email: string;
  active: boolean;
  role: string;
  commissionEnabled: boolean;
  commissionPercent: number;
}) {
  const email = input.email.trim().toLowerCase();
  const enabled =
    input.commissionEnabled &&
    (input.role === "dentista" ||
      input.role === "admin" ||
      input.role === "proprietario");

  const percent = Math.max(0, Math.min(100, Number(input.commissionPercent) || 0));

  const byEmail = await prisma.professional.findFirst({
    where: { clinicId: input.clinicId, email },
  });

  let existing = byEmail;
  if (!existing) {
    const all = await prisma.professional.findMany({
      where: { clinicId: input.clinicId },
    });
    const needle = normalize(input.name);
    existing = all.find((p) => normalize(p.name) === needle) || null;
  }

  if (existing) {
    return prisma.professional.update({
      where: { id: existing.id },
      data: {
        name: input.name,
        email,
        active: input.active,
        commissionEnabled: enabled,
        commissionPercent: percent,
      },
    });
  }

  if (input.role !== "dentista" && !enabled) return null;

  return prisma.professional.create({
    data: {
      clinicId: input.clinicId,
      name: input.name,
      email,
      active: input.active,
      specialty: "Clínica Geral",
      commissionEnabled: enabled,
      commissionPercent: percent,
    },
  });
}

export function calcCommissionAmount(base: number, percent: number) {
  const p = Math.max(0, Math.min(100, percent));
  return Math.round(((base * p) / 100) * 100) / 100;
}

async function resolveProfessionalForBudget(input: {
  clinicId: string;
  professionalId?: string | null;
  dentistName?: string | null;
}) {
  if (input.professionalId) {
    const byId = await prisma.professional.findFirst({
      where: { id: input.professionalId, clinicId: input.clinicId },
    });
    if (byId) return byId;
  }

  const name = (input.dentistName || "").trim();
  if (!name) return null;

  const pros = await prisma.professional.findMany({
    where: { clinicId: input.clinicId, active: true },
  });
  const needle = normalize(name);
  return (
    pros.find((p) => normalize(p.name) === needle) ||
    pros.find(
      (p) =>
        normalize(p.name).includes(needle) || needle.includes(normalize(p.name))
    ) ||
    null
  );
}

/**
 * Gera comissão pendente quando orçamento é aprovado (idempotente por budget).
 */
export async function createCommissionFromApprovedBudget(input: {
  clinicId: string;
  budgetId: string;
  budgetTotal: number;
  patientName: string;
  professionalId?: string | null;
  dentistName?: string | null;
}) {
  if (input.budgetTotal <= 0) return null;

  const sourceKey = `budget:${input.budgetId}`;
  const existing = await prisma.commission.findFirst({
    where: { clinicId: input.clinicId, sourceKey },
  });
  if (existing) return existing;

  const professional = await resolveProfessionalForBudget({
    clinicId: input.clinicId,
    professionalId: input.professionalId,
    dentistName: input.dentistName,
  });
  if (!professional?.commissionEnabled || professional.commissionPercent <= 0) {
    return null;
  }

  const amount = calcCommissionAmount(
    input.budgetTotal,
    professional.commissionPercent
  );
  if (amount <= 0) return null;

  try {
    return await prisma.commission.create({
      data: {
        clinicId: input.clinicId,
        professionalId: professional.id,
        description: `Orçamento aprovado — ${input.patientName}`,
        amount,
        percent: professional.commissionPercent,
        status: "pendente",
        sourceKey,
      },
    });
  } catch {
    return prisma.commission.findFirst({
      where: { clinicId: input.clinicId, sourceKey },
    });
  }
}
