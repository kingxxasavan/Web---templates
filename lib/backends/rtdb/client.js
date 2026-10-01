/**
 * Realtime Database access, kept to a deliberately small surface:
 * ref(path) with get / set / update / remove / transaction, plus one
 * multi-location update on the root for atomic writes.
 *
 * A small surface is what lets the whole backend be exercised against an
 * in-memory double in tests, and it avoids leaning on RTDB query features
 * that behave differently between the emulator and production.
 */

let cached;

export function rtdbConfigured() {
  return Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT &&
      (process.env.FIREBASE_DATABASE_URL ||
        process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL)
  );
}

/** Lets the tests drive every operation against a double. */
export function setDatabase(db) {
  cached = db;
}

export async function getDatabaseRef() {
  if (cached) return cached;

  const { initializeApp, getApps, getApp, cert } = await import(
    "firebase-admin/app"
  );
  const { getDatabase } = await import("firebase-admin/database");

  let credentials;
  try {
    credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT is not valid JSON. Paste the whole service " +
        "account key file as a single environment variable."
    );
  }

  const databaseURL =
    process.env.FIREBASE_DATABASE_URL ||
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

  const app = getApps().length
    ? getApp()
    : initializeApp({ credential: cert(credentials), databaseURL });

  cached = getDatabase(app);
  return cached;
}

/**
 * RTDB keys cannot contain . # $ [ ] or /, which rules out using an email
 * address directly. base64url round-trips any address safely.
 */
export const encodeKey = (value) =>
  Buffer.from(String(value), "utf8").toString("base64url");

export const decodeKey = (key) =>
  Buffer.from(String(key), "base64url").toString("utf8");

/** RTDB omits empty nodes entirely, so absent and empty are the same thing. */
export const rowsOf = (val) =>
  val && typeof val === "object" ? Object.entries(val) : [];
