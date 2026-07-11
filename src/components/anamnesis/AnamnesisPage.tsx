"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePatients } from "@/contexts/patients-context";
import { useMounted } from "@/hooks/use-mounted";
import type { AnamnesisSectionId, DentalAnamnesis } from "@/lib/anamnesis-types";
import { ANAMNESIS_SECTIONS } from "@/lib/anamnesis-types";
import { createDefaultAnamnesis } from "@/lib/anamnesis-mock";
import { PatientProfileHeader } from "@/components/patient-profile/PatientProfileHeader";
import { AllergiesCard } from "./AllergiesCard";
import { AnamnesisHeader } from "./AnamnesisHeader";
import { AnamnesisHistoryModal } from "./AnamnesisHistoryModal";
import { AnamnesisSidebar } from "./AnamnesisSidebar";
import { ChiefComplaintSection, IdentificationSection, MedicalHistoryCard } from "./MedicalHistoryCard";
import { ClinicalExamCard } from "./ClinicalExamCard";
import { ConsentCard } from "./ConsentCard";
import { DentalHistoryCard } from "./DentalHistoryCard";
import { HabitsCard } from "./HabitsCard";
import { MedicationCard, SystemsReviewSection } from "./MedicationCard";
import { ObservationsSection, PainAssessmentCard } from "./PainAssessmentCard";
import { PatientSummaryCard } from "./PatientSummaryCard";
import { RiskSection } from "./RiskClassificationCard";
import { StickyPatientInfo } from "./StickyPatientInfo";
import { stashAnamnesisForPrint } from "@/lib/anamnesis-print";

type SaveState = "saved" | "dirty" | "saving";

export function AnamnesisPage({
  patientId,
  userName,
  role,
}: {
  patientId: string;
  userName: string;
  role: string;
}) {
  const mounted = useMounted();
  const { getPatientById, updatePatient, hydrated } = usePatients();
  const [form, setForm] = useState<DentalAnamnesis | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [activeSection, setActiveSection] = useState<AnamnesisSectionId>("identificacao");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formInitialized = useRef(false);

  const patient = useMemo(
    () => (mounted && hydrated ? getPatientById(patientId) : undefined),
    [mounted, hydrated, getPatientById, patientId]
  );

  useEffect(() => {
    if (!patient || formInitialized.current) return;
    formInitialized.current = true;
    setForm(patient.dentalAnamnesis ?? createDefaultAnamnesis(patient, userName));
  }, [patient, userName]);

  const persist = useCallback(
    (data: DentalAnamnesis, manual = false) => {
      if (!patient) return;
      setSaveState("saving");
      const versionEntry = {
        id: `ver-${Date.now()}`,
        savedAt: new Date().toISOString(),
        professionalName: userName,
        snapshot: `Anamnese de ${data.identification.nome} — Risco ${data.risk.level}`,
      };
      const updated: DentalAnamnesis = {
        ...data,
        updatedAt: new Date().toISOString(),
        updatedBy: userName,
        versions: manual ? [versionEntry, ...data.versions].slice(0, 20) : data.versions,
      };
      updatePatient(patient.id, { dentalAnamnesis: updated });
      setForm(updated);
      setSaveState("saved");
    },
    [patient, updatePatient, userName]
  );

  const patchForm = useCallback((patch: Partial<DentalAnamnesis>) => {
    setForm((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      setSaveState("dirty");
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        persist(next);
      }, 2500);
      return next;
    });
  }, [persist]);

  useEffect(() => {
    const sections = ANAMNESIS_SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActiveSection(visible.target.id as AnamnesisSectionId);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5] }
    );

    sections.forEach((el) => observer.observe(el!));
    return () => observer.disconnect();
  }, [form]);

  const navigateTo = (id: AnamnesisSectionId) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  };

  const validate = (data: DentalAnamnesis) => {
    if (!data.identification.nome.trim()) return "Nome é obrigatório.";
    if (!data.identification.cpf.trim()) return "CPF é obrigatório.";
    if (!data.consent.agreed) return "O termo de consentimento deve ser aceito.";
    if (!data.consent.signature.trim()) return "Assinatura digital é obrigatória.";
    return null;
  };

  const handleSave = () => {
    if (!form) return;
    const err = validate(form);
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    persist(form, true);
  };

  const handlePrint = () => {
    if (!form || !patient) return;
    stashAnamnesisForPrint(patient.id, form);
    window.open(`/app/pacientes/${patient.id}/anamnese/imprimir`, "_blank", "noopener,noreferrer");
  };

  if (!mounted || !hydrated) {
    return (
      <div className="mx-auto max-w-[1600px] animate-pulse space-y-4 p-4">
        <div className="h-8 w-64 rounded bg-slate-200" />
        <div className="h-32 rounded-2xl bg-slate-200" />
        <div className="h-96 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!patient || !form) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Paciente não encontrado</h1>
        <Link href="/app/pacientes" className="mt-6 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
          Voltar para pacientes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] pb-12 print:max-w-none">
      <PatientProfileHeader patientName={patient.name} userName={userName} role={role} />

      <nav className="mb-4 text-xs font-medium text-slate-400">
        <Link href="/app/pacientes" className="hover:text-indigo-600">
          Pacientes
        </Link>
        <span className="mx-1.5">›</span>
        <Link href={`/app/pacientes/${patient.id}`} className="hover:text-indigo-600">
          {patient.name}
        </Link>
        <span className="mx-1.5">›</span>
        <span className="text-slate-600">Anamnese</span>
      </nav>

      <AnamnesisHeader
        patientName={patient.name}
        status={patient.status}
        updatedAt={form.updatedAt}
        updatedBy={form.updatedBy}
        saveState={saveState}
        onPrint={handlePrint}
        onHistory={() => setHistoryOpen(true)}
        onSave={handleSave}
      />

      {validationError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {validationError}
        </div>
      )}

      <PatientSummaryCard patient={patient} />

      <div className="mb-4 xl:hidden">
        <label className="mb-1 block text-xs font-medium text-slate-500">Ir para seção</label>
        <select
          value={activeSection}
          onChange={(e) => navigateTo(e.target.value as AnamnesisSectionId)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm"
        >
          {ANAMNESIS_SECTIONS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.number}. {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 xl:grid-cols-[200px_minmax(0,1fr)_280px]">
        <div className="hidden xl:block print:hidden">
          <AnamnesisSidebar activeSection={activeSection} onNavigate={navigateTo} />
        </div>

        <div className="min-w-0 space-y-6">
          <IdentificationSection
            data={form.identification}
            onChange={(patch) => patchForm({ identification: { ...form.identification, ...patch } })}
          />
          <ChiefComplaintSection
            data={form.chiefComplaint}
            onChange={(patch) => patchForm({ chiefComplaint: { ...form.chiefComplaint, ...patch } })}
          />
          <MedicalHistoryCard
            data={form.medicalHistory}
            onChange={(patch) =>
              patchForm({
                medicalHistory: {
                  ...form.medicalHistory,
                  ...patch,
                  questions: patch.questions ?? form.medicalHistory.questions,
                },
              })
            }
          />
          <HabitsCard
            data={form.habits}
            onChange={(patch) => patchForm({ habits: { ...form.habits, ...patch } })}
          />
          <AllergiesCard
            data={form.allergies}
            onChange={(patch) => patchForm({ allergies: { ...form.allergies, ...patch } })}
          />
          <MedicationCard
            data={form.medications}
            onChange={(patch) =>
              patchForm({
                medications: {
                  ...form.medications,
                  ...patch,
                  list: patch.list ?? form.medications.list,
                },
              })
            }
          />
          <SystemsReviewSection
            data={form.systemsReview}
            onChange={(patch) => patchForm({ systemsReview: { ...form.systemsReview, ...patch } })}
          />
          <DentalHistoryCard
            data={form.dentalHistory}
            onChange={(patch) => patchForm({ dentalHistory: { ...form.dentalHistory, ...patch } })}
          />
          <ClinicalExamCard
            data={form.clinicalExam}
            onChange={(patch) => patchForm({ clinicalExam: { ...form.clinicalExam, ...patch } })}
          />
          <PainAssessmentCard
            data={form.painAssessment}
            onChange={(patch) => patchForm({ painAssessment: { ...form.painAssessment, ...patch } })}
          />
          <RiskSection
            data={form.risk}
            onChange={(patch) => patchForm({ risk: { ...form.risk, ...patch } })}
          />
          <ObservationsSection value={form.observations} onChange={(observations) => patchForm({ observations })} />
          <ConsentCard
            data={form.consent}
            onChange={(patch) => patchForm({ consent: { ...form.consent, ...patch } })}
          />
        </div>

        <div className="hidden xl:block print:hidden">
          <StickyPatientInfo
            patient={patient}
            riskLevel={form.risk.level}
            updatedAt={form.updatedAt}
            updatedBy={form.updatedBy}
          />
        </div>
      </div>

      <AnamnesisHistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} versions={form.versions} />
    </div>
  );
}
