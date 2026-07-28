"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  FileText,
  HeartPulse,
  Mail,
  MessageCircle,
  Pill,
  Printer,
  Receipt,
  Smile,
  Stethoscope,
  Wallet,
} from "lucide-react";
import { computeAge } from "@/lib/patient-profile-types";
import type { PatientProfile } from "@/lib/patient-profile-types";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import { money } from "@/lib/utils";
import { ProfileCard } from "../ProfileCard";

function SideCard({
  title,
  action,
  children,
  tone,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <ProfileCard
      title={title}
      action={action}
      className={tone === "danger" ? "border-rose-200 bg-rose-50/40" : undefined}
    >
      {children}
    </ProfileCard>
  );
}

export function ProntuarioSidebar({
  patient,
  onNovaEvolucao,
  onPrint,
}: {
  patient: PatientProfile;
  onNovaEvolucao: () => void;
  onPrint: () => void;
}) {
  const age = computeAge(patient.birthDate);
  const allergies = patient.anamnesis.allergies || "Nenhuma informada";
  const meds = (patient.anamnesis.medications || "")
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const diseases = (patient.anamnesis.diseases || "")
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const financial = patient.financial;
  const pendingCharges =
    financial?.charges?.filter((c) => c.status !== "pago").length ??
    patient.receivables.filter((r) => r.status !== "pago").length;
  const saldo =
    financial?.charges?.reduce((a, c) => a + (c.status === "pago" ? 0 : c.amount), 0) ??
    patient.receivables
      .filter((r) => r.status !== "pago")
      .reduce((a, r) => a + r.amount, 0);

  const alerts = [
    {
      id: "alergia",
      label: "Alergias",
      value: allergies,
      tone: "bg-rose-100 text-rose-800 border-rose-200",
      show: Boolean(patient.anamnesis.allergies && !/nenhuma/i.test(patient.anamnesis.allergies)),
    },
    {
      id: "diabetes",
      label: "Diabético",
      value: "Atenção ao protocolo",
      tone: "bg-amber-100 text-amber-800 border-amber-200",
      show: diseases.some((d) => /diabet/i.test(d)),
    },
    {
      id: "hipertensao",
      label: "Hipertenso",
      value: "Monitorar PA",
      tone: "bg-orange-100 text-orange-800 border-orange-200",
      show: diseases.some((d) => /hipertens/i.test(d)),
    },
  ].filter((a) => a.show);

  return (
    <aside className="space-y-4">
      <SideCard title="Resumo do Paciente">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500">Nome</dt>
            <dd className="text-right font-medium text-slate-800">{patient.name}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500">Idade</dt>
            <dd className="font-medium text-slate-800">{age} anos</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500">Sexo</dt>
            <dd className="font-medium text-slate-800">{patient.sexo || "—"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500">CPF</dt>
            <dd className="font-medium text-slate-800">{patient.cpf || "—"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500">Telefone</dt>
            <dd className="font-medium text-slate-800">{patient.phone || "—"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500">Convênio</dt>
            <dd className="font-medium text-slate-800">{patient.insurance || "—"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500">Status</dt>
            <dd>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold capitalize text-emerald-700">
                {patient.status}
              </span>
            </dd>
          </div>
        </dl>
      </SideCard>

      <SideCard
        title="Alertas"
        tone={alerts.length ? "danger" : "default"}
        action={<AlertTriangle className="h-4 w-4 text-rose-500" />}
      >
        {alerts.length ? (
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li
                key={a.id}
                className={`rounded-xl border px-3 py-2 text-xs font-medium ${a.tone}`}
              >
                <p className="font-semibold">{a.label}</p>
                <p className="opacity-90">{a.value}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500">Nenhum alerta clínico crítico.</p>
        )}
      </SideCard>

      <SideCard title="Medicamentos em Uso" action={<Pill className="h-4 w-4 text-slate-400" />}>
        {meds.length ? (
          <ul className="space-y-1.5 text-sm text-slate-700">
            {meds.map((m) => (
              <li key={m} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                {m}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-400">Nenhum medicamento informado.</p>
        )}
      </SideCard>

      <SideCard
        title="Histórico Médico"
        action={
          <Link
            href={`/app/pacientes/${patient.id}/anamnese`}
            className="text-xs font-semibold text-indigo-600 hover:underline"
          >
            Abrir Anamnese
          </Link>
        }
      >
        <ul className="space-y-2 text-sm">
          {(diseases.length ? diseases : ["Sem doenças sistêmicas registradas"]).map((d) => (
            <li key={d} className="flex items-center gap-2 text-slate-700">
              <HeartPulse className="h-3.5 w-3.5 text-emerald-500" />
              {d}
            </li>
          ))}
        </ul>
      </SideCard>

      <SideCard title="Próximas Consultas" action={<CalendarDays className="h-4 w-4 text-slate-400" />}>
        {patient.upcomingAppointments.length ? (
          <ul className="space-y-2">
            {patient.upcomingAppointments.slice(0, 3).map((a) => (
              <li key={a.id} className="rounded-lg border border-slate-100 px-3 py-2 text-xs">
                <p className="font-semibold text-slate-800">
                  {formatDisplayDate(a.date)} · {a.time}
                </p>
                <p className="text-slate-500">{a.procedure}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-400">Sem agendamentos futuros.</p>
        )}
      </SideCard>

      <SideCard title="Procedimentos Pendentes">
        {patient.odontogram.filter((t) => t.status === "cariado" || t.status === "tratamento").length ? (
          <ul className="space-y-1.5 text-xs text-slate-700">
            {patient.odontogram
              .filter((t) => t.status === "cariado" || t.status === "tratamento")
              .slice(0, 5)
              .map((t) => (
                <li key={t.number} className="flex justify-between">
                  <span>Dente {t.number}</span>
                  <span className="capitalize text-amber-700">{t.status}</span>
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-400">Nenhum procedimento pendente no odontograma.</p>
        )}
      </SideCard>

      <SideCard title="Financeiro" action={<Wallet className="h-4 w-4 text-slate-400" />}>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Saldo em aberto</dt>
            <dd className="font-semibold text-slate-800">{money(saldo)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Orçamentos</dt>
            <dd className="font-medium text-slate-800">
              {(patient.dentalBudgets?.length || patient.budgets.length) ?? 0}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Pendências</dt>
            <dd className="font-medium text-amber-700">{pendingCharges}</dd>
          </div>
        </dl>
      </SideCard>

      <SideCard title="Ações Rápidas">
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              label: "Nova Receita",
              href: `/app/pacientes/${patient.id}/receitas`,
              icon: Receipt,
            },
            {
              label: "Novo Orçamento",
              href: `/app/pacientes/${patient.id}/orcamentos`,
              icon: FileText,
            },
            {
              label: "Odontograma",
              href: `/app/pacientes/${patient.id}?tab=odontograma`,
              icon: Smile,
            },
            {
              label: "Anamnese",
              href: `/app/pacientes/${patient.id}/anamnese`,
              icon: Stethoscope,
            },
          ].map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 px-2 py-3 text-center text-[11px] font-semibold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700"
            >
              <a.icon className="h-4 w-4" />
              {a.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={onNovaEvolucao}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 px-2 py-3 text-center text-[11px] font-semibold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700"
          >
            <Stethoscope className="h-4 w-4" />
            Nova Evolução
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 px-2 py-3 text-center text-[11px] font-semibold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </button>
          <a
            href={`https://wa.me/55${(patient.phone || "").replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 px-2 py-3 text-center text-[11px] font-semibold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-700"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <a
            href={patient.email ? `mailto:${patient.email}` : "#"}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 px-2 py-3 text-center text-[11px] font-semibold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700"
          >
            <Mail className="h-4 w-4" />
            E-mail
          </a>
        </div>
      </SideCard>
    </aside>
  );
}
