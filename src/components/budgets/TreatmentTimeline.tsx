"use client";

import { useState } from "react";
import { CheckCircle2, Clock, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BudgetTreatmentStep } from "@/lib/budget-types";
import { reorderTreatmentPlan } from "@/lib/budget-mock";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import { SectionCard, treatmentStatusBadge } from "./shared";

export function TreatmentTimeline({
  steps,
  editable,
  onReorder,
}: {
  steps: BudgetTreatmentStep[];
  editable?: boolean;
  onReorder?: (steps: BudgetTreatmentStep[]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

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
  const canDrag = Boolean(editable && onReorder && sorted.length > 1);

  function handleDrop(toIndex: number) {
    if (dragIndex == null || !onReorder) return;
    onReorder(reorderTreatmentPlan(sorted, dragIndex, toIndex));
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <SectionCard title="Plano de tratamento">
      {canDrag ? (
        <p className="mb-3 text-[11px] text-slate-400">
          Arraste pelo ícone para mudar a ordem do tratamento.
        </p>
      ) : null}
      <div className="relative space-y-0">
        {sorted.map((step, i) => (
          <div
            key={step.id}
            draggable={canDrag}
            onDragStart={(e) => {
              if (!canDrag) return;
              setDragIndex(i);
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", String(i));
            }}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
            onDragOver={(e) => {
              if (!canDrag || dragIndex == null) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (overIndex !== i) setOverIndex(i);
            }}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(i);
            }}
            className={cn(
              "relative flex gap-3 pb-6 last:pb-0",
              canDrag && "rounded-xl transition",
              dragIndex === i && "opacity-50",
              overIndex === i && dragIndex !== null && dragIndex !== i
                ? "bg-indigo-50/80 ring-1 ring-indigo-200"
                : null
            )}
          >
            {i < sorted.length - 1 && (
              <div className="absolute left-[27px] top-8 h-[calc(100%-8px)] w-0.5 bg-slate-200" />
            )}

            {canDrag ? (
              <button
                type="button"
                className="relative z-10 mt-1.5 shrink-0 cursor-grab touch-none rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
                aria-label={`Arrastar etapa ${step.order}`}
                title="Arrastar para reordenar"
                tabIndex={-1}
              >
                <GripVertical className="h-4 w-4" />
              </button>
            ) : (
              <div className="w-0 shrink-0" />
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

function StepIcon({
  status,
  order,
}: {
  status: BudgetTreatmentStep["status"];
  order: number;
}) {
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
              {i < sorted.length - 1 && (
                <div className="mt-1 w-0.5 flex-1 bg-slate-200" />
              )}
            </div>
            <div className="pb-2">
              <p className="text-sm font-semibold capitalize text-slate-800">
                {event.type}
              </p>
              <p className="text-xs text-slate-500">
                {new Date(event.date).toLocaleString("pt-BR")} · {event.user}
              </p>
              {event.note && (
                <p className="mt-0.5 text-xs text-slate-400">{event.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
