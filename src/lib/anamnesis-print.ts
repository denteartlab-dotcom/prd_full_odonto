import type { DentalAnamnesis } from "./anamnesis-types";

const PRINT_PREFIX = "odonto-anamnesis-print:";

export type AnamnesisPrintPayload = {
  data: DentalAnamnesis;
  clinicName?: string;
  savedAt: number;
};

export function stashAnamnesisForPrint(
  patientId: string,
  data: DentalAnamnesis,
  clinicName?: string
) {
  if (typeof window === "undefined") return;
  const payload: AnamnesisPrintPayload = { data, clinicName, savedAt: Date.now() };
  sessionStorage.setItem(`${PRINT_PREFIX}${patientId}`, JSON.stringify(payload));
}

export function loadAnamnesisPrint(patientId: string): AnamnesisPrintPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${PRINT_PREFIX}${patientId}`);
    if (!raw) return null;
    return JSON.parse(raw) as AnamnesisPrintPayload;
  } catch {
    return null;
  }
}

export function triStateLabel(v: string) {
  if (v === "sim") return "Sim";
  if (v === "nao") return "Não";
  if (v === "nao_sei") return "Não sei";
  return "—";
}

export function painTypeLabel(t: string) {
  const map: Record<string, string> = {
    latejante: "Latejante",
    pulsatil: "Pulsátil",
    continua: "Contínua",
    aguda: "Aguda",
    cronica: "Crônica",
  };
  return map[t] || "—";
}

export function riskLabel(level: string) {
  if (level === "baixo") return "Baixo (ASA I)";
  if (level === "medio") return "Médio (ASA II)";
  if (level === "alto") return "Alto (ASA III+)";
  return level;
}

export function formatPrintDate(iso: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}
