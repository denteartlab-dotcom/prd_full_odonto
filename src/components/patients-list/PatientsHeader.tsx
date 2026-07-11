"use client";

import Link from "next/link";
import { Bell, CircleHelp, Plus, Search } from "lucide-react";

export function PatientsHeader({
  userName,
  role,
  search,
  onSearchChange,
}: {
  userName: string;
  role: string;
  search: string;
  onSearchChange: (value: string) => void;
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
    <header className="mb-5 flex flex-col gap-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Pacientes</h1>
          <p className="mt-0.5 text-sm text-slate-500">Gerencie os pacientes da clínica</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <Link
            href="/app/pacientes/novo"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-600 hover:to-violet-700"
          >
            <Plus className="h-4 w-4" />
            Novo paciente
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar paciente por nome, CPF, telefone..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
          />
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50"
            aria-label="Notificações"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50"
            aria-label="Ajuda"
          >
            <CircleHelp className="h-4 w-4" />
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
