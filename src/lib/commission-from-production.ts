import { prisma } from "@/lib/db";

export type CommissionMode = "percent" | "fixed";
export type CommissionBase = "procedimento" | "caixa_diario" | "caixa_mensal";

export const COMMISSION_MODES: { value: CommissionMode; label: string }[] = [
  { value: "percent", label: "Porcentagem (%)" },
  { value: "fixed", label: "Valor fixo (R$)" },
];

export const COMMISSION_BASES: {
  value: CommissionBase;
  label: string;
  moduleId: string;
  moduleLabel: string;
  hint: string;
}[] = [
  {
    value: "procedimento",
    label: "Procedimento realizado",
    moduleId: "patients",
    moduleLabel: "Pacientes / Tratamentos",
    hint: "Gera comissão ao concluir um tratamento (módulo Pacientes).",
  },
  {
    value: "caixa_diario",
    label: "Fechamento de caixa diário",
    moduleId: "cashflow",
    moduleLabel: "Fluxo de caixa",
    hint: "Gera comissão no fechamento diário do caixa (módulo Fluxo de caixa).",
  },
  {
    value: "caixa_mensal",
    label: "Fechamento de caixa mensal",
    moduleId: "cashflow",
    moduleLabel: "Fluxo de caixa",
    hint: "Gera comissão no fechamento mensal do caixa (módulo Fluxo de caixa).",
  },
];

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function parseCommissionMode(raw: unknown): CommissionMode {
  return raw === "fixed" ? "fixed" : "percent";
}

export function parseCommissionBase(raw: unknown): CommissionBase {
  if (raw === "caixa_diario" || raw === "caixa_mensal") return raw;
  return "procedimento";
}

export function normalizeCommissionValue(
  mode: CommissionMode,
  value: unknown
): number {
  const n = Number(value) || 0;
  if (mode === "percent") return Math.max(0, Math.min(100, n));
  return Math.max(0, Math.round(n * 100) / 100);
}

/** Calcula valor da comissão: % sobre a base ou valor fixo. */
export function calcCommissionAmount(
  baseAmount: number,
  mode: CommissionMode,
  value: number
): number {
  if (mode === "fixed") {
    return Math.round(Math.max(0, value) * 100) / 100;
  }
  const percent = Math.max(0, Math.min(100, value));
  return Math.round(((baseAmount * percent) / 100) * 100) / 100;
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
  commissionMode: CommissionMode;
  commissionValue: number;
  commissionBase: CommissionBase;
}) {
  const email = input.email.trim().toLowerCase();
  const enabled =
    input.commissionEnabled &&
    (input.role === "dentista" ||
      input.role === "admin" ||
      input.role === "proprietario");

  const mode = parseCommissionMode(input.commissionMode);
  const base = parseCommissionBase(input.commissionBase);
  const value = normalizeCommissionValue(mode, input.commissionValue);

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

  const data = {
    name: input.name,
    email,
    active: input.active,
    commissionEnabled: enabled,
    commissionMode: mode,
    commissionValue: value,
    commissionBase: base,
  };

  if (existing) {
    return prisma.professional.update({
      where: { id: existing.id },
      data,
    });
  }

  if (input.role !== "dentista" && !enabled) return null;

  return prisma.professional.create({
    data: {
      clinicId: input.clinicId,
      specialty: "Clínica Geral",
      ...data,
    },
  });
}

async function upsertCommission(input: {
  clinicId: string;
  professionalId: string;
  description: string;
  amount: number;
  percent: number;
  sourceKey: string;
}) {
  if (input.amount <= 0) return null;

  const existing = await prisma.commission.findFirst({
    where: { clinicId: input.clinicId, sourceKey: input.sourceKey },
  });
  if (existing) return existing;

  try {
    return await prisma.commission.create({
      data: {
        clinicId: input.clinicId,
        professionalId: input.professionalId,
        description: input.description,
        amount: input.amount,
        percent: input.percent,
        status: "pendente",
        sourceKey: input.sourceKey,
      },
    });
  } catch {
    return prisma.commission.findFirst({
      where: { clinicId: input.clinicId, sourceKey: input.sourceKey },
    });
  }
}

type ProCommission = {
  id: string;
  name: string;
  commissionEnabled: boolean;
  commissionMode: string;
  commissionValue: number;
  commissionBase: string;
};

function eligiblePro(pro: ProCommission, base: CommissionBase) {
  if (!pro.commissionEnabled) return false;
  if (parseCommissionBase(pro.commissionBase) !== base) return false;
  const mode = parseCommissionMode(pro.commissionMode);
  const value = normalizeCommissionValue(mode, pro.commissionValue);
  return mode === "fixed" ? value > 0 : value > 0;
}

/**
 * Comissão ao concluir procedimento (tratamento) — base = valor do procedimento.
 */
export async function createCommissionFromCompletedTreatment(input: {
  clinicId: string;
  treatmentId: string;
  treatmentName: string;
  treatmentPrice: number;
  patientName: string;
  professionalId: string;
}) {
  const professional = await prisma.professional.findFirst({
    where: { id: input.professionalId, clinicId: input.clinicId },
  });
  if (!professional || !eligiblePro(professional, "procedimento")) return null;

  const mode = parseCommissionMode(professional.commissionMode);
  const value = normalizeCommissionValue(mode, professional.commissionValue);
  const amount = calcCommissionAmount(input.treatmentPrice, mode, value);
  if (amount <= 0) return null;

  return upsertCommission({
    clinicId: input.clinicId,
    professionalId: professional.id,
    description: `Procedimento — ${input.treatmentName} (${input.patientName})`,
    amount,
    percent: mode === "percent" ? value : 0,
    sourceKey: `treatment:${input.treatmentId}`,
  });
}

function periodBounds(periodType: "diario" | "mensal", periodKey: string) {
  if (periodType === "diario") {
    const start = new Date(`${periodKey}T00:00:00`);
    const end = new Date(`${periodKey}T23:59:59.999`);
    return { start, end };
  }
  const [y, m] = periodKey.split("-").map(Number);
  const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  return { start, end };
}

/**
 * Fecha o caixa (diário ou mensal), persiste CashClosing e gera comissões.
 * Base de cálculo = total de entradas do período.
 */
export async function closeCashAndCreateCommissions(input: {
  clinicId: string;
  periodType: "diario" | "mensal";
  periodKey: string;
  closedByUserId?: string | null;
  notes?: string | null;
}) {
  const { start, end } = periodBounds(input.periodType, input.periodKey);

  const movements = await prisma.cashMovement.findMany({
    where: {
      clinicId: input.clinicId,
      date: { gte: start, lte: end },
    },
  });

  const totalEntradas = movements
    .filter((m) => m.type === "entrada")
    .reduce((s, m) => s + m.amount, 0);
  const totalSaidas = movements
    .filter((m) => m.type === "saida")
    .reduce((s, m) => s + m.amount, 0);
  const saldo = Math.round((totalEntradas - totalSaidas) * 100) / 100;

  const closing = await prisma.cashClosing.upsert({
    where: {
      clinicId_periodType_periodKey: {
        clinicId: input.clinicId,
        periodType: input.periodType,
        periodKey: input.periodKey,
      },
    },
    create: {
      clinicId: input.clinicId,
      periodType: input.periodType,
      periodKey: input.periodKey,
      totalEntradas,
      totalSaidas,
      saldo,
      closedByUserId: input.closedByUserId || null,
      notes: input.notes || null,
    },
    update: {
      totalEntradas,
      totalSaidas,
      saldo,
      closedAt: new Date(),
      closedByUserId: input.closedByUserId || null,
      notes: input.notes || null,
    },
  });

  const commissionBase: CommissionBase =
    input.periodType === "diario" ? "caixa_diario" : "caixa_mensal";

  const pros = await prisma.professional.findMany({
    where: { clinicId: input.clinicId, active: true, commissionEnabled: true },
  });

  const created = [];
  for (const pro of pros) {
    if (!eligiblePro(pro, commissionBase)) continue;
    const mode = parseCommissionMode(pro.commissionMode);
    const value = normalizeCommissionValue(mode, pro.commissionValue);
    const amount = calcCommissionAmount(totalEntradas, mode, value);
    if (amount <= 0) continue;

    const label =
      input.periodType === "diario"
        ? `Fechamento caixa diário ${input.periodKey}`
        : `Fechamento caixa mensal ${input.periodKey}`;

    const row = await upsertCommission({
      clinicId: input.clinicId,
      professionalId: pro.id,
      description: `${label} — ${pro.name}`,
      amount,
      percent: mode === "percent" ? value : 0,
      sourceKey: `${commissionBase}:${input.periodKey}:pro:${pro.id}`,
    });
    if (row) created.push(row);
  }

  return { closing, commissions: created, totalEntradas, totalSaidas, saldo };
}
