/**
 * The catalogue. This is the source of truth for products — the database is
 * seeded from it on boot, so adding a template here is all it takes.
 *
 * Prices are in cents to keep money out of floating point.
 *
 * Every template is original work owned by this store. None of it is
 * repackaged from third-party open-source themes, so there is no upstream
 * licence for a buyer to comply with.
 */

export const TIERS = {
  starter: {
    id: "starter",
    name: "Starter",
    priceCents: 500,
    note: "Single-purpose sites, no build step",
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceCents: 1000,
    note: "Multi-page sites and app-grade builds",
  },
};

export const BUNDLE = {
  slug: "everything",
  name: "Complete bundle",
  tagline: "All nine templates",
  priceCents: 3500,
  blurb:
    "Every template in the store, plus anything added later, in one download. One payment, yours permanently.",
};

export const TEMPLATES = [
  {
    slug: "helix-ai",
    name: "Helix",
    tagline: "AI SaaS landing page",
    tier: "pro",
    blurb:
      "A cinematic dark landing page for an AI product, built around a hand-written WebGL particle hero and a self-playing product demo.",
    audience: "AI startups, developer tools, technical SaaS",
    stack: ["Next.js 16", "React 19", "Tailwind v4", "three.js", "Framer Motion"],
    pages: 1,
    features: [
      "WebGL particle hero with custom GLSL shaders",
      "Self-playing product demo section",
      "Bento feature grid with cursor spotlights",
      "Scroll-driven timeline and animated counters",
      "Pricing toggle, animated FAQ, email capture",
      "SEO metadata, sitemap and JSON-LD",
    ],
    build: "npm install && npm run dev",
  },
  {
    slug: "aurora-commerce",
    name: "Aurora Commerce",
    tagline: "Small online store",
    tier: "pro",
    blurb:
      "A four-page storefront with a product grid, a detail page with variant selection, an about page and a contact form.",
    audience: "Independent brands, makers, small retail",
    stack: ["HTML", "CSS", "Vanilla JS"],
    pages: 4,
    features: [
      "Product grid and detail page",
      "Variant and quantity selection",
      "Cart drawer held in local state",
      "About and contact pages",
      "Drops into Stripe Payment Links or Snipcart",
    ],
    build: "Open index.html",
  },
  {
    slug: "sable-studio",
    name: "Sable Studio",
    tagline: "Agency / professional services",
    tier: "pro",
    blurb:
      "A restrained four-page site for a studio or consultancy: work index, case study, about, and a contact page that reads like a brief.",
    audience: "Design studios, consultancies, freelancers",
    stack: ["HTML", "CSS", "Vanilla JS"],
    pages: 4,
    features: [
      "Case-study index and detail layout",
      "Team and capability sections",
      "Enquiry form with client-side validation",
      "Editorial typographic scale",
    ],
    build: "Open index.html",
  },
  {
    slug: "vertex-launch",
    name: "Vertex Launch",
    tagline: "SaaS landing page",
    tier: "starter",
    blurb:
      "A focused product launch page with a hand-drawn SVG app mockup, a how-it-works walkthrough, pricing and a changelog page.",
    audience: "SaaS founders, indie products, beta launches",
    stack: ["HTML", "CSS", "Vanilla JS"],
    pages: 2,
    features: [
      "Inline SVG product mockup — no screenshots to maintain",
      "Pricing table and FAQ",
      "Separate changelog page",
      "Scroll reveals with no library",
      "Responsive nav with accessible toggle",
    ],
    build: "Open index.html",
  },
  {
    slug: "monolith-portfolio",
    name: "Monolith Portfolio",
    tagline: "Photography / design portfolio",
    tier: "starter",
    blurb:
      "A gallery-first portfolio that puts the work on a black canvas and gets out of the way.",
    audience: "Photographers, designers, art directors",
    stack: ["HTML", "CSS", "Vanilla JS"],
    pages: 3,
    features: [
      "Full-bleed gallery grid",
      "Case-study layout with wide imagery",
      "Keyboard-navigable lightbox",
      "Dark, gallery-style presentation",
    ],
    build: "Open index.html",
  },
  {
    slug: "atelier-lookbook",
    name: "Atelier Lookbook",
    tagline: "Fashion / editorial",
    tier: "starter",
    blurb:
      "An editorial lookbook with a seasonal landing page, a scrolling lookbook and a simple shop index.",
    audience: "Fashion labels, editorial brands, stylists",
    stack: ["HTML", "CSS", "Vanilla JS"],
    pages: 3,
    features: [
      "Full-height editorial hero",
      "Scrolling lookbook sequence",
      "Shop index with price list",
      "Serif display typography",
    ],
    build: "Open index.html",
  },
  {
    slug: "quill-journal",
    name: "Quill Journal",
    tagline: "Blog / essays",
    tier: "starter",
    blurb:
      "A reading-first blog with a proper typographic measure, an archive page and an article template built for long-form text.",
    audience: "Writers, newsletters, personal sites",
    stack: ["HTML", "CSS", "Vanilla JS"],
    pages: 3,
    features: [
      "Article layout tuned for reading length",
      "Archive index grouped by year",
      "Pull quotes, footnotes and code blocks",
      "Light and dark reading modes",
    ],
    build: "Open index.html",
  },
  {
    slug: "ember-table",
    name: "Ember Table",
    tagline: "Restaurant",
    tier: "starter",
    blurb:
      "A restaurant site that answers the three questions people arrive with: what's on, when are you open, and how do I book.",
    audience: "Restaurants, cafés, bars",
    stack: ["HTML", "CSS", "Vanilla JS"],
    pages: 3,
    features: [
      "Menu page with course sections and dietary marks",
      "Booking form ready for OpenTable or Resy",
      "Opening hours and location block",
      "Warm, low-light palette",
    ],
    build: "Open index.html",
  },
  {
    slug: "pulse-fitness",
    name: "Pulse Fitness",
    tagline: "Gym / classes",
    tier: "starter",
    blurb:
      "A gym site built around the timetable, because that is what members come back for. Includes a membership comparison.",
    audience: "Gyms, studios, class-based fitness",
    stack: ["HTML", "CSS", "Vanilla JS"],
    pages: 3,
    features: [
      "Filterable class timetable",
      "Membership tier comparison",
      "Trainer profiles",
      "Join flow with plan preselection",
    ],
    build: "Open index.html",
  },
];

export function priceOf(template) {
  return TIERS[template.tier].priceCents;
}

export function bySlug(slug) {
  return TEMPLATES.find((t) => t.slug === slug) ?? null;
}

/** Guards every path that takes a slug from a request. */
export function isSellableSlug(slug) {
  return slug === BUNDLE.slug || TEMPLATES.some((t) => t.slug === slug);
}

export function priceOfSlug(slug) {
  if (slug === BUNDLE.slug) return BUNDLE.priceCents;
  const t = bySlug(slug);
  return t ? priceOf(t) : null;
}

export const money = (cents) =>
  `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;

export const individualTotal = () =>
  TEMPLATES.reduce((sum, t) => sum + priceOf(t), 0);
