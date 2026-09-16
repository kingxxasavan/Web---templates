import { queryAll, queryOne } from "./db.js";
import { BUNDLE, bySlug } from "./catalog.js";

/**
 * Sales figures, read straight from the orders tables. Vercel Analytics covers
 * traffic; this covers what that traffic actually did.
 */

const DAY = 86_400_000;

export async function salesOverview(days = 30) {
  const since = Date.now() - days * DAY;

  const [totals, window, customers, reviews] = await Promise.all([
    queryOne(
      `SELECT COUNT(*) AS orders, COALESCE(SUM(total_cents), 0) AS revenue
         FROM orders WHERE status = 'paid'`
    ),
    queryOne(
      `SELECT COUNT(*) AS orders, COALESCE(SUM(total_cents), 0) AS revenue
         FROM orders WHERE status = 'paid' AND created_at >= ?`,
      [since]
    ),
    queryOne(`SELECT COUNT(*) AS n FROM users`),
    queryOne(`SELECT COUNT(*) AS n, COALESCE(AVG(rating), 0) AS avg FROM reviews`),
  ]);

  const orders = Number(totals?.orders ?? 0);
  const revenue = Number(totals?.revenue ?? 0);
  const signups = Number(customers?.n ?? 0);

  const buyers = await queryOne(
    `SELECT COUNT(DISTINCT user_id) AS n FROM orders WHERE status = 'paid'`
  );
  const payingCustomers = Number(buyers?.n ?? 0);

  return {
    revenueCents: revenue,
    orders,
    windowRevenueCents: Number(window?.revenue ?? 0),
    windowOrders: Number(window?.orders ?? 0),
    signups,
    payingCustomers,
    // Of everyone who made an account, how many bought something.
    conversionRate: signups ? payingCustomers / signups : 0,
    averageOrderCents: orders ? Math.round(revenue / orders) : 0,
    reviewCount: Number(reviews?.n ?? 0),
    averageRating: Number(reviews?.avg ?? 0),
    days,
  };
}

/** Units and revenue per template, best sellers first. */
export async function topTemplates() {
  const rows = await queryAll(
    `SELECT oi.slug, COUNT(*) AS units, SUM(oi.price_cents) AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
      WHERE o.status = 'paid'
      GROUP BY oi.slug
      ORDER BY revenue DESC`
  );

  return rows.map((r) => ({
    slug: r.slug,
    name: r.slug === BUNDLE.slug ? BUNDLE.name : (bySlug(r.slug)?.name ?? r.slug),
    units: Number(r.units),
    revenueCents: Number(r.revenue),
  }));
}

/** Daily revenue for a simple sparkline, oldest first, gaps filled with zero. */
export async function dailyRevenue(days = 30) {
  const since = Date.now() - days * DAY;
  const rows = await queryAll(
    `SELECT created_at, total_cents FROM orders
      WHERE status = 'paid' AND created_at >= ?`,
    [since]
  );

  const buckets = new Map();
  for (let i = 0; i < days; i++) {
    const key = new Date(since + i * DAY).toISOString().slice(0, 10);
    buckets.set(key, 0);
  }
  for (const r of rows) {
    const key = new Date(Number(r.created_at)).toISOString().slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, buckets.get(key) + Number(r.total_cents));
    }
  }

  return [...buckets.entries()].map(([date, cents]) => ({ date, cents }));
}

export async function recentOrders(limit = 10) {
  const rows = await queryAll(
    `SELECT o.id, o.total_cents, o.created_at, o.provider, u.email
       FROM orders o JOIN users u ON u.id = o.user_id
      WHERE o.status = 'paid'
      ORDER BY o.created_at DESC LIMIT ?`,
    [limit]
  );
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    provider: r.provider,
    totalCents: Number(r.total_cents),
    createdAt: Number(r.created_at),
  }));
}
