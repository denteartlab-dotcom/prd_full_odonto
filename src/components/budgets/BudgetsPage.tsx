"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePatients } from "@/contexts/patients-context";
import { useMounted } from "@/hooks/use-mounted";
import type {
  BudgetProcedure,
  BudgetTreatmentStep,
  DentalBudget,
  InstallmentPlanType,
  PaymentMethodType,
} from "@/lib/budget-types";
import {
  calcInstallmentPlan,
  calcProcedureFinal,
  computeFinancialSummary,
  createDefaultDentalBudgets,
  createEmptyBudget,
  dentalBudgetsToSimple,
  duplicateBudget,
  recalcBudget,
} from "@/lib/budget-mock";
import { openBudgetPrintTab, stashBudgetForPrint } from "@/lib/budget-print";
import { PatientProfileHeader } from "@/components/patient-profile/PatientProfileHeader";
import { BudgetDetailsPanel } from "./BudgetDetailsPanel";
import { BudgetFormDrawer } from "./BudgetFormDrawer";
import { BudgetHeader } from "./BudgetHeader";
import { BudgetPatientCard } from "./BudgetPatientCard";
import { BudgetSidebar } from "./BudgetSidebar";
import { BudgetSummaryCards } from "./BudgetSummaryCards";
import { BudgetsTable } from "./BudgetsTable";

type SaveState = "saved" | "dirty" | "saving";
type DrawerMode = "create" | "edit" | "view" | null;

function syncTreatmentPlan(
  procedures: BudgetProcedure[],
  dentist: string,
  existing: BudgetTreatmentStep[]
): BudgetTreatmentStep[] {
  return procedures.map((p, i) => {
    const prev = existing.find((s) => s.title === p.name);
    return {
      id: prev?.id ?? `ts-${p.id}`,
      order: i + 1,
      title: p.name,
      status: prev?.status ?? "pendente",
      plannedDate: prev?.plannedDate,
      professional: prev?.professional ?? dentist,
    };
  });
}

export function BudgetsPage({
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
  const [budgets, setBudgets] = useState<DentalBudget[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerBudget, setDrawerBudget] = useState<DentalBudget | null>(null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  const patient = useMemo(
    () => (mounted && hydrated ? getPatientById(patientId) : undefined),
    [mounted, hydrated, getPatientById, patientId]
  );

  useEffect(() => {
    if (!patient || initialized.current) return;
    const data = patient.dentalBudgets?.length
      ? patient.dentalBudgets
      : createDefaultDentalBudgets(parseInt(patient.id.replace(/\D/g, "") || "1", 10) || 1);
    setBudgets(data);
    setSelectedId(data[0]?.id ?? null);
    initialized.current = true;
  }, [patient]);

  const selectedBudget = useMemo(
    () => budgets.find((b) => b.id === selectedId) ?? null,
    [budgets, selectedId]
  );

  const summary = useMemo(() => computeFinancialSummary(budgets), [budgets]);

  const persist = useCallback(
    (next: DentalBudget[]) => {
      if (!patient) return;
      setSaveState("saving");
      updatePatient(patient.id, {
        dentalBudgets: next,
        budgets: dentalBudgetsToSimple(next),
      });
      setSaveState("saved");
    },
    [patient, updatePatient]
  );

  const scheduleAutoSave = useCallback(
    (next: DentalBudget[]) => {
      setSaveState("dirty");
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => persist(next), 1200);
    },
    [persist]
  );

  const updateBudgets = useCallback(
    (updater: (prev: DentalBudget[]) => DentalBudget[]) => {
      setBudgets((prev) => {
        const next = updater(prev);
        scheduleAutoSave(next);
        return next;
      });
    },
    [scheduleAutoSave]
  );

  const updateDrawerBudget = useCallback((patch: Partial<DentalBudget>) => {
    setDrawerBudget((prev) => {
      if (!prev) return prev;
      const merged = recalcBudget({ ...prev, ...patch });
      return merged;
    });
    setSaveState("dirty");
  }, []);

  const updateDrawerProcedure = useCallback(
    (id: string, patch: Partial<BudgetProcedure>) => {
      setDrawerBudget((prev) => {
        if (!prev) return prev;
        const procedures = prev.procedures.map((p) => {
          if (p.id !== id) return p;
          const updated = { ...p, ...patch };
          updated.finalValue = calcProcedureFinal(updated);
          return updated;
        });
        const treatmentPlan = syncTreatmentPlan(procedures, prev.dentist, prev.treatmentPlan);
        return recalcBudget({ ...prev, procedures, treatmentPlan });
      });
      setSaveState("dirty");
    },
    []
  );

  const addDrawerProcedure = useCallback((procedure: BudgetProcedure) => {
    setDrawerBudget((prev) => {
      if (!prev) return prev;
      const procedures = [...prev.procedures, procedure];
      const treatmentPlan = syncTreatmentPlan(procedures, prev.dentist, prev.treatmentPlan);
      return recalcBudget({ ...prev, procedures, treatmentPlan });
    });
    setSaveState("dirty");
  }, []);

  const removeDrawerProcedure = useCallback((id: string) => {
    setDrawerBudget((prev) => {
      if (!prev) return prev;
      const procedures = prev.procedures.filter((p) => p.id !== id);
      const treatmentPlan = syncTreatmentPlan(procedures, prev.dentist, prev.treatmentPlan);
      return recalcBudget({ ...prev, procedures, treatmentPlan });
    });
    setSaveState("dirty");
  }, []);

  const handleInstallmentChange = useCallback(
    (type: InstallmentPlanType, custom?: { installments: number; interestRate: number }) => {
      setDrawerBudget((prev) => {
        if (!prev) return prev;
        const installment = calcInstallmentPlan(
          prev.total - prev.downPayment,
          type,
          custom?.installments,
          custom?.interestRate
        );
        return recalcBudget({ ...prev, installment });
      });
      setSaveState("dirty");
    },
    []
  );

  const handlePaymentChange = useCallback((method: PaymentMethodType) => {
    updateDrawerBudget({ paymentMethod: method });
  }, [updateDrawerBudget]);

  const handleSignatureChange = useCallback(
    (patch: Partial<DentalBudget["signature"]>) => {
      setDrawerBudget((prev) => {
        if (!prev) return prev;
        const signature = { ...prev.signature, ...patch };
        const status = signature.agreed ? "aprovado" as const : prev.status;
        return recalcBudget({ ...prev, signature, status });
      });
      setSaveState("dirty");
    },
    []
  );

  const handleAddDocument = useCallback(() => {
    setDrawerBudget((prev) => {
      if (!prev) return prev;
      const doc = {
        id: `bd-${Date.now()}`,
        name: `Documento ${prev.documents.length + 1}`,
        type: "pdf" as const,
        date: new Date().toISOString().slice(0, 10),
      };
      return { ...prev, documents: [...prev.documents, doc] };
    });
    setSaveState("dirty");
  }, []);

  const openCreate = useCallback(() => {
    if (!patient) return;
    const seed = parseInt(patient.id.replace(/\D/g, "") || "1", 10) || 1;
    setDrawerBudget(createEmptyBudget(seed));
    setDrawerMode("create");
  }, [patient]);

  const openEdit = useCallback(
    (id: string) => {
      const b = budgets.find((x) => x.id === id);
      if (b) {
        setDrawerBudget(structuredClone(b));
        setDrawerMode("edit");
      }
    },
    [budgets]
  );

  const openView = useCallback(
    (id: string) => {
      const b = budgets.find((x) => x.id === id);
      if (b) {
        setDrawerBudget(structuredClone(b));
        setDrawerMode("view");
      }
    },
    [budgets]
  );

  const closeDrawer = useCallback(() => {
    setDrawerMode(null);
    setDrawerBudget(null);
  }, []);

  const saveDrawer = useCallback(() => {
    if (!drawerBudget) return;
    const saved = recalcBudget({
      ...drawerBudget,
      version: drawerMode === "create" ? 1 : drawerBudget.version + 1,
      history: [
        ...drawerBudget.history,
        {
          id: `bh-${Date.now()}`,
          type: drawerMode === "create" ? "criado" : "editado",
          date: new Date().toISOString(),
          user: userName,
        },
      ],
    });

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    setBudgets((prev) => {
      const next =
        drawerMode === "create"
          ? [...prev, saved]
          : prev.map((b) => (b.id === saved.id ? saved : b));
      setSelectedId(saved.id);
      persist(next);
      return next;
    });

    closeDrawer();
  }, [drawerBudget, drawerMode, userName, persist, closeDrawer]);

  const handleDuplicate = useCallback(
    (id?: string) => {
      const targetId = id ?? selectedId;
      if (!targetId) return;
      const source = budgets.find((b) => b.id === targetId);
      if (!source) return;
      const copy = duplicateBudget(source);
      updateBudgets((prev) => [...prev, copy]);
      setSelectedId(copy.id);
    },
    [budgets, selectedId, updateBudgets]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (!confirm("Excluir este orçamento?")) return;
      updateBudgets((prev) => {
        const next = prev.filter((b) => b.id !== id);
        setSelectedId(next[0]?.id ?? null);
        return next;
      });
    },
    [updateBudgets]
  );

  const openPrint = useCallback(
    (budgetId?: string) => {
      if (!patient) return;
      const id = budgetId ?? selectedId;
      if (!id) {
        alert("Selecione um orçamento para imprimir.");
        return;
      }
      const budget = budgets.find((b) => b.id === id);
      if (!budget) return;
      stashBudgetForPrint(patient.id, budget, {
        name: patient.name,
        cpf: patient.cpf,
        phone: patient.phone,
        email: patient.email,
        insurance: patient.insurance,
        financialResponsible: patient.financialResponsible,
      });
      openBudgetPrintTab(patient.id);
    },
    [patient, selectedId, budgets]
  );

  if (!mounted || !hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-400">
        Carregando orçamentos...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-600">Paciente não encontrado.</p>
        <Link href="/app/pacientes" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
          Voltar para pacientes
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <header className="mb-5">
        <p className="text-xs font-medium text-slate-400">
          <Link href="/app/pacientes" className="hover:text-indigo-600">
            Pacientes
          </Link>
          <span className="mx-1.5">›</span>
          <Link href={`/app/pacientes/${patient.id}`} className="hover:text-indigo-600">
            {patient.name}
          </Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-600">Orçamentos</span>
        </p>
      </header>

      <PatientProfileHeader patientName={patient.name} userName={userName} role={role} />

      <BudgetHeader
        saveState={saveState}
        onNew={openCreate}
        onDuplicate={() => handleDuplicate()}
        duplicateDisabled={!selectedId}
        onPrint={() => openPrint()}
        onExportPdf={() => openPrint()}
        onSendWhatsApp={() =>
          window.open(`https://wa.me/55${patient.phone.replace(/\D/g, "")}`, "_blank")
        }
        onSendEmail={() => window.open(`mailto:${patient.email}`, "_blank")}
      />

      <BudgetPatientCard patient={patient} />
      <BudgetSummaryCards summary={summary} />

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          <BudgetsTable
            budgets={budgets}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onView={openView}
            onEdit={openEdit}
            onDuplicate={(id) => handleDuplicate(id)}
            onDelete={handleDelete}
            onPrintPdf={openPrint}
          />

          {selectedBudget && <BudgetDetailsPanel budget={selectedBudget} />}
        </div>

        <BudgetSidebar patient={patient} budget={selectedBudget} />
      </div>

      <BudgetFormDrawer
        budget={drawerBudget}
        open={drawerMode !== null}
        mode={drawerMode === null ? "view" : drawerMode}
        onClose={closeDrawer}
        onSave={saveDrawer}
        onChange={updateDrawerBudget}
        onAddProcedure={addDrawerProcedure}
        onRemoveProcedure={removeDrawerProcedure}
        onUpdateProcedure={updateDrawerProcedure}
        onInstallmentChange={handleInstallmentChange}
        onPaymentChange={handlePaymentChange}
        onSignatureChange={handleSignatureChange}
        onAddDocument={handleAddDocument}
      />
    </div>
  );
}
