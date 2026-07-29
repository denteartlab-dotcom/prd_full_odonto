import { prisma } from "@/lib/db";
import { verifyCertificateShareToken } from "@/lib/certificate-share";
import { CERTIFICATE_TYPE_LABELS, type CertificateType } from "@/lib/certificate-types";
import { formatBrasiliaDate, formatBrasiliaDateTime } from "@/lib/date-range";

type Params = { params: Promise<{ token: string }> };

export default async function ValidarAtestadoPage({ params }: Params) {
  const { token } = await params;
  let error = "";
  let data: {
    documentNumber: string;
    typeLabel: string;
    patientName: string;
    dentistName: string;
    clinicName: string;
    issuedAt: string;
    attendanceDate: string | null;
    validationHash: string;
  } | null = null;

  try {
    const decoded = decodeURIComponent(token);
    const { certificateId, clinicId } =
      await verifyCertificateShareToken(decoded);
    const row = await prisma.medicalCertificate.findFirst({
      where: { id: certificateId, clinicId },
      include: { patient: true, professional: true, clinic: true },
    });
    if (!row) {
      error = "Atestado não encontrado.";
    } else {
      data = {
        documentNumber: row.documentNumber,
        typeLabel:
          CERTIFICATE_TYPE_LABELS[row.certificateType as CertificateType] ||
          row.certificateType,
        patientName: row.patient.name,
        dentistName:
          row.professional?.name ||
          row.issuedByName ||
          row.clinic.responsibleDentist ||
          "—",
        clinicName: row.clinic.name,
        issuedAt: formatBrasiliaDateTime(row.createdAt),
        attendanceDate: row.attendanceDate
          ? formatBrasiliaDate(row.attendanceDate)
          : null,
        validationHash: row.validationHash.slice(0, 16) + "…",
      };
    }
  } catch {
    error = "Link de validação inválido ou expirado.";
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50 px-4 py-12">
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
          Validação pública
        </p>
        <h1 className="mt-1 text-xl font-bold text-slate-900">
          Atestado Odontológico
        </h1>
        {error ? (
          <p className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </p>
        ) : data ? (
          <div className="mt-5 space-y-3 text-sm">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-emerald-800">
              Documento <strong>autêntico</strong> e registrado no sistema.
            </div>
            <Row label="Número" value={data.documentNumber} />
            <Row label="Tipo" value={data.typeLabel} />
            <Row label="Clínica" value={data.clinicName} />
            <Row label="Paciente" value={data.patientName} />
            <Row label="Dentista" value={data.dentistName} />
            <Row label="Emissão" value={data.issuedAt} />
            {data.attendanceDate ? (
              <Row label="Atendimento" value={data.attendanceDate} />
            ) : null}
            <Row label="Hash" value={data.validationHash} />
          </div>
        ) : null}
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{value}</span>
    </div>
  );
}
