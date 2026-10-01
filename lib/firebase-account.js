import { backend } from "./backend.js";
import { verifyPassword } from "./password.js";

export async function syncFirebaseAccount(identity, password) {
  const storage = backend();
  const linked = await storage.findFirebaseUser(identity.localId);
  if (linked) return linked;
  const email = identity.email.trim().toLowerCase();
  const existing = await storage.findUserByEmail(email);
  if (existing) {
    if (existing.firebase_uid || existing.firebaseUid ||
        (!identity.emailVerified && !(await verifyPassword(password, existing.password)))) {
      const error = new Error("Verify your email in Firebase before linking your existing store account.");
      error.publicMessage = error.message;
      throw error;
    }
    return storage.linkFirebaseUser(existing.id, identity.localId);
  }
  return storage.createFirebaseUser(email, identity.localId);
}
