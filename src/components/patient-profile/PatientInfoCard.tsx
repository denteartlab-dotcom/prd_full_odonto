"use client";

import { useState } from "react";
import { ChevronDown, MessageCircle, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { computeAge } from "@/lib/patient-profile-types";
import type { PatientProfile } from "@/lib/patient-profile-types";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import { PatientEditModal } from "./PatientEditModal";

export function PatientInfoCard({
  patient,
  onUpdate,
}: {
  patient: PatientProfile;
  onUpdate: (patch: Partial<PatientProfile>) => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const whatsapp = patient.phone.replace(/\D/g, "");
  const age = computeAge(patient.birthDate);

  return (
    <>
      <section className="mb-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div
              className={cn(
                "flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl font-bold text-white shadow-md",
                patient.avatarColor
              )}
            >
              {patient.initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{patient.name}</h1>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                    patient.status === "ativo"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {patient.status === "ativo" ? "Ativo" : "Inativo"}
                </span>
              </div>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-3">
                <InfoItem label="CPF" value={patient.cpf} />
                <InfoItem
                  label="Telefone"
                  value={
                    <a
                      href={`https://wa.me/55${whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-slate-700 hover:text-emerald-600"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
                      {patient.phone}
                    </a>
                  }
                />
                <InfoItem label="E-mail" value={patient.email} />
                <InfoItem
                  label="Data de nascimento"
                  value={`${formatDisplayDate(patient.birthDate)} (${age} anos)`}
                />
                <InfoItem label="Gênero" value={patient.sexo} />
                <InfoItem label="Convênio" value={patient.insurance} />
                <InfoItem label="Responsável financeiro" value={patient.financialResponsible} />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Pencil className="h-4 w-4" />
              Editar dados
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setActionsOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                Ações
                <ChevronDown className="h-4 w-4" />
              </button>
              {actionsOpen ? (
                <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                  {["Agendar consulta", "Novo orçamento", "Enviar mensagem", "Gerar cobrança"].map(
                    (label) => (
                      <button
                        key={label}
                        type="button"
                        className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setActionsOpen(false)}
                      >
                        {label}
                      </button>
                    )
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <PatientEditModal
        open={editOpen}
        patient={patient}
        onClose={() => setEditOpen(false)}
        onSave={(patch) => {
          onUpdate(patch);
          setEditOpen(false);
        }}
      />
    </>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-0.5 font-medium text-slate-800">{value}</div>
    </div>
  );
}
