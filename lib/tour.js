import { TEMPLATES, TIERS, bySlug, pageCount } from "./catalog.js";

/**
 * The guided walk-through shown on a first visit. It runs inside a real
 * template so the reveal at the end lands — the visitor has genuinely been
 * using the product, not looking at a picture of it.
 */
const TOUR_SLUG = "aurora-commerce";

const STEPS = [
  {
    file: "index.html",
    name: "The shop",
    copy: "Take a look around. This is a live site — real markup, real styles, real JavaScript running in your browser right now.",
  },
  {
    file: "product.html",
    name: "A product page",
    copy: "Variant and quantity selection, a spec table, and a cart drawer that holds its own state. No framework, no build step.",
  },
  {
    file: "about.html",
    name: "The brand story",
    copy: "The pages nobody enjoys building are already here, typeset properly and ready for your own words.",
  },
  {
    file: "contact.html",
    name: "Contact",
    copy: "A contact form with client-side validation, waiting for whichever backend you prefer — Formspree, Netlify, your own endpoint.",
  },
];

export function tourConfig() {
  const t = bySlug(TOUR_SLUG);
  return {
    slug: t.slug,
    name: t.name,
    pages: pageCount(t),
    priceCents: TIERS[t.tier].priceCents,
    steps: STEPS,
  };
}

/** The other templates, for the rotating proof at the reveal. */
export function showcase() {
  return TEMPLATES.filter((t) => t.slug !== TOUR_SLUG).map((t) => ({
    slug: t.slug,
    name: t.name,
    tagline: t.tagline,
    priceCents: TIERS[t.tier].priceCents,
  }));
}
