"use client";

import { FileWarning, ScrollText, X } from "lucide-react";
import type { PrescriptionKind } from "@/lib/prescription-types";

export function TipoReceitaControladoModal({
  open,
  onClose,
  onSelect,
  controlledNames,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (kind: Extract<PrescriptionKind, "controle_especial" | "receituario_simples">) => void;
  controlledNames: string[];
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[96] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-label="Fechar"
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Medicamento controlado detectado
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Escolha o tipo de receituário para emitir o PDF.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-4 p-5">
          {controlledNames.length ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs text-amber-900">
              <p className="font-semibold">Itens controlados nesta receita:</p>
              <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-amber-800">
                {controlledNames.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onSelect("controle_especial")}
              className="flex flex-col items-start gap-2 rounded-2xl border-2 border-amber-300 bg-amber-50/60 p-4 text-left transition hover:border-amber-500 hover:bg-amber-50"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <FileWarning className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-slate-900">
                Receita de Controle Especial
              </span>
              <span className="text-[11px] leading-relaxed text-slate-500">
                Formulário oficial em 2 páginas (ANVISA / CFO), com campos para farmácia.
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelect("receituario_simples")}
              className="flex flex-col items-start gap-2 rounded-2xl border-2 border-slate-200 bg-white p-4 text-left transition hover:border-indigo-400 hover:bg-indigo-50/40"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <ScrollText className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-slate-900">
                Receituário comum
              </span>
              <span className="text-[11px] leading-relaxed text-slate-500">
                Modelo simples da clínica, sem o layout de controle especial.
              </span>
            </button>
          </div>
        </div>

        <footer className="border-t border-slate-100 px-5 py-3 text-[11px] text-slate-400">
          Você pode cancelar e revisar os medicamentos antes de emitir.
        </footer>
      </div>
    </div>
  );
}
