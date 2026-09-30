import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { priceCart, bundlePriceFor, grantsFor } from "../lib/pricing.js";
import { BUNDLE, TEMPLATES, TIERS, priceOf, individualTotal } from "../lib/catalog.js";

const starter = TEMPLATES.find((t) => t.tier === "starter");
const pro = TEMPLATES.find((t) => t.tier === "pro");
const premium = TEMPLATES.find((t) => t.tier === "premium");
const all = new Set(TEMPLATES.map((t) => t.slug));

describe("catalogue prices", () => {
  test("every template sits between $5 and $15", () => {
    for (const t of TEMPLATES) {
      assert.ok(priceOf(t) >= 500 && priceOf(t) <= 1500, `${t.slug} is ${priceOf(t)}`);
    }
  });

  test("the bundle is cheaper than buying everything separately", () => {
    assert.ok(BUNDLE.priceCents < individualTotal());
  });
});

describe("priceCart", () => {
  test("prices single templates from the catalogue", () => {
    const cart = priceCart([starter.slug, pro.slug]);
    assert.equal(cart.totalCents, TIERS.starter.priceCents + TIERS.pro.priceCents);
    assert.equal(cart.creditCents, 0);
    assert.equal(cart.items.length, 2);
  });

  test("ignores unknown slugs and duplicates", () => {
    const cart = priceCart([starter.slug, starter.slug, "../etc/passwd", 42, null]);
    assert.equal(cart.items.length, 1);
  });

  test("drops what the buyer already owns", () => {
    const cart = priceCart([starter.slug, pro.slug], new Set([starter.slug]));
    assert.deepEqual(cart.items.map((i) => i.slug), [pro.slug]);
    assert.equal(cart.removedOwned, 1);
  });

  test("folds individual templates into the bundle", () => {
    const cart = priceCart([starter.slug, BUNDLE.slug, pro.slug]);
    assert.deepEqual(cart.items.map((i) => i.slug), [BUNDLE.slug]);
    assert.equal(cart.totalCents, BUNDLE.priceCents);
    assert.ok(cart.hasBundle);
  });

  test("credits owned templates against the bundle", () => {
    const owned = new Set([pro.slug]);
    const cart = priceCart([BUNDLE.slug], owned);
    assert.equal(cart.totalCents, BUNDLE.priceCents - priceOf(pro));
    assert.equal(cart.creditCents, priceOf(pro));
    assert.equal(cart.items[0].listPriceCents, BUNDLE.priceCents);
  });

  test("upgrading never costs more than the bundle did on day one", () => {
    // Every possible library, all 2^n of them.
    for (let mask = 0; mask < 2 ** TEMPLATES.length - 1; mask++) {
      const owned = new Set(TEMPLATES.filter((_, i) => mask & (1 << i)).map((t) => t.slug));
      const spent = TEMPLATES.filter((t) => owned.has(t.slug)).reduce((s, t) => s + priceOf(t), 0);
      const remaining = TEMPLATES.filter((t) => !owned.has(t.slug)).reduce((s, t) => s + priceOf(t), 0);
      const price = bundlePriceFor(owned);
      assert.ok(price >= 0, "never negative");
      assert.ok(price <= remaining, "never more than the rest bought separately");
      assert.ok(price <= Math.max(BUNDLE.priceCents - spent, 0), "credit is always applied");
    }
  });

  test("credit can take the bundle to zero but never below", () => {
    const owned = new Set([premium.slug, ...TEMPLATES.filter((t) => t.tier === "pro").map((t) => t.slug)]);
    assert.equal(bundlePriceFor(owned), 0);
  });

  test("someone who owns everything cannot buy the bundle again", () => {
    assert.equal(bundlePriceFor(all), null);
    const cart = priceCart([BUNDLE.slug], all);
    assert.equal(cart.items.length, 0);
    assert.equal(cart.removedOwned, 1);
  });

  test("offers the bundle when it adds templates", () => {
    const cart = priceCart([starter.slug]);
    assert.ok(cart.upgrade);
    assert.equal(cart.upgrade.bundlePriceCents, BUNDLE.priceCents);
    assert.equal(cart.upgrade.differenceCents, BUNDLE.priceCents - priceOf(starter));
    assert.equal(cart.upgrade.extraTemplates, TEMPLATES.length - 1);
  });

  test("no offer when the bundle is already in the cart", () => {
    assert.equal(priceCart([BUNDLE.slug]).upgrade, null);
  });

  test("no offer when the cart already holds everything left", () => {
    const owned = new Set(TEMPLATES.slice(1).map((t) => t.slug));
    assert.equal(priceCart([TEMPLATES[0].slug], owned).upgrade, null);
  });
});

describe("grantsFor", () => {
  test("a bundle grants every template and all-access", () => {
    const g = grantsFor([BUNDLE.slug]);
    assert.equal(g.slugs.length, TEMPLATES.length);
    assert.ok(g.allAccess);
  });

  test("single templates grant only themselves", () => {
    const g = grantsFor([starter.slug, "nope"]);
    assert.deepEqual(g.slugs, [starter.slug]);
    assert.equal(g.allAccess, false);
  });
});
