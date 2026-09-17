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
    livePreview: false,
    pageList: [
      { file: "index", name: "Landing page", blurb: "Nine sections: WebGL hero, live product demo, bento features, scroll timeline, metrics, testimonials, pricing, FAQ and capture." },
    ],
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
    livePreview: true,
    pageList: [
      { file: "index.html", name: "Storefront", blurb: "Product grid, collection intro, and a delivery and guarantee strip.", try: "Filter the collection, then click a product to open it." },
      { file: "product.html", name: "Product detail", blurb: "Variant and quantity selection, spec table, and a cart drawer held in local state.", try: "Change the size, bump the quantity, and add it to the cart — the drawer keeps its own total." },
      { file: "about.html", name: "Our story", blurb: "Brand narrative laid out around process imagery.", try: "Scroll through — the imagery and copy alternate the whole way down." },
      { file: "contact.html", name: "Contact", blurb: "Enquiry form with client-side validation and studio details.", try: "Submit the form empty and watch the validation fire inline." },
    ],
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
    livePreview: true,
    pageList: [
      { file: "index.html", name: "Home", blurb: "Positioning statement, capabilities, and selected work.", try: "Follow any case study through to its write-up." },
      { file: "work.html", name: "Work", blurb: "Case-study index with filtering by discipline.", try: "Filter the index by discipline." },
      { file: "about.html", name: "Studio", blurb: "Team, process and credentials.", try: "Scroll the process section — each step reveals as it comes into view." },
      { file: "contact.html", name: "Contact", blurb: "Project brief form with validation and budget ranges.", try: "Pick a budget range and try submitting without a brief." },
    ],
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
    livePreview: true,
    pageList: [
      { file: "index.html", name: "Landing", blurb: "Hand-drawn SVG app mockup, how-it-works walkthrough, pricing table and FAQ.", try: "Open the FAQ items and compare the pricing tiers." },
      { file: "changelog.html", name: "Changelog", blurb: "Versioned release notes with type tags and dates.", try: "Each entry is tagged by release type and dated." },
    ],
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
    livePreview: true,
    pageList: [
      { file: "index.html", name: "Gallery", blurb: "Full-bleed grid with a keyboard-navigable lightbox.", try: "Click any frame to open the lightbox, then use the arrow keys." },
      { file: "case-study.html", name: "Case study", blurb: "Wide imagery interleaved with project narrative.", try: "Scroll — the wide plates break out of the text column." },
      { file: "contact.html", name: "Contact", blurb: "Commission enquiry form and current availability.", try: "The enquiry form validates before it will submit." },
    ],
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
    livePreview: true,
    pageList: [
      { file: "index.html", name: "Landing", blurb: "Seasonal hero, featured pieces and newsletter capture.", try: "Scroll down — sections fade up as they reach the viewport." },
      { file: "lookbook.html", name: "Lookbook", blurb: "Full-bleed scrolling editorial sequence.", try: "Drag the rail sideways, or use the arrows. It tracks progress as you go." },
      { file: "shop.html", name: "Shop", blurb: "Price list grid with sizes and availability.", try: "Sizes and availability are per piece." },
    ],
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
    livePreview: true,
    pageList: [
      { file: "index.html", name: "Journal", blurb: "Essay index with reading times and excerpts.", try: "Use the search — it filters the index live and tells you when nothing matches." },
      { file: "article.html", name: "Article", blurb: "Long-form layout with pull quotes, footnotes and code blocks.", try: "Reading time is calculated from the copy. Try the light and dark modes." },
      { file: "archive.html", name: "Archive", blurb: "Complete index grouped by year.", try: "Everything grouped by year, with counts." },
    ],
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
    livePreview: true,
    pageList: [
      { file: "index.html", name: "Home", blurb: "Hero, opening hours, location and booking prompt.", try: "The opening-hours block works out whether it's open right now." },
      { file: "menu.html", name: "Menu", blurb: "Course sections with prices and dietary marks.", try: "Switch between courses — dietary marks travel with each dish." },
      { file: "book.html", name: "Booking", blurb: "Date, time and covers form, ready for OpenTable or Resy.", try: "Pick a date and party size; the form validates before it will send." },
    ],
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
    livePreview: true,
    pageList: [
      { file: "index.html", name: "Home", blurb: "Hero, class categories and trainer profiles.", try: "It works out the next class starting today." },
      { file: "timetable.html", name: "Timetable", blurb: "Filterable weekly schedule by class type and time.", try: "Switch days and filter by class type." },
      { file: "join.html", name: "Membership", blurb: "Plan comparison feeding a preselected join flow.", try: "Pick a plan — it carries straight into the trial form." },
    ],
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

/** Pages a template ships, for the walkthrough and the listing meta. */
export function pageCount(template) {
  return template.pageList?.length ?? template.pages ?? 1;
}

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
