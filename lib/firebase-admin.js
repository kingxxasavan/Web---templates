/**
 * Server-side Firebase. Accounts live in Firebase Authentication and every
 * piece of store data (orders, libraries, reviews, messages) in Firestore.
 * The browser never talks to Firestore directly — all reads and writes go
 * through these server routes, so firestore.rules can deny everything.
 *
 * Credentials come from a service account, given either as the whole JSON
 * file in FIREBASE_SERVICE_ACCOUNT (raw or base64) or as three separate
 * variables. With the emulators running, a project id is enough.
 *
 * The SDK is loaded on first use rather than imported at the top. Every page
 * reaches this module through the session check, so if the SDK ever fails to
 * load (an unsupported Node version, a broken install) a static import would
 * take the whole site down with a 500. Loaded lazily, the failure surfaces as
 * a failed read, which the storefront already survives.
 */

let sdk;
const loadSdk = () =>
  (sdk ??= Promise.all([
    import("firebase-admin/app"),
    import("firebase-admin/auth"),
    import("firebase-admin/firestore"),
  ]).then(([app, auth, firestore]) => ({ app, auth, firestore })));

function serviceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (raw) {
    const json = raw.startsWith("{")
      ? raw
      : Buffer.from(raw, "base64").toString("utf8");
    const parsed = JSON.parse(json);
    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key,
    };
  }

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } =
    process.env;
  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    return {
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      // Vercel and most dashboards store the key with literal "\n"s.
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
  }
  return null;
}

const usingEmulators = () =>
  Boolean(
    process.env.FIRESTORE_EMULATOR_HOST &&
      process.env.FIREBASE_AUTH_EMULATOR_HOST
  );

const emulatorProjectId = () =>
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  "demo-foundry";

/** Names of the server variables still missing, for the setup notice. */
export function missingServerConfig() {
  if (usingEmulators()) return [];
  try {
    if (serviceAccount()) return [];
  } catch {
    return ["FIREBASE_SERVICE_ACCOUNT (could not be parsed as JSON)"];
  }
  return ["FIREBASE_SERVICE_ACCOUNT"];
}

export const firebaseConfigured = () => missingServerConfig().length === 0;

export class FirebaseNotConfigured extends Error {
  constructor() {
    super(
      "Firebase is not configured on the server. Set FIREBASE_SERVICE_ACCOUNT — see the README."
    );
    this.name = "FirebaseNotConfigured";
  }
}

async function app() {
  const { initializeApp, getApps, cert } = (await loadSdk()).app;
  const existing = getApps()[0];
  if (existing) return existing;

  if (usingEmulators()) {
    return initializeApp({ projectId: emulatorProjectId() });
  }

  const account = serviceAccount();
  if (!account) throw new FirebaseNotConfigured();
  return initializeApp({
    credential: cert(account),
    projectId: account.projectId,
  });
}

// Kept on globalThis because Next.js can load this module more than once in
// one process (per route bundle, and on every dev reload), while Firestore
// only accepts settings() once per app.
const cache = globalThis;

export async function db() {
  if (!cache.__foundryFirestore) {
    const { getFirestore } = (await loadSdk()).firestore;
    const firestore = getFirestore(await app());
    try {
      // Optional fields (a review with no title) are simply left out.
      firestore.settings({ ignoreUndefinedProperties: true });
    } catch {
      // Already configured by another copy of this module; same settings.
    }
    cache.__foundryFirestore = firestore;
  }
  return cache.__foundryFirestore;
}

export async function adminAuth() {
  const { getAuth } = (await loadSdk()).auth;
  return getAuth(await app());
}

/* ------------------------------------------------------------- resilience */

let warned = false;

/**
 * Runs a read, returning `fallback` if Firebase is unreachable or not yet
 * configured. The storefront is built from the static catalogue, so a
 * visitor browsing never sees an error page — only the personal extras
 * (ratings, ownership) degrade. Writes never use this: a purchase that
 * silently does nothing is worse than an error.
 */
export async function readOrFallback(fn, fallback) {
  try {
    return await fn();
  } catch (err) {
    if (!warned) {
      warned = true;
      console.warn(`[firebase] read failed, serving catalogue only: ${err.message}`);
    }
    return fallback;
  }
}
