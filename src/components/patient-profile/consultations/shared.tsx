"use client";

import { cn } from "@/lib/utils";
import type { ConsultationStatus } from "@/lib/consultation-types";
import { CONSULTATION_STATUS_LABELS } from "@/lib/consultation-types";

export function consultationStatusBadge(status: ConsultationStatus) {
  const map: Record<ConsultationStatus, string> = {
    agendada: "bg-blue-100 text-blue-700",
    confirmada: "bg-emerald-100 text-emerald-700",
    realizada: "bg-slate-100 text-slate-600",
    cancelada: "bg-red-100 text-red-700",
    faltou: "bg-orange-100 text-orange-700",
  };
  return map[status];
}

export function ConsultationStatusBadge({ status }: { status: ConsultationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
        consultationStatusBadge(status)
      )}
    >
      {CONSULTATION_STATUS_LABELS[status]}
    </span>
  );
}

export function ConsultationCard({
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
