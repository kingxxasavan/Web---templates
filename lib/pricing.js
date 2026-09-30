import {
  BUNDLE,
  TEMPLATES,
  bySlug,
  isSellableSlug,
  priceOf,
} from "./catalog.js";

/**
 * Cart pricing, kept free of any I/O so every rule here is unit tested.
 *
 * The rules a buyer is promised:
 *  - Nothing they already own is ever charged for again.
 *  - With the bundle in the cart, individual templates fold into it.
 *  - Everything already bought counts toward the bundle, so upgrading later
 *    never costs more than buying the bundle on day one.
 */

/** What the bundle costs someone who already owns `owned`. */
export function bundlePriceFor(owned = new Set()) {
  const remaining = TEMPLATES.filter((t) => !owned.has(t.slug));
  if (!remaining.length) return null; // nothing left to sell them

  const credit = TEMPLATES.filter((t) => owned.has(t.slug)).reduce(
    (sum, t) => sum + priceOf(t),
    0
  );
  const remainingTotal = remaining.reduce((sum, t) => sum + priceOf(t), 0);

  // Never more than the rest bought separately, never below zero.
  return Math.min(Math.max(BUNDLE.priceCents - credit, 0), remainingTotal);
}

/**
 * Prices a list of slugs for a buyer who owns `owned`.
 * Returns the line items, the total, and an upgrade offer when the bundle
 * would add something the cart doesn't already have.
 */
export function priceCart(slugs = [], owned = new Set()) {
  const clean = [...new Set((slugs ?? []).filter((s) => isSellableSlug(s)))];
  const bundlePrice = bundlePriceFor(owned);
  const wantsBundle = clean.includes(BUNDLE.slug) && bundlePrice !== null;

  const items = [];
  let removedOwned = 0;

  for (const slug of clean) {
    if (slug === BUNDLE.slug) {
      if (bundlePrice === null) removedOwned++;
      continue;
    }
    if (owned.has(slug)) {
      removedOwned++;
      continue;
    }
    if (wantsBundle) continue; // covered by the bundle
    const t = bySlug(slug);
    items.push({
      slug,
      name: t.name,
      tagline: t.tagline,
      priceCents: priceOf(t),
      listPriceCents: priceOf(t),
    });
  }

  if (wantsBundle) {
    items.unshift({
      slug: BUNDLE.slug,
      name: BUNDLE.name,
      tagline: BUNDLE.tagline,
      priceCents: bundlePrice,
      listPriceCents: BUNDLE.priceCents,
    });
  }

  const totalCents = items.reduce((s, i) => s + i.priceCents, 0);
  const creditCents = items.reduce((s, i) => s + (i.listPriceCents - i.priceCents), 0);

  // Suggest the bundle only when it adds templates the cart doesn't have.
  let upgrade = null;
  if (!wantsBundle && items.length && bundlePrice !== null) {
    const remaining = TEMPLATES.filter((t) => !owned.has(t.slug)).length;
    if (remaining > items.length) {
      upgrade = {
        bundlePriceCents: bundlePrice,
        differenceCents: bundlePrice - totalCents,
        extraTemplates: remaining - items.length,
      };
    }
  }

  return {
    items,
    totalCents,
    creditCents,
    removedOwned,
    hasBundle: wantsBundle,
    upgrade,
  };
}

/** The templates an order grants. The bundle fans out to all of them. */
export function grantsFor(itemSlugs) {
  const out = new Set();
  let allAccess = false;
  for (const slug of itemSlugs) {
    if (slug === BUNDLE.slug) {
      allAccess = true;
      for (const t of TEMPLATES) out.add(t.slug);
    } else if (bySlug(slug)) {
      out.add(slug);
    }
  }
  return { slugs: [...out], allAccess };
}
