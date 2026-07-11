"use client";

import { AlertTriangle, CalendarClock, X } from "lucide-react";
import { formatDayColumnHeader } from "@/lib/schedule-mock";
import type { ScheduleAppointment } from "@/lib/schedule-mock";

export type ReschedulePrompt =
  | {
      type: "confirm";
      appointment: ScheduleAppointment;
      payload: { date: string; start: string; end: string };
    }
  | {
      type: "blocked";
      appointment: ScheduleAppointment;
      payload: { date: string; start: string; end: string };
      conflictWith: ScheduleAppointment;
    };

function formatSlot(date: string, start: string, end: string) {
  return `${formatDayColumnHeader(date)} · ${start}–${end}`;
}

export function RescheduleConfirmModal({
  prompt,
  onConfirm,
  onCancel,
}: {
  prompt: ReschedulePrompt | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!prompt) return null;

  const isBlocked = prompt.type === "blocked";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-start gap-3">
            <div
              className={
                isBlocked
                  ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600"
                  : "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600"
              }
            >
              {isBlocked ? <AlertTriangle className="h-5 w-5" /> : <CalendarClock className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {isBlocked ? "Horário indisponível" : "Confirmar reagendamento"}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {isBlocked
                  ? "Não é possível colocar dois pacientes no mesmo horário"
                  : "Autorize a alteração do agendamento"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4 text-sm text-slate-700">
          {isBlocked ? (
            <>
              <p>
                O horário <strong>{formatSlot(prompt.payload.date, prompt.payload.start, prompt.payload.end)}</strong>{" "}
                já está reservado para <strong>{prompt.conflictWith.patient}</strong>.
              </p>
              <p>
                Para agendar <strong>{prompt.appointment.patient}</strong> neste horário, reagende{" "}
                <strong>{prompt.conflictWith.patient}</strong> primeiro.
              </p>
            </>
          ) : (
            <>
              <p>
                Deseja reagendar <strong>{prompt.appointment.patient}</strong>?
              </p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                <p className="text-slate-500">De</p>
                <p className="font-semibold text-slate-800">
                  {formatSlot(prompt.appointment.date, prompt.appointment.start, prompt.appointment.end)}
                </p>
                <p className="mt-2 text-slate-500">Para</p>
                <p className="font-semibold text-indigo-700">
                  {formatSlot(prompt.payload.date, prompt.payload.start, prompt.payload.end)}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {isBlocked ? "Entendi" : "Não, cancelar"}
          </button>
          {!isBlocked && (
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Sim, reagendar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
