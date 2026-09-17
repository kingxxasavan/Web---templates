import { readOrFallback } from "./db.js";
import { backend } from "./backend.js";
import { isSellableSlug } from "./catalog.js";

/**
 * Reviews are restricted to verified buyers: writing one requires an
 * entitlement row for that template, which only exists after a fulfilled
 * order. The unique key on (user_id, slug) means one review per buyer per
 * template, editable but not repeatable.
 */

export const MAX_TITLE = 80;
export const MAX_BODY = 1500;
const MIN_BODY = 20;

export function validateReview({ rating, title, body }) {
  const n = Number(rating);
  if (!Number.isInteger(n) || n < 1 || n > 5) {
    return "Choose a rating from 1 to 5 stars.";
  }
  if (typeof body !== "string" || body.trim().length < MIN_BODY) {
    return `Tell us a little more — at least ${MIN_BODY} characters.`;
  }
  if (body.length > MAX_BODY) return "That review is too long.";
  if (title != null && typeof title === "string" && title.length > MAX_TITLE) {
    return "That title is too long.";
  }
  return null;
}

export async function canReview(userId, slug) {
  if (!isSellableSlug(slug)) return false;
  return backend().owns(userId, slug);
}

export async function upsertReview(userId, slug, { rating, title, body }) {
  if (!(await canReview(userId, slug))) {
    throw new Error("Only buyers can review this template");
  }

  const problem = validateReview({ rating, title, body });
  if (problem) throw new Error(problem);

  const email = await backend().userEmail(userId);
  await backend().upsertReview(
    userId,
    slug,
    {
      rating: Number(rating),
      title: title?.trim()?.slice(0, MAX_TITLE) || null,
      body: body.trim(),
    },
    email ?? ""
  );
}

export async function reviewsFor(slug, limit = 20) {
  return readOrFallback(() => loadReviews(slug, limit), []);
}

async function loadReviews(slug, limit) {
  const rows = await backend().reviewsFor(slug, limit);
  return rows.map((r) => ({
    rating: Number(r.rating),
    title: r.title,
    body: r.body,
    createdAt: Number(r.createdAt),
    author: maskEmail(r.email),
  }));
}

export async function myReview(userId, slug) {
  if (!userId) return null;
  return readOrFallback(() => loadMyReview(userId, slug), null);
}

async function loadMyReview(userId, slug) {
  const row = await backend().myReview(userId, slug);
  return row
    ? { rating: Number(row.rating), title: row.title, body: row.body }
    : null;
}

/** Average and count per slug, for the listing cards. */
export async function ratingSummary() {
  return readOrFallback(async () => {
    const map = new Map();
    for (const r of await backend().allReviews()) {
      const cur = map.get(r.slug) ?? { count: 0, total: 0 };
      cur.count += 1;
      cur.total += r.rating;
      map.set(r.slug, cur);
    }
    for (const [slug, v] of map) {
      map.set(slug, { count: v.count, average: v.total / v.count });
    }
    return map;
  }, new Map());
}

export async function ratingFor(slug) {
  return readOrFallback(() => loadRating(slug), { count: 0, average: 0 });
}

async function loadRating(slug) {
  const all = (await backend().allReviews()).filter((r) => r.slug === slug);
  if (!all.length) return { count: 0, average: 0 };
  const total = all.reduce((sum, r) => sum + r.rating, 0);
  return { count: all.length, average: total / all.length };
}

/** j.smith@example.com -> j.s***@example.com */
function maskEmail(email) {
  const [name, domain] = String(email).split("@");
  if (!domain) return "A buyer";
  const head = name.slice(0, Math.min(2, name.length));
  return `${head}${"*".repeat(3)}@${domain}`;
}
