import {
  DENTAL_PROCEDURES_CATALOG,
  POPULAR_PROCEDURE_IDS,
  type DentalProcedureCatalogItem,
} from "./dental-procedures-catalog";
import type { ProcedureCatalogItem } from "./budget-types";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function scoreItem(item: DentalProcedureCatalogItem, q: string): number {
  const name = normalize(item.name);
  const code = normalize(item.code);
  const category = normalize(item.category);
  const aliases = (item.aliases ?? []).map(normalize);

  if (code === q || name === q) return 100;
  if (code.startsWith(q)) return 90;
  if (name.startsWith(q)) return 85;
  if (aliases.some((a) => a === q || a.startsWith(q))) return 80;
  if (name.includes(q)) return 70;
  if (aliases.some((a) => a.includes(q))) return 65;
  if (category.includes(q)) return 40;
  if (code.includes(q)) return 35;
  return 0;
}

export function toProcedureCatalogItem(
  item: DentalProcedureCatalogItem
): ProcedureCatalogItem {
  return {
    id: item.id,
    code: item.code,
    name: item.name,
    category: item.category,
    price: item.price,
    estimatedMinutes: item.estimatedMinutes,
    source: "local",
  };
}

export function searchDentalProcedures(
  query: string,
  limit = 12
): ProcedureCatalogItem[] {
  const q = normalize(query);
  const capped = Math.min(Math.max(limit, 1), 40);

  if (!q) {
    const popular = POPULAR_PROCEDURE_IDS.map((id) =>
      DENTAL_PROCEDURES_CATALOG.find((p) => p.id === id)
    ).filter(Boolean) as DentalProcedureCatalogItem[];
    return popular.slice(0, capped).map(toProcedureCatalogItem);
  }

  return DENTAL_PROCEDURES_CATALOG.map((item) => ({
    item,
    score: scoreItem(item, q),
  }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name, "pt-BR"))
    .slice(0, capped)
    .map((r) => toProcedureCatalogItem(r.item));
}

/** Melhor score da busca local (0–100). */
export function bestLocalProcedureScore(query: string): number {
  const q = normalize(query);
  if (!q) return 0;
  let best = 0;
  for (const item of DENTAL_PROCEDURES_CATALOG) {
    best = Math.max(best, scoreItem(item, q));
  }
  return best;
}

export function countDentalProcedures() {
  return DENTAL_PROCEDURES_CATALOG.length;
}
