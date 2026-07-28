"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Pill, Plus, RefreshCw } from "lucide-react";
import type { PatientProfile } from "@/lib/patient-profile-types";
import type { PrescriptionRecord } from "@/lib/prescription-types";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import { NewPrescriptionDrawer } from "@/components/prescriptions/NewPrescriptionDrawer";
import { ProfileCard } from "../ProfileCard";

type ProfessionalOption = { id: string; name: string; cro?: string | null };

export function PatientPrescriptionsTab({ patient }: { patient: PatientProfile }) {
  const [items, setItems] = useState<PrescriptionRecord[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadPrescriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/prescricoes?patientId=${patient.id}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao carregar receitas.");
      setItems(data.items ?? []);
      if (Array.isArray(data.professionals)) {
        setProfessionals(data.professionals);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar receitas.");
    } finally {
      setLoading(false);
    }
  }, [patient.id]);

  useEffect(() => {
    void loadPrescriptions();
  }, [loadPrescriptions]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        <p className="font-semibold">Receituário odontológico gratuito</p>
        <p className="mt-1 text-emerald-800">
          Módulo nativo para cirurgião-dentista (CRO), sem Memed e sem custo. Catálogo com
          antibióticos, analgésicos e antissépticos de uso odontológico.
        </p>
      </div>

      <ProfileCard
        title="Receitas odontológicas"
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadPrescriptions()}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Atualizar
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Nova receita
            </button>
          </div>
        }
      >
        <p className="mb-4 text-sm text-slate-500">
          Emita receitas com posologia, imprima/PDF e registre no prontuário do paciente.
        </p>

        {loading ? (
          <p className="text-sm text-slate-400">Carregando receitas...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
            <Pill className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">Nenhuma receita registrada</p>
            <p className="mt-1 text-xs text-slate-400">
              Clique em &quot;Nova receita&quot; para prescrever medicamentos odontológicos.
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
                    <p className="whitespace-pre-line font-semibold text-slate-900">
                      {item.content}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDisplayDate(item.createdAt.slice(0, 10))}
                      {item.professionalName ? ` · ${item.professionalName}` : ""}
                      {item.professionalCro ? ` · CRO ${item.professionalCro}` : ""}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                      item.status === "cancelada"
                        ? "bg-slate-100 text-slate-600"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={item.pdfUrl || `/api/prescricoes/${item.id}/imprimir`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Imprimir / PDF
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ProfileCard>

      <p className="text-xs text-slate-400">
        Para assinatura digital ICP-Brasil oficial, use também{" "}
        <a
          href="https://prescricao.cfo.org.br"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-indigo-600 hover:underline"
        >
          Prescrição Eletrônica CFO
        </a>
        .{" "}
        <Link href="/app/receitas-medicas" className="font-semibold text-indigo-600 hover:underline">
          Ver todas as receitas da clínica
        </Link>
      </p>

      <NewPrescriptionDrawer
        open={drawerOpen}
        patientId={patient.id}
        patientName={patient.name}
        professionals={professionals}
        onClose={() => setDrawerOpen(false)}
        onSaved={() => void loadPrescriptions()}
      />
    </div>
  );
}
