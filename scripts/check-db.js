const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: { email: true, active: true, name: true },
    });
    console.log("users:", users);
    console.log("clinics:", await prisma.clinic.count());
  } catch (e) {
    console.error("ERR:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
