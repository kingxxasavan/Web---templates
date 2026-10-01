import { test } from "node:test";
import assert from "node:assert/strict";
import { withReadTimeout } from "../lib/read-timeout.js";

test("a stalled database read stops waiting with a connection error", async () => {
  await assert.rejects(() => withReadTimeout(() => new Promise(() => {}), 10, "Firebase database"),
    {code: "ETIMEDOUT", message: "Firebase database read timed out. Please check the connection and credentials."});
});
test("timely reads preserve their result and errors", async () => {
  assert.equal(await withReadTimeout(() => 42), 42);
  const error = new Error("Permission denied");
  await assert.rejects(() => withReadTimeout(() => { throw error; }), (actual) => actual === error);
});

test("optional storefront reads return their fallback when Firebase stalls", async (t) => {
  const {readOrFallback} = await import("../lib/db.js");
  t.mock.method(console, "warn", () => {});
  const fallback = new Map();
  assert.equal(await readOrFallback(() => new Promise(() => {}), fallback, 10), fallback);
});
