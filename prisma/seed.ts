import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
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
      name: "Clínica Sorriso Premium",
      slug: "sorriso-premium",
      phone: "(11) 3333-4444",
      email: "contato@sorriso.local",
      address: "Av. Paulista, 1000 — São Paulo/SP",
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
      name: "Dra. Ana Proprietária",
      email: "admin@odonto.local",
      passwordHash,
      role: "admin",
    },
  });

  const dentista = await prisma.professional.create({
    data: {
      clinicId: clinic.id,
      name: "Dr. Carlos Mendes",
      cro: "CRO-SP 12345",
      specialty: "Clínico Geral",
      phone: "(11) 99999-1111",
    },
  });

  const paciente = await prisma.patient.create({
    data: {
      clinicId: clinic.id,
      name: "Maria Silva",
      cpf: "123.456.789-00",
      phone: "(11) 98888-7777",
      email: "maria@email.com",
      address: "Rua das Flores, 50",
      birthDate: new Date("1990-05-12"),
      anamnesis: {
        create: {
          allergies: "Dipirona",
          medications: "Nenhuma contínua",
          chronicDiseases: "Nenhuma",
          habits: "Não fumante",
          observations: "Paciente ansiosa em procedimentos longos.",
        },
      },
      medicalNotes: {
        create: [
          {
            title: "Primeira consulta",
            content: "Avaliação inicial, indicação de limpeza e restauração no 16.",
          },
        ],
      },
      odontogram: {
        create: [
          { tooth: "16", surface: "O", status: "cárie", notes: "Restauração indicada" },
          { tooth: "36", status: "saudável" },
          { tooth: "11", status: "saudável" },
        ],
      },
    },
  });

  const paciente2 = await prisma.patient.create({
    data: {
      clinicId: clinic.id,
      name: "João Pedro Santos",
      cpf: "987.654.321-00",
      phone: "(11) 97777-6666",
      email: "joao@email.com",
    },
  });

  const agora = new Date();
  const amanha = new Date(agora);
  amanha.setDate(amanha.getDate() + 1);
  amanha.setHours(10, 0, 0, 0);
  const fim = new Date(amanha);
  fim.setMinutes(30);

  await prisma.appointment.create({
    data: {
      clinicId: clinic.id,
      patientId: paciente.id,
      professionalId: dentista.id,
      startsAt: amanha,
      endsAt: fim,
      status: "agendado",
      type: "Avaliação",
      notes: "Retorno de orçamento",
    },
  });

  await prisma.treatment.create({
    data: {
      clinicId: clinic.id,
      patientId: paciente.id,
      professionalId: dentista.id,
      name: "Restauração em resina",
      tooth: "16",
      status: "em_andamento",
      price: 350,
    },
  });

  const budget = await prisma.budget.create({
    data: {
      clinicId: clinic.id,
      patientId: paciente.id,
      professionalId: dentista.id,
      status: "enviado",
      total: 850,
      notes: "Plano de tratamento inicial",
      items: {
        create: [
          { description: "Limpeza", quantity: 1, unitPrice: 200 },
          { description: "Restauração 16", quantity: 1, unitPrice: 350 },
          { description: "Aplicação de flúor", quantity: 1, unitPrice: 300 },
        ],
      },
    },
  });

  await prisma.receivable.createMany({
    data: [
      {
        clinicId: clinic.id,
        patientId: paciente.id,
        description: `Orçamento #${budget.id.slice(-6)} — entrada`,
        amount: 300,
        dueDate: agora,
        status: "pago",
        paidAt: agora,
        method: "pix",
      },
      {
        clinicId: clinic.id,
        patientId: paciente2.id,
        description: "Consulta de avaliação",
        amount: 150,
        dueDate: amanha,
        status: "aberto",
      },
    ],
  });

  await prisma.payable.create({
    data: {
      clinicId: clinic.id,
      description: "Aluguel consultório",
      supplier: "Imobiliária Centro",
      amount: 4500,
      dueDate: amanha,
      status: "aberto",
    },
  });

  await prisma.cashMovement.createMany({
    data: [
      {
        clinicId: clinic.id,
        type: "entrada",
        description: "Recebimento Maria Silva",
        amount: 300,
        date: agora,
      },
      {
        clinicId: clinic.id,
        type: "saida",
        description: "Material descartável",
        amount: 120,
        date: agora,
      },
    ],
  });

  await prisma.commission.create({
    data: {
      clinicId: clinic.id,
      professionalId: dentista.id,
      description: "Comissão restauração 16",
      amount: 105,
      percent: 30,
      status: "pendente",
    },
  });

  await prisma.inventoryItem.createMany({
    data: [
      {
        clinicId: clinic.id,
        name: "Resina A2",
        sku: "RES-A2",
        quantity: 12,
        minStock: 5,
        unit: "seringa",
        cost: 45,
      },
      {
        clinicId: clinic.id,
        name: "Luvas M",
        sku: "LUV-M",
        quantity: 3,
        minStock: 10,
        unit: "caixa",
        cost: 28,
      },
    ],
  });

  await prisma.prescription.create({
    data: {
      clinicId: clinic.id,
      patientId: paciente.id,
      content: "Amoxicilina 500mg — 1 cápsula de 8/8h por 7 dias.",
    },
  });

  await prisma.document.create({
    data: {
      clinicId: clinic.id,
      patientId: paciente.id,
      title: "Termo de consentimento",
      type: "termo",
      content: "Paciente autoriza o tratamento proposto.",
    },
  });

  console.log("Seed OK");
  console.log("Login: admin@odonto.local / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
