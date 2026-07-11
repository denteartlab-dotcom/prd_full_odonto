"use client";

import { X } from "lucide-react";
import type { ListPatient } from "@/lib/patients-list-mock";

export function DeletePatientModal({
  patient,
  open,
  onClose,
  onConfirm,
}: {
  patient: ListPatient | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open || !patient) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] overflow-hidden rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-patient-title"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 id="delete-patient-title" className="text-base font-semibold text-slate-800">
            Excluir Paciente
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-5 text-sm leading-relaxed text-slate-700">
          <p>Deseja realmente excluir este paciente?</p>
          <p className="text-slate-600">
            Atenção!! Todos os agendamentos, prontuários e registros vinculados serão excluídos.
            Se o paciente possuir lançamentos em Contas a Receber, exclua-os no Financeiro antes.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Não
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Sim
          </button>
        </div>
      </div>
    </div>
  );
}
