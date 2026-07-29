"use client";

import { money } from "@/lib/utils";
import type { DentalBudget } from "@/lib/budget-types";
import { FieldLabel, MoneyInput, SectionCard } from "./shared";

export function BudgetTotals({
  budget,
  editable,
  onChange,
}: {
  budget: DentalBudget;
  editable?: boolean;
  onChange?: (patch: Partial<DentalBudget>) => void;
}) {
  const rows = [
    { label: "Subtotal", value: budget.subtotal, highlight: false },
    { label: "Descontos", value: -budget.discounts, highlight: false, negative: true },
    { label: "Acréscimos", value: budget.additions, highlight: false },
    { label: "Total Geral", value: budget.total, highlight: true },
    { label: "Entrada", value: budget.downPayment, highlight: false },
    { label: "Saldo", value: budget.balance, highlight: true },
  ];

  return (
    <SectionCard title="Resumo financeiro">
      <div className="space-y-3">
        {editable && onChange && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel>Acréscimos (R$)</FieldLabel>
              <MoneyInput
                value={budget.additions}
                onChange={(v) => onChange({ additions: Math.max(0, v) })}
              />
            </div>
            <div>
              <FieldLabel>Entrada (R$)</FieldLabel>
              <MoneyInput
                value={budget.downPayment}
                onChange={(v) => onChange({ downPayment: Math.max(0, v) })}
              />
            </div>
          </div>
        )}

        <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/50">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between px-4 py-2.5"
            >
              <span
                className={
                  row.highlight
                    ? "text-sm font-semibold text-slate-900"
                    : "text-sm text-slate-600"
                }
              >
                {row.label}
              </span>
              <span
                className={
                  row.highlight
                    ? "text-base font-bold text-slate-900"
                    : row.negative
                      ? "text-sm font-medium text-red-600"
                      : "text-sm font-medium text-slate-800"
                }
              >
                {row.negative && row.value !== 0 ? "−" : ""}
                {money(Math.abs(row.value))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
