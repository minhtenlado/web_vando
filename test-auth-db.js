const { PrismaClient } = require('@prisma/client');
const crypto = require("crypto");

const prisma = new PrismaClient();

function safeEqual(a, b) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function comparePassword(password, hash) {
  try {
    const [salt, key] = hash.split(":");
    if (!salt || !key) return false;
    const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
    return safeEqual(key, derivedKey);
  } catch (e) {
    console.error("comparePassword error", e);
    return false;
  }
}

async function main() {
  const profiles = await prisma.profile.findMany();
  const p = profiles.find(x => x.passwordHash);
  if (!p) {
    console.log("No profile with passwordHash!");
    return;
  }
  console.log("Found hash:", p.passwordHash);
  // We don't know the password, but we can update it and check
  
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync("admin123", salt, 64).toString("hex");
  const hash = `${salt}:${derivedKey}`;
  
  await prisma.profile.updateMany({
    data: { passwordHash: hash }
  });
  console.log("Updated password to admin123");
  
  const profilesAfter = await prisma.profile.findMany();
  const pAfter = profilesAfter.find(x => x.passwordHash);
  
  const match = comparePassword("admin123", pAfter.passwordHash);
  console.log("Match admin123:", match);
}

main().finally(() => prisma.$disconnect());
