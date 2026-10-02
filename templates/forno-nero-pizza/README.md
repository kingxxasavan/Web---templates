# Forno Nero

A warm, photo-led site for a pizzeria or any takeaway that cooks to order:
live open/closed status, a menu with dietary filters and a slide-out basket,
a "build your own" page where the pizza is drawn live as toppings are added
(whole or half-and-half), a delivery-area checker, nightly deals, and a
checkout with collection or delivery, time slots and an order confirmation.

## Files

```
index.html       Hero, signature pizzas, the oven story, deals, delivery checker, reviews, visit
menu.html        Full menu in sections with vegetarian, vegan and gluten-free filters
order.html       Pizza builder with a live drawing, then the checkout
credits.html     Photo credits (keep this if you keep the photos)
assets/style.css All styling; theme tokens (colours, fonts) at the top
assets/app.js    Hours, basket, delivery zones, menu filters, builder and checkout
assets/img/      Photographs, plus credits.json
```

No build step. Open `index.html`, or upload the folder to any static host.

## Settings

At the top of `assets/app.js`:

- `HOURS`: opening hours, Sunday first (`null` is closed). They drive the
  status line, the hours list, the deal of the day and the order time slots.
- `COLLECT_MINS`, `DELIVER_MINS`: how long orders take.
- `ZONES`: delivery zones by the first half of the postcode, with fees in
  pence and an estimated time. `FREE_OVER` and `MIN_DELIVERY` set the free
  delivery threshold and the minimum delivery order.
- `MAX_TOPPINGS`: the most toppings the builder allows.

Times are worked out in UK time. Change `Europe/London` in `ukNow()` for
another country.

## Menu and prices

Each menu item carries its details as attributes, and the basket reads them:

```html
<div class="item" data-item="diavola" data-name="Diavola" data-price="1250" data-tags="hot gf">
```

Prices are in pence. `data-tags` drives the filters (`v`, `vg`, `gf`;
vegan dishes also count as vegetarian). Builder prices live on the size,
cheese and topping options as `data-price`; half toppings cost half.

## Taking orders and payment

The checkout validates and confirms but doesn't send the order anywhere yet.
Common routes:

- Send the form to your email or a kitchen printer with a form service
  (Formspree, Basin) or a small serverless function.
- Take payment with Stripe Checkout or Square Online, passing the basket
  total.
- Or keep the menu and builder and link "Place order" to your existing
  ordering system.

## Colours and fonts

Theme tokens are at the top of `assets/style.css`; the online editor changes
them for you. `--char` is the dark oven colour and `--ember` the orange glow.
Fonts are Fraunces and Work Sans from Google Fonts (SIL Open Font Licence).

## Photo credits

The photographs are licensed CC BY 2.0: you can use them commercially as long
as the photographers are credited, which `credits.html` does. Replace them
with photos of your own pizzas as soon as you can.

<!-- credits -->
- `assets/img/crust.jpg`: "Homemade pizza / crust" by James Cohen (https://www.flickr.com/photos/jcohen97/7637310620), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/diavola.jpg`: "Pizza - The food of the gods" by Joseph Nadler (https://www.flickr.com/photos/antijoe/3429024570), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/funghi.jpg`: "IMG_0485" by Jorge Mejía peralta (https://www.flickr.com/photos/mejiaperalta/6412598973), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/hero.jpg`: "Grimaldi's sausage pizza" by apasciuto (https://www.flickr.com/photos/apasciuto/8135781546), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/margherita.jpg`: "IMG_20120408_181206" by moedusa (https://www.flickr.com/photos/moedusa/7056941345), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/marinara.jpg`: "The pizza and wine diet" by cheeseslave (https://www.flickr.com/photos/ammichaels/10012172384), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/ortolana.jpg`: "Rekommenderar det här frukost/lunch-stället!" by Jonas Nordström (https://www.flickr.com/photos/windyjonas/19337283190), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/rucola.jpg`: "比較用画像 PowerShot G3X" by Tatsuo Yamashita (https://www.flickr.com/photos/yto/18815992169), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/salame.jpg`: "upload" by Kanesue (https://www.flickr.com/photos/36749444@N06/21448380403), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/salsiccia.jpg`: "Grimaldi's sausage pizza" by apasciuto (https://www.flickr.com/photos/apasciuto/8135781546), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/zucchine.jpg`: "Homemade pizza / crust" by James Cohen (https://www.flickr.com/photos/jcohen97/7637310620), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
<!-- /credits -->
