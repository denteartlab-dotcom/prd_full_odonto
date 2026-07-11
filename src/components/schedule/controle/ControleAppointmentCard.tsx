"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarClock,
  CheckCircle2,
  GripVertical,
  MoreVertical,
  Pencil,
  Play,
  Stethoscope,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  canStartConsultation,
  isActiveConsultation,
  statusMeta,
  type ScheduleAppointment,
} from "@/lib/schedule-mock";
import { ConsultationTimer } from "./ConsultationTimer";

export function ControleAppointmentCard({
  appointment,
  style,
  isDragging,
  suppressPointerEvents,
  onDragStart,
  onDragEnd,
  onEdit,
  onReschedule,
  onCancel,
  onComplete,
  onStartConsultation,
  onFinishConsultation,
}: {
  appointment: ScheduleAppointment;
  style: React.CSSProperties;
  isDragging?: boolean;
  suppressPointerEvents?: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onEdit: () => void;
  onReschedule: () => void;
  onCancel: () => void;
  onComplete: () => void;
  onStartConsultation: () => void;
  onFinishConsultation: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const meta = statusMeta[appointment.status];
  const compact = typeof style.height === "number" && style.height < 64;
  const active = isActiveConsultation(appointment);
  const canStart = canStartConsultation(appointment);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          className="fixed z-[9999] w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-xl"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          {canStart ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-blue-700 hover:bg-blue-50"
              onClick={() => {
                setOpen(false);
                onStartConsultation();
              }}
            >
              <Play className="h-3.5 w-3.5" /> Iniciar consulta
            </button>
          ) : null}
          {active ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
              onClick={() => {
                setOpen(false);
                onFinishConsultation();
              }}
            >
              <Stethoscope className="h-3.5 w-3.5" /> Encerrar consulta
            </button>
          ) : null}
          <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-50" onClick={() => { setOpen(false); onEdit(); }}>
            <Pencil className="h-3.5 w-3.5" /> Editar
          </button>
          <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-50" onClick={() => { setOpen(false); onReschedule(); }}>
            <CalendarClock className="h-3.5 w-3.5" /> Reagendar
          </button>
          {!active ? (
            <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-50" onClick={() => { setOpen(false); onComplete(); }}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Concluir
            </button>
          ) : null}
          <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50" onClick={() => { setOpen(false); onCancel(); }}>
            <XCircle className="h-3.5 w-3.5" /> Cancelar
          </button>
        </div>,
        document.body
      )
    : null;

  return (
    <div
      className={cn(
        "absolute inset-x-2 z-10 overflow-hidden rounded-lg border-l-4 px-3 shadow-md transition",
        meta.card,
        compact ? "py-1.5" : "py-2.5",
        appointment.status === "cancelado" && "opacity-60",
        appointment.status !== "cancelado" && !active && "cursor-grab active:cursor-grabbing",
        active && "ring-2 ring-blue-400 ring-offset-1",
        isDragging
          ? "z-40 scale-[1.02] opacity-40 ring-2 ring-blue-400"
          : "hover:z-20 hover:shadow-lg",
        suppressPointerEvents && !isDragging && "pointer-events-none"
      )}
      style={style}
      draggable={appointment.status !== "cancelado" && !active}
      onDragStart={(e) => {
        setOpen(false);
        onDragStart(e);
      }}
      onDragEnd={onDragEnd}
      title={
        appointment.status !== "cancelado" && !active
          ? "Arraste para reagendar"
          : active
            ? "Consulta em andamento"
            : undefined
      }
    >
      <div className="flex items-start gap-2">
        {appointment.status !== "cancelado" && !active ? (
          <GripVertical className="mt-1 h-4 w-4 shrink-0 opacity-40" />
        ) : null}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70 text-[11px] font-bold shadow-sm">
          {appointment.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold tabular-nums">
              {appointment.start} – {appointment.end}
            </p>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", meta.badge)}>
              {meta.label}
            </span>
            {active && appointment.consultationStartedAt ? (
              <ConsultationTimer
                startedAt={appointment.consultationStartedAt}
                className="text-blue-800"
              />
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-sm font-semibold leading-snug">{appointment.patient}</p>
          {!compact ? (
            <p className="mt-0.5 truncate text-xs opacity-85">{appointment.procedure}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {canStart ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onStartConsultation();
              }}
              className="rounded-md bg-blue-600 p-1.5 text-white shadow-sm hover:bg-blue-700"
              aria-label="Iniciar consulta"
              title="Iniciar consulta"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Play className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <button
            ref={buttonRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (!open && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setMenuPos({ top: rect.bottom + 4, left: rect.right - 192 });
              }
              setOpen((v) => !v);
            }}
            className="rounded-md p-1 hover:bg-black/5"
            aria-label="Ações"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
      {menu}
    </div>
  );
}
