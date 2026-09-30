import { cache } from "react";
import { cookies } from "next/headers";
import { adminAuth, db, readOrFallback } from "./firebase-admin.js";

/**
 * Sign-in happens in the browser with the Firebase Auth SDK, which then hands
 * its ID token to /api/auth/session. The server swaps that for a Firebase
 * session cookie — httpOnly, so page scripts can never read it — and every
 * server component and route identifies the buyer from that cookie alone.
 */

const SESSION_COOKIE = "session";
// Firebase caps session cookies at two weeks.
const SESSION_DAYS = 14;
// Only a token from a sign-in that just happened may become a session, so a
// stolen, older ID token cannot be upgraded into a two-week cookie.
const MAX_SIGN_IN_AGE_S = 5 * 60;

export class AuthError extends Error {
  constructor(message, status = 401) {
    super(message);
    this.status = status;
  }
}

export async function createSession(idToken) {
  if (typeof idToken !== "string" || !idToken) {
    throw new AuthError("Missing sign-in token.", 400);
  }

  const auth = adminAuth();
  let decoded;
  try {
    decoded = await auth.verifyIdToken(idToken);
  } catch {
    throw new AuthError("That sign-in could not be verified. Please try again.");
  }

  if (Date.now() / 1000 - decoded.auth_time > MAX_SIGN_IN_AGE_S) {
    throw new AuthError("Please sign in again.");
  }
  if (!decoded.email) {
    throw new AuthError("That account has no email address attached.", 400);
  }

  const expiresIn = SESSION_DAYS * 86_400_000;
  const cookie = await auth.createSessionCookie(idToken, { expiresIn });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, cookie, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: expiresIn / 1000,
  });

  // A profile row for the dashboard and receipts. `create` fails if it
  // already exists, which is how first sign-in is told apart from later ones.
  const ref = db().collection("users").doc(decoded.uid);
  const profile = {
    email: decoded.email.toLowerCase(),
    provider: decoded.firebase?.sign_in_provider ?? "password",
    lastSignInAt: Date.now(),
  };
  await ref.create({ ...profile, createdAt: Date.now() }).catch(() =>
    ref.set(profile, { merge: true })
  );

  return { id: decoded.uid, email: profile.email };
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

/**
 * The signed-in buyer, or null. Cached per request, so the masthead and the
 * page can both ask without verifying the cookie twice.
 */
export const currentUser = cache(async () => {
  const jar = await cookies();
  const cookie = jar.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;

  const decoded = await readOrFallback(
    () => adminAuth().verifySessionCookie(cookie),
    null
  );
  if (!decoded?.email) return null;

  return {
    id: decoded.uid,
    email: decoded.email.toLowerCase(),
    emailVerified: Boolean(decoded.email_verified),
  };
});

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
