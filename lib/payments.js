import { queryOne } from "./db.js";
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
  const order = orderId ? await queryOne("SELECT * FROM orders WHERE id = ?", [orderId]) : null;
  if (!matchesPaidOrder(session, order)) throw new Error("Payment does not match its order");
  const result = await fulfillOrder(orderId, session.payment_intent || session.id);
  if (!result.alreadyPaid) await sendReceipt(orderId, origin);
}
