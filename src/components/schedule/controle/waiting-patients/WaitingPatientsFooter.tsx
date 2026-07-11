"use client";

import { ListOrdered } from "lucide-react";

export function WaitingPatientsFooter({ onViewAll }: { onViewAll: () => void }) {
  return (
    <div className="shrink-0 border-t border-slate-200 bg-slate-50 p-4">
      <button
        type="button"
        onClick={onViewAll}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
      >
        <ListOrdered className="h-4 w-4" />
        Ver todos na fila de espera
      </button>
    </div>
  );
}
