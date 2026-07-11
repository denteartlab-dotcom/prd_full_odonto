"use client";

import { useState } from "react";
import type { WaitingPatient } from "@/lib/waiting-patients-mock";
import { useWaitingPatients } from "@/contexts/waiting-patients-context";
import { WaitingPatientsButton } from "./WaitingPatientsButton";
import { WaitingPatientsDrawer } from "./WaitingPatientsDrawer";
import type { WaitingPatientsTab } from "./WaitingPatientsTabs";

export function WaitingPatientsFloating({
  onViewFullQueue,
  onStartAttendance,
  onCallPatient,
  docked = false,
}: {
  onViewFullQueue: () => void;
  onStartAttendance?: (patient: WaitingPatient) => void;
  onCallPatient?: (patient: WaitingPatient) => void;
  docked?: boolean;
}) {
  const { waiting, history, startAttendance, callPatient } = useWaitingPatients();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<WaitingPatientsTab>("espera");

  function toggleOpen() {
    setOpen((v) => !v);
  }

  function closeDrawer() {
    setOpen(false);
  }

  function handleStart(id: string) {
    const patient = startAttendance(id);
    if (!patient) return;
    onStartAttendance?.(patient);
    setActiveTab("historico");
  }

  function handleCall(id: string) {
    const patient = callPatient(id);
    if (patient) onCallPatient?.(patient);
  }

  function handleViewAll() {
    closeDrawer();
    onViewFullQueue();
  }

  return (
    <>
      <WaitingPatientsButton count={waiting.length} open={open} onClick={toggleOpen} docked={docked} />
      <WaitingPatientsDrawer
        open={open}
        activeTab={activeTab}
        waiting={waiting}
        history={history}
        loading={false}
        error={null}
        onClose={closeDrawer}
        onTabChange={setActiveTab}
        onStart={handleStart}
        onCall={handleCall}
        onRetry={() => undefined}
        onViewAll={handleViewAll}
      />
    </>
  );
}
