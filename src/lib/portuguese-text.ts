/**
 * Corrige textos CID-10: encoding (mojibake) + ortografia do português atual.
 */

/** UTF-8 lido como Latin-1 vira "CÃ³lera"; isto restaura "Cólera". */
export function fixUtf8Mojibake(value: string) {
  if (!value) return value;
  if (!/[ÃÂ]/.test(value) && !/Ã./.test(value)) return value;
  try {
    const fixed = Buffer.from(value, "latin1").toString("utf8");
    if (fixed.includes("\uFFFD")) return value;
    // Só aceita se melhorou (menos sequências típicas de mojibake)
    const worse =
      (fixed.match(/Ã./g) || []).length > (value.match(/Ã./g) || []).length;
    if (worse) return value;
    return fixed;
  } catch {
    return value;
  }
}

/** Acordo Ortográfico: remove acentos em ditongos como "éia" → "eia". */
const ORTHOGRAPHY_REPLACEMENTS: Array<[RegExp, string]> = [
  [/([Dd])iarréia/g, "$1iarreia"],
  [/([Dd])IARRÉIA/g, "$1IARREIA"],
  [/éia\b/g, "eia"],
  [/ÉIA\b/g, "EIA"],
  [/éi\b/g, "ei"],
  [/ói\b/g, "oi"],
  [/ÓI\b/g, "OI"],
  [/qü/gi, "qu"],
  [/gü/gi, "gu"],
];

export function applyPortugueseOrthography(value: string) {
  let out = value;
  for (const [pattern, replacement] of ORTHOGRAPHY_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

/** Espaçamento e pontuação básicos. */
export function tidyPortuguesePunctuation(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([,.;:!?])(?!\s|$)/g, "$1 ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s+-\s+/g, " — ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function normalizeCidDescription(value: string) {
  return tidyPortuguesePunctuation(
    applyPortugueseOrthography(fixUtf8Mojibake(value || ""))
  );
}
