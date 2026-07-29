"use client";

import { FileText, Printer } from "lucide-react";
import type { EvolucaoClinica } from "@/lib/prontuario-types";

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function stripHtml(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function atendimentoText(evolucao: EvolucaoClinica) {
  if (evolucao.evolucaoClinica?.trim()) {
    return stripHtml(evolucao.evolucaoClinica);
  }
  const parts = [
    evolucao.queixaPrincipal,
    evolucao.historiaClinica,
    evolucao.diagnostico,
    evolucao.procedimentoExecutado,
    evolucao.planoTratamento,
    evolucao.conduta,
    evolucao.recomendacoes,
    evolucao.observacoes,
  ]
    .map((p) => stripHtml(p || ""))
    .filter(Boolean);
  return parts.join("\n\n");
}

const atendimentoTextareaClass =
  "w-full min-h-[88px] max-h-[220px] resize-y rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15";

export function ProntuarioDetail({
  evolucao,
  autosaveHint,
  onPatch,
  onPrint,
}: {
  evolucao: EvolucaoClinica | null;
  autosaveHint?: string;
  onPatch: (patch: Partial<EvolucaoClinica>) => void;
  onPrint: () => void;
}) {
  if (!evolucao) {
    return (
      <section className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
        <div>
          <FileText className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">
            Selecione um atendimento na lista
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Ou marque vários à esquerda para imprimir no mesmo PDF.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Atendimento</h3>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>
              <strong className="text-slate-700">Data:</strong> {formatDate(evolucao.date)}
            </span>
            <span>
              <strong className="text-slate-700">Horário:</strong> {evolucao.time}
            </span>
            <span>
              <strong className="text-slate-700">Profissional:</strong>{" "}
              {evolucao.profissional}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onPrint}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <Printer className="h-3.5 w-3.5" /> Imprimir
        </button>
      </div>

      {autosaveHint ? (
        <p className="border-b border-slate-50 px-5 py-2 text-[11px] text-emerald-600">
          {autosaveHint}
        </p>
      ) : null}

      <div className="p-5">
        <label
          htmlFor={`atendimento-${evolucao.id}`}
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          O que foi feito
        </label>
        <textarea
          id={`atendimento-${evolucao.id}`}
          value={atendimentoText(evolucao)}
          onChange={(e) => {
            const evolucaoClinica = e.target.value;
            onPatch({
              evolucaoClinica,
              queixaPrincipal: "",
              historiaClinica: "",
              diagnostico: "",
              procedimentoExecutado: "",
              planoTratamento: "",
              conduta: "",
              recomendacoes: "",
              observacoes: "",
              resumo: evolucaoClinica.replace(/\s+/g, " ").trim().slice(0, 140),
            });
          }}
          placeholder="Descreva o atendimento do paciente..."
          className={atendimentoTextareaClass}
          rows={4}
        />
      </div>
    </section>
  );
}
