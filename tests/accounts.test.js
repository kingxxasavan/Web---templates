import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const dir = await mkdtemp(path.join(tmpdir(), "foundry-accounts-"));
process.env.DATABASE_URL = `file:${path.join(dir, "test.db")}`;

const accounts = await import("../lib/accounts.js");
const reviews = await import("../lib/reviews.js");
const store = await import("../lib/store.js");
const admin = await import("../lib/admin.js");
const { verifyPassword } = await import("../lib/password.js");
const { queryOne, run } = await import("../lib/db.js");

let n = 0;
const newUser = () =>
  accounts.createUser(`user-${++n}@example.com`, "initial-password");

async function buy(userId, slug) {
  await store.addToCart(userId, slug);
  const order = await store.createOrder(userId, "test");
  await store.fulfillOrder(order.id);
  return order;
}

describe("password reset", () => {
  test("a fresh token resets the password and burns itself", async () => {
    const user = await newUser();
    const token = await accounts.createPasswordReset(user.id);

    assert.equal(await accounts.checkPasswordReset(token), user.id);
    assert.equal(await accounts.resetPassword(token, "brand-new-password"), user.id);

    const row = await queryOne(`SELECT password FROM users WHERE id = ?`, [user.id]);
    assert.ok(await verifyPassword("brand-new-password", row.password));
    assert.ok(!(await verifyPassword("initial-password", row.password)));
  });

  test("a token cannot be used twice", async () => {
    const user = await newUser();
    const token = await accounts.createPasswordReset(user.id);

    assert.ok(await accounts.resetPassword(token, "first-new-password"));
    assert.equal(await accounts.resetPassword(token, "second-attempt-pw"), null);
  });

  test("an expired token is refused", async () => {
    const user = await newUser();
    const token = await accounts.createPasswordReset(user.id);
    await run(`UPDATE password_resets SET expires_at = ? WHERE user_id = ?`, [
      Date.now() - 1000,
      user.id,
    ]);

    assert.equal(await accounts.checkPasswordReset(token), null);
    assert.equal(await accounts.resetPassword(token, "too-late-password"), null);
  });

  test("requesting a new token invalidates the previous one", async () => {
    const user = await newUser();
    const first = await accounts.createPasswordReset(user.id);
    const second = await accounts.createPasswordReset(user.id);

    assert.equal(await accounts.checkPasswordReset(first), null);
    assert.equal(await accounts.checkPasswordReset(second), user.id);
  });

  test("a reset ends every existing session", async () => {
    const user = await newUser();
    await run(
      `INSERT INTO sessions (token_hash, user_id, created_at, expires_at)
       VALUES ('stale-session', ?, ?, ?)`,
      [user.id, Date.now(), Date.now() + 86_400_000]
    );

    const token = await accounts.createPasswordReset(user.id);
    await accounts.resetPassword(token, "rotated-password-x");

    const left = await queryOne(
      `SELECT COUNT(*) AS n FROM sessions WHERE user_id = ?`,
      [user.id]
    );
    assert.equal(Number(left.n), 0, "sessions survived a password reset");
  });

  test("garbage tokens are refused without throwing", async () => {
    assert.equal(await accounts.checkPasswordReset("nonsense"), null);
    assert.equal(await accounts.checkPasswordReset(""), null);
    assert.equal(await accounts.checkPasswordReset(null), null);
  });
});

describe("reviews", () => {
  test("a non-buyer cannot review", async () => {
    const user = await newUser();
    assert.equal(await reviews.canReview(user.id, "quill-journal"), false);
    await assert.rejects(
      () => reviews.upsertReview(user.id, "quill-journal", { rating: 5, body: "x".repeat(40) }),
      /Only buyers/
    );
  });

  test("a buyer can review, and it counts as verified", async () => {
    const user = await newUser();
    await buy(user.id, "quill-journal");

    assert.equal(await reviews.canReview(user.id, "quill-journal"), true);
    await reviews.upsertReview(user.id, "quill-journal", {
      rating: 4,
      title: "Solid",
      body: "Clean markup and it took about an hour to rewrite the copy.",
    });

    const list = await reviews.reviewsFor("quill-journal");
    assert.equal(list.length, 1);
    assert.equal(list[0].rating, 4);
  });

  test("a second review replaces the first rather than stacking", async () => {
    const user = await newUser();
    await buy(user.id, "ember-table");

    for (const rating of [2, 5]) {
      await reviews.upsertReview(user.id, "ember-table", {
        rating,
        body: "Revised opinion after actually shipping the thing.",
      });
    }

    const list = await reviews.reviewsFor("ember-table");
    assert.equal(list.length, 1);
    assert.equal(list[0].rating, 5);
  });

  test("bundle buyers can review every template", async () => {
    const user = await newUser();
    await buy(user.id, "everything");
    assert.equal(await reviews.canReview(user.id, "helix-ai"), true);
    assert.equal(await reviews.canReview(user.id, "pulse-fitness"), true);
  });

  test("ratings outside 1-5 and thin bodies are rejected", async () => {
    assert.ok(reviews.validateReview({ rating: 0, body: "x".repeat(40) }));
    assert.ok(reviews.validateReview({ rating: 6, body: "x".repeat(40) }));
    assert.ok(reviews.validateReview({ rating: 2.5, body: "x".repeat(40) }));
    assert.ok(reviews.validateReview({ rating: 5, body: "too short" }));
    assert.ok(reviews.validateReview({ rating: 5, body: "x".repeat(2000) }));
    assert.equal(reviews.validateReview({ rating: 5, body: "x".repeat(40) }), null);
  });

  test("the author's email is masked", async () => {
    const user = await accounts.createUser("someone.private@example.com", "password-here");
    await buy(user.id, "sable-studio");
    await reviews.upsertReview(user.id, "sable-studio", {
      rating: 5,
      body: "Exactly the structure I needed for a small consultancy site.",
    });

    const [review] = await reviews.reviewsFor("sable-studio");
    assert.ok(!review.author.includes("someone.private"));
    assert.ok(review.author.includes("@example.com"));
  });

  test("averages are reported per template", async () => {
    const summary = await reviews.ratingSummary();
    assert.ok(summary.get("ember-table").count >= 1);
    const one = await reviews.ratingFor("ember-table");
    assert.ok(one.average >= 1 && one.average <= 5);
  });
});

describe("admin allowlist", () => {
  test("nobody is an admin when the list is empty", () => {
    delete process.env.ADMIN_EMAILS;
    assert.equal(admin.isAdmin({ email: "anyone@example.com" }), false);
  });

  test("only listed addresses qualify, case-insensitively", () => {
    process.env.ADMIN_EMAILS = "Owner@Example.com, second@example.com";
    assert.equal(admin.isAdmin({ email: "owner@example.com" }), true);
    assert.equal(admin.isAdmin({ email: "SECOND@example.com" }), true);
    assert.equal(admin.isAdmin({ email: "intruder@example.com" }), false);
    assert.equal(admin.isAdmin(null), false);
    assert.equal(admin.isAdmin({}), false);
  });
});

test("cleanup", async () => {
  await rm(dir, { recursive: true, force: true });
});
