"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PatientProfile } from "@/lib/patient-profile-types";
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
  getValidityInfo,
  patientSeedFromId,
  recalcBudget,
} from "@/lib/budget-mock";
import { openBudgetPrintTab, stashBudgetForPrint } from "@/lib/budget-print";
import { BudgetFormDrawer } from "@/components/budgets/BudgetFormDrawer";
import { BudgetSectionHeader } from "./BudgetSectionHeader";
import {
  BudgetFilters,
  DEFAULT_BUDGET_FILTERS,
  type BudgetFilterState,
} from "./BudgetFilters";
import { BudgetTabDetails } from "./BudgetTabDetails";
import { BudgetTabSidebar } from "./BudgetTabSidebar";
import { BudgetTabSummaryCards, BudgetSummaryCardsSkeleton } from "./BudgetTabSummaryCards";
import { BudgetTabTable } from "./BudgetTabTable";

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

function applyFilters(budgets: DentalBudget[], filters: BudgetFilterState): DentalBudget[] {
  const q = filters.search.trim().toLowerCase();
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let periodCutoff: Date | null = null;
  if (filters.period === "30d") periodCutoff = new Date(now.getTime() - 30 * 86400000);
  if (filters.period === "90d") periodCutoff = new Date(now.getTime() - 90 * 86400000);
  if (filters.period === "365d") periodCutoff = new Date(now.getTime() - 365 * 86400000);

  return budgets.filter((b) => {
    if (q) {
      const hay = `${b.number} ${b.dentist} ${b.procedures.map((p) => p.name).join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.dentist !== "todos" && b.dentist !== filters.dentist) return false;

    if (filters.status === "vencido") {
      if (!getValidityInfo(b.validityDate).expired && b.status !== "expirado") return false;
    } else if (filters.status !== "todos" && b.status !== filters.status) {
      return false;
    }

    if (periodCutoff) {
      const d = new Date(b.date + "T12:00:00");
      if (d < periodCutoff) return false;
    }

    return true;
  });
}

export function PatientBudgetsTab({
  patient,
  onUpdate,
}: {
  patient: PatientProfile;
  onUpdate: (patch: Partial<PatientProfile>) => void;
}) {
  const [budgets, setBudgets] = useState<DentalBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<BudgetFilterState>(DEFAULT_BUDGET_FILTERS);
  const [page, setPage] = useState(1);
  const [drawerBudget, setDrawerBudget] = useState<DentalBudget | null>(null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [toast, setToast] = useState<string | null>(null);
  const initialized = useRef(false);
  const pendingPersist = useRef(false);
  const patientIdRef = useRef(patient.id);

  useEffect(() => {
    if (patientIdRef.current !== patient.id) {
      patientIdRef.current = patient.id;
      initialized.current = false;
      pendingPersist.current = false;
    }
    if (initialized.current) return;
    const data =
      patient.dentalBudgets?.length
        ? patient.dentalBudgets
        : createDefaultDentalBudgets(patientSeedFromId(patient.id));
    setBudgets(data);
    setSelectedId(data[0]?.id ?? null);
    initialized.current = true;
    setLoading(false);
  }, [patient]);

  useEffect(() => {
    if (!pendingPersist.current || loading) return;
    pendingPersist.current = false;
    onUpdate({
      dentalBudgets: budgets,
      budgets: dentalBudgetsToSimple(budgets),
    });
  }, [budgets, loading, onUpdate]);

  const filtered = useMemo(() => applyFilters(budgets, filters), [budgets, filters]);
  const summary = useMemo(() => computeFinancialSummary(budgets), [budgets]);
  const selectedBudget = useMemo(
    () => budgets.find((b) => b.id === selectedId) ?? null,
    [budgets, selectedId]
  );

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const updateBudgets = useCallback((updater: (prev: DentalBudget[]) => DentalBudget[]) => {
    setBudgets(updater);
    pendingPersist.current = true;
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const openPrint = useCallback(
    (budgetId?: string) => {
      const id = budgetId ?? selectedId;
      if (!id) {
        showToast("Selecione um orçamento para imprimir.");
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

  const openCreate = () => {
    setDrawerBudget(createEmptyBudget(patientSeedFromId(patient.id)));
    setDrawerMode("create");
  };

  const openEdit = (id: string) => {
    const b = budgets.find((x) => x.id === id);
    if (b) {
      setDrawerBudget(structuredClone(b));
      setDrawerMode("edit");
    }
  };

  const openView = (id: string) => {
    const b = budgets.find((x) => x.id === id);
    if (b) {
      setDrawerBudget(structuredClone(b));
      setDrawerMode("view");
    }
  };

  const closeDrawer = () => {
    setDrawerMode(null);
    setDrawerBudget(null);
  };

  const handleDuplicate = (id?: string) => {
    const targetId = id ?? selectedId;
    if (!targetId) return;
    const source = budgets.find((b) => b.id === targetId);
    if (!source) return;
    const copy = duplicateBudget(source);
    updateBudgets((prev) => [...prev, copy]);
    setSelectedId(copy.id);
    showToast(`Orçamento ${copy.number} criado por duplicação.`);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Excluir este orçamento?")) return;
    const next = budgets.filter((b) => b.id !== id);
    setSelectedId(next[0]?.id ?? null);
    updateBudgets(() => next);
  };

  const updateDrawerBudget = (patch: Partial<DentalBudget>) => {
    setDrawerBudget((prev) => (prev ? recalcBudget({ ...prev, ...patch }) : prev));
  };

  const updateDrawerProcedure = (procId: string, patch: Partial<BudgetProcedure>) => {
    setDrawerBudget((prev) => {
      if (!prev) return prev;
      const procedures = prev.procedures.map((p) => {
        if (p.id !== procId) return p;
        const updated = { ...p, ...patch };
        updated.finalValue = calcProcedureFinal(updated);
        return updated;
      });
      return recalcBudget({
        ...prev,
        procedures,
        treatmentPlan: syncTreatmentPlan(procedures, prev.dentist, prev.treatmentPlan),
      });
    });
  };

  const saveDrawer = () => {
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
          user: patient.name,
        },
      ],
    });

    updateBudgets((prev) =>
      drawerMode === "create"
        ? [...prev, saved]
        : prev.map((b) => (b.id === saved.id ? saved : b))
    );
    setSelectedId(saved.id);
    closeDrawer();
    showToast("Orçamento salvo com sucesso.");
  };

  return (
    <div className="relative">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      <BudgetSectionHeader
        patientId={patient.id}
        onNew={openCreate}
        onDuplicate={() => handleDuplicate()}
        duplicateDisabled={!selectedId}
        onPrint={() => openPrint()}
        onExportPdf={() => openPrint()}
      />

      {loading ? (
        <BudgetSummaryCardsSkeleton />
      ) : (
        <BudgetTabSummaryCards summary={summary} />
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <BudgetFilters filters={filters} onChange={(p) => setFilters((f) => ({ ...f, ...p }))} />

          <BudgetTabTable
            budgets={filtered}
            selectedId={selectedId}
            page={page}
            onPageChange={setPage}
            onSelect={setSelectedId}
            onView={openView}
            onEdit={openEdit}
            onDuplicate={handleDuplicate}
            onPdf={openPrint}
            onDelete={handleDelete}
            loading={loading}
          />

          <BudgetTabDetails budget={selectedBudget} />
        </div>

        <BudgetTabSidebar
          patient={patient}
          summary={summary}
          onSimulate={showToast}
        />
      </div>

      <BudgetFormDrawer
        budget={drawerBudget}
        open={drawerMode !== null}
        mode={drawerMode === null ? "view" : drawerMode}
        onClose={closeDrawer}
        onSave={saveDrawer}
        onChange={updateDrawerBudget}
        onAddProcedure={(p) =>
          setDrawerBudget((prev) => {
            if (!prev) return prev;
            const procedures = [...prev.procedures, p];
            return recalcBudget({
              ...prev,
              procedures,
              treatmentPlan: syncTreatmentPlan(procedures, prev.dentist, prev.treatmentPlan),
            });
          })
        }
        onRemoveProcedure={(procId) =>
          setDrawerBudget((prev) => {
            if (!prev) return prev;
            const procedures = prev.procedures.filter((p) => p.id !== procId);
            return recalcBudget({
              ...prev,
              procedures,
              treatmentPlan: syncTreatmentPlan(procedures, prev.dentist, prev.treatmentPlan),
            });
          })
        }
        onUpdateProcedure={updateDrawerProcedure}
        onInstallmentChange={(type, custom) =>
          setDrawerBudget((prev) => {
            if (!prev) return prev;
            const installment = calcInstallmentPlan(
              prev.total - prev.downPayment,
              type,
              custom?.installments,
              custom?.interestRate
            );
            return recalcBudget({ ...prev, installment });
          })
        }
        onPaymentChange={(method: PaymentMethodType) => updateDrawerBudget({ paymentMethod: method })}
        onSignatureChange={(patch) =>
          setDrawerBudget((prev) =>
            prev
              ? recalcBudget({
                  ...prev,
                  signature: { ...prev.signature, ...patch },
                  status: patch.agreed ? "aprovado" : prev.status,
                })
              : prev
          )
        }
        onAddDocument={() =>
          setDrawerBudget((prev) =>
            prev
              ? {
                  ...prev,
                  documents: [
                    ...prev.documents,
                    {
                      id: `bd-${Date.now()}`,
                      name: `Documento ${prev.documents.length + 1}`,
                      type: "pdf" as const,
                      date: new Date().toISOString().slice(0, 10),
                    },
                  ],
                }
              : prev
          )
        }
      />
    </div>
  );
}
