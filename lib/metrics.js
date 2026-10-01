import { backend } from "./backend.js";
import { readOrFallback } from "./db.js";
import { BUNDLE, bySlug } from "./catalog.js";

/**
 * Sales figures, computed from paid orders. Vercel and Firebase Analytics
 * cover traffic; this covers what that traffic actually did.
 *
 * The aggregation runs in JavaScript rather than in the query so the same code
 * serves both backends — Realtime Database has no GROUP BY to lean on. At
 * store scale that is a rounding error; if order volume ever makes it matter,
 * this is the file to add a rollup to.
 */

const DAY = 86_400_000;

async function paid() {
  return readOrFallback(() => backend().allPaidOrders(), []);
}

export async function salesOverview(days = 30) {
  const since = Date.now() - days * DAY;
  const [orders, signups, reviews] = await Promise.all([
    paid(),
    readOrFallback(() => backend().countUsers(), 0),
    readOrFallback(() => backend().allReviews(), []),
  ]);

  const revenue = orders.reduce((s, o) => s + o.totalCents, 0);
  const windowOrders = orders.filter((o) => o.createdAt >= since);
  const payingCustomers = new Set(orders.map((o) => o.userId)).size;

  return {
    revenueCents: revenue,
    orders: orders.length,
    windowRevenueCents: windowOrders.reduce((s, o) => s + o.totalCents, 0),
    windowOrders: windowOrders.length,
    signups,
    payingCustomers,
    conversionRate: signups ? payingCustomers / signups : 0,
    averageOrderCents: orders.length ? Math.round(revenue / orders.length) : 0,
    reviewCount: reviews.length,
    averageRating: reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0,
    days,
  };
}

export async function topTemplates() {
  const orders = await paid();
  const totals = new Map();

  for (const o of orders) {
    for (const [slug, price] of Object.entries(o.items ?? {})) {
      const cur = totals.get(slug) ?? { units: 0, revenueCents: 0 };
      cur.units += 1;
      cur.revenueCents += Number(price);
      totals.set(slug, cur);
    }
  }

  return [...totals.entries()]
    .map(([slug, v]) => ({
      slug,
      name: slug === BUNDLE.slug ? BUNDLE.name : (bySlug(slug)?.name ?? slug),
      ...v,
    }))
    .sort((a, b) => b.revenueCents - a.revenueCents);
}

/** Daily revenue, oldest first, gaps filled with zero. */
export async function dailyRevenue(days = 30) {
  const since = Date.now() - days * DAY;
  const orders = await paid();

  const buckets = new Map();
  for (let i = 0; i < days; i++) {
    buckets.set(new Date(since + i * DAY).toISOString().slice(0, 10), 0);
  }
  for (const o of orders) {
    if (o.createdAt < since) continue;
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, buckets.get(key) + o.totalCents);
  }

  return [...buckets.entries()].map(([date, cents]) => ({ date, cents }));
}

export async function recentOrders(limit = 10) {
  const orders = (await paid())
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);

  return Promise.all(
    orders.map(async (o) => ({
      id: o.id,
      email: (await backend().userEmail(o.userId)) ?? "unknown",
      provider: o.provider,
      totalCents: o.totalCents,
      createdAt: o.createdAt,
    }))
  );
}
