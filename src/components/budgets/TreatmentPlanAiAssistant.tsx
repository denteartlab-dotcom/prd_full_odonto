"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { cn, money } from "@/lib/utils";
import type { BudgetProcedure, ProcedureCatalogItem } from "@/lib/budget-types";
import { catalogToProcedure } from "@/lib/budget-mock";
import type { TreatmentPlanAiResult, TreatmentPlanSuggestion } from "@/lib/treatment-plan-ai";
import { SectionCard } from "./shared";

const PRIORITY_LABEL: Record<TreatmentPlanSuggestion["priority"], string> = {
  urgente: "Urgente",
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

const PRIORITY_CLASS: Record<TreatmentPlanSuggestion["priority"], string> = {
  urgente: "bg-red-100 text-red-700",
  alta: "bg-amber-100 text-amber-800",
  media: "bg-slate-100 text-slate-600",
  baixa: "bg-emerald-100 text-emerald-700",
};

function isProviderBrandingAlert(alert: string) {
  return /via\s+(groq|gemini|openai)|pesquisa na internet|gratuito\)/i.test(alert);
}

export function TreatmentPlanAiAssistant({
  editable,
  dentist,
  onApplyProcedures,
  patientContext,
}: {
  editable?: boolean;
  dentist?: string;
  onApplyProcedures: (procedures: BudgetProcedure[]) => void;
  patientContext?: {
    age?: string;
    allergies?: string;
    notes?: string;
  };
}) {
  const [complaint, setComplaint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TreatmentPlanAiResult | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!result?.suggestions.length) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(result.suggestions.map((s) => s.id)));
  }, [result]);

  const selectedCount = selected.size;
  const providerLabel = useMemo(() => {
    if (!result?.provider) return null;
    if (result.provider === "heuristic") return "protocolos locais";
    return result.provider;
  }, [result?.provider]);

  if (!editable) return null;

  async function generate() {
    const text = complaint.trim();
    if (text.length < 8) {
      setError("Descreva a queixa com pelo menos 8 caracteres.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/orcamentos/plano-tratamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaint: text,
          age: patientContext?.age,
          allergies: patientContext?.allergies,
          notes: patientContext?.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao gerar sugestões.");
      const parsed = data as TreatmentPlanAiResult;
      setResult({
        ...parsed,
        alerts: (parsed.alerts || []).filter((a) => !isProviderBrandingAlert(a)),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível gerar o plano."
      );
    } finally {
      setLoading(false);
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function applySelected() {
    if (!result?.suggestions.length) return;
    const ordered = [...result.suggestions]
      .filter((s) => selected.has(s.id))
      .sort((a, b) => a.order - b.order);
    if (!ordered.length) {
      setError("Selecione ao menos um procedimento para aplicar.");
      return;
    }
    const procedures = ordered.map((item) => {
      const catalog: ProcedureCatalogItem = {
        id: item.id,
        code: item.code,
        name: item.name,
        category: item.category,
        price: item.price,
        estimatedMinutes: item.estimatedMinutes,
        source: "ai",
      };
      return catalogToProcedure(catalog);
    });
    onApplyProcedures(procedures);
    setError("");
  }

  return (
    <SectionCard
      title="Assistente IA — Plano de tratamento"
      action={
        providerLabel ? (
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            via {providerLabel}
          </span>
        ) : undefined
      }
    >
      <p className="mb-3 text-xs text-slate-500">
        Descreva a queixa do paciente e a IA sugere etapas de tratamento
        automaticamente (Groq / Gemini gratuitos, com fallback local).
      </p>

      <label className="mb-1 block text-xs font-medium text-slate-600">
        Queixa principal
      </label>
      <textarea
        value={complaint}
        onChange={(e) => setComplaint(e.target.value)}
        rows={3}
        placeholder="Ex.: Dor espontânea no 36 há 3 dias, sensibilidade ao frio e calor, leve inchaço gengival…"
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4" />
          )}
          {loading ? "Gerando sugestões…" : "Sugerir tratamento"}
        </button>
        {dentist ? (
          <span className="text-[11px] text-slate-400">
            Profissional do orçamento: {dentist}
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="mt-3 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2.5">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-indigo-800">
              <Sparkles className="h-3.5 w-3.5" />
              Resumo clínico
            </div>
            <p className="text-sm text-slate-700">{result.summary}</p>
            {result.diagnosisHint ? (
              <p className="mt-1.5 text-xs text-slate-500">
                Hipótese: {result.diagnosisHint}
              </p>
            ) : null}
          </div>

          <ul className="space-y-2">
            {result.suggestions.map((s) => {
              const active = selected.has(s.id);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => toggle(s.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                      active
                        ? "border-indigo-200 bg-indigo-50/50"
                        : "border-slate-200 bg-white opacity-70"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                        active
                          ? "border-indigo-500 bg-indigo-600 text-white"
                          : "border-slate-300 bg-white text-transparent"
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">
                          Etapa {s.order}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            PRIORITY_CLASS[s.priority]
                          )}
                        >
                          {PRIORITY_LABEL[s.priority]}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {s.category}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm font-semibold text-slate-800">
                        {s.name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">{s.reason}</p>
                      <p className="mt-1 text-xs font-medium text-slate-600">
                        {money(s.price)} · ~{s.estimatedMinutes} min
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {result.notes ? (
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-600">Notas: </span>
              {result.notes}
            </p>
          ) : null}

          {result.alerts?.length ? (
            <ul className="space-y-1">
              {result.alerts.map((alert) => (
                <li
                  key={alert}
                  className="flex items-start gap-1.5 text-[11px] text-amber-800"
                >
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                  {alert}
                </li>
              ))}
            </ul>
          ) : null}

          <button
            type="button"
            onClick={applySelected}
            disabled={selectedCount === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-3.5 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            Aplicar {selectedCount} ao orçamento / plano
          </button>
        </div>
      ) : null}
    </SectionCard>
  );
}
