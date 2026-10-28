import { BRAZIL_TZ } from "@/lib/date-range";

export type PrescriptionPeriod =
  | "todos"
  | "hoje"
  | "7d"
  | "mes"
  | "ano"
  | "personalizado";

export type PeriodBounds = {
  from: string | null;
  to: string | null;
  /** Quando o intervalo personalizado ainda não pode ser aplicado. */
  pendingMessage?: string;
};

export type PatientOption = {
  id: string;
  name: string;
  count: number;
};

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

/** Dia civil em Brasília, no formato YYYY-MM-DD. */
export function brasiliaDateKey(value: Date | string) {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BRAZIL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  if (!year || !month || !day) return "";
  return `${year}-${month}-${day}`;
}

export function addCalendarDays(key: string, days: number) {
  const [y, m, d] = key.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  utc.setUTCDate(utc.getUTCDate() + days);
  const year = utc.getUTCFullYear();
  const month = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const day = String(utc.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function periodBounds(
  period: PrescriptionPeriod,
  custom: { from: string; to: string },
  now = new Date()
): PeriodBounds {
  if (period === "todos") return { from: null, to: null };

  const today = brasiliaDateKey(now);
  if (!today) return { from: null, to: null };

  if (period === "hoje") return { from: today, to: today };

  if (period === "7d") return { from: addCalendarDays(today, -6), to: today };

  if (period === "mes") {
    const [year, month] = today.split("-").map(Number);
    const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return {
      from: `${today.slice(0, 7)}-01`,
      to: `${today.slice(0, 7)}-${String(last).padStart(2, "0")}`,
    };
  }

  if (period === "ano") {
    const year = today.slice(0, 4);
    return { from: `${year}-01-01`, to: `${year}-12-31` };
  }

  const from = custom.from.trim();
  const to = custom.to.trim();
  if (!from || !to) {
    return {
      from: null,
      to: null,
      pendingMessage: "Informe a data inicial e a final.",
    };
  }
  if (!DATE_KEY.test(from) || !DATE_KEY.test(to)) {
    return { from: null, to: null, pendingMessage: "Use datas válidas." };
  }
  if (from > to) {
    return {
      from: null,
      to: null,
      pendingMessage: "A data inicial não pode ser maior que a final.",
    };
  }
  return { from, to };
}

export function formatPeriodLabel(bounds: PeriodBounds, period: PrescriptionPeriod) {
  if (period === "todos") return "Todo o período";
  if (!bounds.from || !bounds.to) return "";
  const fmt = (key: string) => {
    const [year, month, day] = key.split("-");
    return `${day}/${month}/${year}`;
  };
  if (bounds.from === bounds.to) return fmt(bounds.from);
  return `${fmt(bounds.from)} — ${fmt(bounds.to)}`;
}

export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function patientsFromPrescriptions(
  items: Array<{ patientId: string; patientName: string }>
): PatientOption[] {
  const map = new Map<string, PatientOption>();
  for (const item of items) {
    const current = map.get(item.patientId);
    if (current) current.count += 1;
    else {
      map.set(item.patientId, {
        id: item.patientId,
        name: item.patientName,
        count: 1,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

/** Sugestões do combobox. A lista de receitas só muda depois da seleção. */
export function matchPatients(patients: PatientOption[], query: string, limit = 8) {
  const q = normalizeSearch(query);
  if (!q) return patients.slice(0, limit);
  return patients.filter((p) => normalizeSearch(p.name).includes(q)).slice(0, limit);
}

export function filterPrescriptions<T extends { patientId: string; createdAt: string }>(
  items: T[],
  opts: { patientId: string | null; bounds: PeriodBounds }
) {
  return items.filter((item) => {
    if (opts.patientId && item.patientId !== opts.patientId) return false;
    if (!opts.bounds.from || !opts.bounds.to) return true;
    const key = brasiliaDateKey(item.createdAt);
    if (!key) return false;
    return key >= opts.bounds.from && key <= opts.bounds.to;
  });
}

export function prescriptionLineCount(content: string) {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean).length;
}

export function resultLabel(count: number, patientName: string | null, rangeLabel: string) {
  const noun = count === 1 ? "receita" : "receitas";
  const who = patientName ? ` de ${patientName}` : "";
  const when = rangeLabel ? ` · ${rangeLabel}` : "";
  return `${count} ${noun}${who}${when}`;
}
