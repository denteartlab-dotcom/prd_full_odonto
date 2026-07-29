"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check, Loader2, X } from "lucide-react";
import { EVOLUCAO_TEMPLATES } from "@/lib/prontuario-mock";
import {
  emptyNovaEvolucaoForm,
  EVOLUCAO_TIPO_LABEL,
  type EvolucaoClinica,
  type EvolucaoTipo,
  type NovaEvolucaoForm,
} from "@/lib/prontuario-types";
import { RichTextField } from "./RichTextField";

const TIPOS = Object.keys(EVOLUCAO_TIPO_LABEL) as EvolucaoTipo[];

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15";

function FieldLabel({
  children,
  required,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
      {children}
      {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
    </label>
  );
}

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

  function patch(p: Partial<NovaEvolucaoForm>) {
    setForm((f) => ({ ...f, ...p }));
  }

  function applyTemplate(id: string) {
    const tpl = EVOLUCAO_TEMPLATES.find((t) => t.id === id);
    if (!tpl) {
      patch({ templateId: "" });
      return;
    }
    patch({
      templateId: id,
      tipo: tpl.tipo,
      queixaPrincipal: tpl.queixaPrincipal,
      diagnostico: tpl.diagnostico,
      procedimento: tpl.procedimento,
      descricaoCompleta: tpl.evolucaoClinica,
      conduta: tpl.conduta,
      planoTratamento: tpl.planoTratamento,
    });
  }

  async function submit(finalize: boolean) {
    setSaving(true);
    await new Promise((r) => window.setTimeout(r, 350));
    onSave(form, finalize);
    setSaving(false);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-stretch justify-center bg-slate-900/55 p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="nova-evolucao-title"
        className="relative z-[95] flex h-[100dvh] w-full max-w-[1100px] flex-col overflow-hidden bg-white shadow-2xl sm:h-[min(92vh,900px)] sm:rounded-2xl"
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
            <p className="mt-0.5 text-sm text-slate-500">
              Registro clínico vinculado ao paciente
            </p>
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
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Dados do atendimento
              </h3>
              <div className="space-y-4">
                <div>
                  <FieldLabel>Modelo pronto</FieldLabel>
                  <select
                    value={form.templateId}
                    onChange={(e) => applyTemplate(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">Sem modelo</option>
                    {EVOLUCAO_TEMPLATES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel required>Tipo</FieldLabel>
                    <select
                      value={form.tipo}
                      onChange={(e) =>
                        patch({ tipo: e.target.value as EvolucaoTipo })
                      }
                      className={fieldClass}
                    >
                      {TIPOS.map((t) => (
                        <option key={t} value={t}>
                          {EVOLUCAO_TIPO_LABEL[t]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Especialidade</FieldLabel>
                    <input
                      value={form.especialidade}
                      onChange={(e) => patch({ especialidade: e.target.value })}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <FieldLabel required>Data</FieldLabel>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => patch({ date: e.target.value })}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <FieldLabel required>Hora</FieldLabel>
                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) => patch({ time: e.target.value })}
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel required>Profissional</FieldLabel>
                  <input
                    value={form.profissional}
                    onChange={(e) => patch({ profissional: e.target.value })}
                    className={fieldClass}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Evolução clínica
              </h3>
              <div className="space-y-4">
                <RichTextField
                  label="Queixa Principal"
                  value={form.queixaPrincipal}
                  onChange={(queixaPrincipal) => patch({ queixaPrincipal })}
                />
                <RichTextField
                  label="Diagnóstico"
                  value={form.diagnostico}
                  onChange={(diagnostico) => patch({ diagnostico })}
                />
                <div>
                  <FieldLabel>Procedimento</FieldLabel>
                  <input
                    value={form.procedimento}
                    onChange={(e) => patch({ procedimento: e.target.value })}
                    className={fieldClass}
                    placeholder="Ex.: Profilaxia, canal 26..."
                  />
                </div>
                <RichTextField
                  label="Descrição Completa"
                  value={form.descricaoCompleta}
                  onChange={(descricaoCompleta) => patch({ descricaoCompleta })}
                  minHeight={110}
                />
                <RichTextField
                  label="Conduta"
                  value={form.conduta}
                  onChange={(conduta) => patch({ conduta })}
                />
                <RichTextField
                  label="Plano de Tratamento"
                  value={form.planoTratamento}
                  onChange={(planoTratamento) => patch({ planoTratamento })}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Retorno e anexos
              </h3>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Retorno</FieldLabel>
                    <input
                      type="date"
                      value={form.retorno}
                      onChange={(e) => patch({ retorno: e.target.value })}
                      className={fieldClass}
                    />
                  </div>
                </div>
                <RichTextField
                  label="Observações"
                  value={form.observacoes}
                  onChange={(observacoes) => patch({ observacoes })}
                />
                <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-400">
                  Anexos (fotos, PDF, exames) — preparado para upload via API
                </div>
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3 text-xs text-indigo-800">
                  Assinatura digital poderá ser solicitada ao finalizar o atendimento.
                </div>
              </div>
            </section>
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
    </div>
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
  const resumo =
    plain(form.descricaoCompleta) ||
    plain(form.queixaPrincipal) ||
    form.procedimento ||
    "Nova evolução clínica";

  return {
    id: `ev-${patientId}-${Date.now()}`,
    patientId,
    tipo: form.tipo,
    titulo: `${EVOLUCAO_TIPO_LABEL[form.tipo]} — ${form.procedimento || "Atendimento"}`,
    resumo: resumo.slice(0, 140),
    date: form.date,
    time: form.time,
    profissional: form.profissional,
    especialidade: form.especialidade,
    status: finalize ? "finalizado" : "rascunho",
    procedimento: form.procedimento,
    queixaPrincipal: form.queixaPrincipal,
    historiaClinica: "",
    diagnostico: form.diagnostico,
    procedimentoExecutado: form.procedimento,
    evolucaoClinica: form.descricaoCompleta,
    planoTratamento: form.planoTratamento,
    conduta: form.conduta,
    recomendacoes: "",
    observacoes: form.observacoes,
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
