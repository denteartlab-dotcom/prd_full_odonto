"use client";

import { X } from "lucide-react";
import { statusMeta, type AppointmentStatus } from "@/lib/schedule-mock";

export function AgendaFilterDrawer({
  open,
  statusFilter,
  onStatusChange,
  onClose,
  onClear,
}: {
  open: boolean;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  onClose: () => void;
  onClear: () => void;
}) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-slate-900/40" onClick={onClose} aria-hidden />
      <aside className="fixed inset-y-0 right-0 z-[75] w-full max-w-sm border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-800">Filtrar agenda</h3>
          <button type="button" onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 p-4">
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-500">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Todos</option>
              {(Object.keys(statusMeta) as AppointmentStatus[]).map((s) => (
                <option key={s} value={s}>
                  {statusMeta[s].label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClear}
              className="flex-1 rounded-md border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Aplicar
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
