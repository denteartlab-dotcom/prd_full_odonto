"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  patientsMock,
  proceduresMock,
  professionalsMock,
  SCHEDULE_END_HOUR,
  SCHEDULE_START_HOUR,
  statusMeta,
  timeToMinutes,
  toIsoDate,
  type AppointmentStatus,
  type ScheduleAppointment,
} from "@/lib/schedule-mock";
import {
  conflictMessage,
  findScheduleConflicts,
} from "@/lib/schedule-conflicts";

type FormState = {
  patient: string;
  professionalId: string;
  procedure: string;
  date: string;
  start: string;
  end: string;
  status: AppointmentStatus;
  notes: string;
};

function getConflictMessage(
  appointments: ScheduleAppointment[],
  form: FormState,
  editingId?: string | null
) {
  const conflicts = findScheduleConflicts(appointments, {
    professionalId: form.professionalId,
    date: form.date,
    start: form.start,
    end: form.end,
    excludeId: editingId || undefined,
  });
  return conflictMessage(conflicts);
}

function hasConflict(
  appointments: ScheduleAppointment[],
  form: FormState,
  editingId?: string | null
) {
  return Boolean(getConflictMessage(appointments, form, editingId));
}

export function NewAppointmentModal({
  open,
  initial,
  appointments,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: Partial<FormState> & { id?: string };
  appointments: ScheduleAppointment[];
  onClose: () => void;
  onSave: (data: FormState & { id?: string }) => void;
}) {
  const [form, setForm] = useState<FormState>({
    patient: initial?.patient || patientsMock[0],
    professionalId: initial?.professionalId || professionalsMock[0].id,
    procedure: initial?.procedure || proceduresMock[0],
    date: initial?.date || toIsoDate(new Date()),
    start: initial?.start || "09:00",
    end: initial?.end || "09:30",
    status: initial?.status || "confirmado",
    notes: initial?.notes || "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm({
      patient: initial?.patient || patientsMock[0],
      professionalId: initial?.professionalId || professionalsMock[0].id,
      procedure: initial?.procedure || proceduresMock[0],
      date: initial?.date || toIsoDate(new Date()),
      start: initial?.start || "09:00",
      end: initial?.end || "09:30",
      status: initial?.status || "confirmado",
      notes: initial?.notes || "",
    });
    setError("");
  }, [open, initial]);

  if (!open) return null;

  function patch(next: Partial<FormState>) {
    setForm((atual) => ({ ...atual, ...next }));
    setError("");
  }

  function validate() {
    const start = timeToMinutes(form.start);
    const end = timeToMinutes(form.end);
    const openMin = SCHEDULE_START_HOUR * 60;
    const closeMin = SCHEDULE_END_HOUR * 60;

    if (end <= start) {
      return "O horário final deve ser maior que o horário inicial.";
    }
    if (start < openMin || end > closeMin) {
      return `Horário fora do funcionamento (${String(SCHEDULE_START_HOUR).padStart(2, "0")}:00 às ${SCHEDULE_END_HOUR}:00).`;
    }
    if (hasConflict(appointments, form, initial?.id)) {
      return getConflictMessage(appointments, form, initial?.id);
    }
    return "";
  }

  function submit() {
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    onSave({ ...form, id: initial?.id });
  }

  const conflictMsg = getConflictMessage(appointments, form, initial?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {initial?.id ? "Editar agendamento" : "Novo agendamento"}
            </h3>
            <p className="text-xs text-slate-500">Preencha os dados da consulta</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3 px-5 py-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">Paciente</span>
            <select
              value={form.patient}
              onChange={(e) => patch({ patient: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
            >
              {patientsMock.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">Profissional</span>
            <select
              value={form.professionalId}
              onChange={(e) => patch({ professionalId: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
            >
              {professionalsMock.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.specialty}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">Procedimento</span>
            <select
              value={form.procedure}
              onChange={(e) => patch({ procedure: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
            >
              {proceduresMock.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Data</span>
            <input
              type="date"
              value={form.date}
              onChange={(e) => patch({ date: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Status</span>
            <select
              value={form.status}
              onChange={(e) => patch({ status: e.target.value as AppointmentStatus })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
            >
              {(Object.keys(statusMeta) as AppointmentStatus[]).map((s) => (
                <option key={s} value={s}>
                  {statusMeta[s].label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Hora inicial</span>
            <input
              type="time"
              step={1800}
              value={form.start}
              onChange={(e) => patch({ start: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Hora final</span>
            <input
              type="time"
              step={1800}
              value={form.end}
              onChange={(e) => patch({ end: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
            />
          </label>

          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">Observações</span>
            <textarea
              value={form.notes}
              onChange={(e) => patch({ notes: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
              placeholder="Observações da consulta..."
            />
          </label>
        </div>

        {(error || conflictMsg) && (
          <div className="mx-5 mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error || conflictMsg}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md"
          >
            Salvar agendamento
          </button>
        </div>
      </div>
    </div>
  );
}
