"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownCircle,
  Plus,
  Download,
  Link2,
  ChevronDown,
  Search,
  Eye,
  Pencil,
  Copy,
  Trash2,
  Banknote,
  Ban,
  Printer,
  MessageSquare,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui";
import { SoftCard, FinanceSkeleton } from "@/components/financeiro/geral/financeiro-ui";
import {
  emptyContasAReceberData,
  type ContasAReceberData,
  type NewReceiptForm,
  type ReceivableInstallment,
  type ReceivablePeriod,
  type ReceivableStatus,
  type RegisterReceiptForm,
} from "@/lib/contas-a-receber-types";
import { cn, money } from "@/lib/utils";
import {
  NewReceiptDrawer,
  ReceivableMoreActions,
  RegisterReceiptModal,
} from "./ContasAReceberDrawers";

const PERIODS: { id: ReceivablePeriod; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "semana", label: "Esta Semana" },
  { id: "mes", label: "Este Mês" },
  { id: "ano", label: "Este Ano" },
  { id: "personalizado", label: "Personalizado" },
];

const STATUS_MAP: Record<string, ReceivableStatus | ""> = {
  Todos: "",
  Pago: "pago",
  "Recebido Parcial": "parcial",
  "Em Aberto": "em_aberto",
  Vencido: "vencido",
  Cancelado: "cancelado",
  Negociado: "negociado",
};

const emptyForm = (): NewReceiptForm => {
  const today = new Date().toISOString().slice(0, 10);
  return {
    patient: "",
    budgetNumber: "",
    procedure: "",
    professional: "Dra. Ana",
    paymentMethod: "PIX",
    bankAccount: "Itaú - 1234",
    amount: "",
    discount: "0",
    interest: "0",
    fine: "0",
    receiptDate: today,
    competence: today.slice(0, 7),
    notes: "",
  };
};

export function ContasAReceberPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ContasAReceberData>(emptyContasAReceberData());
  const [period, setPeriod] = useState<ReceivablePeriod>("mes");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<ReceivableInstallment | null>(null);
  const [form, setForm] = useState<NewReceiptForm>(emptyForm);
  const [payForm, setPayForm] = useState<RegisterReceiptForm>(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      receiptDate: today,
      amount: "",
      paymentMethod: "PIX",
      bankAccount: "Caixa",
      discount: "0",
      interest: "0",
      fine: "0",
      notes: "",
    };
  });
  const [filters, setFilters] = useState({
    status: "Todos",
    paymentMethod: "Todas",
    professional: "Todos",
    convenio: "Todos",
    procedure: "Todos",
    category: "Todas",
    responsible: "Todos",
    bankAccount: "Todas",
  });
  const [sortKey, setSortKey] = useState<keyof ReceivableInstallment>("dueDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  async function refresh() {
    const res = await fetch("/api/financeiro/receitas", { cache: "no-store" });
    if (!res.ok) throw new Error("Falha ao carregar contas a receber.");
    const json = (await res.json()) as { data: ContasAReceberData };
    setData(json.data);
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        await refresh();
      } catch {
        if (!cancelled) setData(emptyContasAReceberData());
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = data.installments.filter((a) => {
      if (q) {
        const hay = [
          a.patient,
          a.cpf,
          a.budgetNumber,
          String(a.installment),
          a.procedure,
          a.convenio,
          a.phone,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.paymentMethod !== "Todas" && a.paymentMethod !== filters.paymentMethod)
        return false;
      if (filters.professional !== "Todos" && a.professional !== filters.professional)
        return false;
      if (filters.convenio !== "Todos" && a.convenio !== filters.convenio) return false;
      if (filters.procedure !== "Todos" && a.procedure !== filters.procedure) return false;
      if (filters.bankAccount !== "Todas" && a.bankAccount !== filters.bankAccount)
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
  }, [data.installments, filters, query, sortDir, sortKey]);

  const dayItems = useMemo(
    () => data.installments.filter((a) => a.dueDate === selectedDay),
    [data.installments, selectedDay]
  );

  const goalPct = Math.min(
    100,
    Math.round((data.goal.current / data.goal.target) * 10000) / 100
  );

  function notify(label: string) {
    setMessage(`${label} — preparado para integração com API.`);
  }

  function toggleSort(key: keyof ReceivableInstallment) {
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
      status: "Todos",
      paymentMethod: "Todas",
      professional: "Todos",
      convenio: "Todos",
      procedure: "Todos",
      category: "Todas",
      responsible: "Todos",
      bankAccount: "Todas",
    });
    setQuery("");
    setPeriod("mes");
  }

  async function saveReceipt() {
    const amount = Number(form.amount.replace(",", ".")) || 0;
    const discount = Number(form.discount.replace(",", ".")) || 0;
    const interest = Number(form.interest.replace(",", ".")) || 0;
    const fine = Number(form.fine.replace(",", ".")) || 0;
    const finalAmount = Math.max(0, amount - discount + interest + fine);
    if (!finalAmount) {
      setMessage("Informe um valor válido.");
      return;
    }

    let patientId: string | null = null;
    if (form.patient.trim()) {
      const patientsRes = await fetch("/api/pacientes", { cache: "no-store" });
      if (patientsRes.ok) {
        const patientsJson = (await patientsRes.json()) as {
          patients: { id: string; name: string }[];
        };
        const found = patientsJson.patients.find(
          (p) => p.name.toLowerCase() === form.patient.trim().toLowerCase()
        );
        patientId = found?.id || null;
      }
    }

    const res = await fetch("/api/receivables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId,
        description: form.procedure || form.notes || "Recebimento",
        amount: finalAmount,
        dueDate: form.receiptDate,
        method: form.paymentMethod,
        status: "aberto",
      }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setMessage(body.error || "Não foi possível lançar o recebimento.");
      return;
    }

    // marca como pago para refletir no caixa
    const created = (await res.json()) as { receivable: { id: string } };
    await fetch(`/api/receivables/${created.receivable.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markPaid: true, method: form.paymentMethod }),
    });

    await refresh();
    setDrawerOpen(false);
    setForm(emptyForm());
    setMessage("Recebimento lançado e sincronizado com o financeiro.");
  }

  function openPay(item: ReceivableInstallment) {
    setPayTarget(item);
    setPayForm((f) => ({
      ...f,
      amount: String(item.balance),
      paymentMethod: item.paymentMethod,
      bankAccount: item.bankAccount,
    }));
    setPayOpen(true);
  }

  async function confirmPay() {
    if (!payTarget) return;
    const res = await fetch(`/api/receivables/${payTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        markPaid: true,
        method: payForm.paymentMethod,
      }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setMessage(body.error || "Não foi possível confirmar o recebimento.");
      return;
    }
    await refresh();
    setPayOpen(false);
    setPayTarget(null);
    setMessage("Recebimento confirmado e sincronizado com o dashboard.");
  }

  async function batchReceive() {
    if (!selectedIds.length) {
      setMessage("Selecione ao menos uma parcela para recebimento em lote.");
      return;
    }
    await Promise.all(
      selectedIds.map((id) =>
        fetch(`/api/receivables/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markPaid: true }),
        })
      )
    );
    await refresh();
    setSelectedIds([]);
    setMessage(`${selectedIds.length} parcelas recebidas e sincronizadas.`);
  }

  if (loading) return <FinanceSkeleton />;

  return (
    <div className="space-y-4 pb-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-900/20">
            <ArrowDownCircle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Contas a Receber
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Gerencie todos os recebimentos, parcelas e orçamentos aprovados dos pacientes.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" className="rounded-xl" onClick={() => setDrawerOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Recebimento
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl border border-brand-200 text-brand-700 hover:bg-brand-50"
            onClick={() => notify("Gerar Cobrança")}
          >
            <Link2 className="h-4 w-4" />
            Gerar Cobrança
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
            <ReceivableMoreActions
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
              placeholder="Pesquisar paciente, CPF, orçamento, parcela, procedimento, convênio, telefone..."
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
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
            {(
              [
                ["status", "Status", data.filterOptions.statuses],
                ["paymentMethod", "Forma de Pagamento", data.filterOptions.paymentMethods],
                ["professional", "Profissional", data.filterOptions.professionals],
                ["convenio", "Convênio", data.filterOptions.convenios],
                ["procedure", "Procedimento", data.filterOptions.procedures],
                ["category", "Categoria", data.filterOptions.categories],
                ["responsible", "Responsável", data.filterOptions.responsibles],
                ["bankAccount", "Conta Bancária", data.filterOptions.bankAccounts],
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

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
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
            {kpi.delta != null ? (
              <p className="mt-0.5 text-[11px] font-medium text-emerald-600">
                +{kpi.delta}% vs mês anterior
              </p>
            ) : kpi.hint ? (
              <p className="mt-0.5 text-[11px] text-slate-500">{kpi.hint}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="space-y-4">
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
              title="Parcelas do dia"
              description={new Date(selectedDay + "T12:00:00").toLocaleDateString("pt-BR")}
              bodyClassName="!p-3"
            >
              {dayItems.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">Nenhuma parcela neste dia.</p>
              ) : (
                <ul className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
                  {dayItems.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-start justify-between gap-2 rounded-xl border border-slate-100 px-2.5 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{a.patient}</p>
                        <p className="truncate text-xs text-slate-500">
                          {a.procedure} · {a.installment}/{a.totalInstallments}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-slate-900">{money(a.amount)}</p>
                        <StatusPill status={a.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SoftCard>
          </div>

          <div className="xl:col-span-4">
            <SoftCard title="Próximos recebimentos" bodyClassName="!p-3">
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

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <SoftCard title="Receitas por Forma de Pagamento" bodyClassName="!p-3">
            <CompactDonut items={data.paymentShare} />
          </SoftCard>
          <SoftCard title="Recebimentos por Convênio" bodyClassName="!p-3">
            <div className="max-h-36 overflow-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="text-slate-500">
                    <th className="pb-1">Nome</th>
                    <th className="pb-1">Guias</th>
                    <th className="pb-1">Previsto</th>
                    <th className="pb-1">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.convenios.map((c) => (
                    <tr key={c.id} className="border-t border-slate-100">
                      <td className="py-1.5 font-medium text-slate-800">{c.name}</td>
                      <td className="py-1.5">{c.guides}</td>
                      <td className="py-1.5">{money(c.forecast)}</td>
                      <td className="py-1.5 font-semibold">{money(c.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SoftCard>
          <SoftCard title="Metas de Recebimento" bodyClassName="!p-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Meta mensal</span>
                <span className="font-semibold">{money(data.goal.target)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recebido</span>
                <span className="font-semibold">{money(data.goal.current)}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600"
                  style={{ width: `${goalPct}%` }}
                />
              </div>
              <p className="text-right text-xs font-semibold text-brand-700">{goalPct}%</p>
            </div>
          </SoftCard>
          <SoftCard title="Resumo Financeiro" bodyClassName="!p-3">
            <dl className="grid grid-cols-2 gap-2 text-xs">
              <MiniStat label="Em aberto" value={money(data.summary.totalAberto)} />
              <MiniStat label="Recebido" value={money(data.summary.totalRecebido)} />
              <MiniStat label="Previstos" value={money(data.summary.previstos)} />
              <MiniStat label="Vencidos" value={money(data.summary.vencidos)} />
            </dl>
            <div className="mt-3 space-y-1 border-t border-slate-100 pt-2 text-xs text-slate-500">
              <p>
                Maior pagador:{" "}
                <span className="font-semibold text-slate-800">{data.summary.maiorPagador}</span>
              </p>
              <p>
                Convênio top:{" "}
                <span className="font-semibold text-slate-800">{data.summary.convenioTop}</span>
              </p>
              <p>
                Procedimento top:{" "}
                <span className="font-semibold text-slate-800">{data.summary.procedimentoTop}</span>
              </p>
            </div>
          </SoftCard>
        </div>

        <SoftCard title="Alertas" bodyClassName="!p-3">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
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

        <SoftCard
          title="Parcelas e Orçamentos"
          description="Recebimentos gerados a partir de orçamentos aprovados"
          bodyClassName="!p-0"
          action={
            <Button type="button" variant="secondary" className="rounded-xl" onClick={batchReceive}>
              <CheckSquare className="h-4 w-4" />
              Recebimento em lote ({selectedIds.length})
            </Button>
          }
        >
          <div className="max-h-[420px] overflow-auto">
            <table className="min-w-[1300px] w-full text-left text-sm">
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
                      ["patient", "Paciente"],
                      ["cpf", "CPF"],
                      ["budgetNumber", "Orçamento"],
                      ["procedure", "Procedimento"],
                      ["professional", "Profissional"],
                      ["convenio", "Convênio"],
                      ["installment", "Parcela"],
                      ["dueDate", "Vencimento"],
                      ["amount", "Valor"],
                      ["receivedAmount", "Recebido"],
                      ["balance", "Saldo"],
                      ["paymentMethod", "Pagamento"],
                      ["bankAccount", "Conta"],
                      ["status", "Status"],
                    ] as const
                  ).map(([key, label]) => (
                    <th key={key} className="px-2 py-3">
                      <button type="button" onClick={() => toggleSort(key)}>
                        {label}
                      </button>
                    </th>
                  ))}
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
                    <td className="px-2 py-2 font-medium text-slate-900">{a.patient}</td>
                    <td className="px-2 py-2 text-slate-600">{a.cpf}</td>
                    <td className="px-2 py-2 text-slate-600">{a.budgetNumber}</td>
                    <td className="px-2 py-2 text-slate-600">{a.procedure}</td>
                    <td className="px-2 py-2 text-slate-600">{a.professional}</td>
                    <td className="px-2 py-2 text-slate-600">{a.convenio}</td>
                    <td className="px-2 py-2 text-slate-600">
                      {a.installment}/{a.totalInstallments}
                    </td>
                    <td className="px-2 py-2 text-slate-700">{a.dueLabel}</td>
                    <td className="px-2 py-2 font-semibold text-slate-900">{money(a.amount)}</td>
                    <td className="px-2 py-2 text-emerald-700">{money(a.receivedAmount)}</td>
                    <td className="px-2 py-2 text-rose-600">{money(a.balance)}</td>
                    <td className="px-2 py-2 text-slate-600">{a.paymentMethod}</td>
                    <td className="px-2 py-2 text-slate-600">{a.bankAccount}</td>
                    <td className="px-2 py-2">
                      <StatusPill status={a.status} />
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1">
                        <IconBtn title="Visualizar" onClick={() => notify("Visualizar")}>
                          <Eye className="h-3.5 w-3.5" />
                        </IconBtn>
                        <IconBtn title="Editar" onClick={() => notify("Editar")}>
                          <Pencil className="h-3.5 w-3.5" />
                        </IconBtn>
                        <IconBtn title="Registrar Recebimento" onClick={() => openPay(a)}>
                          <Banknote className="h-3.5 w-3.5" />
                        </IconBtn>
                        <IconBtn title="Enviar Cobrança" onClick={() => notify("Enviar Cobrança")}>
                          <MessageSquare className="h-3.5 w-3.5" />
                        </IconBtn>
                        <IconBtn title="Imprimir" onClick={() => notify("Imprimir")}>
                          <Printer className="h-3.5 w-3.5" />
                        </IconBtn>
                        <IconBtn title="Duplicar" onClick={() => notify("Duplicar")}>
                          <Copy className="h-3.5 w-3.5" />
                        </IconBtn>
                        <IconBtn
                          title="Cancelar"
                          onClick={() =>
                            setData((d) => ({
                              ...d,
                              installments: d.installments.map((x) =>
                                x.id === a.id ? { ...x, status: "cancelado" } : x
                              ),
                            }))
                          }
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </IconBtn>
                        <IconBtn
                          title="Excluir"
                          onClick={() =>
                            setData((d) => ({
                              ...d,
                              installments: d.installments.filter((x) => x.id !== a.id),
                            }))
                          }
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

      <NewReceiptDrawer
        open={drawerOpen}
        form={form}
        setForm={setForm}
        onClose={() => setDrawerOpen(false)}
        onSave={saveReceipt}
      />
      <RegisterReceiptModal
        open={payOpen}
        form={payForm}
        setForm={setPayForm}
        onClose={() => setPayOpen(false)}
        onConfirm={confirmPay}
        title={
          payTarget
            ? `${payTarget.patient} — ${payTarget.procedure} (${payTarget.installment}/${payTarget.totalInstallments})`
            : ""
        }
      />
    </div>
  );
}

function StatusPill({ status }: { status: ReceivableStatus }) {
  const map: Record<ReceivableStatus, string> = {
    pago: "bg-emerald-50 text-emerald-700",
    parcial: "bg-sky-50 text-sky-700",
    em_aberto: "bg-amber-50 text-amber-700",
    vencido: "bg-rose-50 text-rose-700",
    cancelado: "bg-slate-100 text-slate-600",
    negociado: "bg-indigo-50 text-indigo-700",
  };
  const labels: Record<ReceivableStatus, string> = {
    pago: "Pago",
    parcial: "Recebido Parcial",
    em_aberto: "Em Aberto",
    vencido: "Vencido",
    cancelado: "Cancelado",
    negociado: "Negociado",
  };
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold", map[status])}>
      {labels[status]}
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
              />
            );
            acc += length;
            return el;
          })}
        </svg>
      </div>
      <ul className="max-h-28 w-full space-y-1 overflow-y-auto pr-1">
        {items.map((item) => (
          <li key={item.name} className="flex items-center justify-between gap-2 text-[11px]">
            <span className="flex min-w-0 items-center gap-1.5 text-slate-600">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.color }} />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="font-semibold text-slate-800">{item.percent}%</span>
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

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-2.5 w-2.5 rounded-full", color)} />
      {label}
    </span>
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
