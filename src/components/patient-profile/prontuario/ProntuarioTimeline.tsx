"use client";

import {
  Activity,
  AlertTriangle,
  ClipboardList,
  FileSearch,
  Pill,
  Scissors,
  Smile,
  Stethoscope,
  Syringe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EVOLUCAO_TIPO_LABEL,
  type EvolucaoClinica,
  type EvolucaoTipo,
  type ProntuarioFilter,
  type ProntuarioSort,
} from "@/lib/prontuario-types";

const FILTERS: { id: ProntuarioFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "consultas", label: "Consultas" },
  { id: "procedimentos", label: "Procedimentos" },
  { id: "receitas", label: "Receitas" },
  { id: "exames", label: "Exames" },
  { id: "cirurgias", label: "Cirurgias" },
];

function tipoIcon(tipo: EvolucaoTipo) {
  switch (tipo) {
    case "cirurgia":
    case "urgencia":
      return Scissors;
    case "receita":
      return Pill;
    case "exame":
      return FileSearch;
    case "limpeza":
      return Smile;
    case "endodontia":
    case "implante":
      return Syringe;
    case "avaliacao":
      return ClipboardList;
    case "evolucao":
      return Activity;
    default:
      return Stethoscope;
  }
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function ProntuarioTimeline({
  items,
  selectedId,
  query,
  filter,
  sort,
  onQuery,
  onFilter,
  onSort,
  onSelect,
  onNova,
}: {
  items: EvolucaoClinica[];
  selectedId?: string;
  query: string;
  filter: ProntuarioFilter;
  sort: ProntuarioSort;
  onQuery: (v: string) => void;
  onFilter: (v: ProntuarioFilter) => void;
  onSort: (v: ProntuarioSort) => void;
  onSelect: (id: string) => void;
  onNova: () => void;
}) {
  return (
    <section className="flex h-full min-h-[640px] flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">Evoluções do Tratamento</h3>
          <button
            type="button"
            onClick={onNova}
            className="inline-flex items-center rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            + Nova Evolução
          </button>
        </div>
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Buscar evolução..."
          className="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
        />
        <div className="mb-2 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilter(f.id)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                filter === f.id
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value as ProntuarioSort)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 outline-none"
        >
          <option value="recentes">Mais recentes</option>
          <option value="antigas">Mais antigas</option>
        </select>
      </div>

      <div className="flex-1 space-y-0 overflow-y-auto p-4">
        {!items.length ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
            <AlertTriangle className="mb-2 h-5 w-5 text-slate-300" />
            <p className="text-sm text-slate-500">Nenhuma evolução encontrada.</p>
            <button
              type="button"
              onClick={onNova}
              className="mt-3 text-xs font-semibold text-indigo-600 hover:underline"
            >
              Registrar primeira evolução
            </button>
          </div>
        ) : (
          <ol className="relative space-y-4 before:absolute before:left-[15px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-slate-200">
            {items.map((item) => {
              const Icon = tipoIcon(item.tipo);
              const active = item.id === selectedId;
              return (
                <li key={item.id} className="relative pl-10">
                  <span
                    className={cn(
                      "absolute left-0 top-3 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white",
                      active
                        ? "border-indigo-600 text-indigo-600"
                        : "border-slate-200 text-slate-400"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className={cn(
                      "w-full rounded-xl border px-3 py-3 text-left transition",
                      active
                        ? "border-indigo-300 bg-indigo-50/60 shadow-sm ring-1 ring-indigo-100"
                        : "border-slate-150 border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white"
                    )}
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">
                        {formatDate(item.date)} · {item.time}
                      </span>
                      <span className="rounded-full bg-white px-2 py-0.5 font-medium text-indigo-700 ring-1 ring-indigo-100">
                        {EVOLUCAO_TIPO_LABEL[item.tipo]}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{item.titulo}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.profissional}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600">{item.resumo}</p>
                    {item.procedimento ? (
                      <p className="mt-1.5 text-[11px] font-medium text-slate-500">
                        {item.procedimento}
                      </p>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
