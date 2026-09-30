import { db } from "./firebase-admin.js";
import { MADE_FOR_YOU, money } from "./catalog.js";
import { SITE } from "./site.js";

/**
 * Sends through Resend when RESEND_API_KEY is set, and otherwise logs the
 * message. Either way the send is recorded in the `emails` collection, so
 * there is a delivery record and the admin mail log shows failures.
 *
 * Password-reset and verification mail is sent by Firebase Authentication
 * itself and needs no provider here.
 */

const FROM = process.env.EMAIL_FROM || `${SITE.name} <onboarding@resend.dev>`;
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
    outcome = {
      provider: key ? "resend" : "simulated",
      status: "failed",
      error: String(err.message).slice(0, 500),
    };
  }

  await (await db())
    .collection("emails")
    .add({ to, subject, kind, ...outcome, createdAt: Date.now() });

  return outcome;
}

export async function recentEmails(limit = 20) {
  const snap = await (await db())
    .collection("emails")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((d) => d.data());
}

/* ------------------------------------------------------------- templates */

export function receiptEmail({ email, order, items, origin }) {
  const lines = items
    .map((i) => `  ${i.name.padEnd(28)} ${money(i.priceCents)}`)
    .join("\n");
  const credit = order.creditCents
    ? `\n  ${"Credit for templates you own".padEnd(28)} -${money(order.creditCents)}`
    : "";
  const due = new Date((order.paidAt ?? Date.now()) + MADE_FOR_YOU.days * 86_400_000);
  const build = order.customBuildId
    ? `\nYour Made-for-you build is booked. We'll deliver it by
${due.toUTCString().slice(0, 16)} and email you the moment it's ready. You
can follow its progress in your library.\n`
    : "";

  return {
    to: email,
    kind: "receipt",
    subject: `Your ${SITE.name} order — ${money(order.totalCents)}`,
    text: `Thanks for your purchase.

Order ${order.id.slice(0, 8)}
${new Date(order.createdAt ?? Date.now()).toUTCString()}

${lines}${credit}
${"".padEnd(40, "-")}
  ${"Total".padEnd(28)} ${money(order.totalCents)}
${build}
Your downloads are ready in your library:
${origin}/account

Every template comes with a commercial licence: use it on unlimited
personal and client projects, no attribution required. The full terms are
in LICENSE.txt inside each download.

Stuck on setup? Send us a message at ${origin}/contact and the person
who wrote the code will answer.

— ${SITE.name}`,
  };
}
