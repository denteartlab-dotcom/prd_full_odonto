/**
 * Zera o banco e deixa só o mínimo para testar sincronização:
 * - 1 clínica
 * - 1 admin
 * - 1 profissional (agenda precisa de dentista)
 *
 * Sem pacientes, agendamentos, orçamentos, financeiro, etc.
 *
 * Uso: npm run db:reset-clean
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Limpando todos os dados...");

  await prisma.budgetItem.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.receivable.deleteMany();
  await prisma.payable.deleteMany();
  await prisma.cashMovement.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.document.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.odontogramEntry.deleteMany();
  await prisma.medicalNote.deleteMany();
  await prisma.anamnesis.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.treatment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.professional.deleteMany();
  await prisma.clinicSetting.deleteMany();
  await prisma.user.deleteMany();
  await prisma.clinic.deleteMany();

  const clinic = await prisma.clinic.create({
    data: {
      name: "Clínica de Testes",
      slug: "clinica-testes",
      phone: "",
      email: "contato@clinica.local",
      address: "",
      city: "",
      state: "",
      settings: {
        create: {
          appointmentMins: 30,
          workStart: "08:00",
          workEnd: "18:00",
        },
      },
    },
  });

  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.create({
    data: {
      clinicId: clinic.id,
      name: "Administrador",
      email: "admin@odonto.local",
      passwordHash,
      role: "admin",
      active: true,
      permissions: JSON.stringify(["all"]),
    },
  });

  await prisma.professional.create({
    data: {
      clinicId: clinic.id,
      name: "Dr(a). Teste",
      specialty: "Clínico Geral",
      cro: "",
      email: "",
      phone: "",
      active: true,
    },
  });

  console.log("");
  console.log("Banco limpo. Pronto para criar dados novos.");
  console.log("Login: admin@odonto.local / admin123");
  console.log("Clínica:", clinic.name);
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
