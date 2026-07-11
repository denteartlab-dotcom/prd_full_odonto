"use client";

import { useRef, useState } from "react";
import {
  buildTimeSlots,
  formatDayMonth,
  formatWeekday,
  minutesToTime,
  professionalsMock,
  SCHEDULE_END_HOUR,
  SCHEDULE_START_HOUR,
  SLOT_MINUTES,
  timeToMinutes,
  type ScheduleAppointment,
} from "@/lib/schedule-mock";
import { AppointmentCard } from "./AppointmentCard";
import { cn } from "@/lib/utils";
import { useClientToday } from "@/hooks/use-client-today";

const SLOT_HEIGHT = 52;

function appointmentStyle(start: string, end: string) {
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);
  const top = ((startMin - SCHEDULE_START_HOUR * 60) / SLOT_MINUTES) * SLOT_HEIGHT;
  const height = Math.max(((endMin - startMin) / SLOT_MINUTES) * SLOT_HEIGHT - 4, 28);
  return { top, height };
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
  return minutesToTime(SCHEDULE_START_HOUR * 60 + index * SLOT_MINUTES);
}

function proInitials(professionalId: string) {
  return professionalsMock.find((p) => p.id === professionalId)?.initials || "?";
}

export function ScheduleWeekGrid({
  weekDates,
  appointments,
  onEdit,
  onReschedule,
  onCancel,
  onComplete,
  onMove,
}: {
  weekDates: string[];
  appointments: ScheduleAppointment[];
  onEdit: (id: string) => void;
  onReschedule: (id: string) => void;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
  onMove: (
    id: string,
    payload: { professionalId: string; date: string; start: string; end: string }
  ) => void;
}) {
  const slots = buildTimeSlots();
  const clientToday = useClientToday();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ date: string; start: string } | null>(null);
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  function updateDropTarget(e: React.DragEvent, date: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const columnEl = columnRefs.current[date];
    if (!columnEl) return;
    setDropTarget({ date, start: slotFromClientY(columnEl, e.clientY) });
  }

  function handleDrop(e: React.DragEvent, date: string) {
    e.preventDefault();
    const columnEl = columnRefs.current[date];
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
    const endMin = timeToMinutes(start) + duration;
    if (endMin > SCHEDULE_END_HOUR * 60) {
      handleDragEnd();
      return;
    }

    onMove(id, {
      professionalId: appt.professionalId,
      date,
      start,
      end: minutesToTime(endMin),
    });
    handleDragEnd();
  }

  const dropPreviewStyle =
    dragging && dropTarget
      ? appointmentStyle(
          dropTarget.start,
          minutesToTime(
            timeToMinutes(dropTarget.start) + durationMinutes(dragging.start, dragging.end)
          )
        )
      : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgb(15_23_42/0.04)]">
      <div className="border-b border-slate-100 bg-indigo-50/60 px-4 py-2 text-xs text-indigo-700">
        Semana completa — arraste o card entre dias e horários para reagendar.
      </div>
      <div className="overflow-x-auto">
        <div
          className="min-w-[980px]"
          style={{
            display: "grid",
            gridTemplateColumns: `64px repeat(7, minmax(120px, 1fr))`,
          }}
        >
          <div className="sticky top-0 z-20 border-b border-slate-100 bg-slate-50/95 backdrop-blur" />
          {weekDates.map((date) => {
            const isToday = clientToday !== null && date === clientToday;
            return (
              <div
                key={`h-${date}`}
                className={cn(
                  "sticky top-0 z-20 border-b border-l border-slate-100 bg-slate-50/95 px-2 py-2.5 text-center backdrop-blur",
                  isToday && "bg-indigo-50/95"
                )}
              >
                <p
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    isToday ? "text-indigo-700" : "text-slate-900"
                  )}
                >
                  {formatDayMonth(date)}
                </p>
                <p
                  className={cn(
                    "text-[11px] font-medium capitalize",
                    isToday ? "text-indigo-500" : "text-slate-500"
                  )}
                >
                  {formatWeekday(date)}
                </p>
              </div>
            );
          })}

          <div className="relative border-r border-slate-100 bg-white">
            {slots.map((slot) => (
              <div
                key={slot}
                className="border-b border-slate-50 px-1.5 text-right text-[10px] font-medium text-slate-400"
                style={{ height: SLOT_HEIGHT }}
              >
                <span className="-translate-y-2 block pt-1">{slot}</span>
              </div>
            ))}
          </div>

          {weekDates.map((date) => {
            const dayAppointments = appointments.filter((a) => a.date === date);
            const showDropPreview =
              dropPreviewStyle && dropTarget?.date === date && dragging;
            const isToday = clientToday !== null && date === clientToday;

            return (
              <div
                key={date}
                ref={(el) => {
                  columnRefs.current[date] = el;
                }}
                className={cn(
                  "relative border-l border-slate-100",
                  isToday && "bg-indigo-50/20"
                )}
                style={{ height: slots.length * SLOT_HEIGHT }}
                onDragOver={(e) => updateDropTarget(e, date)}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDropTarget((atual) => (atual?.date === date ? null : atual));
                  }
                }}
                onDrop={(e) => handleDrop(e, date)}
              >
                {slots.map((slot) => {
                  const isActiveDrop =
                    dropTarget?.date === date && dropTarget.start === slot;
                  return (
                    <div
                      key={`${date}-${slot}`}
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
                    className="pointer-events-none absolute inset-x-1 z-30 rounded-xl border-2 border-dashed border-indigo-500 bg-indigo-200/50"
                    style={{
                      top: dropPreviewStyle.top,
                      height: dropPreviewStyle.height,
                    }}
                  >
                    <div className="px-2 py-1 text-[10px] font-semibold text-indigo-800">
                      {dropTarget?.start}
                    </div>
                  </div>
                ) : null}

                {dayAppointments.map((appt) => {
                  const pos = appointmentStyle(appt.start, appt.end);
                  const withPro = {
                    ...appt,
                    procedure: `${proInitials(appt.professionalId)} · ${appt.procedure}`,
                  };
                  return (
                    <AppointmentCard
                      key={appt.id}
                      appointment={withPro}
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
              </div>
            );
          })}
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="border-t border-slate-100 px-4 py-10 text-center text-sm text-slate-400">
          Nenhum agendamento nesta semana com os filtros atuais.
        </div>
      ) : null}
    </div>
  );
}
