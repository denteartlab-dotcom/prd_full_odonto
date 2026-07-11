"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePatients } from "@/contexts/patients-context";
import { useMounted } from "@/hooks/use-mounted";
import type { PatientProfileTab } from "@/lib/patient-profile-types";
import { PatientInfoCard } from "./PatientInfoCard";
import { PatientProfileHeader } from "./PatientProfileHeader";
import { PatientTabPanels } from "./PatientTabPanels";
import { PatientTabs } from "./PatientTabs";

const VALID_TABS = new Set<PatientProfileTab>([
  "resumo",
  "anamnese",
  "odontograma",
  "orcamentos",
  "financeiro",
  "consultas",
  "documentos",
  "historico",
  "imagens",
  "comunicacoes",
]);

export function PatientProfilePage({
  patientId,
  userName,
  role,
  initialTab,
}: {
  patientId: string;
  userName: string;
  role: string;
  initialTab?: PatientProfileTab;
}) {
  const mounted = useMounted();
  const searchParams = useSearchParams();
  const { getPatientById, updatePatient, hydrated } = usePatients();
  const [activeTab, setActiveTab] = useState<PatientProfileTab>(initialTab ?? "resumo");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && VALID_TABS.has(tabParam as PatientProfileTab)) {
      setActiveTab(tabParam as PatientProfileTab);
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [searchParams, initialTab]);

  const patient = useMemo(
    () => (mounted && hydrated ? getPatientById(patientId) : undefined),
    [mounted, hydrated, getPatientById, patientId]
  );

  if (!mounted || !hydrated) {
    return (
      <div className="mx-auto max-w-[1400px] animate-pulse space-y-4 p-4">
        <div className="h-8 w-64 rounded bg-slate-200" />
        <div className="h-40 rounded-2xl bg-slate-200" />
        <div className="h-96 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Paciente não encontrado</h1>
        <p className="mt-2 text-sm text-slate-500">
          O paciente pode ter sido removido ou o ID é inválido.
        </p>
        <Link
          href="/app/pacientes"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Voltar para pacientes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] pb-8">
      <PatientProfileHeader patientName={patient.name} userName={userName} role={role} />
      <PatientInfoCard patient={patient} onUpdate={(patch) => updatePatient(patient.id, patch)} />
      <PatientTabs active={activeTab} onChange={setActiveTab} />
      <PatientTabPanels
        tab={activeTab}
        patient={patient}
        onUpdate={(patch) => updatePatient(patient.id, patch)}
        userName={userName}
      />
    </div>
  );
}
