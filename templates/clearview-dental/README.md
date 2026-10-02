# Clearview

A calm, modern site for a dental practice, clinic or any appointment-based
health business: services with prices, a first-visit walkthrough, team, live
opening hours, a treatments page with tabs, a membership plan and a 0% finance
calculator, and a step-by-step online booking page.

## Files

```
index.html       Hero, services, first visit, team, reviews, hours and map
treatments.html  Price list in tabs, membership plan, finance calculator, FAQ
book.html        Booking: treatment, clinician, day, time, patient details, summary
assets/style.css All styling; theme tokens (colours, fonts) at the top
assets/app.js    Hours, open-now status, price tabs, calculator and booking
```

No build step and no photographs to replace: the artwork is drawn in SVG and
the team uses monogram portraits, so it looks finished on day one. Add photos
whenever you have them.

## Opening hours

At the top of `assets/app.js`, Sunday first:

```js
var HOURS = [null, [8, 18], [8, 20], [8, 18], [8, 20], [8, 17], [9, 13]];
```

`null` is closed. These drive the hours list (today is highlighted), the
open-now status and the days and times offered in the booking form.

## Booking

Treatments are radio buttons in `book.html`. `data-mins` sets how long the
appointment is (so a 45-minute exam won't be offered ten minutes before
closing) and `data-price` is what the summary shows. Some times show as taken:
that's a repeatable demo pattern in the `busy` function in `assets/app.js`.

To take real bookings, replace the form with your practice-management
system's booking widget (Dentally, Software of Excellence, Calendly and most
others provide one), or point the form at a form service to receive requests
by email.

## Prices

The price list in `treatments.html` is plain HTML grouped into tabs. Each row
is a `.price-row` with a name, a price and a short description.

## Colours and fonts

Theme tokens are at the top of `assets/style.css`; the online editor changes
them for you. `--peach` and `--mint` are the soft supporting colours.
