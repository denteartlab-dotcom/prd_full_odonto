"use client";

import { Bell, Search } from "lucide-react";

export function DashboardHeader({
  userName,
  role,
  periodLabel,
}: {
  userName: string;
  role: string;
  periodLabel: string;
}) {
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Início</h1>
        <p className="mt-0.5 text-sm text-slate-500">Visão geral da sua clínica.</p>
      </div>

      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center xl:max-w-3xl xl:justify-end">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Buscar paciente, consulta, orçamento..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50"
            aria-label="Notificações"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
              {initials || "U"}
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-semibold text-slate-800">{userName}</p>
              <p className="text-[11px] capitalize text-slate-500">{role}</p>
            </div>
          </div>

          <div className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm md:block">
            {periodLabel}
          </div>
        </div>
      </div>
    </header>
  );
}
