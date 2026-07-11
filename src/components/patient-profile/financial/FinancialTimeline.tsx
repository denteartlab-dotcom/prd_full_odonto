"use client";

import type { FinancialTimelineEvent } from "@/lib/financial-types";
import { TIMELINE_LABELS } from "@/lib/financial-types";
import { FinancialSectionCard } from "./shared";

export function FinancialTimeline({
  events,
  title = "Timeline financeira",
}: {
  events: FinancialTimelineEvent[];
  title?: string;
}) {
  const sorted = [...events].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <FinancialSectionCard title={title}>
      {sorted.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhum evento registrado.</p>
      ) : (
        <ol className="space-y-3">
          {sorted.map((e) => (
            <li key={e.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              </div>
              <div className="pb-1">
                <p className="text-sm font-semibold text-slate-800">{TIMELINE_LABELS[e.type]}</p>
                <p className="text-xs text-slate-500">
                  {new Date(e.date).toLocaleString("pt-BR")} · {e.user}
                </p>
                {e.note && <p className="mt-0.5 text-xs text-slate-400">{e.note}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </FinancialSectionCard>
  );
}
