export type DashboardKpi = {
  id: string;
  label: string;
  value: string;
  growth: number;
  tone: "blue" | "green" | "purple" | "orange";
  sparkline: number[];
};

export type DashboardAgendaItem = {
  id: string;
  time: string;
  patient: string;
  initials: string;
  procedure: string;
  status: "confirmado" | "em_andamento" | "pendente";
};

export type DashboardReceivableItem = {
  id: string;
  patient: string;
  initials: string;
  date: string;
  amount: string;
  status: "a_vencer" | "atrasado";
};

export type DashboardData = {
  periodLabel: string;
  kpis: DashboardKpi[];
  agendaHoje: DashboardAgendaItem[];
  faturamento6Meses: { month: string; value: number }[];
  procedimentos: { name: string; percent: number; color: string }[];
  procedimentosTotal: number;
  odontoStats: { label: string; value: number }[];
  odontogramUpper: string[];
  odontogramLower: string[];
  contasReceber: DashboardReceivableItem[];
  resumoFinanceiro: {
    receitas: string;
    despesas: string;
    lucroLiquido: string;
    margem: string;
  };
  comissoes: {
    id: string;
    name: string;
    initials: string;
    billed: string;
    commission: string;
    percent: number;
  }[];
  alertas: {
    id: string;
    text: string;
    tone: "blue" | "red" | "orange" | "purple";
  }[];
  atividades: {
    id: string;
    text: string;
    time: string;
    type: string;
  }[];
};

export function emptyDashboard(now = new Date()): DashboardData {
  const periodLabel = now
    .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    .replace(/^\w/, (c) => c.toUpperCase());
  const zeros = [0, 0, 0, 0, 0, 0];
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const raw = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  });

  return {
    periodLabel,
    kpis: [
      {
        id: "faturamento",
        label: "Faturamento (mês)",
        value: "R$ 0,00",
        growth: 0,
        tone: "blue",
        sparkline: zeros,
      },
      {
        id: "recebimentos",
        label: "Recebimentos (mês)",
        value: "R$ 0,00",
        growth: 0,
        tone: "green",
        sparkline: zeros,
      },
      {
        id: "consultas",
        label: "Consultas (mês)",
        value: "0",
        growth: 0,
        tone: "purple",
        sparkline: zeros,
      },
      {
        id: "pacientes",
        label: "Novos pacientes",
        value: "0",
        growth: 0,
        tone: "orange",
        sparkline: zeros,
      },
    ],
    agendaHoje: [],
    faturamento6Meses: months.map((month) => ({ month, value: 0 })),
    procedimentos: [],
    procedimentosTotal: 0,
    odontoStats: [
      { label: "Dentes tratados", value: 0 },
      { label: "Tratamentos ativos", value: 0 },
      { label: "Tratamentos concluídos", value: 0 },
      { label: "Pendências", value: 0 },
    ],
    odontogramUpper: Array.from({ length: 16 }, () => "saudavel"),
    odontogramLower: Array.from({ length: 16 }, () => "saudavel"),
    contasReceber: [],
    resumoFinanceiro: {
      receitas: "R$ 0,00",
      despesas: "R$ 0,00",
      lucroLiquido: "R$ 0,00",
      margem: "0,0%",
    },
    comissoes: [],
    alertas: [],
    atividades: [],
  };
}
