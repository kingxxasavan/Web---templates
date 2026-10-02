# Loose Threads

A bold, friendly website for a podcast: a hero for the newest episode, a
searchable and filterable episode list, a sticky audio player with skip,
speed and seeking that remembers where people stopped, an episode page with
show notes, clickable chapters and a searchable transcript that follows the
audio, and a membership page with tiers, monthly or yearly billing and a
sponsorship enquiry form.

## Files

```
index.html       Latest episode, stats, all episodes, start here, hosts, reviews, newsletter
episode.html     One episode: show notes, chapters, transcript, share links
support.html     Membership tiers, join form, sponsorship and audience, FAQ
assets/style.css All styling; theme tokens (colours, fonts) at the top
assets/app.js    Player, episode search and filters, transcript, tabs, forms
```

No build step. The episode artwork is drawn in SVG; replace it with your own
cover art any time.

## Adding your audio

Every episode element carries its details as attributes, and the player reads
them:

```html
<li class="ep" data-ep="48" data-title="The last bell foundry in town"
    data-sub="Ep. 48 · Agnes Thorne" data-duration="2874"
    data-audio="assets/audio/episode-48.mp3" ...>
```

- `data-audio` is the MP3. Put files in `assets/audio/`, or paste the direct
  file URL your podcast host gives you (Buzzsprout, Transistor, Captivate and
  others all provide one).
- `data-duration` is in seconds. Once the real file loads, the player uses
  its true length.

Until an audio file exists, the player runs in **preview mode** (a small
"Preview" badge appears) and simulates playback, so you can see everything
working. As soon as the MP3 is there, it plays for real.

## Episode pages

`episode.html` is the page for one episode. Copy it for each episode you want
to give a full page, and link the episode titles to the copies.

- Chapters and transcript lines have `data-t`, the start time in seconds.
  Clicking a time plays from there, and the current line is highlighted as
  the episode plays.
- "Copy link at current time" adds `#t=21:30` to the address; anyone opening
  that link gets the player ready at that moment.

## Episode list

`data-topic` matches the topic chips (`craft`, `food`, `design`, `industry`).
Episodes with the class `is-more` stay hidden until "Show older episodes" is
pressed, or until someone searches or filters.

## Memberships and forms

Tier prices live in `data-price` (monthly, in pounds). `MONTHS_PER_YEAR` at
the top of `assets/app.js` sets the yearly price (10 means two months free).
The forms check their fields and confirm, but don't send anything yet:

- Memberships: point "Continue to payment" at Stripe Payment Links,
  Memberful, Supercast or Patreon.
- Newsletter: use the form code from Buttondown, Mailchimp or ConvertKit.
- Media kit: give the form an `action` from Formspree, Basin or Netlify Forms.

## Colours and fonts

Theme tokens are at the top of `assets/style.css`; the online editor changes
them for you. `--teal`, `--mustard` and `--pink` are the supporting colours.
Fonts are Bricolage Grotesque and Figtree from Google Fonts (SIL Open Font
Licence).
