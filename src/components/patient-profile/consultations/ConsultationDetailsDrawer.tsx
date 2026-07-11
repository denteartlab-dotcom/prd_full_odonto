"use client";

import { FileText, Pencil, Printer, X } from "lucide-react";
import { money } from "@/lib/utils";
import type { PatientConsultation } from "@/lib/consultation-types";
import { CONSULTATION_STATUS_LABELS } from "@/lib/consultation-types";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import { ConsultationStatusBadge } from "./shared";

export function ConsultationDetailsDrawer({
  consultation,
  open,
  onClose,
  onEdit,
  onPrint,
}: {
  consultation: PatientConsultation | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onPrint: () => void;
}) {
  if (!open || !consultation) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[1px]" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-[110] flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-xs text-slate-400">Detalhes da consulta</p>
            <h2 className="text-lg font-bold text-slate-900">{consultation.procedure}</h2>
            <ConsultationStatusBadge status={consultation.status} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Data" value={formatDisplayDate(consultation.date)} />
            <Field label="Horário" value={consultation.time} />
            <Field label="Dentista" value={consultation.professional} />
            <Field label="Status" value={CONSULTATION_STATUS_LABELS[consultation.status]} />
            {consultation.value != null && (
              <Field label="Valor" value={money(consultation.value)} highlight />
            )}
          </div>

          {consultation.notes && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-[11px] font-medium uppercase text-slate-400">
                Observações clínicas
              </p>
              <p className="mt-1 text-sm text-slate-700">{consultation.notes}</p>
            </div>
          )}

          {consultation.documents && consultation.documents.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-medium uppercase text-slate-400">
                Documentos vinculados
              </p>
              <ul className="space-y-2">
                {consultation.documents.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm"
                  >
                    <FileText className="h-4 w-4 text-indigo-500" />
                    {d.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <footer className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Fechar
          </button>
        </footer>
      </aside>
    </>
  );
}

function Field({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2">
      <p className="text-[10px] font-medium uppercase text-slate-400">{label}</p>
      <p className={`mt-0.5 text-sm ${highlight ? "font-bold text-slate-900" : "text-slate-700"}`}>
        {value}
      </p>
    </div>
  );
}
