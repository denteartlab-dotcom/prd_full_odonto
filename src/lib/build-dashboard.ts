import type {
  Appointment,
  Budget,
  CashMovement,
  Commission,
  OdontogramEntry,
  Patient,
  Payable,
  Professional,
  Receivable,
  Treatment,
} from "@prisma/client";
import type { DashboardData } from "@/lib/dashboard-types";
import {
  endOfDay,
  endOfMonth,
  formatMonthShort,
  growthPct,
  initialsFromName,
  monthLabelPt,
  relativeTime,
  startOfDay,
  startOfMonth,
  addMonths,
} from "@/lib/date-range";
import { money } from "@/lib/utils";

const PROC_COLORS = ["#6366f1", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#14b8a6"];

type ReceivableWithPatient = Receivable & {
  patient: { id: string; name: string } | null;
};

type AppointmentWithPatient = Appointment & {
  patient: Patient;
};

type CommissionWithPro = Commission & {
  professional: Professional;
};

function mapAgendaStatus(
  status: string
): "confirmado" | "em_andamento" | "pendente" {
  if (status === "em_andamento") return "em_andamento";
  if (status === "aguardando" || status === "pendente") return "pendente";
  if (status === "confirmado" || status === "agendado") return "confirmado";
  if (status === "finalizado") return "confirmado";
  return "pendente";
}

function isPaidReceivable(r: Receivable) {
  return r.status === "pago" || !!r.paidAt;
}

function isOpenReceivable(r: Receivable) {
  return !isPaidReceivable(r) && r.status !== "cancelado";
}

function isPaidPayable(p: Payable) {
  return p.status === "pago" || !!p.paidAt;
}

function sumPaidReceivables(rows: Receivable[], from: Date, to: Date) {
  return rows
    .filter((r) => {
      if (!isPaidReceivable(r)) return false;
      const when = r.paidAt || r.dueDate;
      return when >= from && when <= to;
    })
    .reduce((acc, r) => acc + r.amount, 0);
}

function sumBudgetBilling(rows: Budget[], from: Date, to: Date) {
  return rows
    .filter((b) => {
      if (!["aprovado", "parcial", "pago"].includes(b.status)) return false;
      return b.createdAt >= from && b.createdAt <= to;
    })
    .reduce((acc, b) => acc + b.total, 0);
}

function sumPaidPayables(rows: Payable[], from: Date, to: Date) {
  return rows
    .filter((p) => {
      if (!isPaidPayable(p)) return false;
      const when = p.paidAt || p.dueDate;
      return when >= from && when <= to;
    })
    .reduce((acc, p) => acc + p.amount, 0);
}

function sparkFromMonths(values: number[]) {
  if (!values.length) return [0, 0, 0, 0, 0, 0];
  return values;
}

export function buildDashboardData(input: {
  now?: Date;
  patients: Patient[];
  appointments: AppointmentWithPatient[];
  budgets: Budget[];
  receivables: ReceivableWithPatient[];
  payables: Payable[];
  cashMovements: CashMovement[];
  treatments: Treatment[];
  odontogram: OdontogramEntry[];
  commissions: CommissionWithPro[];
}): DashboardData {
  const now = input.now || new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const prevStart = startOfMonth(addMonths(now, -1));
  const prevEnd = endOfMonth(addMonths(now, -1));
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const faturamentoMes = sumBudgetBilling(input.budgets, monthStart, monthEnd);
  const faturamentoPrev = sumBudgetBilling(input.budgets, prevStart, prevEnd);
  // Se não há orçamentos aprovados, usa títulos criados no mês como proxy de faturamento
  const titulosMes = input.receivables
    .filter((r) => r.createdAt >= monthStart && r.createdAt <= monthEnd)
    .reduce((a, r) => a + r.amount, 0);
  const titulosPrev = input.receivables
    .filter((r) => r.createdAt >= prevStart && r.createdAt <= prevEnd)
    .reduce((a, r) => a + r.amount, 0);
  const fatMes = faturamentoMes > 0 ? faturamentoMes : titulosMes;
  const fatPrev = faturamentoPrev > 0 ? faturamentoPrev : titulosPrev;

  const recebimentosMes = sumPaidReceivables(input.receivables, monthStart, monthEnd);
  const recebimentosPrev = sumPaidReceivables(input.receivables, prevStart, prevEnd);

  const consultasMes = input.appointments.filter(
    (a) =>
      a.startsAt >= monthStart &&
      a.startsAt <= monthEnd &&
      a.status !== "cancelado"
  ).length;
  const consultasPrev = input.appointments.filter(
    (a) =>
      a.startsAt >= prevStart &&
      a.startsAt <= prevEnd &&
      a.status !== "cancelado"
  ).length;

  const novosMes = input.patients.filter(
    (p) => p.createdAt >= monthStart && p.createdAt <= monthEnd
  ).length;
  const novosPrev = input.patients.filter(
    (p) => p.createdAt >= prevStart && p.createdAt <= prevEnd
  ).length;

  const sparkFat: number[] = [];
  const sparkRec: number[] = [];
  const sparkCon: number[] = [];
  const sparkPac: number[] = [];
  for (let i = 5; i >= 0; i--) {
    const m = addMonths(now, -i);
    const from = startOfMonth(m);
    const to = endOfMonth(m);
    const fat =
      sumBudgetBilling(input.budgets, from, to) ||
      input.receivables
        .filter((r) => r.createdAt >= from && r.createdAt <= to)
        .reduce((a, r) => a + r.amount, 0);
    sparkFat.push(Math.round(fat / 1000) || fat);
    sparkRec.push(sumPaidReceivables(input.receivables, from, to));
    sparkCon.push(
      input.appointments.filter(
        (a) => a.startsAt >= from && a.startsAt <= to && a.status !== "cancelado"
      ).length
    );
    sparkPac.push(
      input.patients.filter((p) => p.createdAt >= from && p.createdAt <= to).length
    );
  }

  const agendaHoje = input.appointments
    .filter(
      (a) =>
        a.startsAt >= todayStart &&
        a.startsAt <= todayEnd &&
        a.status !== "cancelado"
    )
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    .slice(0, 8)
    .map((a) => {
      const h = String(a.startsAt.getHours()).padStart(2, "0");
      const m = String(a.startsAt.getMinutes()).padStart(2, "0");
      return {
        id: a.id,
        time: `${h}:${m}`,
        patient: a.patient.name,
        initials: initialsFromName(a.patient.name),
        procedure: a.type || "Consulta",
        status: mapAgendaStatus(a.status),
      };
    });

  const faturamento6Meses = Array.from({ length: 6 }, (_, idx) => {
    const m = addMonths(now, -5 + idx);
    const from = startOfMonth(m);
    const to = endOfMonth(m);
    const value =
      sumBudgetBilling(input.budgets, from, to) ||
      input.receivables
        .filter((r) => r.createdAt >= from && r.createdAt <= to)
        .reduce((a, r) => a + r.amount, 0);
    return { month: formatMonthShort(m), value: Math.round(value) };
  });

  const procCounts = new Map<string, number>();
  for (const a of input.appointments) {
    if (a.status === "cancelado") continue;
    const name = (a.type || "Consulta").trim() || "Consulta";
    procCounts.set(name, (procCounts.get(name) || 0) + 1);
  }
  const procTotal = [...procCounts.values()].reduce((a, b) => a + b, 0);
  const procedimentos =
    procTotal === 0
      ? []
      : [...procCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count], i) => ({
            name,
            percent: Math.round((count / procTotal) * 100),
            color: PROC_COLORS[i % PROC_COLORS.length],
          }));

  const tratados = input.odontogram.filter((o) =>
    ["concluido", "tratado", "restaurado"].includes(o.status)
  ).length;
  const ativos = input.treatments.filter((t) =>
    ["em_andamento", "andamento", "ativo"].includes(t.status)
  ).length;
  const concluidos = input.treatments.filter((t) =>
    ["concluido", "finalizado"].includes(t.status)
  ).length;
  const pendentes = input.treatments.filter((t) =>
    ["planejado", "pendente", "indicado"].includes(t.status)
  ).length;

  const mapTooth = (status: string) => {
    if (["concluido", "tratado", "restaurado"].includes(status)) return "concluido";
    if (["andamento", "em_andamento"].includes(status)) return "andamento";
    if (["indicado", "pendente", "cariado"].includes(status)) return "indicado";
    return "saudavel";
  };

  const upper = Array.from({ length: 16 }, () => "saudavel");
  const lower = Array.from({ length: 16 }, () => "saudavel");
  for (const entry of input.odontogram) {
    const n = Number(entry.tooth);
    if (!Number.isFinite(n)) continue;
    const mapped = mapTooth(entry.status);
    if (n >= 11 && n <= 28) {
      const idx = Math.min(15, Math.max(0, n - 11));
      upper[idx] = mapped;
    } else if (n >= 31 && n <= 48) {
      const idx = Math.min(15, Math.max(0, n - 31));
      lower[idx] = mapped;
    } else if (n >= 1 && n <= 16) {
      upper[n - 1] = mapped;
    } else if (n >= 17 && n <= 32) {
      lower[n - 17] = mapped;
    }
  }

  const openReceivables = input.receivables
    .filter(isOpenReceivable)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 8)
    .map((r) => {
      const patient = r.patient?.name || r.description || "Sem paciente";
      const overdue = r.dueDate < todayStart;
      return {
        id: r.id,
        patient,
        initials: initialsFromName(patient),
        date: r.dueDate.toLocaleDateString("pt-BR"),
        amount: money(r.amount),
        status: (overdue ? "atrasado" : "a_vencer") as "atrasado" | "a_vencer",
      };
    });

  const despesasMes = sumPaidPayables(input.payables, monthStart, monthEnd);
  const lucro = recebimentosMes - despesasMes;
  const margem = recebimentosMes > 0 ? (lucro / recebimentosMes) * 100 : 0;

  const billedByPro = new Map<string, { name: string; billed: number; commission: number }>();
  for (const c of input.commissions) {
    const cur = billedByPro.get(c.professionalId) || {
      name: c.professional.name,
      billed: 0,
      commission: 0,
    };
    cur.commission += c.amount;
    cur.billed += c.amount / Math.max(0.01, c.percent / 100 || 0.3);
    billedByPro.set(c.professionalId, cur);
  }
  const maxCommission = Math.max(
    1,
    ...[...billedByPro.values()].map((v) => v.commission)
  );
  const comissoes = [...billedByPro.entries()].map(([id, v]) => ({
    id,
    name: v.name,
    initials: initialsFromName(v.name),
    billed: money(v.billed),
    commission: money(v.commission),
    percent: Math.round((v.commission / maxCommission) * 100),
  }));

  const orcamentosPendentes = input.budgets.filter((b) =>
    ["enviado", "rascunho"].includes(b.status)
  ).length;
  const vencidos = input.receivables.filter(
    (r) => isOpenReceivable(r) && r.dueDate < todayStart
  ).length;
  const agendaPendentes = input.appointments.filter(
    (a) =>
      a.startsAt >= todayStart &&
      ["aguardando", "pendente", "agendado"].includes(a.status)
  ).length;

  const alertas: DashboardData["alertas"] = [];
  if (orcamentosPendentes)
    alertas.push({
      id: "orc",
      text: `${orcamentosPendentes} orçamento(s) aguardando aprovação`,
      tone: "blue",
    });
  if (vencidos)
    alertas.push({
      id: "venc",
      text: `${vencidos} pagamento(s) vencido(s)`,
      tone: "red",
    });
  if (agendaPendentes)
    alertas.push({
      id: "conf",
      text: `${agendaPendentes} confirmação(ões) de consulta pendente(s)`,
      tone: "purple",
    });

  const atividades: DashboardData["atividades"] = [];
  for (const p of [...input.patients]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3)) {
    atividades.push({
      id: `p-${p.id}`,
      text: `Novo paciente cadastrado: ${p.name}`,
      time: relativeTime(p.createdAt, now),
      type: "paciente",
    });
  }
  for (const a of [...input.appointments]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3)) {
    atividades.push({
      id: `a-${a.id}`,
      text: `Consulta ${a.status} — ${a.patient.name}`,
      time: relativeTime(a.createdAt, now),
      type: "agenda",
    });
  }
  for (const r of [...input.receivables]
    .filter((x) => isPaidReceivable(x))
    .sort(
      (a, b) =>
        (b.paidAt || b.createdAt).getTime() - (a.paidAt || a.createdAt).getTime()
    )
    .slice(0, 3)) {
    atividades.push({
      id: `r-${r.id}`,
      text: `Recebimento de ${money(r.amount)}${r.patient ? ` — ${r.patient.name}` : ""}`,
      time: relativeTime(r.paidAt || r.createdAt, now),
      type: "financeiro",
    });
  }
  atividades.sort((a, b) => {
    // keep relative order approx by pushing newest first already; trim
    return 0;
  });

  return {
    periodLabel: monthLabelPt(now).replace(/^\w/, (c) => c.toUpperCase()),
    kpis: [
      {
        id: "faturamento",
        label: "Faturamento (mês)",
        value: money(fatMes),
        growth: growthPct(fatMes, fatPrev),
        tone: "blue",
        sparkline: sparkFromMonths(sparkFat),
      },
      {
        id: "recebimentos",
        label: "Recebimentos (mês)",
        value: money(recebimentosMes),
        growth: growthPct(recebimentosMes, recebimentosPrev),
        tone: "green",
        sparkline: sparkFromMonths(sparkRec),
      },
      {
        id: "consultas",
        label: "Consultas (mês)",
        value: String(consultasMes),
        growth: growthPct(consultasMes, consultasPrev),
        tone: "purple",
        sparkline: sparkFromMonths(sparkCon),
      },
      {
        id: "pacientes",
        label: "Novos pacientes",
        value: String(novosMes),
        growth: growthPct(novosMes, novosPrev),
        tone: "orange",
        sparkline: sparkFromMonths(sparkPac),
      },
    ],
    agendaHoje,
    faturamento6Meses,
    procedimentos,
    procedimentosTotal: procTotal,
    odontoStats: [
      { label: "Dentes tratados", value: tratados },
      { label: "Tratamentos ativos", value: ativos },
      { label: "Tratamentos concluídos", value: concluidos },
      { label: "Pendências", value: pendentes },
    ],
    odontogramUpper: upper,
    odontogramLower: lower,
    contasReceber: openReceivables,
    resumoFinanceiro: {
      receitas: money(recebimentosMes),
      despesas: money(despesasMes),
      lucroLiquido: money(lucro),
      margem: `${margem.toFixed(1).replace(".", ",")}%`,
    },
    comissoes,
    alertas,
    atividades: atividades.slice(0, 8),
  };
}

export { isPaidReceivable, isOpenReceivable, isPaidPayable, sumPaidReceivables, sumPaidPayables };
