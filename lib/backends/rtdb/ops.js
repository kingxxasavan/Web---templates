import { randomUUID } from "node:crypto";
import { getDatabaseRef, encodeKey, rowsOf } from "./client.js";
import { hashPassword } from "../../password.js";
import { BUNDLE, TEMPLATES, bySlug, isSellableSlug, priceOfSlug } from "../../catalog.js";

/**
 * Every operation the store needs, implemented against Realtime Database.
 *
 * RTDB has no joins and no server-side filtering worth relying on, so the
 * shape below is denormalised for the reads the app actually performs:
 * emailToUid mirrors the unique email index SQL gave us for free, and
 * userOrders mirrors the per-user order index. Writes that must not half-apply
 * use one multi-location update on the root, which RTDB applies atomically.
 */

const db = () => getDatabaseRef();
const val = async (path) => (await (await db()).ref(path).get()).val();

/* ------------------------------------------------------------------ users */

export async function createUser(email, password) {
  const id = randomUUID();
  const root = (await db()).ref();
  await root.update({
    [`users/${id}`]: {
      email,
      password: await hashPassword(password),
      createdAt: Date.now(),
    },
    [`emailToUid/${encodeKey(email)}`]: id,
  });
  return { id, email };
}

export async function findUserByEmail(email) {
  const id = await val(`emailToUid/${encodeKey(email)}`);
  if (!id) return null;
  const user = await val(`users/${id}`);
  return user ? { id, ...user } : null;
}

/* --------------------------------------------------------------- sessions */

export async function createSessionRecord(tokenHash, userId, createdAt, expiresAt) {
  await (await db()).ref(`sessions/${tokenHash}`).set({
    userId,
    createdAt,
    expiresAt,
  });
}

export async function findSession(tokenHash) {
  const session = await val(`sessions/${tokenHash}`);
  if (!session) return null;
  const user = await val(`users/${session.userId}`);
  if (!user) return null;
  return {
    id: session.userId,
    email: user.email,
    expires_at: session.expiresAt,
  };
}

export async function deleteSession(tokenHash) {
  await (await db()).ref(`sessions/${tokenHash}`).remove();
}

export async function deleteSessionsForUser(userId) {
  const all = await val("sessions");
  const updates = {};
  for (const [hash, s] of rowsOf(all)) {
    if (s?.userId === userId) updates[`sessions/${hash}`] = null;
  }
  if (Object.keys(updates).length) await (await db()).ref().update(updates);
}

/* -------------------------------------------------------- password resets */

export async function createReset(tokenHash, userId, createdAt, expiresAt) {
  const all = await val("resets");
  const updates = {};
  // Only the newest link should work.
  for (const [hash, r] of rowsOf(all)) {
    if (r?.userId === userId) updates[`resets/${hash}`] = null;
  }
  updates[`resets/${tokenHash}`] = { userId, createdAt, expiresAt, usedAt: null };
  await (await db()).ref().update(updates);
}

export async function findReset(tokenHash) {
  return val(`resets/${tokenHash}`);
}

export async function consumeReset(tokenHash, userId, passwordHash, email) {
  const sessions = await val("sessions");
  const updates = {
    [`users/${userId}/password`]: passwordHash,
    [`resets/${tokenHash}/usedAt`]: Date.now(),
    [`attempts/${encodeKey(email)}`]: null,
  };
  for (const [hash, s] of rowsOf(sessions)) {
    if (s?.userId === userId) updates[`sessions/${hash}`] = null;
  }
  await (await db()).ref().update(updates);
}

/* --------------------------------------------------------- login attempts */

export async function readAttempts(key) {
  return val(`attempts/${encodeKey(key)}`);
}

export async function bumpAttempts(key) {
  const ref = (await db()).ref(`attempts/${encodeKey(key)}`);
  await ref.transaction((current) =>
    current
      ? { count: (current.count ?? 0) + 1, firstAt: current.firstAt }
      : { count: 1, firstAt: Date.now() }
  );
}

export async function clearAttempts(key) {
  await (await db()).ref(`attempts/${encodeKey(key)}`).remove();
}

/* ------------------------------------------------------------------- cart */

export async function addCartItem(userId, slug) {
  await (await db()).ref(`carts/${userId}/${slug}`).set(Date.now());
}

export async function removeCartItem(userId, slug) {
  await (await db()).ref(`carts/${userId}/${slug}`).remove();
}

export async function clearCart(userId) {
  await (await db()).ref(`carts/${userId}`).remove();
}

export async function cartSlugs(userId) {
  const items = await val(`carts/${userId}`);
  return rowsOf(items)
    .sort((a, b) => Number(a[1]) - Number(b[1]))
    .map(([slug]) => slug)
    .filter(isSellableSlug);
}

export async function mergeCart(userId, slugs) {
  const now = Date.now();
  const updates = {};
  for (const slug of slugs) updates[`carts/${userId}/${slug}`] = now;
  if (Object.keys(updates).length) await (await db()).ref().update(updates);
}

/* ----------------------------------------------------------- entitlements */

export async function ownedSlugs(userId) {
  const owned = await val(`entitlements/${userId}`);
  return new Set(rowsOf(owned).map(([slug]) => slug));
}

export async function owns(userId, slug) {
  return Boolean(await val(`entitlements/${userId}/${slug}`));
}

/* ----------------------------------------------------------------- orders */

export async function createOrder(userId, provider, totalCents, items) {
  const id = randomUUID();
  const createdAt = Date.now();
  const itemMap = {};
  for (const i of items) itemMap[i.slug] = i.priceCents;

  await (await db()).ref().update({
    [`orders/${id}`]: {
      userId,
      totalCents,
      status: "pending",
      provider,
      providerRef: null,
      createdAt,
      items: itemMap,
    },
    [`userOrders/${userId}/${id}`]: createdAt,
  });

  return { id, totalCents, items };
}

export async function getOrder(orderId) {
  const order = await val(`orders/${orderId}`);
  if (!order) return null;
  return {
    id: orderId,
    user_id: order.userId,
    total_cents: order.totalCents,
    status: order.status,
    provider: order.provider,
    created_at: order.createdAt,
    items: rowsOf(order.items).map(([slug, price]) => ({
      slug,
      price_cents: Number(price),
    })),
  };
}

export async function markPaidAndGrant(orderId, userId, slugs, providerRef) {
  const now = Date.now();
  const updates = {
    [`orders/${orderId}/status`]: "paid",
    [`orders/${orderId}/providerRef`]: providerRef ?? null,
    [`carts/${userId}`]: null,
  };
  for (const slug of slugs) {
    updates[`entitlements/${userId}/${slug}`] = { orderId, createdAt: now };
  }
  await (await db()).ref().update(updates);
}

export async function paidOrdersFor(userId) {
  const index = await val(`userOrders/${userId}`);
  const ids = rowsOf(index)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .map(([id]) => id);

  const orders = [];
  for (const id of ids) {
    const o = await getOrder(id);
    if (o?.status === "paid") {
      orders.push({
        id: o.id,
        totalCents: Number(o.total_cents),
        status: o.status,
        provider: o.provider,
        createdAt: Number(o.created_at),
        items: o.items,
      });
    }
  }
  return orders;
}

/* ---------------------------------------------------------------- reviews */

export async function upsertReview(userId, slug, review, email) {
  await (await db()).ref(`reviews/${slug}/${userId}`).set({
    ...review,
    email,
    createdAt: Date.now(),
  });
}

export async function reviewsFor(slug, limit) {
  const all = await val(`reviews/${slug}`);
  return rowsOf(all)
    .map(([, r]) => r)
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    .slice(0, limit);
}

export async function myReview(userId, slug) {
  return val(`reviews/${slug}/${userId}`);
}

export async function allReviews() {
  const all = await val("reviews");
  const out = [];
  for (const [slug, byUser] of rowsOf(all)) {
    for (const [, r] of rowsOf(byUser)) out.push({ slug, rating: Number(r.rating) });
  }
  return out;
}

/* ------------------------------------------------------------------- mail */

export async function recordEmail(row) {
  await (await db()).ref(`mail/${row.id}`).set(row);
}

export async function recentEmails(limit) {
  const all = await val("mail");
  return rowsOf(all)
    .map(([, m]) => m)
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    .slice(0, limit);
}

/* ---------------------------------------------------------------- metrics */

export async function allPaidOrders() {
  const all = await val("orders");
  return rowsOf(all)
    .map(([id, o]) => ({ id, ...o }))
    .filter((o) => o.status === "paid");
}

export async function countUsers() {
  return rowsOf(await val("users")).length;
}

export async function userEmail(userId) {
  return (await val(`users/${userId}/email`)) ?? null;
}
