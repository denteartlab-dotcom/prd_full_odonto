"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
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
    if (open) setForm(emptyNovaEvolucaoForm(profissionalDefault));
  }, [open, profissionalDefault]);

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
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Nova Evolução</h2>
            <p className="text-xs text-slate-500">Registro clínico vinculado ao paciente</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
              Modelo pronto
            </label>
            <select
              value={form.templateId}
              onChange={(e) => applyTemplate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
            >
              <option value="">Sem modelo</option>
              {EVOLUCAO_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-700">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => patch({ tipo: e.target.value as EvolucaoTipo })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none"
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {EVOLUCAO_TIPO_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
                Especialidade
              </label>
              <input
                value={form.especialidade}
                onChange={(e) => patch({ especialidade: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-700">Data</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => patch({ date: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-700">Hora</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => patch({ time: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
              Profissional
            </label>
            <input
              value={form.profissional}
              onChange={(e) => patch({ profissional: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none"
            />
          </div>

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
            <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
              Procedimento
            </label>
            <input
              value={form.procedimento}
              onChange={(e) => patch({ procedimento: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none"
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
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-700">Retorno</label>
            <input
              type="date"
              value={form.retorno}
              onChange={(e) => patch({ retorno: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none"
            />
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

        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void submit(false)}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Salvar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void submit(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Salvar e Finalizar
          </button>
        </footer>
      </aside>
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
