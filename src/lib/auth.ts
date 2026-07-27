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

/**
 * Sessão JWT pode ficar desatualizada após reset/seed do banco
 * (clinicId antigo → Patient_clinicId_fkey). Sempre resolve contra o DB.
 */
async function ensureClinicRecord(clinicId: string, nameHint?: string) {
  const existing = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (existing) return existing;

  const slugBase = `clinica-${clinicId.slice(-8).toLowerCase()}`;
  let slug = slugBase;
  let n = 0;
  while (await prisma.clinic.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${slugBase}-${n}`;
  }

  return prisma.clinic.create({
    data: {
      id: clinicId,
      name: nameHint?.trim() || "Clínica",
      slug,
      settings: {
        create: {
          appointmentMins: 30,
          workStart: "08:00",
          workEnd: "18:00",
        },
      },
    },
  });
}

async function resolveLiveSession(
  raw: SessionPayload,
  options?: { refreshCookie?: boolean }
): Promise<SessionPayload | null> {
  let user = await prisma.user.findFirst({
    where: { id: raw.userId, active: true },
  });

  // Após reset, o userId do cookie some — tenta pelo e-mail da sessão.
  if (!user && raw.email) {
    user = await prisma.user.findFirst({
      where: { email: raw.email.trim().toLowerCase(), active: true },
    });
  }

  if (!user) return null;

  await ensureClinicRecord(user.clinicId, raw.name || user.name);

  const live: SessionPayload = {
    userId: user.id,
    clinicId: user.clinicId,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  // Só grava cookie em Route Handlers / Server Actions (não em RSC).
  if (
    options?.refreshCookie &&
    (live.userId !== raw.userId ||
      live.clinicId !== raw.clinicId ||
      live.name !== raw.name ||
      live.role !== raw.role)
  ) {
    await createSession(live);
  }

  return live;
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return resolveLiveSession(payload as unknown as SessionPayload);
  } catch {
    return null;
  }
}

/** Sessão validada no DB; atualiza o cookie se estiver desatualizado. */
export async function getApiSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return resolveLiveSession(payload as unknown as SessionPayload, {
      refreshCookie: true,
    });
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getApiSession();
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
  await ensureClinicRecord(user.clinicId, user.name);
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
