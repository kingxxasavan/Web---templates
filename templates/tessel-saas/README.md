# Tessel

A modern SaaS marketing site with a product demo people can actually use. The
hero is a working staff rota: drag shifts between days and people and watch
hours, wages, labour percentage and rule checks update live. Around it: a
feature tour with working mini-demos (approve swaps, clock in, download a
real CSV), a per-person pricing calculator with monthly or yearly billing, a
filterable changelog and a four-step sign-up wizard that drafts a first rota
from the answers.

## Files

```
index.html       Hero with the interactive rota, logos, feature tour, bento, stats, quotes, FAQ
pricing.html     Team-size slider, billing toggle, three plans, comparison table, add-ons
changelog.html   Releases with New / Improved / Fixed filters, search and a subscribe box
signup.html      Four-step onboarding wizard that ends with a drafted rota
assets/style.css All styling; theme tokens (colours, fonts) at the top
assets/app.js    Rota demo, feature tour, pricing maths, changelog filters, wizard
```

No build step and no images to replace: every product screen is built in
HTML and CSS, so it stays sharp on any screen and follows your colours.

## Making it your product

The rota is demo content for a scheduling app, but the patterns carry over to
almost any SaaS: an interactive hero demo, a tabbed feature tour, a pricing
calculator, a changelog and an onboarding wizard. Swap the copy, keep the
structure.

### The hero demo

The data is at the top of `assets/app.js`:

- `STAFF`: people, their role, hourly rate, contracted hours (`max`) and days
  off (`off`, 0 is Monday).
- `START`: the shifts, as `[person, day, start, end, role]`.
- `FORECAST` and `TARGET`: sales per day and the labour-cost target used by
  the meter.
- `MIN_REST`: the minimum hours between shifts before a warning appears.

Shifts can be dragged with a mouse, tapped to pick up and tapped to drop on
touch screens, or moved with the keyboard (Enter to pick up, arrow keys to
move, Escape to put down). "Fix issues" shows how an assistant feature could
work: it promotes someone to cover a missing lead and hands overtime to a
colleague with spare hours.

### Pricing

Each plan card has `data-month` and `data-year` (price per person per
month). `FREE_LIMIT` in `assets/app.js` sets how many people the free plan
covers. The slider runs from 1 to 150.

### Changelog

Each item has `data-kind` (`new`, `improved` or `fixed`); the filter counts
update automatically. Add a release by copying an `<article class="release">`.

### Sign-up

`ROLE_SETS` and `HOUR_SETS` in `assets/app.js` set the suggested roles and
opening hours for each business type. The wizard validates each step and
shows a finished state, but doesn't create accounts: send the final step to
your own sign-up endpoint.

## Colours and fonts

Theme tokens are at the top of `assets/style.css`; the online editor changes
them for you. `--pop` is the lime highlight, and the `--r-*` tokens colour
each role. Fonts are Geist and Geist Mono from Google Fonts (SIL Open Font
Licence).
