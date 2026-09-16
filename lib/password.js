import { randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";

/**
 * Pure crypto helpers, deliberately free of any Next.js import so they can be
 * unit-tested and reused outside a request.
 */

const scryptAsync = promisify(scrypt);
const KEYLEN = 64;

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, KEYLEN);
  return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifyPassword(password, stored) {
  const [scheme, saltHex, keyHex] = String(stored).split(":");
  if (scheme !== "scrypt" || !saltHex || !keyHex) return false;

  const expected = Buffer.from(keyHex, "hex");
  if (expected.length !== KEYLEN) return false;

  const actual = await scryptAsync(
    password,
    Buffer.from(saltHex, "hex"),
    KEYLEN
  );
  return timingSafeEqual(expected, actual);
}

export const hashToken = (token) =>
  createHash("sha256").update(token).digest("hex");

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateCredentials(email, password) {
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return "Enter a valid email address.";
  }
  if (typeof password !== "string" || password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (password.length > 200) return "Password is too long.";
  return null;
}
