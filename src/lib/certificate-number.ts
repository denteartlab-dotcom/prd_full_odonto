import { prisma } from "@/lib/db";
import {
  formatCertificateDocumentNumber,
  parseCertificateSequence,
} from "@/lib/certificate-types";

/** Próximo número ATD-AAAA-000001 por clínica/ano. */
export async function allocateNextCertificateNumber(clinicId: string) {
  const year = new Date().getFullYear();
  const prefix = `ATD-${year}-`;
  const rows = await prisma.medicalCertificate.findMany({
    where: {
      clinicId,
      documentNumber: { startsWith: prefix },
    },
    select: { documentNumber: true },
  });

  let max = 0;
  for (const row of rows) {
    const parsed = parseCertificateSequence(row.documentNumber);
    if (parsed && parsed.year === year) {
      max = Math.max(max, parsed.seq);
    }
  }

  return formatCertificateDocumentNumber(year, max + 1);
}
