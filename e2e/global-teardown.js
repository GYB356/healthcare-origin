const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function globalTeardown() {
  // Clean up test data
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ["admin@test.com", "doctor@test.com", "patient@test.com"],
      },
    },
  });

  // Disconnect from the database
  await prisma.$disconnect();
}

module.exports = globalTeardown;
