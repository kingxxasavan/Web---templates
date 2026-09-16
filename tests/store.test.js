import { test, before, describe } from "node:test";
import assert from "node:assert/strict";
import { rm, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

// Point the data layer at a throwaway database before anything imports it.
const dir = await mkdtemp(path.join(tmpdir(), "foundry-test-"));
process.env.DATABASE_URL = `file:${path.join(dir, "test.db")}`;

const catalog = await import("../lib/catalog.js");
const store = await import("../lib/store.js");
const password = await import("../lib/password.js");
const { run } = await import("../lib/db.js");

const { TEMPLATES, BUNDLE, TIERS, priceOfSlug, isSellableSlug, money } = catalog;

let userId = 0;
async function newUser() {
  const id = `user-${++userId}`;
  await run(
    `INSERT INTO users (id, email, password, created_at) VALUES (?, ?, ?, ?)`,
    [id, `${id}@example.com`, "x", Date.now()]
  );
  return id;
}

describe("catalogue", () => {
  test("every template sits in a known tier", () => {
    for (const t of TEMPLATES) {
      assert.ok(TIERS[t.tier], `${t.slug} has unknown tier ${t.tier}`);
    }
  });

  test("the three advertised price points are $5, $10 and $35", () => {
    assert.equal(TIERS.starter.priceCents, 500);
    assert.equal(TIERS.pro.priceCents, 1000);
    assert.equal(BUNDLE.priceCents, 3500);
  });

  test("the bundle undercuts buying everything separately", () => {
    assert.ok(catalog.individualTotal() > BUNDLE.priceCents);
  });

  test("slugs are unique", () => {
    const slugs = TEMPLATES.map((t) => t.slug);
    assert.equal(new Set(slugs).size, slugs.length);
  });

  test("only catalogue slugs are sellable", () => {
    assert.ok(isSellableSlug("vertex-launch"));
    assert.ok(isSellableSlug(BUNDLE.slug));
    assert.ok(!isSellableSlug("../../etc/passwd"));
    assert.ok(!isSellableSlug("not-a-template"));
  });

  test("money renders whole dollars without decimals", () => {
    assert.equal(money(500), "$5");
    assert.equal(money(3500), "$35");
    assert.equal(money(1250), "$12.50");
  });
});

describe("passwords", () => {
  test("a hash verifies against its own password only", async () => {
    const hash = await password.hashPassword("correct-horse-battery");
    assert.ok(await password.verifyPassword("correct-horse-battery", hash));
    assert.ok(!(await password.verifyPassword("wrong", hash)));
  });

  test("the same password hashes differently each time", async () => {
    const a = await password.hashPassword("same-password");
    const b = await password.hashPassword("same-password");
    assert.notEqual(a, b, "salt is not being applied");
  });

  test("a malformed stored hash fails closed", async () => {
    assert.ok(!(await password.verifyPassword("x", "garbage")));
    assert.ok(!(await password.verifyPassword("x", "")));
  });
});

describe("cart pricing", () => {
  test("totals come from the catalogue, not the client", async () => {
    const user = await newUser();
    await store.addToCart(user, "vertex-launch"); // $5
    await store.addToCart(user, "helix-ai"); // $10

    const cart = await store.getCart(user);
    assert.equal(cart.subtotalCents, 1500);
    assert.equal(cart.items.length, 2);
  });

  test("the bundle absorbs individual items so nothing is paid for twice", async () => {
    const user = await newUser();
    await store.addToCart(user, "ember-table");
    await store.addToCart(user, "helix-ai");
    await store.addToCart(user, BUNDLE.slug);

    const cart = await store.getCart(user);
    assert.equal(cart.items.length, 1);
    assert.equal(cart.items[0].slug, BUNDLE.slug);
    assert.equal(cart.subtotalCents, BUNDLE.priceCents);
  });

  test("an unknown slug cannot enter the cart", async () => {
    const user = await newUser();
    await assert.rejects(() => store.addToCart(user, "../secrets"));
  });
});

describe("fulfilment", () => {
  test("buying one template grants exactly that template", async () => {
    const user = await newUser();
    await store.addToCart(user, "quill-journal");
    const order = await store.createOrder(user, "test");
    await store.fulfillOrder(order.id);

    assert.ok(await store.owns(user, "quill-journal"));
    assert.ok(!(await store.owns(user, "ember-table")));
  });

  test("buying the bundle grants every template", async () => {
    const user = await newUser();
    await store.addToCart(user, BUNDLE.slug);
    const order = await store.createOrder(user, "test");
    await store.fulfillOrder(order.id);

    const owned = await store.ownedSlugs(user);
    assert.equal(owned.size, TEMPLATES.length);
    for (const t of TEMPLATES) assert.ok(owned.has(t.slug), `missing ${t.slug}`);
  });

  test("checkout empties the cart", async () => {
    const user = await newUser();
    await store.addToCart(user, "pulse-fitness");
    const order = await store.createOrder(user, "test");
    await store.fulfillOrder(order.id);

    assert.equal((await store.getCart(user)).items.length, 0);
  });

  test("a replayed webhook does not grant twice or corrupt the order", async () => {
    const user = await newUser();
    await store.addToCart(user, "sable-studio");
    const order = await store.createOrder(user, "test");

    const first = await store.fulfillOrder(order.id);
    const second = await store.fulfillOrder(order.id);

    assert.equal(first.alreadyPaid, false);
    assert.equal(second.alreadyPaid, true);
    assert.equal((await store.ownedSlugs(user)).size, 1);
  });

  test("an empty cart cannot become an order", async () => {
    const user = await newUser();
    await assert.rejects(() => store.createOrder(user, "test"));
  });

  test("items already owned are dropped from a new cart", async () => {
    const user = await newUser();
    await store.addToCart(user, "atelier-lookbook");
    const order = await store.createOrder(user, "test");
    await store.fulfillOrder(order.id);

    await store.addToCart(user, "atelier-lookbook");
    const cart = await store.getCart(user);
    assert.equal(cart.items.length, 0);
    assert.equal(cart.removedOwned, 1);
  });

  test("paid orders show up in history with the right total", async () => {
    const user = await newUser();
    await store.addToCart(user, "monolith-portfolio"); // $5
    const order = await store.createOrder(user, "test");
    await store.fulfillOrder(order.id);

    const orders = await store.ordersFor(user);
    assert.equal(orders.length, 1);
    assert.equal(orders[0].totalCents, 500);
  });
});

test("cleanup", async () => {
  await rm(dir, { recursive: true, force: true });
});
