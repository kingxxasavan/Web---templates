# Helix — AI Support Agent Landing Page

A production-ready marketing site for **Helix**, a fictional AI customer-support
agent that resolves tickets end-to-end instead of deflecting them to help
articles.

Built as a premium, conversion-focused SaaS landing page: cinematic dark theme,
a real WebGL hero, a self-playing product demo, and a full pricing / FAQ / CTA
funnel.

---

## Why this product

The niche was picked from current market research rather than at random:

- AI **customer-service automation** is consistently named the most profitable
  AI SaaS category, and narrow vertical AI tools compound faster than
  general-purpose ones.
- Products in this space (e.g. Chatbase) have reached ~$50K MRR within months
  of launch, with 70–90% gross margins typical for micro-SaaS.
- The site's positioning — *resolution, not deflection* — is the sharpest
  wedge against the AI already bundled into incumbent helpdesks.

Pricing is modelled **per resolution, not per seat**, which is the pricing shape
buyers in this category respond to.

## Design approach

The visual language follows what currently wins in SaaS design: cinematic dark
surfaces, liquid-glass panels, editorial italic serif accents against a neutral
grotesque, and animation that does explanatory work rather than decoration.

| Element | Detail |
| --- | --- |
| Palette | Near-black `#06060a` base, electric violet `#7c5cff` → cyan `#22d3ee`, ember `#ff8a5c` accent |
| Type | Inter for UI, Instrument Serif italic for display accents |
| Depth | Aurora gradients, film grain, 1px gradient hairlines, masked grid lines |
| Motion | Scroll-linked reveals, a scroll-driven progress rail, animated counters, spotlight-tracking cards |

## The 3D hero

`components/HelixCanvas.jsx` is a hand-written **three.js** scene — no
React reconciler in the render loop:

- Two particle strands swept along a helix with a waist modulation, plus
  connecting rungs and a field of ambient dust.
- A custom GLSL shader pair draws soft additive glow points that pulse and
  fade with depth.
- The form tracks the pointer, drifts with scroll, and pauses via
  `IntersectionObserver` when scrolled out of view.
- Camera distance adapts to viewport width, and everything respects
  `prefers-reduced-motion`.

## The product demo

`components/Showcase.jsx` runs a looping, self-playing simulation of Helix
closing a support ticket: a live queue, a step-by-step reasoning trace, a
typewriter-rendered reply with a confidence score, and resolution pills. It
pauses when off-screen and is fully clickable.

---

## Tech stack

- **Next.js 16** (App Router, Turbopack) — statically prerendered
- **React 19**
- **Tailwind CSS v4** — theme defined in `app/globals.css` via `@theme`
- **Framer Motion** — reveals, layout animations, accordion transitions
- **three.js** — the hero scene

## Running locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

## Deploying to Vercel

The site is a stock Next.js app, so Vercel needs no configuration:

1. Push this repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Leave every build setting at its default — Vercel detects Next.js,
   runs `npm run build`, and deploys.
4. Click **Deploy**.

No environment variables are required.

After the first deploy, update the `SITE` constant in `app/layout.js` and the
URLs in `app/sitemap.js` / `public/robots.txt` to your real domain so that
Open Graph tags and the sitemap point to the right place.

## Project structure

```
app/
  layout.js        fonts, metadata, Open Graph, viewport
  page.js          section composition + FAQ JSON-LD
  globals.css      theme tokens, glass/aurora/grain utilities
  icon.svg         favicon
  sitemap.js
components/
  Nav.jsx          sticky glass nav + mobile sheet
  Hero.jsx         headline, CTAs, stat strip
  HelixCanvas.jsx  three.js particle helix
  LogoCloud.jsx    marquee
  Showcase.jsx     self-playing ticket-resolution demo
  Features.jsx     bento grid with cursor spotlight
  HowItWorks.jsx   scroll-driven alternating timeline
  Results.jsx      animated metric counters
  Testimonials.jsx
  Pricing.jsx      monthly/yearly toggle, 3 tiers
  FAQ.jsx          animated accordion
  CTA.jsx          email capture
  Footer.jsx
  ui.jsx           Reveal, Button, Section primitives
```

## Accessibility & performance

- Fully static prerender; no client data fetching.
- `prefers-reduced-motion` honoured across CSS and the WebGL loop.
- WebGL pauses when off-screen; device pixel ratio capped at 2.
- Semantic landmarks, labelled form controls, `aria-expanded` on the nav and
  accordion, and decorative canvases marked `aria-hidden`.
- Verified at 1440px and 390px with no horizontal overflow and no console
  errors.

## Note on content

Helix is a fictional product built as a design and engineering showcase. The
company names, testimonials, and performance figures are illustrative — replace
them with real ones before using this for a live business.
