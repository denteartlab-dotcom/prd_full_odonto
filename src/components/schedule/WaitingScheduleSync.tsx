"use client";

import { useEffect, useMemo } from "react";
import { useScheduleOptional } from "@/contexts/schedule-context";
import { useWaitingPatientsOptional } from "@/contexts/waiting-patients-context";

/** Remove da fila pacientes com consulta ativa (ex.: iniciada pelo card da agenda). */
export function WaitingScheduleSync() {
  const schedule = useScheduleOptional();
  const waiting = useWaitingPatientsOptional();

  const activeKey = useMemo(
    () => schedule?.activeConsultations.map((c) => c.id).join(",") ?? "",
    [schedule?.activeConsultations]
  );

  useEffect(() => {
    if (!schedule || !waiting || !activeKey) return;
    waiting.syncWithActiveConsultations(
      schedule.activeConsultations.map((c) => ({ id: c.id, patient: c.patient }))
    );
  }, [activeKey, schedule, waiting]);

  return null;
}
