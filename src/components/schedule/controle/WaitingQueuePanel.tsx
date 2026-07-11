"use client";

import { Clock } from "lucide-react";
import { waitingQueueMock } from "@/lib/schedule-mock";

export function WaitingQueuePanel() {
  return (
    <div className="flex-1 overflow-auto bg-white p-4">
      <h3 className="mb-4 text-sm font-semibold text-slate-800">Fila de Espera</h3>
      <div className="space-y-2">
        {waitingQueueMock.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-800">{item.patient}</p>
              <p className="text-xs text-slate-500">{item.procedure} · {item.professional}</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-amber-700">
              <Clock className="h-3.5 w-3.5" />
              {item.waitMin} min
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
