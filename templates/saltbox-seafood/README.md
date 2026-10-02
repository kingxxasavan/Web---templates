# Saltbox

A photo-led site for a seafood restaurant or oyster bar: today's catch, a
filterable menu, a booking flow with real time slots, and a private dining page
with packages and an enquiry form.

## Files

```
index.html       Hero, today's catch board, story, signature dishes, oyster list, visit
menu.html        Full menu with section tabs and gluten-free / vegetarian filters
book.html        Booking form: date, party size, time slots, seating, summary
visit.html       Hours, directions, private dining packages, enquiry form, FAQ
credits.html     Photo credits (keep this if you keep the photos)
assets/style.css All styling; theme tokens (colours, fonts) at the top
assets/app.js    Opening hours, menu filters, booking and enquiry forms
assets/img/      Photographs, plus credits.json
```

No build step. Open `index.html` in a browser, or upload the folder to any
static host.

## Opening hours

Hours live in the `HOURS` array at the top of `assets/app.js`:

```js
{ day: "Friday", open: 12, close: 23, text: "12 – 11pm" },
```

- `open` and `close` are decimal hours (17.5 is 5.30pm). `null` means closed.
- They drive the "Open now" line at the top of every page, the hours lists
  (today is highlighted) and the times offered in the booking form.

## The menu

Each dish is a list item in `menu.html`:

```html
<li class="menu-item" data-tags="gf">
  <h3>Whole lemon sole</h3><span class="price">£24</span>
  <p>Brown butter, capers, parsley.</p>
  <div class="tags"><span class="tag tag--gf">GF</span></div>
</li>
```

`data-tags` is what the filters read: `gf` for gluten-free, `v` for vegetarian.
The badges in `.tags` are what people see, so keep the two in step.

## Bookings

The booking form validates everything (date within twelve weeks and on an open
day, a time, name, email and phone) and shows a confirmation. Some times show
as fully booked: that's a repeatable demo pattern in the `taken` function in
`assets/app.js`. To take real bookings, either:

- point the form at a form service such as Formspree and handle bookings by
  email, or
- replace the form with your booking system's widget (OpenTable, Resy,
  ResDiary and SevenRooms all provide one) and keep the rest of the page.

## Colours and fonts

Everything is themed from the `:root` block at the top of `assets/style.css`.
`--accent` is the brass used for buttons; `--ink` is the navy. The online
editor changes these for you.

## Photo credits

The photographs are licensed CC BY 2.0, which means you can use them
commercially as long as the photographers are credited. `credits.html` (linked
in every footer) does that. If you replace a photo with your own, remove its
line from `credits.html`.

<!-- credits -->
- `assets/img/hero.jpg`: "Oysters" by Jules Morgan (https://www.flickr.com/photos/ladymissmarquise/5225310695), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/lobster.jpg`: "Marron" by Stephen Michael Barnett (https://www.flickr.com/photos/httpwwwflickrcomphotostopend/277033467), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/mussels.jpg`: "IMGP4258" by michael warren (https://www.flickr.com/photos/mikewarren/30428241), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/oysters.jpg`: "London - November, 2012" by Dan Perry (https://www.flickr.com/photos/golf_pictures/8225203284), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/rice.jpg`: "Paella" by Maria Keays (https://www.flickr.com/photos/maria_keays/5974027020), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/room.jpg`: "harmony-house-cafe-2" by hoskeebo (https://www.flickr.com/photos/hoskeebo/3792990794), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/salmon.jpg`: "DSCF4891" by Mr Thinktank (https://www.flickr.com/photos/tahini/8287577275), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/table.jpg`: "easter brunch" by thebittenword.com (https://www.flickr.com/photos/galant/2366410740), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/terrace.jpg`: "Wedding Decoration" by teodorpk (https://www.flickr.com/photos/71195941@N06/9231746279), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
<!-- /credits -->
