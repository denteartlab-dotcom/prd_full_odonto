"use client";

import { ChevronLeft, ChevronRight, Copy, Eye, FileDown, Pencil } from "lucide-react";
import { cn, money } from "@/lib/utils";
import type { DentalBudget } from "@/lib/budget-types";
import { getValidityInfo } from "@/lib/budget-mock";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import { BudgetActionsMenu } from "./BudgetActionsMenu";
import { BudgetStatusBadge } from "./BudgetStatusBadge";

const PAGE_SIZE = 5;

function dentistInitials(name: string) {
  return name
    .replace(/^(Dra?\.|Dr\.)\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function BudgetTabTable({
  budgets,
  selectedId,
  page,
  onPageChange,
  onSelect,
  onView,
  onEdit,
  onDuplicate,
  onPdf,
  onDelete,
  loading,
}: {
  budgets: DentalBudget[];
  selectedId: string | null;
  page: number;
  onPageChange: (page: number) => void;
  onSelect: (id: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onPdf: (id: string) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}) {
  const totalPages = Math.max(1, Math.ceil(budgets.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const slice = budgets.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (loading) {
    return <BudgetTableSkeleton />;
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-[11px] uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-medium">Nº Orçamento</th>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Dentista</th>
              <th className="px-4 py-3 font-medium">Procedimentos</th>
              <th className="px-4 py-3 font-medium">Valor Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Validade</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <p className="text-sm font-medium text-slate-600">Nenhum orçamento encontrado</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Ajuste os filtros ou crie um novo orçamento.
                  </p>
                </td>
              </tr>
            ) : (
              slice.map((b) => {
                const validity = getValidityInfo(b.validityDate);
                const isExpired =
                  validity.expired || b.status === "expirado" || b.status === "recusado";
                return (
                  <tr
                    key={b.id}
                    onClick={() => onSelect(b.id)}
                    className={cn(
                      "cursor-pointer border-b border-slate-50 transition hover:bg-slate-50/80",
                      selectedId === b.id && "bg-indigo-50/60"
                    )}
                  >
                    <td className="px-4 py-3.5 font-semibold text-indigo-600">{b.number}</td>
                    <td className="px-4 py-3.5 text-slate-600">{formatDisplayDate(b.date)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-[10px] font-bold text-white">
                          {dentistInitials(b.dentist)}
                        </span>
                        <span className="text-slate-700">{b.dentist}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {b.procedures.length} procedimento{b.procedures.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">{money(b.total)}</td>
                    <td className="px-4 py-3.5">
                      <BudgetStatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-slate-600">{formatDisplayDate(b.validityDate)}</p>
                      <p
                        className={cn(
                          "text-[11px] font-medium",
                          isExpired ? "text-red-500" : "text-emerald-600"
                        )}
                      >
                        {validity.label}
                      </p>
                    </td>
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-0.5">
                        <IconBtn icon={Eye} label="Visualizar" onClick={() => onView(b.id)} />
                        <IconBtn icon={Pencil} label="Editar" onClick={() => onEdit(b.id)} />
                        <IconBtn icon={Copy} label="Duplicar" onClick={() => onDuplicate(b.id)} />
                        <IconBtn icon={FileDown} label="PDF" onClick={() => onPdf(b.id)} />
                        <BudgetActionsMenu
                          onView={() => onView(b.id)}
                          onEdit={() => onEdit(b.id)}
                          onDuplicate={() => onDuplicate(b.id)}
                          onPdf={() => onPdf(b.id)}
                          onDelete={() => onDelete(b.id)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {budgets.length > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <p className="text-xs text-slate-500">
            {budgets.length} orçamento{budgets.length !== 1 ? "s" : ""} · Página {currentPage} de{" "}
            {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <PaginationBtn
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </PaginationBtn>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onPageChange(i + 1)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition",
                  currentPage === i + 1
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {i + 1}
              </button>
            ))}
            <PaginationBtn
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </PaginationBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function IconBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function PaginationBtn({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function BudgetTableSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-10 flex-1 rounded-lg bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
