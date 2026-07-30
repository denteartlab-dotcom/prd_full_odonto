import type { Payable, Patient, Professional, Receivable } from "@prisma/client";
import type { ContasAPagarData, PayableAccount, PayableStatus } from "@/lib/contas-a-pagar-types";
import type {
  ContasAReceberData,
  ReceivableInstallment,
  ReceivableStatus,
} from "@/lib/contas-a-receber-types";
import type {
  FinanceiroGeralData,
  FinanceMovement,
  FinanceStatus,
} from "@/lib/financeiro-geral-types";
import {
  addMonths,
  endOfMonth,
  formatMonthShort,
  isoDate,
  startOfDay,
  startOfMonth,
} from "@/lib/date-range";
import { isOpenReceivable, isPaidPayable, isPaidReceivable } from "@/lib/build-dashboard";
import { money } from "@/lib/utils";

type ReceivableRow = Receivable & {
  patient: Patient | null;
};

type PayableMeta = {
  category?: string;
  costCenter?: string;
  bankAccount?: string;
  paymentMethod?: string;
  document?: string;
  invoiceNumber?: string;
  responsible?: string;
  notes?: string;
};

function parsePayableMeta(description: string): { clean: string; meta: PayableMeta } {
  if (!description.startsWith("{")) return { clean: description, meta: {} };
  try {
    const parsed = JSON.parse(description) as PayableMeta & { description?: string };
    return {
      clean: parsed.description || "Despesa",
      meta: parsed,
    };
  } catch {
    return { clean: description, meta: {} };
  }
}

export function encodePayableDescription(input: {
  description: string;
  category?: string;
  costCenter?: string;
  bankAccount?: string;
  paymentMethod?: string;
  document?: string;
  invoiceNumber?: string;
  responsible?: string;
  notes?: string;
}) {
  return JSON.stringify({
    description: input.description,
    category: input.category || "Geral",
    costCenter: input.costCenter || "Clínica",
    bankAccount: input.bankAccount || "—",
    paymentMethod: input.paymentMethod || "—",
    document: input.document || "",
    invoiceNumber: input.invoiceNumber || "",
    responsible: input.responsible || "Financeiro",
    notes: input.notes || "",
  });
}

function mapReceivableUiStatus(r: Receivable, today: Date): ReceivableStatus {
  if (r.status === "cancelado") return "cancelado";
  if (r.status === "pago" || r.paidAt) return "pago";
  if (r.status === "parcial") return "parcial";
  if (r.status === "negociado") return "negociado";
  if (r.dueDate < startOfDay(today)) return "vencido";
  return "em_aberto";
}

function mapPayableUiStatus(p: Payable, today: Date): PayableStatus {
  if (p.status === "cancelado") return "cancelado";
  if (p.status === "pago" || p.paidAt) return "pago";
  if (p.status === "parcial") return "parcial";
  if (p.status === "agendado") return "agendado";
  if (p.dueDate < startOfDay(today)) return "vencido";
  return "em_aberto";
}

function financeStatusFromReceivable(r: Receivable, today: Date): FinanceStatus {
  if (r.status === "cancelado") return "cancelado";
  if (r.status === "pago" || r.paidAt) return "pago";
  if (r.dueDate < startOfDay(today)) return "em_atraso";
  return "a_vencer";
}

function financeStatusFromPayable(p: Payable, today: Date): FinanceStatus {
  if (p.status === "cancelado") return "cancelado";
  if (p.status === "pago" || p.paidAt) return "pago";
  if (p.dueDate < startOfDay(today)) return "em_atraso";
  return "a_vencer";
}

function buildCalendar(
  items: { dueDate: Date; amount: number; status: string; paidAt: Date | null }[],
  now: Date
) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayIso = isoDate(now);
  const cells = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateIso = isoDate(date);
    const dayItems = items.filter((i) => isoDate(i.dueDate) === dateIso);
    const total = dayItems.reduce((a, i) => a + i.amount, 0);
    let tone: "pago" | "hoje" | "proximo" | "atraso" | "neutro" | "vazio" = "vazio";
    if (dayItems.length) {
      const allPaid = dayItems.every((i) => i.status === "pago" || i.paidAt);
      if (allPaid) tone = "pago";
      else if (dateIso === todayIso) tone = "hoje";
      else if (date < startOfDay(now)) tone = "atraso";
      else tone = "proximo";
    } else if (dateIso === todayIso) {
      tone = "hoje";
    } else {
      tone = "neutro";
    }
    cells.push({
      date: dateIso,
      day,
      total,
      tone,
      count: dayItems.length,
    });
  }
  return cells;
}

export function receivableToInstallment(
  r: ReceivableRow,
  today = new Date()
): ReceivableInstallment {
  const status = mapReceivableUiStatus(r, today);
  const paid = status === "pago";
  return {
    id: r.id,
    patient: r.patient?.name || "Sem paciente",
    cpf: r.patient?.cpf || "—",
    phone: r.patient?.phone || "—",
    budgetNumber: "—",
    procedure: r.description,
    professional: "—",
    convenio: "Particular",
    installment: 1,
    totalInstallments: 1,
    dueDate: isoDate(r.dueDate),
    dueLabel: r.dueDate.toLocaleDateString("pt-BR"),
    amount: r.amount,
    receivedAmount: paid ? r.amount : status === "parcial" ? r.amount / 2 : 0,
    balance: paid ? 0 : r.amount,
    paymentMethod: r.method || "—",
    bankAccount: "—",
    status,
    notes: "",
    asaasPaymentId: r.asaasPaymentId,
    asaasBillingType: r.asaasBillingType,
    asaasStatus: r.asaasStatus,
    asaasBankSlipUrl: r.asaasBankSlipUrl,
    asaasInvoiceUrl: r.asaasInvoiceUrl,
    asaasPixPayload: r.asaasPixPayload,
    asaasPixQrImage: r.asaasPixQrImage,
  };
}

export function payableToAccount(p: Payable, today = new Date()): PayableAccount {
  const { clean, meta } = parsePayableMeta(p.description);
  const status = mapPayableUiStatus(p, today);
  const paid = status === "pago";
  return {
    id: p.id,
    dueDate: isoDate(p.dueDate),
    dueLabel: p.dueDate.toLocaleDateString("pt-BR"),
    supplier: p.supplier || "Fornecedor",
    description: clean,
    category: meta.category || "Geral",
    costCenter: meta.costCenter || "Clínica",
    bankAccount: meta.bankAccount || "—",
    paymentMethod: meta.paymentMethod || "—",
    document: meta.document || "—",
    invoiceNumber: meta.invoiceNumber || "—",
    amount: p.amount,
    paidAmount: paid ? p.amount : status === "parcial" ? p.amount / 2 : 0,
    balance: paid ? 0 : p.amount,
    status,
    responsible: meta.responsible || "Financeiro",
    notes: meta.notes || "",
    attachments: 0,
  };
}

export function buildContasAReceberData(input: {
  now?: Date;
  receivables: ReceivableRow[];
}): ContasAReceberData {
  const now = input.now || new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const installments = input.receivables.map((r) => receivableToInstallment(r, now));

  const aberto = installments
    .filter((i) => i.status === "em_aberto" || i.status === "vencido" || i.status === "parcial")
    .reduce((a, i) => a + i.balance, 0);
  const recebidoMes = input.receivables
    .filter((r) => {
      if (!isPaidReceivable(r)) return false;
      const when = r.paidAt || r.dueDate;
      return when >= monthStart && when <= monthEnd;
    })
    .reduce((a, r) => a + r.amount, 0);
  const vencidos = installments
    .filter((i) => i.status === "vencido")
    .reduce((a, i) => a + i.balance, 0);
  const previstos = installments
    .filter((i) => i.status === "em_aberto")
    .reduce((a, i) => a + i.balance, 0);

  const byPatient = new Map<string, number>();
  for (const i of installments) {
    if (i.status !== "pago") continue;
    byPatient.set(i.patient, (byPatient.get(i.patient) || 0) + i.amount);
  }
  const maiorPagador =
    [...byPatient.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const byProc = new Map<string, number>();
  for (const i of installments) {
    byProc.set(i.procedure, (byProc.get(i.procedure) || 0) + i.amount);
  }
  const procedimentoTop =
    [...byProc.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const methodCounts = new Map<string, number>();
  for (const i of installments) {
    const m = i.paymentMethod || "—";
    methodCounts.set(m, (methodCounts.get(m) || 0) + 1);
  }
  const methodTotal = Math.max(1, [...methodCounts.values()].reduce((a, b) => a + b, 0));
  const colors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  const paymentShare = [...methodCounts.entries()].map(([name, count], idx) => ({
    name,
    percent: Math.round((count / methodTotal) * 100),
    color: colors[idx % colors.length],
  }));

  const today = startOfDay(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const week = new Date(today);
  week.setDate(week.getDate() + 7);

  const upcomingBuckets = [
    { id: "hoje", when: "Hoje", from: today, to: today },
    { id: "amanha", when: "Amanhã", from: tomorrow, to: tomorrow },
    { id: "semana", when: "Esta semana", from: today, to: week },
  ].map((b) => {
    const rows = installments.filter((i) => {
      if (i.status === "pago" || i.status === "cancelado") return false;
      const d = new Date(`${i.dueDate}T12:00:00`);
      return d >= b.from && d <= endOfDayLike(b.to);
    });
    return {
      id: b.id,
      when: b.when,
      label: `${rows.length} título(s)`,
      amount: rows.reduce((a, i) => a + i.balance, 0),
      count: rows.length,
    };
  });

  const alerts = [];
  if (vencidos > 0) {
    alerts.push({
      id: "vencidos",
      title: "Títulos vencidos",
      detail: `${money(vencidos)} em atraso`,
      priority: "alta" as const,
    });
  }

  return {
    kpis: [
      {
        id: "aberto",
        label: "Em aberto",
        value: money(aberto),
        hint: "Saldo a receber",
        tone: "slate",
      },
      {
        id: "recebido",
        label: "Recebido no mês",
        value: money(recebidoMes),
        tone: "green",
      },
      {
        id: "previsto",
        label: "Previsto",
        value: money(previstos),
        tone: "blue",
      },
      {
        id: "vencido",
        label: "Vencido",
        value: money(vencidos),
        tone: "red",
      },
    ],
    installments,
    calendar: buildCalendar(
      input.receivables.map((r) => ({
        dueDate: r.dueDate,
        amount: r.amount,
        status: r.status,
        paidAt: r.paidAt,
      })),
      now
    ),
    calendarMonthLabel: now.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    }),
    paymentShare,
    convenios: [],
    upcoming: upcomingBuckets,
    alerts,
    goal: { current: recebidoMes, target: Math.max(recebidoMes, aberto + recebidoMes, 1) },
    summary: {
      totalAberto: aberto,
      totalRecebido: recebidoMes,
      previstos,
      vencidos,
      maiorPagador,
      convenioTop: "Particular",
      procedimentoTop,
      receitaMes: recebidoMes,
    },
    filterOptions: {
      statuses: ["Todos", "Pago", "Em Aberto", "Vencido", "Cancelado"],
      paymentMethods: [
        "Todas",
        ...new Set(installments.map((i) => i.paymentMethod).filter((x) => x && x !== "—")),
      ],
      professionals: ["Todos"],
      convenios: ["Todos", "Particular"],
      procedures: [
        "Todos",
        ...new Set(installments.map((i) => i.procedure).filter(Boolean)),
      ],
      categories: ["Todas"],
      responsibles: ["Todos"],
      bankAccounts: ["Todas"],
    },
  };
}

function endOfDayLike(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

export function buildContasAPagarData(input: {
  now?: Date;
  payables: Payable[];
}): ContasAPagarData {
  const now = input.now || new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const accounts = input.payables.map((p) => payableToAccount(p, now));

  const aberto = accounts
    .filter((a) => a.status !== "pago" && a.status !== "cancelado")
    .reduce((s, a) => s + a.balance, 0);
  const pagoMes = input.payables
    .filter((p) => {
      if (!isPaidPayable(p)) return false;
      const when = p.paidAt || p.dueDate;
      return when >= monthStart && when <= monthEnd;
    })
    .reduce((s, p) => s + p.amount, 0);
  const emAtraso = accounts
    .filter((a) => a.status === "vencido")
    .reduce((s, a) => s + a.balance, 0);
  const previsao = accounts
    .filter((a) => a.status === "em_aberto" || a.status === "agendado")
    .reduce((s, a) => s + a.balance, 0);

  const bySupplier = new Map<string, number>();
  for (const a of accounts) {
    bySupplier.set(a.supplier, (bySupplier.get(a.supplier) || 0) + a.amount);
  }
  const maiorFornecedor =
    [...bySupplier.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const byCat = new Map<string, number>();
  for (const a of accounts) {
    byCat.set(a.category, (byCat.get(a.category) || 0) + a.amount);
  }
  const categoriaTop = [...byCat.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
  const catTotal = Math.max(1, [...byCat.values()].reduce((a, b) => a + b, 0));
  const catColors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  const categoryShare = [...byCat.entries()].map(([name, value], i) => ({
    name,
    percent: Math.round((value / catTotal) * 100),
    color: catColors[i % catColors.length],
  }));

  const byStatus = new Map<string, number>();
  for (const a of accounts) {
    byStatus.set(a.status, (byStatus.get(a.status) || 0) + 1);
  }
  const stTotal = Math.max(1, accounts.length);
  const statusShare = [...byStatus.entries()].map(([name, count], i) => ({
    name,
    percent: Math.round((count / stTotal) * 100),
    color: catColors[i % catColors.length],
  }));

  const outflowMonthly = Array.from({ length: 6 }, (_, idx) => {
    const m = addMonths(now, -5 + idx);
    const from = startOfMonth(m);
    const to = endOfMonth(m);
    const value = input.payables
      .filter((p) => {
        if (!isPaidPayable(p)) return false;
        const when = p.paidAt || p.dueDate;
        return when >= from && when <= to;
      })
      .reduce((s, p) => s + p.amount, 0);
    return { label: formatMonthShort(m), value };
  });

  const today = startOfDay(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const week = new Date(today);
  week.setDate(week.getDate() + 7);
  const upcoming = [
    { id: "hoje", when: "Hoje", from: today, to: today },
    { id: "amanha", when: "Amanhã", from: tomorrow, to: tomorrow },
    { id: "semana", when: "Esta semana", from: today, to: week },
  ].map((b) => {
    const rows = accounts.filter((a) => {
      if (a.status === "pago" || a.status === "cancelado") return false;
      const d = new Date(`${a.dueDate}T12:00:00`);
      return d >= b.from && d <= endOfDayLike(b.to);
    });
    return {
      id: b.id,
      when: b.when,
      label: `${rows.length} conta(s)`,
      amount: rows.reduce((s, a) => s + a.balance, 0),
      count: rows.length,
    };
  });

  const ultimosPagamentos = accounts
    .filter((a) => a.status === "pago")
    .slice(0, 5)
    .map((a) => ({
      id: a.id,
      label: a.supplier,
      amount: a.amount,
      date: a.dueLabel,
    }));

  const alerts = [];
  if (emAtraso > 0) {
    alerts.push({
      id: "atraso",
      title: "Contas em atraso",
      detail: money(emAtraso),
      priority: "alta" as const,
    });
  }

  return {
    kpis: [
      { id: "aberto", label: "Em aberto", value: money(aberto), tone: "slate" },
      { id: "pago", label: "Pago no mês", value: money(pagoMes), tone: "green" },
      { id: "atraso", label: "Em atraso", value: money(emAtraso), tone: "red" },
      { id: "previsao", label: "Previsão", value: money(previsao), tone: "amber" },
    ],
    accounts,
    calendar: buildCalendar(
      input.payables.map((p) => ({
        dueDate: p.dueDate,
        amount: p.amount,
        status: p.status,
        paidAt: p.paidAt,
      })),
      now
    ),
    calendarMonthLabel: now.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    }),
    categoryShare,
    statusShare,
    outflowMonthly,
    upcoming,
    alerts,
    summary: {
      totalAberto: aberto,
      totalPago: pagoMes,
      emAtraso,
      previsao,
      maiorFornecedor,
      categoriaTop,
      ultimosPagamentos,
    },
    filterOptions: {
      suppliers: ["Todos", ...new Set(accounts.map((a) => a.supplier))],
      categories: ["Todas", ...new Set(accounts.map((a) => a.category))],
      costCenters: ["Todos", ...new Set(accounts.map((a) => a.costCenter))],
      bankAccounts: ["Todas", ...new Set(accounts.map((a) => a.bankAccount))],
      paymentMethods: ["Todas", ...new Set(accounts.map((a) => a.paymentMethod))],
      statuses: ["Todos", "Pago", "Em aberto", "Vencido", "Cancelado"],
      responsibles: ["Todos", ...new Set(accounts.map((a) => a.responsible))],
    },
  };
}

export function buildFinanceiroGeralData(input: {
  now?: Date;
  receivables: ReceivableRow[];
  payables: Payable[];
  professionals: Professional[];
}): FinanceiroGeralData {
  const now = input.now || new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const today = startOfDay(now);

  const receitasMes = input.receivables
    .filter((r) => {
      if (!isPaidReceivable(r)) return false;
      const when = r.paidAt || r.dueDate;
      return when >= monthStart && when <= monthEnd;
    })
    .reduce((a, r) => a + r.amount, 0);
  const despesasMes = input.payables
    .filter((p) => {
      if (!isPaidPayable(p)) return false;
      const when = p.paidAt || p.dueDate;
      return when >= monthStart && when <= monthEnd;
    })
    .reduce((a, p) => a + p.amount, 0);
  const lucro = receitasMes - despesasMes;
  const abertoRec = input.receivables
    .filter(isOpenReceivable)
    .reduce((a, r) => a + r.amount, 0);
  const abertoPag = input.payables
    .filter((p) => !isPaidPayable(p) && p.status !== "cancelado")
    .reduce((a, p) => a + p.amount, 0);

  const receitasAno = input.receivables
    .filter((r) => {
      if (!isPaidReceivable(r)) return false;
      const when = r.paidAt || r.dueDate;
      return when >= yearStart && when <= monthEnd;
    })
    .reduce((a, r) => a + r.amount, 0);

  const cashflowMonthly = Array.from({ length: 6 }, (_, idx) => {
    const m = addMonths(now, -5 + idx);
    const from = startOfMonth(m);
    const to = endOfMonth(m);
    const receitas = input.receivables
      .filter((r) => {
        if (!isPaidReceivable(r)) return false;
        const when = r.paidAt || r.dueDate;
        return when >= from && when <= to;
      })
      .reduce((a, r) => a + r.amount, 0);
    const despesas = input.payables
      .filter((p) => {
        if (!isPaidPayable(p)) return false;
        const when = p.paidAt || p.dueDate;
        return when >= from && when <= to;
      })
      .reduce((a, p) => a + p.amount, 0);
    return {
      label: formatMonthShort(m),
      receitas,
      despesas,
      lucro: receitas - despesas,
    };
  });

  const cashflowDaily = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - idx));
    const from = startOfDay(d);
    const to = endOfDayLike(d);
    const receitas = input.receivables
      .filter((r) => {
        if (!isPaidReceivable(r)) return false;
        const when = r.paidAt || r.dueDate;
        return when >= from && when <= to;
      })
      .reduce((a, r) => a + r.amount, 0);
    const despesas = input.payables
      .filter((p) => {
        if (!isPaidPayable(p)) return false;
        const when = p.paidAt || p.dueDate;
        return when >= from && when <= to;
      })
      .reduce((a, p) => a + p.amount, 0);
    return {
      label: d.toLocaleDateString("pt-BR", { weekday: "short" }),
      receitas,
      despesas,
      lucro: receitas - despesas,
    };
  });

  const movements: FinanceMovement[] = [];
  for (const r of input.receivables) {
    movements.push({
      id: `r-${r.id}`,
      date: isoDate(r.paidAt || r.dueDate),
      patient: r.patient?.name || "—",
      description: r.description,
      category: "Receita",
      professional: "—",
      costCenter: "Clínica",
      paymentMethod: r.method || "—",
      bankAccount: "—",
      income: isPaidReceivable(r) || isOpenReceivable(r) ? r.amount : null,
      expense: null,
      balance: 0,
      status: financeStatusFromReceivable(r, now),
      notes: "",
    });
  }
  for (const p of input.payables) {
    const { clean, meta } = parsePayableMeta(p.description);
    movements.push({
      id: `p-${p.id}`,
      date: isoDate(p.paidAt || p.dueDate),
      patient: p.supplier || "—",
      description: clean,
      category: meta.category || "Despesa",
      professional: "—",
      costCenter: meta.costCenter || "Clínica",
      paymentMethod: meta.paymentMethod || "—",
      bankAccount: meta.bankAccount || "—",
      income: null,
      expense: p.amount,
      balance: 0,
      status: financeStatusFromPayable(p, now),
      notes: meta.notes || "",
    });
  }
  movements.sort((a, b) => b.date.localeCompare(a.date));
  let running = 0;
  for (const m of [...movements].reverse()) {
    running += (m.income || 0) - (m.expense || 0);
    m.balance = running;
  }

  const methodMap = new Map<string, number>();
  for (const r of input.receivables.filter(isPaidReceivable)) {
    const m = r.method || "Outros";
    methodMap.set(m, (methodMap.get(m) || 0) + r.amount);
  }
  const methodTotal = Math.max(1, [...methodMap.values()].reduce((a, b) => a + b, 0));
  const colors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  const paymentMethods = [...methodMap.entries()].map(([name, value], i) => ({
    name,
    percent: Math.round((value / methodTotal) * 100),
    color: colors[i % colors.length],
  }));

  const recentReceipts = input.receivables
    .filter(isPaidReceivable)
    .sort(
      (a, b) =>
        (b.paidAt || b.createdAt).getTime() - (a.paidAt || a.createdAt).getTime()
    )
    .slice(0, 8)
    .map((r) => ({
      id: r.id,
      patient: r.patient?.name || "—",
      procedure: r.description,
      professional: "—",
      paymentMethod: r.method || "—",
      date: (r.paidAt || r.dueDate).toLocaleDateString("pt-BR"),
      amount: r.amount,
      status: "pago" as const,
    }));

  const receivables = input.receivables
    .filter(isOpenReceivable)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 20)
    .map((r) => ({
      id: r.id,
      patient: r.patient?.name || r.description,
      document: r.patient?.cpf || "—",
      dueDate: r.dueDate.toLocaleDateString("pt-BR"),
      amount: r.amount,
      status: financeStatusFromReceivable(r, now),
      daysOverdue: Math.max(
        0,
        Math.floor((today.getTime() - startOfDay(r.dueDate).getTime()) / 86400000)
      ),
    }));

  const payables = input.payables
    .filter((p) => !isPaidPayable(p) && p.status !== "cancelado")
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 20)
    .map((p) => {
      const { clean, meta } = parsePayableMeta(p.description);
      return {
        id: p.id,
        vendor: p.supplier || "Fornecedor",
        category: meta.category || "Geral",
        dueDate: p.dueDate.toLocaleDateString("pt-BR"),
        amount: p.amount,
        account: meta.bankAccount || "—",
        status: financeStatusFromPayable(p, now),
      };
    });

  const vencidosRec = input.receivables.filter(
    (r) => isOpenReceivable(r) && r.dueDate < today
  ).length;
  const alerts = [];
  if (vencidosRec)
    alerts.push({
      id: "rec-venc",
      title: "Recebíveis vencidos",
      detail: `${vencidosRec} título(s)`,
      priority: "alta" as const,
    });

  const pacientesPagantes = new Set(
    input.receivables.filter(isPaidReceivable).map((r) => r.patientId).filter(Boolean)
  ).size;

  return {
    kpis: [
      {
        id: "saldo",
        label: "Saldo do mês",
        value: money(lucro),
        tone: lucro >= 0 ? "green" : "red",
        sparkline: cashflowMonthly.map((c) => c.lucro),
      },
      {
        id: "receitas",
        label: "Receitas (mês)",
        value: money(receitasMes),
        tone: "green",
        sparkline: cashflowMonthly.map((c) => c.receitas),
      },
      {
        id: "despesas",
        label: "Despesas (mês)",
        value: money(despesasMes),
        tone: "red",
        sparkline: cashflowMonthly.map((c) => c.despesas),
      },
      {
        id: "a_receber",
        label: "A receber",
        value: money(abertoRec),
        tone: "blue",
      },
      {
        id: "a_pagar",
        label: "A pagar",
        value: money(abertoPag),
        tone: "amber",
      },
      {
        id: "ano",
        label: "Faturamento anual",
        value: money(receitasAno),
        tone: "violet",
      },
    ],
    cashflowDaily,
    cashflowWeekly: cashflowDaily,
    cashflowMonthly,
    cashflowYearly: cashflowMonthly,
    incomeExpenseBars: cashflowMonthly.map((c) => ({
      label: c.label,
      receitas: c.receitas,
      despesas: c.despesas,
    })),
    bankAccounts: [
      {
        id: "caixa",
        bank: "Caixa da clínica",
        account: "Principal",
        balance: lucro,
        updatedAt: now.toLocaleDateString("pt-BR"),
      },
    ],
    paymentMethods,
    recentReceipts,
    receivables,
    payables,
    convenios: [],
    upcoming: [
      {
        id: "hoje",
        when: "hoje" as const,
        label: "Vencimentos de hoje",
        amount: input.receivables
          .filter((r) => isOpenReceivable(r) && isoDate(r.dueDate) === isoDate(now))
          .reduce((a, r) => a + r.amount, 0),
      },
    ],
    alerts,
    goal: {
      current: receitasMes,
      target: Math.max(receitasMes * 1.2, 1),
    },
    movements,
    summary: {
      saldoTotal: lucro,
      receitas: receitasMes,
      despesas: despesasMes,
      lucro,
      ticketMedio: pacientesPagantes ? receitasMes / pacientesPagantes : 0,
      faturamentoDiario: receitasMes / Math.max(1, now.getDate()),
      faturamentoMensal: receitasMes,
      faturamentoAnual: receitasAno,
      pacientesPagantes,
      convenios: 0,
      receitasPrevistas: abertoRec,
      despesasPrevistas: abertoPag,
    },
    filterOptions: {
      professionals: ["Todos", ...input.professionals.map((p) => p.name)],
      convenios: ["Todos"],
      paymentMethods: ["Todos", ...new Set(paymentMethods.map((p) => p.name))],
      bankAccounts: ["Todas", "Caixa da clínica"],
      costCenters: ["Todos", "Clínica"],
      categories: ["Todas", "Receita", "Despesa"],
      statuses: ["Todos", "pago", "pendente", "a_vencer", "em_atraso"],
    },
  };
}
