import { randomUUID } from "node:crypto";
import { backend } from "./backend.js";

/**
 * Sends through Resend when RESEND_API_KEY is set, and otherwise records the
 * message and logs it. Either way the send is written to the `emails` table,
 * so there is a delivery record to inspect and the reset and receipt flows are
 * exercisable with no mail provider configured.
 */

const FROM = process.env.EMAIL_FROM || "Foundry <onboarding@resend.dev>";
const key = process.env.RESEND_API_KEY;

async function deliver({ to, subject, text }) {
  if (!key) {
    console.log(`\n[email:simulated] to=${to}\n  ${subject}\n${text}\n`);
    return { provider: "simulated", status: "logged", error: null };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, text }),
  });

  if (!res.ok) {
    const error = await res.text().catch(() => `HTTP ${res.status}`);
    return { provider: "resend", status: "failed", error: error.slice(0, 500) };
  }
  return { provider: "resend", status: "sent", error: null };
}

export async function sendEmail({ to, subject, text, kind }) {
  let outcome;
  try {
    outcome = await deliver({ to, subject, text });
  } catch (err) {
    outcome = { provider: key ? "resend" : "simulated", status: "failed", error: String(err.message).slice(0, 500) };
  }

  await backend().recordEmail({
    id: randomUUID(),
    toEmail: to,
    subject,
    body: text,
    kind,
    provider: outcome.provider,
    status: outcome.status,
    error: outcome.error,
    createdAt: Date.now(),
  });

  return outcome;
}

export async function recentEmails(limit = 20) {
  return backend().recentEmails(limit);
}

/* ------------------------------------------------------------- templates */

const money = (c) => `$${(c / 100).toFixed(c % 100 === 0 ? 0 : 2)}`;

export function receiptEmail({ email, order, items, origin }) {
  const lines = items
    .map((i) => `  ${i.name.padEnd(28)} ${money(i.priceCents)}`)
    .join("\n");

  return {
    to: email,
    kind: "receipt",
    subject: `Your Foundry order — ${money(order.totalCents)}`,
    text: `Thanks for your purchase.

Order ${order.id.slice(0, 8)}
${new Date(order.createdAt ?? Date.now()).toUTCString()}

${lines}
${"".padEnd(40, "-")}
  ${"Total".padEnd(28)} ${money(order.totalCents)}

Your downloads are ready in your library:
${origin}/account

Every template comes with a commercial licence — use it on unlimited
personal and client projects, no attribution required. The full terms are
in LICENSE.txt inside each download.

Once you've had a look, we'd genuinely appreciate a short review. You can
leave one from any template page you own.

— Foundry`,
  };
}

export function resetEmail({ email, token, origin }) {
  return {
    to: email,
    kind: "password-reset",
    subject: "Reset your Foundry password",
    text: `Someone asked to reset the password for this account.

Open this link within the next hour to choose a new one:

${origin}/reset?token=${token}

Signing in with a new password will end every other active session.

If this wasn't you, no action is needed — the link above is the only way
to change the password, and it expires on its own.

— Foundry`,
  };
}
