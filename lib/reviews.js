import { randomUUID } from "node:crypto";
import { queryAll, queryOne, run, readOrFallback } from "./db.js";
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
  const row = await queryOne(
    `SELECT 1 AS ok FROM entitlements WHERE user_id = ? AND slug = ?`,
    [userId, slug]
  );
  return Boolean(row);
}

export async function upsertReview(userId, slug, { rating, title, body }) {
  if (!(await canReview(userId, slug))) {
    throw new Error("Only buyers can review this template");
  }

  const problem = validateReview({ rating, title, body });
  if (problem) throw new Error(problem);

  await run(
    `INSERT INTO reviews (id, user_id, slug, rating, title, body, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id, slug) DO UPDATE SET
       rating = excluded.rating,
       title = excluded.title,
       body = excluded.body,
       created_at = excluded.created_at`,
    [
      randomUUID(),
      userId,
      slug,
      Number(rating),
      title?.trim()?.slice(0, MAX_TITLE) || null,
      body.trim(),
      Date.now(),
    ]
  );
}

export async function reviewsFor(slug, limit = 20) {
  return readOrFallback(() => loadReviews(slug, limit), []);
}

async function loadReviews(slug, limit) {
  const rows = await queryAll(
    `SELECT r.rating, r.title, r.body, r.created_at, u.email
       FROM reviews r JOIN users u ON u.id = r.user_id
      WHERE r.slug = ? ORDER BY r.created_at DESC LIMIT ?`,
    [slug, limit]
  );

  return rows.map((r) => ({
    rating: Number(r.rating),
    title: r.title,
    body: r.body,
    createdAt: Number(r.created_at),
    author: maskEmail(r.email),
  }));
}

export async function myReview(userId, slug) {
  if (!userId) return null;
  return readOrFallback(() => loadMyReview(userId, slug), null);
}

async function loadMyReview(userId, slug) {
  const row = await queryOne(
    `SELECT rating, title, body FROM reviews WHERE user_id = ? AND slug = ?`,
    [userId, slug]
  );
  return row ? { rating: Number(row.rating), title: row.title, body: row.body } : null;
}

/** Average and count per slug, for the listing cards. */
export async function ratingSummary() {
  return readOrFallback(async () => {
    const rows = await queryAll(
      `SELECT slug, COUNT(*) AS n, AVG(rating) AS avg FROM reviews GROUP BY slug`
    );
    const map = new Map();
    for (const r of rows) {
      map.set(r.slug, { count: Number(r.n), average: Number(r.avg) });
    }
    return map;
  }, new Map());
}

export async function ratingFor(slug) {
  return readOrFallback(() => loadRating(slug), { count: 0, average: 0 });
}

async function loadRating(slug) {
  const row = await queryOne(
    `SELECT COUNT(*) AS n, AVG(rating) AS avg FROM reviews WHERE slug = ?`,
    [slug]
  );
  const count = Number(row?.n ?? 0);
  return count ? { count, average: Number(row.avg) } : { count: 0, average: 0 };
}

/** j.smith@example.com -> j.s***@example.com */
function maskEmail(email) {
  const [name, domain] = String(email).split("@");
  if (!domain) return "A buyer";
  const head = name.slice(0, Math.min(2, name.length));
  return `${head}${"*".repeat(3)}@${domain}`;
}
