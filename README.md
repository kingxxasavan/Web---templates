# The $5 Store

A full-stack website-template marketplace. Eight original templates at a flat
$5 each, a guided finder that recommends one from a five-question brief, Stripe
checkout, and gated downloads that never expire.

Runs end to end with no configuration — including checkout, which falls back to
a clearly-labelled simulation until you add Stripe keys.

```bash
npm install
npm run db:seed
npm start          # http://localhost:3000
```

---

## What's in here

**The store** — an Express + SQLite application in `src/`.

**The products** — eight complete website templates in `storefront-templates/`,
each plain HTML, CSS and JavaScript with no build step and its own README.

| Template | For | Pages |
|---|---|---|
| Aurora Commerce | Small online store | 4 |
| Monolith Portfolio | Photography / design portfolio | 3 |
| Vertex Launch | SaaS landing page | 2 |
| Ember Table | Restaurant | 3 |
| Sable Studio | Agency / professional services | 4 |
| Quill Journal | Blog / essays | 3 |
| Atelier Lookbook | Fashion / editorial | 3 |
| Pulse Fitness | Gym / classes | 3 |

These are written from scratch, not adapted from anything. That matters for a
store: reselling someone else's MIT-licensed theme for $5 would be a licensing
problem, and inconsistent quality besides.

---

## Features

**Guided finder** (`/find`) — five questions, then the catalogue is ranked
against the brief. Every match shows the reasons it scored *and the features it
lacks*, because a surprise after purchase costs more than a lost sale.

**Cart and bundle pricing** — $5 each; any three for $12, applied automatically
and stacking (six templates is two bundles). Add-ons never discount.

**Checkout** — Stripe Checkout when keys are present. Fulfilment is idempotent
and webhook-driven; the success redirect verifies the session against Stripe
before granting anything, so a forged `?ref=` query string grants nothing.

**Guest checkout** — buy with just an email. A claimable account is created
behind it so the download link keeps working, and a password can be set later
from the receipt.

**Downloads** — entitlements never expire. Each download issues a single-use,
30-minute token, then streams a zip built on the fly with a `LICENCE.txt`
carrying the buyer's email and order reference.

**Live previews** (`/preview/<slug>/`) — the real template files, served from
the same source that gets zipped, with a store banner injected so a stray
preview URL is never mistaken for a purchase.

**Domain finder** (`/domains`) — ranks distinctive compounds above bare
dictionary words, which is what every other generator gets wrong. Optional DNS
availability hint, clearly labelled as indicative.

**Tutorials** (`/tutorials`) — seven, covering deployment, DNS, forms,
analytics, and wiring a real Stripe checkout behind a template's cart.

---

## Configuration

Everything has a working default. Copy `.env.example` to `.env` to change any
of it:

```bash
cp .env.example .env
```

| Variable | Default | Notes |
|---|---|---|
| `PORT` | `3000` | |
| `BASE_URL` | `http://localhost:3000` | Used in Stripe redirect URLs |
| `SESSION_SECRET` | insecure dev value | **Must** be set in production |
| `STRIPE_SECRET_KEY` | empty | Empty means simulated checkout |
| `STRIPE_WEBHOOK_SECRET` | empty | Required for real fulfilment |
| `DATA_DIR` | `./data` | Where the SQLite files live |

### Enabling real payments

1. Get test keys from the [Stripe dashboard](https://dashboard.stripe.com/test/apikeys).
2. Set `STRIPE_SECRET_KEY` in `.env`.
3. Forward webhooks locally and set the printed secret as `STRIPE_WEBHOOK_SECRET`:

```bash
stripe listen --forward-to localhost:3000/checkout/webhook
```

The footer and cart both show a warning while payments are simulated, so there
is no way to have this configured wrong and not notice.

**The webhook is the source of truth for fulfilment.** A buyer can close the tab
before the success redirect fires; `checkout.session.completed` is what actually
grants the templates. Both paths call the same idempotent `fulfil()`, so a
webhook retry never double-grants.

---

## Commands

```bash
npm start              # run the server
npm run dev            # run with --watch
npm test               # 48 tests, no network access needed
npm run db:seed        # create/refresh the schema and catalogue
npm run db:reset       # delete the database entirely
npm run audit:contrast # WCAG AA contrast check over all 50 pages
```

---

## Tests

```bash
npm test
```

Four suites, all offline:

- **`catalog.test.js`** — every catalogue entry has real files behind it, the
  declared page count matches what ships, and every category has something in it
  (an empty category is a dead filter).
- **`pricing.test.js`** — bundle maths at every boundary, including that add-ons
  are never discounted and totals never go negative.
- **`recommend.test.js`** — an exact brief scores 100%, missing features are
  reported rather than hidden, results are sorted.
- **`templates.test.js`** — every template's JavaScript parses, every referenced
  asset exists, one `<h1>` per page, every `<img>` has `alt`, every `<svg>` is
  labelled or hidden, every stylesheet handles `prefers-reduced-motion` and has
  a phone breakpoint. Also catches malformed colour literals, which render as a
  broken page rather than an error.
- **`flow.test.js`** — the full guest purchase against a real server on a
  throwaway database: cart → checkout → receipt → claim account → download.
  Asserts that download tokens are single-use, that you cannot download a
  template you do not own, that CSRF is enforced, that login does not reveal
  whether an account exists, and that path traversal on the preview route fails
  (sent as raw paths, since `fetch` would normalise the attack away).

---

## Contrast audit

```bash
npm install --no-save playwright
npm run audit:contrast
```

Loads all 50 pages — every store page and every page of every template —
measures every piece of rendered text against the background actually painted
behind it, and fails if anything falls short of WCAG AA (4.5:1, or 3:1 for
large text). It starts the app itself, so there is nothing to set up.

All 50 pages currently pass. This is worth running before adding a template or
changing a palette: the failure mode it catches is a muted grey that reads fine
on white and quietly fails on the tinted alternate surface a few sections down,
which is invisible until someone measures it.

Playwright is deliberately not a dependency — it is a pre-release check, and
`npm install` should not pull a browser for it.

---

## Architecture

```
src/
├── server.js          Express setup, middleware order, route mounting
├── config.js          All configuration and pricing in one place
├── db/
│   ├── schema.sql     Tables; run on every boot, idempotent
│   ├── catalog.js     The product catalogue as data
│   └── seed.js        Upserts the catalogue
├── services/          All business logic, no HTTP
│   ├── recommend.js   Rule-based scoring for the finder
│   ├── pricing.js     Cart totals and the bundle rule
│   ├── payments.js    Stripe, with the dev fallback
│   ├── orders.js      Orders, entitlements, download tokens
│   ├── packager.js    Zip streaming and licence generation
│   ├── domains.js     Domain suggestion and DNS checks
│   ├── templates.js   Catalogue queries
│   ├── cart.js        Session cart
│   └── users.js       Accounts and password handling
├── routes/            HTTP only — thin, delegating to services
├── views/             EJS, server-rendered
└── content/           Tutorial content as structured data
```

Routes stay thin and services hold the logic, which is why the pricing and
recommendation suites can test the interesting behaviour without HTTP.

**The webhook is mounted before the body parsers** in `server.js` — Stripe
signature verification needs the raw body, and a JSON parser upstream of it
silently breaks every webhook.

### Security

- Session-based auth, bcrypt at cost 12, session regenerated on login
- Per-session CSRF on every mutating request, compared in constant time
- `helmet` with a restrictive CSP
- Rate limiting on the DNS-backed domain lookup
- Path traversal guarded in both the preview route and the packager
- Prices are always looked up server-side; nothing about the cart is trusted
  from the client
- Login returns one message whether the password or the account is wrong

### Why SQLite

One file, no service to run, and `better-sqlite3` is synchronous, which removes
a whole class of ordering bug from the fulfilment path. For this workload it
would take a long time to become the bottleneck. If it does, the schema is
ordinary SQL and `src/db/index.js` is the only file that knows the driver.

---

## Adding a template

1. Create `storefront-templates/<slug>/` with an `index.html`, an `assets/`
   directory and a `README.md`.
2. Add an entry to `src/db/catalog.js`.
3. `npm run db:seed && npm test`.

The test suite will tell you if the declared page count is wrong, an asset is
missing, the README is too thin, or any of the accessibility basics are absent.

## Licence

The store application is yours to do as you like with. Each template carries its
own buyer licence, generated per order — see `/licence` for the full text.
