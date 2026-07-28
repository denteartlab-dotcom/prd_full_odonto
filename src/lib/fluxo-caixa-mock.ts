import type {
  CashMovementRow,
  CashflowSeriesPoint,
  FluxoCaixaData,
} from "./fluxo-caixa-types";

function money(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function buildRunningBalance(rows: Omit<CashMovementRow, "balance">[]): CashMovementRow[] {
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
  let balance = 42850;
  return sorted.map((row) => {
    balance += (row.income || 0) - (row.expense || 0);
    return { ...row, balance };
  });
}

const rawMovements: Omit<CashMovementRow, "balance">[] = [
  {
    id: "m1",
    date: isoDaysAgo(0),
    description: "Recebimento limpeza + profilaxia",
    type: "entrada",
    category: "Procedimentos",
    bankAccount: "Conta Corrente Principal",
    paymentMethod: "PIX",
    costCenter: "Clínica",
    patient: "Maria Silva",
    vendor: "",
    professional: "Dra. Ana Silva",
    document: "REC-2026-0841",
    income: 580,
    expense: null,
    status: "confirmado",
    notes: "Recebido via integração PIX",
    attachments: 1,
  },
  {
    id: "m2",
    date: isoDaysAgo(0),
    description: "Compra de resina A2",
    type: "saida",
    category: "Materiais",
    bankAccount: "Conta Corrente Principal",
    paymentMethod: "Cartão",
    costCenter: "Estoque",
    patient: "",
    vendor: "Dental Supply Ltda",
    professional: "",
    document: "NF-5521",
    income: null,
    expense: 420,
    status: "confirmado",
    notes: "",
    attachments: 2,
  },
  {
    id: "m3",
    date: isoDaysAgo(1),
    description: "Parcela implante unitário",
    type: "entrada",
    category: "Procedimentos",
    bankAccount: "Conta Corrente Principal",
    paymentMethod: "Cartão",
    costCenter: "Clínica",
    patient: "João Pedro Santos",
    vendor: "",
    professional: "Dr. Rafael Lima",
    document: "ORC-331",
    income: 1250,
    expense: null,
    status: "confirmado",
    notes: "Parcela 2/6",
    attachments: 0,
  },
  {
    id: "m4",
    date: isoDaysAgo(1),
    description: "Aluguel consultório",
    type: "saida",
    category: "Infraestrutura",
    bankAccount: "Conta Corrente Principal",
    paymentMethod: "Transferência",
    costCenter: "Administrativo",
    patient: "",
    vendor: "Imobiliária Centro",
    professional: "",
    document: "BOL-7781",
    income: null,
    expense: 4500,
    status: "pendente",
    notes: "Vencimento amanhã",
    attachments: 1,
  },
  {
    id: "m5",
    date: isoDaysAgo(2),
    description: "Transferência para caixa interno",
    type: "transferencia",
    category: "Transferência",
    bankAccount: "Conta Corrente Principal",
    paymentMethod: "Transferência",
    costCenter: "Administrativo",
    patient: "",
    vendor: "",
    professional: "",
    document: "TRF-102",
    income: null,
    expense: 800,
    status: "conciliado",
    notes: "Sangria diária",
    attachments: 0,
  },
  {
    id: "m6",
    date: isoDaysAgo(2),
    description: "Entrada transferência caixa",
    type: "transferencia",
    category: "Transferência",
    bankAccount: "Caixa Interno",
    paymentMethod: "Transferência",
    costCenter: "Administrativo",
    patient: "",
    vendor: "",
    professional: "",
    document: "TRF-102",
    income: 800,
    expense: null,
    status: "conciliado",
    notes: "Contrapartida TRF-102",
    attachments: 0,
  },
  {
    id: "m7",
    date: isoDaysAgo(3),
    description: "Ortodontia mensalidade",
    type: "entrada",
    category: "Ortodontia",
    bankAccount: "Conta Corrente Principal",
    paymentMethod: "Boleto",
    costCenter: "Clínica",
    patient: "Ana Costa",
    vendor: "",
    professional: "Dra. Juliana Costa",
    document: "BOL-9102",
    income: 390,
    expense: null,
    status: "agendado",
    notes: "",
    attachments: 0,
  },
  {
    id: "m8",
    date: isoDaysAgo(4),
    description: "Energia elétrica",
    type: "saida",
    category: "Utilidades",
    bankAccount: "Conta Corrente Principal",
    paymentMethod: "Débito automático",
    costCenter: "Administrativo",
    patient: "",
    vendor: "Companhia Elétrica",
    professional: "",
    document: "NF-EL-44",
    income: null,
    expense: 980,
    status: "confirmado",
    notes: "",
    attachments: 1,
  },
  {
    id: "m9",
    date: isoDaysAgo(5),
    description: "Avaliação + radiografia",
    type: "entrada",
    category: "Consultas",
    bankAccount: "Caixa Interno",
    paymentMethod: "Dinheiro",
    costCenter: "Clínica",
    patient: "Carlos Mendes",
    vendor: "",
    professional: "Dr. Carlos Mendes",
    document: "REC-2026-0830",
    income: 280,
    expense: null,
    status: "confirmado",
    notes: "",
    attachments: 0,
  },
  {
    id: "m10",
    date: isoDaysAgo(6),
    description: "Comissão profissional",
    type: "saida",
    category: "Comissões",
    bankAccount: "Conta Corrente Principal",
    paymentMethod: "PIX",
    costCenter: "RH",
    patient: "",
    vendor: "Dr. Rafael Lima",
    professional: "Dr. Rafael Lima",
    document: "COM-19",
    income: null,
    expense: 1050,
    status: "confirmado",
    notes: "Comissão semana",
    attachments: 0,
  },
  {
    id: "m11",
    date: isoDaysAgo(8),
    description: "Convênio Uniodonto — lote",
    type: "entrada",
    category: "Convênios",
    bankAccount: "Conta Poupança Reserva",
    paymentMethod: "Transferência",
    costCenter: "Clínica",
    patient: "",
    vendor: "Uniodonto",
    professional: "",
    document: "CNV-220",
    income: 8420,
    expense: null,
    status: "confirmado",
    notes: "Lote julho",
    attachments: 3,
  },
  {
    id: "m12",
    date: isoDaysAgo(10),
    description: "Marketing digital",
    type: "saida",
    category: "Marketing",
    bankAccount: "Conta Corrente Principal",
    paymentMethod: "Cartão",
    costCenter: "Comercial",
    patient: "",
    vendor: "Agência Smile Ads",
    professional: "",
    document: "NF-ADS-12",
    income: null,
    expense: 1500,
    status: "cancelado",
    notes: "Campanha cancelada",
    attachments: 0,
  },
];

function seriesFrom(
  labels: string[],
  entradas: number[],
  saidas: number[]
): CashflowSeriesPoint[] {
  let saldo = 40000;
  return labels.map((label, i) => {
    saldo += entradas[i] - saidas[i];
    return { label, entradas: entradas[i], saidas: saidas[i], saldo };
  });
}

export function createFluxoCaixaMock(): FluxoCaixaData {
  const movements = buildRunningBalance(rawMovements).sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  const entradas = movements
    .filter((m) => m.status !== "cancelado")
    .reduce((s, m) => s + (m.income || 0), 0);
  const saidas = movements
    .filter((m) => m.status !== "cancelado")
    .reduce((s, m) => s + (m.expense || 0), 0);
  const saldoInicial = 42850;
  const saldoPeriodo = entradas - saidas;
  const saldoAtual = saldoInicial + saldoPeriodo;
  const previsao30 = saldoAtual + 12400 - 9800;

  return {
    kpis: [
      {
        id: "entradas",
        label: "Entradas do período",
        value: money(entradas),
        hint: "vs período anterior",
        delta: 12.4,
        sparkline: [4200, 5100, 4800, 6200, 5900, 7100, entradas],
        tone: "green",
      },
      {
        id: "saidas",
        label: "Saídas do período",
        value: money(saidas),
        hint: "vs período anterior",
        delta: -3.1,
        sparkline: [3800, 4100, 4500, 3900, 5200, 4800, saidas],
        tone: "red",
      },
      {
        id: "saldo-periodo",
        label: "Saldo do período",
        value: money(saldoPeriodo),
        hint: "Entradas − Saídas",
        delta: 8.2,
        sparkline: [800, 1200, 900, 1500, 1100, 1800, saldoPeriodo],
        tone: "blue",
      },
      {
        id: "saldo-inicial",
        label: "Saldo inicial",
        value: money(saldoInicial),
        hint: "Início do período",
        sparkline: [40000, 41000, 41500, 42000, 42500, 42800, saldoInicial],
        tone: "slate",
      },
      {
        id: "saldo-atual",
        label: "Saldo atual",
        value: money(saldoAtual),
        hint: "Disponível agora",
        delta: 5.6,
        sparkline: [42000, 43000, 42500, 44000, 45000, 45500, saldoAtual],
        tone: "violet",
      },
      {
        id: "previsao",
        label: "Previsão 30 dias",
        value: money(previsao30),
        hint: "Saldo projetado",
        delta: 4.1,
        sparkline: [saldoAtual, saldoAtual + 800, saldoAtual + 1500, previsao30],
        tone: "amber",
      },
    ],
    seriesDaily: seriesFrom(
      ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
      [2100, 1800, 3200, 2500, 4100, 900, 400],
      [1200, 800, 2100, 1500, 2800, 300, 100]
    ),
    seriesWeekly: seriesFrom(
      ["S1", "S2", "S3", "S4"],
      [9800, 11200, 10500, 12800],
      [7200, 8100, 7600, 9000]
    ),
    seriesMonthly: seriesFrom(
      ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"],
      [42000, 39000, 45000, 41000, 48000, 46000, 51000],
      [31000, 30000, 34000, 32000, 36000, 35000, 38000]
    ),
    seriesYearly: seriesFrom(
      ["2022", "2023", "2024", "2025", "2026"],
      [380000, 420000, 460000, 510000, 290000],
      [290000, 310000, 340000, 370000, 210000]
    ),
    movements,
    summary: {
      saldoInicial,
      entradas,
      saidas,
      saldoPeriodo,
      saldoAtual,
    },
    mix: [
      { name: "Entradas", percent: Math.round((entradas / (entradas + saidas || 1)) * 100), color: "#10b981" },
      { name: "Saídas", percent: Math.round((saidas / (entradas + saidas || 1)) * 100), color: "#f43f5e" },
    ],
    bankAccounts: [
      {
        id: "b1",
        bank: "Itaú",
        account: "Conta Corrente Principal",
        balance: 38240.5,
        updatedAt: isoDaysAgo(0),
      },
      {
        id: "b2",
        bank: "Caixa",
        account: "Caixa Interno",
        balance: 2450,
        updatedAt: isoDaysAgo(0),
      },
      {
        id: "b3",
        bank: "Nubank",
        account: "Conta Poupança Reserva",
        balance: 18420,
        updatedAt: isoDaysAgo(1),
      },
    ],
    projection: Array.from({ length: 8 }).map((_, i) => ({
      label: `D+${(i + 1) * 4}`,
      saldo: saldoAtual + (i + 1) * 420 - (i % 2 === 0 ? 280 : 650),
    })),
    alerts: [
      {
        id: "a1",
        title: "Movimentações pendentes",
        detail: "1 pagamento de aluguel aguardando confirmação.",
        priority: "alta",
      },
      {
        id: "a2",
        title: "Boletos a vencer",
        detail: "Ortodontia Ana Costa com boleto agendado.",
        priority: "media",
      },
      {
        id: "a3",
        title: "PIX pendentes",
        detail: "Nenhum PIX em aberto no momento.",
        priority: "baixa",
      },
      {
        id: "a4",
        title: "Despesas acima da média",
        detail: "Infraestrutura 18% acima da média dos últimos 3 meses.",
        priority: "media",
      },
      {
        id: "a5",
        title: "Receitas abaixo da meta",
        detail: "Meta mensal em 86% — faltam R$ 7.200.",
        priority: "media",
      },
    ],
    reconciliationSystem: movements.slice(0, 5).map((m) => ({
      id: `sys-${m.id}`,
      date: m.date,
      description: m.description,
      amount: (m.income || 0) - (m.expense || 0),
      matched: m.status === "conciliado",
    })),
    reconciliationStatement: [
      {
        id: "ext-1",
        date: isoDaysAgo(0),
        description: "PIX RECEBIDO MARIA SILVA",
        amount: 580,
        matched: true,
      },
      {
        id: "ext-2",
        date: isoDaysAgo(0),
        description: "COMPRA CARTÃO DENTAL SUPPLY",
        amount: -420,
        matched: true,
      },
      {
        id: "ext-3",
        date: isoDaysAgo(1),
        description: "TED RECEBIDA JOAO PEDRO",
        amount: 1250,
        matched: false,
      },
      {
        id: "ext-4",
        date: isoDaysAgo(2),
        description: "TARIFA PACOTE EMPRESARIAL",
        amount: -49.9,
        matched: false,
      },
    ],
    filterOptions: {
      categories: [
        "Procedimentos",
        "Materiais",
        "Infraestrutura",
        "Transferência",
        "Ortodontia",
        "Utilidades",
        "Consultas",
        "Comissões",
        "Convênios",
        "Marketing",
      ],
      bankAccounts: [
        "Conta Corrente Principal",
        "Caixa Interno",
        "Conta Poupança Reserva",
      ],
      costCenters: ["Clínica", "Estoque", "Administrativo", "RH", "Comercial"],
      paymentMethods: [
        "PIX",
        "Cartão",
        "Dinheiro",
        "Transferência",
        "Boleto",
        "Débito automático",
        "Cheque",
      ],
      professionals: [
        "Dra. Ana Silva",
        "Dr. Rafael Lima",
        "Dra. Juliana Costa",
        "Dr. Carlos Mendes",
      ],
      convenios: ["Particular", "Uniodonto", "OdontoPrev"],
      statuses: ["Confirmado", "Pendente", "Cancelado", "Agendado", "Conciliado"],
      types: ["Entrada", "Saída", "Transferência"],
    },
  };
}
