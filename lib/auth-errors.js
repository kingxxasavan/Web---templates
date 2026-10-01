import { authError } from "./firebase.js";
import { describeDbError } from "./db-errors.js";

// Database SDKs also use error.code. Only errors from Firebase Auth's HTTP
// response belong to the Firebase Auth mapper.
export function describeAuthRequestError(error) {
  if (error.publicMessage) return { status: 409, error: error.publicMessage };
  if (error.provider === "firebase-auth")
    return { status: 400, error: authError(error), reason: "firebase_auth" };
  const { status, message, reason } = describeDbError(error);
  return { status, error: message, reason };
}
