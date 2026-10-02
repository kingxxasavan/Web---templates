import { randomBytes, randomUUID } from "node:crypto";
import { withReadTimeout } from "./read-timeout.js";
import { cache } from "react";
import { firebaseUser } from "./firebase.js";
import { cookies } from "next/headers";
import { readOrFallback } from "./db.js";
import { backend } from "./backend.js";
import { createUser, findUserByEmail } from "./accounts.js";
import {
  hashPassword,
  verifyPassword,
  hashToken,
  validateCredentials,
  EMAIL_RE,
} from "./password.js";

export { hashPassword, verifyPassword, validateCredentials, EMAIL_RE };
export { createUser, findUserByEmail };

const SESSION_COOKIE = "sid";
const SESSION_DAYS = 30;

/* ----------------------------------------------------------------- sessions */

export async function createSession(userId) {
  // The raw token only ever exists in the cookie; the database stores its
  // hash, so a leaked database dump cannot be replayed as a login.
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  const expires = now + SESSION_DAYS * 86_400_000;

  await backend().createSessionRecord(hashToken(token), userId, now, expires);

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });

  return token;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await backend().deleteSession(hashToken(token));
  jar.delete(SESSION_COOKIE);
  jar.delete("firebase_refresh");
}

/** The signed-in user, or null. Safe to call from any server component. */
export const currentUser = cache(async () => {
  const token = (await cookies()).get("firebase_refresh")?.value;
  if (!token) return null;
  let identity;
  try { identity = await withReadTimeout(() => firebaseUser(token), 5000, "Firebase authentication"); } catch { return null; }
  if (!identity) return null;
  const user = await readOrFallback(() => backend().findFirebaseUser(identity.localId), null);
  return user
    ? { id: user.id, email: user.email, emailVerified: Boolean(identity.emailVerified) }
    : null;
});

export async function createFirebaseSession(refreshToken) {
  const jar = await cookies();
  jar.set("firebase_refresh", refreshToken, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", maxAge: 30 * 86400,
  });
  jar.delete(SESSION_COOKIE);
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new Response("Unauthorized", { status: 401 });
  return user;
}

/* ------------------------------------------------------------- brute force */

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60_000;

export async function tooManyAttempts(key) {
  const row = await backend().readAttempts(key);
  if (!row) return false;
  if (Date.now() - Number(row.firstAt) > WINDOW_MS) {
    await backend().clearAttempts(key);
    return false;
  }
  return Number(row.count) >= MAX_ATTEMPTS;
}

export async function recordAttempt(key) {
  await backend().bumpAttempts(key);
}

export async function clearAttempts(key) {
  await backend().clearAttempts(key);
}

/* ------------------------------------------------------------------- CSRF */

/**
 * SameSite=Lax already stops a cross-site form POST from carrying the session
 * cookie. Checking Origin against Host closes the gap for fetch-based
 * requests and anything that arrives without the browser's protection.
 */
export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser client; the cookie check still applies
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}
