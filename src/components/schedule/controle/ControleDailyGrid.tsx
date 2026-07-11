"use client";

import { useRef, useState } from "react";
import {
  buildHourlySlots,
  CONTROLE_END_HOUR,
  CONTROLE_START_HOUR,
  formatDayColumnHeader,
  formatWeekdayLong,
  minutesToTime,
  timeToMinutes,
  type ScheduleAppointment,
} from "@/lib/schedule-mock";
import { cn } from "@/lib/utils";
import { ControleAppointmentCard } from "./ControleAppointmentCard";
import {
  apptStyle,
  durationMinutes,
  gridHeight,
  HOUR_HEIGHT,
  slotFromClientY,
} from "./controle-grid-utils";

export function ControleDailyGrid({
  date,
  appointments,
  onSlotClick,
  onEdit,
  onReschedule,
  onCancel,
  onComplete,
  onMove,
  wouldMoveConflict,
  onStartConsultation,
  onFinishConsultation,
}: {
  date: string;
  appointments: ScheduleAppointment[];
  onSlotClick: (date: string, hour: string) => void;
  onEdit: (id: string) => void;
  onReschedule: (id: string) => void;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
  onMove: (id: string, payload: { date: string; start: string; end: string }) => void;
  wouldMoveConflict?: (id: string, payload: { date: string; start: string; end: string }) => boolean;
  onStartConsultation: (id: string) => void;
  onFinishConsultation: (id: string) => void;
}) {
  const hours = buildHourlySlots();
  const columnHeight = gridHeight();
  const dayAppts = appointments.filter((a) => a.date === date);
  const columnRef = useRef<HTMLDivElement | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ start: string } | null>(null);

  const dragging = appointments.find((a) => a.id === draggingId) || null;

  function handleDragStart(e: React.DragEvent, appointment: ScheduleAppointment) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", appointment.id);
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 24, 20);
    }
    setDraggingId(appointment.id);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDropTarget(null);
  }

  function updateDropTarget(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const columnEl = columnRef.current;
    if (!columnEl) return;
    setDropTarget({ start: slotFromClientY(columnEl, e.clientY) });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const columnEl = columnRef.current;
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

    if (endMin > CONTROLE_END_HOUR * 60) {
      handleDragEnd();
      return;
    }

    onMove(id, { date, start, end: minutesToTime(endMin) });
    handleDragEnd();
  }

  const dropPreviewStyle =
    dragging && dropTarget
      ? apptStyle(
          dropTarget.start,
          minutesToTime(timeToMinutes(dropTarget.start) + durationMinutes(dragging.start, dragging.end))
        )
      : null;

  const dropEnd = dropTarget
    ? minutesToTime(timeToMinutes(dropTarget.start) + (dragging ? durationMinutes(dragging.start, dragging.end) : 0))
    : "";

  const dropBlocked =
    dragging &&
    dropTarget &&
    wouldMoveConflict?.(dragging.id, { date, start: dropTarget.start, end: dropEnd });

  return (
    <div className="flex-1 overflow-auto bg-white">
      <div className="min-w-0">
        <div className="grid border-b border-slate-300" style={{ gridTemplateColumns: "52px 1fr" }}>
          <div className="bg-[#5a6a7a]" />
          <div className="border-l border-slate-400 bg-[#5a6a7a] px-4 py-2 text-center text-white">
            <p className="text-sm font-bold uppercase">{formatWeekdayLong(date)}</p>
            <p className="text-xs font-normal text-slate-200">{formatDayColumnHeader(date)}</p>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "52px 1fr" }}>
          <div className="border-r border-slate-200 bg-slate-50">
            {hours.map((hour) => (
              <div
                key={hour}
                className="border-b border-slate-200 pr-2 text-right text-xs font-medium text-slate-500"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="-translate-y-2 block pt-1">{hour}</span>
              </div>
            ))}
          </div>

          <div
            ref={columnRef}
            className="relative mx-1 border-r border-slate-200"
            style={{ height: columnHeight }}
            onDragOver={updateDropTarget}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropTarget(null);
            }}
            onDrop={handleDrop}
          >
            {hours.map((hour) => (
              <button
                key={`${date}-${hour}`}
                type="button"
                className={cn(
                  "w-full border-b border-slate-100 hover:bg-blue-50/40",
                  draggingId && "pointer-events-none"
                )}
                style={{ height: HOUR_HEIGHT }}
                onClick={() => !draggingId && onSlotClick(date, hour)}
                aria-label={`Agendar ${date} ${hour}`}
              />
            ))}

            {dropPreviewStyle ? (
              <div
                className={cn(
                  "pointer-events-none absolute inset-x-2 z-30 rounded-lg border-2 border-dashed",
                  dropBlocked
                    ? "border-rose-500 bg-rose-100/70"
                    : "border-blue-500 bg-blue-100/60"
                )}
                style={{ top: dropPreviewStyle.top, height: dropPreviewStyle.height }}
              >
                <p
                  className={cn(
                    "px-2 py-1 text-[10px] font-semibold",
                    dropBlocked ? "text-rose-800" : "text-blue-800"
                  )}
                >
                  {dropBlocked
                    ? `${dropTarget?.start} · horário ocupado`
                    : `${dropTarget?.start} · solte para reagendar`}
                </p>
              </div>
            ) : null}

            {dayAppts.map((appt) => {
              const pos = apptStyle(appt.start, appt.end);
              if (timeToMinutes(appt.start) >= CONTROLE_END_HOUR * 60) return null;
              if (timeToMinutes(appt.end) <= CONTROLE_START_HOUR * 60) return null;
              return (
                <ControleAppointmentCard
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
                  onStartConsultation={() => onStartConsultation(appt.id)}
                  onFinishConsultation={() => onFinishConsultation(appt.id)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
