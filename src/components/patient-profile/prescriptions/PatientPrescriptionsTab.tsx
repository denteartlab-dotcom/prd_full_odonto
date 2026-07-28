"use client";

import type { PatientProfile } from "@/lib/patient-profile-types";
import { ReceituarioEletronico } from "./ReceituarioEletronico";

export function PatientPrescriptionsTab({
  patient,
  userName,
}: {
  patient: PatientProfile;
  userName?: string;
}) {
  return <ReceituarioEletronico patient={patient} userName={userName} />;
}
