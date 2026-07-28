/**
 * Cliente HTTP interno — fala apenas com /api/medications/*
 * Nunca usa MEDICATION_API_KEY no browser.
 */
import type {
  Medication,
  MedicationCategory,
  MedicationSearchResult,
} from "@/types/medication";

async function parseJson<T>(res: Response): Promise<T> {
  const raw = await res.text();
  let data: T & { error?: string };
  try {
    data = (raw ? JSON.parse(raw) : {}) as T & { error?: string };
  } catch {
    throw new Error("Resposta inválida do servidor de medicamentos.");
  }
  if (!res.ok) {
    throw new Error(data.error || `Erro ao consultar medicamentos (${res.status}).`);
  }
  return data;
}

export const medicationApi = {
  async search(query: string): Promise<MedicationSearchResult> {
    const q = encodeURIComponent(query.trim());
    const res = await fetch(`/api/medications/search?q=${q}`, { cache: "no-store" });
    return parseJson<MedicationSearchResult>(res);
  },

  async getById(id: string): Promise<Medication> {
    const res = await fetch(`/api/medications/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    const data = await parseJson<{ item: Medication }>(res);
    return data.item;
  },

  async getLeaflet(id: string): Promise<{ url: string | null }> {
    const res = await fetch(`/api/medications/${encodeURIComponent(id)}/leaflet`, {
      cache: "no-store",
    });
    return parseJson<{ url: string | null }>(res);
  },

  async getCategories(): Promise<MedicationCategory[]> {
    const res = await fetch("/api/medications/categories", { cache: "no-store" });
    const data = await parseJson<{ items: MedicationCategory[] }>(res);
    return data.items;
  },

  async getManufacturers(): Promise<string[]> {
    const res = await fetch("/api/medications/manufacturers", { cache: "no-store" });
    const data = await parseJson<{ items: string[] }>(res);
    return data.items;
  },

  async getFavorites(): Promise<Medication[]> {
    const res = await fetch("/api/medications/favorites", { cache: "no-store" });
    const data = await parseJson<{ items: Medication[] }>(res);
    return data.items;
  },

  async addFavorite(medication: Medication): Promise<void> {
    const res = await fetch("/api/medications/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medication }),
    });
    await parseJson<{ ok: boolean }>(res);
  },
};
