import { backend } from "./backend.js";
import { readOrFallback } from "./db.js";
import { MADE_FOR_YOU, TEMPLATES, bySlug } from "./catalog.js";
import { EMAIL_RE } from "./inbox.js";
import { sendEmail } from "./email.js";
import { SITE } from "./site.js";

/**
 * Made-for-you builds: a buyer's brief, paid for, then worked through by the
 * store owner from /admin.
 *
 * Each build holds the brief, its status, the due date and the delivery.
 *
 * A build is created as awaiting_payment; paying for its order moves it to
 * queued and sets the due date (see fulfillOrder in store.js).
 */

export const BUILD_STATUS = {
  awaiting_payment: "Awaiting payment",
  queued: "Brief received",
  in_progress: "In progress",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// Builds that count against capacity.
const OPEN = ["queued", "in_progress"];

/** Templates a build can start from: the ones that are plain HTML. */
export const BUILDABLE = TEMPLATES.filter((t) => t.livePreview);

const LIMITS = { business: 120, about: 3000, pages: 2000, style: 1000, links: 1000, content: 6000, notes: 2000, assetsUrl: 500 };

const isUrl = (v) => {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};

export function validateBrief(brief) {
  if (!brief || typeof brief !== "object") return "Fill in the brief first.";
  const { template, business, about, email, assetsUrl } = brief;
  if (template && !BUILDABLE.some((t) => t.slug === template)) return "Choose one of the templates, or let us pick.";
  if (typeof business !== "string" || !business.trim()) return "Tell us your business name.";
  if (typeof about !== "string" || about.trim().length < 20) {
    return "Tell us a little more about what your business does (at least 20 characters).";
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) return "Enter the email we should deliver to.";
  for (const [field, max] of Object.entries(LIMITS)) {
    const v = brief[field];
    if (v != null && typeof v !== "string") return "Some of the brief isn't valid text.";
    if (typeof v === "string" && v.length > max) return `The ${field} field is too long.`;
  }
  if (assetsUrl && !isUrl(assetsUrl.trim())) return "The link to your photos and logo should start with https://";
  return null;
}

export async function openBuildCount() {
  return readOrFallback(
    async () => (await backend().listBuilds()).filter((b) => OPEN.includes(b.status)).length,
    0
  );
}

export async function hasCapacity() {
  return (await openBuildCount()) < MADE_FOR_YOU.maxOpen;
}

export async function createBuild(user, brief) {
  const clean = Object.fromEntries(
    Object.keys(LIMITS).map((k) => [k, typeof brief[k] === "string" ? brief[k].trim() : ""])
  );
  return backend().createBuild({
    ...clean,
    template: brief.template || null,
    email: brief.email.trim().toLowerCase(),
    userId: user.id,
    status: "awaiting_payment",
    createdAt: Date.now(),
  });
}

export async function linkOrder(buildId, orderId) {
  await backend().linkBuildOrder(buildId, orderId);
}

/**
 * Called when the order a build was paid through is fulfilled: the brief
 * joins the queue and the delivery clock starts. Safe to call twice.
 */
export async function markBuildPaid(orderId) {
  const build = await backend().buildForOrder(orderId);
  if (!build || build.status !== "awaiting_payment") return null;
  const paidAt = Date.now();
  await backend().updateBuild(build.id, {
    status: "queued",
    paidAt,
    dueAt: paidAt + MADE_FOR_YOU.days * 86_400_000,
  });
  return build;
}

/** A buyer's paid builds, newest first. */
export async function buildsFor(userId) {
  return readOrFallback(async () => {
    const all = await backend().listBuilds();
    return all
      .filter((b) => b.userId === userId && b.status !== "awaiting_payment")
      .sort((a, b) => b.createdAt - a.createdAt);
  }, []);
}

/** Every paid build for the dashboard: open ones first, by due date. */
export async function allBuilds() {
  const rank = { queued: 0, in_progress: 0, delivered: 1, cancelled: 2 };
  return (await backend().listBuilds())
    .filter((b) => b.status in rank)
    .sort((a, b) => rank[a.status] - rank[b.status] || (a.dueAt ?? 0) - (b.dueAt ?? 0))
    .slice(0, 50);
}

export class BuildError extends Error {}

/** Admin update. Marking a build delivered emails the buyer their link. */
export async function updateBuild(id, { status, deliveryUrl, note }, origin) {
  if (!Object.hasOwn(BUILD_STATUS, status) || status === "awaiting_payment") {
    throw new BuildError("Choose a valid status.");
  }
  const url = typeof deliveryUrl === "string" ? deliveryUrl.trim() : "";
  if (url && !isUrl(url)) throw new BuildError("The delivery link should start with https://");
  if (status === "delivered" && !url) throw new BuildError("Add the link to the finished site before marking it delivered.");
  const message = typeof note === "string" ? note.trim().slice(0, 2000) : "";

  const before = await backend().getBuild(id);
  if (!before) throw new BuildError("That build no longer exists.");

  await backend().updateBuild(id, {
    status,
    deliveryUrl: url || null,
    note: message || null,
    updatedAt: Date.now(),
    ...(status === "delivered" && before.status !== "delivered" ? { deliveredAt: Date.now() } : {}),
  });

  if (status === "delivered" && before.status !== "delivered") {
    await sendEmail({
      to: before.email,
      kind: "build-delivered",
      subject: `Your ${before.business} website is ready`,
      text: `Good news: your Made-for-you website for ${before.business} is ready.

${url}
${message ? `\n${message}\n` : ""}
It's also in your library, with the template it's built from:
${origin}/account

To put it online, follow any of our hosting guides:
${origin}/guides

Want a tweak? Reply through ${origin}/contact and mention ${before.business}.

— ${SITE.name}`,
    }).catch((err) => console.error("[builds] delivery email failed:", err.message));
  }
}

export const templateName = (slug) => bySlug(slug)?.name ?? "Our pick";
