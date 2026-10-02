# Wren & Calloway

A polished website for a law firm or any professional practice that sells
expertise and trust: a hero with a "what do you need help with?" finder and
the next free call slot, practice areas, fixed-fee messaging, an instant
conveyancing quote with a Stamp Duty calculator, a practice-area page with a
step-by-step timeline, fees and a callback form, and a page for booking a
free first call with a solicitor.

## Files

```
index.html       Hero and finder, practice areas, fixed fees, quick quote, steps, people, reviews
practice.html    One practice area (family law): help, timeline, fee table, FAQ, callback form
quote.html       Conveyancing quote: legal fee, third-party costs and Stamp Duty, live
contact.html     Book a free call (day, time and solicitor), offices with live opening hours
credits.html     Photo credits (keep this if you keep the photos)
assets/style.css All styling; theme tokens (colours, fonts) at the top
assets/app.js    Hours, call slots, finder, quote and SDLT maths, booking and forms
assets/img/      Photographs, plus credits.json
```

No build step. Open `index.html`, or upload the folder to any static host.

## Settings

Everything you're likely to change is at the top of `assets/app.js`:

- `HOURS`: opening hours for each office (Sunday first, `null` is closed).
  They drive the open/closed status in the footer and on the contact page.
- `CALLS_FROM`, `CALLS_TO`: the hours when free first calls can be booked.
- `PEOPLE`: the solicitors who can be booked by name.
- `BUY_FEE`, `SELL_FEE`, `EXTRAS`: your conveyancing fees, before VAT.
- `SEARCHES`, `LAND_REGISTRY`, `LEASE_PACK` and friends: third-party costs.
- `SDLT`, `SDLT_FTB`, `FTB_LIMIT`, `SURCHARGE`: Stamp Duty Land Tax for England
  and Northern Ireland, as of 1 April 2025. **Check these against GOV.UK
  before you publish, and whenever the rates change.**

Times are always worked out in UK time, wherever the visitor is.

## More practice areas

`practice.html` is the family law page. Copy it for each area you want to
give a full page, then point the matching card on the home page and the
finder option at it. Until then, those cards open the booking page with the
right matter already selected (for example `contact.html?matter=wills`).
`contact.html?to=helen` pre-selects a solicitor.

## Forms

The callback, quote and booking forms check their fields and show a
confirmation, but don't send anything yet. Give each form an `action` from a
form service (Formspree, Basin, Netlify Forms) or connect the booking page
to a scheduling tool such as Calendly or Microsoft Bookings.

## Regulatory text

The footer carries placeholder SRA and company details. Replace them with
yours: firms regulated by the SRA must show their SRA number, the SRA's
clickable digital badge, and price and service information for the services
covered by the transparency rules.

## Colours and fonts

Theme tokens are at the top of `assets/style.css`; the online editor changes
them for you. `--brass` is the gold used for rules and small highlights.
Fonts are Cormorant Garamond and Manrope from Google Fonts (SIL Open Font
Licence).

## Photo credits

The photographs are licensed CC BY 2.0: you can use them commercially as long
as the photographers are credited, which `credits.html` does. Replace them
with photos of your own offices and team as soon as you can.

<!-- credits -->
- `assets/img/columns.jpg`: "2012-06-15_1339783683" by Chris Dlugosz (https://www.flickr.com/photos/chrisdlugosz/7845334454/), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/door.jpg`: "DSCN9089.JPG" by bDom - artiste - www.bdom.info (https://www.flickr.com/photos/bdom/2054827904), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/library.jpg`: "89/365 - F. Supp. - 3/30/2010" by jkbeitz (https://www.flickr.com/photos/jkbeitz/4477190079), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/office.jpg`: "033" by monkeywing (https://www.flickr.com/photos/colinsite/3724891458), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
<!-- /credits -->
