"use client";

import { RotateCcw, Search } from "lucide-react";
import type { DocumentCategory, DocumentFileType } from "@/lib/document-types";
import {
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_FILE_TYPE_LABELS,
} from "@/lib/document-types";
import type { DocumentFilterState } from "@/lib/document-mock";
import { DEFAULT_DOCUMENT_FILTERS } from "@/lib/document-mock";

const FILE_TYPES: (DocumentFileType | "todos")[] = [
  "todos",
  "pdf",
  "word",
  "excel",
  "image",
  "zip",
  "txt",
  "csv",
  "other",
];

const PERIODS = [
  { value: "todos" as const, label: "Todo período" },
  { value: "30d" as const, label: "Últimos 30 dias" },
  { value: "90d" as const, label: "Últimos 90 dias" },
  { value: "365d" as const, label: "Último ano" },
];

export function DocumentsFilters({
  filters,
  onChange,
  onClear,
}: {
  filters: DocumentFilterState;
  onChange: (patch: Partial<DocumentFilterState>) => void;
  onClear: () => void;
}) {
  return (
    <div className="mb-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Buscar documento"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <select
          value={filters.category}
          onChange={(e) =>
            onChange({ category: e.target.value as DocumentCategory | "todos" })
          }
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
        >
          <option value="todos">Todas categorias</option>
          {(Object.keys(DOCUMENT_CATEGORY_LABELS) as DocumentCategory[]).map((c) => (
            <option key={c} value={c}>
              {DOCUMENT_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        <select
          value={filters.fileType}
          onChange={(e) =>
            onChange({ fileType: e.target.value as DocumentFileType | "todos" })
          }
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
        >
          {FILE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t === "todos" ? "Todos tipos" : DOCUMENT_FILE_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <select
          value={filters.period}
          onChange={(e) =>
            onChange({ period: e.target.value as DocumentFilterState["period"] })
          }
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Limpar filtros
        </button>
      </div>
    </div>
  );
}

export { DEFAULT_DOCUMENT_FILTERS };
