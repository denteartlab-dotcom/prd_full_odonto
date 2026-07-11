"use client";

import {
  Copy,
  Eye,
  FileDown,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn, money } from "@/lib/utils";
import type { DentalBudget } from "@/lib/budget-types";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import { BUDGET_STATUS_LABELS, budgetStatusBadge, SectionCard } from "./shared";

export function BudgetsTable({
  budgets,
  selectedId,
  onSelect,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onPrintPdf,
}: {
  budgets: DentalBudget[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onPrintPdf: (id: string) => void;
}) {
  return (
    <SectionCard title="Lista de orçamentos">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wide text-slate-400">
              <th className="pb-3 pr-4 font-medium">Número</th>
              <th className="pb-3 pr-4 font-medium">Data</th>
              <th className="pb-3 pr-4 font-medium">Dentista</th>
              <th className="pb-3 pr-4 font-medium">Procedimentos</th>
              <th className="pb-3 pr-4 font-medium">Valor</th>
              <th className="pb-3 pr-4 font-medium">Status</th>
              <th className="pb-3 pr-4 font-medium">Validade</th>
              <th className="pb-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {budgets.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Nenhum orçamento cadastrado. Clique em &quot;Novo orçamento&quot; para começar.
                </td>
              </tr>
            ) : (
              budgets.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => onSelect(b.id)}
                  className={cn(
                    "cursor-pointer border-b border-slate-50 transition hover:bg-slate-50/80",
                    selectedId === b.id && "bg-indigo-50/60"
                  )}
                >
                  <td className="py-3.5 pr-4 font-semibold text-indigo-600">{b.number}</td>
                  <td className="py-3.5 pr-4 text-slate-600">{formatDisplayDate(b.date)}</td>
                  <td className="py-3.5 pr-4 text-slate-700">{b.dentist}</td>
                  <td className="py-3.5 pr-4 text-slate-600">{b.procedures.length}</td>
                  <td className="py-3.5 pr-4 font-semibold text-slate-900">{money(b.total)}</td>
                  <td className="py-3.5 pr-4">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                        budgetStatusBadge(b.status)
                      )}
                    >
                      {BUDGET_STATUS_LABELS[b.status]}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-slate-600">
                    {formatDisplayDate(b.validityDate)}
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <ActionBtn icon={Eye} label="Visualizar" onClick={() => onView(b.id)} />
                      <ActionBtn icon={Pencil} label="Editar" onClick={() => onEdit(b.id)} />
                      <ActionBtn icon={Copy} label="Duplicar" onClick={() => onDuplicate(b.id)} />
                      <ActionBtn icon={FileDown} label="PDF" onClick={() => onPrintPdf(b.id)} />
                      <ActionBtn icon={Trash2} label="Excluir" onClick={() => onDelete(b.id)} danger />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "rounded-lg p-1.5 transition",
        danger
          ? "text-slate-400 hover:bg-red-50 hover:text-red-600"
          : "text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
