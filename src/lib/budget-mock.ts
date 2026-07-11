import type {
  BudgetFinancialSummary,
  BudgetInstallmentPlan,
  BudgetProcedure,
  DentalBudget,
  InstallmentPlanType,
  PaymentMethodType,
  ProcedureCatalogItem,
} from "./budget-types";

export const PROCEDURE_CATALOG: ProcedureCatalogItem[] = [
  { id: "proc-001", code: "8010", name: "Consulta inicial", category: "Diagnóstico", price: 150, estimatedMinutes: 30 },
  { id: "proc-002", code: "8100", name: "Radiografia periapical", category: "Radiologia", price: 80, estimatedMinutes: 15 },
  { id: "proc-003", code: "8200", name: "Radiografia panorâmica", category: "Radiologia", price: 180, estimatedMinutes: 20 },
  { id: "proc-004", code: "8300", name: "Limpeza dental (profilaxia)", category: "Preventivo", price: 220, estimatedMinutes: 45 },
  { id: "proc-005", code: "8400", name: "Restauração em resina", category: "Restaurador", price: 280, estimatedMinutes: 60 },
  { id: "proc-006", code: "8500", name: "Tratamento de canal", category: "Endodontia", price: 850, estimatedMinutes: 90 },
  { id: "proc-007", code: "8600", name: "Implante unitário", category: "Implantodontia", price: 3500, estimatedMinutes: 120 },
  { id: "proc-008", code: "8610", name: "Coroa em porcelana", category: "Prótese", price: 1800, estimatedMinutes: 90 },
  { id: "proc-009", code: "8700", name: "Clareamento dental", category: "Estética", price: 1200, estimatedMinutes: 60 },
  { id: "proc-010", code: "8800", name: "Extração simples", category: "Cirurgia", price: 350, estimatedMinutes: 45 },
  { id: "proc-011", code: "8810", name: "Extração de siso", category: "Cirurgia", price: 650, estimatedMinutes: 60 },
  { id: "proc-012", code: "8900", name: "Faceta em resina", category: "Estética", price: 950, estimatedMinutes: 75 },
  { id: "proc-013", code: "8910", name: "Prótese total superior", category: "Prótese", price: 2800, estimatedMinutes: 120 },
  { id: "proc-014", code: "8920", name: "Prótese parcial removível", category: "Prótese", price: 2200, estimatedMinutes: 90 },
  { id: "proc-015", code: "9000", name: "Aplicação de flúor", category: "Preventivo", price: 90, estimatedMinutes: 20 },
];

export const DENTISTS = [
  { id: "dent-001", name: "Dra. Ana Silva" },
  { id: "dent-002", name: "Dr. Carlos Mendes" },
  { id: "dent-003", name: "Dra. Fernanda Costa" },
];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  pix: "PIX",
  cartao: "Cartão",
  dinheiro: "Dinheiro",
  transferencia: "Transferência",
  boleto: "Boleto",
  asaas: "Asaas",
};

export const INSTALLMENT_OPTIONS: { type: InstallmentPlanType; label: string; installments: number; interestRate: number }[] = [
  { type: "avista", label: "À vista", installments: 1, interestRate: 0 },
  { type: "2x", label: "2x", installments: 2, interestRate: 0 },
  { type: "3x", label: "3x sem juros", installments: 3, interestRate: 0 },
  { type: "6x", label: "6x", installments: 6, interestRate: 1.5 },
  { type: "12x", label: "12x", installments: 12, interestRate: 2.5 },
  { type: "custom", label: "Personalizado", installments: 4, interestRate: 0 },
];

export function calcProcedureFinal(p: Pick<BudgetProcedure, "unitPrice" | "quantity" | "discount">): number {
  const base = p.unitPrice * p.quantity;
  return Math.max(0, base - p.discount);
}

export function calcInstallmentPlan(
  total: number,
  type: InstallmentPlanType,
  customInstallments?: number,
  customInterest?: number
): BudgetInstallmentPlan {
  const option = INSTALLMENT_OPTIONS.find((o) => o.type === type) ?? INSTALLMENT_OPTIONS[0];
  const installments = type === "custom" ? (customInstallments ?? 4) : option.installments;
  const interestRate = type === "custom" ? (customInterest ?? 0) : option.interestRate;
  const totalWithInterest = total * (1 + interestRate / 100);
  const installmentValue = totalWithInterest / installments;

  return {
    type,
    installments,
    interestRate,
    installmentValue: Math.round(installmentValue * 100) / 100,
    totalWithInterest: Math.round(totalWithInterest * 100) / 100,
  };
}

export function recalcBudget(budget: DentalBudget): DentalBudget {
  const procedures = budget.procedures.map((p) => ({
    ...p,
    finalValue: calcProcedureFinal(p),
  }));

  const subtotal = procedures.reduce((s, p) => s + p.unitPrice * p.quantity, 0);
  const discounts = procedures.reduce((s, p) => s + p.discount, 0);
  const total = Math.max(0, subtotal - discounts + budget.additions);
  const balance = Math.max(0, total - budget.downPayment - budget.paidAmount);
  const installment = calcInstallmentPlan(
    total - budget.downPayment,
    budget.installment.type,
    budget.installment.installments,
    budget.installment.interestRate
  );

  return {
    ...budget,
    procedures,
    subtotal,
    discounts,
    total,
    balance,
    installment,
    updatedAt: new Date().toISOString(),
  };
}

export function computeFinancialSummary(budgets: DentalBudget[]): BudgetFinancialSummary {
  const totalBudgeted = budgets.reduce((s, b) => s + b.total, 0);
  const approved = budgets.filter((b) => b.status === "aprovado" || b.status === "parcial");
  const totalApproved = approved.reduce((s, b) => s + b.total, 0);
  const totalReceived = budgets.reduce((s, b) => s + b.paidAmount, 0);
  const openBalance = budgets.reduce((s, b) => s + b.balance, 0);
  const subtotal = budgets.reduce((s, b) => s + b.subtotal, 0);
  const discounts = budgets.reduce((s, b) => s + b.discounts, 0);
  const additions = budgets.reduce((s, b) => s + b.additions, 0);
  const downPayment = budgets.reduce((s, b) => s + b.downPayment, 0);
  const sorted = [...budgets].sort((a, b) => b.date.localeCompare(a.date));
  const last = sorted[0];

  let avgValidityDays = 0;
  if (budgets.length > 0) {
    const totalDays = budgets.reduce((s, b) => {
      const start = new Date(b.date + "T12:00:00");
      const end = new Date(b.validityDate + "T12:00:00");
      return s + Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000));
    }, 0);
    avgValidityDays = Math.round(totalDays / budgets.length);
  }

  return {
    totalBudgeted,
    totalApproved,
    totalReceived,
    openBalance,
    lastBudgetNumber: last?.number ?? "—",
    lastBudgetDate: last?.date ?? "",
    growthIndicators: {
      totalBudgeted: 12.5,
      totalApproved: 8.3,
      totalReceived: 15.2,
      openBalance: -4.1,
    },
    avgValidityDays,
    subtotal,
    discounts,
    additions,
    totalGeneral: totalBudgeted,
    downPayment,
    remainingBalance: openBalance,
  };
}

export function getValidityInfo(validityDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const validity = new Date(validityDate + "T12:00:00");
  const diffDays = Math.ceil((validity.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return { label: "Vencido", expired: true, days: diffDays };
  if (diffDays === 0) return { label: "Vence hoje", expired: false, days: 0 };
  return { label: `${diffDays} dias restantes`, expired: false, days: diffDays };
}

export function patientSeedFromId(id: string) {
  return parseInt(id.replace(/\D/g, "") || "1", 10) || 1;
}

export function catalogToProcedure(item: ProcedureCatalogItem): BudgetProcedure {
  return {
    id: `bp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    code: item.code,
    name: item.name,
    category: item.category,
    quantity: 1,
    unitPrice: item.price,
    discount: 0,
    finalValue: item.price,
    estimatedMinutes: item.estimatedMinutes,
  };
}

export function createEmptyBudget(patientSeed: number, dentist = DENTISTS[0].name): DentalBudget {
  const now = new Date().toISOString().slice(0, 10);
  const validity = new Date();
  validity.setDate(validity.getDate() + 30);

  const budget: DentalBudget = {
    id: `db-${Date.now()}`,
    number: `#2026-${String(patientSeed * 10 + budgetsCount()).padStart(3, "0")}`,
    date: now,
    validityDate: validity.toISOString().slice(0, 10),
    dentist,
    paymentMethod: "pix",
    notes: "",
    status: "rascunho",
    procedures: [],
    subtotal: 0,
    discounts: 0,
    additions: 0,
    total: 0,
    downPayment: 0,
    balance: 0,
    paidAmount: 0,
    installment: calcInstallmentPlan(0, "avista"),
    treatmentPlan: [],
    documents: [],
    history: [
      {
        id: `bh-${Date.now()}`,
        type: "criado",
        date: new Date().toISOString(),
        user: dentist,
        note: "Orçamento criado",
      },
    ],
    signature: { agreed: false },
    version: 1,
    updatedAt: new Date().toISOString(),
  };

  return budget;
}

let _budgetCounter = 0;
function budgetsCount() {
  _budgetCounter += 1;
  return _budgetCounter;
}

export function duplicateBudget(budget: DentalBudget): DentalBudget {
  const copy: DentalBudget = {
    ...structuredClone(budget),
    id: `db-${Date.now()}`,
    number: `#2026-${String(Math.floor(Math.random() * 900) + 100)}`,
    date: new Date().toISOString().slice(0, 10),
    status: "rascunho",
    paidAmount: 0,
    version: 1,
    history: [
      {
        id: `bh-${Date.now()}`,
        type: "criado",
        date: new Date().toISOString(),
        user: budget.dentist,
        note: `Duplicado de ${budget.number}`,
      },
    ],
    signature: { agreed: false },
  };
  return recalcBudget(copy);
}

function makeProcedure(
  item: ProcedureCatalogItem,
  overrides?: Partial<BudgetProcedure>
): BudgetProcedure {
  const p: BudgetProcedure = {
    ...catalogToProcedure(item),
    ...overrides,
  };
  p.finalValue = calcProcedureFinal(p);
  return p;
}

export function createDefaultDentalBudgets(seed: number): DentalBudget[] {
  if (seed === 1) {
    const budget1: DentalBudget = {
      id: "db-001",
      number: "#2026-001",
      date: "2026-06-10",
      validityDate: "2026-07-10",
      dentist: "Dra. Ana Silva",
      paymentMethod: "pix",
      notes: "Plano de tratamento completo com implante e coroa. Validade de 30 dias.",
      status: "aprovado",
      procedures: [
        makeProcedure(PROCEDURE_CATALOG[6], { tooth: "26", quantity: 1, discount: 200 }),
        makeProcedure(PROCEDURE_CATALOG[7], { tooth: "26", quantity: 1, discount: 100 }),
        makeProcedure(PROCEDURE_CATALOG[1], { tooth: "26", quantity: 2 }),
        makeProcedure(PROCEDURE_CATALOG[3], { quantity: 1 }),
      ],
      subtotal: 0,
      discounts: 0,
      additions: 150,
      total: 0,
      downPayment: 1500,
      balance: 0,
      paidAmount: 1500,
      installment: calcInstallmentPlan(0, "3x"),
      treatmentPlan: [
        { id: "ts-1", order: 1, title: "Consulta inicial", status: "concluido", plannedDate: "2026-06-05", professional: "Dra. Ana Silva" },
        { id: "ts-2", order: 2, title: "Radiografia", status: "concluido", plannedDate: "2026-06-08", professional: "Dra. Ana Silva" },
        { id: "ts-3", order: 3, title: "Limpeza", status: "concluido", plannedDate: "2026-06-10", professional: "Dra. Ana Silva" },
        { id: "ts-4", order: 4, title: "Implante", status: "em_andamento", plannedDate: "2026-07-15", professional: "Dr. Carlos Mendes" },
        { id: "ts-5", order: 5, title: "Coroa", status: "pendente", plannedDate: "2026-09-01", professional: "Dra. Ana Silva" },
      ],
      documents: [
        { id: "bd-1", name: "Radiografia panorâmica", type: "radiografia", date: "2026-06-08" },
        { id: "bd-2", name: "Foto intraoral", type: "foto", date: "2026-06-08" },
        { id: "bd-3", name: "Exame de sangue", type: "exame", date: "2026-06-09" },
      ],
      history: [
        { id: "bh-1", type: "criado", date: "2026-06-10T09:00:00", user: "Dra. Ana Silva" },
        { id: "bh-2", type: "enviado", date: "2026-06-10T10:30:00", user: "Dra. Ana Silva", note: "Enviado por WhatsApp" },
        { id: "bh-3", type: "visualizado", date: "2026-06-10T14:15:00", user: "Paciente" },
        { id: "bh-4", type: "aprovado", date: "2026-06-11T11:00:00", user: "João Pedro Santos", note: "Assinatura digital" },
      ],
      signature: { agreed: true, signedAt: "2026-06-11T11:00:00", signerName: "João Pedro Santos" },
      version: 3,
      updatedAt: "2026-06-11T11:00:00",
    };

    const budget2: DentalBudget = {
      id: "db-002",
      number: "#2026-002",
      date: "2026-07-01",
      validityDate: "2026-07-31",
      dentist: "Dra. Ana Silva",
      paymentMethod: "cartao",
      notes: "Clareamento dental — aguardando aprovação do paciente.",
      status: "enviado",
      procedures: [
        makeProcedure(PROCEDURE_CATALOG[8], { quantity: 1 }),
        makeProcedure(PROCEDURE_CATALOG[3], { quantity: 1, discount: 20 }),
      ],
      subtotal: 0,
      discounts: 0,
      additions: 0,
      total: 0,
      downPayment: 0,
      balance: 0,
      paidAmount: 0,
      installment: calcInstallmentPlan(0, "2x"),
      treatmentPlan: [
        { id: "ts-6", order: 1, title: "Limpeza", status: "pendente", plannedDate: "2026-07-10", professional: "Dra. Ana Silva" },
        { id: "ts-7", order: 2, title: "Clareamento", status: "pendente", plannedDate: "2026-07-15", professional: "Dra. Ana Silva" },
      ],
      documents: [],
      history: [
        { id: "bh-5", type: "criado", date: "2026-07-01T08:00:00", user: "Dra. Ana Silva" },
        { id: "bh-6", type: "enviado", date: "2026-07-01T09:30:00", user: "Dra. Ana Silva", note: "Enviado por e-mail" },
      ],
      signature: { agreed: false },
      version: 1,
      updatedAt: "2026-07-01T09:30:00",
    };

    const budget3: DentalBudget = {
      id: "db-003",
      number: "#2026-003",
      date: "2026-05-15",
      validityDate: "2026-06-15",
      dentist: "Dr. Carlos Mendes",
      paymentMethod: "boleto",
      notes: "Restaurações múltiplas — recusado pelo paciente.",
      status: "recusado",
      procedures: [
        makeProcedure(PROCEDURE_CATALOG[4], { tooth: "16", face: "O", quantity: 1 }),
        makeProcedure(PROCEDURE_CATALOG[4], { tooth: "17", face: "MO", quantity: 1 }),
      ],
      subtotal: 0,
      discounts: 0,
      additions: 0,
      total: 0,
      downPayment: 0,
      balance: 0,
      paidAmount: 0,
      installment: calcInstallmentPlan(0, "avista"),
      treatmentPlan: [],
      documents: [],
      history: [
        { id: "bh-7", type: "criado", date: "2026-05-15T10:00:00", user: "Dr. Carlos Mendes" },
        { id: "bh-8", type: "enviado", date: "2026-05-15T11:00:00", user: "Dr. Carlos Mendes" },
        { id: "bh-9", type: "recusado", date: "2026-05-20T16:00:00", user: "João Pedro Santos", note: "Valor acima do esperado" },
      ],
      signature: { agreed: false },
      version: 1,
      updatedAt: "2026-05-20T16:00:00",
    };

    return [recalcBudget(budget1), recalcBudget(budget2), recalcBudget(budget3)];
  }

  const base = createEmptyBudget(seed);
  base.procedures = [makeProcedure(PROCEDURE_CATALOG[seed % PROCEDURE_CATALOG.length])];
  base.status = seed % 2 === 0 ? "enviado" : "rascunho";
  return [recalcBudget(base)];
}

export function dentalBudgetsToSimple(budgets: DentalBudget[]): import("./patient-profile-types").PatientBudget[] {
  return budgets.map((b) => ({
    id: b.id,
    number: b.number,
    procedure: b.procedures.map((p) => p.name).join(", ") || "Sem procedimentos",
    status: (b.status === "parcial" || b.status === "expirado"
      ? "enviado"
      : b.status) as import("./patient-profile-types").PatientBudget["status"],
    value: b.total,
    date: b.date,
  }));
}
