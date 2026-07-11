"use client";

import { cn, money } from "@/lib/utils";
import type { BudgetInstallmentPlan, InstallmentPlanType } from "@/lib/budget-types";
import { INSTALLMENT_OPTIONS } from "@/lib/budget-mock";
import { FieldLabel, SectionCard, TextInput } from "./shared";

export function InstallmentCalculator({
  installment,
  total,
  editable,
  onChange,
}: {
  installment: BudgetInstallmentPlan;
  total: number;
  editable?: boolean;
  onChange?: (type: InstallmentPlanType, custom?: { installments: number; interestRate: number }) => void;
}) {
  const isCustom = installment.type === "custom";

  return (
    <SectionCard title="Parcelamento">
      {editable && onChange ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {INSTALLMENT_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => onChange(opt.type)}
              className={cn(
                "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                installment.type === opt.type
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="mb-4">
          <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            {INSTALLMENT_OPTIONS.find((o) => o.type === installment.type)?.label ?? installment.type}
          </span>
        </div>
      )}

      {editable && isCustom && onChange && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel>Parcelas</FieldLabel>
            <TextInput
              type="number"
              value={installment.installments}
              onChange={(v) =>
                onChange("custom", {
                  installments: Math.max(1, parseInt(v) || 1),
                  interestRate: installment.interestRate,
                })
              }
            />
          </div>
          <div>
            <FieldLabel>Juros (%)</FieldLabel>
            <TextInput
              type="number"
              value={installment.interestRate}
              onChange={(v) =>
                onChange("custom", {
                  installments: installment.installments,
                  interestRate: parseFloat(v) || 0,
                })
              }
            />
          </div>
        </div>
      )}

      <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-violet-50/50 p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Valor da parcela" value={money(installment.installmentValue)} large />
          <Stat label="Valor total" value={money(installment.totalWithInterest)} />
          <Stat
            label="Juros"
            value={installment.interestRate > 0 ? `${installment.interestRate}%` : "Sem juros"}
          />
        </div>
        {installment.installments > 1 && (
          <p className="mt-3 text-center text-sm text-indigo-700">
            {installment.installments}x de {money(installment.installmentValue)} — total{" "}
            {money(installment.totalWithInterest)}
          </p>
        )}
        {installment.installments === 1 && (
          <p className="mt-3 text-center text-sm text-indigo-700">
            Pagamento à vista: {money(total)}
          </p>
        )}
      </div>
    </SectionCard>
  );
}

function Stat({ label, value, large }: { label: string; value: string; large?: boolean }) {
  return (
    <div className="text-center">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={cn("mt-1 font-bold text-slate-900", large ? "text-xl" : "text-base")}>
        {value}
      </p>
    </div>
  );
}
