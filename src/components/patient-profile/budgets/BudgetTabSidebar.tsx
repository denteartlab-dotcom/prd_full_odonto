"use client";

import Link from "next/link";
import {
  Calendar,
  CreditCard,
  MessageCircle,
  Plus,
  QrCode,
  Receipt,
  Sparkles,
  Wallet,
} from "lucide-react";
import { cn, money } from "@/lib/utils";
import type { BudgetFinancialSummary } from "@/lib/budget-types";
import type { PatientProfile } from "@/lib/patient-profile-types";

export function BudgetTabSidebar({
  patient,
  summary,
  onSimulate,
}: {
  patient: PatientProfile;
  summary: BudgetFinancialSummary;
  onSimulate?: (action: string) => void;
}) {
  const simulate = (action: string) => {
    onSimulate?.(action);
  };

  return (
    <aside className="space-y-4">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Ações rápidas</h3>
        <div className="grid gap-2">
          <QuickBtn icon={Plus} label="Nova consulta" href="/app/agenda" />
          <QuickBtn
            icon={Wallet}
            label="Abrir financeiro"
            href={`/app/pacientes/${patient.id}/financeiro`}
          />
          <QuickBtn
            icon={MessageCircle}
            label="Enviar WhatsApp"
            onClick={() =>
              window.open(`https://wa.me/55${patient.phone.replace(/\D/g, "")}`, "_blank")
            }
          />
          <QuickBtn
            icon={CreditCard}
            label="Gerar cobrança"
            onClick={() => simulate("cobrança gerada (mock)")}
          />
          <QuickBtn
            icon={QrCode}
            label="Emitir PIX"
            onClick={() => simulate("PIX emitido (mock)")}
          />
          <QuickBtn
            icon={Receipt}
            label="Emitir boleto"
            onClick={() => simulate("Boleto emitido (mock)")}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Resumo financeiro</h3>
        <div className="space-y-2.5 text-sm">
          <FinRow label="Subtotal" value={money(summary.subtotal)} />
          <FinRow label="Descontos" value={`− ${money(summary.discounts)}`} negative />
          <FinRow label="Acréscimos" value={`+ ${money(summary.additions)}`} />
          <FinRow label="Total geral" value={money(summary.totalGeneral)} highlight />
          <FinRow
            label="Entrada"
            value={money(summary.downPayment)}
            sub={
              summary.totalGeneral > 0
                ? `${Math.round((summary.downPayment / summary.totalGeneral) * 100)}% do total`
                : undefined
            }
          />
          <FinRow label="Saldo restante" value={money(summary.remainingBalance)} highlight />
        </div>
      </section>

      <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-violet-50/50 p-5 shadow-sm">
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100">
          <Sparkles className="h-4 w-4 text-indigo-600" />
        </div>
        <p className="text-sm leading-relaxed text-indigo-900/80">
          Transforme orçamentos aprovados em tratamentos e cobranças com apenas um clique.
        </p>
        <Link
          href={`/app/pacientes/${patient.id}/orcamentos`}
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
        >
          Abrir módulo completo →
        </Link>
      </section>
    </aside>
  );
}

function QuickBtn({
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
        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cls}>
      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
      {label}
    </button>
  );
}

function FinRow({
  label,
  value,
  highlight,
  negative,
  sub,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  negative?: boolean;
  sub?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <span className={cn("text-slate-500", highlight && "font-semibold text-slate-800")}>
          {label}
        </span>
        {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
      </div>
      <span
        className={cn(
          "font-semibold tabular-nums",
          highlight ? "text-slate-900" : negative ? "text-red-500" : "text-slate-800"
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function BudgetTabSidebarCompact({ patient }: { patient: PatientProfile }) {
  const nextAppt = patient.upcomingAppointments[0];
  if (!nextAppt) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
      <Calendar className="h-3.5 w-3.5 text-indigo-500" />
      Próxima consulta: {nextAppt.procedure}
    </div>
  );
}
