import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import {
  canManageUsers,
  parsePermissions,
  ROLE_DEFAULT_PERMISSIONS,
  serializePermissions,
  type ClinicUserDTO,
  type ClinicUserRole,
} from "@/lib/clinic-user-permissions";
import { syncProfessionalCommissionFromUser } from "@/lib/commission-from-production";

function toDto(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  permissions: string;
  commissionEnabled: boolean;
  commissionPercent: number;
  createdAt: Date;
}): ClinicUserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    permissions: parsePermissions(user.permissions),
    commissionEnabled: user.commissionEnabled,
    commissionPercent: user.commissionPercent,
    createdAt: user.createdAt.toISOString(),
  };
}

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  active: true,
  permissions: true,
  commissionEnabled: true,
  commissionPercent: true,
  createdAt: true,
} as const;

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const users = await prisma.user.findMany({
    where: { clinicId: session.clinicId },
    orderBy: { name: "asc" },
    select: userSelect,
  });

  return NextResponse.json({
    users: users.map(toDto),
    canManage: canManageUsers(session.role),
    currentUserId: session.userId,
  });
}

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;
  if (!canManageUsers(session.role)) {
    return jsonError("Sem permissão para criar usuários.", 403);
  }

  const body = (await req.json()) as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    permissions?: string[];
    active?: boolean;
    commissionEnabled?: boolean;
    commissionPercent?: number;
  };

  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const role = (body.role || "recepcao") as ClinicUserRole;
  const commissionEnabled = Boolean(body.commissionEnabled);
  const commissionPercent = Math.max(
    0,
    Math.min(100, Number(body.commissionPercent) || 0)
  );

  if (!name) return jsonError("Nome é obrigatório.");
  if (!email || !email.includes("@")) return jsonError("E-mail inválido.");
  if (password.length < 6) return jsonError("Senha deve ter ao menos 6 caracteres.");

  const exists = await prisma.user.findFirst({
    where: { clinicId: session.clinicId, email },
  });
  if (exists) return jsonError("Já existe um usuário com este e-mail.");

  const permissions =
    body.permissions && body.permissions.length > 0
      ? body.permissions
      : ROLE_DEFAULT_PERMISSIONS[role] || ROLE_DEFAULT_PERMISSIONS.recepcao;

  const user = await prisma.user.create({
    data: {
      clinicId: session.clinicId,
      name,
      email,
      passwordHash: await hashPassword(password),
      role,
      permissions: serializePermissions(permissions),
      active: body.active ?? true,
      commissionEnabled,
      commissionPercent,
    },
    select: userSelect,
  });

  await syncProfessionalCommissionFromUser({
    clinicId: session.clinicId,
    name: user.name,
    email: user.email,
    active: user.active,
    role: user.role,
    commissionEnabled: user.commissionEnabled,
    commissionPercent: user.commissionPercent,
  });

  return NextResponse.json({ user: toDto(user) }, { status: 201 });
}
