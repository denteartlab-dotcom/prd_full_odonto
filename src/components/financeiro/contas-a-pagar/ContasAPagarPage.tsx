"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  Plus,
  Download,
  Upload,
  ChevronDown,
  Search,
  Eye,
  Pencil,
  Copy,
  Trash2,
  Banknote,
  Ban,
  Paperclip,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui";
import {
  emptyContasAPagarData,
  type ContasAPagarData,
  type NewPayableForm,
  type PayableAccount,
  type PayablePeriod,
  type PayableStatus,
  type PaymentForm,
} from "@/lib/contas-a-pagar-types";
import { cn, money } from "@/lib/utils";
import {
  SoftCard,
  FinanceSkeleton,
} from "@/components/financeiro/geral/financeiro-ui";
import {
  NewPayableDrawer,
  PaymentModal,
  PayableMoreActions,
} from "./ContasAPagarDrawers";

const PERIODS: { id: PayablePeriod; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "semana", label: "Esta Semana" },
  { id: "mes", label: "Este Mês" },
  { id: "ano", label: "Este Ano" },
  { id: "personalizado", label: "Personalizado" },
];

const STATUS_MAP: Record<string, PayableStatus | ""> = {
  Todos: "",
  Pago: "pago",
  "Em aberto": "em_aberto",
  Parcial: "parcial",
  Vencido: "vencido",
  Cancelado: "cancelado",
  Agendado: "agendado",
};

const emptyForm = (): NewPayableForm => {
  const today = new Date().toISOString().slice(0, 10);
  return {
    supplier: "",
    description: "",
    category: "Laboratório",
    costCenter: "Clínica",
    invoiceNumber: "",
    document: "",
    bank: "Caixa",
    bankAccount: "Caixa",
    paymentMethod: "Boleto",
    amount: "",
    discount: "0",
    interest: "0",
    fine: "0",
    competence: today.slice(0, 7),
    issueDate: today,
    dueDate: today,
    expectedPayDate: today,
    status: "em_aberto",
    responsible: "Financeiro",
    notes: "",
    installment: false,
    installmentCount: "3",
    installmentPeriod: "mensal",
    recurring: false,
    recurringPeriod: "mensal",
    recurringEnd: "",
  };
};

export function ContasAPagarPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ContasAPagarData>(emptyContasAPagarData());
  const [period, setPeriod] = useState<PayablePeriod>("mes");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<PayableAccount | null>(null);
  const [form, setForm] = useState<NewPayableForm>(emptyForm);
  const [payForm, setPayForm] = useState<PaymentForm>(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      payDate: today,
      amount: "",
      discount: "0",
      interest: "0",
      fine: "0",
      paymentMethod: "PIX",
      bankAccount: "Caixa",
      notes: "",
    };
  });
  const [filters, setFilters] = useState({
    supplier: "Todos",
    category: "Todas",
    costCenter: "Todos",
    bankAccount: "Todas",
    paymentMethod: "Todas",
    status: "Todos",
    responsible: "Todos",
  });
  const [sortKey, setSortKey] = useState<keyof PayableAccount>("dueDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        await refresh();
      } catch {
        if (!cancelled) setData(emptyContasAPagarData());
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function refresh() {
    const res = await fetch("/api/financeiro/despesas", { cache: "no-store" });
    if (!res.ok) throw new Error("Falha ao carregar contas a pagar.");
    const json = (await res.json()) as { data: ContasAPagarData };
    setData(json.data);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = data.accounts.filter((a) => {
      if (q) {
        const hay = [
          a.supplier,
          a.description,
          a.document,
          a.invoiceNumber,
          a.category,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.supplier !== "Todos" && a.supplier !== filters.supplier) return false;
      if (filters.category !== "Todas" && a.category !== filters.category) return false;
      if (filters.costCenter !== "Todos" && a.costCenter !== filters.costCenter) return false;
      if (filters.bankAccount !== "Todas" && a.bankAccount !== filters.bankAccount)
        return false;
      if (filters.paymentMethod !== "Todas" && a.paymentMethod !== filters.paymentMethod)
        return false;
      if (filters.responsible !== "Todos" && a.responsible !== filters.responsible)
        return false;
      const st = STATUS_MAP[filters.status];
      if (st && a.status !== st) return false;
      return true;
    });

    rows = [...rows].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return rows;
  }, [data.accounts, filters, query, sortDir, sortKey]);

  const dayAccounts = useMemo(
    () => data.accounts.filter((a) => a.dueDate === selectedDay),
    [data.accounts, selectedDay]
  );

  function notify(label: string) {
    setMessage(`${label} — preparado para integração com API.`);
  }

  function toggleSort(key: keyof PayableAccount) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map((a) => a.id));
  }

  function clearFilters() {
    setFilters({
      supplier: "Todos",
      category: "Todas",
      costCenter: "Todos",
      bankAccount: "Todas",
      paymentMethod: "Todas",
      status: "Todos",
      responsible: "Todos",
    });
    setQuery("");
    setPeriod("mes");
  }

  async function saveAccount() {
    const amount = Number(form.amount.replace(",", ".")) || 0;
    const discount = Number(form.discount.replace(",", ".")) || 0;
    const interest = Number(form.interest.replace(",", ".")) || 0;
    const fine = Number(form.fine.replace(",", ".")) || 0;
    const finalAmount = Math.max(0, amount - discount + interest + fine);
    if (!finalAmount) {
      setMessage("Informe um valor válido.");
      return;
    }
    const count =
      form.installment && Number(form.installmentCount) > 1
        ? Number(form.installmentCount)
        : 1;
    const parcelValue = finalAmount / count;

    for (let i = 0; i < count; i++) {
      const due = new Date(form.dueDate || new Date().toISOString().slice(0, 10));
      if (form.installmentPeriod === "mensal") due.setMonth(due.getMonth() + i);
      if (form.installmentPeriod === "quinzenal") due.setDate(due.getDate() + i * 15);
      if (form.installmentPeriod === "semanal") due.setDate(due.getDate() + i * 7);
      const iso = due.toISOString().slice(0, 10);
      const description =
        count > 1
          ? `${form.description || "Nova despesa"} (${i + 1}/${count})`
          : form.description || "Nova despesa";

      const res = await fetch("/api/payables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier: form.supplier || "Novo fornecedor",
          description,
          amount: parcelValue,
          dueDate: iso,
          status: form.status === "em_aberto" ? "aberto" : form.status,
          category: form.category,
          costCenter: form.costCenter,
          bankAccount: form.bankAccount,
          paymentMethod: form.paymentMethod,
          document: form.document,
          invoiceNumber: form.invoiceNumber,
          responsible: form.responsible,
          notes: form.notes,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setMessage(body.error || "Não foi possível cadastrar a conta.");
        return;
      }
    }

    await refresh();
    setDrawerOpen(false);
    setForm(emptyForm());
    setMessage(
      count > 1
        ? `${count} parcelas geradas e sincronizadas.`
        : "Conta cadastrada e sincronizada."
    );
  }

  async function confirmPayment() {
    if (!payTarget) return;
    const res = await fetch(`/api/payables/${payTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        markPaid: true,
        paymentMethod: payForm.paymentMethod,
        bankAccount: payForm.bankAccount,
        notes: payForm.notes,
      }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setMessage(body.error || "Não foi possível confirmar o pagamento.");
      return;
    }
    await refresh();
    setPayOpen(false);
    setPayTarget(null);
    setMessage("Pagamento confirmado e sincronizado com o financeiro.");
  }

  function openPay(account: PayableAccount) {
    setPayTarget(account);
    setPayForm((f) => ({
      ...f,
      amount: String(account.balance),
      paymentMethod: account.paymentMethod,
      bankAccount: account.bankAccount,
    }));
    setPayOpen(true);
  }

  async function batchPay() {
    if (!selectedIds.length) {
      setMessage("Selecione ao menos uma conta para pagamento em lote.");
      return;
    }
    await Promise.all(
      selectedIds.map((id) =>
        fetch(`/api/payables/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markPaid: true }),
        })
      )
    );
    await refresh();
    setSelectedIds([]);
    setMessage(`${selectedIds.length} contas pagas e sincronizadas.`);
  }

  if (loading) return <FinanceSkeleton />;

  return (
    <div className="space-y-4 pb-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-900/20">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Contas a Pagar
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Gerencie fornecedores, despesas, vencimentos e pagamentos da clínica.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" className="rounded-xl" onClick={() => setDrawerOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova Conta
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl border border-brand-200 text-brand-700 hover:bg-brand-50"
            onClick={() => {
              if (filtered[0]) openPay(filtered[0]);
              else notify("Novo Pagamento");
            }}
          >
            <Banknote className="h-4 w-4" />
            Novo Pagamento
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl"
            onClick={() => notify("Importar Boletos")}
          >
            <Upload className="h-4 w-4" />
            Importar Boletos
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
            <PayableMoreActions
              open={moreOpen}
              onClose={() => setMoreOpen(false)}
              onAction={notify}
            />
          </div>
        </div>
      </div>

      <SoftCard bodyClassName="!p-0">
        <div className="space-y-3 p-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar fornecedor, descrição, documento, boleto, categoria, NF..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
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
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {p.label}
              </button>
            ))}
            <span className="ml-auto rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
              01/07/2026 — 31/07/2026
            </span>
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
            {(
              [
                ["supplier", "Fornecedor", data.filterOptions.suppliers],
                ["category", "Categoria", data.filterOptions.categories],
                ["costCenter", "Centro de Custo", data.filterOptions.costCenters],
                ["bankAccount", "Conta Bancária", data.filterOptions.bankAccounts],
                ["paymentMethod", "Forma de Pagamento", data.filterOptions.paymentMethods],
                ["status", "Status", data.filterOptions.statuses],
                ["responsible", "Responsável", data.filterOptions.responsibles],
              ] as const
            ).map(([key, label, options]) => (
              <select
                key={key}
                value={filters[key]}
                onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500"
                title={label}
              >
                {options.map((o) => (
                  <option key={o} value={o}>
                    {o === options[0] ? `${label}: ${o}` : o}
                  </option>
                ))}
              </select>
            ))}
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </SoftCard>

      {message ? (
        <p className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-2.5 text-sm text-brand-800">
          {message}
        </p>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {data.kpis.map((kpi) => (
          <div
            key={kpi.id}
            className={cn(
              "rounded-2xl border bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]",
              kpi.tone === "red" ? "border-rose-200" : "border-slate-200/80"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {kpi.label}
              </p>
              {kpi.tone === "red" ? (
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                  Atenção
                </span>
              ) : null}
            </div>
            <p className="mt-1.5 text-lg font-semibold text-slate-900">{kpi.value}</p>
            {kpi.hint ? <p className="mt-0.5 text-[11px] text-slate-500">{kpi.hint}</p> : null}
            {kpi.progress != null ? (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn(
                    "h-full rounded-full",
                    kpi.tone === "green" ? "bg-emerald-500" : "bg-brand-500"
                  )}
                  style={{ width: `${kpi.progress}%` }}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {/* Linha 1: calendário + contas do dia + próximos */}
        <div className="grid gap-4 xl:grid-cols-12">
          <div className="xl:col-span-5">
            <SoftCard
              title="Calendário Financeiro"
              description={data.calendarMonthLabel}
              bodyClassName="!p-3"
            >
              <div className="mb-1.5 grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold uppercase text-slate-400">
                {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                  <span key={`${d}-${i}`}>{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {data.calendar.map((cell, idx) => {
                  if (cell.tone === "vazio") {
                    return <div key={`e-${idx}`} className="h-11 rounded-lg bg-transparent" />;
                  }
                  const active = selectedDay === cell.date;
                  return (
                    <button
                      key={cell.date}
                      type="button"
                      onClick={() => setSelectedDay(cell.date)}
                      className={cn(
                        "flex h-11 flex-col rounded-lg border px-1 py-0.5 text-left transition",
                        active && "ring-2 ring-brand-500",
                        cell.tone === "atraso" && "border-rose-200 bg-rose-50",
                        cell.tone === "hoje" && "border-amber-200 bg-amber-50",
                        cell.tone === "proximo" && "border-orange-200 bg-orange-50",
                        cell.tone === "pago" && "border-emerald-200 bg-emerald-50",
                        cell.tone === "neutro" && "border-slate-100 bg-white hover:bg-slate-50"
                      )}
                    >
                      <span className="text-[10px] font-semibold text-slate-700">{cell.day}</span>
                      {cell.total > 0 ? (
                        <span className="mt-auto truncate text-[9px] font-medium text-slate-600">
                          {money(cell.total)}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-500">
                <Legend color="bg-emerald-400" label="Pago" />
                <Legend color="bg-amber-400" label="Hoje" />
                <Legend color="bg-orange-400" label="Próximo" />
                <Legend color="bg-rose-400" label="Atraso" />
              </div>
            </SoftCard>
          </div>

          <div className="xl:col-span-3">
            <SoftCard
              title="Contas do dia"
              description={new Date(selectedDay + "T12:00:00").toLocaleDateString("pt-BR")}
              bodyClassName="!p-3"
            >
              {dayAccounts.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">Nenhuma conta neste dia.</p>
              ) : (
                <ul className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
                  {dayAccounts.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-start justify-between gap-2 rounded-xl border border-slate-100 px-2.5 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{a.supplier}</p>
                        <p className="truncate text-xs text-slate-500">{a.description}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-slate-900">{money(a.amount)}</p>
                        <PayableStatusPill status={a.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SoftCard>
          </div>

          <div className="xl:col-span-4">
            <SoftCard title="Próximos vencimentos" bodyClassName="!p-3">
              <ul className="max-h-[280px] space-y-1.5 overflow-y-auto pr-1">
                {data.upcoming.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 px-2.5 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-600">
                        {u.when}
                      </p>
                      <p className="truncate text-sm text-slate-700">{u.label}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-slate-900">{money(u.amount)}</p>
                  </li>
                ))}
              </ul>
            </SoftCard>
          </div>
        </div>

        {/* Linha 2: gráficos + resumo + alertas (sem coluna lateral alta) */}
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <SoftCard title="Despesas por Categoria" bodyClassName="!p-3">
            <CompactDonut items={data.categoryShare} />
          </SoftCard>
          <SoftCard title="Contas por Status" bodyClassName="!p-3">
            <CompactDonut items={data.statusShare} />
          </SoftCard>
          <SoftCard title="Fluxo de Saídas" bodyClassName="!p-3">
            <OutflowBars data={data.outflowMonthly} />
          </SoftCard>
          <SoftCard title="Resumo Financeiro" bodyClassName="!p-3">
            <dl className="grid grid-cols-2 gap-2 text-xs">
              <MiniStat label="Em aberto" value={money(data.summary.totalAberto)} />
              <MiniStat label="Pago" value={money(data.summary.totalPago)} />
              <MiniStat label="Em atraso" value={money(data.summary.emAtraso)} />
              <MiniStat label="Previsão" value={money(data.summary.previsao)} />
            </dl>
            <div className="mt-3 space-y-1 border-t border-slate-100 pt-2 text-xs">
              <p className="text-slate-500">
                Maior fornecedor:{" "}
                <span className="font-semibold text-slate-800">{data.summary.maiorFornecedor}</span>
              </p>
              <p className="text-slate-500">
                Categoria líder:{" "}
                <span className="font-semibold text-slate-800">{data.summary.categoriaTop}</span>
              </p>
            </div>
          </SoftCard>
        </div>

        <SoftCard title="Alertas Financeiros" bodyClassName="!p-3">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
            {data.alerts.map((a) => (
              <div
                key={a.id}
                className={cn(
                  "rounded-xl border px-3 py-2.5",
                  a.priority === "alta" && "border-rose-200 bg-rose-50",
                  a.priority === "media" && "border-amber-200 bg-amber-50",
                  a.priority === "baixa" && "border-slate-200 bg-slate-50"
                )}
              >
                <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{a.detail}</p>
                <button
                  type="button"
                  className="mt-1 text-xs font-semibold text-brand-700 hover:underline"
                  onClick={() => notify(`Verificar: ${a.title}`)}
                >
                  Verificar
                </button>
              </div>
            ))}
          </div>
        </SoftCard>

        {/* Tabela com rolagem interna */}
        <SoftCard
          title="Contas a Pagar"
          description="Lista principal de despesas"
          bodyClassName="!p-0"
          action={
            <Button type="button" variant="secondary" className="rounded-xl" onClick={batchPay}>
              <CheckSquare className="h-4 w-4" />
              Pagamento em lote ({selectedIds.length})
            </Button>
          }
        >
          <div className="max-h-[420px] overflow-auto">
            <table className="min-w-[1200px] w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="px-2 py-3">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selectedIds.length === filtered.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  {(
                    [
                      ["dueDate", "Vencimento"],
                      ["supplier", "Fornecedor"],
                      ["description", "Descrição"],
                      ["category", "Categoria"],
                      ["costCenter", "Centro"],
                      ["bankAccount", "Conta"],
                      ["paymentMethod", "Pagamento"],
                      ["document", "Documento"],
                      ["amount", "Valor"],
                      ["paidAmount", "Pago"],
                      ["balance", "Saldo"],
                      ["status", "Status"],
                      ["responsible", "Responsável"],
                    ] as const
                  ).map(([key, label]) => (
                    <th key={key} className="px-2 py-3">
                      <button type="button" onClick={() => toggleSort(key)}>
                        {label}
                      </button>
                    </th>
                  ))}
                  <th className="px-2 py-3">Anexos</th>
                  <th className="px-2 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50/70">
                    <td className="px-2 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(a.id)}
                        onChange={() => toggleSelect(a.id)}
                      />
                    </td>
                    <td className="px-2 py-2 text-slate-700">{a.dueLabel}</td>
                    <td className="px-2 py-2 font-medium text-slate-900">{a.supplier}</td>
                    <td className="max-w-[160px] truncate px-2 py-2 text-slate-600">{a.description}</td>
                    <td className="px-2 py-2">
                      <CategoryBadge label={a.category} />
                    </td>
                    <td className="px-2 py-2 text-slate-600">{a.costCenter}</td>
                    <td className="px-2 py-2 text-slate-600">{a.bankAccount}</td>
                    <td className="px-2 py-2 text-slate-600">{a.paymentMethod}</td>
                    <td className="px-2 py-2 text-slate-600">{a.document}</td>
                    <td className="px-2 py-2 font-semibold text-slate-900">{money(a.amount)}</td>
                    <td className="px-2 py-2 text-emerald-700">{money(a.paidAmount)}</td>
                    <td className="px-2 py-2 text-rose-600">{money(a.balance)}</td>
                    <td className="px-2 py-2">
                      <PayableStatusPill status={a.status} />
                    </td>
                    <td className="px-2 py-2 text-slate-600">{a.responsible}</td>
                    <td className="px-2 py-2">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Paperclip className="h-3.5 w-3.5" />
                        {a.attachments}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1">
                        <IconBtn title="Visualizar" onClick={() => notify("Visualizar")}>
                          <Eye className="h-3.5 w-3.5" />
                        </IconBtn>
                        <IconBtn title="Editar" onClick={() => notify("Editar")}>
                          <Pencil className="h-3.5 w-3.5" />
                        </IconBtn>
                        <IconBtn title="Registrar Pagamento" onClick={() => openPay(a)}>
                          <Banknote className="h-3.5 w-3.5" />
                        </IconBtn>
                        <IconBtn title="Duplicar" onClick={() => notify("Duplicar")}>
                          <Copy className="h-3.5 w-3.5" />
                        </IconBtn>
                        <IconBtn
                          title="Cancelar"
                          onClick={() => {
                            setData((d) => ({
                              ...d,
                              accounts: d.accounts.map((x) =>
                                x.id === a.id ? { ...x, status: "cancelado" } : x
                              ),
                            }));
                          }}
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </IconBtn>
                        <IconBtn
                          title="Excluir"
                          onClick={() => {
                            setData((d) => ({
                              ...d,
                              accounts: d.accounts.filter((x) => x.id !== a.id),
                            }));
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SoftCard>
      </div>

      <NewPayableDrawer
        open={drawerOpen}
        form={form}
        setForm={setForm}
        onClose={() => setDrawerOpen(false)}
        onSave={saveAccount}
      />
      <PaymentModal
        open={payOpen}
        form={payForm}
        setForm={setPayForm}
        onClose={() => setPayOpen(false)}
        onConfirm={confirmPayment}
        title={payTarget ? `${payTarget.supplier} — ${payTarget.description}` : ""}
      />
    </div>
  );
}

function PayableStatusPill({ status }: { status: PayableStatus }) {
  const map: Record<PayableStatus, string> = {
    pago: "bg-emerald-50 text-emerald-700",
    em_aberto: "bg-amber-50 text-amber-700",
    parcial: "bg-sky-50 text-sky-700",
    vencido: "bg-rose-50 text-rose-700",
    cancelado: "bg-slate-100 text-slate-600",
    agendado: "bg-indigo-50 text-indigo-700",
  };
  const labels: Record<PayableStatus, string> = {
    pago: "Pago",
    em_aberto: "Em aberto",
    parcial: "Parcial",
    vencido: "Vencido",
    cancelado: "Cancelado",
    agendado: "Agendado",
  };
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold", map[status])}>
      {labels[status]}
    </span>
  );
}

function CategoryBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700">
      {label}
    </span>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-2.5 w-2.5 rounded-full", color)} />
      {label}
    </span>
  );
}

function CompactDonut({
  items,
}: {
  items: { name: string; percent: number; color: string }[];
}) {
  const size = 112;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let acc = 0;

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-28 w-28 shrink-0">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={stroke}
          />
          {items.map((item) => {
            const length = (item.percent / 100) * circumference;
            const el = (
              <circle
                key={item.name}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={stroke}
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-acc}
                strokeLinecap="butt"
              />
            );
            acc += length;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-semibold text-slate-900">
            {items.reduce((s, i) => s + i.percent, 0)}%
          </span>
        </div>
      </div>
      <ul className="max-h-28 w-full space-y-1 overflow-y-auto pr-1">
        {items.map((item) => (
          <li key={item.name} className="flex items-center justify-between gap-2 text-[11px]">
            <span className="flex min-w-0 items-center gap-1.5 text-slate-600">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: item.color }}
              />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="shrink-0 font-semibold text-slate-800">{item.percent}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function OutflowBars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-28 items-end gap-1.5">
      {data.map((d) => (
        <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <div className="flex h-20 w-full items-end justify-center">
            <div
              className="w-full max-w-[16px] rounded-t-md bg-gradient-to-t from-brand-700 to-brand-400"
              style={{ height: `${Math.max(8, (d.value / max) * 100)}%` }}
              title={`${d.label}: ${money(d.value)}`}
            />
          </div>
          <span className="text-[10px] font-medium text-slate-500">{d.label}</span>
        </div>
      ))}
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
