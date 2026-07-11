"use client";

import type { LucideIcon } from "lucide-react";
import { Cake, TrendingUp, UserCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

function KPICard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  onClick,
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone: "purple" | "green" | "blue" | "orange";
  onClick?: () => void;
}) {
  const tones = {
    purple: "bg-violet-50 text-violet-600",
    green: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
  };

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-[0_8px_30px_rgb(15_23_42/0.04)] sm:p-5",
        onClick && "transition hover:-translate-y-0.5 hover:shadow-md"
      )}
    >
      <div className={cn("mb-4 flex h-10 w-10 items-center justify-center rounded-xl", tones[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-xs font-medium text-slate-500">{hint}</p>
    </Wrapper>
  );
}

export function PatientsKPICards({
  total,
  active,
  activeRate,
  newThisMonth,
  birthdays,
  onBirthdaysClick,
}: {
  total: number;
  active: number;
  activeRate: number;
  newThisMonth: number;
  birthdays: number;
  onBirthdaysClick?: () => void;
}) {
  const fmt = (n: number) => n.toLocaleString("pt-BR");

  return (
    <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KPICard
        label="Total de pacientes"
        value={fmt(total)}
        hint="Todos os pacientes"
        icon={Users}
        tone="purple"
      />
      <KPICard
        label="Pacientes ativos"
        value={fmt(active)}
        hint={`${activeRate.toFixed(1).replace(".", ",")}% do total`}
        icon={UserCheck}
        tone="green"
      />
      <KPICard
        label="Novos este mês"
        value={fmt(newThisMonth)}
        hint={
          newThisMonth > 0
            ? "+ 12,5% vs mês anterior"
            : "Sem novos cadastros no mês"
        }
        icon={TrendingUp}
        tone="blue"
      />
      <KPICard
        label="Aniversariantes do mês"
        value={fmt(birthdays)}
        hint="Ver lista"
        icon={Cake}
        tone="orange"
        onClick={onBirthdaysClick}
      />
    </div>
  );
}
