# Foundry — a website template store

A static storefront that sells nine original website templates as downloadable
source code. No backend, no database, no build server — it deploys to Vercel's
free tier and the only running cost is your domain.

![9 templates](https://img.shields.io/badge/templates-9-black) ![no backend](https://img.shields.io/badge/backend-none-black)

---

## Why the inventory is original

Every template in `templates/` was written from scratch. None of it is a
repackaged open-source theme, and that is a deliberate commercial decision
rather than a point of pride:

- **MIT / Apache / BSD** code may be resold, but only with the original
  copyright notice and LICENSE intact. Strip them and it is copyright
  infringement. Keep them and you are charging for something the buyer can
  clone free from GitHub in thirty seconds.
- **GPL / AGPL** code may be sold, but every buyer gets the right to
  redistribute it for free, which collapses the model.
- **CC BY-NC** and "free for personal use" themes forbid commercial resale
  outright.
- Themes also bundle fonts, icons and photography under *separate* licences
  that are usually stricter than the code.

Gumroad, Lemon Squeezy and ThemeForest all remove listings that resell
open-source work, and buyers charge back when they discover it. Owning the
inventory outright avoids all of that. `templates/*/LICENSE.txt` is the licence
each buyer receives.

## What's in the box

| Template | For | Pages | Stack | Price |
|---|---|---|---|---|
| Helix | AI SaaS landing page | 1 | Next.js, three.js | $79 |
| Vertex Launch | SaaS landing page | 2 | HTML/CSS/JS | $29 |
| Aurora Commerce | Small online store | 4 | HTML/CSS/JS | $29 |
| Sable Studio | Agency / services | 4 | HTML/CSS/JS | $29 |
| Monolith Portfolio | Photography / design | 3 | HTML/CSS/JS | $29 |
| Atelier Lookbook | Fashion / editorial | 3 | HTML/CSS/JS | $29 |
| Quill Journal | Blog / essays | 3 | HTML/CSS/JS | $29 |
| Ember Table | Restaurant | 3 | HTML/CSS/JS | $29 |
| Pulse Fitness | Gym / classes | 3 | HTML/CSS/JS | $29 |

$311 individually, $149 as a bundle.

## How selling works

The store ships in **free-download mode** so it is useful the moment it
deploys. Each template's button serves its zip straight from `/public`.

To charge for one, set its `checkoutUrl` in `lib/templates.js`:

```js
{
  slug: "aurora-commerce",
  price: 29,
  checkoutUrl: "https://yourname.gumroad.com/l/aurora",  // ← add this
}
```

`components/GetButton.jsx` then sends buyers to that hosted checkout instead of
serving the file. Gumroad, Lemon Squeezy and Polar all handle payment, VAT/sales
tax and file delivery, which is what keeps this a static site with no backend to
maintain. Upload the same zip from `public/downloads/` as the product file.

Leave `checkoutUrl` as `null` on one or two templates and they become a free
lead magnet for the paid ones.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # zips the templates, then builds the site
npm run zips     # rebuild the download zips only
```

`scripts/build-zips.mjs` packages every folder in `templates/` into
`public/downloads/<slug>.zip` plus an `everything.zip` bundle. It runs
automatically before `next build`, so downloads can never drift from the
source. `public/downloads/` is gitignored — it is generated, not committed.

## Adding a template

1. Drop the folder into `templates/<slug>/`.
2. Add an entry to `TEMPLATES` in `lib/templates.js`.
3. Save a preview image to `public/thumbs/<slug>.webp` (1100×825).
4. Copy a `LICENSE.txt` in from any existing template.

The zip, the listing card, the detail page at `/t/<slug>`, the footer link and
the bundle all pick it up automatically.

## Deploying

Import the repo at [vercel.com/new](https://vercel.com/new) and deploy. The
`vercel.json` pins the Next.js preset and the build command, so no dashboard
configuration is needed.

After the first deploy, set `SITE` in `app/layout.js` to your real domain so
Open Graph tags resolve.

## Structure

```
app/
  page.js            home — hero, grid, bundle, licence, FAQ
  t/[slug]/page.js   template detail pages (statically generated)
  globals.css        theme tokens
components/          masthead, cards, buttons, footer
lib/templates.js     the catalogue — prices, copy, checkout URLs
scripts/
  build-zips.mjs     packages templates/ into public/downloads/
templates/           the products themselves
public/thumbs/       preview images
```

## Honest notes

- The store is real and functional; the **business** still needs traffic.
  Template sales are a distribution problem, not a product problem — budget
  for SEO, a launch, or an audience before expecting revenue.
- There is no analytics wired up yet. Add Vercel Analytics or Plausible before
  driving traffic, or you will not know what converts.
- Prices in `lib/templates.js` are a starting point, not a researched
  position. Test them.
