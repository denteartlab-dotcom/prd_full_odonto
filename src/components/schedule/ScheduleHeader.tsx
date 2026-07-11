"use client";

import { Bell, Search } from "lucide-react";

export function ScheduleHeader({
  userName,
  role,
}: {
  userName: string;
  role: string;
}) {
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const roleLabel =
    role === "admin" || role === "proprietario" ? "Administradora" : role;

  return (
    <header className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Agenda</h1>
        <p className="mt-0.5 text-sm text-slate-500">Gerencie os agendamentos da clínica</p>
      </div>

      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center xl:max-w-2xl xl:justify-end">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Buscar paciente, dentista, procedimento..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
          />
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm"
            aria-label="Notificações"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[11px] font-bold text-white">
              {initials || "U"}
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-semibold text-slate-800">{userName}</p>
              <p className="text-[11px] capitalize text-slate-500">{roleLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
