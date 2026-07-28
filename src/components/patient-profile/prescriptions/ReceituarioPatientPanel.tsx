"use client";

import { AlertTriangle, Info } from "lucide-react";
import { computeAge } from "@/lib/patient-profile-types";
import type { PatientProfile } from "@/lib/patient-profile-types";
import type { ReceituarioAlert } from "@/lib/receituario-types";
import { cn } from "@/lib/utils";
import { ProfileCard } from "../ProfileCard";

export function ReceituarioPatientPanel({
  patient,
  dentist,
  alerts,
}: {
  patient: PatientProfile;
  dentist: { name: string; cro?: string | null; specialty?: string; clinic?: string; phone?: string; city?: string };
  alerts: ReceituarioAlert[];
}) {
  const age = computeAge(patient.birthDate);
  const allergies = patient.anamnesis.allergies || "—";
  const meds = patient.anamnesis.medications || "—";
  const diseases = patient.anamnesis.diseases || "—";

  return (
    <aside className="space-y-4">
      <ProfileCard title="Dados do Paciente">
        <dl className="space-y-2 text-sm">
          {[
            ["Nome", patient.name],
            ["Idade", `${age} anos`],
            ["Sexo", patient.sexo || "—"],
            ["Peso", "—"],
            ["CPF", patient.cpf || "—"],
            ["Telefone", patient.phone || "—"],
            ["Alergias", allergies],
            ["Medicamentos em uso", meds],
            ["Doenças sistêmicas", diseases],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3">
              <dt className="shrink-0 text-slate-500">{label}</dt>
              <dd className="text-right font-medium text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>
      </ProfileCard>

      <ProfileCard title="Dados do Dentista">
        <dl className="space-y-2 text-sm">
          {[
            ["Nome", dentist.name],
            ["CRO", dentist.cro || "—"],
            ["Especialidade", dentist.specialty || "Clínica Geral"],
            ["Clínica", dentist.clinic || "—"],
            ["Telefone", dentist.phone || "—"],
            ["Cidade", dentist.city || patient.city || "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3">
              <dt className="shrink-0 text-slate-500">{label}</dt>
              <dd className="text-right font-medium text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>
      </ProfileCard>

      <ProfileCard
        title="Alertas"
        action={<AlertTriangle className="h-4 w-4 text-amber-500" />}
        className={alerts.some((a) => a.severity === "danger") ? "border-rose-200" : undefined}
      >
        {alerts.length ? (
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li
                key={a.id}
                className={cn(
                  "rounded-xl border px-3 py-2 text-xs",
                  a.severity === "danger" && "border-rose-200 bg-rose-50 text-rose-800",
                  a.severity === "warning" && "border-amber-200 bg-amber-50 text-amber-900",
                  a.severity === "info" && "border-sky-200 bg-sky-50 text-sky-900"
                )}
              >
                <p className="font-semibold">{a.title}</p>
                <p className="mt-0.5 opacity-90">{a.detail}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="flex items-start gap-2 text-xs text-slate-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Nenhum alerta clínico no momento. Painel preparado para APIs futuras.
          </p>
        )}
      </ProfileCard>
    </aside>
  );
}
