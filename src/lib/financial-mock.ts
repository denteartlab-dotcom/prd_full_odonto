import type { DentalBudget, PaymentMethodType } from "./budget-types";
import { PAYMENT_METHOD_LABELS, recalcBudget } from "./budget-mock";
import type {
  ChargeStatus,
  FinancialCharge,
  FinancialKpiSummary,
  FinancialPayment,
  FinancialTimelineEvent,
  PatientFinancialData,
} from "./financial-types";

export { PAYMENT_METHOD_LABELS };

export function daysUntilDue(dueDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T12:00:00");
  return Math.ceil((due.getTime() - today.getTime()) / 86400000);
}

export function dueDateLabel(dueDate: string, status: ChargeStatus) {
  if (status === "pago") return "Pago";
  if (status === "cancelado") return "Cancelado";
  const days = daysUntilDue(dueDate);
  if (days < 0) return `Vencido há ${Math.abs(days)} dia${Math.abs(days) !== 1 ? "s" : ""}`;
  if (days === 0) return "Vence hoje";
  return `Em ${days} dia${days !== 1 ? "s" : ""}`;
}

export function normalizeChargeStatus(charge: FinancialCharge): ChargeStatus {
  if (charge.status === "pago" || charge.status === "cancelado" || charge.status === "agendado") {
    return charge.status;
  }
  if (daysUntilDue(charge.dueDate) < 0) return "vencido";
  return charge.status;
}

export function generateChargesFromBudget(budget: DentalBudget): FinancialCharge[] {
  if (budget.status !== "aprovado" && budget.status !== "parcial") return [];

  const inst = budget.installment;
  const procedure =
    budget.procedures.map((p) => p.name).join(", ") || "Tratamento odontológico";
  const baseDate = new Date(budget.date + "T12:00:00");
  const charges: FinancialCharge[] = [];
  let paidRemaining = budget.paidAmount;

  for (let i = 0; i < inst.installments; i++) {
    const due = new Date(baseDate);
    due.setMonth(due.getMonth() + i + 1);
    const amount =
      i === inst.installments - 1
        ? Math.round((budget.total - budget.downPayment - inst.installmentValue * (inst.installments - 1)) * 100) / 100
        : inst.installmentValue;

    let status: ChargeStatus = "pendente";
    if (paidRemaining >= amount) {
      status = "pago";
      paidRemaining -= amount;
    } else if (daysUntilDue(due.toISOString().slice(0, 10)) < 0) {
      status = "vencido";
    }

    charges.push({
      id: `chg-${budget.id}-${i + 1}`,
      title: `Parcela ${i + 1}/${inst.installments} — ${procedure.split(",")[0]}`,
      budgetId: budget.id,
      budgetNumber: budget.number,
      procedure: procedure.split(",")[0].trim(),
      dentist: budget.dentist,
      dueDate: due.toISOString().slice(0, 10),
      amount,
      installmentNumber: i + 1,
      installmentTotal: inst.installments,
      status,
      paymentMethod: budget.paymentMethod,
      notes: budget.notes,
      history: [
        {
          id: `tl-${budget.id}-chg-${i + 1}`,
          type: "cobranca_criada",
          date: budget.updatedAt,
          user: budget.dentist,
          budgetId: budget.id,
          chargeId: `chg-${budget.id}-${i + 1}`,
        },
      ],
      createdAt: budget.updatedAt,
    });
  }

  return charges;
}

export function syncFinancialFromBudgets(
  budgets: DentalBudget[],
  existing?: PatientFinancialData
): PatientFinancialData {
  const approved = budgets.filter((b) => b.status === "aprovado" || b.status === "parcial");
  const generated = approved.flatMap(generateChargesFromBudget);

  const existingById = new Map((existing?.charges ?? []).map((c) => [c.id, c]));
  const charges = generated.map((g) => {
    const prev = existingById.get(g.id);
    if (!prev) return { ...g, status: normalizeChargeStatus(g) };
    return {
      ...g,
      status: prev.status === "cancelado" ? "cancelado" : normalizeChargeStatus({ ...g, status: prev.status }),
      history: prev.history.length > g.history.length ? prev.history : g.history,
      notes: prev.notes ?? g.notes,
    };
  });

  const payments = existing?.payments ?? buildPaymentsFromCharges(charges);
  const timeline = existing?.timeline ?? buildDefaultTimeline(budgets, charges);

  return { charges, payments, timeline };
}

function buildPaymentsFromCharges(charges: FinancialCharge[]): FinancialPayment[] {
  return charges
    .filter((c) => c.status === "pago")
    .map((c) => ({
      id: `pay-${c.id}`,
      chargeId: c.id,
      budgetId: c.budgetId,
      budgetNumber: c.budgetNumber,
      description: c.title,
      amount: c.amount,
      date: c.dueDate,
      method: c.paymentMethod,
      user: c.dentist,
    }));
}

function buildDefaultTimeline(
  budgets: DentalBudget[],
  charges: FinancialCharge[]
): FinancialTimelineEvent[] {
  const events: FinancialTimelineEvent[] = [];

  for (const b of budgets) {
    events.push({
      id: `tl-b-${b.id}-criado`,
      type: "orcamento_criado",
      date: b.date + "T10:00:00",
      user: b.dentist,
      budgetId: b.id,
    });
    if (b.status === "aprovado" || b.status === "parcial") {
      events.push({
        id: `tl-b-${b.id}-aprovado`,
        type: "orcamento_aprovado",
        date: b.updatedAt,
        user: b.dentist,
        budgetId: b.id,
      });
    }
  }

  for (const c of charges) {
    events.push(...c.history);
  }

  return events.sort((a, b) => b.date.localeCompare(a.date));
}

export function computeFinancialKpis(
  financial: PatientFinancialData,
  budgets: DentalBudget[]
): FinancialKpiSummary {
  const openCharges = financial.charges.filter(
    (c) => c.status !== "pago" && c.status !== "cancelado"
  );
  const normalized = financial.charges.map((c) => ({ ...c, status: normalizeChargeStatus(c) }));
  const overdue = normalized.filter((c) => c.status === "vencido");
  const totalReceivable = openCharges.reduce((s, c) => s + c.amount, 0);
  const overdueAmount = overdue.reduce((s, c) => s + c.amount, 0);
  const totalReceived = financial.payments.reduce((s, p) => s + p.amount, 0);
  const approved = budgets.filter((b) => b.status === "aprovado" || b.status === "parcial");
  const approvedBudgetsTotal = approved.reduce((s, b) => s + b.total, 0);

  const upcoming = normalized
    .filter((c) => c.status === "pendente" || c.status === "agendado")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const next = upcoming[0];

  const totalGeneral = totalReceived + totalReceivable;
  const receivedPercent = totalGeneral > 0 ? Math.round((totalReceived / totalGeneral) * 100) : 0;

  return {
    totalReceivable,
    openChargesCount: openCharges.length,
    overdueAmount,
    overdueCount: overdue.length,
    totalReceived,
    nextInstallment: next
      ? {
          date: next.dueDate,
          amount: next.amount,
          procedure: next.procedure,
          title: next.title,
        }
      : undefined,
    approvedBudgetsTotal,
    approvedBudgetsCount: approved.length,
    receivedPercent,
    receivablePercent: 100 - receivedPercent,
    situation: {
      upcoming: normalized
        .filter((c) => c.status === "pendente")
        .reduce((s, c) => s + c.amount, 0),
      overdue: overdueAmount,
      paid: totalReceived,
      cancelled: normalized
        .filter((c) => c.status === "cancelado")
        .reduce((s, c) => s + c.amount, 0),
      scheduled: normalized
        .filter((c) => c.status === "agendado")
        .reduce((s, c) => s + c.amount, 0),
    },
  };
}

export function receivePayment(
  financial: PatientFinancialData,
  chargeId: string,
  user: string,
  method?: PaymentMethodType
): PatientFinancialData {
  const charge = financial.charges.find((c) => c.id === chargeId);
  if (!charge || charge.status === "pago" || charge.status === "cancelado") return financial;

  const payMethod = method ?? charge.paymentMethod;
  const payment: FinancialPayment = {
    id: `pay-${Date.now()}`,
    chargeId,
    budgetId: charge.budgetId,
    budgetNumber: charge.budgetNumber,
    description: charge.title,
    amount: charge.amount,
    date: new Date().toISOString().slice(0, 10),
    method: payMethod,
    user,
  };

  const event: FinancialTimelineEvent = {
    id: `tl-${Date.now()}`,
    type: "pagamento_recebido",
    date: new Date().toISOString(),
    user,
    chargeId,
    budgetId: charge.budgetId,
    note: `${PAYMENT_METHOD_LABELS[payMethod]} — ${charge.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
  };

  return {
    charges: financial.charges.map((c) =>
      c.id === chargeId ? { ...c, status: "pago" as const, history: [...c.history, event] } : c
    ),
    payments: [payment, ...financial.payments],
    timeline: [event, ...financial.timeline],
  };
}

export function cancelCharge(
  financial: PatientFinancialData,
  chargeId: string,
  user: string
): PatientFinancialData {
  const event: FinancialTimelineEvent = {
    id: `tl-${Date.now()}`,
    type: "cobranca_cancelada",
    date: new Date().toISOString(),
    user,
    chargeId,
  };

  return {
    ...financial,
    charges: financial.charges.map((c) =>
      c.id === chargeId ? { ...c, status: "cancelado" as const, history: [...c.history, event] } : c
    ),
    timeline: [event, ...financial.timeline],
  };
}

export function syncBudgetAfterPayment(
  budgets: DentalBudget[],
  financial: PatientFinancialData
): DentalBudget[] {
  return budgets.map((b) => {
    const paid = financial.payments
      .filter((p) => p.budgetId === b.id)
      .reduce((s, p) => s + p.amount, 0);
    return recalcBudget({ ...b, paidAmount: paid });
  });
}

export function generateAllChargesFromBudgets(
  financial: PatientFinancialData,
  budgets: DentalBudget[],
  user: string
): PatientFinancialData {
  const approved = budgets.filter(
    (b) => (b.status === "aprovado" || b.status === "parcial") && !financial.charges.some((c) => c.budgetId === b.id)
  );

  if (approved.length === 0) return financial;

  const newCharges = approved.flatMap(generateChargesFromBudget);
  const events: FinancialTimelineEvent[] = approved.map((b) => ({
    id: `tl-gen-${b.id}-${Date.now()}`,
    type: "cobranca_criada",
    date: new Date().toISOString(),
    user,
    budgetId: b.id,
    note: `Cobrança gerada a partir do orçamento ${b.number}`,
  }));

  return {
    charges: [...financial.charges, ...newCharges],
    payments: financial.payments,
    timeline: [...events, ...financial.timeline],
  };
}
