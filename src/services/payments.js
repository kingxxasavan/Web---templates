'use strict';

const crypto = require('crypto');
const config = require('../config');

let stripeClient = null;
function stripe() {
  if (!config.stripe.secretKey) return null;
  if (!stripeClient) {
    const Stripe = require('stripe');
    stripeClient = new Stripe(config.stripe.secretKey, { apiVersion: '2024-11-20.acacia' });
  }
  return stripeClient;
}

/** True when real Stripe keys are configured. */
function isLive() {
  return Boolean(config.stripe.secretKey);
}

function reference() {
  // Human-quotable order reference: FDS-7KQ4X2
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (const byte of crypto.randomBytes(6)) out += alphabet[byte % alphabet.length];
  return `FDS-${out}`;
}

/**
 * Build the Stripe line items for a priced cart. The bundle discount is applied
 * as a negative-value coupon rather than by rewriting unit prices, so the buyer
 * sees each template at its real $5 and the saving on its own row.
 */
function toStripeLineItems(priced) {
  return priced.lines.map((line) => ({
    quantity: line.quantity,
    price_data: {
      currency: config.stripe.currency,
      unit_amount: line.unit_cents,
      product_data: {
        name: line.name,
        description: line.kind === 'template' ? 'Website template — lifetime licence' : line.blurb,
      },
    },
  }));
}

/**
 * Create a hosted checkout session. With Stripe keys configured this returns a
 * real Stripe Checkout URL. Without them it returns the local simulated
 * checkout, which is clearly labelled in the UI and never touches a card.
 */
async function createCheckout({ order, priced, email }) {
  const client = stripe();
  if (!client) {
    return { provider: 'dev', url: `/checkout/dev/${order.reference}`, providerRef: `dev_${order.reference}` };
  }

  const params = {
    mode: 'payment',
    line_items: toStripeLineItems(priced),
    customer_email: email || undefined,
    client_reference_id: order.reference,
    metadata: { order_reference: order.reference },
    success_url: `${config.baseUrl}/checkout/complete?ref=${order.reference}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.baseUrl}/cart?cancelled=1`,
  };

  if (priced.discount_cents > 0) {
    const coupon = await client.coupons.create({
      amount_off: priced.discount_cents,
      currency: config.stripe.currency,
      duration: 'once',
      name: `Bundle discount (${priced.bundles} × ${config.store.bundle.minItems} templates)`,
    });
    params.discounts = [{ coupon: coupon.id }];
  }

  const session = await client.checkout.sessions.create(params);
  return { provider: 'stripe', url: session.url, providerRef: session.id };
}

/** Verify and parse a Stripe webhook. Throws if the signature does not match. */
function parseWebhook(rawBody, signature) {
  const client = stripe();
  if (!client || !config.stripe.webhookSecret) {
    throw new Error('Stripe webhooks are not configured');
  }
  return client.webhooks.constructEvent(rawBody, signature, config.stripe.webhookSecret);
}

/** Confirm a session really is paid before granting entitlements. */
async function retrieveSession(sessionId) {
  const client = stripe();
  if (!client) return null;
  return client.checkout.sessions.retrieve(sessionId);
}

module.exports = { isLive, reference, createCheckout, parseWebhook, retrieveSession, toStripeLineItems };
