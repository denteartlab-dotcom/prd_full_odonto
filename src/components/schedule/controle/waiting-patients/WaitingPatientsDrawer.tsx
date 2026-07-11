"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import type { WaitingPatient, WaitingPatientHistory } from "@/lib/waiting-patients-mock";
import { WaitingPatientCard, WaitingPatientsEmpty, WaitingPatientsError, WaitingPatientsLoading } from "./WaitingPatientCard";
import { WaitingPatientsFooter } from "./WaitingPatientsFooter";
import { WaitingPatientsHeader } from "./WaitingPatientsHeader";
import { WaitingPatientsTabs, type WaitingPatientsTab } from "./WaitingPatientsTabs";

export function WaitingPatientsDrawer({
  open,
  activeTab,
  waiting,
  history,
  loading,
  error,
  onClose,
  onTabChange,
  onStart,
  onCall,
  onRetry,
  onViewAll,
}: {
  open: boolean;
  activeTab: WaitingPatientsTab;
  waiting: WaitingPatient[];
  history: WaitingPatientHistory[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onTabChange: (tab: WaitingPatientsTab) => void;
  onStart: (id: string) => void;
  onCall: (id: string) => void;
  onRetry: () => void;
  onViewAll: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const waitingCount = waiting.length;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[80] bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Pacientes te aguardando"
        className={cn(
          "fixed inset-y-0 right-0 z-[85] flex w-full flex-col bg-white shadow-2xl",
          "transition-transform duration-300 ease-out",
          "sm:max-w-[340px] lg:max-w-[380px]",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <WaitingPatientsHeader count={waitingCount} onClose={onClose} />

        <WaitingPatientsTabs
          active={activeTab}
          waitingCount={waiting.length}
          historyCount={history.length}
          onChange={onTabChange}
        />

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#f8fafc] p-4">
          {loading ? (
            <WaitingPatientsLoading />
          ) : error ? (
            <WaitingPatientsError message={error} onRetry={onRetry} />
          ) : activeTab === "espera" ? (
            waiting.length === 0 ? (
              <WaitingPatientsEmpty tab="espera" />
            ) : (
              <div className="space-y-3">
                {waiting.map((patient) => (
                  <WaitingPatientCard
                    key={patient.id}
                    patient={patient}
                    onStart={() => onStart(patient.id)}
                    onCall={() => onCall(patient.id)}
                  />
                ))}
              </div>
            )
          ) : history.length === 0 ? (
            <WaitingPatientsEmpty tab="historico" />
          ) : (
            <div className="space-y-3">
              {history.map((patient) => (
                <WaitingPatientCard key={patient.id} patient={patient} isHistory />
              ))}
            </div>
          )}
        </div>

        <WaitingPatientsFooter onViewAll={onViewAll} />
      </aside>
    </>
  );
}
