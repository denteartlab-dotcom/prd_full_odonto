"use client";

import { CheckCircle2, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Professional, ScheduleAppointment } from "@/lib/schedule-mock";
import { ConsultationTimer } from "./ConsultationTimer";

export function ActiveConsultationBanner({
  appointment,
  professional,
  onFinish,
}: {
  appointment: ScheduleAppointment;
  professional: Professional | null;
  onFinish: () => void;
}) {
  if (!appointment.consultationStartedAt) return null;

  return (
    <div className="border-b border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white shadow-inner">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-100">
              {professional ? `Aviso para ${professional.name}` : "Consulta em andamento"}
            </p>
            <p className="truncate text-sm font-semibold">
              Paciente <span className="font-bold">{appointment.patient}</span> chegou — consulta iniciada
            </p>
            <p className="truncate text-xs text-blue-100">{appointment.procedure}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-lg bg-white/15 px-4 py-2 text-center backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-100">Tempo de consulta</p>
            <ConsultationTimer
              startedAt={appointment.consultationStartedAt}
              size="lg"
              className="text-white"
            />
          </div>
          <button
            type="button"
            onClick={onFinish}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-blue-700",
              "shadow-md transition hover:bg-blue-50 active:scale-[0.98]"
            )}
          >
            <CheckCircle2 className="h-4 w-4" />
            Encerrar consulta
          </button>
        </div>
      </div>
    </div>
  );
}
