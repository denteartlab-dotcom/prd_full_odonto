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

export function ControleWeeklyGrid({
  weekDates,
  selectedDate,
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
  weekDates: string[];
  selectedDate?: string;
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
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ date: string; start: string } | null>(null);

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
    wouldMoveConflict?.(dragging.id, {
      date: dropTarget.date,
      start: dropTarget.start,
      end: dropEnd,
    });

  return (
    <div className="flex-1 overflow-auto bg-white">
      <div className="min-w-[900px]">
        <div
          className="grid border-b border-slate-300"
          style={{ gridTemplateColumns: `52px repeat(${weekDates.length}, minmax(140px, 1fr))` }}
        >
          <div className="bg-[#5a6a7a]" />
          {weekDates.map((date) => {
            const isSelected = date === selectedDate;
            return (
              <div
                key={`h-${date}`}
                className={cn(
                  "border-l border-slate-400 px-2 py-2 text-center text-white",
                  isSelected ? "bg-blue-600" : "bg-[#5a6a7a]"
                )}
              >
                <p className="text-xs font-bold uppercase">{formatWeekdayLong(date)}</p>
                <p className={cn("text-[11px] font-normal", isSelected ? "text-blue-100" : "text-slate-200")}>
                  {formatDayColumnHeader(date)}
                </p>
              </div>
            );
          })}
        </div>

        <div
          className="grid"
          style={{ gridTemplateColumns: `52px repeat(${weekDates.length}, minmax(140px, 1fr))` }}
        >
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

          {weekDates.map((date) => {
            const dayAppts = appointments.filter((a) => a.date === date);
            const isSelected = date === selectedDate;
            const showDropPreview =
              dropPreviewStyle && dropTarget?.date === date && dragging;

            return (
              <div
                key={date}
                ref={(el) => {
                  columnRefs.current[date] = el;
                }}
                className={cn(
                  "relative mx-0.5 border-r border-slate-200",
                  isSelected && "bg-blue-50/30"
                )}
                style={{ height: columnHeight }}
                onDragOver={(e) => updateDropTarget(e, date)}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDropTarget((atual) => (atual?.date === date ? null : atual));
                  }
                }}
                onDrop={(e) => handleDrop(e, date)}
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

                {showDropPreview ? (
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-x-2 z-30 rounded-lg border-2 border-dashed",
                      dropTarget?.date === date && dropBlocked
                        ? "border-rose-500 bg-rose-100/70"
                        : "border-blue-500 bg-blue-100/60"
                    )}
                    style={{ top: dropPreviewStyle.top, height: dropPreviewStyle.height }}
                  >
                    <p
                      className={cn(
                        "px-2 py-1 text-[10px] font-semibold",
                        dropTarget?.date === date && dropBlocked ? "text-rose-800" : "text-blue-800"
                      )}
                    >
                      {dropTarget?.date === date && dropBlocked
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
