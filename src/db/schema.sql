PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS templates (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  tagline       TEXT NOT NULL,
  description   TEXT NOT NULL,
  category      TEXT NOT NULL,
  style         TEXT NOT NULL,
  selling       TEXT NOT NULL,            -- physical | digital | services | none
  animation     TEXT NOT NULL,            -- none | subtle | rich
  features      TEXT NOT NULL,            -- JSON array of feature keys
  tech          TEXT NOT NULL,            -- JSON array, e.g. ["HTML","CSS","JS"]
  accent        TEXT NOT NULL,            -- hex colour used in cards/previews
  price_cents   INTEGER NOT NULL,
  pages         INTEGER NOT NULL DEFAULT 1,
  published     INTEGER NOT NULL DEFAULT 1,
  sort_order    INTEGER NOT NULL DEFAULT 100,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_published ON templates(published);

CREATE TABLE IF NOT EXISTS orders (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  reference          TEXT NOT NULL UNIQUE,
  user_id            INTEGER REFERENCES users(id) ON DELETE SET NULL,
  email              TEXT NOT NULL,
  status             TEXT NOT NULL DEFAULT 'pending',   -- pending | paid | cancelled
  subtotal_cents     INTEGER NOT NULL DEFAULT 0,
  discount_cents     INTEGER NOT NULL DEFAULT 0,
  total_cents        INTEGER NOT NULL DEFAULT 0,
  currency           TEXT NOT NULL DEFAULT 'usd',
  provider           TEXT NOT NULL DEFAULT 'stripe',    -- stripe | dev
  provider_ref       TEXT,
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at            TEXT
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_provider_ref ON orders(provider_ref);

CREATE TABLE IF NOT EXISTS order_items (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id      INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  kind          TEXT NOT NULL,            -- template | addon
  sku           TEXT NOT NULL,            -- template slug or addon id
  name          TEXT NOT NULL,
  unit_cents    INTEGER NOT NULL,
  quantity      INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- One row per template a user owns. Entitlements never expire.
CREATE TABLE IF NOT EXISTS entitlements (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_slug  TEXT NOT NULL,
  order_id       INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  addons         TEXT NOT NULL DEFAULT '[]',
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, template_slug)
);

CREATE TABLE IF NOT EXISTS download_tokens (
  token          TEXT PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_slug  TEXT NOT NULL,
  expires_at     TEXT NOT NULL,
  used_at        TEXT
);

-- Saved answers from the guided onboarding quiz, so recommendations survive a refresh.
CREATE TABLE IF NOT EXISTS briefs (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id      TEXT NOT NULL UNIQUE,
  user_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  answers        TEXT NOT NULL,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
