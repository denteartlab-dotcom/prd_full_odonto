"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarCheck2, UserPlus } from "lucide-react";
import { emptyDashboard } from "@/lib/dashboard-types";
import type { DashboardData } from "@/lib/dashboard-types";
import { AlertsCard } from "./AlertsCard";
import { ChartCard, DonutChart } from "./ChartCard";
import { DashboardHeader } from "./DashboardHeader";
import { KPIWidget } from "./KPIWidget";
import { RecentActivity } from "./RecentActivity";
import { ScheduleCard } from "./ScheduleCard";

const HOME_KPI_IDS = new Set(["consultas", "pacientes"]);
const kpiIcons = {
  consultas: CalendarCheck2,
  pacientes: UserPlus,
} as const;

export function DashboardView({
  userName,
  role,
}: {
  userName: string;
  role: string;
}) {
  const [data, setData] = useState<DashboardData>(emptyDashboard());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error || "Falha ao carregar o início.");
        }
        const json = (await res.json()) as { dashboard: DashboardData };
        if (!cancelled) setData(json.dashboard);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar.");
          setData(emptyDashboard());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = useMemo(
    () => data.kpis.filter((kpi) => HOME_KPI_IDS.has(kpi.id)),
    [data.kpis]
  );

  const roleLabel =
    role === "admin" || role === "proprietario" ? "Administradora" : role;

  return (
    <div className="mx-auto max-w-[1400px]">
      <DashboardHeader
        userName={userName}
        role={roleLabel}
        periodLabel={data.periodLabel}
      />

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-slate-100 bg-slate-50"
            />
          ))}
        </div>
      ) : (
        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          {kpis.map((kpi) => (
            <KPIWidget
              key={kpi.id}
              label={kpi.label}
              value={kpi.value}
              growth={kpi.growth}
              tone={kpi.tone}
              sparkline={kpi.sparkline}
              icon={kpiIcons[kpi.id as keyof typeof kpiIcons] || CalendarCheck2}
            />
          ))}
        </div>
      )}

      <div className="mb-5 grid gap-4 xl:grid-cols-2">
        <ScheduleCard items={data.agendaHoje} />
        <ChartCard title="Procedimentos mais realizados">
          <DonutChart items={data.procedimentos} total={data.procedimentosTotal} />
        </ChartCard>
      </div>

      <div className="mb-5">
        <AlertsCard items={data.alertas} />
      </div>

      <RecentActivity items={data.atividades} />
    </div>
  );
}
