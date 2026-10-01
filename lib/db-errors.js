/**
 * Turns a data-layer exception into something a user and an operator can both
 * act on. A write that fails because nothing is configured is by far the most
 * likely cause in a fresh deployment, and "Something went wrong" sends whoever
 * is debugging it looking in the wrong place.
 */

import { rtdbConfigured } from "./backends/rtdb/client.js";

export const NOT_CONFIGURED =
  "The store's database isn't set up yet, so accounts can't be created. " +
  "If you run this site: connect Firebase Realtime Database with " +
  "FIREBASE_SERVICE_ACCOUNT and FIREBASE_DATABASE_URL, or set DATABASE_URL " +
  "for libSQL (see the README).";

export const UNREACHABLE =
  "We couldn't reach the database just now. Please try again in a moment.";

/**
 * True when no database is configured at all and the app has fallen back to
 * its development-only local file — which on a serverless host is read-only.
 */
export function usingLocalFile() {
  return !rtdbConfigured() && !process.env.DATABASE_URL;
}

export function describeDbError(err) {
  const msg = String(err?.message ?? err);

  // A read-only or missing filesystem is what a serverless host gives you when
  // DATABASE_URL was never set and the file: fallback is in play.
  const readOnly =
    /EROFS|read-only|SQLITE_CANTOPEN|ENOENT|unable to open database/i.test(msg);

  if (usingLocalFile() && readOnly) {
    return { status: 503, message: NOT_CONFIGURED, reason: "not_configured" };
  }
  if (usingLocalFile()) {
    return { status: 503, message: NOT_CONFIGURED, reason: "not_configured" };
  }
  if (/ENOTFOUND|ECONNREFUSED|fetch failed|ETIMEDOUT|EAI_AGAIN/i.test(msg)) {
    return { status: 503, message: UNREACHABLE, reason: "unreachable" };
  }
  // By far the most common Firebase setup mistake: the service account JSON
  // pasted into the host with quoting mangled, or only partially copied.
  if (/FIREBASE_SERVICE_ACCOUNT is not valid JSON|Unexpected token|JSON at position/i.test(msg)) {
    return {
      status: 503,
      message:
        "FIREBASE_SERVICE_ACCOUNT isn't valid JSON. Paste the entire service " +
        "account key file as one environment variable, including the braces.",
      reason: "bad_service_account",
    };
  }
  if (/private_key|DECODER|PEM|Invalid PEM/i.test(msg)) {
    return {
      status: 503,
      message:
        "The Firebase private key couldn't be read. Paste the service account " +
        "JSON exactly as downloaded — the \\n escapes in private_key matter.",
      reason: "bad_private_key",
    };
  }
  if (/Can't determine Firebase Database URL|databaseURL/i.test(msg)) {
    return {
      status: 503,
      message:
        "FIREBASE_DATABASE_URL is missing or malformed. It looks like " +
        "https://your-project-default-rtdb.firebaseio.com",
      reason: "bad_database_url",
    };
  }
  if (/permission_denied|PERMISSION_DENIED/i.test(msg)) {
    return {
      status: 503,
      message:
        "Firebase refused the write. Check your Realtime Database rules and " +
        "that FIREBASE_SERVICE_ACCOUNT belongs to this project.",
      reason: "permission_denied",
    };
  }
  if (/UNAUTHORIZED|401|403|invalid_grant|auth/i.test(msg)) {
    return {
      status: 503,
      message:
        "The database rejected our credentials. Check FIREBASE_SERVICE_ACCOUNT " +
        "or DATABASE_AUTH_TOKEN.",
      reason: "unauthorized",
    };
  }
  return {
    status: 500,
    message: "Something went wrong on our end. Please try again.",
    reason: "unknown",
  };
}

/**
 * Wraps a write route. Logs the real error server-side — where an operator can
 * read it — and returns a message the visitor can do something with.
 */
export async function guardWrite(fn, json) {
  try {
    return await fn();
  } catch (err) {
    const { status, message, reason } = describeDbError(err);
    console.error(`[db:${reason}]`, err?.message ?? err);
    return json({ error: message, reason }, { status });
  }
}
