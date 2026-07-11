"use client";

import { X } from "lucide-react";

export function WaitingPatientsHeader({
  count,
  onClose,
}: {
  count: number;
  onClose: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-gradient-to-r from-[#1a3352] to-[#234468] px-5 py-4 text-white">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold tracking-tight">Pacientes Te Aguardando</h2>
        <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold shadow-sm">
          {count}
        </span>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
        aria-label="Fechar"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
