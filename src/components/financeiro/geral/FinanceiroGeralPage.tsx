"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Diamond,
  Plus,
  Download,
  ChevronDown,
  Search,
  Eye,
  Pencil,
  Copy,
  Trash2,
  Printer,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui";
import { FINANCEIRO_GERAL_MOCK } from "@/lib/financeiro-geral-mock";
import type {
  FinancePeriodPreset,
  FinanceiroGeralData,
} from "@/lib/financeiro-geral-types";
import { cn, money } from "@/lib/utils";
import { MoreActionsFlyout } from "./MoreActionsFlyout";
import {
  FinanceSkeleton,
  GroupedBarChart,
  LineCashflowChart,
  PaymentDonut,
  SoftCard,
  Sparkline,
  StatusPill,
} from "./financeiro-ui";

const PERIODS: { id: FinancePeriodPreset; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "semana", label: "Esta Semana" },
  { id: "mes", label: "Este Mês" },
  { id: "ano", label: "Este Ano" },
  { id: "personalizado", label: "Personalizado" },
];

const CASHFLOW_MODES = [
  { id: "diario", label: "Diário" },
  { id: "semanal", label: "Semanal" },
  { id: "mensal", label: "Mensal" },
  { id: "anual", label: "Anual" },
] as const;

const KPI_TONES = {
  green: { spark: "#10b981", fill: "rgba(16,185,129,0.12)", badge: "text-emerald-600" },
  red: { spark: "#f43f5e", fill: "rgba(244,63,94,0.12)", badge: "text-rose-600" },
  blue: { spark: "#2563eb", fill: "rgba(37,99,235,0.12)", badge: "text-brand-600" },
  amber: { spark: "#f59e0b", fill: "rgba(245,158,11,0.12)", badge: "text-amber-600" },
  slate: { spark: "#64748b", fill: "rgba(100,116,139,0.12)", badge: "text-slate-600" },
  violet: { spark: "#7c3aed", fill: "rgba(124,58,237,0.12)", badge: "text-violet-600" },
} as const;

export function FinanceiroGeralPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FinanceiroGeralData>(FINANCEIRO_GERAL_MOCK);
  const [period, setPeriod] = useState<FinancePeriodPreset>("mes");
  const [cashMode, setCashMode] = useState<(typeof CASHFLOW_MODES)[number]["id"]>("diario");
  const [barMode, setBarMode] = useState<"semanal" | "mensal">("semanal");
  const [moreOpen, setMoreOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    professional: "Todos",
    convenio: "Todos",
    paymentMethod: "Todos",
    bankAccount: "Todas",
    costCenter: "Todos",
    category: "Todas",
    status: "Todos",
  });
  const [sortKey, setSortKey] = useState<"date" | "patient" | "income" | "expense">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const t = window.setTimeout(() => {
      setData(FINANCEIRO_GERAL_MOCK);
      setLoading(false);
    }, 450);
    return () => window.clearTimeout(t);
  }, []);

  const cashflowSeries = useMemo(() => {
    if (cashMode === "semanal") return data.cashflowWeekly;
    if (cashMode === "mensal") return data.cashflowMonthly;
    if (cashMode === "anual") return data.cashflowYearly;
    return data.cashflowDaily;
  }, [cashMode, data]);

  const filteredMovements = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = data.movements.filter((m) => {
      if (q) {
        const hay = [
          m.patient,
          m.description,
          m.category,
          m.professional,
          m.paymentMethod,
          m.bankAccount,
          m.notes,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.professional !== "Todos" && m.professional !== filters.professional)
        return false;
      if (filters.paymentMethod !== "Todos" && m.paymentMethod !== filters.paymentMethod)
        return false;
      if (filters.bankAccount !== "Todas" && m.bankAccount !== filters.bankAccount)
        return false;
      if (filters.costCenter !== "Todos" && m.costCenter !== filters.costCenter)
        return false;
      if (filters.category !== "Todas" && m.category !== filters.category) return false;
      if (filters.status !== "Todos") {
        const map: Record<string, string> = {
          Pago: "pago",
          Pendente: "pendente",
          "A vencer": "a_vencer",
          "Em atraso": "em_atraso",
        };
        if (m.status !== map[filters.status]) return false;
      }
      return true;
    });

    rows = [...rows].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "patient") return a.patient.localeCompare(b.patient) * dir;
      if (sortKey === "income") return ((a.income || 0) - (b.income || 0)) * dir;
      if (sortKey === "expense") return ((a.expense || 0) - (b.expense || 0)) * dir;
      return a.date.localeCompare(b.date) * dir;
    });
    return rows;
  }, [data.movements, filters, query, sortDir, sortKey]);

  const goalPct = Math.min(
    100,
    Math.round((data.goal.current / data.goal.target) * 10000) / 100
  );

  function notify(label: string) {
    setMessage(`${label} — ação preparada para integração com API.`);
  }

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  if (loading) return <FinanceSkeleton />;

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-900/20">
            <Diamond className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Financeiro Geral
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Acompanhe toda a movimentação financeira da clínica em tempo real.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" className="rounded-xl" onClick={() => notify("Novo Recebimento")}>
            <Plus className="h-4 w-4" />
            Novo Recebimento
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl border border-brand-200 text-brand-700 hover:bg-brand-50"
            onClick={() => notify("Nova Despesa")}
          >
            <Plus className="h-4 w-4" />
            Nova Despesa
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl"
            onClick={() => notify("Exportar Relatório")}
          >
            <Download className="h-4 w-4" />
            Exportar Relatório
          </Button>
          <div className="relative">
            <Button
              type="button"
              variant="secondary"
              className="rounded-xl"
              onClick={() => setMoreOpen((v) => !v)}
            >
              Mais Ações
              <ChevronDown className="h-4 w-4" />
            </Button>
            <MoreActionsFlyout
              open={moreOpen}
              onClose={() => setMoreOpen(false)}
              onAction={notify}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <SoftCard bodyClassName="!p-0">
        <div className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Período
            </span>
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-medium transition",
                  period === p.id
                    ? "bg-brand-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {p.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
              01/07/2026 — 31/07/2026
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
            <SelectFilter
              label="Profissional"
              value={filters.professional}
              options={data.filterOptions.professionals}
              onChange={(v) => setFilters((f) => ({ ...f, professional: v }))}
            />
            <SelectFilter
              label="Convênio"
              value={filters.convenio}
              options={data.filterOptions.convenios}
              onChange={(v) => setFilters((f) => ({ ...f, convenio: v }))}
            />
            <SelectFilter
              label="Forma de Pagamento"
              value={filters.paymentMethod}
              options={data.filterOptions.paymentMethods}
              onChange={(v) => setFilters((f) => ({ ...f, paymentMethod: v }))}
            />
            <SelectFilter
              label="Conta Bancária"
              value={filters.bankAccount}
              options={data.filterOptions.bankAccounts}
              onChange={(v) => setFilters((f) => ({ ...f, bankAccount: v }))}
            />
            <SelectFilter
              label="Centro de Custo"
              value={filters.costCenter}
              options={data.filterOptions.costCenters}
              onChange={(v) => setFilters((f) => ({ ...f, costCenter: v }))}
            />
            <SelectFilter
              label="Categoria"
              value={filters.category}
              options={data.filterOptions.categories}
              onChange={(v) => setFilters((f) => ({ ...f, category: v }))}
            />
            <SelectFilter
              label="Status"
              value={filters.status}
              options={data.filterOptions.statuses}
              onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
            />
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
              />
            </label>
          </div>
        </div>
      </SoftCard>

      {message ? (
        <p className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-2.5 text-sm text-brand-800">
          {message}
        </p>
      ) : null}

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-8">
        {data.kpis.map((kpi) => {
          const tone = KPI_TONES[kpi.tone];
          return (
            <div
              key={kpi.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {kpi.label}
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{kpi.value}</p>
              {kpi.delta != null ? (
                <p className={cn("mt-1 text-xs font-medium", tone.badge)}>
                  {kpi.delta > 0 ? "+" : ""}
                  {kpi.delta}% vs mês anterior
                </p>
              ) : kpi.hint ? (
                <p className="mt-1 text-xs text-slate-500">{kpi.hint}</p>
              ) : null}
              {kpi.sparkline ? (
                <div className="mt-2">
                  <Sparkline values={kpi.sparkline} color={tone.spark} fill={tone.fill} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Dashboard + summary */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
          {/* Left 70% */}
          <div className="space-y-5">
            <SoftCard
              title="Fluxo de Caixa"
              description="Receitas, despesas e lucro"
              action={
                <div className="flex flex-wrap gap-1">
                  {CASHFLOW_MODES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setCashMode(m.id)}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-[11px] font-medium",
                        cashMode === m.id
                          ? "bg-brand-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              }
            >
              <LineCashflowChart data={cashflowSeries} />
            </SoftCard>

            <SoftCard
              title="Receitas x Despesas"
              action={
                <div className="flex gap-1">
                  {(["semanal", "mensal"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setBarMode(m)}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize",
                        barMode === m
                          ? "bg-brand-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              }
            >
              <GroupedBarChart
                data={
                  barMode === "semanal"
                    ? data.incomeExpenseBars
                    : data.cashflowMonthly.map((m) => ({
                        label: m.label,
                        receitas: m.receitas,
                        despesas: m.despesas,
                      }))
                }
              />
            </SoftCard>

            <SoftCard title="Recebimentos Recentes">
              <MiniTable
                columns={[
                  "Paciente",
                  "Procedimento",
                  "Profissional",
                  "Pagamento",
                  "Data",
                  "Valor",
                  "Status",
                  "Ações",
                ]}
                rows={data.recentReceipts.map((r) => [
                  r.patient,
                  r.procedure,
                  r.professional,
                  r.paymentMethod,
                  r.date,
                  money(r.amount),
                  <StatusPill key={`${r.id}-s`} status={r.status} />,
                  <RowActions key={`${r.id}-a`} onAction={notify} />,
                ])}
              />
            </SoftCard>

            <SoftCard title="Contas a Receber">
              <MiniTable
                columns={[
                  "Paciente",
                  "Documento",
                  "Vencimento",
                  "Valor",
                  "Situação",
                  "Dias atraso",
                  "Ações",
                ]}
                rows={data.receivables.map((r) => [
                  r.patient,
                  r.document,
                  r.dueDate,
                  money(r.amount),
                  <StatusPill key={`${r.id}-s`} status={r.status} />,
                  String(r.daysOverdue),
                  <RowActions key={`${r.id}-a`} onAction={notify} />,
                ])}
              />
            </SoftCard>

            <SoftCard title="Contas a Pagar">
              <MiniTable
                columns={[
                  "Fornecedor",
                  "Categoria",
                  "Vencimento",
                  "Valor",
                  "Conta",
                  "Status",
                  "Ações",
                ]}
                rows={data.payables.map((r) => [
                  r.vendor,
                  r.category,
                  r.dueDate,
                  money(r.amount),
                  r.account,
                  <StatusPill key={`${r.id}-s`} status={r.status} />,
                  <RowActions key={`${r.id}-a`} onAction={notify} />,
                ])}
              />
            </SoftCard>
          </div>

          {/* Right dashboard column */}
          <div className="space-y-5">
            <SoftCard title="Saldo Bancário">
              <ul className="space-y-3">
                {data.bankAccounts.map((b) => (
                  <li
                    key={b.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{b.bank}</p>
                        <p className="text-xs text-slate-500">{b.account}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        {money(b.balance)}
                      </p>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">
                      Atualizado: {b.updatedAt}
                    </p>
                  </li>
                ))}
              </ul>
            </SoftCard>

            <SoftCard title="Formas de Pagamento">
              <PaymentDonut items={data.paymentMethods} />
            </SoftCard>

            <SoftCard title="Convênios">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500">
                      <th className="pb-2 font-semibold">Nome</th>
                      <th className="pb-2 font-semibold">A receber</th>
                      <th className="pb-2 font-semibold">Guias</th>
                      <th className="pb-2 font-semibold">Próx.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.convenios.map((c) => (
                      <tr key={c.id} className="border-t border-slate-100">
                        <td className="py-2 font-medium text-slate-800">{c.name}</td>
                        <td className="py-2">{money(c.amount)}</td>
                        <td className="py-2">{c.guides}</td>
                        <td className="py-2 text-slate-500">{c.nextPayment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SoftCard>

            <SoftCard title="Próximos Vencimentos">
              <ul className="space-y-2">
                {data.upcoming.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-start justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-600">
                        {u.when === "hoje"
                          ? "Hoje"
                          : u.when === "amanha"
                            ? "Amanhã"
                            : "Esta Semana"}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-700">{u.label}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {money(u.amount)}
                    </p>
                  </li>
                ))}
              </ul>
            </SoftCard>

            <SoftCard title="Alertas Financeiros">
              <ul className="space-y-2">
                {data.alerts.map((a) => (
                  <li
                    key={a.id}
                    className={cn(
                      "rounded-xl border px-3 py-2.5",
                      a.priority === "alta" && "border-rose-200 bg-rose-50",
                      a.priority === "media" && "border-amber-200 bg-amber-50",
                      a.priority === "baixa" && "border-slate-200 bg-slate-50"
                    )}
                  >
                    <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                    <p className="mt-0.5 text-xs text-slate-600">{a.detail}</p>
                  </li>
                ))}
              </ul>
            </SoftCard>

            <SoftCard title="Metas Financeiras">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Meta mensal</span>
                  <span className="font-semibold text-slate-900">
                    {money(data.goal.target)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Receita atual</span>
                  <span className="font-semibold text-slate-900">
                    {money(data.goal.current)}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600"
                    style={{ width: `${goalPct}%` }}
                  />
                </div>
                <p className="text-right text-xs font-semibold text-brand-700">
                  {goalPct}%
                </p>
              </div>
            </SoftCard>
          </div>
        </div>

        {/* Far-right summary panel */}
        <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <SoftCard title="Resumo Financeiro">
            <dl className="space-y-3 text-sm">
              {(
                [
                  ["Saldo Total", money(data.summary.saldoTotal)],
                  ["Receitas", money(data.summary.receitas)],
                  ["Despesas", money(data.summary.despesas)],
                  ["Lucro", money(data.summary.lucro)],
                  ["Ticket Médio", money(data.summary.ticketMedio)],
                  ["Faturamento Diário", money(data.summary.faturamentoDiario)],
                  ["Faturamento Mensal", money(data.summary.faturamentoMensal)],
                  ["Faturamento Anual", money(data.summary.faturamentoAnual)],
                  ["Pacientes Pagantes", String(data.summary.pacientesPagantes)],
                  ["Convênios", money(data.summary.convenios)],
                  ["Receitas Previstas", money(data.summary.receitasPrevistas)],
                  ["Despesas Previstas", money(data.summary.despesasPrevistas)],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="text-right font-semibold text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
          </SoftCard>
        </aside>
      </div>

      {/* Bottom movements table */}
      <SoftCard
        title="Movimentações Financeiras"
        description="Ledger completo da clínica"
        action={
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            {filteredMovements.length} registros
          </span>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-[1200px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-2 py-3">
                  <button type="button" onClick={() => toggleSort("date")}>
                    Data
                  </button>
                </th>
                <th className="px-2 py-3">
                  <button type="button" onClick={() => toggleSort("patient")}>
                    Paciente
                  </button>
                </th>
                <th className="px-2 py-3">Descrição</th>
                <th className="px-2 py-3">Categoria</th>
                <th className="px-2 py-3">Profissional</th>
                <th className="px-2 py-3">Centro de custo</th>
                <th className="px-2 py-3">Pagamento</th>
                <th className="px-2 py-3">Conta</th>
                <th className="px-2 py-3">
                  <button type="button" onClick={() => toggleSort("income")}>
                    Receita
                  </button>
                </th>
                <th className="px-2 py-3">
                  <button type="button" onClick={() => toggleSort("expense")}>
                    Despesa
                  </button>
                </th>
                <th className="px-2 py-3">Saldo</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-2 py-3">Observações</th>
                <th className="px-2 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.map((m) => (
                <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/70">
                  <td className="px-2 py-2.5 text-slate-600">{m.date}</td>
                  <td className="px-2 py-2.5 font-medium text-slate-800">{m.patient}</td>
                  <td className="px-2 py-2.5 text-slate-700">{m.description}</td>
                  <td className="px-2 py-2.5 text-slate-600">{m.category}</td>
                  <td className="px-2 py-2.5 text-slate-600">{m.professional}</td>
                  <td className="px-2 py-2.5 text-slate-600">{m.costCenter}</td>
                  <td className="px-2 py-2.5 text-slate-600">{m.paymentMethod}</td>
                  <td className="px-2 py-2.5 text-slate-600">{m.bankAccount}</td>
                  <td className="px-2 py-2.5 font-medium text-emerald-700">
                    {m.income != null ? money(m.income) : "—"}
                  </td>
                  <td className="px-2 py-2.5 font-medium text-rose-600">
                    {m.expense != null ? money(m.expense) : "—"}
                  </td>
                  <td className="px-2 py-2.5 font-semibold text-slate-900">
                    {money(m.balance)}
                  </td>
                  <td className="px-2 py-2.5">
                    <StatusPill status={m.status} />
                  </td>
                  <td className="max-w-[140px] truncate px-2 py-2.5 text-slate-500">
                    {m.notes || "—"}
                  </td>
                  <td className="px-2 py-2.5">
                    <div className="flex items-center gap-1">
                      <IconBtn title="Visualizar" onClick={() => notify("Visualizar")}>
                        <Eye className="h-3.5 w-3.5" />
                      </IconBtn>
                      <IconBtn title="Editar" onClick={() => notify("Editar")}>
                        <Pencil className="h-3.5 w-3.5" />
                      </IconBtn>
                      <IconBtn title="Duplicar" onClick={() => notify("Duplicar")}>
                        <Copy className="h-3.5 w-3.5" />
                      </IconBtn>
                      <IconBtn title="Excluir" onClick={() => notify("Excluir")}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </IconBtn>
                      <IconBtn title="Imprimir" onClick={() => notify("Imprimir")}>
                        <Printer className="h-3.5 w-3.5" />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Mostrando 1 a {filteredMovements.length} de {data.movements.length} registros
          </span>
          <div className="flex gap-1">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                type="button"
                className={cn(
                  "h-8 w-8 rounded-lg border text-xs font-medium",
                  p === 1
                    ? "border-brand-200 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </SoftCard>
    </div>
  );
}

function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
        title={label}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o === options[0] ? `${label}: ${o}` : o}
          </option>
        ))}
      </select>
    </label>
  );
}

function MiniTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: (string | number | React.ReactNode)[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-500">
            {columns.map((c) => (
              <th key={c} className="px-2 py-2 font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-50">
              {row.map((cell, j) => (
                <td key={j} className="px-2 py-2.5 text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RowActions({ onAction }: { onAction: (label: string) => void }) {
  return (
    <div className="flex items-center gap-1">
      <IconBtn title="Visualizar" onClick={() => onAction("Visualizar")}>
        <Eye className="h-3.5 w-3.5" />
      </IconBtn>
      <IconBtn title="Editar" onClick={() => onAction("Editar")}>
        <Pencil className="h-3.5 w-3.5" />
      </IconBtn>
    </div>
  );
}

function IconBtn({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
    >
      {children}
    </button>
  );
}
