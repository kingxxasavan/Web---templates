import { backend } from "./backend.js";
import { readOrFallback } from "./db.js";
import { MADE_FOR_YOU, CATALOG, bySlug } from "./catalog.js";
import { EMAIL_RE } from "./inbox.js";
import { sendEmail } from "./email.js";
import { SITE } from "./site.js";
import { BUSINESS_TYPES, TONES, briefText, isPalette } from "./brief.js";

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

/** Templates a buyer can name as inspiration: anything in the catalogue. */
export const BUILDABLE = CATALOG;

const LIMITS = {
  business: 120, tagline: 140, businessType: 40, businessTypeOther: 80, about: 3000, audience: 200,
  inspirationUrl: 300, pages: 2000, style: 1000, links: 1000, content: 6000, notes: 2000, assetsUrl: 500,
};
const TYPE_IDS = new Set([...BUSINESS_TYPES.map((t) => t.id), "other"]);

function validPages(list) {
  if (list == null) return true;
  return (
    Array.isArray(list) &&
    list.length <= 10 &&
    list.every((p) => p && typeof p.name === "string" && p.name.length <= 40 && (p.notes == null || (typeof p.notes === "string" && p.notes.length <= 240)))
  );
}

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
  const { business, about, email, assetsUrl, inspirationUrl } = brief;
  const template = brief.inspiration ?? brief.template;
  if (template && !BUILDABLE.some((t) => t.slug === template)) return "Choose one of the templates, or let us pick.";
  if (brief.businessType && !TYPE_IDS.has(brief.businessType)) return "Choose the kind of business.";
  if (!validPages(brief.pageList)) return "Up to ten pages, each with a short name.";
  if (brief.palette != null && !isPalette(brief.palette)) return "Choose a colour palette.";
  if (brief.tones != null && !(Array.isArray(brief.tones) && brief.tones.length <= 3 && brief.tones.every((t) => TONES.includes(t)))) {
    return "Pick up to three styles.";
  }
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
  if (inspirationUrl && !isUrl(inspirationUrl.trim())) return "The website you like should be a full link, starting with https://";
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
  const template = brief.inspiration ?? brief.template ?? "";
  const pageList = (brief.pageList ?? [])
    .map((p) => ({ name: p.name.trim(), notes: (p.notes ?? "").trim() }))
    .filter((p) => p.name);
  const record = {
    ...clean,
    template: template || null,
    pageList,
    palette: isPalette(brief.palette) ? brief.palette : null,
    tones: brief.tones ?? [],
    email: brief.email.trim().toLowerCase(),
    userId: user.id,
    status: "awaiting_payment",
    createdAt: Date.now(),
  };
  // The brief as one prompt, written on the server from the checked fields.
  record.brief = briefText({ ...record, inspiration: template, inspirationName: bySlug(template)?.name });
  return backend().createBuild(record);
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
