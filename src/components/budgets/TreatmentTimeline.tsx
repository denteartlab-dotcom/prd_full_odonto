"use client";

import { CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BudgetTreatmentStep } from "@/lib/budget-types";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import { SectionCard, treatmentStatusBadge } from "./shared";

export function TreatmentTimeline({ steps }: { steps: BudgetTreatmentStep[] }) {
  if (steps.length === 0) {
    return (
      <SectionCard title="Plano de tratamento">
        <p className="py-4 text-center text-sm text-slate-400">
          Nenhuma etapa definida. Adicione procedimentos para gerar o plano.
        </p>
      </SectionCard>
    );
  }

  const sorted = [...steps].sort((a, b) => a.order - b.order);

  return (
    <SectionCard title="Plano de tratamento">
      <div className="relative space-y-0">
        {sorted.map((step, i) => (
          <div key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
            {i < sorted.length - 1 && (
              <div className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-0.5 bg-slate-200" />
            )}
            <div className="relative z-10 shrink-0">
              <StepIcon status={step.status} order={step.order} />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-800">{step.title}</p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                    treatmentStatusBadge(step.status)
                  )}
                >
                  {step.status.replace("_", " ")}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-slate-500">
                {step.plannedDate && (
                  <span>Previsto: {formatDisplayDate(step.plannedDate)}</span>
                )}
                <span>{step.professional}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function StepIcon({ status, order }: { status: BudgetTreatmentStep["status"]; order: number }) {
  if (status === "concluido") {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 className="h-4 w-4" />
      </div>
    );
  }
  if (status === "em_andamento") {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
        <Clock className="h-4 w-4" />
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-xs font-bold text-slate-500">
      {order}
    </div>
  );
}

export function BudgetHistoryTimeline({
  events,
}: {
  events: import("@/lib/budget-types").BudgetHistoryEvent[];
}) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <SectionCard title="Histórico">
      <div className="space-y-4">
        {sorted.map((event, i) => (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              {i < sorted.length - 1 && <div className="mt-1 w-0.5 flex-1 bg-slate-200" />}
            </div>
            <div className="pb-2">
              <p className="text-sm font-semibold capitalize text-slate-800">
                {event.type}
              </p>
              <p className="text-xs text-slate-500">
                {new Date(event.date).toLocaleString("pt-BR")} · {event.user}
              </p>
              {event.note && <p className="mt-0.5 text-xs text-slate-400">{event.note}</p>}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
