import { test } from "node:test";
import assert from "node:assert/strict";
import { matchesPaidOrder } from "../lib/payments.js";

const order = { id: "order-1", provider: "stripe", total_cents: 1000 };
const session = { mode: "payment", payment_status: "paid", currency: "usd", amount_total: 1000,
  client_reference_id: "order-1", metadata: { orderId: "order-1" } };
test("a verified paid session must match its server-priced order", () => {
  assert.equal(matchesPaidOrder(session, order), true);
  for (const change of [ { payment_status: "unpaid" }, { amount_total: 1 }, { currency: "eur" },
    { mode: "subscription" }, { client_reference_id: "another-order" }, { metadata: {} } ])
    assert.equal(matchesPaidOrder({ ...session, ...change }, order), false);
  assert.equal(matchesPaidOrder(session, { ...order, provider: "simulated" }), false);
  assert.equal(matchesPaidOrder(session, null), false);
});
