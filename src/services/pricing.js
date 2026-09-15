'use strict';

const config = require('../config');

function formatMoney(cents, currency = 'usd') {
  const amount = (cents / 100).toFixed(2);
  return currency === 'usd' ? `$${amount}` : `${amount} ${currency.toUpperCase()}`;
}

/**
 * Turn a raw session cart into priced lines plus totals.
 *
 * Bundle rule: every group of `bundle.minItems` templates is charged at
 * `bundle.priceCents` instead of full price. Leftovers stay at full price, so
 * four templates cost one bundle plus one single. Add-ons never discount.
 */
function priceCart(cart, templatesBySlug) {
  const templateLines = [];
  for (const slug of cart.templates || []) {
    const template = templatesBySlug[slug];
    if (!template) continue;
    templateLines.push({
      kind: 'template',
      sku: template.slug,
      name: template.name,
      unit_cents: template.price_cents,
      quantity: 1,
      template,
    });
  }

  const addonLines = [];
  for (const id of cart.addons || []) {
    const addon = config.store.addons[id];
    if (!addon) continue;
    addonLines.push({
      kind: 'addon',
      sku: id,
      name: addon.name,
      unit_cents: addon.priceCents,
      quantity: 1,
      blurb: addon.blurb,
    });
  }

  const lines = [...templateLines, ...addonLines];
  const subtotal = lines.reduce((sum, line) => sum + line.unit_cents * line.quantity, 0);

  const { minItems, priceCents } = config.store.bundle;
  const bundles = Math.floor(templateLines.length / minItems);
  const fullPriceOfBundled = bundles * minItems * config.store.templatePriceCents;
  const discount = bundles > 0 ? Math.max(0, fullPriceOfBundled - bundles * priceCents) : 0;

  return {
    lines,
    templateLines,
    addonLines,
    bundles,
    subtotal_cents: subtotal,
    discount_cents: discount,
    total_cents: Math.max(0, subtotal - discount),
    itemCount: lines.length,
  };
}

/** How many more templates until the next bundle discount kicks in. */
function nextBundleNudge(templateCount) {
  const { minItems, priceCents } = config.store.bundle;
  const remainder = templateCount % minItems;
  if (templateCount === 0 || remainder === 0) return null;
  const needed = minItems - remainder;
  const saving = minItems * config.store.templatePriceCents - priceCents;
  return { needed, saving_cents: saving };
}

module.exports = { priceCart, formatMoney, nextBundleNudge };
