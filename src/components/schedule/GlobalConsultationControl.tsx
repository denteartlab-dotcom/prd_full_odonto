"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  GripVertical,
  Minimize2,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { professionalsMock } from "@/lib/schedule-mock";
import { useScheduleOptional } from "@/contexts/schedule-context";
import { useDraggablePanel } from "@/hooks/use-draggable-panel";
import { useMounted } from "@/hooks/use-mounted";
import { ConsultationMinimizedBar } from "./ConsultationMinimizedBar";
import { ConsultationTimer } from "./controle/ConsultationTimer";

const PANEL_WIDTH = 320;
const PANEL_HEIGHT = 148;

function ExpandedConsultationCard({
  consultation,
  index,
  isPrimary,
  onAgenda,
  isDragging,
  dragHandleProps,
  onMinimize,
  onFinish,
}: {
  consultation: NonNullable<ReturnType<typeof useScheduleOptional>>["activeConsultations"][number];
  index: number;
  isPrimary: boolean;
  onAgenda: boolean;
  isDragging: boolean;
  dragHandleProps: ReturnType<typeof useDraggablePanel>["dragHandleProps"];
  onMinimize: () => void;
  onFinish: () => void;
}) {
  const pro = professionalsMock.find((p) => p.id === consultation.professionalId);
  if (!consultation.consultationStartedAt) return null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-blue-200 bg-white",
        "shadow-[0_12px_40px_rgba(26,51,82,0.22)]",
        isDragging && isPrimary && "cursor-grabbing shadow-2xl ring-2 ring-blue-300/50",
        index > 0 && "mt-3"
      )}
    >
      <div
        {...(isPrimary ? dragHandleProps : {})}
        className={cn(
          "flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2.5 text-white",
          isPrimary && "cursor-grab touch-none active:cursor-grabbing"
        )}
        title={isPrimary ? "Arraste para mover" : undefined}
      >
        {isPrimary ? (
          <GripVertical className="h-4 w-4 shrink-0 opacity-70" />
        ) : (
          <Stethoscope className="h-4 w-4 shrink-0" />
        )}
        <p className="min-w-0 flex-1 truncate text-xs font-semibold">
          Consulta em andamento
          {pro ? ` · ${pro.name}` : ""}
        </p>
        {isPrimary ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="shrink-0 rounded-md p-1 text-white/80 transition hover:bg-white/15 hover:text-white"
            aria-label="Minimizar consulta"
            title="Minimizar"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">{consultation.patient}</p>
          <p className="truncate text-xs text-slate-500">{consultation.procedure}</p>
          <ConsultationTimer
            startedAt={consultation.consultationStartedAt}
            size="md"
            className="mt-1.5 text-blue-700"
          />
        </div>

        <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
          {!onAgenda ? (
            <Link
              href="/app/agenda"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Calendar className="h-3.5 w-3.5" />
              Agenda
            </Link>
          ) : null}
          <button
            type="button"
            onClick={onFinish}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Encerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export function GlobalConsultationControl() {
  const mounted = useMounted();
  const pathname = usePathname();
  const schedule = useScheduleOptional();

  const onAgenda = pathname === "/app/agenda" || pathname.startsWith("/app/agenda/");
  const minimized = schedule?.consultationMinimized ?? false;

  const { panelRef, isDragging, dragHandleProps, style } = useDraggablePanel(
    "odonto-consultation-widget-pos",
    { width: PANEL_WIDTH, height: PANEL_HEIGHT, enabled: !minimized }
  );

  if (!mounted || !schedule || schedule.activeConsultations.length === 0) return null;

  if (minimized) {
    if (onAgenda) return null;
    return <ConsultationMinimizedBar className="fixed bottom-6 right-6 z-[58]" />;
  }

  return (
    <div
      ref={panelRef}
      className={cn("fixed z-[55] flex flex-col", isDragging && "select-none")}
      style={style}
    >
      {schedule.activeConsultations.map((consultation, index) => (
        <ExpandedConsultationCard
          key={consultation.id}
          consultation={consultation}
          index={index}
          isPrimary={index === 0}
          onAgenda={onAgenda}
          isDragging={isDragging}
          dragHandleProps={dragHandleProps}
          onMinimize={() => schedule.setConsultationMinimized(true)}
          onFinish={() => schedule.finishConsultation(consultation.id)}
        />
      ))}
    </div>
  );
}

export function GlobalScheduleToast() {
  const mounted = useMounted();
  const schedule = useScheduleOptional();
  if (!mounted || !schedule?.toast) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-[90] -translate-x-1/2">
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-900 shadow-lg">
        {schedule.toast}
      </div>
    </div>
  );
}
