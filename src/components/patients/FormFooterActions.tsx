"use client";

import { Check } from "lucide-react";
import Link from "next/link";

export function FormFooterActions({
  onSave,
  onSaveAndNew,
  saving,
}: {
  onSave: () => void;
  onSaveAndNew: () => void;
  saving?: boolean;
}) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-slate-200/80 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
        <Link
          href="/app/pacientes"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Cancelar
        </Link>
        <button
          type="button"
          disabled={saving}
          onClick={onSaveAndNew}
          className="inline-flex items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-60"
        >
          Salvar e novo
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-600 hover:to-blue-700 disabled:opacity-60"
        >
          <Check className="h-4 w-4" />
          Salvar paciente
        </button>
      </div>
    </div>
  );
}
