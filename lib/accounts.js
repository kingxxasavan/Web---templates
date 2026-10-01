import { randomBytes } from "node:crypto";
import { backend } from "./backend.js";
import { hashPassword, hashToken } from "./password.js";

/**
 * Account operations. Free of any Next.js import, so they can be unit tested
 * against either backend without the framework runtime.
 */

const RESET_TTL_MS = 60 * 60_000; // one hour

export async function createUser(email, password) {
  return backend().createUser(email, password);
}

export async function findUserByEmail(email) {
  return backend().findUserByEmail(email);
}

/**
 * Issues a single-use reset token. Only its hash is stored, so the database
 * never holds anything that could be mailed to a user. Any token already
 * outstanding for the account is dropped, so the newest link is the only one
 * that works.
 */
export async function createPasswordReset(userId) {
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  await backend().createReset(hashToken(token), userId, now, now + RESET_TTL_MS);
  return token;
}

/** Returns the user id if the token is valid, unused and unexpired. */
export async function checkPasswordReset(token) {
  if (typeof token !== "string" || !token) return null;

  const row = await backend().findReset(hashToken(token));
  if (!row) return null;
  if (row.usedAt) return null;
  if (Number(row.expiresAt) < Date.now()) return null;

  return row.userId;
}

/**
 * Sets a new password and burns the token. Every existing session for the
 * account is destroyed in the same write — if the reset was triggered because
 * someone else had access, that access ends here.
 */
export async function resetPassword(token, newPassword) {
  const userId = await checkPasswordReset(token);
  if (!userId) return null;

  const email = await backend().userEmail(userId);
  await backend().consumeReset(
    hashToken(token),
    userId,
    await hashPassword(newPassword),
    email ?? ""
  );
  return userId;
}
