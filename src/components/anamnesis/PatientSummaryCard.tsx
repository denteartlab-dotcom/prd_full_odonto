"use client";

import Link from "next/link";
import { ExternalLink, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { computeAge } from "@/lib/patient-profile-types";
import type { PatientProfile } from "@/lib/patient-profile-types";

export function PatientSummaryCard({ patient }: { patient: PatientProfile }) {
  const age = computeAge(patient.birthDate);
  const whatsapp = patient.phone.replace(/\D/g, "");

  return (
    <section className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-bold text-white shadow-md",
              patient.avatarColor
            )}
          >
            {patient.initials}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryItem label="Nome" value={patient.name} />
            <SummaryItem label="CPF" value={patient.cpf} />
            <SummaryItem label="Idade" value={`${age} anos`} />
            <SummaryItem label="Telefone" value={patient.phone} />
            <SummaryItem
              label="WhatsApp"
              value={
                <a
                  href={`https://wa.me/55${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-600 hover:underline"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  {patient.phone}
                </a>
              }
            />
            <SummaryItem label="E-mail" value={patient.email} />
            <SummaryItem label="Convênio" value={patient.insurance} />
          </div>
        </div>
        <Link
          href={`/app/pacientes/${patient.id}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white"
        >
          Ver perfil completo
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-800">{value || "—"}</p>
    </div>
  );
}
