import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  setPersistence,
  inMemoryPersistence,
} from "firebase/auth";
import { clientConfig as config, authEmulatorHost as emulator } from "./firebase-config.js";

/** Browser-side Firebase, used only to sign in. */
let auth;

export async function clientAuth() {
  if (auth) return auth;
  const app =
    getApps()[0] ??
    initializeApp(
      emulator
        ? { apiKey: "demo-key", projectId: config.projectId || "demo-foundry", authDomain: "localhost" }
        : config
    );
  auth = getAuth(app);
  if (emulator) connectAuthEmulator(auth, `http://${emulator}`, { disableWarnings: true });
  // The server session cookie is the only login state. Keeping nothing in the
  // browser means signing out on the server really signs the visitor out.
  await setPersistence(auth, inMemoryPersistence);
  return auth;
}

/** Firebase error codes, in words a buyer can act on. */
export function authErrorMessage(err) {
  const code = err?.code ?? "";
  const messages = {
    "auth/email-already-in-use": "An account with that email already exists. Try signing in instead.",
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/weak-password": "Choose a longer password — at least 8 characters.",
    "auth/missing-password": "Enter a password.",
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/wrong-password": "Email or password is incorrect.",
    "auth/user-not-found": "Email or password is incorrect.",
    "auth/user-disabled": "This account has been disabled. Contact us if that's unexpected.",
    "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
    "auth/network-request-failed": "Couldn't reach the sign-in service. Check your connection and try again.",
    "auth/popup-closed-by-user": "The Google window was closed before signing in finished.",
    "auth/cancelled-popup-request": "The Google window was closed before signing in finished.",
    "auth/popup-blocked": "Your browser blocked the Google window. Allow pop-ups for this site and try again.",
    "auth/account-exists-with-different-credential": "That email is already registered with a password. Sign in with it instead.",
    // The two setup mistakes that most often break a fresh Firebase project.
    "auth/operation-not-allowed": "This sign-in method isn't switched on yet. (Site owner: enable it under Firebase → Authentication → Sign-in method.)",
    "auth/unauthorized-domain": "Sign-in isn't allowed from this address yet. (Site owner: add this domain under Firebase → Authentication → Settings → Authorized domains.)",
    "auth/invalid-api-key": "Sign-in is misconfigured. (Site owner: check NEXT_PUBLIC_FIREBASE_API_KEY.)",
    "auth/api-key-not-valid.-please-pass-a-valid-api-key.": "Sign-in is misconfigured. (Site owner: check NEXT_PUBLIC_FIREBASE_API_KEY.)",
    "auth/configuration-not-found": "Firebase Authentication isn't set up for this project yet. (Site owner: open Authentication in the Firebase console and click Get started.)",
  };
  return messages[code] ?? (err?.message ? `Sign-in failed: ${err.message}` : "Sign-in failed. Please try again.");
}
