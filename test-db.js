const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.profile.count();
  console.log("Profiles count:", count);
  const profiles = await prisma.profile.findMany();
  console.log("Profiles IDs:", profiles.map(p => p.id));
}
main().finally(() => prisma.$disconnect());
