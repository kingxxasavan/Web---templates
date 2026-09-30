import { db, readOrFallback } from "./firebase-admin.js";
import { isSellableSlug } from "./catalog.js";
import { owns } from "./store.js";

/**
 * Reviews are restricted to verified buyers: writing one requires owning the
 * template. The document id is `${slug}__${uid}`, so there is exactly one
 * review per buyer per template — editable, never repeatable.
 */

export const MAX_TITLE = 80;
export const MAX_BODY = 1500;
const MIN_BODY = 20;

const reviews = async () => (await db()).collection("reviews");

export function validateReview({ rating, title, body }) {
  const n = Number(rating);
  if (!Number.isInteger(n) || n < 1 || n > 5) {
    return "Choose a rating from 1 to 5 stars.";
  }
  if (typeof body !== "string" || body.trim().length < MIN_BODY) {
    return `Tell us a little more — at least ${MIN_BODY} characters.`;
  }
  if (body.length > MAX_BODY) return "That review is too long.";
  if (title != null && typeof title !== "string") return "That title is not valid.";
  if (typeof title === "string" && title.length > MAX_TITLE) {
    return "That title is too long.";
  }
  return null;
}

/** j.smith@example.com -> j.***@example.com */
export function maskEmail(email) {
  const [name, domain] = String(email).split("@");
  if (!domain) return "A buyer";
  return `${name.slice(0, Math.min(2, name.length))}***@${domain}`;
}

export class ReviewError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function upsertReview(user, slug, { rating, title, body }) {
  if (!isSellableSlug(slug) || !(await owns(user.id, slug))) {
    throw new ReviewError("Only buyers can review this template.", 403);
  }

  const problem = validateReview({ rating, title, body });
  if (problem) throw new ReviewError(problem, 400);

  await (await reviews())
    .doc(`${slug}__${user.id}`)
    .set({
      slug,
      userId: user.id,
      // Stored masked, so nothing that renders a review ever holds the address.
      author: maskEmail(user.email),
      rating: Number(rating),
      title: title?.trim()?.slice(0, MAX_TITLE) || null,
      body: body.trim(),
      createdAt: Date.now(),
    });
}

const publicShape = ({ rating, title, body, createdAt, author }) => ({
  rating,
  title,
  body,
  createdAt,
  author,
});

export async function reviewsFor(slug, limit = 20) {
  return readOrFallback(async () => {
    const snap = await (await reviews()).where("slug", "==", slug).get();
    return snap.docs
      .map((d) => d.data())
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit)
      .map(publicShape);
  }, []);
}

export async function myReview(uid, slug) {
  if (!uid) return null;
  return readOrFallback(async () => {
    const snap = await (await reviews()).doc(`${slug}__${uid}`).get();
    if (!snap.exists) return null;
    const { rating, title, body } = snap.data();
    return { rating, title, body };
  }, null);
}

/** Average and count per slug, for listing cards and the dashboard. */
export async function ratingSummary() {
  return readOrFallback(async () => {
    const snap = await (await reviews()).select("slug", "rating").get();
    const map = new Map();
    for (const d of snap.docs) {
      const { slug, rating } = d.data();
      const entry = map.get(slug) ?? { count: 0, total: 0 };
      entry.count++;
      entry.total += rating;
      map.set(slug, entry);
    }
    for (const [slug, e] of map) {
      map.set(slug, { count: e.count, average: e.total / e.count });
    }
    return map;
  }, new Map());
}

export async function ratingFor(slug) {
  const all = await ratingSummary();
  return all.get(slug) ?? { count: 0, average: 0 };
}
