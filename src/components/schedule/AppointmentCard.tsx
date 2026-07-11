"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  CalendarClock,
  GripVertical,
  MoreVertical,
  Pencil,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { statusMeta, type ScheduleAppointment } from "@/lib/schedule-mock";

export function AppointmentCard({
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
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const meta = statusMeta[appointment.status];

  function toggleMenu(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 160;
      const menuHeight = 160;
      let left = rect.right - menuWidth;
      let top = rect.bottom + 4;
      if (left < 8) left = 8;
      if (top + menuHeight > window.innerHeight - 8) {
        top = rect.top - menuHeight - 4;
      }
      setMenuPos({ top, left });
    }
    setOpen((v) => !v);
  }

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
          className="fixed z-[9999] w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-slate-700 shadow-2xl"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-50"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            <Pencil className="h-3.5 w-3.5" /> Editar
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-50"
            onClick={() => {
              setOpen(false);
              onReschedule();
            }}
          >
            <CalendarClock className="h-3.5 w-3.5" /> Reagendar
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-50"
            onClick={() => {
              setOpen(false);
              onComplete();
            }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Concluir
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50"
            onClick={() => {
              setOpen(false);
              onCancel();
            }}
          >
            <XCircle className="h-3.5 w-3.5" /> Cancelar
          </button>
        </div>,
        document.body
      )
    : null;

  return (
    <div
      className={cn(
        "absolute inset-x-1 cursor-grab rounded-xl border px-2 py-1.5 shadow-sm transition active:cursor-grabbing",
        meta.card,
        appointment.status === "cancelado" && "opacity-70",
        isDragging ? "z-40 scale-[1.02] opacity-40 shadow-lg ring-2 ring-indigo-400" : "z-10 hover:-translate-y-0.5 hover:shadow-md hover:z-20",
        suppressPointerEvents && !isDragging && "pointer-events-none"
      )}
      style={style}
      draggable={appointment.status !== "cancelado"}
      onDragStart={(e) => {
        setOpen(false);
        onDragStart(e);
      }}
      onDragEnd={onDragEnd}
      title="Arraste para outro horário ou profissional"
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex min-w-0 items-start gap-1">
          <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-40" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold opacity-80">
              {appointment.start} - {appointment.end}
            </p>
            <p className="truncate text-xs font-semibold">{appointment.patient}</p>
            <p className="truncate text-[10px] opacity-80">{appointment.procedure}</p>
          </div>
        </div>
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleMenu}
          onMouseDown={(e) => e.stopPropagation()}
          className="rounded-md p-0.5 hover:bg-black/5"
          aria-label="Ações"
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
      </div>
      {menu}
    </div>
  );
}
