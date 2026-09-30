import { createHash } from "node:crypto";
import { db } from "./firebase-admin.js";

/**
 * Everything visitors send the store: contact messages, template requests,
 * and sign-ups for new-release alerts. All of it lands in Firestore and shows
 * up on /admin, so nothing depends on an inbox being configured.
 */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const MESSAGE_KINDS = ["question", "request", "support"];

const MAX_NAME = 80;
const MAX_MESSAGE = 3000;

export function validateMessage({ name, email, kind, message }) {
  if (typeof name !== "string" || !name.trim()) return "Tell us your name.";
  if (name.length > MAX_NAME) return "That name is too long.";
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return "Enter a valid email address so we can reply.";
  }
  if (!MESSAGE_KINDS.includes(kind)) return "Choose what this is about.";
  if (typeof message !== "string" || message.trim().length < 10) {
    return "Add a little more detail — at least 10 characters.";
  }
  if (message.length > MAX_MESSAGE) return "That message is too long.";
  return null;
}

export async function saveMessage({ name, email, kind, message }, user = null) {
  await (await db())
    .collection("messages")
    .add({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      kind,
      message: message.trim(),
      userId: user?.id ?? null,
      createdAt: Date.now(),
      status: "open",
    });
}

/**
 * Keyed by a hash of the address, so signing up twice is harmless and the
 * document id does not expose the email.
 */
export async function subscribe(email, source = "site") {
  const normalised = email.trim().toLowerCase();
  const id = createHash("sha256").update(normalised).digest("hex").slice(0, 32);
  await (await db())
    .collection("subscribers")
    .doc(id)
    .set({ email: normalised, source, createdAt: Date.now() }, { merge: true });
}

export async function recentMessages(limit = 20) {
  const snap = await (await db())
    .collection("messages")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function subscriberCount() {
  const snap = await (await db()).collection("subscribers").count().get();
  return snap.data().count;
}
