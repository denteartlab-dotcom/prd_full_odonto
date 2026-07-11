"use client";

import { Eye } from "lucide-react";
import type { PatientConsultation } from "@/lib/consultation-types";
import { isPast } from "@/lib/consultation-types";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import { ConsultationCard, ConsultationStatusBadge } from "./shared";

export function ConsultationHistoryTable({
  consultations,
  onView,
}: {
  consultations: PatientConsultation[];
  onView: (id: string) => void;
}) {
  const history = consultations
    .filter((c) => isPast(c.status))
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));

  return (
    <ConsultationCard title="Histórico de consultas">
      {history.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">
          Nenhuma consulta no histórico.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wide text-slate-400">
                <th className="pb-3 pr-4 font-medium">Data</th>
                <th className="pb-3 pr-4 font-medium">Horário</th>
                <th className="pb-3 pr-4 font-medium">Procedimento</th>
                <th className="pb-3 pr-4 font-medium">Dentista</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium">Observações</th>
                <th className="pb-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {history.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-slate-50 transition hover:bg-slate-50/80"
                >
                  <td className="py-3 pr-4 text-slate-700">{formatDisplayDate(c.date)}</td>
                  <td className="py-3 pr-4 text-slate-700">{c.time}</td>
                  <td className="py-3 pr-4 font-medium text-slate-800">{c.procedure}</td>
                  <td className="py-3 pr-4 text-slate-600">{c.professional}</td>
                  <td className="py-3 pr-4">
                    <ConsultationStatusBadge status={c.status} />
                  </td>
                  <td className="max-w-[200px] truncate py-3 pr-4 text-slate-500">
                    {c.notes || "—"}
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => onView(c.id)}
                      className="inline-flex items-center gap-1 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ConsultationCard>
  );
}
