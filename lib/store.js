import { randomUUID } from "node:crypto";
import { queryAll, queryOne, run, getDb, readOrFallback } from "./db.js";
import {
  BUNDLE,
  TEMPLATES,
  bySlug,
  isSellableSlug,
  priceOfSlug,
} from "./catalog.js";
import { sendEmail, receiptEmail } from "./email.js";

/* -------------------------------------------------------------------- cart */

export async function addToCart(userId, slug) {
  if (!isSellableSlug(slug)) throw new Error("Unknown product");
  await run(
    `INSERT INTO cart_items (user_id, slug, added_at) VALUES (?, ?, ?)
     ON CONFLICT(user_id, slug) DO NOTHING`,
    [userId, slug, Date.now()]
  );
}

export async function removeFromCart(userId, slug) {
  await run(`DELETE FROM cart_items WHERE user_id = ? AND slug = ?`, [
    userId,
    slug,
  ]);
}

export async function clearCart(userId) {
  await run(`DELETE FROM cart_items WHERE user_id = ?`, [userId]);
}

/**
 * The cart, priced server-side. Anything the buyer already owns is dropped,
 * and if the bundle is present the individual templates are folded into it
 * so nobody is charged twice for the same file.
 */
export async function getCart(userId, guestSlugs = []) {
  // Signed out, the cart comes from the cookie and nothing touches the
  // database, so a visitor can price up an order before creating an account.
  let slugs;
  let owned;

  if (userId) {
    const [rows, ownedSet] = await Promise.all([
      readOrFallback(
        () =>
          queryAll(
            `SELECT slug FROM cart_items WHERE user_id = ? ORDER BY added_at`,
            [userId]
          ),
        []
      ),
      ownedSlugs(userId),
    ]);
    slugs = rows.map((r) => r.slug).filter((s) => isSellableSlug(s));
    owned = ownedSet;
  } else {
    slugs = (guestSlugs ?? []).filter((s) => isSellableSlug(s));
    owned = new Set();
  }
  const hasBundle = slugs.includes(BUNDLE.slug);

  const items = [];
  let removedOwned = 0;

  for (const slug of slugs) {
    if (slug === BUNDLE.slug) continue;
    if (owned.has(slug)) {
      removedOwned++;
      continue;
    }
    if (hasBundle) continue; // covered by the bundle
    const t = bySlug(slug);
    items.push({
      slug,
      name: t.name,
      tagline: t.tagline,
      priceCents: priceOfSlug(slug),
    });
  }

  if (hasBundle) {
    items.unshift({
      slug: BUNDLE.slug,
      name: BUNDLE.name,
      tagline: BUNDLE.tagline,
      priceCents: BUNDLE.priceCents,
    });
  }

  const subtotalCents = items.reduce((s, i) => s + i.priceCents, 0);
  return { items, subtotalCents, removedOwned, hasBundle };
}

export async function cartCount(userId, guestSlugs = []) {
  if (!userId) return (guestSlugs ?? []).filter(isSellableSlug).length;
  return readOrFallback(async () => {
    const row = await queryOne(
      `SELECT COUNT(*) AS n FROM cart_items WHERE user_id = ?`,
      [userId]
    );
    return Number(row?.n ?? 0);
  }, 0);
}

/**
 * Folds a signed-out cart into the account on sign in or registration, so
 * nothing a visitor picked out is lost at the door.
 */
export async function mergeGuestCart(userId, guestSlugs) {
  const slugs = (guestSlugs ?? []).filter(isSellableSlug);
  if (!slugs.length) return 0;

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
  return slugs.length;
}

/* ------------------------------------------------------------ entitlements */

export async function ownedSlugs(userId) {
  if (!userId) return new Set();
  return readOrFallback(async () => {
    const rows = await queryAll(
      `SELECT slug FROM entitlements WHERE user_id = ?`,
      [userId]
    );
    return new Set(rows.map((r) => r.slug));
  }, new Set());
}

export async function owns(userId, slug) {
  const row = await queryOne(
    `SELECT 1 AS ok FROM entitlements WHERE user_id = ? AND slug = ?`,
    [userId, slug]
  );
  return Boolean(row);
}

/* ------------------------------------------------------------------ orders */

/**
 * Records a pending order from the server-priced cart. The client never sends
 * an amount — the total is recomputed here from the catalogue.
 */
export async function createOrder(userId, provider) {
  const cart = await getCart(userId);
  if (!cart.items.length) throw new Error("Cart is empty");

  const id = randomUUID();
  const db = await getDb();

  await db.batch(
    [
      {
        sql: `INSERT INTO orders (id, user_id, total_cents, status, provider, created_at)
              VALUES (?, ?, ?, 'pending', ?, ?)`,
        args: [id, userId, cart.subtotalCents, provider, Date.now()],
      },
      ...cart.items.map((i) => ({
        sql: `INSERT INTO order_items (order_id, slug, price_cents) VALUES (?, ?, ?)`,
        args: [id, i.slug, i.priceCents],
      })),
    ],
    "write"
  );

  return { id, totalCents: cart.subtotalCents, items: cart.items };
}

/**
 * Marks an order paid and grants what it contains. A bundle fans out to every
 * template. Safe to call twice — the entitlement insert ignores conflicts and
 * the status update is guarded, so a replayed webhook cannot double-grant.
 */
export async function fulfillOrder(orderId, providerRef = null) {
  const order = await queryOne(`SELECT * FROM orders WHERE id = ?`, [orderId]);
  if (!order) throw new Error("Unknown order");
  if (order.status === "paid") return { alreadyPaid: true, order };

  const items = await queryAll(
    `SELECT slug FROM order_items WHERE order_id = ?`,
    [orderId]
  );

  const slugs = new Set();
  for (const { slug } of items) {
    if (slug === BUNDLE.slug) {
      for (const t of TEMPLATES) slugs.add(t.slug);
    } else {
      slugs.add(slug);
    }
  }

  const now = Date.now();
  const db = await getDb();
  await db.batch(
    [
      {
        sql: `UPDATE orders SET status = 'paid', provider_ref = ? WHERE id = ?`,
        args: [providerRef, orderId],
      },
      ...[...slugs].map((slug) => ({
        sql: `INSERT INTO entitlements (user_id, slug, order_id, created_at)
              VALUES (?, ?, ?, ?)
              ON CONFLICT(user_id, slug) DO NOTHING`,
        args: [order.user_id, slug, orderId, now],
      })),
    ],
    "write"
  );

  await clearCart(order.user_id);
  return { alreadyPaid: false, order, granted: [...slugs] };
}

export async function ordersFor(userId) {
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

export async function orderById(orderId, userId) {
  return queryOne(`SELECT * FROM orders WHERE id = ? AND user_id = ?`, [
    orderId,
    userId,
  ]);
}

/* ---------------------------------------------------------------- receipts */

/**
 * Emails the buyer their receipt. Called after fulfilment from both the
 * simulated path and the Stripe webhook. A mail failure must never fail the
 * purchase — the entitlement is already granted by this point — so anything
 * thrown here is swallowed and recorded in the emails table instead.
 */
export async function sendReceipt(orderId, origin) {
  try {
    const order = await queryOne(
      `SELECT o.id, o.total_cents, o.created_at, u.email
         FROM orders o JOIN users u ON u.id = o.user_id
        WHERE o.id = ?`,
      [orderId]
    );
    if (!order) return null;

    const rows = await queryAll(
      `SELECT slug, price_cents FROM order_items WHERE order_id = ?`,
      [orderId]
    );

    const items = rows.map((r) => ({
      name: r.slug === BUNDLE.slug ? BUNDLE.name : (bySlug(r.slug)?.name ?? r.slug),
      priceCents: Number(r.price_cents),
    }));

    return await sendEmail(
      receiptEmail({
        email: order.email,
        order: {
          id: order.id,
          totalCents: Number(order.total_cents),
          createdAt: Number(order.created_at),
        },
        items,
        origin,
      })
    );
  } catch (err) {
    console.error("receipt failed for order", orderId, err.message);
    return null;
  }
}
