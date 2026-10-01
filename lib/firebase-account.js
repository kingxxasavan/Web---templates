import { randomUUID } from "node:crypto";
import { queryOne, run } from "./db.js";
import { verifyPassword } from "./password.js";

export async function syncFirebaseAccount(identity, password) {
  const email = identity.email.trim().toLowerCase();
  let user = await queryOne("SELECT * FROM users WHERE firebase_uid = ?", [identity.localId]);
  if (user) return user;
  user = await queryOne("SELECT * FROM users WHERE email = ?", [email]);
  if (user) {
    // Preserve existing purchases only after proof of ownership of the old
    // account. An unverified Firebase email alone is not that proof.
    if (user.firebase_uid || (!identity.emailVerified && !(await verifyPassword(password, user.password)))) {
      const error = new Error("Verify your email in Firebase before linking your existing store account.");
      error.publicMessage = error.message;
      throw error;
    }
    const result = await run("UPDATE users SET firebase_uid = ? WHERE id = ? AND firebase_uid IS NULL", [identity.localId, user.id]);
    if (!result.rowsAffected) throw new Error("Account was linked by another request. Please sign in again.");
    return user;
  }
  const id = randomUUID();
  await run("INSERT INTO users (id, email, password, created_at, firebase_uid) VALUES (?, ?, ?, ?, ?)",
    [id, email, "firebase-managed", Date.now(), identity.localId]);
  return { id, email };
}
