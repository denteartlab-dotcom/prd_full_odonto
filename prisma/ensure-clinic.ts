/**
 * Garante que existe pelo menos 1 clínica + 1 admin no banco.
 * Útil quando o Patient_clinicId_fkey quebra após reset/sessão antiga.
 *
 * Uso: npx tsx prisma/ensure-clinic.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  let clinic = await prisma.clinic.findFirst({ orderBy: { createdAt: "asc" } });

  if (!clinic) {
    clinic = await prisma.clinic.create({
      data: {
        name: "Clínica de Testes",
        slug: "clinica-testes",
        email: "contato@clinica.local",
        settings: {
          create: {
            appointmentMins: 30,
            workStart: "08:00",
            workEnd: "18:00",
          },
        },
      },
    });
    console.log("Clínica criada:", clinic.id, clinic.name);
  } else {
    console.log("Clínica já existe:", clinic.id, clinic.name);
  }

  let user = await prisma.user.findFirst({
    where: { email: "admin@odonto.local" },
  });

  const passwordHash = await bcrypt.hash("admin123", 10);

  if (!user) {
    user = await prisma.user.create({
      data: {
        clinicId: clinic.id,
        name: "Dra. Ana Proprietária",
        email: "admin@odonto.local",
        passwordHash,
        role: "admin",
        active: true,
        permissions: JSON.stringify(["all"]),
      },
    });
    console.log("Usuário criado:", user.email);
  } else {
    const clinicExists = await prisma.clinic.findUnique({
      where: { id: user.clinicId },
    });
    if (!clinicExists) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { clinicId: clinic.id },
      });
      console.log("Usuário religado à clínica:", clinic.id);
    } else {
      console.log("Usuário ok:", user.email, "→", user.clinicId);
    }
  }

  const professionals = await prisma.professional.count({
    where: { clinicId: clinic.id },
  });
  if (professionals === 0) {
    await prisma.professional.create({
      data: {
        clinicId: clinic.id,
        name: "Dr(a). Teste",
        specialty: "Clínico Geral",
        active: true,
      },
    });
    console.log("Profissional de teste criado.");
  }

  console.log("");
  console.log("Pronto. Login: admin@odonto.local / admin123");
  console.log("Se o navegador ainda mostrar usuário antigo, faça logout e login de novo.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
