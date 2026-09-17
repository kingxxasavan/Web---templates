"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";

/**
 * Firebase Analytics, initialised in the browser only.
 *
 * A Firebase web config is public by design — it ships inside the JavaScript
 * bundle of every Firebase web app and identifies the project rather than
 * authenticating it. What actually protects your data is your Firestore and
 * Realtime Database security rules, so those are worth reviewing before this
 * project holds anything real.
 *
 * Server-side access (orders, accounts) is a different matter and needs a
 * service account key, which is a genuine secret. See the README.
 */

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const firebaseConfigured = Boolean(config.apiKey && config.projectId);

let analyticsPromise;

function app() {
  return getApps().length ? getApp() : initializeApp(config);
}

/** Resolves to an Analytics instance, or null where it isn't supported. */
function analytics() {
  if (!firebaseConfigured) return Promise.resolve(null);
  if (!analyticsPromise) {
    analyticsPromise = isSupported()
      .then((ok) => (ok ? getAnalytics(app()) : null))
      .catch(() => null);
  }
  return analyticsPromise;
}

/**
 * Records an event. Never throws — an ad blocker or an unsupported browser
 * should cost you a data point, not a working page.
 */
export async function track(name, params = {}) {
  try {
    const a = await analytics();
    if (a) logEvent(a, name, params);
  } catch {
    /* analytics is best-effort by design */
  }
}
