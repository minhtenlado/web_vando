const crypto = require("crypto");
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}
function comparePassword(password, hash) {
  const [salt, key] = hash.split(":");
  if (!salt || !key) return false;
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return key === derivedKey; // not using timingSafeEqual here to keep it simple
}
const hash = hashPassword("123456");
console.log("hash:", hash);
console.log("match:", comparePassword("123456", hash));
