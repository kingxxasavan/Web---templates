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
| Email | Resend over `fetch`, with a logged fallback | No SDK, and both mail flows work before a provider exists |
| Analytics | Vercel Analytics + a first-party sales dashboard | Traffic from Vercel, revenue from your own database |
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

## The tour

A first-time visitor lands *inside* a real template — picked at random from
the eight that run in a frame — and can genuinely use it. Every link, filter,
cart drawer and form in there is live; nothing is overlaid or faked. A guide
panel sits in the corner naming the page, what's built into it, and one thing
worth trying, and it **follows** the visitor: navigate inside the template and
the guide catches up rather than fighting you.

"Show me another" swaps to a different template, so the tour is as long as
they want it. When they're done it shrinks away and reveals that everything
they just used is a product, followed by a rotating showcase of the rest.

- Mounts *over* the storefront rather than redirecting, so crawlers and
  returning visitors still get the store. It is never a gate.
- Shows once per browser, with "Skip tour" always visible and a "Take the
  tour" button in the hero.
- Steps come from the catalogue's per-page metadata, so adding a template adds
  it to the tour pool automatically.

## Live previews instead of screenshots

Product pages run the real template in a frame with its pages as tabs, a
device-width switcher and a per-page description, so a buyer can walk every
page and function before paying. `scripts/build-previews.mjs` copies the static
templates into `public/preview/<slug>/` at build time.

**The trade-off:** a served template's markup is viewable, the same as on any
template marketplace. That is the price of a demo people trust, and the paid
artefact is still the packaged source, README and licence, which only come
through the authorised download route. Previews carry `X-Robots-Tag: noindex`
so they never compete with the store in search.

Helix needs a build step, so it keeps a still and lists its sections instead.

## Carts without an account

Browsing, adding to the cart and seeing a full total need no account and no
database — a signed-out cart lives in a cookie. Only checkout requires signing
up, and the cookie cart is merged into the account on registration, sign in and
at checkout, so nothing picked out beforehand is lost.

Only slugs are stored. Prices are always recomputed server-side from the
catalogue, so editing the cookie changes which items are in the cart and
nothing else; an injected value is dropped on read.

## Password reset

`/forgot` issues a single-use token, stored only as a SHA-256 hash and valid
for one hour. Requesting a new link invalidates the previous one, and
completing a reset **destroys every existing session** for that account — if
the reset happened because someone else had access, that access ends there.

The response to a reset request is identical whether or not the address is
registered, so the endpoint cannot be used to discover who has an account.

## Receipts and email

`lib/email.js` sends through Resend when `RESEND_API_KEY` is set and otherwise
logs the message. Either way **every send is recorded in the `emails` table**,
so there is a delivery record and the admin mail log shows failures.

Receipts go out after fulfilment from both the simulated path and the Stripe
webhook — and only on first fulfilment, so a replayed webhook cannot re-send.
A mail failure never fails a purchase: the entitlement is already granted by
that point, so errors are swallowed and recorded rather than surfaced.

## Reviews

Reviews are restricted to **verified buyers**: writing one requires an
entitlement row, which only exists after a fulfilled order. Buying the bundle
entitles you to review any template. The unique key on `(user_id, slug)` means
one review per buyer per template — editable, not repeatable.

Author emails are masked (`jo***@example.com`) and ratings are constrained to
1–5 integers in both the application and a `CHECK` constraint. Averages appear
on the listing cards and in the buy rail.

## Analytics

Three sources, deliberately:

- **Traffic** — `@vercel/analytics` and `@vercel/speed-insights` are mounted in
  the root layout. Cookie-less, and they no-op outside a Vercel deployment.
  Enable Analytics in your Vercel project to see visitors, referrers and pages.
- **Money** — `/admin` reads your own database: all-time and 30-day revenue,
  average order value, signup→purchase conversion, a daily revenue chart, best
  sellers by revenue, recent orders, review average and the mail log.
- **Behaviour** — Firebase Analytics, when `NEXT_PUBLIC_FIREBASE_*` is set.
  Beyond page views it records `tour_start`, `tour_next_template`,
  `tour_reveal` (with pages and templates seen), `add_to_cart`,
  `begin_checkout`, `checkout_needs_account` and `purchase` — enough to tell
  whether the tour actually sells anything. Tracking never throws: an ad
  blocker costs you a data point, not a working page.

A Firebase web config is public by design — it ships in the bundle of every
Firebase web app and identifies the project rather than authenticating it.
Your **security rules** are what protect the data. Moving accounts and orders
onto Firestore is separate and needs a service account key, which is a real
secret; see `.env.example`.

Admin access is an allowlist in `ADMIN_EMAILS`, not a database flag, so a
compromised account cannot promote itself. A non-admin gets a 404 rather than
a 403 — the page should not announce that it exists.

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
- Reset tokens: 32 random bytes, stored hashed, single use, one-hour expiry,
  and superseded by any newer request.
- Reviews: write access requires a purchase; ratings are bounded in code and by
  a database `CHECK`.

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

## When the database is down

The storefront is built entirely from the static catalogue, so a browsing
visitor never sees an error because the data layer is unreachable or not yet
configured. Reads behind the storefront degrade through `readOrFallback` —
ratings, ownership and the session lookup fall back to empty. **Writes never
do**: a purchase that silently does nothing is worse than an error.

This is what fixes the blank-page deploy. With `DATABASE_URL` unset on Vercel,
the `file:` fallback lands on a read-only filesystem; previously that took the
whole site down, and now it costs only accounts and orders.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # 36 tests, no framework needed
npm run previews # rebuild the live template previews only
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
  login/, register/, forgot/, reset/
  admin/                     sales dashboard
  api/
    auth/{register,login,logout,forgot,reset}/
    cart/                    server-priced cart
    checkout/                Stripe or simulation
    download/[slug]/         ownership-gated zip delivery
    reviews/                 verified-buyer reviews
    webhook/stripe/          signature-verified fulfilment
lib/
  catalog.js                 products, tiers, prices
  accounts.js                user records and reset tokens (unit tested)
  email.js                   Resend or logged, always recorded
  reviews.js                 verified-purchase reviews
  metrics.js                 sales figures for the dashboard
  admin.js                   ADMIN_EMAILS allowlist
  guest-cart.js              signed-out cart, cookie only
  tour.js                    the first-visit walkthrough
  db.js                      libSQL client, schema, seeding
  password.js                scrypt helpers (no Next import — unit tested)
  auth.js                    sessions, rate limiting, origin checks
  store.js                   cart, orders, entitlements
scripts/
  build-zips.mjs             templates/ → private/downloads/ (paid, gated)
  build-previews.mjs         templates/ → public/preview/ (live demos)
templates/                   the products
tests/{store,accounts}.test.js
```

## Still to do

- **Firebase.** Not started. The data layer is SQL through libSQL, so moving to
  Firestore is a rewrite of every query rather than a config change, and it
  wants to be its own commit rather than riding along on top of a fix you were
  waiting to deploy. Say the word and it's next.

## Honest notes

- **The store works; the business still needs traffic.** Template sales are a
  distribution problem. Nine templates on a URL nobody visits earns nothing —
  budget for SEO, a launch, or an existing audience.
- **Turn on Analytics in the Vercel dashboard** — the code is wired up, but
  the project setting still has to be enabled.
- **Email needs a real provider before launch.** Without `RESEND_API_KEY`,
  receipts and reset links are only logged — buyers never receive them.
- **Reviews are published immediately.** There is no moderation queue. Fine at
  low volume; add one if it gets abused.
- **Set `ADMIN_EMAILS`** or `/admin` is unreachable, by design.
- Prices are a starting point, not a researched position. Test them.
