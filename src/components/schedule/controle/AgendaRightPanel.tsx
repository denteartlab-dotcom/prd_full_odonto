"use client";

import Link from "next/link";
import {
  BarChart3,
  CalendarClock,
  Clock,
  FileText,
  LayoutGrid,
  RefreshCw,
  Settings,
  ShoppingCart,
  Smile,
  Stethoscope,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const topIcons = [
  { icon: Settings, label: "Configurações" },
  { icon: Clock, label: "Horários", active: true },
  { icon: Users, label: "Equipe" },
  { icon: ShoppingCart, label: "Compras" },
  { icon: BarChart3, label: "Relatórios" },
];

const menuItems = [
  { href: "/app", label: "Início" },
  { href: "/app/agenda", label: "Fluxo na Clínica" },
  { href: "/app/agenda", label: "Agendamentos", active: true },
  { href: "/app/agenda", label: "Controle de Retornos" },
  { href: "/app/financeiro", label: "Controle de Convênios" },
  { href: "/app/financeiro", label: "Movimentações" },
  { href: "/app/consultas", label: "Procedimentos" },
  { href: "/app/consultas", label: "Consultas" },
  { href: "/app/relatorios", label: "Relatórios" },
];

export function AgendaRightPanel({ clinicName }: { clinicName?: string }) {
  return (
    <aside className="hidden w-[260px] shrink-0 flex-col bg-[#0c2340] text-slate-200 xl:flex">
      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-2">
          <Smile className="h-6 w-6 text-blue-400" />
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-white">
              Odonto Enterprise
            </p>
            <p className="text-[10px] text-slate-400">clinic</p>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-slate-400">
          Código do Cliente: 21.43760-3
        </p>
        {clinicName ? (
          <p className="mt-0.5 truncate text-[10px] text-slate-500">{clinicName}</p>
        ) : null}
      </div>

      <div className="flex justify-around border-b border-white/10 px-2 py-3">
        {topIcons.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            type="button"
            title={label}
            className={cn(
              "rounded-full p-2 transition",
              active ? "bg-blue-500 text-white" : "text-slate-400 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Gestão de Atendimentos
        </p>
        <nav className="space-y-0.5">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition",
                item.active
                  ? "bg-blue-500 text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              {item.label === "Agendamentos" ? (
                <CalendarClock className="h-3.5 w-3.5 shrink-0" />
              ) : item.label === "Consultas" ? (
                <Stethoscope className="h-3.5 w-3.5 shrink-0" />
              ) : item.label === "Relatórios" ? (
                <FileText className="h-3.5 w-3.5 shrink-0" />
              ) : item.label === "Início" ? (
                <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 shrink-0 opacity-50" />
              )}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
