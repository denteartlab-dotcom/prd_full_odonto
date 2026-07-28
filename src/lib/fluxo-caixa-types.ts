export type CashPeriodPreset =
  | "hoje"
  | "semana"
  | "mes"
  | "ano"
  | "personalizado";

export type CashMovementType = "entrada" | "saida" | "transferencia";

export type CashMovementStatus =
  | "confirmado"
  | "pendente"
  | "cancelado"
  | "agendado"
  | "conciliado";

export type CashflowChartMode = "diario" | "semanal" | "mensal" | "anual";

export type CashKpi = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  delta?: number;
  sparkline?: number[];
  tone: "green" | "red" | "blue" | "amber" | "slate" | "violet";
};

export type CashflowSeriesPoint = {
  label: string;
  entradas: number;
  saidas: number;
  saldo: number;
};

export type CashBankAccount = {
  id: string;
  bank: string;
  account: string;
  balance: number;
  updatedAt: string;
};

export type CashAlert = {
  id: string;
  title: string;
  detail: string;
  priority: "alta" | "media" | "baixa";
};

export type CashMovementRow = {
  id: string;
  date: string;
  description: string;
  type: CashMovementType;
  category: string;
  bankAccount: string;
  paymentMethod: string;
  costCenter: string;
  patient: string;
  vendor: string;
  professional: string;
  document: string;
  income: number | null;
  expense: number | null;
  balance: number;
  status: CashMovementStatus;
  notes: string;
  attachments: number;
};

export type CashPeriodSummary = {
  saldoInicial: number;
  entradas: number;
  saidas: number;
  saldoPeriodo: number;
  saldoAtual: number;
};

export type CashProjectionPoint = {
  label: string;
  saldo: number;
};

export type CashMixShare = {
  name: string;
  percent: number;
  color: string;
};

export type NewCashMovementForm = {
  type: CashMovementType;
  description: string;
  category: string;
  costCenter: string;
  bankAccount: string;
  paymentMethod: string;
  patient: string;
  vendor: string;
  professional: string;
  document: string;
  amount: string;
  discount: string;
  interest: string;
  fine: string;
  competence: string;
  movementDate: string;
  dueDate: string;
  status: CashMovementStatus;
  notes: string;
};

export type TransferForm = {
  fromAccount: string;
  toAccount: string;
  amount: string;
  date: string;
  notes: string;
};

export type ReconciliationItem = {
  id: string;
  date: string;
  description: string;
  amount: number;
  matched: boolean;
};

export type FluxoCaixaData = {
  kpis: CashKpi[];
  seriesDaily: CashflowSeriesPoint[];
  seriesWeekly: CashflowSeriesPoint[];
  seriesMonthly: CashflowSeriesPoint[];
  seriesYearly: CashflowSeriesPoint[];
  movements: CashMovementRow[];
  summary: CashPeriodSummary;
  mix: CashMixShare[];
  bankAccounts: CashBankAccount[];
  projection: CashProjectionPoint[];
  alerts: CashAlert[];
  reconciliationSystem: ReconciliationItem[];
  reconciliationStatement: ReconciliationItem[];
  filterOptions: {
    categories: string[];
    bankAccounts: string[];
    costCenters: string[];
    paymentMethods: string[];
    professionals: string[];
    convenios: string[];
    statuses: string[];
    types: string[];
  };
};

export const emptyNewCashMovementForm = (): NewCashMovementForm => ({
  type: "entrada",
  description: "",
  category: "Procedimentos",
  costCenter: "Clínica",
  bankAccount: "Conta Corrente Principal",
  paymentMethod: "PIX",
  patient: "",
  vendor: "",
  professional: "",
  document: "",
  amount: "",
  discount: "0",
  interest: "0",
  fine: "0",
  competence: new Date().toISOString().slice(0, 7),
  movementDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date().toISOString().slice(0, 10),
  status: "confirmado",
  notes: "",
});

export const emptyTransferForm = (): TransferForm => ({
  fromAccount: "Conta Corrente Principal",
  toAccount: "Caixa Interno",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  notes: "",
});

export function emptyFluxoCaixaData(): FluxoCaixaData {
  return {
    kpis: [],
    seriesDaily: [],
    seriesWeekly: [],
    seriesMonthly: [],
    seriesYearly: [],
    movements: [],
    summary: {
      saldoInicial: 0,
      entradas: 0,
      saidas: 0,
      saldoPeriodo: 0,
      saldoAtual: 0,
    },
    mix: [],
    bankAccounts: [],
    projection: [],
    alerts: [],
    reconciliationSystem: [],
    reconciliationStatement: [],
    filterOptions: {
      categories: [],
      bankAccounts: [],
      costCenters: [],
      paymentMethods: [],
      professionals: [],
      convenios: [],
      statuses: [],
      types: [],
    },
  };
}
