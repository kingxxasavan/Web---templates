# Signal

A conference site for a one- to three-day event: a live countdown, tracks,
speakers with bios, a schedule visitors can filter and star, and a ticket
checkout with quantities and promo codes.

## Files

```
index.html       Hero with countdown, why-attend, tracks, speakers, venue map, tickets, FAQ
schedule.html    Two days of sessions, filter by track, star sessions into "My schedule"
speakers.html    Speaker grid with track filter; select a speaker to read their bio
tickets.html     Ticket tiers with quantities, order summary, promo codes, attendee form
assets/style.css All styling; theme tokens (colours, fonts, track colours) at the top
assets/app.js    Countdown, filters, saved schedule, bios dialog and checkout
```

No build step. Open `index.html`, or upload the folder to any static host.

## The basics to change first

At the top of `assets/app.js`:

```js
var EVENT_START = new Date("2027-05-13T09:00:00+01:00");
var PRICES = { early: 249, standard: 349, team: 289 };
var PROMOS = { COMMUNITY15: 0.15, SPEAKERFRIEND: 0.2 };
```

- `EVENT_START` drives the countdown and every "days to go" label.
- `PRICES` are whole pounds; the team price is per person (the checkout
  multiplies by five). Keep the prices shown in the HTML in step.
- `PROMOS` maps each code to its discount (0.15 is 15% off).

## Tracks

Each track has a colour in `assets/style.css` (`--track-product`,
`--track-eng`, `--track-design`, `--track-leadership`) and a short key used in
`data-track` attributes. To rename a track, change its label in the HTML; to
add one, add a colour, a filter button and use the new key on its sessions.

## Sessions

Each session in `schedule.html` is one block:

```html
<article class="session" data-session="d1-1030-3" data-day="1" data-track="eng">
  <div class="session__time">10.30<small>40 min</small></div>
  <div>
    <h3>Migrations you can sleep through</h3>
    <p>One-line description.</p>
    <div class="session__meta">…speaker, room…</div>
  </div>
  <button class="star" type="button" aria-pressed="false">…</button>
</article>
```

`data-session` must be unique: it's how starred sessions are remembered (in
the visitor's browser, under the key `signal-my-schedule`). Breaks use
`class="session session--break"` and have no star.

## Speakers

Speakers use monogram avatars (initials on a track-coloured tile), so the site
looks finished before you have headshots. To use a photo, put an `<img>` inside
`.avatar` in place of the `<span>`. The bio shown in the dialog lives in the
`<template>` inside each speaker card.

## Taking payments

The checkout validates and shows a confirmation, but doesn't charge anyone.
Point it at your ticketing platform: Stripe Payment Links, Tito, Eventbrite
and Pretix all work. The simplest route is to replace the "Continue to
payment" button with a link to your ticket shop.

## Colours and fonts

Theme tokens are at the top of `assets/style.css`; the online editor changes
them for you. Fonts are Space Grotesk, Inter and JetBrains Mono from Google
Fonts.
