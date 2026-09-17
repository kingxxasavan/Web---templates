/**
 * Turns a data-layer exception into something a user and an operator can both
 * act on. A write that fails because nothing is configured is by far the most
 * likely cause in a fresh deployment, and "Something went wrong" sends whoever
 * is debugging it looking in the wrong place.
 */

export const NOT_CONFIGURED =
  "The store's database isn't set up yet, so accounts can't be created. " +
  "If you run this site: set DATABASE_URL and DATABASE_AUTH_TOKEN in your " +
  "hosting environment (see the README).";

export const UNREACHABLE =
  "We couldn't reach the database just now. Please try again in a moment.";

/** True when the app is running on its development-only local file. */
export function usingLocalFile() {
  return !process.env.DATABASE_URL;
}

export function describeDbError(err) {
  const msg = String(err?.message ?? err);

  // A read-only or missing filesystem is what a serverless host gives you when
  // DATABASE_URL was never set and the file: fallback is in play.
  const readOnly =
    /EROFS|read-only|SQLITE_CANTOPEN|ENOENT|unable to open database/i.test(msg);

  if (usingLocalFile() && readOnly) {
    return { status: 503, message: NOT_CONFIGURED, reason: "not_configured" };
  }
  if (usingLocalFile()) {
    return { status: 503, message: NOT_CONFIGURED, reason: "not_configured" };
  }
  if (/ENOTFOUND|ECONNREFUSED|fetch failed|ETIMEDOUT|EAI_AGAIN/i.test(msg)) {
    return { status: 503, message: UNREACHABLE, reason: "unreachable" };
  }
  if (/UNAUTHORIZED|401|403|auth/i.test(msg)) {
    return {
      status: 503,
      message:
        "The database rejected our credentials. Check DATABASE_AUTH_TOKEN.",
      reason: "unauthorized",
    };
  }
  return {
    status: 500,
    message: "Something went wrong on our end. Please try again.",
    reason: "unknown",
  };
}

/**
 * Wraps a write route. Logs the real error server-side — where an operator can
 * read it — and returns a message the visitor can do something with.
 */
export async function guardWrite(fn, json) {
  try {
    return await fn();
  } catch (err) {
    const { status, message, reason } = describeDbError(err);
    console.error(`[db:${reason}]`, err?.message ?? err);
    return json({ error: message, reason }, { status });
  }
}
