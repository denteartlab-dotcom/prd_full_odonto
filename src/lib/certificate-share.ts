import { SignJWT, jwtVerify } from "jose";
import { absoluteAppUrl } from "@/lib/prescription-share";

const SHARE_TYP = "certificate-share";

function secret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");
}

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
  const { payload } = await jwtVerify(token, secret());
  if (payload.typ !== SHARE_TYP) throw new Error("Token inválido.");
  const certificateId = String(payload.certificateId || "");
  const clinicId = String(payload.clinicId || "");
  if (!certificateId || !clinicId) throw new Error("Token incompleto.");
  return { certificateId, clinicId };
}

export function certificateValidationPath(token: string) {
  return `/validar-atestado/${encodeURIComponent(token)}`;
}

export { absoluteAppUrl };
