import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) {
    console.log("no clinic");
    return;
  }
  const pro = await prisma.professional.findFirst({ where: { clinicId: clinic.id } });
  await prisma.clinic.update({
    where: { id: clinic.id },
    data: {
      cnpj: clinic.cnpj || "12.345.678/0001-90",
      city: clinic.city || "São Paulo",
      state: clinic.state || "SP",
      address: clinic.address || "Av. Paulista, 1000",
      responsibleDentist: clinic.responsibleDentist || pro?.name || "Dr. Carlos Mendes",
      cro: clinic.cro || pro?.cro || "CRO-SP 12345",
    },
  });
  console.log("clinic updated", clinic.id);
}

main()
  .finally(() => prisma.$disconnect());
