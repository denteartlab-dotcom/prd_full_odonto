import type { DentalBudget } from "./budget-types";

const PRINT_PREFIX = "odonto-budget-print:";

export type BudgetPrintPatient = {
  name: string;
  cpf: string;
  phone: string;
  email: string;
  insurance: string;
  financialResponsible: string;
  birthDate?: string;
};

export type BudgetPrintPayload = {
  budget: DentalBudget;
  patient: BudgetPrintPatient;
  clinicName?: string;
  savedAt: number;
};

export function stashBudgetForPrint(
  patientId: string,
  budget: DentalBudget,
  patient: BudgetPrintPatient,
  clinicName?: string
) {
  if (typeof window === "undefined") return;
  const payload: BudgetPrintPayload = { budget, patient, clinicName, savedAt: Date.now() };
  sessionStorage.setItem(`${PRINT_PREFIX}${patientId}`, JSON.stringify(payload));
}

export function loadBudgetPrint(patientId: string): BudgetPrintPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${PRINT_PREFIX}${patientId}`);
    if (!raw) return null;
    return JSON.parse(raw) as BudgetPrintPayload;
  } catch {
    return null;
  }
}

export function formatPrintDate(iso: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export function formatPrintDateTime(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPrintMoney(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function openBudgetPrintTab(patientId: string) {
  window.open(
    `/app/pacientes/${patientId}/orcamentos/imprimir`,
    "_blank",
    "noopener,noreferrer"
  );
}
