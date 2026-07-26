export type FinancePeriodPreset =
  | "hoje"
  | "semana"
  | "mes"
  | "ano"
  | "personalizado";

export type FinanceStatus =
  | "pago"
  | "pendente"
  | "a_vencer"
  | "em_atraso"
  | "cancelado";

export type FinanceKpi = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  delta?: number;
  sparkline?: number[];
  tone: "green" | "red" | "blue" | "amber" | "slate" | "violet";
};

export type CashflowPoint = {
  label: string;
  receitas: number;
  despesas: number;
  lucro: number;
};

export type PaymentMethodShare = {
  name: string;
  percent: number;
  color: string;
};

export type BankAccountBalance = {
  id: string;
  bank: string;
  account: string;
  balance: number;
  updatedAt: string;
};

export type RecentReceipt = {
  id: string;
  patient: string;
  procedure: string;
  professional: string;
  paymentMethod: string;
  date: string;
  amount: number;
  status: FinanceStatus;
};

export type ReceivableRow = {
  id: string;
  patient: string;
  document: string;
  dueDate: string;
  amount: number;
  status: FinanceStatus;
  daysOverdue: number;
};

export type PayableRow = {
  id: string;
  vendor: string;
  category: string;
  dueDate: string;
  amount: number;
  account: string;
  status: FinanceStatus;
};

export type ConvenioReceivable = {
  id: string;
  name: string;
  amount: number;
  guides: number;
  nextPayment: string;
};

export type FinanceAlert = {
  id: string;
  title: string;
  detail: string;
  priority: "alta" | "media" | "baixa";
};

export type UpcomingDue = {
  id: string;
  when: "hoje" | "amanha" | "semana";
  label: string;
  amount: number;
};

export type FinanceMovement = {
  id: string;
  date: string;
  patient: string;
  description: string;
  category: string;
  professional: string;
  costCenter: string;
  paymentMethod: string;
  bankAccount: string;
  income: number | null;
  expense: number | null;
  balance: number;
  status: FinanceStatus;
  notes: string;
};

export type FinanceSummary = {
  saldoTotal: number;
  receitas: number;
  despesas: number;
  lucro: number;
  ticketMedio: number;
  faturamentoDiario: number;
  faturamentoMensal: number;
  faturamentoAnual: number;
  pacientesPagantes: number;
  convenios: number;
  receitasPrevistas: number;
  despesasPrevistas: number;
};

export type FinanceiroGeralData = {
  kpis: FinanceKpi[];
  cashflowDaily: CashflowPoint[];
  cashflowWeekly: CashflowPoint[];
  cashflowMonthly: CashflowPoint[];
  cashflowYearly: CashflowPoint[];
  incomeExpenseBars: { label: string; receitas: number; despesas: number }[];
  bankAccounts: BankAccountBalance[];
  paymentMethods: PaymentMethodShare[];
  recentReceipts: RecentReceipt[];
  receivables: ReceivableRow[];
  payables: PayableRow[];
  convenios: ConvenioReceivable[];
  upcoming: UpcomingDue[];
  alerts: FinanceAlert[];
  goal: { current: number; target: number };
  movements: FinanceMovement[];
  summary: FinanceSummary;
  filterOptions: {
    professionals: string[];
    convenios: string[];
    paymentMethods: string[];
    bankAccounts: string[];
    costCenters: string[];
    categories: string[];
    statuses: string[];
  };
};

export function emptyFinanceiroGeralData(): FinanceiroGeralData {
  return {
    kpis: [
      { id: "saldo", label: "Saldo do mês", value: "R$ 0,00", tone: "green", sparkline: [0, 0, 0, 0, 0, 0] },
      { id: "receitas", label: "Receitas (mês)", value: "R$ 0,00", tone: "green", sparkline: [0, 0, 0, 0, 0, 0] },
      { id: "despesas", label: "Despesas (mês)", value: "R$ 0,00", tone: "red", sparkline: [0, 0, 0, 0, 0, 0] },
      { id: "a_receber", label: "A receber", value: "R$ 0,00", tone: "blue" },
      { id: "a_pagar", label: "A pagar", value: "R$ 0,00", tone: "amber" },
      { id: "ano", label: "Faturamento anual", value: "R$ 0,00", tone: "violet" },
    ],
    cashflowDaily: [],
    cashflowWeekly: [],
    cashflowMonthly: [],
    cashflowYearly: [],
    incomeExpenseBars: [],
    bankAccounts: [],
    paymentMethods: [],
    recentReceipts: [],
    receivables: [],
    payables: [],
    convenios: [],
    upcoming: [],
    alerts: [],
    goal: { current: 0, target: 1 },
    movements: [],
    summary: {
      saldoTotal: 0,
      receitas: 0,
      despesas: 0,
      lucro: 0,
      ticketMedio: 0,
      faturamentoDiario: 0,
      faturamentoMensal: 0,
      faturamentoAnual: 0,
      pacientesPagantes: 0,
      convenios: 0,
      receitasPrevistas: 0,
      despesasPrevistas: 0,
    },
    filterOptions: {
      professionals: ["Todos"],
      convenios: ["Todos"],
      paymentMethods: ["Todos"],
      bankAccounts: ["Todas"],
      costCenters: ["Todos"],
      categories: ["Todas"],
      statuses: ["Todos"],
    },
  };
}
