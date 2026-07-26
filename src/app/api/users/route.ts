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

function toDto(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  permissions: string;
  createdAt: Date;
}): ClinicUserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    permissions: parsePermissions(user.permissions),
    createdAt: user.createdAt.toISOString(),
  };
}

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const users = await prisma.user.findMany({
    where: { clinicId: session.clinicId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      permissions: true,
      createdAt: true,
    },
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
  };

  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const role = (body.role || "recepcao") as ClinicUserRole;

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
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      permissions: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ user: toDto(user) }, { status: 201 });
}
