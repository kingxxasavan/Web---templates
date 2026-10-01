import {test} from "node:test";
import assert from "node:assert/strict";
import {describeAuthRequestError} from "../lib/auth-errors.js";

test("a coded SQLite error shows the missing database configuration", (t) => {
  const savedUrl = process.env.DATABASE_URL;
  const savedAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  process.env.DATABASE_URL = "";
  process.env.FIREBASE_SERVICE_ACCOUNT = "";
  t.after(() => {
    if (savedUrl === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = savedUrl;
    if (savedAccount === undefined) delete process.env.FIREBASE_SERVICE_ACCOUNT; else process.env.FIREBASE_SERVICE_ACCOUNT = savedAccount;
  });
  const result = describeAuthRequestError({code: "SQLITE_CANTOPEN", message: "unable to open database file"});
  assert.equal(result.status, 503);
  assert.equal(result.reason, "not_configured");
  assert.match(result.error, /FIREBASE_SERVICE_ACCOUNT/);
});

test("Firebase authentication errors remain separate from storage failures", () => {
  assert.deepEqual(describeAuthRequestError({provider: "firebase-auth", code: "EMAIL_EXISTS"}), {
    status: 400, error: "An account with that email already exists. Sign in instead.", reason: "firebase_auth",
  });
  assert.deepEqual(describeAuthRequestError({publicMessage: "Verify your email first."}), {
    status: 409, error: "Verify your email first.",
  });
});
