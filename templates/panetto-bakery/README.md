# Panetto

A warm, photo-led site for a bakery or café that takes orders for collection:
a product list with categories and a basket, pickup by shop, day and time, a
celebration-cake order form that prices itself, and two shop pages with live
opening hours.

## Files

```
index.html       Hero collage, bake times, bestsellers, story, cakes, reviews, shops
order.html       Order ahead: categories, products, basket, pickup shop/day/time
cakes.html       Celebration cake builder: size, flavour, extras, message, live price
visit.html       Both bakeries with hours, the bakers, wholesale enquiry, FAQ
credits.html     Photo credits (keep this if you keep the photos)
assets/style.css All styling; theme tokens (colours, fonts) at the top
assets/app.js    Hours, basket, pickup times, cake pricing and forms
assets/img/      Photographs, plus credits.json
```

No build step. Open `index.html`, or upload the folder to any static host.

## Opening hours

At the top of `assets/app.js`, one line per shop, Sunday first:

```js
"Market Street": [[8, 14], [null], [7.5, 17], …],
```

Each pair is open and close in decimal hours (7.5 is 7.30am); `[null]` is a
closed day. These drive the "Open now" pills, the hours lists, the pickup days
offered (closed days are skipped) and the pickup times. If you rename a shop,
rename it in the `<select>` options and the `data-shop` attributes too.

## Products and prices

Products on `order.html` are plain HTML:

```html
<article class="product" data-product="focaccia" data-type="bread"
         data-name="Rosemary focaccia" data-price="420">
```

- `data-price` is in pence (420 is £4.20). Keep the price you show in step.
- `data-type` is the category tab it appears under (`bread`, `pastry`,
  `sweet`, `coffee`); add a tab button with a matching `data-cat` for a new one.
- "Add" buttons anywhere on the site (the home page has three) use
  `data-add` with the same id, and fill the same basket.

The basket is saved in the visitor's browser, so it survives page changes.

## Taking orders for real

The order form validates and confirms but doesn't send anything. Two easy
routes:

- Point the form at a form service (Formspree, Basin, Netlify Forms) and
  include the basket in a hidden field, so orders arrive by email.
- Or keep the pages and swap the basket for your online-ordering provider's
  link or widget (Square, Shopify, Toast and others provide one).

## Cakes

Sizes, flavours and extras are radio buttons and checkboxes in `cakes.html`.
Prices come from `data-price` (sizes) and `data-extra` (everything else), in
pence. The form insists on three days' notice; change that in the `cakes`
section of `assets/app.js`.

## Photo credits

The photographs are licensed CC BY 2.0: you can use them commercially as long
as the photographers are credited. `credits.html`, linked in every footer,
does that. Swap in photos of your own bakes whenever you can.

<!-- credits -->
- `assets/img/almond.jpg`: "Almond croissant" by Faruk Ateş (https://www.flickr.com/photos/kurafire/8231372179), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/box.jpg`: "croissant surprise bday cake-8" by jules (https://www.flickr.com/photos/stone-soup/7919499446), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/buns.jpg`: "Making caramel apple cinnamon rolls" by Joy (https://www.flickr.com/photos/joyosity/15519385738), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/cake.jpg`: "Mocha cake" by helen (https://www.flickr.com/photos/afeitar/7400308394), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/coffee.jpg`: "I kinda want one of these now." by Madison Scott-Clary (https://www.flickr.com/photos/ranna/396224618), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/counter.jpg`: "Small Victory baked goods" by Ian Irving (https://www.flickr.com/photos/falsepositives/16530695258), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/croissants.jpg`: "Breakfast at Escriba III" by Wenjie, Zhang  | A Certain Slant of Light (https://www.flickr.com/photos/z_wenjie/5730494228), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/focaccia.jpg`: "Focaccia dois sabores: alecrim com sal grosso e parmesão com pimenta calabresa e manjericão" by Leo Rey (https://www.flickr.com/photos/leorey/15104969030), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/latte.jpg`: "Flat white coffee at Axil Coffee in Hawthorn" by Katherine Lim (https://www.flickr.com/photos/ultrakml/17350959312), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/loaves.jpg`: "bread" by Richard (https://www.flickr.com/photos/dipfan/108057945), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/pain-au-chocolat.jpg`: "pain au chocolat" by Barbara  Samuel (https://www.flickr.com/photos/60255232@N00/4533917238), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/pastries.jpg`: "Fresh Pastries" by Arnold Gatilao (https://www.flickr.com/photos/arndog/2152972259), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/rolls.jpg`: "P1000516" by Serene Vannoy (https://www.flickr.com/photos/serenejournal/6082099350), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/seeded.jpg`: "#almond #croissant #schubert #sanfrancisco" by Mighty Travels (https://www.flickr.com/photos/96223380@N02/12727067044), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/sticky-bun.jpg`: "Flour Bakery Sticky Bun" by snowpea&amp;bokchoi (https://www.flickr.com/photos/bokchoi-snowpea/4558130864), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/tarts.jpg`: "Slightly Bigger than Mini Fruit Tarts" by Vera Yu and David Li (https://www.flickr.com/photos/yummy-porky/4153488300), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
<!-- /credits -->
