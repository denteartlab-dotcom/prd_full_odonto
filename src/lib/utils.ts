import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Formata número como 1.234,56 (sem R$). */
export function formatBrlDigits(value: number) {
  const n = Number.isFinite(value) ? value : 0;
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Converte texto com máscara pt-BR (centavos) em número. */
export function parseBrlDigits(raw: string) {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return 0;
  return Number(digits) / 100;
}

export function formatDate(value?: Date | string | null) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("pt-BR");
}

export function formatDateTime(value?: Date | string | null) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
