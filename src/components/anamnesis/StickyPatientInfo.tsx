"use client";

import Link from "next/link";
import {
  CalendarPlus,
  ClipboardList,
  MessageCircle,
  Receipt,
  Shield,
  Smile,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { computeAge } from "@/lib/patient-profile-types";
import type { PatientProfile } from "@/lib/patient-profile-types";
import type { RiskLevel } from "@/lib/anamnesis-types";
import { formatDisplayDate } from "@/lib/patients-list-mock";

import { RISK_CONFIG } from "./RiskClassificationCard";

export function StickyPatientInfo({
  patient,
  riskLevel,
  updatedAt,
  updatedBy,
}: {
  patient: PatientProfile;
  riskLevel: RiskLevel;
  updatedAt: string;
  updatedBy: string;
}) {
  const age = computeAge(patient.birthDate);
  const risk = { ...RISK_CONFIG[riskLevel], iconClass: riskLevel === "baixo" ? "bg-emerald-100 text-emerald-600" : riskLevel === "medio" ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600" };
  const whatsapp = patient.phone.replace(/\D/g, "");

  const quickActions = [
    { label: "Ver Odontograma", href: `/app/pacientes/${patient.id}?tab=odontograma`, icon: Smile },
    { label: "Ver Prontuário", href: `/app/pacientes/${patient.id}`, icon: ClipboardList },
    { label: "Nova Consulta", href: "/app/agenda", icon: CalendarPlus },
    { label: "Novo Orçamento", href: `/app/pacientes/${patient.id}?tab=orcamentos`, icon: Receipt },
    {
      label: "Enviar WhatsApp",
      href: `https://wa.me/55${whatsapp}`,
      icon: MessageCircle,
      external: true,
    },
  ];

  return (
    <aside className="sticky top-24 space-y-4">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white",
              patient.avatarColor
            )}
          >
            {patient.initials}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{patient.name}</p>
            <p className="text-xs text-slate-500">
              {age} anos • {patient.sexo ?? "—"}
            </p>
          </div>
        </div>
        <div className="mt-3 space-y-1.5 text-xs text-slate-600">
          <p>{patient.phone}</p>
          <p className="truncate">{patient.email}</p>
        </div>
      </div>

      <div className={cn("rounded-2xl border p-4 shadow-sm", risk.className)}>
        <div className="flex items-start gap-3">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", risk.iconClass)}>
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Classificação de risco</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{risk.label}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{risk.description}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Última atualização</p>
        <p className="mt-1 text-sm font-medium text-slate-800">
          {formatDisplayDate(updatedAt.slice(0, 10))}
        </p>
        <p className="text-xs text-slate-500">{updatedBy}</p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Ações rápidas</p>
        <ul className="space-y-1">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const className =
              "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50";
            if (action.external) {
              return (
                <li key={action.label}>
                  <a href={action.href} target="_blank" rel="noopener noreferrer" className={className}>
                    <Icon className="h-4 w-4 text-indigo-500" />
                    {action.label}
                  </a>
                </li>
              );
            }
            return (
              <li key={action.label}>
                <Link href={action.href} className={className}>
                  <Icon className="h-4 w-4 text-indigo-500" />
                  {action.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
