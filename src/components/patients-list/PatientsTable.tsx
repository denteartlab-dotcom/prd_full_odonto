"use client";

import { ChevronDown, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ListPatient, PatientSortKey } from "@/lib/patients-list-mock";
import { PatientTableRow } from "./PatientTableRow";

const columns: { key: PatientSortKey | null; label: string; className?: string }[] = [
  { key: "name", label: "Paciente" },
  { key: "cpf", label: "CPF" },
  { key: "phone", label: "Telefone" },
  { key: "email", label: "E-mail", className: "hidden lg:table-cell" },
  { key: "city", label: "Cidade", className: "hidden md:table-cell" },
  { key: "lastVisit", label: "Última consulta", className: "hidden xl:table-cell" },
  { key: "status", label: "Status" },
  { key: null, label: "Ações" },
];

function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-slate-50">
          <td className="px-4 py-3" colSpan={8}>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />
              <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Users className="h-7 w-7" />
      </div>
      <p className="text-base font-semibold text-slate-800">Nenhum paciente encontrado</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        Ajuste os filtros ou a busca para encontrar pacientes cadastrados.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        Limpar filtros
      </button>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-base font-semibold text-slate-800">Erro ao carregar pacientes</p>
      <p className="mt-1 text-sm text-slate-500">
        Não foi possível carregar a lista. Tente novamente.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Tentar novamente
      </button>
    </div>
  );
}

export function PatientsTable({
  patients,
  totalFiltered,
  sortKey,
  sortDir,
  page,
  pageSize,
  pageCount,
  isLoading,
  error,
  onSort,
  onPageChange,
  onPageSizeChange,
  onOpenPatient,
  onEditPatient,
  onHistoryPatient,
  onDeletePatient,
  onClearFilters,
  onRetry,
}: {
  patients: ListPatient[];
  totalFiltered: number;
  sortKey: PatientSortKey;
  sortDir: "asc" | "desc";
  page: number;
  pageSize: number;
  pageCount: number;
  isLoading: boolean;
  error: boolean;
  onSort: (key: PatientSortKey) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onOpenPatient: (patient: ListPatient) => void;
  onEditPatient: (patient: ListPatient) => void;
  onHistoryPatient: (patient: ListPatient) => void;
  onDeletePatient: (patient: ListPatient) => void;
  onClearFilters: () => void;
  onRetry: () => void;
}) {
  const pageSizes = [10, 25, 50, 100];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgb(15_23_42/0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-4 sm:px-5">
        <h2 className="text-sm font-semibold text-slate-800">
          Lista de pacientes
          {!isLoading && !error ? (
            <span className="ml-1 font-normal text-slate-500">
              ({totalFiltered.toLocaleString("pt-BR")})
            </span>
          ) : null}
        </h2>
      </div>

      {error ? (
        <ErrorState onRetry={onRetry} />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {columns.map((col) =>
                    col.key ? (
                      <th key={col.key} className={cn("px-4 py-3", col.className)}>
                        <button
                          type="button"
                          onClick={() => onSort(col.key!)}
                          className="inline-flex items-center gap-1 hover:text-slate-800"
                        >
                          {col.label}
                          {sortKey === col.key ? (
                            <ChevronDown
                              className={cn(
                                "h-3.5 w-3.5 transition",
                                sortDir === "asc" && "rotate-180"
                              )}
                            />
                          ) : null}
                        </button>
                      </th>
                    ) : (
                      <th key="actions" className="px-4 py-3 text-right">
                        {col.label}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeleton rows={pageSize > 10 ? 10 : pageSize} />
                ) : patients.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <EmptyState onClear={onClearFilters} />
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <PatientTableRow
                      key={patient.id}
                      patient={patient}
                      onOpen={() => onOpenPatient(patient)}
                      onEdit={() => onEditPatient(patient)}
                      onHistory={() => onHistoryPatient(patient)}
                      onDelete={() => onDeletePatient(patient)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && patients.length > 0 ? (
            <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <label className="flex items-center gap-2 text-xs text-slate-600">
                Mostrar
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium outline-none focus:border-indigo-300"
                >
                  {pageSizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                por página
              </label>

              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => onPageChange(page - 1)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
                  let pageNum: number;
                  if (pageCount <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= pageCount - 2) pageNum = pageCount - 4 + i;
                  else pageNum = page - 2 + i;

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => onPageChange(pageNum)}
                      className={cn(
                        "min-w-[2rem] rounded-lg px-2.5 py-1.5 text-xs font-semibold",
                        page === pageNum
                          ? "bg-indigo-600 text-white"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {pageCount > 5 && page < pageCount - 2 ? (
                  <>
                    <span className="px-1 text-xs text-slate-400">…</span>
                    <button
                      type="button"
                      onClick={() => onPageChange(pageCount)}
                      className="min-w-[2rem] rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      {pageCount}
                    </button>
                  </>
                ) : null}

                <button
                  type="button"
                  disabled={page >= pageCount}
                  onClick={() => onPageChange(page + 1)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
