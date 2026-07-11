"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  FileText,
  Wallet,
} from "lucide-react";
import { cn, money } from "@/lib/utils";
import type { FinancialKpiSummary } from "@/lib/financial-types";
import { formatDisplayDate } from "@/lib/patients-list-mock";

const cards = [
  {
    key: "receivable",
    label: "Total a Receber",
    icon: Wallet,
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
  },
  {
    key: "overdue",
    label: "Títulos Vencidos",
    icon: AlertCircle,
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-100",
  },
  {
    key: "received",
    label: "Total Recebido",
    icon: CheckCircle2,
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
  },
  {
    key: "next",
    label: "Próxima Parcela",
    icon: Calendar,
    bg: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-100",
  },
  {
    key: "budgets",
    label: "Orçamentos Aprovados",
    icon: FileText,
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
  },
];

export function FinancialCards({ summary }: { summary: FinancialKpiSummary }) {
  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className={cn(
              "rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md",
              card.border
            )}
          >
            <div className={cn("mb-3 inline-flex rounded-xl p-2.5", card.bg)}>
              <Icon className={cn("h-5 w-5", card.text)} />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {card.label}
            </p>
            {card.key === "receivable" && (
              <>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {money(summary.totalReceivable)}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {summary.openChargesCount} título{summary.openChargesCount !== 1 ? "s" : ""} em aberto
                </p>
              </>
            )}
            {card.key === "overdue" && (
              <>
                <p className="mt-1 text-xl font-bold text-red-600">
                  {money(summary.overdueAmount)}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {summary.overdueCount} vencido{summary.overdueCount !== 1 ? "s" : ""}
                </p>
              </>
            )}
            {card.key === "received" && (
              <>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {money(summary.totalReceived)}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">Últimos 12 meses</p>
              </>
            )}
            {card.key === "next" && (
              <>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {summary.nextInstallment
                    ? money(summary.nextInstallment.amount)
                    : "—"}
                </p>
                {summary.nextInstallment ? (
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {formatDisplayDate(summary.nextInstallment.date)} ·{" "}
                    {summary.nextInstallment.procedure}
                  </p>
                ) : (
                  <p className="mt-0.5 text-[11px] text-slate-500">Nenhuma parcela pendente</p>
                )}
              </>
            )}
            {card.key === "budgets" && (
              <>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {money(summary.approvedBudgetsTotal)}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {summary.approvedBudgetsCount} orçamento
                  {summary.approvedBudgetsCount !== 1 ? "s" : ""}
                </p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
