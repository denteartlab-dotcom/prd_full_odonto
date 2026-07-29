"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Download,
  FileText,
  ImagePlus,
  Paperclip,
  Pencil,
  Pill,
  Plus,
  Printer,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { money } from "@/lib/utils";
import {
  EVOLUCAO_STATUS_LABEL,
  EVOLUCAO_TIPO_LABEL,
  type EvolucaoClinica,
} from "@/lib/prontuario-types";

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
  patientId,
  evolucao,
  autosaveHint,
  onPatch,
  onPrint,
}: {
  patientId: string;
  evolucao: EvolucaoClinica | null;
  autosaveHint?: string;
  onPatch: (patch: Partial<EvolucaoClinica>) => void;
  onPrint: () => void;
}) {
  if (!evolucao) {
    return (
      <section className="flex min-h-[640px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
        <div>
          <FileText className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">
            Selecione uma evolução na timeline
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Ou crie uma nova evolução clínica para este paciente.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[640px] rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">{evolucao.titulo}</h3>
            <button type="button" className="rounded-md p-1 text-slate-400 hover:bg-slate-50 hover:text-indigo-600">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>
              <strong className="text-slate-700">Data:</strong> {formatDate(evolucao.date)}
            </span>
            <span>
              <strong className="text-slate-700">Hora:</strong> {evolucao.time}
            </span>
            <span>
              <strong className="text-slate-700">Profissional:</strong> {evolucao.profissional}
            </span>
            <span>
              <strong className="text-slate-700">Especialidade:</strong> {evolucao.especialidade}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
            {EVOLUCAO_TIPO_LABEL[evolucao.tipo]}
          </span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            {EVOLUCAO_STATUS_LABEL[evolucao.status]}
          </span>
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Printer className="h-3.5 w-3.5" /> Imprimir
          </button>
        </div>
      </div>

      {autosaveHint ? (
        <p className="border-b border-slate-50 px-5 py-2 text-[11px] text-emerald-600">
          {autosaveHint}
        </p>
      ) : null}

      <div className="space-y-3 p-5">
        <div>
          <label
            htmlFor={`atendimento-${evolucao.id}`}
            className="mb-2 block text-sm font-semibold text-slate-800"
          >
            Atendimento
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
            placeholder="Descreva o atendimento do paciente, procedimentos realizados, conduta e orientações..."
            className={atendimentoTextareaClass}
            rows={3}
          />
        </div>

        <div className="rounded-xl border border-slate-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-800">Odontograma</h4>
            <Link
              href={`/app/pacientes/${patientId}?tab=odontograma`}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Abrir Odontograma
            </Link>
          </div>
          <p className="text-xs text-slate-500">
            Visualize e atualize o status dos dentes vinculados a este atendimento.
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-800">Prescrições</h4>
            <Link
              href={`/app/pacientes/${patientId}/receitas`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Nova Receita
            </Link>
          </div>
          {evolucao.prescricoes.length ? (
            <ul className="space-y-2">
              {evolucao.prescricoes.map((rx) => (
                <li
                  key={rx.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                >
                  <span className="inline-flex items-center gap-2 text-slate-700">
                    <Pill className="h-3.5 w-3.5 text-indigo-500" />
                    {rx.title}
                  </span>
                  <span className="text-[11px] capitalize text-slate-400">{rx.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">Nenhuma receita neste atendimento.</p>
          )}
        </div>

        <div className="rounded-xl border border-slate-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-800">Solicitação de Exames</h4>
            <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
              <Plus className="h-3.5 w-3.5" /> Solicitar Exame
            </button>
          </div>
          {evolucao.exames.length ? (
            <ul className="space-y-2">
              {evolucao.exames.map((ex) => (
                <li
                  key={ex.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                >
                  <span className="text-slate-700">{ex.title}</span>
                  <span className="text-[11px] capitalize text-slate-400">{ex.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">Nenhum exame vinculado.</p>
          )}
        </div>

        <div className="rounded-xl border border-slate-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-800">Orçamentos</h4>
            <Link
              href={`/app/pacientes/${patientId}/orcamentos`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Novo Orçamento
            </Link>
          </div>
          {evolucao.orcamentos.length ? (
            <ul className="space-y-2">
              {evolucao.orcamentos.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {o.number} — {o.title}
                    </p>
                    <p className="text-[11px] capitalize text-slate-400">{o.status}</p>
                  </div>
                  <span className="font-semibold text-slate-700">{money(o.value)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">Nenhum orçamento relacionado.</p>
          )}
        </div>

        <div className="rounded-xl border border-slate-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-800">Fotos Clínicas</h4>
            <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              <ImagePlus className="h-3.5 w-3.5" />
              Upload
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" multiple />
            </label>
          </div>
          {evolucao.fotos.length ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {evolucao.fotos.map((f) => (
                <div
                  key={f.id}
                  className="flex aspect-square flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2 text-center"
                >
                  <ImagePlus className="mb-1 h-5 w-5 text-slate-400" />
                  <p className="truncate text-[10px] text-slate-500">{f.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-xs text-slate-400">
              Arraste PNG, JPG ou WEBP aqui
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-800">Arquivos</h4>
            <label className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-indigo-600">
              <Upload className="h-3.5 w-3.5" /> Enviar arquivo
              <input
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.stl,.dcm"
              />
            </label>
          </div>
          {evolucao.arquivos.length ? (
            <ul className="space-y-2">
              {evolucao.arquivos.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                >
                  <span className="inline-flex items-center gap-2 text-slate-700">
                    <Paperclip className="h-3.5 w-3.5 text-slate-400" />
                    {a.name}
                  </span>
                  <button type="button" className="text-slate-400 hover:text-indigo-600">
                    <Download className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">
              PDF, Word, Excel, imagens, tomografia, radiografia, STL.
            </p>
          )}
        </div>

        {evolucao.assinatura?.signed ? (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
            <div className="text-sm">
              <p className="font-semibold text-emerald-800">Assinado digitalmente</p>
              <p className="text-emerald-700">
                {evolucao.assinatura.profissional} · {evolucao.assinatura.cro}
              </p>
              <p className="text-xs text-emerald-600/80">
                {new Date(evolucao.assinatura.signedAt).toLocaleString("pt-BR")}
              </p>
            </div>
            <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-600" />
          </div>
        ) : (
          <button
            type="button"
            className="w-full rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            Assinar digitalmente esta evolução
          </button>
        )}
      </div>
    </section>
  );
}
