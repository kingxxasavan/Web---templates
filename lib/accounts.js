import { randomBytes, randomUUID } from "node:crypto";
import { queryOne, run, getDb } from "./db.js";
import { hashPassword, hashToken } from "./password.js";

/**
 * Account operations that touch the database but not the request, so they can
 * be unit tested without the Next.js runtime.
 */

const RESET_TTL_MS = 60 * 60_000; // one hour

export async function createUser(email, password) {
  const id = randomUUID();
  await run(
    `INSERT INTO users (id, email, password, created_at) VALUES (?, ?, ?, ?)`,
    [id, email, await hashPassword(password), Date.now()]
  );
  return { id, email };
}

export async function findUserByEmail(email) {
  return queryOne(`SELECT * FROM users WHERE email = ?`, [email]);
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

  const db = await getDb();
  await db.batch(
    [
      { sql: `DELETE FROM password_resets WHERE user_id = ?`, args: [userId] },
      {
        sql: `INSERT INTO password_resets (token_hash, user_id, created_at, expires_at)
              VALUES (?, ?, ?, ?)`,
        args: [hashToken(token), userId, now, now + RESET_TTL_MS],
      },
    ],
    "write"
  );

  return token;
}

/** Returns the user id if the token is valid, unused and unexpired. */
export async function checkPasswordReset(token) {
  if (typeof token !== "string" || !token) return null;

  const row = await queryOne(
    `SELECT user_id, expires_at, used_at FROM password_resets WHERE token_hash = ?`,
    [hashToken(token)]
  );
  if (!row) return null;
  if (row.used_at) return null;
  if (Number(row.expires_at) < Date.now()) return null;

  return row.user_id;
}

/**
 * Sets a new password and burns the token. Every existing session for the
 * account is destroyed in the same batch — if the reset was triggered because
 * someone else had access, that access ends here.
 */
export async function resetPassword(token, newPassword) {
  const userId = await checkPasswordReset(token);
  if (!userId) return null;

  const db = await getDb();
  await db.batch(
    [
      {
        sql: `UPDATE users SET password = ? WHERE id = ?`,
        args: [await hashPassword(newPassword), userId],
      },
      {
        sql: `UPDATE password_resets SET used_at = ? WHERE token_hash = ?`,
        args: [Date.now(), hashToken(token)],
      },
      { sql: `DELETE FROM sessions WHERE user_id = ?`, args: [userId] },
      { sql: `DELETE FROM login_attempts WHERE key = (SELECT email FROM users WHERE id = ?)`, args: [userId] },
    ],
    "write"
  );

  return userId;
}
