"use client";

import { CalendarClock, Eye, XCircle } from "lucide-react";
import type { PatientConsultation } from "@/lib/consultation-types";
import { isUpcoming } from "@/lib/consultation-types";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import { ConsultationCard, ConsultationStatusBadge } from "./shared";

export function UpcomingConsultationsCard({
  consultations,
  onView,
  onReschedule,
  onCancel,
}: {
  consultations: PatientConsultation[];
  onView: (id: string) => void;
  onReschedule: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const upcoming = consultations
    .filter((c) => isUpcoming(c.status))
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  return (
    <ConsultationCard title="Próximas consultas" className="mb-5">
      {upcoming.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-400">
          Nenhuma consulta agendada.
        </p>
      ) : (
        <ul className="space-y-3">
          {upcoming.map((c) => (
            <li
              key={c.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{c.procedure}</p>
                  <ConsultationStatusBadge status={c.status} />
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {formatDisplayDate(c.date)} às {c.time} · {c.professional}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <ActionBtn icon={Eye} label="Ver detalhes" onClick={() => onView(c.id)} />
                <ActionBtn
                  icon={CalendarClock}
                  label="Reagendar"
                  onClick={() => onReschedule(c.id)}
                />
                <ActionBtn
                  icon={XCircle}
                  label="Cancelar"
                  onClick={() => onCancel(c.id)}
                  danger
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </ConsultationCard>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        danger
          ? "inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
          : "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      }
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
