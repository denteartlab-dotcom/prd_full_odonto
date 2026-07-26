export type ReceivableStatus =
  | "pago"
  | "parcial"
  | "em_aberto"
  | "vencido"
  | "cancelado"
  | "negociado";

export type ReceivablePeriod = "hoje" | "semana" | "mes" | "ano" | "personalizado";

export type ReceivableInstallment = {
  id: string;
  patient: string;
  cpf: string;
  phone: string;
  budgetNumber: string;
  procedure: string;
  professional: string;
  convenio: string;
  installment: number;
  totalInstallments: number;
  dueDate: string;
  dueLabel: string;
  amount: number;
  receivedAmount: number;
  balance: number;
  paymentMethod: string;
  bankAccount: string;
  status: ReceivableStatus;
  notes: string;
};

export type ReceivableKpi = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  delta?: number;
  tone: "slate" | "green" | "amber" | "red" | "blue" | "violet";
};

export type ReceivableDayCell = {
  date: string;
  day: number;
  total: number;
  tone: "pago" | "hoje" | "proximo" | "atraso" | "neutro" | "vazio";
  count: number;
};

export type ReceivableAlert = {
  id: string;
  title: string;
  detail: string;
  priority: "alta" | "media" | "baixa";
};

export type ContasAReceberData = {
  kpis: ReceivableKpi[];
  installments: ReceivableInstallment[];
  calendar: ReceivableDayCell[];
  calendarMonthLabel: string;
  paymentShare: { name: string; percent: number; color: string }[];
  convenios: {
    id: string;
    name: string;
    guides: number;
    forecast: number;
    received: number;
    balance: number;
  }[];
  upcoming: { id: string; when: string; label: string; amount: number; count: number }[];
  alerts: ReceivableAlert[];
  goal: { current: number; target: number };
  summary: {
    totalAberto: number;
    totalRecebido: number;
    previstos: number;
    vencidos: number;
    maiorPagador: string;
    convenioTop: string;
    procedimentoTop: string;
    receitaMes: number;
  };
  filterOptions: {
    statuses: string[];
    paymentMethods: string[];
    professionals: string[];
    convenios: string[];
    procedures: string[];
    categories: string[];
    responsibles: string[];
    bankAccounts: string[];
  };
};

export type NewReceiptForm = {
  patient: string;
  budgetNumber: string;
  procedure: string;
  professional: string;
  paymentMethod: string;
  bankAccount: string;
  amount: string;
  discount: string;
  interest: string;
  fine: string;
  receiptDate: string;
  competence: string;
  notes: string;
};

export type RegisterReceiptForm = {
  receiptDate: string;
  amount: string;
  paymentMethod: string;
  bankAccount: string;
  discount: string;
  interest: string;
  fine: string;
  notes: string;
};
