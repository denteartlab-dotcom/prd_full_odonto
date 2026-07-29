import { SignJWT, jwtVerify } from "jose";
import { absoluteAppUrl } from "@/lib/prescription-share";
import { prisma } from "@/lib/db";

const SHARE_TYP = "certificate-share";

function secret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");
}

/** Caminho público estável (hash hex — seguro para QR e URL). */
export function certificateValidationPath(validationHash: string) {
  const hash = validationHash.trim().toLowerCase();
  return `/validar-atestado/${encodeURIComponent(hash)}`;
}

export function certificatePublicPdfPath(validationHash: string) {
  const hash = validationHash.trim().toLowerCase();
  return `/api/atestados-publicos/${encodeURIComponent(hash)}/pdf`;
}

export function buildCertificateValidationUrl(
  validationHash: string,
  req?: Request
) {
  return absoluteAppUrl(certificateValidationPath(validationHash), req);
}

/** Resolve atestado pelo hash permanente ou, em fallback, por JWT antigo. */
export async function resolveCertificateByPublicToken(rawToken: string) {
  const token = safeDecodeToken(rawToken).trim();
  if (!token) throw new Error("Token vazio.");

  // Hash SHA-256 (64 hex) — formato atual
  if (/^[a-f0-9]{32,128}$/i.test(token)) {
    const row = await prisma.medicalCertificate.findFirst({
      where: { validationHash: { equals: token, mode: "insensitive" } },
      include: {
        patient: true,
        professional: true,
        clinic: true,
      },
    });
    if (!row) throw new Error("Atestado não encontrado.");
    return row;
  }

  // Fallback: JWT antigo (links já emitidos)
  const { payload } = await jwtVerify(token, secret());
  if (payload.typ !== SHARE_TYP) throw new Error("Token inválido.");
  const certificateId = String(payload.certificateId || "");
  const clinicId = String(payload.clinicId || "");
  if (!certificateId || !clinicId) throw new Error("Token incompleto.");

  const row = await prisma.medicalCertificate.findFirst({
    where: { id: certificateId, clinicId },
    include: {
      patient: true,
      professional: true,
      clinic: true,
    },
  });
  if (!row) throw new Error("Atestado não encontrado.");
  return row;
}

function safeDecodeToken(token: string) {
  let current = token;
  // Next/Vercel podem entregar já decodificado; evita quebrar com decode duplo.
  for (let i = 0; i < 2; i++) {
    try {
      const next = decodeURIComponent(current);
      if (next === current) break;
      current = next;
    } catch {
      break;
    }
  }
  return current;
}

/** @deprecated Preferir validationHash; mantido só para compatibilidade. */
export async function createCertificateShareToken(input: {
  certificateId: string;
  clinicId: string;
}) {
  return new SignJWT({
    typ: SHARE_TYP,
    certificateId: input.certificateId,
    clinicId: input.clinicId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret());
}

export async function verifyCertificateShareToken(token: string) {
  const { payload } = await jwtVerify(safeDecodeToken(token), secret());
  if (payload.typ !== SHARE_TYP) throw new Error("Token inválido.");
  const certificateId = String(payload.certificateId || "");
  const clinicId = String(payload.clinicId || "");
  if (!certificateId || !clinicId) throw new Error("Token incompleto.");
  return { certificateId, clinicId };
}

export { absoluteAppUrl };
