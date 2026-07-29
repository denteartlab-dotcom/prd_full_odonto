import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import {
  canManageUsers,
  parsePermissions,
  serializePermissions,
  type ClinicUserDTO,
} from "@/lib/clinic-user-permissions";
import {
  normalizeCommissionValue,
  parseCommissionBase,
  parseCommissionMode,
  syncProfessionalCommissionFromUser,
} from "@/lib/commission-from-production";

function toDto(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  permissions: string;
  commissionEnabled: boolean;
  commissionMode: string;
  commissionValue: number;
  commissionBase: string;
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
    commissionMode: user.commissionMode,
    commissionValue: user.commissionValue,
    commissionBase: user.commissionBase,
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
  commissionMode: true,
  commissionValue: true,
  commissionBase: true,
  createdAt: true,
} as const;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;
  if (!canManageUsers(session.role)) {
    return jsonError("Sem permissão para editar usuários.", 403);
  }

  const { id } = await params;
  const existing = await prisma.user.findFirst({
    where: { id, clinicId: session.clinicId },
  });
  if (!existing) return jsonError("Usuário não encontrado.", 404);

  const body = (await req.json()) as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    permissions?: string[];
    active?: boolean;
    commissionEnabled?: boolean;
    commissionMode?: string;
    commissionValue?: number;
    commissionBase?: string;
  };

  if (existing.id === session.userId && body.active === false) {
    return jsonError("Você não pode desativar o próprio usuário.");
  }

  let email = existing.email;
  if (body.email != null) {
    email = body.email.trim().toLowerCase();
    if (!email.includes("@")) return jsonError("E-mail inválido.");
    const clash = await prisma.user.findFirst({
      where: {
        clinicId: session.clinicId,
        email,
        NOT: { id },
      },
    });
    if (clash) return jsonError("Já existe um usuário com este e-mail.");
  }

  const data: {
    name?: string;
    email?: string;
    role?: string;
    active?: boolean;
    permissions?: string;
    passwordHash?: string;
    commissionEnabled?: boolean;
    commissionMode?: string;
    commissionValue?: number;
    commissionBase?: string;
  } = {};

  if (body.name != null) data.name = body.name.trim() || existing.name;
  if (body.email != null) data.email = email;
  if (body.role != null) data.role = body.role;
  if (body.active != null) data.active = body.active;
  if (body.permissions != null) {
    data.permissions = serializePermissions(body.permissions);
  }
  if (body.commissionEnabled != null) {
    data.commissionEnabled = Boolean(body.commissionEnabled);
  }

  const nextMode = parseCommissionMode(
    body.commissionMode ?? existing.commissionMode
  );
  const nextBase = parseCommissionBase(
    body.commissionBase ?? existing.commissionBase
  );
  if (body.commissionMode != null) data.commissionMode = nextMode;
  if (body.commissionBase != null) data.commissionBase = nextBase;
  if (body.commissionValue != null || body.commissionMode != null) {
    data.commissionValue = normalizeCommissionValue(
      nextMode,
      body.commissionValue ?? existing.commissionValue
    );
  }

  if (body.password && body.password.length >= 6) {
    data.passwordHash = await hashPassword(body.password);
  } else if (body.password) {
    return jsonError("Senha deve ter ao menos 6 caracteres.");
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });

  await syncProfessionalCommissionFromUser({
    clinicId: session.clinicId,
    name: user.name,
    email: user.email,
    active: user.active,
    role: user.role,
    commissionEnabled: user.commissionEnabled,
    commissionMode: parseCommissionMode(user.commissionMode),
    commissionValue: user.commissionValue,
    commissionBase: parseCommissionBase(user.commissionBase),
  });

  return NextResponse.json({ user: toDto(user) });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;
  if (!canManageUsers(session.role)) {
    return jsonError("Sem permissão para remover usuários.", 403);
  }

  const { id } = await params;
  if (id === session.userId) {
    return jsonError("Você não pode remover o próprio usuário.");
  }

  const existing = await prisma.user.findFirst({
    where: { id, clinicId: session.clinicId },
  });
  if (!existing) return jsonError("Usuário não encontrado.", 404);

  await prisma.user.update({
    where: { id },
    data: { active: false },
  });

  return NextResponse.json({ ok: true });
}
