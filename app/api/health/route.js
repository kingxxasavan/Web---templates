import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { backend, backendName } from "@/lib/backend";
import { describeDbError, usingLocalFile } from "@/lib/db-errors";

/**
 * A one-call answer to "why can't anyone sign up?".
 *
 * Reports only whether each piece is configured and reachable — never a
 * credential, a host or a token — so it is safe to leave reachable in
 * production and paste into a bug report.
 */
export async function GET() {
  const checks = {};

  // database
  if (usingLocalFile()) {
    checks.database = {
      ok: false,
      configured: false,
      detail:
        "DATABASE_URL is not set, so the app is on its development-only " +
        "local file. On a serverless host that filesystem is read-only, " +
        "which is why sign-up fails while browsing still works.",
      fix:
        "Firebase: set FIREBASE_SERVICE_ACCOUNT (the whole service account " +
        "JSON) and FIREBASE_DATABASE_URL. Or libSQL: set DATABASE_URL and " +
        "DATABASE_AUTH_TOKEN.",
    };
  } else {
    try {
      // A read that touches the real store, whichever backend is active.
      if (backendName() === "rtdb") await backend().countUsers();
      else await (await getDb()).execute("SELECT 1");
      checks.database = {
        ok: true,
        configured: true,
        backend: backendName() === "rtdb" ? "Firebase Realtime Database" : "libSQL",
        detail: "Reachable.",
      };
    } catch (err) {
      const { message, reason } = describeDbError(err);
      checks.database = {
        ok: false,
        configured: true,
        backend: backendName() === "rtdb" ? "Firebase Realtime Database" : "libSQL",
        reason,
        detail: message,
      };
    }
  }

  const flag = (name, value, detail) => ({
    ok: Boolean(value),
    configured: Boolean(value),
    detail,
  });

  checks.payments = flag(
    process.env.STRIPE_SECRET_KEY,
    null,
    process.env.STRIPE_SECRET_KEY
      ? "Stripe configured."
      : "No Stripe key — checkout completes in simulation mode."
  );
  checks.email = flag(
    process.env.RESEND_API_KEY,
    null,
    process.env.RESEND_API_KEY
      ? "Resend configured."
      : "No mail provider — receipts and reset links are only logged."
  );
  checks.analytics = flag(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    null,
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      ? "Firebase Analytics configured."
      : "Firebase Analytics not configured."
  );
  checks.admin = flag(
    process.env.ADMIN_EMAILS,
    null,
    process.env.ADMIN_EMAILS ? "Admin allowlist set." : "No admin configured."
  );

  // Only the database stops the store working; the rest degrade by design.
  const healthy = checks.database.ok;

  return NextResponse.json(
    {
      healthy,
      summary: healthy
        ? "Accounts and orders are working."
        : "Accounts and orders are unavailable — see checks.database.",
      checks,
    },
    { status: healthy ? 200 : 503 }
  );
}
