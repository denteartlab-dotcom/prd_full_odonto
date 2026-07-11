"use client";

import Link from "next/link";
import {
  Calendar,
  Mail,
  MapPin,
  Phone,
  Shield,
  Stethoscope,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatDisplayDate,
  formatPatientCity,
  type ListPatient,
} from "@/lib/patients-list-mock";

export function PatientProfileDrawer({
  patient,
  onClose,
}: {
  patient: ListPatient | null;
  onClose: () => void;
}) {
  if (!patient) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[80] bg-slate-900/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed inset-y-0 right-0 z-[90] flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white",
                patient.avatarColor
              )}
            >
              {patient.initials}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{patient.name}</h3>
              <span
                className={cn(
                  "mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  patient.status === "ativo"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                {patient.status === "ativo" ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div className="grid gap-3 text-sm">
            <InfoRow icon={Stethoscope} label="CPF" value={patient.cpf} />
            <InfoRow icon={Phone} label="Telefone" value={patient.phone} />
            <InfoRow icon={Mail} label="E-mail" value={patient.email} />
            <InfoRow icon={MapPin} label="Cidade" value={formatPatientCity(patient)} />
            <InfoRow icon={Shield} label="Convênio" value={patient.insurance} />
            <InfoRow
              icon={Calendar}
              label="Última consulta"
              value={formatDisplayDate(patient.lastVisit)}
            />
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Informações adicionais
            </p>
            <dl className="mt-3 space-y-2">
              <div>
                <dt className="text-slate-500">Nascimento</dt>
                <dd className="font-medium text-slate-800">
                  {formatDisplayDate(patient.birthDate)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Responsável financeiro</dt>
                <dd className="font-medium text-slate-800">{patient.financialResponsible}</dd>
              </div>
              {patient.profession ? (
                <div>
                  <dt className="text-slate-500">Profissão</dt>
                  <dd className="font-medium text-slate-800">{patient.profession}</dd>
                </div>
              ) : null}
              {patient.notes ? (
                <div>
                  <dt className="text-slate-500">Observações</dt>
                  <dd className="text-slate-700">{patient.notes}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-4">
          <Link
            href={`/app/pacientes/${patient.id}`}
            className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Ver perfil completo
          </Link>
          <Link
            href="/app/pacientes/novo"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Editar
          </Link>
        </div>
      </aside>
    </>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}
