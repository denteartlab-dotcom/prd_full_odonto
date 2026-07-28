"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";

export function AssistenteIAModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [prompt, setPrompt] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-label="Fechar" />
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Assistente IA</h3>
              <p className="text-xs text-slate-500">Estrutura pronta — sugestões virão em integração futura</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50">
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
          Descreva o procedimento realizado
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          placeholder={"Ex.: Extração de terceiro molar.\nPaciente sem alergias.\nDor moderada."}
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
        />

        <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2.5 text-xs text-indigo-800">
          A IA sugerirá medicamentos, doses e alertas com base no procedimento. Nenhuma chamada
          externa está ativa nesta versão.
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
          >
            Fechar
          </button>
          <button
            type="button"
            disabled={!prompt.trim()}
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Preparar sugestão (em breve)
          </button>
        </div>
      </div>
    </div>
  );
}
