"use client";

import { Save, X } from "lucide-react";
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
import { BudgetProcedureBuilder } from "./BudgetProcedureBuilder";
import { BUDGET_STATUS_LABELS, budgetStatusBadge, FieldLabel, SelectInput, TextInput } from "./shared";
import { TreatmentPlanAiAssistant } from "./TreatmentPlanAiAssistant";
import { BudgetHistoryTimeline, TreatmentTimeline } from "./TreatmentTimeline";

export function BudgetFormDrawer({
  budget,
  open,
  mode,
  onClose,
  onSave,
  onChange,
  onAddProcedure,
  onAddProcedures,
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
  onAddProcedures?: (items: BudgetProcedure[]) => void;
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
  const title =
    mode === "create"
      ? `Novo orçamento ${budget.number}`
      : mode === "edit"
        ? `Editar orçamento ${budget.number}`
        : `Visualizar orçamento ${budget.number}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Fechar"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="budget-modal-title"
        className="relative z-[110] flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <header className="relative shrink-0 border-b border-slate-200 bg-slate-50/80 px-5 py-3.5">
          <h2
            id="budget-modal-title"
            className="pr-10 text-center text-base font-semibold text-slate-800 sm:text-lg"
          >
            {title}
          </h2>
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
            <span
              className={cn(
                "hidden rounded-full px-2.5 py-0.5 text-[10px] font-semibold sm:inline-flex",
                budgetStatusBadge(budget.status)
              )}
            >
              {BUDGET_STATUS_LABELS[budget.status]}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            <div className="sm:col-span-2 lg:col-span-4">
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
            <BudgetProcedureBuilder
              onAdd={onAddProcedure}
              onUpdate={onUpdateProcedure}
              onRemove={onRemoveProcedure}
              existingProcedures={budget.procedures}
            />
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

          <TreatmentPlanAiAssistant
            editable={editable}
            dentist={budget.dentist}
            onApplyProcedures={(items) => {
              if (onAddProcedures) {
                onAddProcedures(items);
                return;
              }
              for (const item of items) onAddProcedure(item);
            }}
          />

          <TreatmentTimeline
            steps={budget.treatmentPlan}
            editable={editable}
            onReorder={(treatmentPlan) => onChange({ treatmentPlan })}
          />

          <BudgetDocuments
            documents={budget.documents}
            editable={editable}
            onAdd={onAddDocument}
          />

          <BudgetSignature
            signature={budget.signature}
            editable={editable}
            onChange={onSignatureChange}
          />

          {mode === "view" && (
            <BudgetHistoryTimeline events={budget.history} />
          )}
        </div>

        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/60 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[11px] text-slate-400">
            {!editable
              ? `Forma de pagamento: ${PAYMENT_METHOD_LABELS[budget.paymentMethod]} · Validade: ${formatDisplayDate(budget.validityDate)} · v${budget.version}`
              : `Total: ${budget.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
            >
              Fechar / Cancelar
            </button>
            {editable ? (
              <button
                type="button"
                onClick={onSave}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                <Save className="h-4 w-4" />
                {mode === "create" ? "Gravar orçamento" : "Gravar alterações"}
              </button>
            ) : null}
          </div>
        </footer>
      </div>
    </div>
  );
}
