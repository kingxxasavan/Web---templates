# Keyline

An elegant site for an independent estate or letting agent: a search panel on
the home page, a results page with real filters and saved homes, a property
page with a photo gallery, floorplan and mortgage calculator, and a two-step
valuation request.

## Files

```
index.html       Hero with search, new listings, services, numbers, why us, review
listings.html    Buy/rent toggle, area, bedrooms, max price, type, saved-only, sort
property.html    Gallery with lightbox, key facts, features, floorplan, viewing form,
                 mortgage calculator, similar homes
valuation.html   Two-step valuation form, fees table, FAQ
credits.html     Photo credits (keep this if you keep the photos)
assets/style.css All styling; theme tokens (colours, fonts) at the top
assets/app.js    Search, filters, saved homes, gallery, calculator and forms
assets/img/      Photographs, plus credits.json
```

No build step. Open `index.html`, or upload the folder to any static host.

## Listings

Each home on `listings.html` is one `<article>` whose data attributes drive
the filters:

```html
<article class="listing" data-listing="ivy-cottage" data-mode="buy"
         data-area="Cirencester" data-price="675000" data-beds="3"
         data-kind="cottage" data-order="1">
```

- `data-mode` is `buy` or `rent`; rent prices are per calendar month.
- `data-area` must match an option in the Area filter (and the home page search).
- `data-kind` is one of the Type checkboxes: `house`, `cottage`, `barn`, `apartment`.
- `data-order` sets "Newest first".
- `data-listing` must be unique: it's how saved homes are remembered (in the
  visitor's browser, under the key `keyline-saved`).

The text inside the card (price, title, place, beds) is what people see, so
keep it in step with the attributes.

For more than a few dozen homes, most agents feed listings from their CRM or a
portal feed; the card markup here is a good target for that.

## Property pages

`property.html` is a complete example for one home. Copy it for each property
you want a full page for, and change the photos, facts, description and
floorplan. The gallery opens any image with `data-shot` in the lightbox, with
arrow keys to move between photos.

The mortgage calculator is a standard repayment calculation and is for
guidance only.

## Forms

The viewing, valuation and contact forms validate and confirm on the page.
Point them at your CRM's web-form endpoint or a form service such as Formspree
to receive enquiries by email.

## Colours and fonts

Theme tokens are at the top of `assets/style.css`; the online editor changes
them for you. `--gold` is used for fine rules and details.

## Photo credits

The photographs are licensed CC BY 2.0: you can use them commercially as long
as the photographers are credited, which `credits.html` does. Replace them with
your own listing photography.

<!-- credits -->
- `assets/img/apartment.jpg`: "廚房、餐廳" by 銀背猩猩 (https://www.flickr.com/photos/12312724@N05/4148593285), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/barn.jpg`: "Cabin-53" by twintiger007 (https://www.flickr.com/photos/51792270@N03/21244113908), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/bedroom.jpg`: "NIKON D60 part 3 of 11-13.jpg" by Cláudio Franco (https://www.flickr.com/photos/claudiof/3942882452/), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/cottage.jpg`: "Cottswald Cottage" by Scott Calleja (https://www.flickr.com/photos/scottcalleja/5088707280), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/georgian.jpg`: "Col Alto, Lexington, Virginia" by Sarah Stierch (https://www.flickr.com/photos/sarahvain/5846006949), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/hero.jpg`: "Cottswald Cottage" by Scott Calleja (https://www.flickr.com/photos/scottcalleja/5088707280), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/kitchen.jpg`: "Kitchen" by John Buie (https://www.flickr.com/photos/bumeister/20977094702), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/living.jpg`: "test" by jinkazamah (https://www.flickr.com/photos/jinkazamah/2925764125), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/park-row.jpg`: "DSCN9089.JPG" by bDom - artiste - www.bdom.info (https://www.flickr.com/photos/bdom/2054827904), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/rectory.jpg`: "amer0152" by NOAA Photo Library (https://www.flickr.com/photos/noaaphotolib/9715913097), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/stone-barn.jpg`: "Ennenda Alp Begligen, Gemeinde Glarus" by Glarus (https://www.flickr.com/photos/glarus/19382646200), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/stove.jpg`: "2012-12-30 16.54.58" by cleverclevergirl (https://www.flickr.com/photos/cleverclevergirl/8328184688), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
<!-- /credits -->
