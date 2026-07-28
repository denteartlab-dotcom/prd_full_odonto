import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-helpers";
import { buildPrescriptionHtml } from "@/lib/prescription-html";
import { verifyPrescriptionShareToken } from "@/lib/prescription-share";
import type { PrescriptionItem, PrescriptionKind } from "@/lib/prescription-types";

type Params = { params: Promise<{ token: string }> };

function parseEnvelope(raw: string | null) {
  if (!raw) {
    return {
      kind: "receituario_simples" as PrescriptionKind,
      items: [] as PrescriptionItem[],
      observations: "",
      validUntil: null as string | null,
    };
  }
  try {
    const parsed = JSON.parse(raw) as {
      kind?: PrescriptionKind;
      items?: PrescriptionItem[];
      observations?: string;
      validUntil?: string | null;
    };
    if (Array.isArray(parsed)) {
      return {
        kind: "receituario_simples" as PrescriptionKind,
        items: parsed as PrescriptionItem[],
        observations: "",
        validUntil: null,
      };
    }
    return {
      kind: parsed.kind || "receituario_simples",
      items: parsed.items || [],
      observations: parsed.observations || "",
      validUntil: parsed.validUntil || null,
    };
  } catch {
    return {
      kind: "receituario_simples" as PrescriptionKind,
      items: [] as PrescriptionItem[],
      observations: "",
      validUntil: null,
    };
  }
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { token } = await params;
    const decoded = await verifyPrescriptionShareToken(decodeURIComponent(token));

    const row = await prisma.prescription.findFirst({
      where: { id: decoded.prescriptionId, clinicId: decoded.clinicId },
      include: {
        patient: true,
        professional: true,
        clinic: true,
      },
    });
    if (!row) return jsonError("Receita não encontrada ou link expirado.", 404);

    const envelope = parseEnvelope(row.medicationsJson);
    const issuedAt = row.createdAt.toLocaleDateString("pt-BR");
    const birthDate = row.patient.birthDate
      ? row.patient.birthDate.toLocaleDateString("pt-BR")
      : undefined;

    const html = buildPrescriptionHtml({
      clinicName: row.clinic.name,
      clinicAddress: [row.clinic.address, row.clinic.city, row.clinic.state]
        .filter(Boolean)
        .join(" — "),
      clinicPhone: row.clinic.phone || undefined,
      clinicCnpj: row.clinic.cnpj || undefined,
      clinicLogoUrl: row.clinic.logoUrl || null,
      dentistName:
        row.professional?.name ||
        row.clinic.responsibleDentist ||
        "Cirurgião-Dentista",
      dentistCro: row.professional?.cro || row.clinic.cro || "—",
      patientName: row.patient.name,
      patientCpf: row.patient.cpf || undefined,
      patientBirthDate: birthDate,
      kind: envelope.kind,
      medications: envelope.items.length
        ? envelope.items
        : [
            {
              id: "legacy",
              medicationName: row.content,
              dose: "",
              frequency: "",
              duration: "",
            },
          ],
      issuedAt,
      validUntil: envelope.validUntil
        ? new Date(`${envelope.validUntil}T12:00:00`).toLocaleDateString("pt-BR")
        : undefined,
    });

    // Acrescenta botão de impressão/PDF no link público
    const withPrint = html.replace(
      "</body>",
      `<script>window.addEventListener('load',()=>{/* pronto para imprimir/salvar PDF */});</script></body>`
    );

    return new NextResponse(withPrint, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return jsonError("Link inválido ou expirado.", 401);
  }
}
