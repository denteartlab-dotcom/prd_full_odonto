import { SignJWT, jwtVerify } from "jose";

const SHARE_TYP = "prescription-share";

function secret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");
}

export async function createPrescriptionShareToken(input: {
  prescriptionId: string;
  clinicId: string;
}) {
  return new SignJWT({
    typ: SHARE_TYP,
    prescriptionId: input.prescriptionId,
    clinicId: input.clinicId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifyPrescriptionShareToken(token: string) {
  const { payload } = await jwtVerify(token, secret());
  if (payload.typ !== SHARE_TYP) throw new Error("Token inválido.");
  const prescriptionId = String(payload.prescriptionId || "");
  const clinicId = String(payload.clinicId || "");
  if (!prescriptionId || !clinicId) throw new Error("Token incompleto.");
  return { prescriptionId, clinicId };
}

export function absoluteAppUrl(path: string, req?: Request) {
  const envBase =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  if (envBase) {
    return `${envBase.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  }
  if (req) {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || "https";
    if (host) return `${proto}://${host}${path.startsWith("/") ? path : `/${path}`}`;
  }
  return path;
}
