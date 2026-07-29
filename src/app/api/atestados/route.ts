import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import { allocateNextCertificateNumber } from "@/lib/certificate-number";
import {
  buildValidationHash,
  DEFAULT_CERTIFICATE_TEXTS,
  type CertificateType,
} from "@/lib/certificate-types";
import { resolveLoggedPrescriber } from "@/lib/resolve-logged-prescriber";

function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || null;
  return req.headers.get("x-real-ip");
}

function parseOptionalDate(value: unknown) {
  if (!value || typeof value !== "string" || !value.trim()) return null;
  const d = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(req: NextRequest) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const patientId = req.nextUrl.searchParams.get("patientId");
  if (!patientId) return jsonError("patientId é obrigatório.");

  const [items, prescriber, clinic] = await Promise.all([
    prisma.medicalCertificate.findMany({
      where: { clinicId: session.clinicId, patientId },
      orderBy: { createdAt: "desc" },
      include: { professional: true },
    }),
    resolveLoggedPrescriber(session),
    prisma.clinic.findUnique({
      where: { id: session.clinicId },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        phone: true,
        email: true,
        cnpj: true,
        logoUrl: true,
        responsibleDentist: true,
        cro: true,
      },
    }),
  ]);

  return NextResponse.json({
    items,
    prescriber,
    clinic,
  });
}

export async function POST(req: NextRequest) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonError("JSON inválido.");
  }

  const patientId = String(body.patientId || "");
  if (!patientId) return jsonError("Paciente obrigatório.");

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, clinicId: session.clinicId },
  });
  if (!patient) return jsonError("Paciente não encontrado.", 404);

  const certificateType = String(
    body.certificateType || "comparecimento"
  ) as CertificateType;
  const certificateText = String(
    body.certificateText ||
      DEFAULT_CERTIFICATE_TEXTS[certificateType] ||
      ""
  ).trim();
  if (!certificateText) return jsonError("Texto do atestado é obrigatório.");

  const prescriber = await resolveLoggedPrescriber(session);
  const dentistId =
    (typeof body.dentistId === "string" && body.dentistId) ||
    prescriber.id ||
    null;

  const documentNumber = await allocateNextCertificateNumber(session.clinicId);
  const validationHash = buildValidationHash({
    clinicId: session.clinicId,
    documentNumber,
    patientId,
  });
  const ip = clientIp(req);

  const audit = {
    emittedAt: new Date().toISOString(),
    userId: session.userId,
    userName: session.name,
    userEmail: session.email,
    ip,
    userAgent: req.headers.get("user-agent"),
  };

  try {
    const row = await prisma.$transaction(async (tx) => {
      const created = await tx.medicalCertificate.create({
        data: {
          clinicId: session.clinicId,
          patientId,
          appointmentId:
            typeof body.appointmentId === "string" ? body.appointmentId : null,
          dentistId,
          certificateType,
          certificateText,
          procedureName:
            typeof body.procedureName === "string"
              ? body.procedureName.trim() || null
              : null,
          attendanceDate: parseOptionalDate(body.attendanceDate),
          startTime:
            typeof body.startTime === "string" ? body.startTime || null : null,
          endTime:
            typeof body.endTime === "string" ? body.endTime || null : null,
          days:
            typeof body.days === "number"
              ? body.days
              : body.days
                ? Number(body.days)
                : null,
          hours:
            typeof body.hours === "number"
              ? body.hours
              : body.hours
                ? Number(body.hours)
                : null,
          restStartDate: parseOptionalDate(body.restStartDate),
          restEndDate: parseOptionalDate(body.restEndDate),
          companionName:
            typeof body.companionName === "string"
              ? body.companionName.trim() || null
              : null,
          companionCpf:
            typeof body.companionCpf === "string"
              ? body.companionCpf.trim() || null
              : null,
          cid: typeof body.cid === "string" ? body.cid.trim() || null : null,
          cidDescription:
            typeof body.cidDescription === "string"
              ? body.cidDescription.trim() || null
              : null,
          observations:
            typeof body.observations === "string"
              ? body.observations.slice(0, 500) || null
              : null,
          documentNumber,
          validationHash,
          issuedByUserId: session.userId,
          issuedByName: session.name,
          issuedIp: ip,
          auditJson: JSON.stringify(audit),
          status: "emitido",
        },
      });

      await tx.document.create({
        data: {
          clinicId: session.clinicId,
          patientId,
          title: `Atestado ${documentNumber}`,
          type: "atestado",
          content: JSON.stringify({
            certificateId: created.id,
            documentNumber,
            certificateType,
            validationHash,
          }),
        },
      });

      await tx.medicalNote.create({
        data: {
          patientId,
          title: `Atestado odontológico ${documentNumber}`,
          content: [
            `Tipo: ${certificateType}`,
            certificateText,
            body.procedureName
              ? `Procedimento: ${String(body.procedureName)}`
              : null,
            body.cid ? `CID: ${String(body.cid)}` : null,
            `Emitido por: ${session.name}`,
            ip ? `IP: ${ip}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
        },
      });

      return created;
    });

    return NextResponse.json({ item: row }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/atestados]", err);
    return jsonError("Não foi possível salvar o atestado.", 500);
  }
}
