import { randomUUID } from "node:crypto";
import { queryAll, queryOne, run, getDb } from "../../db.js";
import { hashPassword } from "../../password.js";
import { isSellableSlug, BUNDLE, TEMPLATES, bySlug } from "../../catalog.js";

/**
 * The libSQL implementation of the same interface the Realtime Database
 * backend provides. Both are exercised by the same tests, so a behavioural
 * difference between them shows up as a failure rather than a surprise in
 * production.
 */

/* ------------------------------------------------------------------ users */

export async function createUser(email, password) {
  const id = randomUUID();
  await run(
    `INSERT INTO users (id, email, password, created_at) VALUES (?, ?, ?, ?)`,
    [id, email, await hashPassword(password), Date.now()]
  );
  return { id, email };
}

export async function findUserByEmail(email) {
  return queryOne(`SELECT * FROM users WHERE email = ?`, [email]);
}

/* --------------------------------------------------------------- sessions */

export async function createSessionRecord(tokenHash, userId, createdAt, expiresAt) {
  await run(
    `INSERT INTO sessions (token_hash, user_id, created_at, expires_at)
     VALUES (?, ?, ?, ?)`,
    [tokenHash, userId, createdAt, expiresAt]
  );
}

export async function findSession(tokenHash) {
  return queryOne(
    `SELECT u.id, u.email, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ?`,
    [tokenHash]
  );
}

export async function deleteSession(tokenHash) {
  await run(`DELETE FROM sessions WHERE token_hash = ?`, [tokenHash]);
}

export async function deleteSessionsForUser(userId) {
  await run(`DELETE FROM sessions WHERE user_id = ?`, [userId]);
}

/* -------------------------------------------------------- password resets */

export async function createReset(tokenHash, userId, createdAt, expiresAt) {
  const db = await getDb();
  await db.batch(
    [
      { sql: `DELETE FROM password_resets WHERE user_id = ?`, args: [userId] },
      {
        sql: `INSERT INTO password_resets (token_hash, user_id, created_at, expires_at)
              VALUES (?, ?, ?, ?)`,
        args: [tokenHash, userId, createdAt, expiresAt],
      },
    ],
    "write"
  );
}

export async function findReset(tokenHash) {
  const row = await queryOne(
    `SELECT user_id, expires_at, used_at FROM password_resets WHERE token_hash = ?`,
    [tokenHash]
  );
  return row
    ? { userId: row.user_id, expiresAt: row.expires_at, usedAt: row.used_at }
    : null;
}

export async function consumeReset(tokenHash, userId, passwordHash, email) {
  const db = await getDb();
  await db.batch(
    [
      { sql: `UPDATE users SET password = ? WHERE id = ?`, args: [passwordHash, userId] },
      {
        sql: `UPDATE password_resets SET used_at = ? WHERE token_hash = ?`,
        args: [Date.now(), tokenHash],
      },
      { sql: `DELETE FROM sessions WHERE user_id = ?`, args: [userId] },
      { sql: `DELETE FROM login_attempts WHERE key = ?`, args: [email] },
    ],
    "write"
  );
}

/* --------------------------------------------------------- login attempts */

export async function readAttempts(key) {
  const row = await queryOne(
    `SELECT count, first_at FROM login_attempts WHERE key = ?`,
    [key]
  );
  return row ? { count: Number(row.count), firstAt: Number(row.first_at) } : null;
}

export async function bumpAttempts(key) {
  await run(
    `INSERT INTO login_attempts (key, count, first_at) VALUES (?, 1, ?)
     ON CONFLICT(key) DO UPDATE SET count = count + 1`,
    [key, Date.now()]
  );
}

export async function clearAttempts(key) {
  await run(`DELETE FROM login_attempts WHERE key = ?`, [key]);
}

/* ------------------------------------------------------------------- cart */

export async function addCartItem(userId, slug) {
  await run(
    `INSERT INTO cart_items (user_id, slug, added_at) VALUES (?, ?, ?)
     ON CONFLICT(user_id, slug) DO NOTHING`,
    [userId, slug, Date.now()]
  );
}

export async function removeCartItem(userId, slug) {
  await run(`DELETE FROM cart_items WHERE user_id = ? AND slug = ?`, [userId, slug]);
}

export async function clearCart(userId) {
  await run(`DELETE FROM cart_items WHERE user_id = ?`, [userId]);
}

export async function cartSlugs(userId) {
  const rows = await queryAll(
    `SELECT slug FROM cart_items WHERE user_id = ? ORDER BY added_at`,
    [userId]
  );
  return rows.map((r) => r.slug).filter(isSellableSlug);
}

export async function mergeCart(userId, slugs) {
  if (!slugs.length) return;
  const now = Date.now();
  const db = await getDb();
  await db.batch(
    slugs.map((slug) => ({
      sql: `INSERT INTO cart_items (user_id, slug, added_at) VALUES (?, ?, ?)
            ON CONFLICT(user_id, slug) DO NOTHING`,
      args: [userId, slug, now],
    })),
    "write"
  );
}

/* ----------------------------------------------------------- entitlements */

async function hasBundlePurchase(userId) {
  return Boolean(await queryOne(
    `SELECT 1 AS ok FROM orders o JOIN order_items i ON i.order_id = o.id
     WHERE o.user_id = ? AND o.status = 'paid' AND i.slug = ? LIMIT 1`,
    [userId, BUNDLE.slug]
  ));
}

export async function ownedSlugs(userId) {
  if (await hasBundlePurchase(userId)) return new Set(TEMPLATES.map(t => t.slug));
  const rows = await queryAll(`SELECT slug FROM entitlements WHERE user_id = ?`, [userId]);
  return new Set(rows.map(r => r.slug).filter(slug => Boolean(bySlug(slug))));
}

export async function owns(userId, slug) {
  if (!bySlug(slug)) return false;
  return Boolean(await queryOne(
    `SELECT 1 AS ok FROM entitlements WHERE user_id = ? AND slug = ?`, [userId, slug]
  )) || await hasBundlePurchase(userId);
}

/* ----------------------------------------------------------------- orders */

export async function createOrder(userId, provider, totalCents, items) {
  const id = randomUUID();
  const db = await getDb();
  await db.batch(
    [
      {
        sql: `INSERT INTO orders (id, user_id, total_cents, status, provider, created_at)
              VALUES (?, ?, ?, 'pending', ?, ?)`,
        args: [id, userId, totalCents, provider, Date.now()],
      },
      ...items.map((i) => ({
        sql: `INSERT INTO order_items (order_id, slug, price_cents) VALUES (?, ?, ?)`,
        args: [id, i.slug, i.priceCents],
      })),
    ],
    "write"
  );
  return { id, totalCents, items };
}

export async function getOrder(orderId) {
  const order = await queryOne(`SELECT * FROM orders WHERE id = ?`, [orderId]);
  if (!order) return null;
  const items = await queryAll(
    `SELECT slug, price_cents FROM order_items WHERE order_id = ?`,
    [orderId]
  );
  return { ...order, items };
}

export async function markPaidAndGrant(orderId, userId, slugs, providerRef) {
  const db = await getDb();
  const tx = await db.transaction("write");
  try {
    const order = (await tx.execute({ sql: "SELECT * FROM orders WHERE id = ?", args: [orderId] })).rows[0];
    if (!order || order.user_id !== userId) throw new Error("Unknown order");
    const update = await tx.execute({
      sql: "UPDATE orders SET status = 'paid', provider_ref = ? WHERE id = ? AND status = 'pending'",
      args: [providerRef ?? null, orderId],
    });
    if (!update.rowsAffected) { await tx.rollback(); return false; }
    for (const slug of slugs) await tx.execute({
      sql: "INSERT INTO entitlements (user_id, slug, order_id, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, slug) DO NOTHING",
      args: [userId, slug, orderId, Date.now()],
    });
    const items = (await tx.execute({ sql: "SELECT slug FROM order_items WHERE order_id = ?", args: [orderId] })).rows;
    for (const {slug} of items) await tx.execute({
      sql: "DELETE FROM cart_items WHERE user_id = ? AND slug = ? AND added_at <= ?",
      args: [userId, slug, order.created_at],
    });
    await tx.commit();
    return true;
  } catch (error) { await tx.rollback(); throw error; }
  finally { tx.close(); }
}

export async function paidOrdersFor(userId) {
  const orders = await queryAll(
    `SELECT id, total_cents, status, provider, created_at
       FROM orders WHERE user_id = ? AND status = 'paid'
      ORDER BY created_at DESC`,
    [userId]
  );
  return Promise.all(
    orders.map(async (o) => ({
      id: o.id,
      totalCents: Number(o.total_cents),
      status: o.status,
      provider: o.provider,
      createdAt: Number(o.created_at),
      items: await queryAll(
        `SELECT slug, price_cents FROM order_items WHERE order_id = ?`,
        [o.id]
      ),
    }))
  );
}

/* ---------------------------------------------------------------- reviews */

export async function upsertReview(userId, slug, review, email) {
  await run(
    `INSERT INTO reviews (id, user_id, slug, rating, title, body, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id, slug) DO UPDATE SET
       rating = excluded.rating, title = excluded.title,
       body = excluded.body, created_at = excluded.created_at`,
    [
      randomUUID(),
      userId,
      slug,
      review.rating,
      review.title,
      review.body,
      Date.now(),
    ]
  );
}

export async function reviewsFor(slug, limit) {
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
    email: r.email,
  }));
}

export async function myReview(userId, slug) {
  return queryOne(
    `SELECT rating, title, body FROM reviews WHERE user_id = ? AND slug = ?`,
    [userId, slug]
  );
}

export async function allReviews() {
  const rows = await queryAll(`SELECT slug, rating FROM reviews`);
  return rows.map((r) => ({ slug: r.slug, rating: Number(r.rating) }));
}

/* ------------------------------------------------------------------- mail */

export async function recordEmail(row) {
  await run(
    `INSERT INTO emails (id, to_email, subject, body, kind, provider, status, error, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id,
      row.toEmail,
      row.subject,
      row.body,
      row.kind,
      row.provider,
      row.status,
      row.error,
      row.createdAt,
    ]
  );
}

export async function recentEmails(limit) {
  const rows = await queryAll(
    `SELECT to_email, subject, kind, provider, status, created_at
       FROM emails ORDER BY created_at DESC LIMIT ?`,
    [limit]
  );
  return rows.map((r) => ({
    toEmail: r.to_email,
    subject: r.subject,
    kind: r.kind,
    provider: r.provider,
    status: r.status,
    createdAt: Number(r.created_at),
  }));
}

/* ---------------------------------------------------------------- metrics */

export async function allPaidOrders() {
  const orders = await queryAll(
    `SELECT id, user_id AS userId, total_cents AS totalCents,
            provider, created_at AS createdAt
       FROM orders WHERE status = 'paid'`
  );
  return Promise.all(
    orders.map(async (o) => ({
      ...o,
      totalCents: Number(o.totalCents),
      createdAt: Number(o.createdAt),
      items: Object.fromEntries(
        (
          await queryAll(
            `SELECT slug, price_cents FROM order_items WHERE order_id = ?`,
            [o.id]
          )
        ).map((i) => [i.slug, Number(i.price_cents)])
      ),
    }))
  );
}

export async function countUsers() {
  const row = await queryOne(`SELECT COUNT(*) AS n FROM users`);
  return Number(row?.n ?? 0);
}

export async function userEmail(userId) {
  const row = await queryOne(`SELECT email FROM users WHERE id = ?`, [userId]);
  return row?.email ?? null;
}

export async function findFirebaseUser(uid) {
  return queryOne("SELECT id, email FROM users WHERE firebase_uid = ?", [uid]);
}
export async function linkFirebaseUser(id, uid) {
  const result = await run("UPDATE users SET firebase_uid = ? WHERE id = ? AND firebase_uid IS NULL", [uid, id]);
  if (!result.rowsAffected) throw new Error("Account was linked by another request. Sign in again.");
  return findFirebaseUser(uid);
}
export async function createFirebaseUser(email, uid) {
  const id = randomUUID();
  await run("INSERT INTO users (id, email, password, created_at, firebase_uid) VALUES (?, ?, ?, ?, ?)",
    [id, email, "firebase-managed", Date.now(), uid]);
  return { id, email };
}
