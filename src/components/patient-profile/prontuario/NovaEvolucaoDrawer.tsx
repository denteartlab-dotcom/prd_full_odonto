"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Loader2, X } from "lucide-react";
import {
  emptyNovaEvolucaoForm,
  type EvolucaoClinica,
  type NovaEvolucaoForm,
} from "@/lib/prontuario-types";

const atendimentoTextareaClass =
  "w-full min-h-[220px] resize-y rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm leading-relaxed text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15";

export function NovaEvolucaoDrawer({
  open,
  onClose,
  profissionalDefault,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  profissionalDefault: string;
  onSave: (form: NovaEvolucaoForm, finalize: boolean) => void;
}) {
  const [form, setForm] = useState<NovaEvolucaoForm>(() =>
    emptyNovaEvolucaoForm(profissionalDefault)
  );
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setForm(emptyNovaEvolucaoForm(profissionalDefault));
      setSaving(false);
    }
  }, [open, profissionalDefault]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function submit(finalize: boolean) {
    setSaving(true);
    await new Promise((r) => window.setTimeout(r, 350));
    onSave(form, finalize);
    setSaving(false);
    onClose();
  }

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-stretch justify-center bg-slate-900/55 p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="nova-evolucao-title"
        className="relative z-[85] flex h-[100dvh] w-full max-w-[900px] flex-col overflow-hidden bg-white shadow-2xl sm:h-[min(88vh,720px)] sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium text-slate-400">
              Prontuário <span className="mx-1.5">›</span> Evolução clínica
            </p>
            <h2
              id="nova-evolucao-title"
              className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl"
            >
              Nova Evolução
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <div>
            <label
              htmlFor="nova-evolucao-atendimento"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Atendimento
            </label>
            <textarea
              id="nova-evolucao-atendimento"
              value={form.descricaoCompleta}
              onChange={(e) =>
                setForm((f) => ({ ...f, descricaoCompleta: e.target.value }))
              }
              placeholder="Descreva o atendimento do paciente, procedimentos realizados, conduta e orientações..."
              className={atendimentoTextareaClass}
              rows={12}
            />
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void submit(false)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Salvar
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void submit(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-600 hover:to-blue-700 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Salvar e Finalizar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function formToEvolucao(
  form: NovaEvolucaoForm,
  patientId: string,
  finalize: boolean
): EvolucaoClinica {
  const now = new Date().toISOString();
  const plain = (html: string) =>
    html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const texto = form.descricaoCompleta || "";
  const resumo = plain(texto) || "Nova evolução clínica";

  return {
    id: `ev-${patientId}-${Date.now()}`,
    patientId,
    tipo: form.tipo || "evolucao",
    titulo: "Atendimento",
    resumo: resumo.slice(0, 140),
    date: form.date,
    time: form.time,
    profissional: form.profissional,
    especialidade: form.especialidade,
    status: finalize ? "finalizado" : "rascunho",
    procedimento: "",
    queixaPrincipal: "",
    historiaClinica: "",
    diagnostico: "",
    procedimentoExecutado: "",
    evolucaoClinica: texto,
    planoTratamento: "",
    conduta: "",
    recomendacoes: "",
    observacoes: "",
    retorno: form.retorno || undefined,
    prescricoes: [],
    exames: [],
    orcamentos: [],
    fotos: [],
    arquivos: [],
    assinatura: finalize
      ? {
          profissional: form.profissional,
          cro: "CRO — a confirmar",
          signedAt: now,
          signed: true,
        }
      : undefined,
    auditLog: [
      {
        id: `log-${Date.now()}`,
        user: form.profissional,
        at: now,
        field: "criação",
        previous: "—",
        next: finalize ? "finalizado" : "rascunho",
      },
    ],
    active: true,
    createdAt: now,
    updatedAt: now,
  };
}
