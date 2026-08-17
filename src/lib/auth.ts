import { cookies } from "next/headers";
import crypto from "crypto";
import { db } from "@/lib/db";

const COOKIE_NAME = "admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "[auth] SESSION_SECRET is not set. Please add it to your .env file."
    );
  }
  return secret;
}

function getPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error(
      "[auth] ADMIN_PASSWORD is not set. Please add it to your .env file."
    );
  }
  return password;
}

/**
 * Constant-time string comparison to avoid timing attacks.
 */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

type SessionPayload = { exp: number };

function sign(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

function verify(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const secret = getSecret();
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [body, sig] = parts;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("base64url");
    // timing-safe compare of signatures
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    if (!crypto.timingSafeEqual(a, b)) return false;
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as SessionPayload;
    if (typeof payload.exp !== "number") return false;
    if (Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function comparePassword(password: string, hash: string): boolean {
  try {
    const [salt, key] = hash.split(":");
    if (!salt || !key) return false;
    const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
    return safeEqual(key, derivedKey);
  } catch {
    return false;
  }
}

export async function verifyPassword(password: string): Promise<boolean> {
  try {
    const profiles = await db.profile.findMany({
      where: { id: { in: ["profile-vi", "profile-en", "profile"] } },
    });
    const profile = profiles.find((p) => p.passwordHash);

    if (profile && profile.passwordHash) {
      return comparePassword(password, profile.passwordHash);
    }
  } catch (e) {
    console.error("[auth] Error checking password hash in DB", e);
  }
  
  // Fallback to env password
  try {
    return safeEqual(password, getPassword());
  } catch {
    return false;
  }
}

export async function createSession(): Promise<void> {
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const token = sign({ exp });
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return verify(store.get(COOKIE_NAME)?.value);
}

/** For use in API route handlers — returns a 401 JSON response if not authed. */
export async function requireAuth(): Promise<{ ok: true } | Response> {
  const authed = await isAuthed();
  if (!authed) {
    return new Response(
      JSON.stringify({ ok: false, message: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  return { ok: true };
}
