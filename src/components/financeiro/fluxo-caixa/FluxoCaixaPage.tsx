"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Banknote,
  ChevronDown,
  Copy,
  Download,
  Eye,
  Paperclip,
  Pencil,
  Plus,
  Printer,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui";
import {
  FinanceSkeleton,
  PaymentDonut,
  SoftCard,
  Sparkline,
} from "@/components/financeiro/geral/financeiro-ui";
import {
  CashStatusPill,
  CashTypePill,
  CombinedCashflowChart,
  IconBtn,
  ProjectedFlowChart,
} from "./fluxo-caixa-ui";
import { FluxoCaixaMoreActions } from "./FluxoCaixaMoreActions";
import {
  NewMovementDrawer,
  ReconciliationModal,
  TransferModal,
} from "./FluxoCaixaDrawers";
import { createFluxoCaixaMock } from "@/lib/fluxo-caixa-mock";
import {
  emptyNewCashMovementForm,
  emptyTransferForm,
  type CashflowChartMode,
  type CashMovementRow,
  type CashMovementStatus,
  type CashMovementType,
  type CashPeriodPreset,
  type FluxoCaixaData,
  type NewCashMovementForm,
  type TransferForm,
} from "@/lib/fluxo-caixa-types";
import { cn, money } from "@/lib/utils";

const PERIODS: { id: CashPeriodPreset; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "semana", label: "Esta Semana" },
  { id: "mes", label: "Este Mês" },
  { id: "ano", label: "Este Ano" },
  { id: "personalizado", label: "Personalizado" },
];

const CHART_MODES: { id: CashflowChartMode; label: string }[] = [
  { id: "diario", label: "Diário" },
  { id: "semanal", label: "Semanal" },
  { id: "mensal", label: "Mensal" },
  { id: "anual", label: "Anual" },
];

const KPI_TONES = {
  green: { spark: "#10b981", fill: "rgba(16,185,129,0.12)", badge: "text-emerald-600" },
  red: { spark: "#f43f5e", fill: "rgba(244,63,94,0.12)", badge: "text-rose-600" },
  blue: { spark: "#2563eb", fill: "rgba(37,99,235,0.12)", badge: "text-brand-600" },
  amber: { spark: "#f59e0b", fill: "rgba(245,158,11,0.12)", badge: "text-amber-600" },
  slate: { spark: "#64748b", fill: "rgba(100,116,139,0.12)", badge: "text-slate-600" },
  violet: { spark: "#7c3aed", fill: "rgba(124,58,237,0.12)", badge: "text-violet-600" },
} as const;

const ALERT_TONE = {
  alta: "border-l-rose-500 bg-rose-50/80 text-rose-800",
  media: "border-l-amber-500 bg-amber-50/80 text-amber-800",
  baixa: "border-l-slate-300 bg-slate-50 text-slate-700",
} as const;

const ALERT_DOT = {
  alta: "bg-rose-500",
  media: "bg-amber-500",
  baixa: "bg-slate-400",
} as const;

type SortKey =
  | "date"
  | "description"
  | "type"
  | "category"
  | "income"
  | "expense"
  | "balance"
  | "status";

export function FluxoCaixaPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FluxoCaixaData | null>(null);
  const [period, setPeriod] = useState<CashPeriodPreset>("mes");
  const [chartMode, setChartMode] = useState<CashflowChartMode>("diario");
  const [query, setQuery] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [reconcileOpen, setReconcileOpen] = useState(false);
  const [movementForm, setMovementForm] = useState<NewCashMovementForm>(emptyNewCashMovementForm());
  const [transferForm, setTransferForm] = useState<TransferForm>(emptyTransferForm());
  const [filters, setFilters] = useState({
    type: "Todos",
    category: "Todas",
    bankAccount: "Todas",
    costCenter: "Todos",
    paymentMethod: "Todas",
    professional: "Todos",
    convenio: "Todos",
    status: "Todos",
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setData(createFluxoCaixaMock());
      setLoading(false);
    }, 350);
    return () => window.clearTimeout(timer);
  }, []);

  const chartSeries = useMemo(() => {
    if (!data) return [];
    if (chartMode === "semanal") return data.seriesWeekly;
    if (chartMode === "mensal") return data.seriesMonthly;
    if (chartMode === "anual") return data.seriesYearly;
    return data.seriesDaily;
  }, [chartMode, data]);

  const filteredMovements = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    let rows = data.movements.filter((m) => {
      if (q) {
        const hay = [
          m.description,
          m.patient,
          m.vendor,
          m.category,
          m.document,
          m.bankAccount,
          m.costCenter,
          m.professional,
          m.paymentMethod,
          m.notes,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.type !== "Todos") {
        const map: Record<string, CashMovementType> = {
          Entrada: "entrada",
          Saída: "saida",
          Transferência: "transferencia",
        };
        if (m.type !== map[filters.type]) return false;
      }
      if (filters.category !== "Todas" && m.category !== filters.category) return false;
      if (filters.bankAccount !== "Todas" && m.bankAccount !== filters.bankAccount) return false;
      if (filters.costCenter !== "Todos" && m.costCenter !== filters.costCenter) return false;
      if (filters.paymentMethod !== "Todas" && m.paymentMethod !== filters.paymentMethod)
        return false;
      if (filters.professional !== "Todos" && m.professional !== filters.professional)
        return false;
      if (filters.status !== "Todos") {
        const map: Record<string, CashMovementStatus> = {
          Confirmado: "confirmado",
          Pendente: "pendente",
          Cancelado: "cancelado",
          Agendado: "agendado",
          Conciliado: "conciliado",
        };
        if (m.status !== map[filters.status]) return false;
      }
      return true;
    });

    rows = [...rows].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "description") return a.description.localeCompare(b.description) * dir;
      if (sortKey === "type") return a.type.localeCompare(b.type) * dir;
      if (sortKey === "category") return a.category.localeCompare(b.category) * dir;
      if (sortKey === "income") return ((a.income || 0) - (b.income || 0)) * dir;
      if (sortKey === "expense") return ((a.expense || 0) - (b.expense || 0)) * dir;
      if (sortKey === "balance") return (a.balance - b.balance) * dir;
      if (sortKey === "status") return a.status.localeCompare(b.status) * dir;
      return a.date.localeCompare(b.date) * dir;
    });
    return rows;
  }, [data, filters, query, sortDir, sortKey]);

  function notify(label: string) {
    setMessage(`${label} — ação preparada para integração com API.`);
  }

  async function closeCash(periodType: "diario" | "mensal") {
    setMessage("");
    try {
      const res = await fetch("/api/financeiro/caixa/fechamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodType }),
      });
      const data = (await res.json()) as {
        error?: string;
        commissionsCreated?: number;
        totalEntradas?: number;
        saldo?: number;
        closing?: { periodKey: string };
      };
      if (!res.ok) throw new Error(data.error || "Falha ao fechar o caixa.");
      setMessage(
        `Caixa ${periodType} (${data.closing?.periodKey}) fechado. Entradas: ${money(
          data.totalEntradas || 0
        )} · Saldo: ${money(data.saldo || 0)} · ${
          data.commissionsCreated || 0
        } comissão(ões) gerada(s).`
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao fechar caixa.");
    }
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function toggleSelect(id: string) {
    setSelected((list) =>
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
    );
  }

  function toggleSelectAll() {
    if (selected.length === filteredMovements.length) setSelected([]);
    else setSelected(filteredMovements.map((m) => m.id));
  }

  function openNewMovement(type?: CashMovementType) {
    setMovementForm({
      ...emptyNewCashMovementForm(),
      type: type || "entrada",
    });
    setDrawerOpen(true);
  }

  function handleSaveMovement() {
    if (!data || !movementForm.description.trim()) {
      notify("Informe a descrição da movimentação");
      return;
    }
    const amount =
      Math.max(
        0,
        (Number(movementForm.amount.replace(",", ".")) || 0) -
          (Number(movementForm.discount.replace(",", ".")) || 0) +
          (Number(movementForm.interest.replace(",", ".")) || 0) +
          (Number(movementForm.fine.replace(",", ".")) || 0)
      );
    const lastBalance = data.movements[0]?.balance ?? data.summary.saldoAtual;
    const income = movementForm.type === "saida" ? null : amount;
    const expense = movementForm.type === "entrada" ? null : amount;
    const balance = lastBalance + (income || 0) - (expense || 0);

    const row: CashMovementRow = {
      id: `m-${Date.now()}`,
      date: movementForm.movementDate,
      description: movementForm.description.trim(),
      type: movementForm.type,
      category: movementForm.category,
      bankAccount: movementForm.bankAccount,
      paymentMethod: movementForm.paymentMethod,
      costCenter: movementForm.costCenter,
      patient: movementForm.patient,
      vendor: movementForm.vendor,
      professional: movementForm.professional,
      document: movementForm.document || `MOV-${Date.now().toString().slice(-6)}`,
      income: movementForm.type === "saida" ? null : amount,
      expense: movementForm.type === "entrada" ? null : amount,
      balance,
      status: movementForm.status,
      notes: movementForm.notes,
      attachments: 0,
    };

    setData((prev) => {
      if (!prev) return prev;
      const movements = [row, ...prev.movements];
      const entradas = movements
        .filter((m) => m.status !== "cancelado")
        .reduce((s, m) => s + (m.income || 0), 0);
      const saidas = movements
        .filter((m) => m.status !== "cancelado")
        .reduce((s, m) => s + (m.expense || 0), 0);
      return {
        ...prev,
        movements,
        summary: {
          ...prev.summary,
          entradas,
          saidas,
          saldoPeriodo: entradas - saidas,
          saldoAtual: prev.summary.saldoInicial + entradas - saidas,
        },
      };
    });

    // Persiste no caixa real (base do fechamento / comissões)
    if (movementForm.type === "entrada" || movementForm.type === "saida") {
      void fetch("/api/financeiro/caixa/movimentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: movementForm.type,
          description: row.description,
          amount,
          date: movementForm.movementDate,
        }),
      }).catch(() => undefined);
    }
    setDrawerOpen(false);
    notify(
      movementForm.type === "entrada"
        ? "Entrada lançada"
        : movementForm.type === "saida"
          ? "Saída lançada"
          : "Movimentação lançada"
    );
  }

  function handleTransfer() {
    if (!data) return;
    const amount = Number(transferForm.amount.replace(",", ".")) || 0;
    if (!amount || transferForm.fromAccount === transferForm.toAccount) {
      notify("Informe valor e contas diferentes");
      return;
    }
    const doc = `TRF-${Date.now().toString().slice(-5)}`;
    const out: CashMovementRow = {
      id: `trf-out-${Date.now()}`,
      date: transferForm.date,
      description: `Transferência para ${transferForm.toAccount}`,
      type: "transferencia",
      category: "Transferência",
      bankAccount: transferForm.fromAccount,
      paymentMethod: "Transferência",
      costCenter: "Administrativo",
      patient: "",
      vendor: "",
      professional: "",
      document: doc,
      income: null,
      expense: amount,
      balance: (data.movements[0]?.balance ?? data.summary.saldoAtual) - amount,
      status: "confirmado",
      notes: transferForm.notes,
      attachments: 0,
    };
    const inn: CashMovementRow = {
      ...out,
      id: `trf-in-${Date.now()}`,
      description: `Transferência de ${transferForm.fromAccount}`,
      bankAccount: transferForm.toAccount,
      income: amount,
      expense: null,
      balance: out.balance + amount,
    };

    setData((prev) => {
      if (!prev) return prev;
      const bankAccounts = prev.bankAccounts.map((b) => {
        if (b.account === transferForm.fromAccount) {
          return { ...b, balance: b.balance - amount, updatedAt: transferForm.date };
        }
        if (b.account === transferForm.toAccount) {
          return { ...b, balance: b.balance + amount, updatedAt: transferForm.date };
        }
        return b;
      });
      return {
        ...prev,
        bankAccounts,
        movements: [inn, out, ...prev.movements],
      };
    });
    setTransferOpen(false);
    setTransferForm(emptyTransferForm());
    notify("Transferência confirmada");
  }

  function handleMoreAction(label: string) {
    if (label === "Nova Entrada") return openNewMovement("entrada");
    if (label === "Nova Saída") return openNewMovement("saida");
    if (label === "Nova Transferência") return setTransferOpen(true);
    if (label === "Conciliação Bancária") return setReconcileOpen(true);
    if (label === "Fechar Caixa Diário") return void closeCash("diario");
    if (label === "Fechar Caixa Mensal") return void closeCash("mensal");
    notify(label);
  }

  if (loading || !data) return <FinanceSkeleton />;

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-900/20">
            <Banknote className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Fluxo de Caixa
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Acompanhe todas as entradas, saídas e movimentações financeiras da clínica em
              tempo real.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" className="rounded-xl" onClick={() => openNewMovement()}>
            <Plus className="h-4 w-4" />
            Nova Movimentação
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            onClick={() => void closeCash("diario")}
          >
            Fechar Caixa Diário
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl border border-violet-200 text-violet-700 hover:bg-violet-50"
            onClick={() => void closeCash("mensal")}
          >
            Fechar Caixa Mensal
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl border border-brand-200 text-brand-700 hover:bg-brand-50"
            onClick={() => setTransferOpen(true)}
          >
            <ArrowLeftRight className="h-4 w-4" />
            Transferência entre Contas
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
            <FluxoCaixaMoreActions
              open={moreOpen}
              onClose={() => setMoreOpen(false)}
              onAction={handleMoreAction}
            />
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <SoftCard bodyClassName="!p-0">
        <div className="space-y-3 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por descrição, paciente, fornecedor, categoria, documento, conta ou centro de custo..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
            <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
              Período: {period === "mes" ? "Este mês" : PERIODS.find((p) => p.id === period)?.label}
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
            {(
              [
                ["type", "Tipo", ["Todos", ...data.filterOptions.types]],
                ["category", "Categoria", ["Todas", ...data.filterOptions.categories]],
                ["bankAccount", "Conta", ["Todas", ...data.filterOptions.bankAccounts]],
                ["costCenter", "Centro", ["Todos", ...data.filterOptions.costCenters]],
                ["paymentMethod", "Pagamento", ["Todas", ...data.filterOptions.paymentMethods]],
                ["professional", "Profissional", ["Todos", ...data.filterOptions.professionals]],
                ["convenio", "Convênio", ["Todos", ...data.filterOptions.convenios]],
                ["status", "Status", ["Todos", ...data.filterOptions.statuses]],
              ] as const
            ).map(([key, label, options]) => (
              <select
                key={key}
                value={filters[key]}
                onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
              >
                {options.map((opt, idx) => (
                  <option key={opt} value={opt}>
                    {idx === 0 ? `${label}: ${opt}` : opt}
                  </option>
                ))}
              </select>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs font-semibold text-brand-700 hover:underline"
              onClick={() =>
                setFilters({
                  type: "Todos",
                  category: "Todas",
                  bankAccount: "Todas",
                  costCenter: "Todos",
                  paymentMethod: "Todas",
                  professional: "Todos",
                  convenio: "Todos",
                  status: "Todos",
                })
              }
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </SoftCard>

      {message ? (
        <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-2.5 text-sm text-brand-800">
          {message}
        </div>
      ) : null}

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
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
              <div className="mt-2 flex items-end justify-between gap-2">
                <div>
                  {typeof kpi.delta === "number" ? (
                    <p className={cn("text-xs font-semibold", tone.badge)}>
                      {kpi.delta > 0 ? "+" : ""}
                      {kpi.delta}% {kpi.hint}
                    </p>
                  ) : kpi.hint ? (
                    <p className="text-xs text-slate-500">{kpi.hint}</p>
                  ) : null}
                </div>
                {kpi.sparkline?.length ? (
                  <Sparkline values={kpi.sparkline} color={tone.spark} fill={tone.fill} />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main dashboard */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(280px,1fr)]">
        <div className="space-y-4">
          <SoftCard
            title="Fluxo de Caixa Diário"
            description="Entradas, saídas e saldo acumulado"
            action={
              <div className="flex flex-wrap gap-1">
                {CHART_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setChartMode(mode.id)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-[11px] font-medium",
                      chartMode === mode.id
                        ? "bg-brand-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            }
          >
            <CombinedCashflowChart data={chartSeries} />
          </SoftCard>

          <SoftCard
            title="Movimentações Financeiras"
            description={`${filteredMovements.length} lançamento(s)${
              selected.length ? ` · ${selected.length} selecionado(s)` : ""
            }`}
            bodyClassName="!p-0"
          >
            <div className="max-h-[560px] overflow-auto">
              <table className="min-w-[1400px] w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={
                          filteredMovements.length > 0 &&
                          selected.length === filteredMovements.length
                        }
                        onChange={toggleSelectAll}
                      />
                    </th>
                    {(
                      [
                        ["date", "Data"],
                        ["description", "Descrição"],
                        ["type", "Tipo"],
                        ["category", "Categoria"],
                        ["bank", "Conta Bancária"],
                        ["pay", "Forma Pagamento"],
                        ["cc", "Centro de Custo"],
                        ["patient", "Paciente"],
                        ["vendor", "Fornecedor"],
                        ["pro", "Profissional"],
                        ["doc", "Documento"],
                        ["income", "Entrada"],
                        ["expense", "Saída"],
                        ["balance", "Saldo"],
                        ["status", "Status"],
                        ["notes", "Observações"],
                        ["att", "Anexos"],
                        ["actions", "Ações"],
                      ] as const
                    ).map(([key, label]) => {
                      const sortable = [
                        "date",
                        "description",
                        "type",
                        "category",
                        "income",
                        "expense",
                        "balance",
                        "status",
                      ].includes(key);
                      return (
                        <th key={key} className="whitespace-nowrap px-3 py-3 font-semibold">
                          {sortable ? (
                            <button
                              type="button"
                              className="hover:text-brand-700"
                              onClick={() => toggleSort(key as SortKey)}
                            >
                              {label}
                              {sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                            </button>
                          ) : (
                            label
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-slate-50 hover:bg-slate-50/70"
                    >
                      <td className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={selected.includes(m.id)}
                          onChange={() => toggleSelect(m.id)}
                        />
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">
                        {m.date.split("-").reverse().join("/")}
                      </td>
                      <td className="max-w-[220px] truncate px-3 py-2.5 font-medium text-slate-800">
                        {m.description}
                      </td>
                      <td className="px-3 py-2.5">
                        <CashTypePill type={m.type} />
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">{m.category}</td>
                      <td className="px-3 py-2.5 text-slate-600">{m.bankAccount}</td>
                      <td className="px-3 py-2.5 text-slate-600">{m.paymentMethod}</td>
                      <td className="px-3 py-2.5 text-slate-600">{m.costCenter}</td>
                      <td className="px-3 py-2.5 text-slate-600">{m.patient || "—"}</td>
                      <td className="px-3 py-2.5 text-slate-600">{m.vendor || "—"}</td>
                      <td className="px-3 py-2.5 text-slate-600">{m.professional || "—"}</td>
                      <td className="px-3 py-2.5 text-slate-600">{m.document}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 font-medium text-emerald-700">
                        {m.income != null ? money(m.income) : "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 font-medium text-rose-600">
                        {m.expense != null ? money(m.expense) : "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-slate-900">
                        {money(m.balance)}
                      </td>
                      <td className="px-3 py-2.5">
                        <CashStatusPill status={m.status} />
                      </td>
                      <td className="max-w-[160px] truncate px-3 py-2.5 text-slate-500">
                        {m.notes || "—"}
                      </td>
                      <td className="px-3 py-2.5 text-slate-500">
                        {m.attachments ? (
                          <span className="inline-flex items-center gap-1">
                            <Paperclip className="h-3.5 w-3.5" />
                            {m.attachments}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <IconBtn title="Visualizar" onClick={() => notify(`Visualizar ${m.document}`)}>
                            <Eye className="h-3.5 w-3.5" />
                          </IconBtn>
                          <IconBtn title="Editar" onClick={() => notify(`Editar ${m.document}`)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </IconBtn>
                          <IconBtn title="Duplicar" onClick={() => notify(`Duplicar ${m.document}`)}>
                            <Copy className="h-3.5 w-3.5" />
                          </IconBtn>
                          <IconBtn title="Cancelar" onClick={() => notify(`Cancelar ${m.document}`)}>
                            <XCircle className="h-3.5 w-3.5" />
                          </IconBtn>
                          <IconBtn title="Excluir" onClick={() => notify(`Excluir ${m.document}`)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </IconBtn>
                          <IconBtn title="Imprimir" onClick={() => notify(`Imprimir ${m.document}`)}>
                            <Printer className="h-3.5 w-3.5" />
                          </IconBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredMovements.length === 0 ? (
                    <tr>
                      <td colSpan={18} className="px-4 py-16 text-center text-sm text-slate-500">
                        Nenhuma movimentação encontrada com os filtros atuais.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </SoftCard>
        </div>

        {/* Right column */}
        <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <SoftCard title="Resumo do Período">
            <dl className="space-y-3 text-sm">
              {(
                [
                  ["Saldo Inicial", data.summary.saldoInicial, "text-slate-900"],
                  ["Entradas", data.summary.entradas, "text-emerald-700"],
                  ["Saídas", data.summary.saidas, "text-rose-600"],
                  ["Saldo do Período", data.summary.saldoPeriodo, "text-brand-700"],
                  ["Saldo Atual", data.summary.saldoAtual, "text-slate-900 font-semibold"],
                ] as const
              ).map(([label, value, color]) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className={cn("font-semibold", color)}>{money(value)}</dd>
                </div>
              ))}
            </dl>
          </SoftCard>

          <SoftCard title="Entradas x Saídas" description="Percentual do período">
            <PaymentDonut items={data.mix} />
          </SoftCard>

          <SoftCard title="Saldo por Conta Bancária" bodyClassName="!p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Banco</th>
                    <th className="px-4 py-3">Conta</th>
                    <th className="px-4 py-3">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bankAccounts.map((b) => (
                    <tr key={b.id} className="border-b border-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{b.bank}</td>
                      <td className="px-4 py-3 text-slate-600">
                        <div>{b.account}</div>
                        <div className="text-[11px] text-slate-400">
                          Atualizado {b.updatedAt.split("-").reverse().join("/")}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {money(b.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SoftCard>

          <SoftCard title="Fluxo Projetado" description="30 dias" bodyClassName="!p-3">
            <ProjectedFlowChart data={data.projection} />
          </SoftCard>

          <SoftCard
            title="Alertas Financeiros"
            description={`${data.alerts.length} itens`}
            bodyClassName="!p-2"
          >
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
              {data.alerts.map((alert) => (
                <li
                  key={alert.id}
                  className={cn(
                    "flex items-start gap-2 border-l-2 px-2.5 py-1.5",
                    ALERT_TONE[alert.priority]
                  )}
                  title={alert.detail}
                >
                  <span
                    className={cn(
                      "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                      ALERT_DOT[alert.priority]
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold leading-tight text-slate-900">
                      {alert.title}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-[11px] leading-snug text-slate-600">
                      {alert.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </SoftCard>
        </aside>
      </div>

      <NewMovementDrawer
        open={drawerOpen}
        form={movementForm}
        setForm={setMovementForm}
        categories={data.filterOptions.categories}
        bankAccounts={data.filterOptions.bankAccounts}
        costCenters={data.filterOptions.costCenters}
        paymentMethods={data.filterOptions.paymentMethods}
        professionals={data.filterOptions.professionals}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSaveMovement}
      />

      <TransferModal
        open={transferOpen}
        form={transferForm}
        setForm={setTransferForm}
        bankAccounts={data.filterOptions.bankAccounts}
        onClose={() => setTransferOpen(false)}
        onConfirm={handleTransfer}
      />

      <ReconciliationModal
        open={reconcileOpen}
        systemItems={data.reconciliationSystem}
        statementItems={data.reconciliationStatement}
        onClose={() => setReconcileOpen(false)}
        onReconcile={() => {
          setReconcileOpen(false);
          notify("Conciliação aplicada");
        }}
      />
    </div>
  );
}
