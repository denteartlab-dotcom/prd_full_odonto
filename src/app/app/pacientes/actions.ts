"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function criarPaciente(formData: FormData) {
  const session = await requireSession();
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Nome obrigatório." };

  await prisma.patient.create({
    data: {
      clinicId: session.clinicId,
      name,
      cpf: String(formData.get("cpf") || "").trim() || null,
      phone: String(formData.get("phone") || "").trim() || null,
      email: String(formData.get("email") || "").trim() || null,
      address: String(formData.get("address") || "").trim() || null,
      notes: String(formData.get("notes") || "").trim() || null,
    },
  });

  revalidatePath("/app/pacientes");
  return { ok: true };
}

export async function excluirPaciente(id: string) {
  const session = await requireSession();
  await prisma.patient.deleteMany({ where: { id, clinicId: session.clinicId } });
  revalidatePath("/app/pacientes");
}
