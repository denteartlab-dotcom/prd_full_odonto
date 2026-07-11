"use client";

import { Filter, Search } from "lucide-react";
import type { ConsultationStatus } from "@/lib/consultation-types";
import { CONSULTATION_STATUS_LABELS } from "@/lib/consultation-types";
import { PROFESSIONALS } from "@/lib/consultation-mock";
import type { ConsultationFilterState } from "@/lib/consultation-mock";

export function ConsultationFilters({
  filters,
  onChange,
}: {
  filters: ConsultationFilterState;
  onChange: (patch: Partial<ConsultationFilterState>) => void;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
      <label className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Buscar por procedimento ou dentista..."
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
        />
      </label>

      <select
        value={filters.status}
        onChange={(e) =>
          onChange({ status: e.target.value as ConsultationFilterState["status"] })
        }
        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm lg:w-36"
      >
        <option value="todos">Status: Todos</option>
        {(Object.keys(CONSULTATION_STATUS_LABELS) as ConsultationStatus[]).map((s) => (
          <option key={s} value={s}>
            {CONSULTATION_STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <select
        value={filters.period}
        onChange={(e) =>
          onChange({ period: e.target.value as ConsultationFilterState["period"] })
        }
        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm lg:w-36"
      >
        <option value="todos">Período: Todos</option>
        <option value="30d">30 dias</option>
        <option value="90d">90 dias</option>
        <option value="365d">12 meses</option>
      </select>

      <select
        value={filters.professional}
        onChange={(e) => onChange({ professional: e.target.value })}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm lg:w-44"
      >
        <option value="todos">Profissional: Todos</option>
        {PROFESSIONALS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700"
      >
        <Filter className="h-4 w-4" />
        Filtros
      </button>
    </div>
  );
}
