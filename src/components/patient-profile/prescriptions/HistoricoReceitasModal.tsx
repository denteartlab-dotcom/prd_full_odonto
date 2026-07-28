"use client";

import { Copy, Eye, Printer, X } from "lucide-react";
import type { PrescriptionRecord } from "@/lib/prescription-types";
import { formatDisplayDate } from "@/lib/patients-list-mock";

export function HistoricoReceitasModal({
  open,
  onClose,
  items,
  onDuplicate,
  onView,
}: {
  open: boolean;
  onClose: () => void;
  items: PrescriptionRecord[];
  onDuplicate: (item: PrescriptionRecord) => void;
  onView: (item: PrescriptionRecord) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-label="Fechar" />
      <div className="relative max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Histórico de Receitas</h3>
            <p className="text-xs text-slate-500">Visualizar, duplicar e reimprimir</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          {!items.length ? (
            <p className="py-10 text-center text-sm text-slate-400">Nenhuma receita emitida ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="pb-2 font-medium">Paciente</th>
                    <th className="pb-2 font-medium">Data</th>
                    <th className="pb-2 font-medium">Dentista</th>
                    <th className="pb-2 font-medium">Medicamentos</th>
                    <th className="pb-2 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-50">
                      <td className="py-3 font-medium text-slate-800">{item.patientName}</td>
                      <td className="py-3 text-slate-600">
                        {formatDisplayDate(item.createdAt.slice(0, 10))}
                      </td>
                      <td className="py-3 text-slate-600">{item.professionalName || "—"}</td>
                      <td className="py-3 text-slate-600">
                        {(item.medications || []).map((m) => m.medicationName).join(", ") ||
                          item.content.slice(0, 60)}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title="Visualizar / PDF"
                            onClick={() => onView(item)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-indigo-600"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            title="Duplicar"
                            onClick={() => onDuplicate(item)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-indigo-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <a
                            href={item.pdfUrl || `/api/prescricoes/${item.id}/pdf#zoom=75`}
                            target="_blank"
                            rel="noreferrer"
                            title="Reimprimir"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-indigo-600"
                          >
                            <Printer className="h-4 w-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
