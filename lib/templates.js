/**
 * The catalogue.
 *
 * Every template here is original work owned by this store — none of it is
 * repackaged from third-party open-source themes, which keeps resale clean.
 *
 * `checkoutUrl` is what turns a listing into a paid product. Leave it null and
 * the button serves the zip directly (useful for a free lead magnet); set it to
 * a Gumroad / Lemon Squeezy / Polar product URL and the button sends the buyer
 * there instead. Those platforms handle payment, VAT and file delivery, so the
 * store itself stays a static site with no backend.
 */

export const CURRENCY = "$";

export const TEMPLATES = [
  {
    slug: "helix-ai",
    name: "Helix",
    tagline: "AI SaaS landing page",
    blurb:
      "A cinematic dark landing page for an AI product, built around a hand-written WebGL particle hero and a self-playing product demo that walks through the software resolving a task.",
    audience: "AI startups, developer tools, technical SaaS",
    price: 79,
    tier: "premium",
    stack: ["Next.js 16", "React 19", "Tailwind v4", "three.js", "Framer Motion"],
    pages: 1,
    features: [
      "WebGL particle hero with custom GLSL shaders",
      "Self-playing product demo section",
      "Bento feature grid with cursor spotlights",
      "Scroll-driven timeline and animated counters",
      "Pricing toggle, animated FAQ, email capture",
      "SEO metadata, sitemap, JSON-LD",
    ],
    build: "npm install && npm run dev",
    checkoutUrl: null,
  },
  {
    slug: "vertex-launch",
    name: "Vertex Launch",
    tagline: "SaaS landing page",
    blurb:
      "A focused product launch page with a hand-drawn SVG app mockup, a how-it-works walkthrough, pricing and a changelog page. No build step, no dependencies.",
    audience: "SaaS founders, indie products, beta launches",
    price: 29,
    tier: "standard",
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
    checkoutUrl: null,
  },
  {
    slug: "aurora-commerce",
    name: "Aurora Commerce",
    tagline: "Small online store",
    blurb:
      "A four-page storefront with a product grid, a detail page with variant selection, an about page and a contact form. Wire it to any checkout you like.",
    audience: "Independent brands, makers, small retail",
    price: 29,
    tier: "standard",
    stack: ["HTML", "CSS", "Vanilla JS"],
    pages: 4,
    features: [
      "Product grid and detail page",
      "Variant and quantity selection",
      "Cart drawer held in local state",
      "About and contact pages",
      "Works with Stripe Payment Links or Snipcart",
    ],
    build: "Open index.html",
    checkoutUrl: null,
  },
  {
    slug: "sable-studio",
    name: "Sable Studio",
    tagline: "Agency / professional services",
    blurb:
      "A restrained four-page site for a studio or consultancy: work index, about, and a contact page that reads like a brief rather than a form.",
    audience: "Design studios, consultancies, freelancers",
    price: 29,
    tier: "standard",
    stack: ["HTML", "CSS", "Vanilla JS"],
    pages: 4,
    features: [
      "Case-study index and detail layout",
      "Team and capability sections",
      "Enquiry form with client-side validation",
      "Editorial typographic scale",
    ],
    build: "Open index.html",
    checkoutUrl: null,
  },
  {
    slug: "monolith-portfolio",
    name: "Monolith Portfolio",
    tagline: "Photography / design portfolio",
    blurb:
      "A gallery-first portfolio that puts the work on a black canvas and gets out of the way. Includes a case-study page and a contact page.",
    audience: "Photographers, designers, art directors",
    price: 29,
    tier: "standard",
    stack: ["HTML", "CSS", "Vanilla JS"],
    pages: 3,
    features: [
      "Full-bleed gallery grid",
      "Case-study layout with wide imagery",
      "Keyboard-navigable lightbox",
      "Dark, gallery-style presentation",
    ],
    build: "Open index.html",
    checkoutUrl: null,
  },
  {
    slug: "atelier-lookbook",
    name: "Atelier Lookbook",
    tagline: "Fashion / editorial",
    blurb:
      "An editorial lookbook with a seasonal landing page, a scrolling lookbook and a simple shop index. Built for brands that lead with imagery.",
    audience: "Fashion labels, editorial brands, stylists",
    price: 29,
    tier: "standard",
    stack: ["HTML", "CSS", "Vanilla JS"],
    pages: 3,
    features: [
      "Full-height editorial hero",
      "Scrolling lookbook sequence",
      "Shop index with price list",
      "Serif display typography",
    ],
    build: "Open index.html",
    checkoutUrl: null,
  },
  {
    slug: "quill-journal",
    name: "Quill Journal",
    tagline: "Blog / essays",
    blurb:
      "A reading-first blog with a proper typographic measure, an archive page and an article template that treats long-form text as the point.",
    audience: "Writers, newsletters, personal sites",
    price: 29,
    tier: "standard",
    stack: ["HTML", "CSS", "Vanilla JS"],
    pages: 3,
    features: [
      "Article layout tuned for reading length",
      "Archive index grouped by year",
      "Pull quotes, footnotes and code blocks",
      "Light and dark reading modes",
    ],
    build: "Open index.html",
    checkoutUrl: null,
  },
  {
    slug: "ember-table",
    name: "Ember Table",
    tagline: "Restaurant",
    blurb:
      "A restaurant site that answers the three questions people actually arrive with: what's on, when are you open, and how do I book.",
    audience: "Restaurants, cafés, bars",
    price: 29,
    tier: "standard",
    stack: ["HTML", "CSS", "Vanilla JS"],
    pages: 3,
    features: [
      "Menu page with course sections and dietary marks",
      "Booking form ready for OpenTable or Resy",
      "Opening hours and location block",
      "Warm, low-light palette",
    ],
    build: "Open index.html",
    checkoutUrl: null,
  },
  {
    slug: "pulse-fitness",
    name: "Pulse Fitness",
    tagline: "Gym / classes",
    blurb:
      "A gym site built around the timetable, because that's what members come back for. Includes a membership page with plan comparison.",
    audience: "Gyms, studios, class-based fitness",
    price: 29,
    tier: "standard",
    stack: ["HTML", "CSS", "Vanilla JS"],
    pages: 3,
    features: [
      "Filterable class timetable",
      "Membership tier comparison",
      "Trainer profiles",
      "Join flow with plan preselection",
    ],
    build: "Open index.html",
    checkoutUrl: null,
  },
];

export const BUNDLE = {
  slug: "everything",
  name: "The complete bundle",
  price: 149,
  checkoutUrl: null,
};

export function templateBySlug(slug) {
  return TEMPLATES.find((t) => t.slug === slug);
}

export const bundleSaving = () =>
  TEMPLATES.reduce((sum, t) => sum + t.price, 0) - BUNDLE.price;
