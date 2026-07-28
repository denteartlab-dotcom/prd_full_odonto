"use client";

import { X } from "lucide-react";
import { RECEITUARIO_TEMPLATES, type ReceituarioTemplate } from "@/lib/receituario-types";

export function ModelosReceitaModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (template: ReceituarioTemplate) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-label="Fechar" />
      <div className="relative max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Modelos de Receita</h3>
            <p className="text-xs text-slate-500">Carrega medicamentos pré-configurados</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="grid max-h-[70vh] gap-3 overflow-y-auto p-5 sm:grid-cols-2">
          {RECEITUARIO_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => {
                onSelect(tpl);
                onClose();
              }}
              className="rounded-xl border border-slate-200 p-4 text-left hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <p className="text-sm font-semibold text-slate-900">{tpl.name}</p>
              <p className="mt-1 text-xs text-slate-500">{tpl.description}</p>
              <p className="mt-2 text-[11px] font-medium text-indigo-600">
                {tpl.medicineIds.length} medicamento(s)
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
