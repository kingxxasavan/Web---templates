# Ada & Tom

A romantic, airy wedding website: names and date with a live countdown, your
story, the day's timeline, the venue, a registry, an RSVP that collects a meal
choice for every guest, FAQs, and a travel page with places to stay.

## Files

```
index.html       Countdown, story, timeline, venue, registry, RSVP, FAQ
travel.html      Getting there, rooms held for guests, the day after
credits.html     Photo credits (keep this if you keep the photos)
assets/style.css All styling; theme tokens (colours, fonts) at the top
assets/app.js    Countdown, RSVP form with guests and meals
assets/img/      Photographs, plus credits.json
```

No build step. Open `index.html`, or upload the folder to any static host.

## Make it yours

Three settings at the top of `assets/app.js`:

```js
var WEDDING = new Date("2027-06-19T14:00:00+01:00");
var RSVP_BY = new Date("2027-04-30T23:59:00+01:00");
var MEALS = ["Roast chicken, tarragon", "Hake, brown shrimp butter", …];
```

- `WEDDING` drives the countdown.
- `RSVP_BY` fills in every "reply by" date, and closes the form after it.
- `MEALS` is the list each guest chooses from.

Everything else (names, story, timeline, hotels) is plain text in the HTML.
Your initials in the header are in the `.mono` link.

## Receiving replies

The RSVP validates and thanks the guest but doesn't send anything yet. The
easiest way to collect replies is a free form service: create a form at
Formspree (or Netlify Forms if you host there), add its address as the form's
`action`, and remove `e.preventDefault()` from the submit handler. Every guest
row is sent as `guest` with its meal.

## Colours and fonts

Theme tokens are at the top of `assets/style.css`; the online editor changes
them for you. `--sage` is the secondary green used for small labels.

## Photo credits

The photographs are licensed CC BY 2.0: you can use them as long as the
photographers are credited, which `credits.html` does. Most couples swap in
their own engagement photos.

<!-- credits -->
- `assets/img/hall.jpg`: "Goodwood House wedding venue - 35" by Jonathan Day (https://www.flickr.com/photos/wedding-photography-by-jonathan-day/3533861608), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/hero.jpg`: "Lauren's Arrangement for Sisterhood Conference" by Matt Wiebe (https://www.flickr.com/photos/mattwieve/13917318906), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/peonies.jpg`: "Every messing cutting table deserves a beautiful bouquet of peonies right?  #lovespring #peonies" by Trilliumdesign ~ Caroline (https://www.flickr.com/photos/trilliumdesign/14192894296), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/rings.jpg`: "Untitled" by Droid Gingerbread (https://www.flickr.com/photos/63259711@N04/6042572149), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/stay-1.jpg`: "lavender" by Cheryl Brind (https://www.flickr.com/photos/volantra/4790508727), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/stay-2.jpg`: "Beautiful Roses" by Raphael Love (https://www.flickr.com/photos/raphaellove/8474422989), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/stay-3.jpg`: "Narthex" by St.John&#x27;sFlowerGuild (https://www.flickr.com/photos/st_johns_flowers/3510876889/), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
<!-- /credits -->
