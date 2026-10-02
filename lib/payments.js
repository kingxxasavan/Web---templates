import { backend } from "./backend.js";
import { fulfillOrder, sendReceipt } from "./store.js";

export function matchesPaidOrder(session, order) {
  return Boolean(order && order.provider === "stripe" && session.mode === "payment" &&
    session.payment_status === "paid" && session.currency === "usd" &&
    session.amount_total === Number(order.total_cents) &&
    session.client_reference_id === order.id && session.metadata?.orderId === order.id);
}

export async function fulfillStripeSession(session, origin) {
  if (session.payment_status !== "paid") return;
  const orderId = session.metadata?.orderId;
  const order = orderId ? await backend().getOrder(orderId) : null;
  if (!matchesPaidOrder(session, order)) throw new Error("Payment does not match its order");
  const result = await fulfillOrder(orderId, session.payment_intent || session.id);
  if (!result.alreadyPaid) await sendReceipt(orderId, origin);
}

/**
 * Opens Stripe Checkout for an order that has already been recorded. The
 * amounts come from the order, which was priced on the server, and the order
 * id travels with the session so the webhook can match the two.
 */
export async function startStripeCheckout(order, user, origin, { success, cancel }) {
  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    mode: "payment", customer_email: user.email, client_reference_id: order.id,
    metadata: { orderId: order.id },
    line_items: order.items.map((i) => ({ quantity: 1, price_data: {
      currency: "usd", unit_amount: i.priceCents,
      product_data: { name: i.name, ...(i.tagline ? { description: i.tagline } : {}) },
    } })),
    success_url: origin + success,
    cancel_url: origin + cancel,
  }, { idempotencyKey: "checkout-" + order.id });
  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}

export const paymentsConfigured = () =>
  Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
