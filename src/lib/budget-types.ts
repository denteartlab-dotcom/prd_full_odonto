export type BudgetStatus =
  | "rascunho"
  | "enviado"
  | "aprovado"
  | "parcial"
  | "recusado"
  | "expirado";

export type InstallmentPlanType =
  | "avista"
  | "2x"
  | "3x"
  | "6x"
  | "12x"
  | "custom";

export type PaymentMethodType =
  | "pix"
  | "cartao"
  | "dinheiro"
  | "transferencia"
  | "boleto"
  | "asaas";

export type BudgetHistoryEventType =
  | "criado"
  | "editado"
  | "enviado"
  | "visualizado"
  | "aprovado"
  | "recusado";

export type BudgetDocumentType = "radiografia" | "foto" | "exame" | "pdf";

export type TreatmentStepStatus = "pendente" | "em_andamento" | "concluido";

export type ProcedureCatalogItem = {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  estimatedMinutes: number;
};

export type BudgetProcedure = {
  id: string;
  code: string;
  name: string;
  category: string;
  tooth?: string;
  face?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  finalValue: number;
  estimatedMinutes?: number;
};

export type BudgetInstallmentPlan = {
  type: InstallmentPlanType;
  installments: number;
  interestRate: number;
  installmentValue: number;
  totalWithInterest: number;
};

export type BudgetTreatmentStep = {
  id: string;
  order: number;
  title: string;
  status: TreatmentStepStatus;
  plannedDate?: string;
  professional: string;
};

export type BudgetHistoryEvent = {
  id: string;
  type: BudgetHistoryEventType;
  date: string;
  user: string;
  note?: string;
};

export type BudgetDocument = {
  id: string;
  name: string;
  type: BudgetDocumentType;
  date: string;
};

export type BudgetSignature = {
  agreed: boolean;
  signedAt?: string;
  signerName?: string;
};

export type DentalBudget = {
  id: string;
  number: string;
  date: string;
  validityDate: string;
  dentist: string;
  paymentMethod: PaymentMethodType;
  notes: string;
  status: BudgetStatus;
  procedures: BudgetProcedure[];
  subtotal: number;
  discounts: number;
  additions: number;
  total: number;
  downPayment: number;
  balance: number;
  paidAmount: number;
  installment: BudgetInstallmentPlan;
  treatmentPlan: BudgetTreatmentStep[];
  documents: BudgetDocument[];
  history: BudgetHistoryEvent[];
  signature: BudgetSignature;
  version: number;
  updatedAt: string;
};

export type BudgetFinancialSummary = {
  totalBudgeted: number;
  totalApproved: number;
  totalReceived: number;
  openBalance: number;
  lastBudgetNumber: string;
  lastBudgetDate: string;
  growthIndicators: {
    totalBudgeted: number;
    totalApproved: number;
    totalReceived: number;
    openBalance: number;
  };
  avgValidityDays: number;
  subtotal: number;
  discounts: number;
  additions: number;
  totalGeneral: number;
  downPayment: number;
  remainingBalance: number;
};
