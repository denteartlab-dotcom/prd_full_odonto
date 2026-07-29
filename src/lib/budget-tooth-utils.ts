import type { BudgetProcedure } from "./budget-types";

/** Extrai números de dentes de "11, 12, 18" / "11 12" / "11-12". */
export function parseToothNumbers(tooth?: string | null): number[] {
  if (!tooth?.trim()) return [];
  const found = tooth.match(/\d{1,2}/g) || [];
  const nums = found
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n) && n >= 11 && n <= 85);
  return [...new Set(nums)].sort((a, b) => a - b);
}

export function formatToothNumbers(teeth: number[]): string {
  return [...new Set(teeth)]
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b)
    .join(", ");
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
