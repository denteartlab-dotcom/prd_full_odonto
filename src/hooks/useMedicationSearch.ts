"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { medicationService } from "@/services/medication.service";
import type { Medication, MedicationSearchResult } from "@/types/medication";

const DEBOUNCE_MS = 300;

export function useMedicationSearch(query: string, enabled = true) {
  const [debounced, setDebounced] = useState(query.trim());

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  const searchQuery = useQuery<MedicationSearchResult, Error>({
    queryKey: ["medications", "search", debounced],
    queryFn: () => medicationService.searchMedicines(debounced),
    enabled: enabled && debounced.length >= 3,
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    debouncedQuery: debounced,
    items: searchQuery.data?.items ?? [],
    source: searchQuery.data?.source,
    isLoading: searchQuery.isFetching || query.trim() !== debounced,
    isError: searchQuery.isError,
    errorMessage:
      searchQuery.error?.message || "Não foi possível consultar os medicamentos.",
    refetch: searchQuery.refetch,
    isEmpty:
      !searchQuery.isFetching &&
      debounced.length >= 1 &&
      (searchQuery.data?.items.length ?? 0) === 0 &&
      !searchQuery.isError,
  };
}

export function useMedicationFavorites() {
  return useQuery<Medication[], Error>({
    queryKey: ["medications", "favorites"],
    queryFn: () => medicationService.getFavorites(),
    staleTime: 30_000,
  });
}

export function useMedicationCategories() {
  return useQuery({
    queryKey: ["medications", "categories"],
    queryFn: () => medicationService.getCategories(),
    staleTime: 5 * 60_000,
  });
}

export function useMedicationRecent() {
  const [items, setItems] = useState<Medication[]>([]);

  useEffect(() => {
    setItems(medicationService.getRecent());
  }, []);

  function refresh() {
    setItems(medicationService.getRecent());
  }

  return { items, refresh };
}
