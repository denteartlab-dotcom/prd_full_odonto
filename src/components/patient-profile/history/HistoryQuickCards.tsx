"use client";

import { HISTORY_QUICK_ICON } from "./shared";
import type { HistoryQuickIndicator } from "@/lib/patient-history-types";

export function HistoryQuickCards({
  items,
  onDetails,
}: {
  items: HistoryQuickIndicator[];
  onDetails?: (id: string) => void;
}) {
  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {items.map((item) => {
        const Icon = HISTORY_QUICK_ICON[item.icon] || HISTORY_QUICK_ICON.consulta;
        return (
          <div
            key={item.id}
            className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-3 inline-flex rounded-xl bg-indigo-50 p-2 text-indigo-600">
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {item.label}
            </p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">
              {item.value}
            </p>
            {item.hint ? (
              <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">{item.hint}</p>
            ) : null}
            <button
              type="button"
              onClick={() => onDetails?.(item.id)}
              className="mt-3 text-[11px] font-semibold text-indigo-600 opacity-90 transition group-hover:opacity-100 hover:underline"
            >
              Ver detalhes
            </button>
          </div>
        );
      })}
    </div>
  );
}
