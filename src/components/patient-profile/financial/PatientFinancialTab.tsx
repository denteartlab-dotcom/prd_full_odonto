"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PatientProfile } from "@/lib/patient-profile-types";
import type { DentalBudget } from "@/lib/budget-types";
import type { FinancialCharge, PatientFinancialData } from "@/lib/financial-types";
import {
  cancelCharge,
  computeFinancialKpis,
  generateAllChargesFromBudgets,
  normalizeChargeStatus,
  receivePayment,
  syncBudgetAfterPayment,
  syncFinancialFromBudgets,
} from "@/lib/financial-mock";
import { createDefaultDentalBudgets, dentalBudgetsToSimple, patientSeedFromId } from "@/lib/budget-mock";
import { FinancialCards } from "./FinancialCards";
import {
  DEFAULT_FINANCIAL_FILTERS,
  FinancialFilters,
  type FinancialFilterState,
} from "./FinancialFilters";
import { FinancialDrawer } from "./FinancialDrawer";
import { FinancialModals, type FinancialModalType } from "./FinancialModals";
import { FinancialSidebar } from "./FinancialSidebar";
import { FinancialTimeline } from "./FinancialTimeline";
import { PaymentHistoryTable, ReceivableTable } from "./ReceivableTable";

type SubTab = "receber" | "pagamentos";

function applyChargeFilters(charges: FinancialCharge[], filters: FinancialFilterState) {
  const q = filters.search.trim().toLowerCase();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  let cutoff: Date | null = null;
  if (filters.period === "30d") cutoff = new Date(now.getTime() - 30 * 86400000);
  if (filters.period === "90d") cutoff = new Date(now.getTime() - 90 * 86400000);
  if (filters.period === "365d") cutoff = new Date(now.getTime() - 365 * 86400000);

  return charges.map((c) => ({ ...c, status: normalizeChargeStatus(c) })).filter((c) => {
    if (q) {
      const hay = `${c.title} ${c.budgetNumber} ${c.procedure}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.status !== "todos" && c.status !== filters.status) return false;
    if (filters.paymentMethod !== "todos" && c.paymentMethod !== filters.paymentMethod) return false;
    if (filters.type === "parcela" && c.installmentTotal <= 1) return false;
    if (filters.type === "avista" && c.installmentTotal > 1) return false;
    if (cutoff) {
      const d = new Date(c.dueDate + "T12:00:00");
      if (d < cutoff) return false;
    }
    return true;
  });
}

export function PatientFinancialTab({
  patient,
  onUpdate,
  userName = "Sistema",
}: {
  patient: PatientProfile;
  onUpdate: (patch: Partial<PatientProfile>) => void;
  userName?: string;
}) {
  const [budgets, setBudgets] = useState<DentalBudget[]>([]);
  const [financial, setFinancial] = useState<PatientFinancialData>({
    charges: [],
    payments: [],
    timeline: [],
  });
  const [subTab, setSubTab] = useState<SubTab>("receber");
  const [filters, setFilters] = useState<FinancialFilterState>(DEFAULT_FINANCIAL_FILTERS);
  const [selectedChargeId, setSelectedChargeId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modal, setModal] = useState<FinancialModalType>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

    const seed = patientSeedFromId(patient.id);
    const b = patient.dentalBudgets?.length
      ? patient.dentalBudgets
      : createDefaultDentalBudgets(seed);
    const f = patient.financial ?? syncFinancialFromBudgets(b);

    setBudgets(b);
    setFinancial(f);
    setSelectedChargeId(f.charges[0]?.id ?? null);
    initialized.current = true;
    setLoading(false);
  }, [patient]);

  useEffect(() => {
    if (!pendingPersist.current || loading) return;
    pendingPersist.current = false;
    onUpdate({
      financial,
      dentalBudgets: budgets,
      budgets: dentalBudgetsToSimple(budgets),
    });
  }, [financial, budgets, loading, onUpdate]);

  const persistAll = useCallback(
    (nextFinancial: PatientFinancialData, nextBudgets: DentalBudget[]) => {
      setFinancial(nextFinancial);
      setBudgets(nextBudgets);
      pendingPersist.current = true;
    },
    []
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const filteredCharges = useMemo(
    () => applyChargeFilters(financial.charges, filters),
    [financial.charges, filters]
  );

  const kpi = useMemo(
    () => computeFinancialKpis(financial, budgets),
    [financial, budgets]
  );

  const linkedBudgets = useMemo(
    () => budgets.filter((b) => b.status === "aprovado" || b.status === "parcial"),
    [budgets]
  );

  const selectedCharge = useMemo(
    () => financial.charges.find((c) => c.id === selectedChargeId) ?? null,
    [financial.charges, selectedChargeId]
  );

  const openCharge = (id: string) => {
    setSelectedChargeId(id);
    setDrawerOpen(true);
  };

  const handleReceive = (chargeId: string) => {
    const nextFinancial = receivePayment(financial, chargeId, userName);
    const nextBudgets = syncBudgetAfterPayment(budgets, nextFinancial);
    persistAll(nextFinancial, nextBudgets);
    showToast("Pagamento registrado com sucesso.");
  };

  const handleGenerateCharges = () => {
    const nextFinancial = generateAllChargesFromBudgets(financial, budgets, userName);
    persistAll(nextFinancial, budgets);
    showToast("Cobranças geradas a partir dos orçamentos aprovados.");
  };

  const handleModalConfirm = () => {
    if (modal === "new_charge") {
      handleGenerateCharges();
    } else if (modal === "cancel" && selectedChargeId) {
      const nextFinancial = cancelCharge(financial, selectedChargeId, userName);
      persistAll(nextFinancial, budgets);
      showToast("Cobrança cancelada.");
    } else if (modal === "receive" && selectedChargeId) {
      handleReceive(selectedChargeId);
    } else if (modal === "pix" && selectedChargeId) {
      showToast("PIX emitido (simulação).");
      const event = {
        id: `tl-pix-${Date.now()}`,
        type: "pix_emitido" as const,
        date: new Date().toISOString(),
        user: userName,
        chargeId: selectedChargeId,
      };
      persistAll(
        { ...financial, timeline: [event, ...financial.timeline] },
        budgets
      );
    } else if (modal === "boleto" && selectedChargeId) {
      showToast("Boleto emitido (simulação).");
      const event = {
        id: `tl-bol-${Date.now()}`,
        type: "boleto_emitido" as const,
        date: new Date().toISOString(),
        user: userName,
        chargeId: selectedChargeId,
      };
      persistAll(
        { ...financial, timeline: [event, ...financial.timeline] },
        budgets
      );
    }
    setModal(null);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "nova_cobranca":
        setModal("new_charge");
        break;
      case "receber":
        if (selectedChargeId) setModal("receive");
        else showToast("Selecione um título na tabela.");
        break;
      case "pix":
        if (selectedChargeId) setModal("pix");
        else showToast("Selecione um título.");
        break;
      case "boleto":
        if (selectedChargeId) setModal("boleto");
        else showToast("Selecione um título.");
        break;
      case "whatsapp":
        window.open(`https://wa.me/55${patient.phone.replace(/\D/g, "")}`, "_blank");
        break;
      case "email":
        window.open(`mailto:${patient.email}`, "_blank");
        break;
      case "recibo":
        showToast("Recibo gerado (simulação).");
        break;
      case "cancelar":
        if (selectedChargeId) setModal("cancel");
        else showToast("Selecione um título.");
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Financeiro</h2>
          <p className="mt-1 text-sm text-slate-500">
            Centro financeiro do paciente — integrado aos orçamentos aprovados.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setModal("new_charge")}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Gerar cobrança
          </button>
          <Link
            href={`/app/pacientes/${patient.id}/orcamentos`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4" />
            Ver orçamentos
          </Link>
        </div>
      </div>

      {!loading && <FinancialCards summary={kpi} />}

      <div className="mb-4 flex gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1 w-fit">
        {(
          [
            { id: "receber" as const, label: "Contas a receber" },
            { id: "pagamentos" as const, label: "Pagamentos realizados" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition",
              subTab === t.id
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          {subTab === "receber" ? (
            <>
              <FinancialFilters
                filters={filters}
                onChange={(p) => setFilters((f) => ({ ...f, ...p }))}
              />
              <ReceivableTable
                charges={filteredCharges}
                selectedId={selectedChargeId}
                onSelect={setSelectedChargeId}
                onView={openCharge}
                onEdit={(id) => {
                  setSelectedChargeId(id);
                  setModal("edit");
                }}
                onReceive={(id) => {
                  setSelectedChargeId(id);
                  setModal("receive");
                }}
                onPix={(id) => {
                  setSelectedChargeId(id);
                  setModal("pix");
                }}
                onBoleto={(id) => {
                  setSelectedChargeId(id);
                  setModal("boleto");
                }}
                onDuplicate={() => showToast("Título duplicado (simulação).")}
                onCancel={(id) => {
                  setSelectedChargeId(id);
                  setModal("cancel");
                }}
              />
            </>
          ) : (
            <PaymentHistoryTable payments={financial.payments} />
          )}

          <div className="mt-5">
            <FinancialTimeline events={financial.timeline} />
          </div>
        </div>

        <FinancialSidebar
          patientId={patient.id}
          summary={kpi}
          linkedBudgets={linkedBudgets}
          onQuickAction={handleQuickAction}
        />
      </div>

      <FinancialDrawer
        charge={selectedCharge}
        patientName={patient.name}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onReceive={() => selectedChargeId && handleReceive(selectedChargeId)}
        onEdit={() => setModal("edit")}
        onCancel={() => selectedChargeId && setModal("cancel")}
        onPix={() => setModal("pix")}
        onBoleto={() => setModal("boleto")}
      />

      <FinancialModals
        type={modal}
        charge={selectedCharge}
        onClose={() => setModal(null)}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
}
