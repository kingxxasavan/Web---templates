'use strict';

const crypto = require('crypto');
const { db } = require('../db');
const config = require('../config');
const payments = require('./payments');
const templatesService = require('./templates');

/** Create a pending order plus its line items from a priced cart. */
function createPending({ userId, email, priced, provider = 'stripe' }) {
  const reference = payments.reference();
  const insertOrder = db.prepare(`
    INSERT INTO orders (reference, user_id, email, status, subtotal_cents, discount_cents, total_cents, currency, provider)
    VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?)
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, kind, sku, name, unit_cents, quantity)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    const info = insertOrder.run(
      reference,
      userId || null,
      email,
      priced.subtotal_cents,
      priced.discount_cents,
      priced.total_cents,
      config.stripe.currency,
      provider
    );
    for (const line of priced.lines) {
      insertItem.run(info.lastInsertRowid, line.kind, line.sku, line.name, line.unit_cents, line.quantity);
    }
    return info.lastInsertRowid;
  });

  return byId(tx());
}

function byId(id) {
  return db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
}

function byReference(reference) {
  return db.prepare('SELECT * FROM orders WHERE reference = ?').get(reference);
}

function byProviderRef(ref) {
  return db.prepare('SELECT * FROM orders WHERE provider_ref = ?').get(ref);
}

function items(orderId) {
  return db.prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id').all(orderId);
}

function setProviderRef(orderId, providerRef, provider) {
  db.prepare('UPDATE orders SET provider_ref = ?, provider = ? WHERE id = ?').run(providerRef, provider, orderId);
}

function forUser(userId) {
  const rows = db.prepare('SELECT * FROM orders WHERE user_id = ? AND status = ? ORDER BY id DESC').all(userId, 'paid');
  return rows.map((order) => ({ ...order, items: items(order.id) }));
}

/**
 * Mark an order paid and grant the entitlements it buys. Idempotent: a webhook
 * and the success-page redirect both call this, and Stripe retries webhooks, so
 * a second call on an already-paid order must be a no-op rather than a
 * duplicate grant.
 */
function fulfil(order, { userId }) {
  if (!order) throw new Error('Unknown order');
  if (order.status === 'paid') {
    return { order: byId(order.id), alreadyFulfilled: true, granted: [] };
  }

  const lines = items(order.id);
  const templateSlugs = lines.filter((l) => l.kind === 'template').map((l) => l.sku);
  const addons = lines.filter((l) => l.kind === 'addon').map((l) => l.sku);

  const markPaid = db.prepare("UPDATE orders SET status = 'paid', paid_at = datetime('now'), user_id = ? WHERE id = ?");
  const grant = db.prepare(`
    INSERT INTO entitlements (user_id, template_slug, order_id, addons)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, template_slug) DO UPDATE SET
      addons = excluded.addons,
      order_id = COALESCE(entitlements.order_id, excluded.order_id)
  `);

  const tx = db.transaction(() => {
    markPaid.run(userId, order.id);
    for (const slug of templateSlugs) {
      grant.run(userId, slug, order.id, JSON.stringify(addons));
    }
  });
  tx();

  return { order: byId(order.id), alreadyFulfilled: false, granted: templateSlugs };
}

function entitlementsFor(userId) {
  const rows = db
    .prepare('SELECT * FROM entitlements WHERE user_id = ? ORDER BY id DESC')
    .all(userId);
  return rows
    .map((row) => {
      const template = templatesService.bySlug(row.template_slug);
      if (!template) return null;
      return { ...row, addons: JSON.parse(row.addons || '[]'), template };
    })
    .filter(Boolean);
}

function owns(userId, slug) {
  if (!userId) return null;
  const row = db.prepare('SELECT * FROM entitlements WHERE user_id = ? AND template_slug = ?').get(userId, slug);
  return row ? { ...row, addons: JSON.parse(row.addons || '[]') } : null;
}

/** Short-lived, single-use download token so zip URLs are not shareable. */
function issueDownloadToken(userId, slug) {
  const token = crypto.randomBytes(24).toString('hex');
  const expires = new Date(Date.now() + config.downloads.tokenTtlMinutes * 60_000).toISOString();
  db.prepare('INSERT INTO download_tokens (token, user_id, template_slug, expires_at) VALUES (?, ?, ?, ?)')
    .run(token, userId, slug, expires);
  return token;
}

function consumeDownloadToken(token) {
  const row = db.prepare('SELECT * FROM download_tokens WHERE token = ?').get(token);
  if (!row) return null;
  if (row.used_at) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  db.prepare("UPDATE download_tokens SET used_at = datetime('now') WHERE token = ?").run(token);
  db.prepare('UPDATE entitlements SET download_count = download_count + 1 WHERE user_id = ? AND template_slug = ?')
    .run(row.user_id, row.template_slug);
  return row;
}

module.exports = {
  createPending,
  byId,
  byReference,
  byProviderRef,
  items,
  setProviderRef,
  forUser,
  fulfil,
  entitlementsFor,
  owns,
  issueDownloadToken,
  consumeDownloadToken,
};
