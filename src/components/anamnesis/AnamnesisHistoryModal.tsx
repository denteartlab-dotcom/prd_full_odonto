"use client";

import { X } from "lucide-react";
import type { AnamnesisVersion } from "@/lib/anamnesis-types";
import { formatDisplayDate } from "@/lib/patients-list-mock";

export function AnamnesisHistoryModal({
  open,
  onClose,
  versions,
}: {
  open: boolean;
  onClose: () => void;
  versions: AnamnesisVersion[];
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} aria-label="Fechar" />
      <div className="relative max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Histórico de versões</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-5">
          {versions.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Nenhuma versão anterior registrada. Salve a anamnese para criar a primeira versão.
            </p>
          ) : (
            <ul className="space-y-3">
              {versions.map((v, i) => (
                <li key={v.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Versão {versions.length - i}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{v.professionalName}</p>
                    </div>
                    <time className="text-xs text-slate-400">
                      {formatDisplayDate(v.savedAt.slice(0, 10))}
                    </time>
                  </div>
                  <p className="mt-2 text-xs text-slate-600 line-clamp-2">{v.snapshot}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
