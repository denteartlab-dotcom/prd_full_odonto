import type { PaymentMethodType } from "./budget-types";

export type ChargeStatus = "pendente" | "pago" | "vencido" | "agendado" | "cancelado";

export type FinancialTimelineType =
  | "orcamento_criado"
  | "orcamento_aprovado"
  | "cobranca_criada"
  | "pix_emitido"
  | "boleto_emitido"
  | "pagamento_recebido"
  | "recibo_emitido"
  | "cobranca_cancelada";

export type FinancialTimelineEvent = {
  id: string;
  type: FinancialTimelineType;
  date: string;
  user: string;
  note?: string;
  budgetId?: string;
  chargeId?: string;
};

export type FinancialCharge = {
  id: string;
  title: string;
  budgetId: string;
  budgetNumber: string;
  procedure: string;
  dentist: string;
  dueDate: string;
  amount: number;
  installmentNumber: number;
  installmentTotal: number;
  status: ChargeStatus;
  paymentMethod: PaymentMethodType;
  notes?: string;
  history: FinancialTimelineEvent[];
  createdAt: string;
};

export type FinancialPayment = {
  id: string;
  chargeId?: string;
  budgetId?: string;
  budgetNumber?: string;
  description: string;
  amount: number;
  date: string;
  method: PaymentMethodType;
  user: string;
  receiptUrl?: string;
};

export type PatientFinancialData = {
  charges: FinancialCharge[];
  payments: FinancialPayment[];
  timeline: FinancialTimelineEvent[];
};

export type FinancialKpiSummary = {
  totalReceivable: number;
  openChargesCount: number;
  overdueAmount: number;
  overdueCount: number;
  totalReceived: number;
  nextInstallment?: {
    date: string;
    amount: number;
    procedure: string;
    title: string;
  };
  approvedBudgetsTotal: number;
  approvedBudgetsCount: number;
  receivedPercent: number;
  receivablePercent: number;
  situation: {
    upcoming: number;
    overdue: number;
    paid: number;
    cancelled: number;
    scheduled: number;
  };
};

export const CHARGE_STATUS_LABELS: Record<ChargeStatus, string> = {
  pendente: "Pendente",
  pago: "Pago",
  vencido: "Vencido",
  agendado: "Agendado",
  cancelado: "Cancelado",
};

export const TIMELINE_LABELS: Record<FinancialTimelineType, string> = {
  orcamento_criado: "Orçamento criado",
  orcamento_aprovado: "Orçamento aprovado",
  cobranca_criada: "Cobrança criada",
  pix_emitido: "PIX emitido",
  boleto_emitido: "Boleto emitido",
  pagamento_recebido: "Pagamento recebido",
  recibo_emitido: "Recibo emitido",
  cobranca_cancelada: "Cobrança cancelada",
};
