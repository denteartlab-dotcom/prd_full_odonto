"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  FileText,
  Pill,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import type { PatientProfile } from "@/lib/patient-profile-types";
import type { PrescriptionRecord } from "@/lib/prescription-types";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import { MemedPrescriptionLauncher } from "@/components/memed/MemedPrescriptionLauncher";
import { ProfileCard } from "../ProfileCard";

function patientToMemedInput(patient: PatientProfile) {
  return {
    id: patient.id,
    name: patient.name,
    cpf: patient.cpf,
    birthDate: patient.birthDate,
    phone: patient.phone,
    email: patient.email,
    sexo: patient.sexo,
    endereco: patient.endereco,
    numero: patient.numero,
    bairro: patient.bairro,
    cidade: patient.city,
    estado: patient.state,
    cep: patient.cep,
  };
}

export function PatientPrescriptionsTab({ patient }: { patient: PatientProfile }) {
  const [items, setItems] = useState<PrescriptionRecord[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPrescriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/memed/prescriptions?patientId=${patient.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao carregar receitas.");
      setConfigured(data.configured !== false);
      setItems(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar receitas.");
    } finally {
      setLoading(false);
    }
  }, [patient.id]);

  useEffect(() => {
    loadPrescriptions();
  }, [loadPrescriptions]);

  return (
    <div className="space-y-4">
      {!configured ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Memed não configurada</p>
            <p className="mt-1 text-amber-800">
              Adicione <code>MEMED_API_KEY</code>, <code>MEMED_SECRET_KEY</code> e{" "}
              <code>MEMED_PRESCRIBER_EXTERNAL_ID</code> nas variáveis de ambiente (Vercel e .env local).
            </p>
          </div>
        </div>
      ) : null}

      <ProfileCard
        title="Receituário digital (Memed)"
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadPrescriptions}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Atualizar
            </button>
            <MemedPrescriptionLauncher
              patient={patientToMemedInput(patient)}
              onSaved={loadPrescriptions}
              label="Prescrever"
            />
          </div>
        }
      >
        <p className="mb-4 text-sm text-slate-500">
          Prescrições eletrônicas com validação de interações medicamentosas, receita digital e PDF.
        </p>

        {loading ? (
          <p className="text-sm text-slate-400">Carregando receitas...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
            <Pill className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">Nenhuma prescrição registrada</p>
            <p className="mt-1 text-xs text-slate-400">
              Clique em &quot;Prescrever&quot; para abrir o módulo Memed deste paciente.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.content}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDisplayDate(item.createdAt.slice(0, 10))}
                      {item.professionalName ? ` · ${item.professionalName}` : ""}
                      {item.memedId ? ` · Memed #${item.memedId}` : ""}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-700">
                    {item.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.pdfUrl ? (
                    <a
                      href={item.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      PDF
                    </a>
                  ) : null}
                  {item.digitalLink ? (
                    <a
                      href={item.digitalLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Receita digital
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </ProfileCard>

      <p className="text-xs text-slate-400">
        Integração Memed Sinapse Prescrição.{" "}
        <Link href="/app/receitas-medicas" className="font-semibold text-indigo-600 hover:underline">
          Ver todas as receitas da clínica
        </Link>
      </p>
    </div>
  );
}
