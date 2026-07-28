"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, Loader2, Sparkles, X } from "lucide-react";
import type { ReceituarioLine } from "@/lib/receituario-types";
import type { AssistenteResult } from "@/lib/receituario-assistente";

export function AssistenteIAModal({
  open,
  onClose,
  onApply,
  patientContext,
}: {
  open: boolean;
  onClose: () => void;
  onApply: (payload: {
    lines: ReceituarioLine[];
    notes: string;
    summary: string;
  }) => void;
  patientContext?: {
    allergies?: string;
    diseases?: string;
    medicationsInUse?: string;
  };
}) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AssistenteResult | null>(null);

  useEffect(() => {
    if (!open) return;
    setError("");
    setResult(null);
  }, [open]);

  async function generate() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/receituario/assistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          allergies: patientContext?.allergies,
          diseases: patientContext?.diseases,
          medicationsInUse: patientContext?.medicationsInUse,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao gerar sugestão.");
      setResult(data as AssistenteResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível gerar a sugestão.");
    } finally {
      setLoading(false);
    }
  }

  function apply() {
    if (!result?.suggestions.length) return;
    onApply({
      lines: result.suggestions.map((s) => s.line),
      notes: result.notes,
      summary: result.summary,
    });
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-label="Fechar"
      />
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Assistente IA</h3>
              <p className="text-xs text-slate-500">
                Sugere medicamentos e posologia a partir do procedimento
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
              Descreva o procedimento realizado
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder={
                "Ex.: Extração de terceiro molar.\nPaciente sem alergias.\nDor moderada."
              }
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          ) : null}

          {result ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 px-3 py-2.5">
                <p className="text-xs font-semibold text-indigo-900">{result.procedureLabel}</p>
                <p className="mt-1 text-xs text-indigo-800">{result.summary}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-indigo-500">
                  Fonte:{" "}
                  {result.source === "gemini"
                    ? "Google Gemini (gratuito)"
                    : result.source === "perplexity"
                      ? "Perplexity (pesquisa na internet)"
                      : result.source === "openai"
                        ? "OpenAI"
                        : "Assistente clínico local (gratuito)"}
                </p>
              </div>

              {result.citations?.length ? (
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <p className="text-[11px] font-semibold text-slate-700">Fontes consultadas</p>
                  <ul className="mt-1 space-y-1">
                    {result.citations.map((url) => (
                      <li key={url}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-[11px] text-indigo-600 hover:underline"
                        >
                          {url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {result.alerts.length ? (
                <ul className="space-y-1.5">
                  {result.alerts.map((alert) => (
                    <li
                      key={alert}
                      className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
                    >
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {alert}
                    </li>
                  ))}
                </ul>
              ) : null}

              <ul className="space-y-2">
                {result.suggestions.map((item) => (
                  <li
                    key={item.line.id}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                  >
                    <p className="text-sm font-semibold text-slate-900">{item.line.name}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {item.line.quantity} · {item.line.posology} · {item.line.duration}
                    </p>
                    <p className="mt-1 text-[11px] text-indigo-700">{item.reason}</p>
                  </li>
                ))}
              </ul>

              {result.notes ? (
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Observações: </span>
                  {result.notes}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
              Funciona de graça com protocolos locais. Opcional: configure GEMINI_API_KEY (Google AI
              Studio, tier gratuito) para sugestões com IA. O dentista sempre valida antes de emitir.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
          >
            Fechar
          </button>
          {result ? (
            <button
              type="button"
              onClick={apply}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Check className="h-4 w-4" />
              Aplicar na receita
            </button>
          ) : (
            <button
              type="button"
              disabled={!prompt.trim() || loading}
              onClick={() => void generate()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Gerando…" : "Gerar sugestão"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
