# Foundry — original website templates, $5 to $15

A full-stack template store: a multi-page marketing site, a searchable
catalogue with live previews, accounts on Firebase, a cart, Stripe checkout,
a download library, verified-buyer reviews and an admin dashboard.

---

## Connecting Firebase

This is what makes "Create account" work. Until it's done the site still
browses, previews and fills carts, and the sign-in pages show a short
"accounts are almost ready" notice instead of failing.

1. **Create a project** at [console.firebase.google.com](https://console.firebase.google.com).
2. **Turn on sign-in.** Authentication → *Get started* → Sign-in method.
   Enable **Email/Password** and **Google**.
3. **Authorise your domain.** Authentication → Settings → *Authorized domains*
   → add your Vercel address (e.g. `your-store.vercel.app`) and any custom
   domain. Missing this is the most common cause of a failed sign-in.
4. **Create the database.** Firestore Database → *Create database* →
   production mode, any region. Then open the *Rules* tab and paste in
   `firestore.rules` from this repo (it denies all browser access — the
   server does every read and write).
5. **Get the web config.** Project settings → General → *Your apps* → add a
   Web app. Copy `apiKey`, `authDomain`, `projectId` and `appId` into the
   four `NEXT_PUBLIC_FIREBASE_*` variables.
6. **Get the service account.** Project settings → Service accounts →
   *Generate new private key*. Paste the whole JSON file's contents into
   `FIREBASE_SERVICE_ACCOUNT` (one line is fine). This one is secret.
7. **Add the variables in Vercel** (Project → Settings → Environment
   Variables) and **redeploy** — `NEXT_PUBLIC_*` values are built into the
   page, so they only take effect on a new deployment.

No indexes need creating: every query is either a single-field filter or
sorted in memory.

### How sign-in works

The browser signs in with the Firebase Auth SDK (email and password, or
Google), then posts the fresh ID token to `/api/auth/session`. The server
verifies it with the Admin SDK and swaps it for a **Firebase session cookie**
— httpOnly, SameSite=Lax, two weeks — then clears the browser's own Firebase
state. From then on every page and route identifies the buyer from that
cookie alone.

- Only a token from a sign-in in the last five minutes can become a session,
  so an old, leaked ID token can't be upgraded.
- Firebase handles password storage, brute-force protection, password-reset
  emails and email verification. No mail provider is needed for any of them.
- Firebase error codes are translated into messages a buyer can act on, and
  the two usual setup mistakes (provider not enabled, domain not authorised)
  say exactly which console switch to flip.

### Data model

```
users/{uid}                       email, provider, allAccess
users/{uid}/entitlements/{slug}   one document per owned template
orders/{orderId}                  items, totals, credit, status, provider
reviews/{slug}__{uid}             one per buyer per template
messages/{id}                     contact form and template requests
subscribers/{hash}                new-release alerts
emails/{id}                       every receipt sent, and whether it failed
```

---

## Pricing

| Tier | Price | Templates |
|---|---|---|
| **Starter** | **$5** | Vertex Launch, Monolith, Atelier, Quill, Ember Table, Pulse |
| **Pro** | **$10** | Aurora Commerce, Sable Studio |
| **Premium** | **$15** | Helix |
| **All-access bundle** | **$29** | Everything, plus every future template |

Prices live in `lib/catalog.js`. The client never sends an amount: carts
are priced server-side by `lib/pricing.js`, which is pure and fully tested.

The bundle is the one item above $15 — it's nine templates. Change
`BUNDLE.priceCents` if you'd rather it sat inside the range.

### What makes the store different

These are live features, not just copy. The wording lives in `lib/content.js`.

- **Never pay twice.** The price of everything a buyer already owns is taken
  off the bundle automatically, so upgrading later never costs more than
  buying everything on day one. The cart shows the credit as a line item.
- **Smart upsell.** When the bundle would add templates, the cart says how
  much more it costs (or that it's cheaper) and switches in one click.
- **Future templates included.** Bundle buyers get an `allAccess` flag rather
  than a fixed list, so templates added later appear in their library.
- **Try before you buy.** Live, clickable previews on phone, tablet and
  desktop widths, plus the guided tour.
- **Help from the developer and template requests.** `/contact` stores
  questions, support requests and "build this next" ideas in Firestore; they
  appear on `/admin`.
- **New-release alerts.** Email sign-up in the footer and closing banner.
- **Money-back guarantee.** 14 days, set by `SITE.refundDays` in
  `lib/site.js`. Refunds are issued by hand from the Stripe dashboard. **This
  is a promise to customers — change or remove it before launch if you
  won't honour it.**
- **Search and filters.** `/templates` filters by category and price and
  sorts by price or size.

## Site map

| Page | What it's for |
|---|---|
| `/` | What we are, what we do and how, the promises, featured templates, pricing, FAQ |
| `/templates` | The full catalogue with search, filters and sorting |
| `/t/[slug]` | Live preview, what's included, reviews, bundle offer |
| `/pricing` | Tiers, the bundle, "never pay twice" worked example, comparison table |
| `/how-it-works` | How we build, how buying works, what's in the zip, hosting guides |
| `/about` | Story, principles, who it's for |
| `/licence` | The licence in plain English and the refund policy |
| `/faq` | Every question, with FAQ structured data for search |
| `/contact` | Questions, template requests, support |
| `/cart`, `/account` | Cart, library, order history, upgrade offer |
| `/login`, `/register`, `/forgot` | Firebase sign-in, sign-up (email or Google), password reset |
| `/admin` | Revenue, best sellers, orders, messages, subscribers, mail log |

`sitemap.xml` and `robots.txt` are generated from the catalogue.

## How a purchase works

1. **Add to cart** — `POST /api/cart`. The cart is a cookie of slugs, the same
   for signed-in and signed-out visitors, so nothing needs merging at sign-up.
2. **Checkout** — `POST /api/checkout`. Signed out, the buyer is sent to
   create an account and comes back to the same cart. Signed in, the cart is
   priced server-side and a pending order is written.
3. **Payment** — Stripe Checkout, or instant simulation with no Stripe keys.
   If credit covers the whole total, no card is asked for.
4. **Fulfilment** — in one Firestore transaction: mark the order paid, write
   an entitlement per template, set `allAccess` for the bundle. A paid order
   is returned untouched, so a replayed webhook can't double-grant or
   re-send the receipt.
5. **Download** — `GET /api/download/[slug]` checks ownership and streams the
   zip from `private/downloads/`, which has no public URL.

## The tour

"Take the 60-second tour" on the homepage opens a real, working template —
Aurora Commerce, running live in a frame — and walks the visitor through its
pages as though it were simply the site. Only at the end does it shrink away
and reveal that everything they just used is a $10 product, followed by a
rotating showcase of the rest.

It argues for the build quality far better than a screenshot grid does, because
the visitor has actually used it.

- Mounts *over* the page rather than navigating, so closing it returns the
  visitor exactly where they were. It never opens on its own.
- Steps live in `lib/tour.js`; arrow keys and Escape work.

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

## Reviews

Only buyers can review: writing one requires owning the template. The
document id is `slug__uid`, so there is one review per buyer per template —
editable, not repeatable. The author's email is stored already masked
(`jo***@example.com`).

## Admin dashboard

`/admin` reads Firestore: all-time and 30-day revenue, average order,
signup→purchase conversion, a daily revenue chart, best sellers, recent
orders, messages and template requests, subscriber count, review average and
the mail log. Traffic comes from Vercel Analytics, mounted in the layout.

Access needs **both** an address in `ADMIN_EMAILS` **and** a verified email.
Anyone can register an unverified account with any address, so the
allowlist alone would not be enough. Google sign-in counts as verified;
email sign-ups are sent a verification link. Non-admins get a 404.

## Security

- Passwords never touch this server — Firebase Authentication holds them.
- Sessions are Firebase session cookies: httpOnly, SameSite=Lax, Secure in
  production, verified on every request.
- CSRF: SameSite=Lax plus an `Origin`/`Host` check on every mutating route.
- `?next=` redirects only accept same-site paths.
- Firestore rules deny all client access; only the server's service account
  reads or writes.
- Slugs are checked against the catalogue before they reach a path or query.
- Forms carry a honeypot field; bots that fill it get a silent "ok".

## When Firebase isn't configured or is down

The storefront is built from the static catalogue, so browsing never fails.
Reads for the personal extras (ratings, ownership, the signed-in user)
fall back to empty through `readOrFallback`. **Writes never do** — a purchase
that silently does nothing is worse than an error — and every API route
returns a readable JSON error instead of a blank 500.

The Firebase Admin SDK is loaded on first use rather than imported at the
top of the module, so even the SDK failing to load at all only costs the
personal extras, not the whole site.

**Node version.** `package.json` pins `engines.node` to `22.x`, which Vercel
uses in place of the project setting. Keep `firebase-admin` on v13: v14 pulls
in ESM-only dependencies that crash on Node 20 releases older than 20.19,
which is what took every page down with "Failed to load external module
firebase-admin-…/auth".


## Running it

```bash
npm install
npm run dev            # http://localhost:3000
npm test               # unit tests, no setup needed
npm run build          # zips the templates, builds previews, then builds
```

### Against the Firebase emulators

No Firebase project needed; requires Java and `npm i -g firebase-tools`.

```bash
npm run test:emulator  # all tests, including the Firestore integration suite

npm run emulators      # terminal 1
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-foundry \
npm run dev            # terminal 2: sign up, buy and download locally
```

## Deploying

1. Import the repo at [vercel.com/new](https://vercel.com/new). `vercel.json`
   pins the framework and build command.
2. Follow **Connecting Firebase** above and add the variables from
   `.env.example`.
3. **Stripe**, when you're ready to take real money: set `STRIPE_SECRET_KEY`,
   add a webhook to `https://yourdomain/api/webhook/stripe` for
   `checkout.session.completed`, and set `STRIPE_WEBHOOK_SECRET`. Until then
   orders complete instantly and are labelled "simulated".
4. Set `NEXT_PUBLIC_SITE_URL` to your real address for the sitemap and
   social previews.

## Adding a template

1. Drop the folder into `templates/<slug>/` with a `README.md` and a
   `LICENSE.txt` (copy one from any existing template).
2. Add an entry to `TEMPLATES` in `lib/catalog.js` with a `tier` and a
   `category`.
3. Save a preview to `public/thumbs/<slug>.webp` (1100×825).

The zip, listing, product page, filters, footer, sitemap and bundle all pick
it up, and bundle owners get it automatically. `npm test` checks the folder
has everything a buyer is promised.

## Honest notes

- **The store works; the business still needs traffic.** Budget for SEO, a
  launch, or an existing audience.
- **Check the promises before launch.** The 14-day refund, "help from the
  developer" and template requests are commitments to customers. They're
  easy to edit in `lib/content.js` and `lib/site.js`.
- **Receipts need a mail provider.** Without `RESEND_API_KEY` they're only
  logged. (Password resets don't need one — Firebase sends those.)
- **Reviews publish immediately.** Add moderation if it gets abused.
- **Turn on Analytics in the Vercel dashboard** — the code is wired up.
- Prices are a starting point, not a researched position. Test them.
