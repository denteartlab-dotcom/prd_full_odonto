"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Home,
  MessageSquare,
  Search,
  Stethoscope,
  UserPlus,
  X,
} from "lucide-react";
import { Smile } from "lucide-react";
import { ConsultationTimer } from "./ConsultationTimer";
import { useMounted } from "@/hooks/use-mounted";

type ConsultationNotification = {
  id: string;
  professionalId: string;
  patient: string;
  professionalName: string;
  procedure: string;
  startedAt: string;
};

export function AgendaTopBar({
  search,
  onSearchChange,
  userName,
  consultationNotifications = [],
  onSelectProfessional,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  userName: string;
  consultationNotifications?: ConsultationNotification[];
  onSelectProfessional?: (professionalId: string) => void;
}) {
  const mounted = useMounted();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const hasNotifications = mounted && consultationNotifications.length > 0;

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  useEffect(() => {
    if (!notificationsOpen) return;
    function onDoc(e: MouseEvent) {
      if (panelRef.current?.contains(e.target as Node)) return;
      setNotificationsOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [notificationsOpen]);

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 bg-white">
        <Smile className="h-5 w-5 text-blue-600" />
      </div>

      <label className="relative min-w-[200px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar Paciente"
          className="w-full rounded-md border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </label>

      <Link
        href="/app/pacientes/novo"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
        title="Adicionar paciente"
      >
        <UserPlus className="h-4 w-4" />
      </Link>

      <div className="flex items-center gap-1">
        <button type="button" className="rounded p-2 text-slate-400 hover:bg-slate-100" aria-label="Fechar">
          <X className="h-4 w-4" />
        </button>
        <Link href="/app" className="rounded p-2 text-slate-500 hover:bg-slate-100" title="Início">
          <Home className="h-4 w-4" />
        </Link>
        <button type="button" className="rounded p-2 text-slate-500 hover:bg-slate-100" aria-label="Mensagens">
          <MessageSquare className="h-4 w-4" />
        </button>
        <div className="relative" ref={panelRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen((v) => !v)}
            className="relative rounded p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Notificações"
          >
            <Bell className="h-4 w-4" />
            {hasNotifications ? (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
            ) : null}
          </button>

          {notificationsOpen && mounted ? (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">Notificações</p>
                <p className="text-xs text-slate-500">Consultas iniciadas hoje</p>
              </div>
              {consultationNotifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-slate-500">
                  Nenhuma consulta em andamento.
                </p>
              ) : (
                <ul className="max-h-72 overflow-y-auto">
                  {consultationNotifications.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectProfessional?.(n.professionalId);
                          setNotificationsOpen(false);
                        }}
                        className="flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left hover:bg-blue-50/60"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                          <Stethoscope className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-blue-700">
                            {n.professionalName}
                          </p>
                          <p className="text-sm font-medium text-slate-800">
                            {n.patient} chegou — consulta iniciada
                          </p>
                          <p className="truncate text-xs text-slate-500">{n.procedure}</p>
                          <ConsultationTimer
                            startedAt={n.startedAt}
                            className="mt-1 text-blue-800"
                          />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>
        <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-[10px] font-bold text-white">
          {initials || "U"}
        </div>
      </div>
    </div>
  );
}
