import { withReadTimeout } from "@/lib/read-timeout";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { backend, backendName } from "@/lib/backend";
import { describeDbError, usingLocalFile } from "@/lib/db-errors";
import { envReport } from "@/lib/env-report";

/**
 * A one-call answer to "why can't anyone sign up?".
 *
 * Reports only whether each piece is configured and reachable — never a
 * credential, a host or a token — so it is safe to leave reachable in
 * production and paste into a bug report.
 */
export async function GET() {
  const checks = {};
  const env = envReport();

  // database
  if (usingLocalFile()) {
    checks.database = {
      ok: false,
      configured: false,
      detail:
        "DATABASE_URL is not set, so the app is on its development-only " +
        "local file. On a serverless host that filesystem is read-only, " +
        "which is why sign-up fails while browsing still works.",
      missing: env.firebase.missing,
      fix: env.firebase.serviceAccount.problem
        ? `FIREBASE_SERVICE_ACCOUNT: ${env.firebase.serviceAccount.problem}`
        : env.firebase.missing.length
          ? `Not visible to this deployment: ${env.firebase.missing.join(", ")}. ` +
            "Add them in Vercel, tick every environment, then REDEPLOY — " +
            "environment variables only reach a new build."
          : "Set FIREBASE_SERVICE_ACCOUNT and FIREBASE_DATABASE_URL, or DATABASE_URL.",
    };
  } else {
    try {
      // A read that touches the real store, whichever backend is active.
      await withReadTimeout(async () => {
        if (backendName() === "rtdb") await backend().countUsers();
        else await (await getDb()).execute("SELECT 1");
      }, 6000);
      checks.database = {
        ok: true,
        configured: true,
        backend: backendName() === "rtdb" ? "Firebase Realtime Database" : "libSQL",
        detail: "Reachable.",
      };
    } catch (err) {
      const { message, reason } = describeDbError(err);
      // A service account that is present but malformed lands here, so carry
      // the specific diagnosis across rather than reporting a bare failure.
      const setupProblem = env.firebase.serviceAccount.problem;
      checks.database = {
        ok: false,
        configured: true,
        backend: backendName() === "rtdb" ? "Firebase Realtime Database" : "libSQL",
        reason: setupProblem ? "bad_service_account" : reason,
        detail: message,
        fix:
          setupProblem ??
          env.firebase.projectMismatch ??
          "Check the database credentials and that the service is reachable.",
      };
    }
  }

  const flag = (value, detail) => ({ok: Boolean(value), configured: Boolean(value), detail});
  const paymentsReady = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
  checks.payments = flag(paymentsReady, paymentsReady
    ? "Stripe key and webhook secret configured." : "Checkout needs STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.");
  checks.email = flag(process.env.RESEND_API_KEY, process.env.RESEND_API_KEY
    ? "Resend configured for receipts." : "Purchase receipts are logged. Firebase sends password-reset emails.");
  checks.analytics = flag(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    ? "Firebase Analytics configured." : "Firebase Analytics not configured.");
  checks.admin = flag(process.env.ADMIN_EMAILS, process.env.ADMIN_EMAILS ? "Admin allowlist set." : "No admin configured.");

  // Only the database stops the store working; the rest degrade by design.
  const healthy = checks.database.ok;

  return NextResponse.json(
    {
      healthy,
      summary: healthy
        ? "Accounts and orders are working."
        : "Accounts and orders are unavailable — see checks.database.",
      checks,
      env,
    },
    { status: healthy ? 200 : 503 }
  );
}
