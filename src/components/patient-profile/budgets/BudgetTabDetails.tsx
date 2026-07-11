"use client";

import { cn, money } from "@/lib/utils";
import type { DentalBudget } from "@/lib/budget-types";
import { PAYMENT_METHOD_LABELS } from "@/lib/budget-mock";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import { BudgetHistoryTimeline } from "@/components/budgets/TreatmentTimeline";
import { InstallmentCalculator } from "@/components/budgets/InstallmentCalculator";
import { BudgetStatusBadge } from "./BudgetStatusBadge";

export function BudgetTabDetails({ budget }: { budget: DentalBudget | null }) {
  if (!budget) return null;

  return (
    <div className="mt-5 space-y-4">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Detalhes — {budget.number}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {formatDisplayDate(budget.date)} · {budget.dentist}
            </p>
          </div>
          <BudgetStatusBadge status={budget.status} />
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Meta label="Validade" value={formatDisplayDate(budget.validityDate)} />
          <Meta label="Pagamento" value={PAYMENT_METHOD_LABELS[budget.paymentMethod]} />
          <Meta label="Versão" value={`v${budget.version}`} />
          <Meta label="Total" value={money(budget.total)} highlight />
        </div>

        {budget.notes && (
          <p className="mb-4 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {budget.notes}
          </p>
        )}

        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Procedimentos
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[10px] uppercase text-slate-400">
                <th className="pb-2 pr-3 font-medium">Procedimento</th>
                <th className="pb-2 pr-3 font-medium">Dente</th>
                <th className="pb-2 pr-3 font-medium">Face</th>
                <th className="pb-2 pr-3 font-medium">Qtd</th>
                <th className="pb-2 pr-3 font-medium text-right">Unit.</th>
                <th className="pb-2 pr-3 font-medium text-right">Desc.</th>
                <th className="pb-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {budget.procedures.map((p) => (
                <tr key={p.id} className="border-b border-slate-50">
                  <td className="py-2.5 pr-3">
                    <p className="font-medium text-slate-800">{p.name}</p>
                    <p className="text-[10px] text-slate-400">{p.code}</p>
                  </td>
                  <td className="py-2.5 pr-3 text-slate-600">{p.tooth || "—"}</td>
                  <td className="py-2.5 pr-3 text-slate-600">{p.face || "—"}</td>
                  <td className="py-2.5 pr-3 text-slate-600">{p.quantity}</td>
                  <td className="py-2.5 pr-3 text-right text-slate-700">{money(p.unitPrice)}</td>
                  <td className="py-2.5 pr-3 text-right text-slate-600">
                    {p.discount > 0 ? money(p.discount) : "—"}
                  </td>
                  <td className="py-2.5 text-right font-semibold text-slate-900">
                    {money(p.finalValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <h4 className="mb-2 text-xs font-semibold uppercase text-slate-400">Resumo</h4>
            <div className="space-y-1.5 text-sm">
              <TotalRow label="Subtotal" value={money(budget.subtotal)} />
              <TotalRow label="Descontos" value={`− ${money(budget.discounts)}`} />
              <TotalRow label="Acréscimos" value={money(budget.additions)} />
              <TotalRow label="Total geral" value={money(budget.total)} bold />
              <TotalRow label="Entrada" value={money(budget.downPayment)} />
              <TotalRow label="Saldo" value={money(budget.balance)} bold />
            </div>
          </div>
          <InstallmentCalculator
            installment={budget.installment}
            total={budget.total - budget.downPayment}
          />
        </div>
      </section>

      {budget.history.length > 0 && (
        <BudgetHistoryTimeline events={budget.history} />
      )}
    </div>
  );
}

function Meta({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2">
      <p className="text-[10px] font-medium uppercase text-slate-400">{label}</p>
      <p className={cn("mt-0.5 text-sm", highlight ? "font-bold text-slate-900" : "text-slate-700")}>
        {value}
      </p>
    </div>
  );
}

function TotalRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className={cn("text-slate-500", bold && "font-semibold text-slate-800")}>{label}</span>
      <span className={cn("tabular-nums text-slate-800", bold && "font-bold")}>{value}</span>
    </div>
  );
}
