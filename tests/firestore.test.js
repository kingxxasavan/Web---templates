/**
 * Runs the store against the Firestore emulator:
 *   npm run test:emulator
 * Skipped when no emulator is running, so `npm test` needs nothing installed.
 */
import { test, describe, before } from "node:test";
import assert from "node:assert/strict";

const emulator = process.env.FIRESTORE_EMULATOR_HOST;

describe("store on Firestore", { skip: !emulator && "FIRESTORE_EMULATOR_HOST not set" }, () => {
  let store, reviews, inbox, catalog, db;
  let n = 0;
  const newUser = () => {
    const id = `user${Date.now()}x${++n}`;
    return { id, email: `${id}@example.com` };
  };

  before(async () => {
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||= "127.0.0.1:9099";
    store = await import("../lib/store.js");
    reviews = await import("../lib/reviews.js");
    inbox = await import("../lib/inbox.js");
    catalog = await import("../lib/catalog.js");
    ({ db } = await import("../lib/firebase-admin.js"));
  });

  async function buy(user, slugs) {
    const order = await store.createOrder(user, slugs, "test");
    await store.fulfillOrder(order.id, "test-ref");
    return order;
  }

  test("buying a template puts it in the library", async () => {
    const user = newUser();
    const slug = catalog.TEMPLATES[0].slug;
    await buy(user, [slug]);
    assert.ok(await store.owns(user.id, slug));
    assert.ok(!(await store.owns(user.id, catalog.TEMPLATES[1].slug)));
    const orders = await store.ordersFor(user.id);
    assert.equal(orders.length, 1);
    assert.equal(orders[0].status, "paid");
  });

  test("an empty or fully-owned cart cannot become an order", async () => {
    const user = newUser();
    await assert.rejects(store.createOrder(user, [], "test"), /empty/);
    const slug = catalog.TEMPLATES[0].slug;
    await buy(user, [slug]);
    await assert.rejects(store.createOrder(user, [slug], "test"), /empty/);
  });

  test("fulfilment is idempotent", async () => {
    const user = newUser();
    const order = await store.createOrder(user, [catalog.TEMPLATES[2].slug], "test");
    const first = await store.fulfillOrder(order.id);
    const second = await store.fulfillOrder(order.id);
    assert.equal(first.alreadyPaid, false);
    assert.equal(second.alreadyPaid, true);
  });

  test("pending orders grant nothing", async () => {
    const user = newUser();
    const slug = catalog.TEMPLATES[3].slug;
    await store.createOrder(user, [slug], "test");
    assert.ok(!(await store.owns(user.id, slug)));
    assert.equal((await store.ordersFor(user.id)).length, 0);
  });

  test("the bundle is priced with credit and grants all-access", async () => {
    const user = newUser();
    const pro = catalog.TEMPLATES.find((t) => t.tier === "pro");
    await buy(user, [pro.slug]);
    const order = await store.createOrder(user, [catalog.BUNDLE.slug], "test");
    assert.equal(order.totalCents, catalog.BUNDLE.priceCents - catalog.priceOf(pro));
    await store.fulfillOrder(order.id);
    assert.ok(await store.owns(user.id, catalog.BUNDLE.slug));
    const profile = await db().collection("users").doc(user.id).get();
    assert.equal(profile.get("allAccess"), true);
  });

  test("only owners can review, once each", async () => {
    const buyer = newUser();
    const stranger = newUser();
    const slug = catalog.TEMPLATES[4].slug;
    await buy(buyer, [slug]);

    const review = { rating: 4, title: "Solid", body: "Clean markup, easy to restyle for a client." };
    await assert.rejects(reviews.upsertReview(stranger, slug, review), /Only buyers/);
    await reviews.upsertReview(buyer, slug, review);
    await reviews.upsertReview(buyer, slug, { ...review, rating: 5 });

    const mine = await reviews.myReview(buyer.id, slug);
    assert.equal(mine.rating, 5);
    const snap = await db().collection("reviews").where("userId", "==", buyer.id).get();
    assert.equal(snap.size, 1, "one review per buyer per template");
    assert.ok(!JSON.stringify(await reviews.reviewsFor(slug)).includes(buyer.email));
  });

  test("messages and subscribers are stored", async () => {
    await inbox.saveMessage({ name: "Sam", email: "Sam@Example.com", kind: "request", message: "A dog groomer site." });
    await inbox.subscribe("fan@example.com");
    await inbox.subscribe("FAN@example.com "); // same person, no duplicate
    const recent = await inbox.recentMessages(5);
    assert.ok(recent.some((m) => m.email === "sam@example.com"));
    const subs = await db().collection("subscribers").where("email", "==", "fan@example.com").get();
    assert.equal(subs.size, 1);
  });
});
