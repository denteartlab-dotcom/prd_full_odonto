"use client";

import { useEffect, useRef, useState } from "react";
import {
  buildTimeSlots,
  minutesToTime,
  SCHEDULE_END_HOUR,
  SCHEDULE_START_HOUR,
  SLOT_MINUTES,
  timeToMinutes,
  type Professional,
  type ScheduleAppointment,
} from "@/lib/schedule-mock";
import { AppointmentCard } from "./AppointmentCard";
import { cn } from "@/lib/utils";
import { useClientToday } from "@/hooks/use-client-today";
import { useMounted } from "@/hooks/use-mounted";

const SLOT_HEIGHT = 56;

function appointmentStyle(start: string, end: string) {
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);
  const top =
    ((startMin - SCHEDULE_START_HOUR * 60) / SLOT_MINUTES) * SLOT_HEIGHT;
  const height = Math.max(
    ((endMin - startMin) / SLOT_MINUTES) * SLOT_HEIGHT - 4,
    28
  );
  return { top, height };
}

function CurrentTimeLine({ top }: { top: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-[5]"
      style={{ top }}
    >
      <div className="relative">
        <div className="absolute -left-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-red-500" />
        <div className="h-0.5 w-full bg-red-500" />
      </div>
    </div>
  );
}

function durationMinutes(start: string, end: string) {
  return Math.max(SLOT_MINUTES, timeToMinutes(end) - timeToMinutes(start));
}

function slotFromClientY(columnEl: HTMLElement, clientY: number) {
  const rect = columnEl.getBoundingClientRect();
  const y = clientY - rect.top;
  const index = Math.max(
    0,
    Math.min(
      Math.floor(y / SLOT_HEIGHT),
      ((SCHEDULE_END_HOUR - SCHEDULE_START_HOUR) * 60) / SLOT_MINUTES - 1
    )
  );
  const startMin = SCHEDULE_START_HOUR * 60 + index * SLOT_MINUTES;
  return minutesToTime(startMin);
}

export function ScheduleGrid({
  professionals,
  appointments,
  selectedDate,
  onEdit,
  onReschedule,
  onCancel,
  onComplete,
  onMove,
}: {
  professionals: Professional[];
  appointments: ScheduleAppointment[];
  selectedDate: string;
  onEdit: (id: string) => void;
  onReschedule: (id: string) => void;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
  onMove: (
    id: string,
    payload: { professionalId: string; start: string; end: string }
  ) => void;
}) {
  const slots = buildTimeSlots();
  const mounted = useMounted();
  const clientToday = useClientToday();
  const [nowTop, setNowTop] = useState<number | null>(null);
  const isToday = mounted && clientToday !== null && selectedDate === clientToday;
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!mounted) return;

    function updateNowTop() {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      const start = SCHEDULE_START_HOUR * 60;
      const end = SCHEDULE_END_HOUR * 60;
      if (minutes < start || minutes > end) {
        setNowTop(null);
        return;
      }
      setNowTop(((minutes - start) / SLOT_MINUTES) * SLOT_HEIGHT);
    }

    updateNowTop();
    const id = window.setInterval(updateNowTop, 60_000);
    return () => window.clearInterval(id);
  }, [mounted, selectedDate]);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    professionalId: string;
    start: string;
  } | null>(null);
  const dragging = appointments.find((a) => a.id === draggingId) || null;

  function handleDragStart(e: React.DragEvent, appointment: ScheduleAppointment) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", appointment.id);
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 24, 18);
    }
    setDraggingId(appointment.id);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDropTarget(null);
  }

  function updateDropTarget(
    e: React.DragEvent,
    professionalId: string
  ) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const columnEl = columnRefs.current[professionalId];
    if (!columnEl) return;
    const start = slotFromClientY(columnEl, e.clientY);
    setDropTarget({ professionalId, start });
  }

  function handleDrop(e: React.DragEvent, professionalId: string) {
    e.preventDefault();
    const columnEl = columnRefs.current[professionalId];
    const id = e.dataTransfer.getData("text/plain") || draggingId;
    if (!id || !columnEl) {
      handleDragEnd();
      return;
    }

    const appt = appointments.find((a) => a.id === id);
    if (!appt || appt.status === "cancelado") {
      handleDragEnd();
      return;
    }

    const start = slotFromClientY(columnEl, e.clientY);
    const duration = durationMinutes(appt.start, appt.end);
    const startMin = timeToMinutes(start);
    const endMin = startMin + duration;
    const closeMin = SCHEDULE_END_HOUR * 60;

    if (endMin > closeMin) {
      handleDragEnd();
      return;
    }

    onMove(id, {
      professionalId,
      start,
      end: minutesToTime(endMin),
    });
    handleDragEnd();
  }

  if (professionals.length === 0) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-400">
        Nenhum profissional no filtro selecionado.
      </div>
    );
  }

  const dropPreviewStyle =
    dragging && dropTarget
      ? appointmentStyle(
          dropTarget.start,
          minutesToTime(
            timeToMinutes(dropTarget.start) +
              durationMinutes(dragging.start, dragging.end)
          )
        )
      : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgb(15_23_42/0.04)]">
      <div className="border-b border-slate-100 bg-indigo-50/60 px-4 py-2 text-xs text-indigo-700">
        Arraste o card para o horário desejado (mesmo ou outro profissional). O menu ⋮ abre por cima
        dos outros cards.
      </div>
      <div className="overflow-x-auto">
        <div
          className="min-w-[900px]"
          style={{
            display: "grid",
            gridTemplateColumns: `72px repeat(${professionals.length}, minmax(180px, 1fr))`,
          }}
        >
          <div className="sticky top-0 z-20 border-b border-slate-100 bg-slate-50/95 backdrop-blur" />
          {professionals.map((pro) => (
            <div
              key={pro.id}
              className="sticky top-0 z-20 border-b border-l border-slate-100 bg-slate-50/95 px-3 py-3 backdrop-blur"
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-bold text-white",
                    pro.color
                  )}
                >
                  {pro.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{pro.name}</p>
                  <p className="truncate text-[11px] text-slate-500">{pro.specialty}</p>
                </div>
              </div>
            </div>
          ))}

          <div className="relative border-r border-slate-100 bg-white">
            {slots.map((slot) => (
              <div
                key={slot}
                className="border-b border-slate-50 px-2 text-right text-[11px] font-medium text-slate-400"
                style={{ height: SLOT_HEIGHT }}
              >
                <span className="-translate-y-2 block pt-1">{slot}</span>
              </div>
            ))}
          </div>

          {professionals.map((pro) => {
            const proAppointments = appointments.filter(
              (a) => a.professionalId === pro.id
            );
            const showDropPreview =
              dropPreviewStyle &&
              dropTarget?.professionalId === pro.id &&
              dragging;

            return (
              <div
                key={pro.id}
                ref={(el) => {
                  columnRefs.current[pro.id] = el;
                }}
                className="relative border-l border-slate-100"
                style={{ height: slots.length * SLOT_HEIGHT }}
                onDragOver={(e) => updateDropTarget(e, pro.id)}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDropTarget((atual) =>
                      atual?.professionalId === pro.id ? null : atual
                    );
                  }
                }}
                onDrop={(e) => handleDrop(e, pro.id)}
              >
                {slots.map((slot) => {
                  const isActiveDrop =
                    dropTarget?.professionalId === pro.id &&
                    dropTarget.start === slot;
                  return (
                    <div
                      key={`${pro.id}-${slot}`}
                      className={cn(
                        "border-b border-slate-50 transition-colors",
                        isActiveDrop && "bg-indigo-100/80"
                      )}
                      style={{ height: SLOT_HEIGHT }}
                    />
                  );
                })}

                {showDropPreview ? (
                  <div
                    className="pointer-events-none absolute inset-x-1 z-30 rounded-xl border-2 border-dashed border-indigo-500 bg-indigo-200/50 shadow-inner"
                    style={{
                      top: dropPreviewStyle.top,
                      height: dropPreviewStyle.height,
                    }}
                  >
                    <div className="px-2 py-1 text-[10px] font-semibold text-indigo-800">
                      {dropTarget?.start} · solte para reagendar
                    </div>
                  </div>
                ) : null}

                {proAppointments.map((appt) => {
                  const pos = appointmentStyle(appt.start, appt.end);
                  return (
                    <AppointmentCard
                      key={appt.id}
                      appointment={appt}
                      style={{ top: pos.top, height: pos.height }}
                      isDragging={draggingId === appt.id}
                      suppressPointerEvents={Boolean(draggingId)}
                      onDragStart={(e) => handleDragStart(e, appt)}
                      onDragEnd={handleDragEnd}
                      onEdit={() => onEdit(appt.id)}
                      onReschedule={() => onReschedule(appt.id)}
                      onCancel={() => onCancel(appt.id)}
                      onComplete={() => onComplete(appt.id)}
                    />
                  );
                })}

                {isToday && nowTop != null ? (
                  <CurrentTimeLine top={nowTop} />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="border-t border-slate-100 px-4 py-10 text-center text-sm text-slate-400">
          Nenhum agendamento para esta data com os filtros atuais.
        </div>
      ) : null}
    </div>
  );
}
