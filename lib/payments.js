import { fulfillOrder, sendReceipt } from "./store.js";
import { BUNDLE, MADE_FOR_YOU, bySlug } from "./catalog.js";

const describe = (slug) =>
  slug === BUNDLE.slug
    ? BUNDLE.tagline
    : slug === MADE_FOR_YOU.slug
      ? MADE_FOR_YOU.tagline
      : bySlug(slug)?.tagline;

/**
 * Takes payment for a pending order. With STRIPE_SECRET_KEY set it hands off
 * to Stripe Checkout and the webhook fulfils; without it — or when credit
 * covers the whole total — the order is fulfilled immediately, so the flow
 * works before a payment account exists.
 *
 * Returns where to send the buyer and whether the order is already paid.
 */
export async function startPayment(order, user, origin, { successUrl } = {}) {
  const key = process.env.STRIPE_SECRET_KEY;
  const done = `/account?order=${order.id}`;

  if (!key || order.totalCents === 0) {
    await fulfillOrder(order.id, key ? "fully-credited" : "simulated-payment");
    await sendReceipt(order.id, origin);
    return { redirect: done, paid: true };
  }

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(key);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    client_reference_id: order.id,
    metadata: { orderId: order.id },
    line_items: order.items
      .filter((i) => i.priceCents > 0)
      .map((i) => ({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: i.priceCents,
          product_data: { name: i.name, description: describe(i.slug) },
        },
      })),
    success_url: `${origin}${successUrl ?? done}`,
    cancel_url: `${origin}/cart`,
  });
  return { redirect: session.url, paid: false };
}
