import { readOrFallback } from "./db.js";
import { backend } from "./backend.js";
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
  await backend().addCartItem(userId, slug);
}

export async function removeFromCart(userId, slug) {
  await backend().removeCartItem(userId, slug);
}

export async function clearCart(userId) {
  await backend().clearCart(userId);
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
      readOrFallback(() => backend().cartSlugs(userId), []),
      ownedSlugs(userId),
    ]);
    slugs = rows;
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
  return readOrFallback(
    async () => (await backend().cartSlugs(userId)).length,
    0
  );
}

/**
 * Folds a signed-out cart into the account on sign in or registration, so
 * nothing a visitor picked out is lost at the door.
 */
export async function mergeGuestCart(userId, guestSlugs) {
  const slugs = (guestSlugs ?? []).filter(isSellableSlug);
  if (!slugs.length) return 0;
  await backend().mergeCart(userId, slugs);
  return slugs.length;
}

/* ------------------------------------------------------------ entitlements */

export async function ownedSlugs(userId) {
  if (!userId) return new Set();
  return readOrFallback(() => backend().ownedSlugs(userId), new Set());
}

export async function owns(userId, slug) {
  return backend().owns(userId, slug);
}

/* ------------------------------------------------------------------ orders */

/**
 * Records a pending order from the server-priced cart. The client never sends
 * an amount — the total is recomputed here from the catalogue.
 */
export async function createOrder(userId, provider) {
  const cart = await getCart(userId);
  if (!cart.items.length) throw new Error("Cart is empty");
  return backend().createOrder(userId, provider, cart.subtotalCents, cart.items);
}

/**
 * Marks an order paid and grants what it contains. A bundle fans out to every
 * template. Safe to call twice — the entitlement insert ignores conflicts and
 * the status update is guarded, so a replayed webhook cannot double-grant.
 */
export async function fulfillOrder(orderId, providerRef = null) {
  const order = await backend().getOrder(orderId);
  if (!order) throw new Error("Unknown order");
  if (order.status === "paid") return { alreadyPaid: true, order };

  const slugs = new Set();
  for (const { slug } of order.items) {
    if (slug === BUNDLE.slug) for (const t of TEMPLATES) slugs.add(t.slug);
    else slugs.add(slug);
  }

  await backend().markPaidAndGrant(
    orderId,
    order.user_id,
    [...slugs],
    providerRef
  );
  return { alreadyPaid: false, order, granted: [...slugs] };
}

export async function ordersFor(userId) {
  return backend().paidOrdersFor(userId);
}

export async function orderById(orderId, userId) {
  const order = await backend().getOrder(orderId);
  return order && order.user_id === userId ? order : null;
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
    const order = await backend().getOrder(orderId);
    if (!order) return null;
    const email = await backend().userEmail(order.user_id);
    if (!email) return null;

    const items = order.items.map((r) => ({
      name: r.slug === BUNDLE.slug ? BUNDLE.name : (bySlug(r.slug)?.name ?? r.slug),
      priceCents: Number(r.price_cents),
    }));

    return await sendEmail(
      receiptEmail({
        email,
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
