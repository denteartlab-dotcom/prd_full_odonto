import type { Medication } from "@/types/medication";

const CACHE_PREFIX = "odonto-med-cache:";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const RECENT_KEY = "odonto-med-search-recent";
const RECENT_LIMIT = 20;

type CacheEntry<T> = {
  savedAt: number;
  data: T;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export const medicationCache = {
  get<T>(key: string): T | null {
    if (!canUseStorage()) return null;
    try {
      const raw = window.localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CacheEntry<T>;
      if (!parsed?.savedAt || Date.now() - parsed.savedAt > CACHE_TTL_MS) {
        window.localStorage.removeItem(`${CACHE_PREFIX}${key}`);
        return null;
      }
      return parsed.data;
    } catch {
      return null;
    }
  },

  set<T>(key: string, data: T) {
    if (!canUseStorage()) return;
    try {
      const entry: CacheEntry<T> = { savedAt: Date.now(), data };
      window.localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
    } catch {
      /* quota */
    }
  },

  pushRecent(medication: Medication) {
    if (!canUseStorage()) return;
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      const list = raw ? (JSON.parse(raw) as Medication[]) : [];
      const next = [medication, ...list.filter((m) => m.id !== medication.id)].slice(
        0,
        RECENT_LIMIT
      );
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  },

  getRecent(): Medication[] {
    if (!canUseStorage()) return [];
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      const list = raw ? (JSON.parse(raw) as Medication[]) : [];
      return Array.isArray(list) ? list.slice(0, RECENT_LIMIT) : [];
    } catch {
      return [];
    }
  },
};
