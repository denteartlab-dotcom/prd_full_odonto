import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const COOKIE = "odonto-session";

export type SessionPayload = {
  userId: string;
  clinicId: string;
  name: string;
  email: string;
  role: string;
};

function secret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function loginWithCredentials(email: string, password: string) {
  const user = await prisma.user.findFirst({
    where: { email: email.trim().toLowerCase(), active: true },
  });
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  const session: SessionPayload = {
    userId: user.id,
    clinicId: user.clinicId,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  await createSession(session);
  return session;
}
