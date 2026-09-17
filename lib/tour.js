import { TEMPLATES, TIERS, pageCount } from "./catalog.js";

/**
 * The first-visit walk-through runs inside a real template, which the visitor
 * can actually use — click links, open the cart, filter, submit forms. The
 * guide follows along rather than driving, so it never gets in the way of the
 * thing it is trying to show off.
 *
 * A template is chosen at random per visit, so the tour isn't the same demo
 * every time and no single build carries the whole impression.
 */

/** Every template that can run in a frame, shaped for the tour. */
export function tourPool() {
  return TEMPLATES.filter((t) => t.livePreview).map((t) => ({
    slug: t.slug,
    name: t.name,
    tagline: t.tagline,
    audience: t.audience,
    pages: pageCount(t),
    priceCents: TIERS[t.tier].priceCents,
    stops: t.pageList.map((p) => ({
      file: p.file,
      name: p.name,
      blurb: p.blurb,
      try: p.try ?? null,
    })),
  }));
}

/** Thumbnails and prices for the rotating proof shown at the reveal. */
export function showcase() {
  return TEMPLATES.map((t) => ({
    slug: t.slug,
    name: t.name,
    tagline: t.tagline,
    priceCents: TIERS[t.tier].priceCents,
  }));
}
