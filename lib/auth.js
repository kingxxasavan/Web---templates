import { randomBytes, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { queryOne, run, readOrFallback } from "./db.js";
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

  await run(
    `INSERT INTO sessions (token_hash, user_id, created_at, expires_at)
     VALUES (?, ?, ?, ?)`,
    [hashToken(token), userId, now, expires]
  );

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
  if (token) {
    await run(`DELETE FROM sessions WHERE token_hash = ?`, [hashToken(token)]);
  }
  jar.delete(SESSION_COOKIE);
}

/** The signed-in user, or null. Safe to call from any server component. */
export async function currentUser() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const row = await readOrFallback(
    () =>
      queryOne(
        `SELECT u.id, u.email, s.expires_at
           FROM sessions s
           JOIN users u ON u.id = s.user_id
          WHERE s.token_hash = ?`,
        [hashToken(token)]
      ),
    null
  );
  if (!row) return null;

  if (Number(row.expires_at) < Date.now()) {
    await run(`DELETE FROM sessions WHERE token_hash = ?`, [hashToken(token)]);
    return null;
  }

  return { id: row.id, email: row.email };
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
  const row = await queryOne(
    `SELECT count, first_at FROM login_attempts WHERE key = ?`,
    [key]
  );
  if (!row) return false;
  if (Date.now() - Number(row.first_at) > WINDOW_MS) {
    await run(`DELETE FROM login_attempts WHERE key = ?`, [key]);
    return false;
  }
  return Number(row.count) >= MAX_ATTEMPTS;
}

export async function recordAttempt(key) {
  await run(
    `INSERT INTO login_attempts (key, count, first_at)
     VALUES (?, 1, ?)
     ON CONFLICT(key) DO UPDATE SET count = count + 1`,
    [key, Date.now()]
  );
}

export async function clearAttempts(key) {
  await run(`DELETE FROM login_attempts WHERE key = ?`, [key]);
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
