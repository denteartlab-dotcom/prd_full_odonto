const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const clinics = await prisma.clinic.findMany({
    select: { id: true, name: true, slug: true, createdAt: true },
  });
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      clinicId: true,
      role: true,
      active: true,
    },
  });
  const clinicIds = new Set(clinics.map((c) => c.id));
  const orphanUsers = users.filter((u) => !clinicIds.has(u.clinicId));
  const patientCount = await prisma.patient.count();

  console.log(
    JSON.stringify(
      {
        clinics,
        users,
        orphanUsers,
        counts: {
          clinics: clinics.length,
          users: users.length,
          orphanUsers: orphanUsers.length,
          patients: patientCount,
        },
      },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
