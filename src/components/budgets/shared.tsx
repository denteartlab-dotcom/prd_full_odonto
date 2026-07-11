"use client";

import { cn, money } from "@/lib/utils";
import type { BudgetStatus, BudgetHistoryEventType, TreatmentStepStatus } from "@/lib/budget-types";

export { money };

export const BUDGET_STATUS_LABELS: Record<BudgetStatus, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  parcial: "Parcial",
  recusado: "Recusado",
  expirado: "Expirado",
};

export function budgetStatusBadge(status: BudgetStatus) {
  const map: Record<BudgetStatus, string> = {
    rascunho: "bg-slate-100 text-slate-600",
    enviado: "bg-blue-100 text-blue-700",
    aprovado: "bg-emerald-100 text-emerald-700",
    parcial: "bg-amber-100 text-amber-800",
    recusado: "bg-red-100 text-red-700",
    expirado: "bg-orange-100 text-orange-700",
  };
  return map[status];
}

export function treatmentStatusBadge(status: TreatmentStepStatus) {
  const map: Record<TreatmentStepStatus, string> = {
    pendente: "bg-slate-100 text-slate-600",
    em_andamento: "bg-indigo-100 text-indigo-700",
    concluido: "bg-emerald-100 text-emerald-700",
  };
  return map[status];
}

export function historyEventLabel(type: BudgetHistoryEventType) {
  const map: Record<BudgetHistoryEventType, string> = {
    criado: "Criado",
    editado: "Editado",
    enviado: "Enviado",
    visualizado: "Visualizado",
    aprovado: "Aprovado",
    recusado: "Recusado",
  };
  return map[type];
}

export function GrowthIndicator({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-semibold",
        positive ? "text-emerald-600" : "text-red-500"
      )}
    >
      {positive ? "↑" : "↓"} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export function SectionCard({
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

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">
      {children}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
  className,
}: {
  value: string | number;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15 disabled:bg-slate-50 disabled:text-slate-500",
        className
      )}
    />
  );
}

export function SelectInput({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15 disabled:bg-slate-50"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
