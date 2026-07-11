"use client";

import {
  CalendarCheck2,
  CircleDollarSign,
  UserPlus,
  WalletCards,
} from "lucide-react";
import { dashboardMock } from "@/lib/dashboard-mock";
import { AlertsCard } from "./AlertsCard";
import { BarChart, ChartCard, DonutChart } from "./ChartCard";
import { CommissionsList } from "./CommissionsList";
import { DashboardHeader } from "./DashboardHeader";
import { FinancialCard } from "./FinancialCard";
import { KPIWidget } from "./KPIWidget";
import { OdontogramControl } from "./OdontogramControl";
import { ReceivablesTable } from "./ReceivablesTable";
import { RecentActivity } from "./RecentActivity";
import { ScheduleCard } from "./ScheduleCard";

const kpiIcons = [CircleDollarSign, WalletCards, CalendarCheck2, UserPlus] as const;

export function DashboardView({
  userName,
  role,
}: {
  userName: string;
  role: string;
}) {
  const data = dashboardMock;
  const roleLabel =
    role === "admin" || role === "proprietario" ? "Administradora" : role;

  return (
    <div className="mx-auto max-w-[1400px]">
      <DashboardHeader
        userName={userName}
        role={roleLabel}
        periodLabel={data.periodLabel}
      />

      {/* KPIs */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((kpi, index) => (
          <KPIWidget
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            growth={kpi.growth}
            tone={kpi.tone}
            sparkline={kpi.sparkline}
            icon={kpiIcons[index]}
          />
        ))}
      </div>

      {/* Agenda + charts */}
      <div className="mb-5 grid gap-4 xl:grid-cols-3">
        <ScheduleCard items={data.agendaHoje} />
        <ChartCard title="Faturamento dos últimos 6 meses">
          <BarChart data={data.faturamento6Meses} />
        </ChartCard>
        <ChartCard title="Procedimentos mais realizados">
          <DonutChart items={data.procedimentos} total={data.procedimentosTotal} />
        </ChartCard>
      </div>

      {/* Odonto + receivables */}
      <div className="mb-5 grid gap-4 xl:grid-cols-2">
        <OdontogramControl
          stats={data.odontoStats}
          upper={data.odontogramUpper}
          lower={data.odontogramLower}
        />
        <ReceivablesTable items={data.contasReceber} />
      </div>

      {/* Finance + commissions + alerts */}
      <div className="mb-5 grid gap-4 xl:grid-cols-3">
        <FinancialCard
          receitas={data.resumoFinanceiro.receitas}
          despesas={data.resumoFinanceiro.despesas}
          lucroLiquido={data.resumoFinanceiro.lucroLiquido}
          margem={data.resumoFinanceiro.margem}
        />
        <CommissionsList items={data.comissoes} />
        <AlertsCard items={data.alertas} />
      </div>

      {/* Activity */}
      <RecentActivity items={data.atividades} />
    </div>
  );
}
