"use client";

import { cn } from "@/lib/utils";
import type { ChargeStatus } from "@/lib/financial-types";
import { CHARGE_STATUS_LABELS } from "@/lib/financial-types";

export function chargeStatusBadge(status: ChargeStatus) {
  const map: Record<ChargeStatus, string> = {
    pendente: "bg-amber-100 text-amber-800",
    pago: "bg-emerald-100 text-emerald-700",
    vencido: "bg-red-100 text-red-700",
    agendado: "bg-sky-100 text-sky-700",
    cancelado: "bg-slate-100 text-slate-500",
  };
  return map[status];
}

export function ChargeStatusBadge({ status }: { status: ChargeStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
        chargeStatusBadge(status)
      )}
    >
      {CHARGE_STATUS_LABELS[status]}
    </span>
  );
}

export function FinancialSectionCard({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm",
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}
