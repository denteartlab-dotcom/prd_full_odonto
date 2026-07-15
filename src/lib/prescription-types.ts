export type PrescriptionRecord = {
  id: string;
  patientId: string;
  patientName: string;
  content: string;
  status: string;
  memedId?: string | null;
  pdfUrl?: string | null;
  digitalLink?: string | null;
  professionalName?: string | null;
  createdAt: string;
  updatedAt: string;
};
