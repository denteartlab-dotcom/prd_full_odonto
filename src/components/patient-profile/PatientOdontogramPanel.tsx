"use client";

import { useMemo, useState } from "react";
import { buildStatusMap, OdontogramChart, upsertOdontogramStatuses } from "@/components/odontogram";
import type { PatientProfile } from "@/lib/patient-profile-types";
import type { ToothStatus } from "@/lib/patient-profile-types";

export function PatientOdontogramPanel({
  patient,
  onUpdate,
  interactive = true,
  title,
  showLegend = true,
  compact = false,
  className,
}: {
  patient: PatientProfile;
  onUpdate?: (patch: Partial<PatientProfile>) => void;
  interactive?: boolean;
  title?: string;
  showLegend?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const statusMap = useMemo(() => buildStatusMap(patient.odontogram), [patient.odontogram]);

  const toggleTooth = (number: number) => {
    if (!interactive) return;
    setSelected((prev) =>
      prev.includes(number) ? prev.filter((n) => n !== number) : [...prev, number]
    );
  };

  const handleStatusChange = (numbers: number[], status: ToothStatus) => {
    if (!onUpdate) return;
    onUpdate({
      odontogram: upsertOdontogramStatuses(patient.odontogram, numbers, status),
    });
    setSelected([]);
  };

  return (
    <OdontogramChart
      title={title}
      statusByTooth={statusMap}
      selected={selected}
      onToggleTooth={toggleTooth}
      onStatusChange={onUpdate ? handleStatusChange : undefined}
      interactive={interactive}
      showLegend={showLegend}
      compact={compact}
      className={className}
    />
  );
}
