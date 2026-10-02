# Hollis Gray

A dark, image-first portfolio for a landscape, travel or fine-art
photographer: a full-screen slideshow, series, a masonry gallery with filters
and a keyboard-friendly viewer, a print shop with sizes and an order form, and
an about page with workshops and a commissions form.

## Files

```
index.html       Full-screen slideshow, statement, series, prints, press, contact
work.html        Masonry gallery, filter by series, full-screen viewer
prints.html      Limited-edition prints with sizes, order summary, delivery form
about.html       About, workshop dates with places left, commissions form
credits.html     Photo credits for the demo photographs
assets/style.css All styling; theme tokens (colours, fonts) at the top
assets/app.js    Slideshow, filters, viewer, print order and forms
assets/img/      Photographs, plus credits.json
```

No build step. Open `index.html`, or upload the folder to any static host.

## Your photographs

The demo photographs are by other photographers (see below). Replace them
with your own: keep the file names, or update the `src` in the HTML.

- Gallery images (`work.html`) look best around 1600–2400px on the long edge.
  Each `<figure class="shot">` has `data-in` set to its series key
  (`highlands`, `coast`, `peaks`, `water`); the filter buttons use the same
  keys and count their photographs automatically.
- The title and caption in each `<figcaption>` appear on hover and in the
  viewer.
- The home page slideshow uses the four `hero__slide` blocks; the caption under
  the headline comes from each slide's `data-caption`.

Once every demo photo is replaced you can delete `credits.html` and its footer
link.

## Prints

Sizes and prices are set once, at the top of `assets/app.js`:

```js
var SIZES = { "A3 · 42 × 30 cm": 95, "A2 · 59 × 42 cm": 160, "A1 · 84 × 59 cm": 290 };
```

Every print offers every size. The order is kept in the visitor's browser and
summarised in the panel at the bottom right. The delivery form validates and
confirms; connect it to Formspree or similar, or link each print to a Stripe
Payment Link instead.

## Colours and fonts

Theme tokens are at the top of `assets/style.css`; the online editor changes
them for you. The type is Bodoni Moda and Karla from Google Fonts.

## Photo credits

The demo photographs are licensed CC BY 2.0. If you publish the template with
any of them still in place, keep `credits.html` linked.

<!-- credits -->
- `assets/img/c1.jpg`: "coast" by francois schnell (https://www.flickr.com/photos/frenchy/27149112), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/c2.jpg`: "waves crash" by Janine (https://www.flickr.com/photos/geishabot/2203555282), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/c3.jpg`: "高雄" by othree (https://www.flickr.com/photos/othree/10577243693), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/c4.jpg`: "Pissouri bay" by senza senso (https://www.flickr.com/photos/mesec/16902712132), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/c5.jpg`: "Untitled" by Sébastien Bertrand (https://www.flickr.com/photos/tiseb/11642346376), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/cover-coast.jpg`: "高雄" by othree (https://www.flickr.com/photos/othree/10577243693), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/cover-highlands.jpg`: "Glen Etive, Scotland" by Loren Kerns (https://www.flickr.com/photos/lorenkerns/19306687846), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/cover-peaks.jpg`: "Iezer lake on a late autumn afternoon" by Horia Varlan (https://www.flickr.com/photos/horiavarlan/5287329233), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/cover-water.jpg`: "Seven Sisters Falls" by Mary Witzig (https://www.flickr.com/photos/marywitzig/7529048286), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/h1.jpg`: "Shark" by john mcsporran (https://www.flickr.com/photos/127130111@N06/16789909464), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/h2.jpg`: "Glen Etive, Scotland" by Loren Kerns (https://www.flickr.com/photos/lorenkerns/19306687846), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/h3.jpg`: "Low ceiling" by Martin Skøtt (https://www.flickr.com/photos/skoett/3957521862), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/h4.jpg`: "Ben Nevis a lo lejos" by Francisco Gonzalez (https://www.flickr.com/photos/franciscojgonzalez/6258261513), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/h5.jpg`: "Highest natural lake in world" by Greg Walters (https://www.flickr.com/photos/gregwalters/294452512), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/h6.jpg`: "Siruvani Dam(4)" by Basheer Olakara (https://www.flickr.com/photos/olakara/3169484185), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/hero-c1.jpg`: "coast" by francois schnell (https://www.flickr.com/photos/frenchy/27149112), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/hero-h1.jpg`: "Shark" by john mcsporran (https://www.flickr.com/photos/127130111@N06/16789909464), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/hero-h5.jpg`: "Highest natural lake in world" by Greg Walters (https://www.flickr.com/photos/gregwalters/294452512), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/hero-p3.jpg`: "The Half Dome" by Vinay Kumar (https://www.flickr.com/photos/vinaykr/2740991272/), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/p1.jpg`: "Scotland" by AwayWeGo210 (https://www.flickr.com/photos/awaywego210/14323274594), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/p2.jpg`: "Iezer lake on a late autumn afternoon" by Horia Varlan (https://www.flickr.com/photos/horiavarlan/5287329233), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/p3.jpg`: "The Half Dome" by Vinay Kumar (https://www.flickr.com/photos/vinaykr/2740991272/), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/p4.jpg`: "Skaftafell National Park" by The Conservation Volunteers (https://www.flickr.com/photos/btcvphotocomp/5203517899), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/p5.jpg`: "2005-07-25 12-35-12 PM-251" by Warren Long (https://www.flickr.com/photos/warrenlong/474874597), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/p6.jpg`: "Laguna Verde (Green Lake)" by Valdiney Pimenta (https://www.flickr.com/photos/valdiney/1351664491), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/w1.jpg`: "Tiny Stream" by Cheryl Northey (https://www.flickr.com/photos/attentiongetter/7675383354), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/w2.jpg`: "Seven Sisters Falls" by Mary Witzig (https://www.flickr.com/photos/marywitzig/7529048286), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
- `assets/img/w3.jpg`: "Along the waterways south of Guildford" by Alistair Young (https://www.flickr.com/photos/ajy/476555606), CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/). Cropped, resized and colour-adjusted.
<!-- /credits -->
