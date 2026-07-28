import type { ReceituarioLine, ReceituarioTemplate } from "@/lib/receituario-types";
import { RECEITUARIO_TEMPLATES } from "@/lib/receituario-types";

const CUSTOM_KEY = "odonto-receituario-custom-templates";
const HIDDEN_KEY = "odonto-receituario-hidden-templates";

export type StoredReceituarioTemplate = ReceituarioTemplate & {
  custom: boolean;
  lines?: ReceituarioLine[];
  createdAt?: string;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

export function listCustomTemplates(): StoredReceituarioTemplate[] {
  const list = readJson<StoredReceituarioTemplate[]>(CUSTOM_KEY, []);
  return Array.isArray(list) ? list : [];
}

export function listHiddenSystemTemplateIds(): string[] {
  const list = readJson<string[]>(HIDDEN_KEY, []);
  return Array.isArray(list) ? list : [];
}

export function listReceituarioTemplates(): StoredReceituarioTemplate[] {
  const hidden = new Set(listHiddenSystemTemplateIds());
  const system = RECEITUARIO_TEMPLATES.filter((t) => !hidden.has(t.id)).map((t) => ({
    ...t,
    custom: false,
  }));
  const custom = listCustomTemplates().map((t) => ({ ...t, custom: true }));
  return [...custom, ...system];
}

export function saveCustomTemplate(input: {
  name: string;
  description: string;
  generalNotes?: string;
  lines: ReceituarioLine[];
}): StoredReceituarioTemplate {
  const template: StoredReceituarioTemplate = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: input.name.trim(),
    description: input.description.trim() || "Modelo personalizado",
    medicineIds: input.lines.map((l) => l.medicineId).filter(Boolean),
    generalNotes: input.generalNotes?.trim() || undefined,
    custom: true,
    lines: input.lines.map((l) => ({
      ...l,
      id: `line-tpl-${l.medicineId || l.name}-${Math.random().toString(36).slice(2, 6)}`,
    })),
    createdAt: new Date().toISOString(),
  };

  const next = [template, ...listCustomTemplates()];
  writeJson(CUSTOM_KEY, next);
  return template;
}

export function deleteReceituarioTemplate(id: string, isCustom: boolean) {
  if (isCustom) {
    writeJson(
      CUSTOM_KEY,
      listCustomTemplates().filter((t) => t.id !== id)
    );
    return;
  }
  const hidden = new Set(listHiddenSystemTemplateIds());
  hidden.add(id);
  writeJson(HIDDEN_KEY, [...hidden]);
}
