import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
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
      fix: "Create a Turso database and set DATABASE_URL and DATABASE_AUTH_TOKEN.",
    };
  } else {
    try {
      const db = await getDb();
      await db.execute("SELECT 1");
      checks.database = { ok: true, configured: true, detail: "Reachable." };
    } catch (err) {
      const { message, reason } = describeDbError(err);
      checks.database = { ok: false, configured: true, reason, detail: message };
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
