# Helix

A dark, cinematic landing page for an AI product: a hand-written WebGL
particle hero, a self-playing product demo, bento features, a scroll
timeline, pricing, FAQ and an email capture. Built with Next.js, React,
Tailwind CSS v4, three.js and Framer Motion.

## Running it

You need Node.js 20 or newer.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Deploying

Push the folder to GitHub and import it at vercel.com/new. No settings need
changing. Netlify and any other Next.js host work too.

## Files

```
app/layout.js        Site name, description, fonts and social metadata
app/page.js          The page: the order of the sections, plus FAQ JSON-LD
app/globals.css      Theme colours and fonts in the @theme block at the top
app/sitemap.js       Sitemap for search engines
components/          One file per section (Hero, Features, Pricing, FAQ…)
components/HelixCanvas.jsx   The WebGL particle hero
components/ui.jsx    Shared buttons and small building blocks
```

## Making it yours

- **Name and description** — `SITE` and `metadata` at the top of
  `app/layout.js`.
- **Colours** — the `@theme` block at the top of `app/globals.css`. Every
  component uses these names (`violet`, `cyan`, `ember`…), so changing a value
  there recolours the whole site.
- **Copy** — each section's text lives in its own file in `components/`.
- **Sections** — add, remove or reorder them in `app/page.js`.
- **FAQ** — update both `components/FAQ.jsx` and the `faqSchema` in
  `app/page.js`, so search engines see the same answers as visitors.

## Connecting the email form

The form in `components/CTA.jsx` validates the address and shows a success
state, but does not send it anywhere. Post it to your email provider's
signup endpoint, a Formspree form, or a Next.js route handler of your own.

## Licence

See `LICENSE.txt`.
