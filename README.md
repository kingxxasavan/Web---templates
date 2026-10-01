# Foundry — website template store

A Next.js storefront selling nine templates as paid source downloads.
Starter templates cost $5, Pro templates $10, and the full bundle $35.
Prices always come from lib/catalog.js on the server.

## Run locally

    npm install
    npm run dev
    npm test
    npm run build

The local database is created at data/store.db. Build scripts create gated
ZIP downloads in private/downloads and live demos in public/preview.
Downloads are served only through /api/download/[slug] after ownership checks.
Static previews intentionally expose demo markup; packaged source and licenses
are the purchased product. Helix AI has a separate build step.

## Firebase sign-in

The megan-74585 web configuration supplied for this project is in
lib/firebase.js. The store uses Firebase's HTTPS Authentication API for
registration, sign-in, token refresh, and password reset. No Firebase Admin
service-account secret is needed for authentication.

1. Enable Email/Password under Firebase Authentication → Sign-in method.
2. Add your deployed domain to authorized domains as needed.
3. Firebase sends password-reset emails itself. Its default hosted reset page
   works. To use this store's custom page, set the reset email action URL to
   https://yourdomain/reset. The page accepts Firebase's oobCode parameter.
4. Optional FIREBASE_API_KEY overrides the supplied public web API key.

Refresh tokens live only in an httpOnly, SameSite=Lax cookie, Secure in
production, with a 30-day cookie lifetime. Each server request checks the
session with Firebase; disabled accounts and revoked credentials fail closed.
Passwords are not stored by the store for new Firebase users. Analytics
initialization is not needed for authentication.

Existing SQL accounts are linked only when their previous store password
matches or their Firebase email has been verified. Their user ID and purchased
library stay intact. Matching an unverified email alone never transfers
purchases. Old local session cookies no longer authenticate. Existing buyers
whose accounts have not been migrated should create a Firebase account with
their old store email/password, or use a verified Firebase account.

## Persistent store database

Firebase currently manages authentication. The existing libSQL data layer
continues to hold carts, orders, download permissions, reviews, and receipt
logs. The public Firebase database URL is not an administrative database
credential and does not replace this data layer.

On Vercel, configure DATABASE_URL and DATABASE_AUTH_TOKEN for a hosted libSQL
or Turso database. The local file fallback is for development only. Import
the existing store database if retaining previous buyers and orders. On first
use the schema adds a unique firebase_uid field to existing users.

## Real checkout

Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in hosting environment settings.
Use sk_test_ credentials for test purchases and sk_live_ for real payments.
Register https://yourdomain/api/webhook/stripe for both events:

- checkout.session.completed
- checkout.session.async_payment_succeeded

Checkout sends server-priced items to Stripe's hosted payment page. When
credentials are missing, it returns a clear unavailable message and retains
the cart. There is no automatic simulated/free purchase fallback.

Only a signed Stripe webhook with a paid session matching the order's total,
USD currency, payment mode, order reference, and provider grants downloads.
Fulfilment changes the order and entitlements atomically and tolerates repeated
webhooks. Cart items added while payment is in progress are retained. The
return page checks the buyer's actual order status rather than declaring a
payment successful from a URL parameter. If confirmation is pending, refresh
shortly to see the library update. Cancellation returns to the saved cart.

Guest visitors can add/remove items without signing in. Sign-in and
registration merge their cookie cart into their account. Auth links retain
/cart as the return destination. The bundle folds individual products into
one purchase; a full-library owner cannot buy the same bundle again.

## Optional settings

- RESEND_API_KEY and EMAIL_FROM send purchase receipts. Without them receipts
  are logged in the emails table. Firebase sends reset emails independently.
- ADMIN_EMAILS is the comma-separated allowlist for /admin.
- Vercel Analytics and Speed Insights are mounted in the layout. Enable these
  features in your hosting dashboard if desired.

See .env.example for environment variables. Server secrets belong in hosting
settings, never in client code or committed files.

## Validation

npm test covers catalogue pricing, ownership, reviews, legacy account helpers,
Firebase account linking and session API calls, payment validation, repeated
fulfilment, and cart preservation. Firebase HTTP tests use mocked responses;
production sign-in and a real payment still require configured external
services and a deployed smoke test. npm run build packages all templates and
checks the full Next.js production build.
