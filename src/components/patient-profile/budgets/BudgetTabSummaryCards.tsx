"use client";

import {
  Calendar,
  CircleDollarSign,
  Clock,
  CreditCard,
  FileText,
  TrendingUp,
} from "lucide-react";
import { cn, money } from "@/lib/utils";
import type { BudgetFinancialSummary } from "@/lib/budget-types";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import { GrowthIndicator } from "@/components/budgets/shared";

const metricCards = [
  {
    key: "totalBudgeted" as const,
    label: "Total orçado",
    icon: FileText,
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  {
    key: "totalApproved" as const,
    label: "Total aprovado",
    icon: TrendingUp,
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  {
    key: "totalReceived" as const,
    label: "Total recebido",
    icon: CreditCard,
    bg: "bg-violet-50",
    text: "text-violet-600",
  },
  {
    key: "openBalance" as const,
    label: "Saldo em aberto",
    icon: CircleDollarSign,
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
];

export function BudgetTabSummaryCards({ summary }: { summary: BudgetFinancialSummary }) {
  const values: Record<string, number> = {
    totalBudgeted: summary.totalBudgeted,
    totalApproved: summary.totalApproved,
    totalReceived: summary.totalReceived,
    openBalance: summary.openBalance,
  };

  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {metricCards.map((card) => {
        const Icon = card.icon;
        const growth = summary.growthIndicators[card.key];
        return (
          <div
            key={card.key}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className={cn("rounded-xl p-2", card.bg)}>
                <Icon className={cn("h-4 w-4", card.text)} />
              </div>
              <GrowthIndicator value={growth} />
            </div>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {card.label}
            </p>
            <p className="mt-0.5 text-lg font-bold text-slate-900">{money(values[card.key])}</p>
          </div>
        );
      })}

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md">
        <div className="rounded-xl bg-sky-50 p-2 w-fit">
          <Calendar className="h-4 w-4 text-sky-600" />
        </div>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Último orçamento
        </p>
        <p className="mt-0.5 text-lg font-bold text-slate-900">{summary.lastBudgetNumber}</p>
        {summary.lastBudgetDate && (
          <p className="mt-0.5 text-[11px] text-slate-500">
            {formatDisplayDate(summary.lastBudgetDate)}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md">
        <div className="rounded-xl bg-indigo-50 p-2 w-fit">
          <Clock className="h-4 w-4 text-indigo-600" />
        </div>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Média de validade
        </p>
        <p className="mt-0.5 text-lg font-bold text-slate-900">
          {summary.avgValidityDays > 0 ? `${summary.avgValidityDays} dias` : "—"}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">Prazo médio dos orçamentos</p>
      </div>
    </div>
  );
}

export function BudgetSummaryCardsSkeleton() {
  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-4">
          <div className="h-8 w-8 rounded-xl bg-slate-200" />
          <div className="mt-3 h-3 w-20 rounded bg-slate-200" />
          <div className="mt-2 h-6 w-24 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}
