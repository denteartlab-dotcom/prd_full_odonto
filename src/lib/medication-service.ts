/**
 * Serviços auxiliares do receituário (PDF/impressão).
 * A busca de medicamentos fica em @/services/medication.service.
 */

export type PrescriptionPdfPayload = {
  clinicName: string;
  clinicAddress?: string;
  clinicPhone?: string;
  patientName: string;
  patientDocument?: string;
  dentistName: string;
  dentistCro?: string;
  medications: Array<{
    name: string;
    concentration: string;
    quantity: string;
    posology: string;
    duration: string;
    notes?: string;
  }>;
  observations?: string;
  issuedAt: string;
};

/** Preparado para jspdf/html2canvas — hoje abre impressão via rota existente. */
export const PrescriptionPdfService = {
  async prepare(payload: PrescriptionPdfPayload) {
    return {
      ready: true,
      provider: "native-print",
      payload,
      message: "Use a rota /api/prescricoes/:id/imprimir para PDF/impressão.",
    };
  },
};
