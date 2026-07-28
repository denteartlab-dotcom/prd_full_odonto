import { medicationApi } from "@/api/medicationApi";
import type {
  Medication,
  MedicationCategory,
  MedicationSearchResult,
} from "@/types/medication";
import { medicationCache } from "@/utils/medicationCache";

/**
 * Camada de domínio do frontend.
 * Componentes React usam apenas esta classe (ou hooks que a encapsulam).
 */
export class MedicationService {
  async searchMedicines(query: string): Promise<MedicationSearchResult> {
    const key = `search:${query.trim().toLowerCase()}`;
    const cached = medicationCache.get<MedicationSearchResult>(key);
    if (cached) return cached;

    const result = await medicationApi.search(query);
    medicationCache.set(key, result);
    return result;
  }

  async getMedicineById(id: string): Promise<Medication> {
    const key = `id:${id}`;
    const cached = medicationCache.get<Medication>(key);
    if (cached) return cached;

    const item = await medicationApi.getById(id);
    medicationCache.set(key, item);
    return item;
  }

  async getMedicineLeaflet(id: string): Promise<string | null> {
    const key = `leaflet:${id}`;
    const cached = medicationCache.get<{ url: string | null }>(key);
    if (cached) return cached.url;

    const { url } = await medicationApi.getLeaflet(id);
    medicationCache.set(key, { url });
    return url;
  }

  async getCategories(): Promise<MedicationCategory[]> {
    const key = "categories";
    const cached = medicationCache.get<MedicationCategory[]>(key);
    if (cached) return cached;

    const items = await medicationApi.getCategories();
    medicationCache.set(key, items);
    return items;
  }

  async getByCategory(categoryId: string): Promise<MedicationSearchResult> {
    const key = `category:${categoryId.trim().toLowerCase()}`;
    const cached = medicationCache.get<MedicationSearchResult>(key);
    if (cached) return cached;

    const result = await medicationApi.byCategory(categoryId);
    medicationCache.set(key, result);
    return result;
  }

  async getManufacturers(): Promise<string[]> {
    const key = "manufacturers";
    const cached = medicationCache.get<string[]>(key);
    if (cached) return cached;

    const items = await medicationApi.getManufacturers();
    medicationCache.set(key, items);
    return items;
  }

  async getFavorites(): Promise<Medication[]> {
    return medicationApi.getFavorites();
  }

  async addFavorite(medication: Medication): Promise<void> {
    await medicationApi.addFavorite(medication);
  }

  trackRecent(medication: Medication) {
    medicationCache.pushRecent(medication);
  }

  getRecent(): Medication[] {
    return medicationCache.getRecent();
  }
}

export const medicationService = new MedicationService();
