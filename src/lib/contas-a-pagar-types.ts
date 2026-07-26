export type PayableStatus =
  | "pago"
  | "em_aberto"
  | "parcial"
  | "vencido"
  | "cancelado"
  | "agendado";

export type PayablePeriod = "hoje" | "semana" | "mes" | "ano" | "personalizado";

export type PayableAccount = {
  id: string;
  dueDate: string; // ISO yyyy-mm-dd
  dueLabel: string;
  supplier: string;
  description: string;
  category: string;
  costCenter: string;
  bankAccount: string;
  paymentMethod: string;
  document: string;
  invoiceNumber: string;
  amount: number;
  paidAmount: number;
  balance: number;
  status: PayableStatus;
  responsible: string;
  notes: string;
  attachments: number;
};

export type PayableKpi = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  progress?: number;
  tone: "slate" | "green" | "amber" | "red" | "blue" | "violet";
};

export type PayableDayCell = {
  date: string;
  day: number;
  total: number;
  tone: "pago" | "hoje" | "proximo" | "atraso" | "neutro" | "vazio";
  count: number;
};

export type PayableAlert = {
  id: string;
  title: string;
  detail: string;
  priority: "alta" | "media" | "baixa";
};

export type PayableSummary = {
  totalAberto: number;
  totalPago: number;
  emAtraso: number;
  previsao: number;
  maiorFornecedor: string;
  categoriaTop: string;
  ultimosPagamentos: { id: string; label: string; amount: number; date: string }[];
};

export type ContasAPagarData = {
  kpis: PayableKpi[];
  accounts: PayableAccount[];
  calendar: PayableDayCell[];
  calendarMonthLabel: string;
  categoryShare: { name: string; percent: number; color: string }[];
  statusShare: { name: string; percent: number; color: string }[];
  outflowMonthly: { label: string; value: number }[];
  upcoming: { id: string; when: string; label: string; amount: number; count: number }[];
  alerts: PayableAlert[];
  summary: PayableSummary;
  filterOptions: {
    suppliers: string[];
    categories: string[];
    costCenters: string[];
    bankAccounts: string[];
    paymentMethods: string[];
    statuses: string[];
    responsibles: string[];
  };
};

export type NewPayableForm = {
  supplier: string;
  description: string;
  category: string;
  costCenter: string;
  invoiceNumber: string;
  document: string;
  bank: string;
  bankAccount: string;
  paymentMethod: string;
  amount: string;
  discount: string;
  interest: string;
  fine: string;
  competence: string;
  issueDate: string;
  dueDate: string;
  expectedPayDate: string;
  status: PayableStatus;
  responsible: string;
  notes: string;
  installment: boolean;
  installmentCount: string;
  installmentPeriod: "mensal" | "quinzenal" | "semanal";
  recurring: boolean;
  recurringPeriod: "semanal" | "mensal" | "bimestral" | "trimestral" | "semestral" | "anual";
  recurringEnd: string;
};

export type PaymentForm = {
  payDate: string;
  amount: string;
  discount: string;
  interest: string;
  fine: string;
  paymentMethod: string;
  bankAccount: string;
  notes: string;
};
