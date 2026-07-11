"use client";

import Link from "next/link";
import {
  CreditCard,
  Mail,
  MessageCircle,
  Plus,
  QrCode,
  Receipt,
  Wallet,
  XCircle,
} from "lucide-react";
import { cn, money } from "@/lib/utils";
import type { DentalBudget } from "@/lib/budget-types";
import type { FinancialKpiSummary } from "@/lib/financial-types";
import { BUDGET_STATUS_LABELS, budgetStatusBadge } from "@/components/budgets/shared";
import { FinancialSectionCard } from "./shared";

export function FinancialSidebar({
  patientId,
  summary,
  linkedBudgets,
  onQuickAction,
}: {
  patientId: string;
  summary: FinancialKpiSummary;
  linkedBudgets: DentalBudget[];
  onQuickAction: (action: string) => void;
}) {
  const total = summary.totalReceived + summary.totalReceivable;

  return (
    <aside className="space-y-4">
      <FinancialSectionCard title="Resumo financeiro">
        <div className="flex justify-center py-2">
          <DonutChart received={summary.receivedPercent} />
        </div>
        <div className="mt-3 space-y-2 text-sm">
          <Row label="Recebido" value={money(summary.totalReceived)} color="text-emerald-600" />
          <Row label="A receber" value={money(summary.totalReceivable)} color="text-amber-600" />
          <Row label="Total geral" value={money(total)} bold />
          <Row label="Saldo em aberto" value={money(summary.totalReceivable)} />
        </div>
      </FinancialSectionCard>

      <FinancialSectionCard title="Situação financeira">
        <div className="space-y-2 text-sm">
          <Row label="A vencer" value={money(summary.situation.upcoming)} />
          <Row label="Vencidos" value={money(summary.situation.overdue)} color="text-red-600" />
          <Row label="Pagos" value={money(summary.situation.paid)} color="text-emerald-600" />
          <Row label="Agendados" value={money(summary.situation.scheduled)} />
          <Row label="Cancelados" value={money(summary.situation.cancelled)} muted />
        </div>
      </FinancialSectionCard>

      <FinancialSectionCard title="Orçamentos vinculados">
        {linkedBudgets.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum orçamento vinculado.</p>
        ) : (
          <ul className="space-y-2">
            {linkedBudgets.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/app/pacientes/${patientId}/orcamentos`}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5 transition hover:border-indigo-200 hover:bg-indigo-50/50"
                >
                  <div>
                    <p className="text-sm font-semibold text-indigo-600">{b.number}</p>
                    <span
                      className={cn(
                        "mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold",
                        budgetStatusBadge(b.status)
                      )}
                    >
                      {BUDGET_STATUS_LABELS[b.status]}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{money(b.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </FinancialSectionCard>

      <FinancialSectionCard title="Ações rápidas">
        <div className="grid gap-2">
          <QuickBtn icon={Plus} label="Nova cobrança" onClick={() => onQuickAction("nova_cobranca")} />
          <QuickBtn icon={Wallet} label="Receber pagamento" onClick={() => onQuickAction("receber")} />
          <QuickBtn icon={QrCode} label="Emitir PIX" onClick={() => onQuickAction("pix")} />
          <QuickBtn icon={Receipt} label="Emitir boleto" onClick={() => onQuickAction("boleto")} />
          <QuickBtn icon={MessageCircle} label="Cobrança WhatsApp" onClick={() => onQuickAction("whatsapp")} />
          <QuickBtn icon={Mail} label="Cobrança e-mail" onClick={() => onQuickAction("email")} />
          <QuickBtn icon={CreditCard} label="Gerar recibo" onClick={() => onQuickAction("recibo")} />
          <QuickBtn icon={XCircle} label="Cancelar cobrança" onClick={() => onQuickAction("cancelar")} danger />
        </div>
      </FinancialSectionCard>
    </aside>
  );
}

function Row({
  label,
  value,
  color,
  bold,
  muted,
}: {
  label: string;
  value: string;
  color?: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className={cn("text-slate-500", bold && "font-semibold text-slate-800", muted && "text-slate-400")}>
        {label}
      </span>
      <span className={cn("font-semibold tabular-nums", color ?? "text-slate-800", bold && "font-bold")}>
        {value}
      </span>
    </div>
  );
}

function QuickBtn({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition",
        danger
          ? "border-red-100 bg-red-50/50 text-red-700 hover:bg-red-50"
          : "border-slate-100 bg-slate-50/50 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50"
      )}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-70" />
      {label}
    </button>
  );
}

function DonutChart({ received }: { received: number }) {
  const size = 100;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (received / 100) * circ;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#6366f1"
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-slate-900">{received}%</span>
        <span className="text-[9px] text-slate-400">recebido</span>
      </div>
    </div>
  );
}
