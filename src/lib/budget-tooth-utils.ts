import type { BudgetProcedure } from "./budget-types";
import {
  LOWER_DECIDUOUS,
  LOWER_PERMANENT,
  UPPER_DECIDUOUS,
  UPPER_PERMANENT,
} from "./odontogram-constants";

/** Extrai números de dentes de "11, 12, 18" / "Sup" / "Todos". */
export function parseToothNumbers(tooth?: string | null): number[] {
  if (!tooth?.trim()) return [];
  const raw = tooth.trim();
  const norm = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const expanded: number[] = [];
  if (/\btodos\b/.test(norm) || norm === "todas") {
    expanded.push(...UPPER_PERMANENT, ...LOWER_PERMANENT);
  }
  if (/\bsup\b/.test(norm) && !/dec/.test(norm)) {
    expanded.push(...UPPER_PERMANENT);
  }
  if (/\binf\b/.test(norm) && !/dec/.test(norm)) {
    expanded.push(...LOWER_PERMANENT);
  }
  if (/sup.*dec|dec.*sup/.test(norm)) {
    expanded.push(...UPPER_DECIDUOUS);
  }
  if (/inf.*dec|dec.*inf/.test(norm)) {
    expanded.push(...LOWER_DECIDUOUS);
  }

  const found = raw.match(/\d{1,2}/g) || [];
  const nums = found
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n) && n >= 11 && n <= 85);

  return [...new Set([...expanded, ...nums])].sort((a, b) => a - b);
}

export function formatToothNumbers(teeth: number[]): string {
  const unique = [...new Set(teeth)]
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b);
  const summary = summarizeTeethForDisplay(unique);
  if (summary.compact && summary.badges.length) {
    return summary.badges.join(", ");
  }
  return unique.join(", ");
}

function includesAll(selected: Set<number>, arch: readonly number[]) {
  return arch.every((n) => selected.has(n));
}

/**
 * Resumo visual: Todos / Sup / Inf (ou chips individuais).
 * Não altera o armazenamento — só a exibição.
 */
export function summarizeTeethForDisplay(teeth: number[]): {
  badges: string[];
  compact: boolean;
} {
  const unique = [...new Set(teeth)].filter((n) => n > 0).sort((a, b) => a - b);
  if (!unique.length) return { badges: [], compact: true };

  const set = new Set(unique);
  const allUpper = includesAll(set, UPPER_PERMANENT);
  const allLower = includesAll(set, LOWER_PERMANENT);
  const allUpperDec = includesAll(set, UPPER_DECIDUOUS);
  const allLowerDec = includesAll(set, LOWER_DECIDUOUS);

  const badges: string[] = [];
  const covered = new Set<number>();

  if (allUpper && allLower) {
    badges.push("Todos");
    UPPER_PERMANENT.forEach((n) => covered.add(n));
    LOWER_PERMANENT.forEach((n) => covered.add(n));
  } else {
    if (allUpper) {
      badges.push("Sup");
      UPPER_PERMANENT.forEach((n) => covered.add(n));
    }
    if (allLower) {
      badges.push("Inf");
      LOWER_PERMANENT.forEach((n) => covered.add(n));
    }
  }

  if (allUpperDec) {
    badges.push("Sup dec.");
    UPPER_DECIDUOUS.forEach((n) => covered.add(n));
  }
  if (allLowerDec) {
    badges.push("Inf dec.");
    LOWER_DECIDUOUS.forEach((n) => covered.add(n));
  }

  const rest = unique.filter((n) => !covered.has(n));
  if (badges.length && !rest.length) {
    return { badges, compact: true };
  }

  return {
    badges: [...badges, ...rest.map(String)],
    compact: badges.length > 0 && rest.length === 0,
  };
}

export function hasProcedureFace(face?: string | null) {
  return Boolean(face?.trim());
}

/** Linha agrupável: mesmo procedimento e sem face. */
export function isSameUngroupedProcedure(
  row: BudgetProcedure,
  code: string,
  name: string
) {
  return (
    row.code === code &&
    row.name === name &&
    !hasProcedureFace(row.face)
  );
}
