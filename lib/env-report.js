/**
 * Reports which configuration variables the running process can actually see.
 *
 * Names and booleans only — never a value, never a fragment of a key — so this
 * is safe to expose and safe to paste into a bug report. "Set both of these"
 * is useless advice when you have set one of them; this says which.
 */

const present = (name) => Boolean(process.env[name]?.trim());

/** Checks the service account parses and carries the fields Firebase needs. */
function inspectServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw?.trim()) return { set: false };

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      set: true,
      validJson: false,
      problem:
        "Set, but not valid JSON. Paste the whole key file as one value, " +
        "braces included.",
    };
  }

  const missing = ["project_id", "client_email", "private_key"].filter(
    (k) => !parsed[k]
  );
  if (missing.length) {
    return {
      set: true,
      validJson: true,
      problem: `Parsed, but missing: ${missing.join(", ")}.`,
    };
  }

  const looksLikeKey =
    typeof parsed.private_key === "string" &&
    parsed.private_key.includes("BEGIN PRIVATE KEY");

  return {
    set: true,
    validJson: true,
    privateKeyLooksValid: looksLikeKey,
    // Safe to echo: a project id is public, and it catches the "service
    // account from the wrong project" mistake.
    projectId: parsed.project_id,
    problem: looksLikeKey
      ? null
      : "private_key doesn't look like a PEM key — the \\n escapes may have " +
        "been stripped when it was pasted.",
  };
}

export function envReport() {
  const account = inspectServiceAccount();

  const databaseUrl =
    present("FIREBASE_DATABASE_URL") || present("NEXT_PUBLIC_FIREBASE_DATABASE_URL");

  const firebaseReady = Boolean(
    account.set && !account.problem && databaseUrl
  );

  const missing = [];
  if (!account.set) missing.push("FIREBASE_SERVICE_ACCOUNT");
  if (!databaseUrl) missing.push("FIREBASE_DATABASE_URL");

  const webProject = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const projectMismatch =
    account.projectId && webProject && account.projectId !== webProject;

  return {
    firebase: {
      ready: firebaseReady,
      serviceAccount: account,
      databaseUrl: {
        set: databaseUrl,
        from: present("FIREBASE_DATABASE_URL")
          ? "FIREBASE_DATABASE_URL"
          : present("NEXT_PUBLIC_FIREBASE_DATABASE_URL")
            ? "NEXT_PUBLIC_FIREBASE_DATABASE_URL"
            : null,
      },
      missing,
      projectMismatch: projectMismatch
        ? `Service account is for "${account.projectId}" but ` +
          `NEXT_PUBLIC_FIREBASE_PROJECT_ID is "${webProject}".`
        : null,
    },
    libsql: {
      ready: present("DATABASE_URL"),
      DATABASE_URL: present("DATABASE_URL"),
      DATABASE_AUTH_TOKEN: present("DATABASE_AUTH_TOKEN"),
    },
    note:
      "NEXT_PUBLIC_FIREBASE_* variables configure Analytics only. The " +
      "database needs FIREBASE_SERVICE_ACCOUNT plus a database URL, or " +
      "DATABASE_URL for libSQL.",
  };
}
