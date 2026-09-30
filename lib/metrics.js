import { db } from "./firebase-admin.js";
import { itemName } from "./store.js";

/**
 * Sales figures for /admin, read from Firestore. Vercel Analytics covers
 * traffic; this covers what that traffic actually did.
 *
 * Every paid order is read once and summarised in memory. That is the right
 * trade at a template store's volume and needs no composite indexes; move to
 * running totals if it ever reaches tens of thousands of orders.
 */

const DAY = 86_400_000;

export async function salesReport(days = 30) {
  const since = Date.now() - days * DAY;

  const [paidSnap, userCount, reviewSnap] = await Promise.all([
    db().collection("orders").where("status", "==", "paid").get(),
    db().collection("users").count().get(),
    db().collection("reviews").select("rating").get(),
  ]);

  const paid = paidSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => b.createdAt - a.createdAt);

  const revenue = paid.reduce((s, o) => s + o.totalCents, 0);
  const recent = paid.filter((o) => o.createdAt >= since);
  const buyers = new Set(paid.map((o) => o.userId)).size;
  const signups = userCount.data().count;
  const ratings = reviewSnap.docs.map((d) => d.get("rating"));

  // Best sellers by revenue.
  const bySlug = new Map();
  for (const o of paid) {
    for (const i of o.items) {
      const row = bySlug.get(i.slug) ?? { slug: i.slug, name: itemName(i.slug), units: 0, revenueCents: 0 };
      row.units++;
      row.revenueCents += i.priceCents;
      bySlug.set(i.slug, row);
    }
  }

  // Daily revenue, oldest first, ending today, gaps filled with zero.
  const daily = new Map();
  for (let i = days - 1; i >= 0; i--) {
    daily.set(new Date(Date.now() - i * DAY).toISOString().slice(0, 10), 0);
  }
  for (const o of recent) {
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    if (daily.has(key)) daily.set(key, daily.get(key) + o.totalCents);
  }

  return {
    overview: {
      revenueCents: revenue,
      orders: paid.length,
      windowRevenueCents: recent.reduce((s, o) => s + o.totalCents, 0),
      windowOrders: recent.length,
      signups,
      payingCustomers: buyers,
      // Of everyone who made an account, how many bought something.
      conversionRate: signups ? buyers / signups : 0,
      averageOrderCents: paid.length ? Math.round(revenue / paid.length) : 0,
      reviewCount: ratings.length,
      averageRating: ratings.length
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0,
      days,
    },
    top: [...bySlug.values()].sort((a, b) => b.revenueCents - a.revenueCents),
    daily: [...daily.entries()].map(([date, cents]) => ({ date, cents })),
    recentOrders: paid.slice(0, 8).map((o) => ({
      id: o.id,
      email: o.email,
      provider: o.provider,
      totalCents: o.totalCents,
      createdAt: o.createdAt,
    })),
  };
}
