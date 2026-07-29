import { prisma } from "@/lib/db";

/** Formata sequência: FCH-001, FCH-002, … FCH-1000 (cresce sem limite). */
export function formatChartNumber(seq: number) {
  const n = Math.max(1, Math.floor(seq));
  return `FCH-${String(n).padStart(3, "0")}`;
}

export function parseChartSequence(value: string | null | undefined) {
  const m = /^FCH-(\d+)$/i.exec((value || "").trim());
  if (!m) return null;
  const n = Number.parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

/** Próximo número de ficha da clínica (sequência infinita). */
export async function allocateNextChartNumber(clinicId: string) {
  const rows = await prisma.patient.findMany({
    where: { clinicId },
    select: { chartNumber: true, notes: true },
  });

  let max = 0;
  for (const row of rows) {
    const fromCol = parseChartSequence(row.chartNumber);
    if (fromCol != null) max = Math.max(max, fromCol);

    if (!row.notes) continue;
    try {
      const parsed = JSON.parse(row.notes) as {
        profile?: { chartNumber?: string; numeroFicha?: string };
      };
      const fromNotes = parseChartSequence(
        parsed.profile?.chartNumber || parsed.profile?.numeroFicha
      );
      if (fromNotes != null) max = Math.max(max, fromNotes);
    } catch {
      /* ignore */
    }
  }

  return formatChartNumber(max + 1);
}
