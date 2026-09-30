import { db, readOrFallback } from "./firebase-admin.js";
import { BUNDLE, TEMPLATES, bySlug } from "./catalog.js";
import { priceCart, grantsFor } from "./pricing.js";
import { sendEmail, receiptEmail } from "./email.js";

/**
 * Orders and libraries, in Firestore.
 *
 *   users/{uid}                     email, allAccess
 *   users/{uid}/entitlements/{slug} one document per owned template
 *   orders/{orderId}                items, totals, status
 *
 * Bundle buyers get `allAccess`, so templates released after their purchase
 * appear in their library without anyone re-granting them.
 */

const users = () => db().collection("users");
const orders = () => db().collection("orders");

/* ------------------------------------------------------------ entitlements */

async function loadOwned(uid) {
  const [profile, grants] = await Promise.all([
    users().doc(uid).get(),
    users().doc(uid).collection("entitlements").get(),
  ]);
  if (profile.get("allAccess")) return new Set(TEMPLATES.map((t) => t.slug));
  return new Set(grants.docs.map((d) => d.id));
}

/** What the buyer can download. Empty when signed out or unreachable. */
export async function ownedSlugs(uid) {
  if (!uid) return new Set();
  return readOrFallback(() => loadOwned(uid), new Set());
}

/** Strict version for the download route: errors surface instead of hiding. */
export async function owns(uid, slug) {
  const owned = await loadOwned(uid);
  if (slug === BUNDLE.slug) return TEMPLATES.every((t) => owned.has(t.slug));
  return owned.has(slug);
}

/* -------------------------------------------------------------------- cart */

export async function getCart(uid, slugs) {
  return priceCart(slugs, await ownedSlugs(uid));
}

/* ------------------------------------------------------------------ orders */

/**
 * Records a pending order from the server-priced cart. The client never sends
 * an amount — the total is recomputed here from the catalogue.
 */
export async function createOrder(user, slugs, provider) {
  const owned = await loadOwned(user.id);
  const cart = priceCart(slugs, owned);
  if (!cart.items.length) throw new Error("Your cart is empty.");

  const ref = orders().doc();
  const order = {
    userId: user.id,
    email: user.email,
    items: cart.items.map(({ slug, name, priceCents, listPriceCents }) => ({
      slug,
      name,
      priceCents,
      listPriceCents,
    })),
    totalCents: cart.totalCents,
    creditCents: cart.creditCents,
    status: "pending",
    provider,
    createdAt: Date.now(),
  };
  await ref.set(order);
  return { id: ref.id, ...order };
}

/**
 * Marks an order paid and grants what it contains, in one transaction. Safe
 * to call twice: a paid order is returned untouched, so a replayed Stripe
 * webhook cannot double-grant or re-send the receipt.
 */
export async function fulfillOrder(orderId, providerRef = null) {
  const ref = orders().doc(orderId);

  return db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("Unknown order");
    const order = snap.data();
    if (order.status === "paid") return { alreadyPaid: true, order };

    const { slugs, allAccess } = grantsFor(order.items.map((i) => i.slug));
    const now = Date.now();
    const user = users().doc(order.userId);

    tx.update(ref, { status: "paid", providerRef, paidAt: now });
    for (const slug of slugs) {
      tx.set(user.collection("entitlements").doc(slug), {
        orderId,
        grantedAt: now,
      });
    }
    if (allAccess) tx.set(user, { allAccess: true }, { merge: true });

    return { alreadyPaid: false, order, granted: slugs };
  });
}

export async function ordersFor(uid) {
  // Filtered and sorted here rather than in the query, so no composite
  // index has to be deployed before the account page works.
  const snap = await orders().where("userId", "==", uid).get();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((o) => o.status === "paid")
    .sort((a, b) => b.createdAt - a.createdAt);
}

export const itemName = (slug) =>
  slug === BUNDLE.slug ? BUNDLE.name : (bySlug(slug)?.name ?? slug);

/* ---------------------------------------------------------------- receipts */

/**
 * Emails the buyer their receipt. A mail failure must never fail the
 * purchase — the entitlement is already granted by this point — so anything
 * thrown here is swallowed and recorded instead.
 */
export async function sendReceipt(orderId, origin) {
  try {
    const snap = await orders().doc(orderId).get();
    if (!snap.exists) return null;
    const order = snap.data();
    return await sendEmail(
      receiptEmail({
        email: order.email,
        order: { id: orderId, ...order },
        items: order.items,
        origin,
      })
    );
  } catch (err) {
    console.error("receipt failed for order", orderId, err.message);
    return null;
  }
}
