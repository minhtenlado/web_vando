const { PrismaClient } = require('@prisma/client');
const crypto = require("crypto");

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

async function main() {
  const password = "admin";
  const pwHash = hashPassword(password);
  
  await prisma.profile.updateMany({
    data: { passwordHash: pwHash }
  });
  
  console.log("Password reset to: admin");
}

main().catch(console.error).finally(() => prisma.$disconnect());
