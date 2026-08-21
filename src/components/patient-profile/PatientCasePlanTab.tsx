"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn, money } from "@/lib/utils";
import {
  computeAge,
  type PatientCasePlan,
  type PatientCasePlanStep,
  type PatientProfile,
} from "@/lib/patient-profile-types";
import type { BudgetTreatmentStep } from "@/lib/budget-types";
import type { TreatmentPlanSuggestion } from "@/lib/treatment-plan-ai";
import {
  catalogToProcedure,
  createEmptyBudget,
  dentalBudgetsToSimple,
  DENTISTS,
  recalcBudget,
  syncTreatmentPlan,
} from "@/lib/budget-mock";
import { TreatmentPlanAiAssistant } from "@/components/budgets/TreatmentPlanAiAssistant";
import { TreatmentTimeline } from "@/components/budgets/TreatmentTimeline";
import { SectionCard, treatmentStatusBadge } from "@/components/budgets/shared";
import { ProfileCard } from "./ProfileCard";

function emptyPlan(): PatientCasePlan {
  return {
    complaint: "",
    summary: "",
    diagnosisHint: "",
    notes: "",
    steps: [],
    updatedAt: new Date().toISOString(),
  };
}

function patientSeedFromId(id: string) {
  const digits = id.replace(/\D/g, "");
  const n = Number(digits.slice(-4) || "1");
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function suggestionsToSteps(
  suggestions: TreatmentPlanSuggestion[],
  professional: string,
  existing: PatientCasePlanStep[]
): PatientCasePlanStep[] {
  const baseOrder = existing.length;
  return suggestions.map((s, i) => ({
    id: `cps-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
    order: baseOrder + i + 1,
    title: s.name,
    status: "pendente" as const,
    code: s.code,
    category: s.category,
    unitPrice: s.price,
    estimatedMinutes: s.estimatedMinutes,
    reason: s.reason,
    priority: s.priority,
    professional,
  }));
}

function toTimelineSteps(steps: PatientCasePlanStep[]): BudgetTreatmentStep[] {
  return steps.map((s) => ({
    id: s.id,
    order: s.order,
    title: s.title,
    status: s.status,
    plannedDate: s.plannedDate,
    professional: s.professional,
  }));
}

export function PatientCasePlanTab({
  patient,
  onUpdate,
  onGoToBudgets,
}: {
  patient: PatientProfile;
  onUpdate: (patch: Partial<PatientProfile>) => void;
  onGoToBudgets?: () => void;
}) {
  const plan = patient.casePlan ?? emptyPlan();
  const [savingBudget, setSavingBudget] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const dentist = DENTISTS[0]?.name || "Dentista";
  const age = computeAge(patient.birthDate);

  const timelineSteps = useMemo(
    () => toTimelineSteps(plan.steps),
    [plan.steps]
  );

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }

  function persist(next: PatientCasePlan) {
    onUpdate({
      casePlan: {
        ...next,
        updatedAt: new Date().toISOString(),
      },
    });
  }

  function patchPlan(patch: Partial<PatientCasePlan>) {
    persist({ ...plan, ...patch });
  }

  function applySuggestions(suggestions: TreatmentPlanSuggestion[]) {
    const steps = [
      ...plan.steps,
      ...suggestionsToSteps(suggestions, dentist, plan.steps),
    ].map((s, i) => ({ ...s, order: i + 1 }));

    persist({
      ...plan,
      summary: suggestions.length
        ? plan.summary || `Plano com ${steps.length} etapa(s) sugerida(s) pela IA.`
        : plan.summary,
      steps,
    });
    showToast(`${suggestions.length} etapa(s) adicionada(s) ao planejamento.`);
  }

  function reorderFromTimeline(steps: BudgetTreatmentStep[]) {
    const byId = new Map(plan.steps.map((s) => [s.id, s]));
    const next = steps
      .map((s, i) => {
        const prev = byId.get(s.id);
        if (!prev) return null;
        return { ...prev, order: i + 1 };
      })
      .filter(Boolean) as PatientCasePlanStep[];
    patchPlan({ steps: next });
  }

  function updateStepStatus(
    id: string,
    status: PatientCasePlanStep["status"]
  ) {
    patchPlan({
      steps: plan.steps.map((s) => (s.id === id ? { ...s, status } : s)),
    });
  }

  function removeStep(id: string) {
    patchPlan({
      steps: plan.steps
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, order: i + 1 })),
    });
  }

  function clearPlan() {
    persist(emptyPlan());
    showToast("Planejamento limpo.");
  }

  function createBudgetFromPlan() {
    if (!plan.steps.length) {
      showToast("Adicione etapas ao plano antes de gerar o orçamento.");
      return;
    }
    setSavingBudget(true);
    try {
      const procedures = plan.steps.map((step) =>
        catalogToProcedure({
          id: step.id,
          code: step.code || `PR${String(step.order).padStart(6, "0")}`,
          name: step.title,
          category: step.category || "Odontologia",
          price: step.unitPrice && step.unitPrice > 0 ? step.unitPrice : 350,
          estimatedMinutes: step.estimatedMinutes || 45,
          source: "ai",
        })
      );

      const seed = patientSeedFromId(patient.id);
      let budget = createEmptyBudget(seed, dentist);
      budget = recalcBudget({
        ...budget,
        notes: [
          plan.complaint ? `Queixa: ${plan.complaint}` : "",
          plan.summary ? `Resumo: ${plan.summary}` : "",
          plan.diagnosisHint ? `Hipótese: ${plan.diagnosisHint}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        procedures,
        treatmentPlan: syncTreatmentPlan(procedures, dentist, []),
      });

      const existing = patient.dentalBudgets?.length
        ? patient.dentalBudgets
        : [];
      const dentalBudgets = [budget, ...existing];
      onUpdate({
        dentalBudgets,
        budgets: dentalBudgetsToSimple(dentalBudgets),
        casePlan: {
          ...plan,
          updatedAt: new Date().toISOString(),
        },
      });
      showToast(`Orçamento ${budget.number} criado a partir do plano.`);
      onGoToBudgets?.();
    } finally {
      setSavingBudget(false);
    }
  }

  return (
    <div className="space-y-5">
      <ProfileCard
        title="Planejamento do caso"
        action={
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-600">
            <Sparkles className="h-3.5 w-3.5" />
            Com assistente de IA
          </span>
        }
      >
        <p className="text-sm text-slate-600">
          Descreva a queixa, gere sugestões automáticas de tratamento e monte o
          plano clínico deste paciente. Depois você pode transformar o plano em
          orçamento.
        </p>
        {plan.updatedAt ? (
          <p className="mt-2 text-[11px] text-slate-400">
            Última atualização:{" "}
            {new Date(plan.updatedAt).toLocaleString("pt-BR")}
          </p>
        ) : null}
      </ProfileCard>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <TreatmentPlanAiAssistant
          editable
          dentist={dentist}
          title="IA — Sugestões de tratamento"
          applyLabel="Adicionar ao planejamento"
          complaint={plan.complaint}
          onComplaintChange={(complaint) => patchPlan({ complaint })}
          patientContext={{
            age: String(age),
            allergies: patient.anamnesis?.allergies,
            notes: [
              patient.anamnesis?.diseases,
              patient.anamnesis?.medications,
              patient.observacoesInternas,
            ]
              .filter(Boolean)
              .join(" · "),
          }}
          onApplySuggestions={applySuggestions}
        />

        <SectionCard title="Resumo do planejamento">
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Resumo clínico
          </label>
          <textarea
            value={plan.summary}
            onChange={(e) => patchPlan({ summary: e.target.value })}
            rows={3}
            placeholder="Síntese do caso após avaliação / IA…"
            className="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
          />
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Hipótese diagnóstica
          </label>
          <input
            value={plan.diagnosisHint}
            onChange={(e) => patchPlan({ diagnosisHint: e.target.value })}
            placeholder="Ex.: Pulpite irreversível no 36"
            className="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
          />
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Notas do profissional
          </label>
          <textarea
            value={plan.notes}
            onChange={(e) => patchPlan({ notes: e.target.value })}
            rows={3}
            placeholder="Observações internas do planejamento…"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={createBudgetFromPlan}
              disabled={savingBudget || plan.steps.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {savingBudget ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ClipboardList className="h-4 w-4" />
              )}
              Gerar orçamento do plano
            </button>
            <button
              type="button"
              onClick={clearPlan}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Limpar plano
            </button>
          </div>
        </SectionCard>
      </div>

      <TreatmentTimeline
        steps={timelineSteps}
        editable
        onReorder={reorderFromTimeline}
      />

      {plan.steps.length > 0 ? (
        <SectionCard title="Etapas do caso">
          <ul className="space-y-2">
            {[...plan.steps]
              .sort((a, b) => a.order - b.order)
              .map((step) => (
                <li
                  key={step.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400">
                        #{step.order}
                      </span>
                      <p className="text-sm font-semibold text-slate-800">
                        {step.title}
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                          treatmentStatusBadge(step.status)
                        )}
                      >
                        {step.status.replace("_", " ")}
                      </span>
                    </div>
                    {step.reason ? (
                      <p className="mt-1 text-xs text-slate-500">{step.reason}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-slate-500">
                      {[step.category, step.code].filter(Boolean).join(" · ")}
                      {step.unitPrice
                        ? ` · ${money(step.unitPrice)}`
                        : ""}
                      {step.estimatedMinutes
                        ? ` · ~${step.estimatedMinutes} min`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={step.status}
                      onChange={(e) =>
                        updateStepStatus(
                          step.id,
                          e.target.value as PatientCasePlanStep["status"]
                        )
                      }
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700"
                    >
                      <option value="pendente">Pendente</option>
                      <option value="em_andamento">Em andamento</option>
                      <option value="concluido">Concluído</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeStep(step.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-2 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remover
                    </button>
                  </div>
                </li>
              ))}
          </ul>
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {plan.steps.filter((s) => s.status === "concluido").length} de{" "}
            {plan.steps.length} etapa(s) concluída(s)
          </p>
        </SectionCard>
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 right-6 z-[120] rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-xl">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
