"use client";

import {
  Calendar,
  CircleDollarSign,
  CreditCard,
  FileText,
  TrendingUp,
} from "lucide-react";
import { cn, money } from "@/lib/utils";
import type { BudgetFinancialSummary } from "@/lib/budget-types";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import { GrowthIndicator } from "./shared";

const cards = [
  {
    key: "totalBudgeted" as const,
    label: "Total Orçado",
    icon: FileText,
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  {
    key: "totalApproved" as const,
    label: "Total Aprovado",
    icon: TrendingUp,
    color: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  {
    key: "totalReceived" as const,
    label: "Total Recebido",
    icon: CreditCard,
    color: "from-violet-500 to-violet-600",
    bg: "bg-violet-50",
    text: "text-violet-600",
  },
  {
    key: "openBalance" as const,
    label: "Saldo em Aberto",
    icon: CircleDollarSign,
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
];

export function BudgetSummaryCards({ summary }: { summary: BudgetFinancialSummary }) {
  const values: Record<string, number> = {
    totalBudgeted: summary.totalBudgeted,
    totalApproved: summary.totalApproved,
    totalReceived: summary.totalReceived,
    openBalance: summary.openBalance,
  };

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        const growth = summary.growthIndicators[card.key];
        return (
          <div
            key={card.key}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className={cn("rounded-xl p-2.5", card.bg)}>
                <Icon className={cn("h-5 w-5", card.text)} />
              </div>
              <GrowthIndicator value={growth} />
            </div>
            <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {card.label}
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">{money(values[card.key])}</p>
          </div>
        );
      })}

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="rounded-xl bg-sky-50 p-2.5">
            <Calendar className="h-5 w-5 text-sky-600" />
          </div>
        </div>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Último Orçamento
        </p>
        <p className="mt-1 text-lg font-bold text-slate-900">{summary.lastBudgetNumber}</p>
        {summary.lastBudgetDate && (
          <p className="mt-0.5 text-xs text-slate-500">
            {formatDisplayDate(summary.lastBudgetDate)}
          </p>
        )}
      </div>
    </div>
  );
}
