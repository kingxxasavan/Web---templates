import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createClient } from "@libsql/client";
import { TEMPLATES, TIERS, BUNDLE } from "./catalog.js";

/**
 * libSQL speaks to a local file in development and to a hosted Turso database
 * in production through the same client, so nothing about the data layer
 * changes between the two. Vercel's filesystem is ephemeral and read-only at
 * runtime, so a deployed instance must point DATABASE_URL at a hosted
 * database — see the README.
 */
const url = process.env.DATABASE_URL || "file:./data/store.db";

let client;
let ready;

function connect() {
  if (!client) {
    // A file: URL needs its directory to exist before libsql will open it.
    if (url.startsWith("file:")) {
      mkdirSync(dirname(url.slice("file:".length)), { recursive: true });
    }
    client = createClient({
      url,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
  }
  return client;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
     id          TEXT PRIMARY KEY,
     email       TEXT NOT NULL UNIQUE,
     password    TEXT NOT NULL,
     created_at  INTEGER NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS sessions (
     token_hash  TEXT PRIMARY KEY,
     user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     created_at  INTEGER NOT NULL,
     expires_at  INTEGER NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id)`,
  `CREATE TABLE IF NOT EXISTS products (
     slug        TEXT PRIMARY KEY,
     name        TEXT NOT NULL,
     price_cents INTEGER NOT NULL,
     is_bundle   INTEGER NOT NULL DEFAULT 0
   )`,
  `CREATE TABLE IF NOT EXISTS cart_items (
     user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     slug        TEXT NOT NULL,
     added_at    INTEGER NOT NULL,
     PRIMARY KEY (user_id, slug)
   )`,
  `CREATE TABLE IF NOT EXISTS orders (
     id           TEXT PRIMARY KEY,
     user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     total_cents  INTEGER NOT NULL,
     status       TEXT NOT NULL,
     provider     TEXT NOT NULL,
     provider_ref TEXT,
     created_at   INTEGER NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS orders_user ON orders(user_id, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS order_items (
     order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
     slug        TEXT NOT NULL,
     price_cents INTEGER NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS order_items_order ON order_items(order_id)`,
  // What a user is actually allowed to download. Writing one row per template
  // (a bundle fans out to every slug) keeps the download check a single
  // indexed lookup instead of a join through orders.
  `CREATE TABLE IF NOT EXISTS entitlements (
     user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     slug       TEXT NOT NULL,
     order_id   TEXT NOT NULL,
     created_at INTEGER NOT NULL,
     PRIMARY KEY (user_id, slug)
   )`,
  `CREATE TABLE IF NOT EXISTS password_resets (
     token_hash TEXT PRIMARY KEY,
     user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     created_at INTEGER NOT NULL,
     expires_at INTEGER NOT NULL,
     used_at    INTEGER
   )`,
  `CREATE INDEX IF NOT EXISTS resets_user ON password_resets(user_id)`,
  // Every message the app sends is recorded here. With no mail provider
  // configured this table *is* the outbox, which keeps the flow testable.
  `CREATE TABLE IF NOT EXISTS emails (
     id         TEXT PRIMARY KEY,
     to_email   TEXT NOT NULL,
     subject    TEXT NOT NULL,
     body       TEXT NOT NULL,
     kind       TEXT NOT NULL,
     provider   TEXT NOT NULL,
     status     TEXT NOT NULL,
     error      TEXT,
     created_at INTEGER NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS emails_created ON emails(created_at DESC)`,
  // Reviews are restricted to buyers at write time; the entitlement check
  // lives in lib/reviews.js, and the unique key stops repeat posting.
  `CREATE TABLE IF NOT EXISTS reviews (
     id         TEXT PRIMARY KEY,
     user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     slug       TEXT NOT NULL,
     rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
     title      TEXT,
     body       TEXT NOT NULL,
     created_at INTEGER NOT NULL,
     UNIQUE (user_id, slug)
   )`,
  `CREATE INDEX IF NOT EXISTS reviews_slug ON reviews(slug, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS login_attempts (
     key        TEXT PRIMARY KEY,
     count      INTEGER NOT NULL,
     first_at   INTEGER NOT NULL
   )`,
];

async function migrate(db) {
  for (const stmt of SCHEMA) await db.execute(stmt);

  const rows = [
    ...TEMPLATES.map((t) => ({
      slug: t.slug,
      name: t.name,
      price: TIERS[t.tier].priceCents,
      bundle: 0,
    })),
    {
      slug: BUNDLE.slug,
      name: BUNDLE.name,
      price: BUNDLE.priceCents,
      bundle: 1,
    },
  ];

  // Prices live in the catalogue, so re-sync them on every boot rather than
  // letting the table drift.
  await db.batch(
    rows.map((r) => ({
      sql: `INSERT INTO products (slug, name, price_cents, is_bundle)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(slug) DO UPDATE SET
              name = excluded.name,
              price_cents = excluded.price_cents,
              is_bundle = excluded.is_bundle`,
      args: [r.slug, r.name, r.price, r.bundle],
    })),
    "write"
  );
}

/** Returns a migrated client. The migration runs at most once per process. */
export async function getDb() {
  const db = connect();
  if (!ready) {
    ready = migrate(db).catch((err) => {
      ready = undefined; // let the next request retry rather than wedging
      throw err;
    });
  }
  await ready;
  return db;
}

export async function queryAll(sql, args = []) {
  const db = await getDb();
  const res = await db.execute({ sql, args });
  return res.rows;
}

export async function queryOne(sql, args = []) {
  const rows = await queryAll(sql, args);
  return rows[0] ?? null;
}

export async function run(sql, args = []) {
  const db = await getDb();
  return db.execute({ sql, args });
}
