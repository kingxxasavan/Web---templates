import { test } from "node:test";
import assert from "node:assert/strict";
import { firebaseAuth, firebaseUser, authError } from "../lib/firebase.js";

test("Firebase requests and session refresh fail closed", async (t) => {
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    requests.push({ url, options });
    if (url.includes("securetoken")) return Response.json({ id_token: "verified-token" });
    return Response.json({ users: [{ localId: "firebase-uid", email: "buyer@example.com" }] });
  });
  assert.equal((await firebaseUser("refresh-secret")).localId, "firebase-uid");
  assert.equal(new URLSearchParams(requests[0].options.body).get("refresh_token"), "refresh-secret");
  assert.deepEqual(JSON.parse(requests[1].options.body), { idToken: "verified-token" });
  assert.equal(requests[0].options.cache, "no-store");
  t.mock.method(globalThis, "fetch", async () => Response.json({ error: { message: "INVALID_LOGIN_CREDENTIALS" } }, { status: 400 }));
  assert.equal(await firebaseUser("revoked-token"), null);
  await assert.rejects(() => firebaseAuth("signInWithPassword", {}), { code: "INVALID_LOGIN_CREDENTIALS" });
  assert.equal(authError({ code: "INVALID_LOGIN_CREDENTIALS" }), authError({ code: "EMAIL_NOT_FOUND" }));
});
