"use client";

import { SlidersHorizontal } from "lucide-react";

export type PatientFiltersState = {
  status: string;
  insurance: string;
  city: string;
  financialResponsible: string;
};

export const emptyPatientFilters: PatientFiltersState = {
  status: "",
  insurance: "",
  city: "",
  financialResponsible: "",
};

export function PatientsFilters({
  filters,
  insuranceOptions,
  cityOptions,
  responsibleOptions,
  showMore,
  onToggleMore,
  onChange,
  onClear,
}: {
  filters: PatientFiltersState;
  insuranceOptions: string[];
  cityOptions: string[];
  responsibleOptions: string[];
  showMore: boolean;
  onToggleMore: () => void;
  onChange: (patch: Partial<PatientFiltersState>) => void;
  onClear: () => void;
}) {
  const selectClass =
    "rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-indigo-300";

  return (
    <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_8px_30px_rgb(15_23_42/0.04)] sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="block space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Status
            </span>
            <select
              value={filters.status}
              onChange={(e) => onChange({ status: e.target.value })}
              className={selectClass + " w-full"}
            >
              <option value="">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Convênio
            </span>
            <select
              value={filters.insurance}
              onChange={(e) => onChange({ insurance: e.target.value })}
              className={selectClass + " w-full"}
            >
              <option value="">Todos</option>
              {insuranceOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Cidade
            </span>
            <select
              value={filters.city}
              onChange={(e) => onChange({ city: e.target.value })}
              className={selectClass + " w-full"}
            >
              <option value="">Todas</option>
              {cityOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Responsável financeiro
            </span>
            <select
              value={filters.financialResponsible}
              onChange={(e) => onChange({ financialResponsible: e.target.value })}
              className={selectClass + " w-full"}
            >
              <option value="">Todos</option>
              {responsibleOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleMore}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {showMore ? "Menos filtros" : "Mais filtros"}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
          >
            Limpar filtros
          </button>
        </div>
      </div>

      {showMore ? (
        <div className="mt-3 grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Profissão
            </span>
            <select disabled className={selectClass + " w-full opacity-60"}>
              <option>Todas (em breve)</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Faixa etária
            </span>
            <select disabled className={selectClass + " w-full opacity-60"}>
              <option>Todas (em breve)</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Última consulta
            </span>
            <select disabled className={selectClass + " w-full opacity-60"}>
              <option>Qualquer período (em breve)</option>
            </select>
          </label>
        </div>
      ) : null}
    </div>
  );
}
