"use client";

import { Filter, Search } from "lucide-react";
import { DENTISTS } from "@/lib/budget-mock";
import type { BudgetStatus } from "@/lib/budget-types";

export type BudgetFilterState = {
  search: string;
  status: BudgetStatus | "todos" | "vencido";
  dentist: string;
  period: "todos" | "30d" | "90d" | "365d";
};

export const DEFAULT_BUDGET_FILTERS: BudgetFilterState = {
  search: "",
  status: "todos",
  dentist: "todos",
  period: "todos",
};

export function BudgetFilters({
  filters,
  onChange,
}: {
  filters: BudgetFilterState;
  onChange: (patch: Partial<BudgetFilterState>) => void;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
      <label className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Buscar orçamento..."
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
        />
      </label>

      <select
        value={filters.status}
        onChange={(e) => onChange({ status: e.target.value as BudgetFilterState["status"] })}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-300 lg:w-36"
      >
        <option value="todos">Status: Todos</option>
        <option value="rascunho">Rascunho</option>
        <option value="enviado">Enviado</option>
        <option value="aprovado">Aprovado</option>
        <option value="parcial">Parcial</option>
        <option value="recusado">Recusado</option>
        <option value="expirado">Expirado</option>
        <option value="vencido">Vencido</option>
      </select>

      <select
        value={filters.dentist}
        onChange={(e) => onChange({ dentist: e.target.value })}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-300 lg:w-44"
      >
        <option value="todos">Dentista: Todos</option>
        {DENTISTS.map((d) => (
          <option key={d.id} value={d.name}>
            {d.name}
          </option>
        ))}
      </select>

      <select
        value={filters.period}
        onChange={(e) => onChange({ period: e.target.value as BudgetFilterState["period"] })}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-300 lg:w-36"
      >
        <option value="todos">Período: Todos</option>
        <option value="30d">Últimos 30 dias</option>
        <option value="90d">Últimos 90 dias</option>
        <option value="365d">Último ano</option>
      </select>

      <button
        type="button"
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white"
      >
        <Filter className="h-4 w-4" />
        Filtros
      </button>
    </div>
  );
}
