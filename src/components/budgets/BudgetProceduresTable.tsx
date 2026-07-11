"use client";

import { Plus, Search, Trash2 } from "lucide-react";
import { money } from "@/lib/utils";
import type { BudgetProcedure } from "@/lib/budget-types";
import { FieldLabel, SectionCard, TextInput } from "./shared";
import { ProcedureSearch } from "./ProcedureSearch";

export function BudgetProceduresTable({
  procedures,
  editable,
  onChange,
  onAdd,
  onRemove,
}: {
  procedures: BudgetProcedure[];
  editable?: boolean;
  onChange?: (id: string, patch: Partial<BudgetProcedure>) => void;
  onAdd?: (procedure: BudgetProcedure) => void;
  onRemove?: (id: string) => void;
}) {
  return (
    <SectionCard
      title="Procedimentos"
      action={
        editable && onAdd ? (
          <ProcedureSearch onSelect={onAdd}>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar procedimento
            </button>
          </ProcedureSearch>
        ) : null
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wide text-slate-400">
              <th className="pb-3 pr-3 font-medium">Código</th>
              <th className="pb-3 pr-3 font-medium">Procedimento</th>
              <th className="pb-3 pr-3 font-medium">Dente</th>
              <th className="pb-3 pr-3 font-medium">Face</th>
              <th className="pb-3 pr-3 font-medium">Qtd</th>
              <th className="pb-3 pr-3 font-medium">Valor Unit.</th>
              <th className="pb-3 pr-3 font-medium">Desconto</th>
              <th className="pb-3 pr-3 font-medium">Valor Final</th>
              {editable && <th className="pb-3 font-medium" />}
            </tr>
          </thead>
          <tbody>
            {procedures.length === 0 ? (
              <tr>
                <td colSpan={editable ? 9 : 8} className="py-6 text-center text-slate-400">
                  Nenhum procedimento adicionado.
                </td>
              </tr>
            ) : (
              procedures.map((p) => (
                <tr key={p.id} className="border-b border-slate-50">
                  <td className="py-2.5 pr-3 font-mono text-xs text-slate-500">{p.code}</td>
                  <td className="py-2.5 pr-3">
                    <p className="font-medium text-slate-800">{p.name}</p>
                    <p className="text-[10px] text-slate-400">{p.category}</p>
                  </td>
                  <td className="py-2.5 pr-3">
                    {editable && onChange ? (
                      <TextInput
                        value={p.tooth ?? ""}
                        onChange={(v) => onChange(p.id, { tooth: v })}
                        className="!py-1.5 !text-xs w-16"
                        placeholder="—"
                      />
                    ) : (
                      <span className="text-slate-600">{p.tooth || "—"}</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-3">
                    {editable && onChange ? (
                      <TextInput
                        value={p.face ?? ""}
                        onChange={(v) => onChange(p.id, { face: v })}
                        className="!py-1.5 !text-xs w-16"
                        placeholder="—"
                      />
                    ) : (
                      <span className="text-slate-600">{p.face || "—"}</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-3">
                    {editable && onChange ? (
                      <TextInput
                        type="number"
                        value={p.quantity}
                        onChange={(v) => onChange(p.id, { quantity: Math.max(1, parseInt(v) || 1) })}
                        className="!py-1.5 !text-xs w-16"
                      />
                    ) : (
                      <span className="text-slate-600">{p.quantity}</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-3 font-medium text-slate-700">
                    {money(p.unitPrice)}
                  </td>
                  <td className="py-2.5 pr-3">
                    {editable && onChange ? (
                      <TextInput
                        type="number"
                        value={p.discount}
                        onChange={(v) => onChange(p.id, { discount: Math.max(0, parseFloat(v) || 0) })}
                        className="!py-1.5 !text-xs w-20"
                      />
                    ) : (
                      <span className="text-slate-600">{money(p.discount)}</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-3 font-semibold text-slate-900">
                    {money(p.finalValue)}
                  </td>
                  {editable && onRemove && (
                    <td className="py-2.5">
                      <button
                        type="button"
                        onClick={() => onRemove(p.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

export function ProcedureSearchPanel({
  onSelect,
}: {
  onSelect: (procedure: BudgetProcedure) => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4">
      <FieldLabel>Pesquisar procedimento</FieldLabel>
      <ProcedureSearch onSelect={onSelect}>
        <button
          type="button"
          className="mt-1 flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-500 transition hover:border-indigo-300"
        >
          <Search className="h-4 w-4" />
          Buscar por nome, código ou categoria...
        </button>
      </ProcedureSearch>
    </div>
  );
}
