// Public Firebase web configuration supplied for this store.
export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCy-_vfPb1IhJqpIadOL3WWMM5RRiTMjCQ",
  authDomain: "megan-74585.firebaseapp.com",
  databaseURL: "https://megan-74585-default-rtdb.firebaseio.com",
  projectId: "megan-74585",
  storageBucket: "megan-74585.firebasestorage.app",
  messagingSenderId: "887765836988",
  appId: "1:887765836988:web:0a4133115e8e37d8485cb9",
  measurementId: "G-CX7VW51NB6",
};

// Use Firebase's HTTPS Auth API on the server: passwords and refresh tokens
// never enter localStorage, and no privileged service-account key is needed.
export async function firebaseAuth(method, body) {
  const response = await fetch(
    "https://identitytoolkit.googleapis.com/v1/accounts:" + method + "?key=" + firebaseConfig.apiKey,
    { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body), cache: "no-store", signal: AbortSignal.timeout(15000) }
  );
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error?.message || "Firebase authentication failed.");
    error.code = data.error?.message?.split(" : ")[0];
    error.provider = "firebase-auth";
    throw error;
  }
  return data;
}

/** Exchanges the session's refresh token for a short-lived ID token. */
export async function idTokenFor(refreshToken) {
  const response = await fetch(
    "https://securetoken.googleapis.com/v1/token?key=" + firebaseConfig.apiKey,
    { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
      cache: "no-store", signal: AbortSignal.timeout(15000) }
  );
  if (!response.ok) return null;
  return (await response.json()).id_token ?? null;
}

export async function firebaseUser(refreshToken) {
  const idToken = await idTokenFor(refreshToken);
  if (!idToken) return null;
  const data = await firebaseAuth("lookup", { idToken });
  return data.users?.[0] || null;
}

/** Asks Firebase to email the signed-in user a verification link. */
export async function sendVerificationEmail(idToken) {
  await firebaseAuth("sendOobCode", { requestType: "VERIFY_EMAIL", idToken });
}

export function authError(error) {
  const messages = {
    API_KEY_INVALID: "The Firebase web API key is invalid. Check FIREBASE_API_KEY or NEXT_PUBLIC_FIREBASE_API_KEY in Vercel.",
    INVALID_API_KEY: "The Firebase web API key is invalid. Check FIREBASE_API_KEY or NEXT_PUBLIC_FIREBASE_API_KEY in Vercel.",
    INVALID_EMAIL: "Enter a valid email address.",
    EMAIL_EXISTS: "An account with that email already exists. Sign in instead.",
    INVALID_LOGIN_CREDENTIALS: "Email or password is incorrect.",
    INVALID_PASSWORD: "Email or password is incorrect.",
    EMAIL_NOT_FOUND: "Email or password is incorrect.",
    TOO_MANY_ATTEMPTS_TRY_LATER: "Too many attempts. Please try again later.",
    CONFIGURATION_NOT_FOUND: "Firebase Authentication is not configured. Enable Email/Password in the Firebase console.",
    OPERATION_NOT_ALLOWED: "Email/password sign-in must be enabled in Firebase.",
    PASSWORD_LOGIN_DISABLED: "Email/password sign-in must be enabled in Firebase.",
    USER_DISABLED: "This account has been disabled.",
    WEAK_PASSWORD: "Choose a stronger password.",
    INVALID_OOB_CODE: "That reset link has expired or already been used.",
    EXPIRED_OOB_CODE: "That reset link has expired or already been used.",
  };
  return messages[error.code] || "Unable to complete this request. Please try again.";
}
