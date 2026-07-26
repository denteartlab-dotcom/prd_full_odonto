"use client";

import { Download, Eraser, Search } from "lucide-react";
import type { HistoryEventType, HistoryFilterState } from "@/lib/patient-history-types";
import { DEFAULT_HISTORY_FILTERS, HISTORY_TYPE_LABELS } from "@/lib/patient-history-types";

const TYPE_OPTIONS: Array<HistoryEventType | "todos"> = [
  "todos",
  "consulta",
  "anamnese",
  "odontograma",
  "procedimento",
  "orcamento",
  "financeiro",
  "documento",
  "imagem",
  "comunicacao",
  "receita",
  "atestado",
  "sistema",
];

export function HistoryFiltersBar({
  filters,
  professionals,
  onChange,
  onClear,
  onExport,
}: {
  filters: HistoryFilterState;
  professionals: string[];
  onChange: (patch: Partial<HistoryFilterState>) => void;
  onClear: () => void;
  onExport: () => void;
}) {
  return (
    <div className="mb-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
        <label className="relative min-w-0 flex-1">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Pesquisa
          </span>
          <Search className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Buscar procedimentos, pagamentos, consultas, profissionais..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
          />
        </label>

        <label className="xl:w-44">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Tipo
          </span>
          <select
            value={filters.type}
            onChange={(e) =>
              onChange({ type: e.target.value as HistoryFilterState["type"] })
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-300"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t === "todos" ? "Todos os tipos" : HISTORY_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>

        <label className="xl:w-52">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Profissional
          </span>
          <select
            value={filters.professional}
            onChange={(e) => onChange({ professional: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-300"
          >
            <option value="todos">Todos os profissionais</option>
            {professionals.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label className="xl:w-40">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            De
          </span>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onChange({ dateFrom: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300"
          />
        </label>

        <label className="xl:w-40">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Até
          </span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onChange({ dateTo: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300"
          />
        </label>

        <div className="flex gap-2 xl:pb-0.5">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Eraser className="h-4 w-4" />
            Limpar
          </button>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      {(filters.search ||
        filters.type !== DEFAULT_HISTORY_FILTERS.type ||
        filters.professional !== DEFAULT_HISTORY_FILTERS.professional ||
        filters.dateFrom ||
        filters.dateTo) && (
        <p className="mt-3 text-xs text-slate-500">
          Filtros ativos — os resultados abaixo refletem a combinação aplicada.
        </p>
      )}
    </div>
  );
}
