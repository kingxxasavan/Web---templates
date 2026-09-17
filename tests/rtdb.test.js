import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createFakeDatabase } from "./helpers/fake-rtdb.js";

/**
 * The Realtime Database backend, run through the same behaviours as the SQL
 * one. The emulator can't start in this environment, so these exercise the
 * backend's own logic against a faithful double — paths, key encoding,
 * ordering and atomic grouping — rather than the Firebase SDK itself.
 */

const fake = createFakeDatabase();

const { setDatabase, encodeKey, decodeKey } = await import(
  "../lib/backends/rtdb/client.js"
);
setDatabase(fake);

const { forceBackend } = await import("../lib/backend.js");
forceBackend("rtdb");

const store = await import("../lib/store.js");
const accounts = await import("../lib/accounts.js");
const reviews = await import("../lib/reviews.js");
const metrics = await import("../lib/metrics.js");
const { verifyPassword } = await import("../lib/password.js");
const { BUNDLE, TEMPLATES } = await import("../lib/catalog.js");
const backendMod = await import("../lib/backend.js");

beforeEach(() => fake._reset());

let n = 0;
const newUser = () =>
  accounts.createUser(`user-${++n}@example.com`, "initial-password");

async function buy(userId, slug) {
  await store.addToCart(userId, slug);
  const order = await store.createOrder(userId, "test");
  await store.fulfillOrder(order.id);
  return order;
}

describe("rtdb: keys", () => {
  test("an email survives a round trip through an RTDB-safe key", () => {
    for (const email of [
      "a.b@example.com",
      "user+tag@example.co.uk",
      "WEIRD$key#stuff[]@x.io",
    ]) {
      assert.equal(decodeKey(encodeKey(email)), email);
      assert.ok(
        !/[.#$[\]/]/.test(encodeKey(email)),
        `${email} produced an illegal RTDB key`
      );
    }
  });
});

describe("rtdb: accounts", () => {
  test("a user can be created and found by email", async () => {
    const user = await accounts.createUser("someone@example.com", "a-password-x");
    const found = await accounts.findUserByEmail("someone@example.com");
    assert.equal(found.id, user.id);
    assert.ok(await verifyPassword("a-password-x", found.password));
  });

  test("an unknown email returns null rather than throwing", async () => {
    assert.equal(await accounts.findUserByEmail("nobody@example.com"), null);
  });

  test("a reset changes the password and burns the token", async () => {
    const user = await newUser();
    const token = await accounts.createPasswordReset(user.id);

    assert.equal(await accounts.checkPasswordReset(token), user.id);
    assert.equal(await accounts.resetPassword(token, "brand-new-password"), user.id);
    assert.equal(await accounts.resetPassword(token, "again-please-nope"), null);

    const found = await accounts.findUserByEmail(user.email);
    assert.ok(await verifyPassword("brand-new-password", found.password));
  });

  test("a new reset request invalidates the previous link", async () => {
    const user = await newUser();
    const first = await accounts.createPasswordReset(user.id);
    const second = await accounts.createPasswordReset(user.id);
    assert.equal(await accounts.checkPasswordReset(first), null);
    assert.equal(await accounts.checkPasswordReset(second), user.id);
  });
});

describe("rtdb: cart", () => {
  test("totals come from the catalogue", async () => {
    const user = await newUser();
    await store.addToCart(user.id, "vertex-launch"); // $5
    await store.addToCart(user.id, "helix-ai"); // $10
    const cart = await store.getCart(user.id);
    assert.equal(cart.subtotalCents, 1500);
  });

  test("items come back in the order they were added", async () => {
    const user = await newUser();
    await store.addToCart(user.id, "ember-table");
    await new Promise((r) => setTimeout(r, 2));
    await store.addToCart(user.id, "quill-journal");
    const cart = await store.getCart(user.id);
    assert.deepEqual(
      cart.items.map((i) => i.slug),
      ["ember-table", "quill-journal"]
    );
  });

  test("the bundle absorbs individual items", async () => {
    const user = await newUser();
    await store.addToCart(user.id, "ember-table");
    await store.addToCart(user.id, BUNDLE.slug);
    const cart = await store.getCart(user.id);
    assert.equal(cart.items.length, 1);
    assert.equal(cart.subtotalCents, BUNDLE.priceCents);
  });

  test("removing an item leaves the rest", async () => {
    const user = await newUser();
    await store.addToCart(user.id, "ember-table");
    await store.addToCart(user.id, "helix-ai");
    await store.removeFromCart(user.id, "ember-table");
    const cart = await store.getCart(user.id);
    assert.deepEqual(cart.items.map((i) => i.slug), ["helix-ai"]);
  });

  test("a guest cart merges into the account", async () => {
    const user = await newUser();
    await store.mergeGuestCart(user.id, ["helix-ai", "quill-journal"]);
    assert.equal((await store.getCart(user.id)).items.length, 2);
  });
});

describe("rtdb: orders and entitlements", () => {
  test("buying one template grants exactly that template", async () => {
    const user = await newUser();
    await buy(user.id, "quill-journal");
    assert.ok(await store.owns(user.id, "quill-journal"));
    assert.ok(!(await store.owns(user.id, "ember-table")));
  });

  test("buying the bundle grants every template", async () => {
    const user = await newUser();
    await buy(user.id, BUNDLE.slug);
    const owned = await store.ownedSlugs(user.id);
    assert.equal(owned.size, TEMPLATES.length);
  });

  test("checkout empties the cart", async () => {
    const user = await newUser();
    await buy(user.id, "pulse-fitness");
    assert.equal((await store.getCart(user.id)).items.length, 0);
  });

  test("a replayed webhook does not grant twice", async () => {
    const user = await newUser();
    await store.addToCart(user.id, "sable-studio");
    const order = await store.createOrder(user.id, "test");

    const first = await store.fulfillOrder(order.id);
    const second = await store.fulfillOrder(order.id);
    assert.equal(first.alreadyPaid, false);
    assert.equal(second.alreadyPaid, true);
    assert.equal((await store.ownedSlugs(user.id)).size, 1);
  });

  test("an empty cart cannot become an order", async () => {
    const user = await newUser();
    await assert.rejects(() => store.createOrder(user.id, "test"));
  });

  test("owned items are dropped from a later cart", async () => {
    const user = await newUser();
    await buy(user.id, "atelier-lookbook");
    await store.addToCart(user.id, "atelier-lookbook");
    const cart = await store.getCart(user.id);
    assert.equal(cart.items.length, 0);
    assert.equal(cart.removedOwned, 1);
  });

  test("order history reports the right total, newest first", async () => {
    const user = await newUser();
    await buy(user.id, "monolith-portfolio"); // $5
    await new Promise((r) => setTimeout(r, 2));
    await buy(user.id, "helix-ai"); // $10

    const orders = await store.ordersFor(user.id);
    assert.equal(orders.length, 2);
    assert.equal(orders[0].totalCents, 1000);
    assert.equal(orders[1].totalCents, 500);
  });

  test("one user's orders never leak into another's", async () => {
    const a = await newUser();
    const b = await newUser();
    await buy(a.id, "helix-ai");
    assert.equal((await store.ordersFor(b.id)).length, 0);
    assert.equal((await store.ownedSlugs(b.id)).size, 0);
  });
});

describe("rtdb: reviews", () => {
  test("only buyers can review", async () => {
    const user = await newUser();
    assert.equal(await reviews.canReview(user.id, "ember-table"), false);
    await buy(user.id, "ember-table");
    assert.equal(await reviews.canReview(user.id, "ember-table"), true);
  });

  test("a second review replaces the first", async () => {
    const user = await newUser();
    await buy(user.id, "ember-table");
    for (const rating of [2, 5]) {
      await reviews.upsertReview(user.id, "ember-table", {
        rating,
        body: "Revised after actually shipping the thing.",
      });
    }
    const list = await reviews.reviewsFor("ember-table");
    assert.equal(list.length, 1);
    assert.equal(list[0].rating, 5);
  });

  test("the author's email is masked", async () => {
    const user = await accounts.createUser("private.person@example.com", "pw-goes-here");
    await buy(user.id, "sable-studio");
    await reviews.upsertReview(user.id, "sable-studio", {
      rating: 5,
      body: "Exactly the structure I needed for a consultancy site.",
    });
    const [r] = await reviews.reviewsFor("sable-studio");
    assert.ok(!r.author.includes("private.person"));
    assert.ok(r.author.includes("@example.com"));
  });

  test("averages are reported per template", async () => {
    const a = await newUser();
    const b = await newUser();
    await buy(a.id, "helix-ai");
    await buy(b.id, "helix-ai");
    await reviews.upsertReview(a.id, "helix-ai", { rating: 4, body: "x".repeat(40) });
    await reviews.upsertReview(b.id, "helix-ai", { rating: 2, body: "y".repeat(40) });

    const one = await reviews.ratingFor("helix-ai");
    assert.equal(one.count, 2);
    assert.equal(one.average, 3);
    assert.equal((await reviews.ratingSummary()).get("helix-ai").count, 2);
  });
});

describe("rtdb: metrics", () => {
  test("revenue and conversion are computed from paid orders", async () => {
    const a = await newUser();
    const b = await newUser();
    await newUser(); // signed up, never bought
    await buy(a.id, "helix-ai"); // $10
    await buy(b.id, "vertex-launch"); // $5

    const overview = await metrics.salesOverview(30);
    assert.equal(overview.revenueCents, 1500);
    assert.equal(overview.orders, 2);
    assert.equal(overview.payingCustomers, 2);
    assert.equal(overview.signups, 3);
    assert.equal(overview.averageOrderCents, 750);
  });

  test("best sellers rank by revenue", async () => {
    const a = await newUser();
    const b = await newUser();
    await buy(a.id, BUNDLE.slug); // $35
    await buy(b.id, "vertex-launch"); // $5

    const top = await metrics.topTemplates();
    assert.equal(top[0].slug, BUNDLE.slug);
    assert.equal(top[0].revenueCents, 3500);
  });

  test("recent orders carry the buyer's email", async () => {
    const user = await accounts.createUser("buyer@example.com", "a-password-xyz");
    await buy(user.id, "helix-ai");
    const recent = await metrics.recentOrders(5);
    assert.equal(recent[0].email, "buyer@example.com");
  });
});

describe("rtdb: selection", () => {
  test("the backend is the one under test", () => {
    assert.equal(backendMod.backendName(), "rtdb");
  });
});
