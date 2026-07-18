const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const profiles = await prisma.profile.findMany();
  console.log(profiles);
}
main();
