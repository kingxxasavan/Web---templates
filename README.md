# Foundry — a full-stack template store

A working storefront that sells nine original website templates as
downloadable source. Accounts, cart, checkout, order history and
ownership-gated downloads — not a landing page with a Gumroad link.

**One-time pricing: $5 · $10 · $35.** No subscriptions.

---

## Pricing

| Tier | Price | What's in it |
|---|---|---|
| **Starter** | **$5** | 6 single-purpose templates, no build step |
| **Pro** | **$10** | 3 multi-page / app-grade templates |
| **Bundle** | **$35** | All 9 — saves $25 against $60 separately |

Prices live in `lib/catalog.js` and are re-synced into the database on every
boot. The client never sends an amount: totals are always recomputed
server-side from the catalogue at checkout.

## The stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16, App Router | Route handlers give a real API beside the pages |
| Database | libSQL (`@libsql/client`) | One client speaks to a local file *and* hosted Turso, so the data layer is identical in dev and production |
| Auth | scrypt + httpOnly session cookies | No dependency, no third-party identity provider |
| Payments | Stripe Checkout, with a simulation fallback | The whole flow is exercisable before a Stripe account exists |
| Tests | `node --test` | No test framework to install |

## How a purchase works

1. **Register** — `POST /api/auth/register`. Password hashed with scrypt and a
   per-user salt; the session token is random 32 bytes, stored in the database
   only as a SHA-256 hash, so a leaked dump cannot be replayed as a login.
2. **Add to cart** — `POST /api/cart`. The slug is validated against the
   catalogue before it touches anything.
3. **Checkout** — `POST /api/checkout` prices the cart server-side and writes a
   pending order.
4. **Fulfilment** — grants one `entitlements` row per template. A bundle fans
   out to all nine, so the download check stays a single indexed lookup.
5. **Download** — `GET /api/download/[slug]` verifies ownership, then streams
   the zip.

The zips live in `private/downloads/`, **outside `public/`**, so there is no
URL that serves them directly — every download passes the ownership check.
`next.config.mjs` uses `outputFileTracingIncludes` to ship them with the
download function, since nothing imports them.

### Cart rules worth knowing

- Anything already in your library is dropped from the cart.
- If the bundle is present, individual items fold into it — nobody is charged
  twice for the same file.
- `fulfillOrder` is idempotent, so a replayed Stripe webhook cannot
  double-grant or corrupt the order.

## Security

- Passwords: scrypt, 64-byte key, per-user salt, `timingSafeEqual` comparison.
- Sessions: httpOnly + SameSite=Lax + Secure in production; 30-day expiry
  checked server-side.
- CSRF: SameSite=Lax blocks cross-site form POSTs, and every mutating route
  additionally checks `Origin` against `Host`.
- Login: identical response whether the email is unknown or the password is
  wrong, so the endpoint cannot be used to enumerate accounts. Rate-limited to
  8 attempts per 15 minutes.
- Path traversal: slugs are checked against the catalogue before being used in
  a path.

## Why the inventory is original

Every template in `templates/` was written from scratch. That is a commercial
decision, not a point of pride:

- **MIT / Apache / BSD** may be resold, but only with the original copyright
  notice intact — so you are charging for something the buyer can clone free
  from GitHub, with someone else's name in the folder.
- **GPL / AGPL** lets every buyer redistribute it onward for free.
- **CC BY-NC** and "free for personal use" forbid commercial resale outright.
- Themes bundle fonts, icons and photography under *separate*, stricter
  licences than the code.

Gumroad, Lemon Squeezy and ThemeForest delist resold open-source work, and
buyers charge back when they find the original. Owning the inventory removes
the whole category of risk. `templates/*/LICENSE.txt` is what each buyer gets.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # 20 tests, no framework needed
npm run build    # zips the templates, then builds
```

No configuration is needed to run locally. The database is created at
`./data/store.db` on first boot and checkout runs in simulation mode, so you
can register, buy and download immediately.

## Deploying

1. **Database.** Vercel's filesystem is ephemeral, so create a hosted database
   — Turso has a free tier and needs no code change:
   ```bash
   npx turso db create foundry
   npx turso db show foundry --url      # → DATABASE_URL
   npx turso db tokens create foundry   # → DATABASE_AUTH_TOKEN
   ```
2. **Import** the repo at [vercel.com/new](https://vercel.com/new).
   `vercel.json` pins the framework and build command.
3. **Set env vars** from `.env.example`.
4. **Stripe**, when you're ready to take real money: set `STRIPE_SECRET_KEY`,
   add a webhook to `https://yourdomain/api/webhook/stripe` for
   `checkout.session.completed`, and set `STRIPE_WEBHOOK_SECRET`.

Until Stripe keys are set, checkout completes instantly and orders are
labelled "simulated" in the order history.

## Adding a template

1. Drop the folder into `templates/<slug>/`.
2. Add an entry to `TEMPLATES` in `lib/catalog.js` with a `tier`.
3. Save a preview to `public/thumbs/<slug>.webp` (1100×825).
4. Copy a `LICENSE.txt` in from any existing template.

The zip, the listing, `/t/<slug>`, the footer and the bundle all pick it up.

## Structure

```
app/
  page.js                    storefront
  t/[slug]/page.js           template detail
  cart/, account/            cart and library
  login/, register/
  api/
    auth/{register,login,logout}/
    cart/                    server-priced cart
    checkout/                Stripe or simulation
    download/[slug]/         ownership-gated zip delivery
    webhook/stripe/          signature-verified fulfilment
lib/
  catalog.js                 products, tiers, prices
  db.js                      libSQL client, schema, seeding
  password.js                scrypt helpers (no Next import — unit tested)
  auth.js                    sessions, rate limiting, origin checks
  store.js                   cart, orders, entitlements
scripts/build-zips.mjs       templates/ → private/downloads/
templates/                   the products
tests/store.test.js
```

## Honest notes

- **The store works; the business still needs traffic.** Template sales are a
  distribution problem. Nine templates on a URL nobody visits earns nothing —
  budget for SEO, a launch, or an existing audience.
- **No analytics yet.** Add Vercel Analytics or Plausible before driving
  traffic, or you won't know what converts.
- **No password reset flow.** If you take real money, add one — buyers will
  lock themselves out.
- **No email receipts.** Stripe sends its own, but the simulated path sends
  nothing.
- Prices are a starting point, not a researched position. Test them.
