"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DentalBudget, InstallmentPlanType, PaymentMethodType } from "@/lib/budget-types";
import type { BudgetProcedure } from "@/lib/budget-types";
import { DENTISTS, PAYMENT_METHOD_LABELS } from "@/lib/budget-mock";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import { BudgetDocuments } from "./BudgetDocuments";
import { BudgetProceduresTable } from "./BudgetProceduresTable";
import { BudgetSignature } from "./BudgetSignature";
import { BudgetTotals } from "./BudgetTotals";
import { InstallmentCalculator } from "./InstallmentCalculator";
import { PaymentMethodsCard } from "./PaymentMethodsCard";
import { ProcedureCatalogList } from "./ProcedureSearch";
import { BUDGET_STATUS_LABELS, budgetStatusBadge, FieldLabel, SelectInput, TextInput } from "./shared";
import { BudgetHistoryTimeline, TreatmentTimeline } from "./TreatmentTimeline";

export function BudgetFormDrawer({
  budget,
  open,
  mode,
  onClose,
  onSave,
  onChange,
  onAddProcedure,
  onRemoveProcedure,
  onUpdateProcedure,
  onInstallmentChange,
  onPaymentChange,
  onSignatureChange,
  onAddDocument,
}: {
  budget: DentalBudget | null;
  open: boolean;
  mode: "create" | "edit" | "view";
  onClose: () => void;
  onSave: () => void;
  onChange: (patch: Partial<DentalBudget>) => void;
  onAddProcedure: (p: BudgetProcedure) => void;
  onRemoveProcedure: (id: string) => void;
  onUpdateProcedure: (id: string, patch: Partial<BudgetProcedure>) => void;
  onInstallmentChange: (
    type: InstallmentPlanType,
    custom?: { installments: number; interestRate: number }
  ) => void;
  onPaymentChange: (method: PaymentMethodType) => void;
  onSignatureChange: (patch: Partial<DentalBudget["signature"]>) => void;
  onAddDocument: () => void;
}) {
  if (!open || !budget) return null;

  const editable = mode !== "view";

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed inset-y-0 right-0 z-[110] flex w-full max-w-3xl flex-col border-l border-slate-200 bg-white shadow-2xl">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-xs font-medium text-slate-400">
              {mode === "create" ? "Novo orçamento" : mode === "edit" ? "Editar orçamento" : "Visualizar orçamento"}
            </p>
            <h2 className="text-lg font-bold text-slate-900">{budget.number}</h2>
            <span
              className={cn(
                "mt-1 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                budgetStatusBadge(budget.status)
              )}
            >
              {BUDGET_STATUS_LABELS[budget.status]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {editable && (
              <button
                type="button"
                onClick={onSave}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Salvar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <section className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Número</FieldLabel>
              <TextInput value={budget.number} disabled />
            </div>
            <div>
              <FieldLabel>Data</FieldLabel>
              <TextInput
                type="date"
                value={budget.date}
                disabled={!editable}
                onChange={(v) => onChange({ date: v })}
              />
            </div>
            <div>
              <FieldLabel>Dentista</FieldLabel>
              {editable ? (
                <SelectInput
                  value={budget.dentist}
                  onChange={(v) => onChange({ dentist: v })}
                  options={DENTISTS.map((d) => ({ value: d.name, label: d.name }))}
                />
              ) : (
                <TextInput value={budget.dentist} disabled />
              )}
            </div>
            <div>
              <FieldLabel>Validade</FieldLabel>
              <TextInput
                type="date"
                value={budget.validityDate}
                disabled={!editable}
                onChange={(v) => onChange({ validityDate: v })}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Observações</FieldLabel>
              <textarea
                value={budget.notes}
                onChange={(e) => editable && onChange({ notes: e.target.value })}
                disabled={!editable}
                rows={2}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15 disabled:bg-slate-50"
              />
            </div>
          </section>

          {editable && (
            <ProcedureCatalogList onSelect={onAddProcedure} />
          )}

          <BudgetProceduresTable
            procedures={budget.procedures}
            editable={editable}
            onChange={onUpdateProcedure}
            onAdd={onAddProcedure}
            onRemove={onRemoveProcedure}
          />

          <div className="grid gap-5 lg:grid-cols-2">
            <BudgetTotals budget={budget} editable={editable} onChange={onChange} />
            <InstallmentCalculator
              installment={budget.installment}
              total={budget.total - budget.downPayment}
              editable={editable}
              onChange={onInstallmentChange}
            />
          </div>

          <PaymentMethodsCard
            selected={budget.paymentMethod}
            editable={editable}
            onChange={onPaymentChange}
          />

          <TreatmentTimeline steps={budget.treatmentPlan} />

          <BudgetDocuments documents={budget.documents} editable={editable} onAdd={onAddDocument} />

          <BudgetSignature
            signature={budget.signature}
            editable={editable}
            onChange={onSignatureChange}
          />

          {mode === "view" && <BudgetHistoryTimeline events={budget.history} />}
        </div>

        {!editable && (
          <footer className="shrink-0 border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
            Forma de pagamento: {PAYMENT_METHOD_LABELS[budget.paymentMethod]} · Validade:{" "}
            {formatDisplayDate(budget.validityDate)} · v{budget.version}
          </footer>
        )}
      </aside>
    </>
  );
}
