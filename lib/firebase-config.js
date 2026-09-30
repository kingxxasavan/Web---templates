/**
 * The public Firebase web config. These values are not secrets — Firebase
 * identifies the project with them; the service account is what grants
 * access, and it never leaves the server.
 *
 * Kept free of any Firebase import so server components can check it
 * without loading the browser SDK. Each variable is referenced literally so
 * Next.js can inline it at build time.
 */
export const clientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const authEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;

export function missingClientConfig() {
  if (authEmulatorHost) return [];
  return [
    ["NEXT_PUBLIC_FIREBASE_API_KEY", clientConfig.apiKey],
    ["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", clientConfig.authDomain],
    ["NEXT_PUBLIC_FIREBASE_PROJECT_ID", clientConfig.projectId],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);
}
