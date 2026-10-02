# Noor Haddad

A portfolio and CV site for a product designer, developer or any freelancer
who sells their thinking: a big statement hero with live availability and
local time, filterable project cards, a long-form case study with a
before-and-after slider and animated results, a printable CV, a contact form
that asks the right questions, and a light and dark theme.

## Files

```
index.html       Hero, clients, selected work, services, about, quotes, contact
case-study.html  A long-form case study: facts, research, steps, before/after, results
cv.html          A printable CV (prints cleanly on A4; "Save as PDF" from the dialog)
assets/style.css All styling; theme tokens (colours, fonts) at the top
assets/app.js    Theme, clock, availability, filters, dialog, form, counters, slider
```

No build step and no photographs to replace. The project images are drawn in
SVG so the site looks finished on day one; swap them for screenshots of your
own work whenever you're ready.

## Make it yours

At the top of `assets/app.js`:

```js
var TIMEZONE = "Europe/Lisbon";     // any IANA time zone
var CITY = "Lisbon";
var AVAILABLE_FROM = new Date("2026-11-02T09:00:00Z");
```

The hero shows your local time and how far ahead or behind the visitor you
are. Before `AVAILABLE_FROM` it says "Booking from November"; after it,
"Available now".

## Projects

Each card on the home page has a `data-cat` that matches a filter chip
(`product`, `web`, `systems`). Rename the chips and categories freely.

- A card with an `href` opens a page, like `case-study.html`. Copy that page
  for each project you want to write up.
- A card with `data-detail="tallyho"` opens a short summary in a dialog
  instead. The content lives in `<template id="detail-tallyho">` near the end
  of `index.html`.

To use a screenshot instead of a drawing, replace the `<svg>` inside
`.mock` with `<img src="assets/img/your-shot.jpg" alt="...">`. The box keeps a
4:3 shape; set `--tint` on `.mock` for the background colour behind it.

## Case study

- Results: `data-count` is the number to count up to, with optional
  `data-prefix`, `data-suffix` and `data-decimals`.
- The before-and-after slider shows two images on top of each other. Replace
  the two `<svg>` elements with `<img>` tags of the same size.

## Contact form

The form checks its fields and shows a thank-you message, but doesn't send
anything yet. To receive enquiries, give the form an `action` from a form
service such as Formspree, Basin or Netlify Forms and remove the
`e.preventDefault()` call in `assets/app.js`, or keep the script and `fetch()`
the data to your endpoint.

## Colours and fonts

Theme tokens are at the top of `assets/style.css`; the online editor changes
them for you. The dark theme mixes its colours from the same tokens, so a new
accent carries over to both themes. Fonts are Instrument Sans and Instrument
Serif from Google Fonts (SIL Open Font Licence).
