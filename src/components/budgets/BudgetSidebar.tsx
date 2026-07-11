"use client";

import Link from "next/link";
import {
  Calendar,
  CreditCard,
  MessageCircle,
  Plus,
  QrCode,
  Receipt,
  Wallet,
} from "lucide-react";
import { cn, money } from "@/lib/utils";
import type { DentalBudget } from "@/lib/budget-types";
import type { PatientProfile } from "@/lib/patient-profile-types";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import { PAYMENT_METHOD_LABELS } from "@/lib/budget-mock";
import { BUDGET_STATUS_LABELS, budgetStatusBadge, SectionCard } from "./shared";

export function BudgetSidebar({
  patient,
  budget,
}: {
  patient: PatientProfile;
  budget: DentalBudget | null;
}) {
  const nextAppt = patient.upcomingAppointments[0];
  const paidPct = budget && budget.total > 0 ? (budget.paidAmount / budget.total) * 100 : 0;

  return (
    <aside className="space-y-4">
      {budget ? (
        <>
          <SectionCard title="Resumo do orçamento">
            <div className="text-center">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Valor total
              </p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{money(budget.total)}</p>
              <span
                className={cn(
                  "mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                  budgetStatusBadge(budget.status)
                )}
              >
                {BUDGET_STATUS_LABELS[budget.status]}
              </span>
            </div>

            <div className="mt-5 flex justify-center">
              <DonutChart paidPercent={paidPct} />
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <Row label="Valor pago" value={money(budget.paidAmount)} color="text-emerald-600" />
              <Row label="Saldo em aberto" value={money(budget.balance)} color="text-amber-600" />
              <Row
                label="Forma de pagamento"
                value={PAYMENT_METHOD_LABELS[budget.paymentMethod]}
              />
              <Row label="Responsável" value={patient.financialResponsible} />
            </div>
          </SectionCard>

          <SectionCard title="Ações rápidas">
            <div className="grid gap-2">
              <QuickAction icon={Plus} label="Nova consulta" href="/app/agenda" />
              <QuickAction
                icon={Wallet}
                label="Abrir financeiro"
                href={`/app/pacientes/${patient.id}/financeiro`}
              />
              <QuickAction
                icon={MessageCircle}
                label="Enviar WhatsApp"
                onClick={() => window.open(`https://wa.me/55${patient.phone.replace(/\D/g, "")}`, "_blank")}
              />
              <QuickAction icon={CreditCard} label="Gerar cobrança" onClick={() => {}} />
              <QuickAction icon={QrCode} label="Emitir PIX" onClick={() => {}} />
              <QuickAction icon={Receipt} label="Emitir boleto" onClick={() => {}} />
            </div>
          </SectionCard>
        </>
      ) : (
        <SectionCard title="Selecione um orçamento">
          <p className="text-sm text-slate-500">
            Clique em um orçamento na tabela para ver detalhes, histórico e ações rápidas.
          </p>
        </SectionCard>
      )}

      {nextAppt && (
        <SectionCard title="Próxima consulta">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-indigo-50 p-2.5">
              <Calendar className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{nextAppt.procedure}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {formatDisplayDate(nextAppt.date)} às {nextAppt.time}
              </p>
              <p className="text-xs text-slate-400">{nextAppt.professional}</p>
            </div>
          </div>
        </SectionCard>
      )}
    </aside>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={cn("font-semibold text-slate-800", color)}>{value}</span>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  href,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const cls =
    "flex w-full items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700";

  if (href) {
    return (
      <Link href={href} className={cls}>
        <Icon className="h-4 w-4 shrink-0" />
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cls}>
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}

function DonutChart({ paidPercent }: { paidPercent: number }) {
  const size = 120;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const paidOffset = circumference - (paidPercent / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#6366f1"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={paidOffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-slate-900">{Math.round(paidPercent)}%</span>
        <span className="text-[10px] text-slate-400">pago</span>
      </div>
    </div>
  );
}
