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
  asaasPaymentId?: string | null;
  asaasBillingType?: string | null;
  asaasStatus?: string | null;
  asaasBankSlipUrl?: string | null;
  asaasInvoiceUrl?: string | null;
  asaasPixPayload?: string | null;
  asaasPixQrImage?: string | null;
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

export function emptyContasAReceberData(now = new Date()): ContasAReceberData {
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const todayIso = now.toISOString().slice(0, 10);
  return {
    kpis: [
      { id: "aberto", label: "Em aberto", value: "R$ 0,00", tone: "slate" },
      { id: "recebido", label: "Recebido no mês", value: "R$ 0,00", tone: "green" },
      { id: "previsto", label: "Previsto", value: "R$ 0,00", tone: "blue" },
      { id: "vencido", label: "Vencido", value: "R$ 0,00", tone: "red" },
    ],
    installments: [],
    calendar: Array.from({ length: days }, (_, i) => {
      const day = i + 1;
      const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return {
        date,
        day,
        total: 0,
        tone: date === todayIso ? ("hoje" as const) : ("neutro" as const),
        count: 0,
      };
    }),
    calendarMonthLabel: now.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    }),
    paymentShare: [],
    convenios: [],
    upcoming: [],
    alerts: [],
    goal: { current: 0, target: 1 },
    summary: {
      totalAberto: 0,
      totalRecebido: 0,
      previstos: 0,
      vencidos: 0,
      maiorPagador: "—",
      convenioTop: "—",
      procedimentoTop: "—",
      receitaMes: 0,
    },
    filterOptions: {
      statuses: ["Todos", "Pago", "Em Aberto", "Vencido", "Cancelado"],
      paymentMethods: ["Todas"],
      professionals: ["Todos"],
      convenios: ["Todos"],
      procedures: ["Todos"],
      categories: ["Todas"],
      responsibles: ["Todos"],
      bankAccounts: ["Todas"],
    },
  };
}
