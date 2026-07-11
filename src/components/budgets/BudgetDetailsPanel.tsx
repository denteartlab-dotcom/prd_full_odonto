"use client";

import { cn } from "@/lib/utils";
import type { DentalBudget } from "@/lib/budget-types";
import { PAYMENT_METHOD_LABELS } from "@/lib/budget-mock";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import { BudgetDocuments } from "./BudgetDocuments";
import { BudgetProceduresTable } from "./BudgetProceduresTable";
import { BudgetSignature } from "./BudgetSignature";
import { BudgetTotals } from "./BudgetTotals";
import { InstallmentCalculator } from "./InstallmentCalculator";
import { PaymentMethodsCard } from "./PaymentMethodsCard";
import { BUDGET_STATUS_LABELS, budgetStatusBadge, SectionCard } from "./shared";
import { BudgetHistoryTimeline, TreatmentTimeline } from "./TreatmentTimeline";

export function BudgetDetailsPanel({ budget }: { budget: DentalBudget }) {
  return (
    <div className="space-y-5">
      <SectionCard title={`Orçamento ${budget.number}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                budgetStatusBadge(budget.status)
              )}
            >
              {BUDGET_STATUS_LABELS[budget.status]}
            </span>
            <div className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
              <Meta label="Data" value={formatDisplayDate(budget.date)} />
              <Meta label="Validade" value={formatDisplayDate(budget.validityDate)} />
              <Meta label="Dentista" value={budget.dentist} />
              <Meta label="Pagamento" value={PAYMENT_METHOD_LABELS[budget.paymentMethod]} />
            </div>
            {budget.notes && (
              <p className="mt-3 text-sm text-slate-600">{budget.notes}</p>
            )}
          </div>
        </div>
      </SectionCard>

      <BudgetProceduresTable procedures={budget.procedures} />

      <div className="grid gap-5 xl:grid-cols-2">
        <BudgetTotals budget={budget} />
        <InstallmentCalculator
          installment={budget.installment}
          total={budget.total - budget.downPayment}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <PaymentMethodsCard selected={budget.paymentMethod} />
        <BudgetSignature signature={budget.signature} />
      </div>

      <TreatmentTimeline steps={budget.treatmentPlan} />

      <div className="grid gap-5 xl:grid-cols-2">
        <BudgetDocuments documents={budget.documents} />
        <BudgetHistoryTimeline events={budget.history} />
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
