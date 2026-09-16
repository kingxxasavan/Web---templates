'use strict';

const test = require('node:test');
const assert = require('node:assert');

const { priceCart, formatMoney, nextBundleNudge } = require('../src/services/pricing');
const config = require('../src/config');

const PRICE = config.store.templatePriceCents;
const { minItems, priceCents: bundlePrice } = config.store.bundle;

function fakeTemplates(...slugs) {
  return Object.fromEntries(slugs.map((s) => [s, { slug: s, name: s.toUpperCase(), price_cents: PRICE }]));
}

test('an empty cart totals nothing', () => {
  const priced = priceCart({ templates: [], addons: [] }, {});
  assert.strictEqual(priced.total_cents, 0);
  assert.strictEqual(priced.itemCount, 0);
});

test('a single template costs the flat rate', () => {
  const priced = priceCart({ templates: ['a'] }, fakeTemplates('a'));
  assert.strictEqual(priced.subtotal_cents, PRICE);
  assert.strictEqual(priced.discount_cents, 0);
  assert.strictEqual(priced.total_cents, PRICE);
});

test('below the bundle threshold there is no discount', () => {
  const slugs = Array.from({ length: minItems - 1 }, (_, i) => `t${i}`);
  const priced = priceCart({ templates: slugs }, fakeTemplates(...slugs));
  assert.strictEqual(priced.discount_cents, 0);
  assert.strictEqual(priced.total_cents, PRICE * slugs.length);
});

test('exactly the bundle size is charged at the bundle price', () => {
  const slugs = Array.from({ length: minItems }, (_, i) => `t${i}`);
  const priced = priceCart({ templates: slugs }, fakeTemplates(...slugs));
  assert.strictEqual(priced.bundles, 1);
  assert.strictEqual(priced.total_cents, bundlePrice);
});

test('leftovers above a bundle stay at full price', () => {
  const slugs = Array.from({ length: minItems + 1 }, (_, i) => `t${i}`);
  const priced = priceCart({ templates: slugs }, fakeTemplates(...slugs));
  assert.strictEqual(priced.bundles, 1);
  assert.strictEqual(priced.total_cents, bundlePrice + PRICE);
});

test('bundles stack — twice the bundle size is two bundles', () => {
  const slugs = Array.from({ length: minItems * 2 }, (_, i) => `t${i}`);
  const priced = priceCart({ templates: slugs }, fakeTemplates(...slugs));
  assert.strictEqual(priced.bundles, 2);
  assert.strictEqual(priced.total_cents, bundlePrice * 2);
});

test('add-ons are never discounted by the bundle', () => {
  const slugs = Array.from({ length: minItems }, (_, i) => `t${i}`);
  const addonId = Object.keys(config.store.addons)[0];
  const addonPrice = config.store.addons[addonId].priceCents;

  const priced = priceCart({ templates: slugs, addons: [addonId] }, fakeTemplates(...slugs));
  assert.strictEqual(priced.total_cents, bundlePrice + addonPrice);
});

test('unknown slugs and add-ons are dropped rather than priced at zero', () => {
  const priced = priceCart({ templates: ['a', 'nope'], addons: ['not-an-addon'] }, fakeTemplates('a'));
  assert.strictEqual(priced.itemCount, 1);
  assert.strictEqual(priced.total_cents, PRICE);
});

test('the total never goes negative', () => {
  const slugs = Array.from({ length: minItems * 3 }, (_, i) => `t${i}`);
  const priced = priceCart({ templates: slugs }, fakeTemplates(...slugs));
  assert.ok(priced.total_cents >= 0);
  assert.strictEqual(priced.subtotal_cents - priced.discount_cents, priced.total_cents);
});

test('the bundle nudge only appears when it would actually save money', () => {
  assert.strictEqual(nextBundleNudge(0), null, 'no nudge for an empty cart');
  assert.strictEqual(nextBundleNudge(minItems), null, 'no nudge when the bundle is already complete');

  const nudge = nextBundleNudge(minItems - 1);
  assert.strictEqual(nudge.needed, 1);
  assert.strictEqual(nudge.saving_cents, minItems * PRICE - bundlePrice);
});

test('money formats to two decimal places', () => {
  assert.strictEqual(formatMoney(500), '$5.00');
  assert.strictEqual(formatMoney(1200), '$12.00');
  assert.strictEqual(formatMoney(0), '$0.00');
  assert.strictEqual(formatMoney(1), '$0.01');
});
