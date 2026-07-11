"use client";

import { Maximize2, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScheduleOptional } from "@/contexts/schedule-context";
import { useMounted } from "@/hooks/use-mounted";

export function ConsultationMinimizedBar({ className }: { className?: string }) {
  const mounted = useMounted();
  const schedule = useScheduleOptional();

  if (
    !mounted ||
    !schedule ||
    !schedule.consultationMinimized ||
    schedule.activeConsultations.length === 0
  ) {
    return null;
  }

  const count = schedule.activeConsultations.length;

  return (
    <button
      type="button"
      onClick={schedule.toggleConsultationMinimized}
      aria-label={`Consulta em andamento — ${count} paciente(s). Clique para expandir.`}
      className={cn(
        "flex shrink-0 items-center gap-2.5",
        "rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3",
        "text-sm font-semibold text-white",
        "shadow-[0_8px_30px_rgba(37,99,235,0.4)] transition-all duration-200",
        "hover:from-blue-700 hover:to-indigo-700 hover:shadow-[0_12px_40px_rgba(37,99,235,0.5)]",
        "active:scale-[0.98]",
        className
      )}
    >
      <Stethoscope className="h-4 w-4 shrink-0" />
      <span className="whitespace-nowrap">Consulta em andamento</span>
      <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-white/20 px-1.5 text-[11px] font-bold ring-1 ring-white/30">
        {count}
      </span>
      <Maximize2 className="h-4 w-4 shrink-0 opacity-80" />
    </button>
  );
}
