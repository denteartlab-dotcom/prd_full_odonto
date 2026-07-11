"use client";

import type { WaitingPatient } from "@/lib/waiting-patients-mock";
import { ConsultationMinimizedBar } from "@/components/schedule/ConsultationMinimizedBar";
import { WaitingPatientsFloating } from "./controle/waiting-patients/WaitingPatientsFloating";

export function AgendaFloatingDock({
  onViewFullQueue,
  onStartAttendance,
  onCallPatient,
}: {
  onViewFullQueue: () => void;
  onStartAttendance?: (patient: WaitingPatient) => void;
  onCallPatient?: (patient: WaitingPatient) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-3">
      <ConsultationMinimizedBar />
      <WaitingPatientsFloating
        docked
        onViewFullQueue={onViewFullQueue}
        onStartAttendance={onStartAttendance}
        onCallPatient={onCallPatient}
      />
    </div>
  );
}
