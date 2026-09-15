'use strict';

// The product catalogue. Every entry must have a matching directory in
// storefront-templates/<slug>/ — src/services/packager.js zips that directory
// when a buyer downloads, and tests/catalog.test.js asserts the pairing.
const config = require('../config');

const PRICE = config.store.templatePriceCents;

const templates = [
  {
    slug: 'aurora-commerce',
    name: 'Aurora Commerce',
    tagline: 'A storefront that makes a small catalogue look deliberate.',
    description:
      'A product-first storefront built for shops with ten to fifty items rather than ten thousand. Full-bleed hero, a grid that keeps product photography square and honest, a slide-over cart, and a checkout summary you can wire to Stripe in an afternoon. Filtering and cart state are plain JavaScript with no build step.',
    category: 'ecommerce',
    style: 'modern',
    selling: 'physical',
    animation: 'subtle',
    features: ['catalog', 'cart', 'filters', 'newsletter', 'responsive'],
    tech: ['HTML', 'CSS', 'JavaScript'],
    accent: '#5b5bd6',
    pages: 4,
    sort_order: 10,
  },
  {
    slug: 'monolith-portfolio',
    name: 'Monolith Portfolio',
    tagline: 'Dark, typographic, and out of the way of your work.',
    description:
      'A portfolio for people whose images should be the loudest thing on the page. Oversized type, a strict baseline grid, and a case-study layout that handles both a single hero image and a twelve-shot sequence. Ships with a light theme toggle that remembers the visitor’s choice.',
    category: 'portfolio',
    style: 'minimal',
    selling: 'none',
    animation: 'subtle',
    features: ['gallery', 'case-studies', 'dark-mode', 'contact-form', 'responsive'],
    tech: ['HTML', 'CSS', 'JavaScript'],
    accent: '#d6a45b',
    pages: 3,
    sort_order: 20,
  },
  {
    slug: 'vertex-launch',
    name: 'Vertex Launch',
    tagline: 'A SaaS landing page that argues for the product.',
    description:
      'Hero, proof, features, pricing, objection-handling FAQ — in the order that actually converts. Includes a monthly/annual pricing toggle, a comparison table that stays readable on a phone, and a waitlist form that posts to any endpoint you point it at.',
    category: 'saas',
    style: 'modern',
    selling: 'digital',
    animation: 'rich',
    features: ['pricing-table', 'faq', 'waitlist', 'testimonials', 'responsive'],
    tech: ['HTML', 'CSS', 'JavaScript'],
    accent: '#2f9e7f',
    pages: 2,
    sort_order: 30,
  },
  {
    slug: 'ember-table',
    name: 'Ember Table',
    tagline: 'Menu, hours, and a booking form that people finish.',
    description:
      'A restaurant site that answers the three questions every visitor has before they scroll: what is the food, when are you open, and can I get a table. The menu is a data file you edit rather than markup you fight, and the reservation form validates party size and date client-side.',
    category: 'restaurant',
    style: 'warm',
    selling: 'services',
    animation: 'subtle',
    features: ['menu', 'reservations', 'hours', 'map', 'gallery', 'responsive'],
    tech: ['HTML', 'CSS', 'JavaScript'],
    accent: '#c2542f',
    pages: 3,
    sort_order: 40,
  },
  {
    slug: 'sable-studio',
    name: 'Sable Studio',
    tagline: 'An agency site with room for real case studies.',
    description:
      'Services, process, team, and work — structured so a two-person studio and a twenty-person agency both fit. The process section is a numbered stepper, the services grid degrades to a single column cleanly, and there is a proper contact page rather than a mailto link.',
    category: 'business',
    style: 'professional',
    selling: 'services',
    animation: 'subtle',
    features: ['services', 'team', 'testimonials', 'contact-form', 'case-studies', 'responsive'],
    tech: ['HTML', 'CSS', 'JavaScript'],
    accent: '#3f6f8f',
    pages: 4,
    sort_order: 50,
  },
  {
    slug: 'quill-journal',
    name: 'Quill Journal',
    tagline: 'A reading experience, not a blog theme.',
    description:
      'Measure capped at 68 characters, a type scale that holds up at every heading level, pull quotes, footnotes, code blocks, and a tag index. Includes an article template with reading time and a newsletter block that does not cover the text.',
    category: 'blog',
    style: 'editorial',
    selling: 'none',
    animation: 'none',
    features: ['article-layout', 'tags', 'newsletter', 'search', 'responsive'],
    tech: ['HTML', 'CSS', 'JavaScript'],
    accent: '#8f5f3f',
    pages: 3,
    sort_order: 60,
  },
  {
    slug: 'atelier-lookbook',
    name: 'Atelier Lookbook',
    tagline: 'Editorial fashion layout with a horizontal lookbook.',
    description:
      'For a brand that sells a season rather than a SKU. Asymmetric editorial grid, a horizontally scrolling lookbook with keyboard and drag support, and a shop section that links out to whatever cart you already use.',
    category: 'ecommerce',
    style: 'bold',
    selling: 'physical',
    animation: 'rich',
    features: ['lookbook', 'gallery', 'catalog', 'newsletter', 'responsive'],
    tech: ['HTML', 'CSS', 'JavaScript'],
    accent: '#b03a6a',
    pages: 3,
    sort_order: 70,
  },
  {
    slug: 'pulse-fitness',
    name: 'Pulse Fitness',
    tagline: 'Class schedule, trainers, and membership tiers.',
    description:
      'Built around the weekly timetable, which is the page a gym site lives or dies on. Day-by-day schedule with filtering by class type, trainer profiles, three membership tiers, and a trial-signup form. High-contrast palette that survives a phone screen in a bright room.',
    category: 'business',
    style: 'bold',
    selling: 'services',
    animation: 'subtle',
    features: ['schedule', 'pricing-table', 'team', 'contact-form', 'responsive'],
    tech: ['HTML', 'CSS', 'JavaScript'],
    accent: '#d63f45',
    pages: 3,
    sort_order: 80,
  },
].map((t) => ({ ...t, price_cents: PRICE }));

const categories = [
  { key: 'ecommerce', label: 'Online store' },
  { key: 'portfolio', label: 'Portfolio' },
  { key: 'saas', label: 'SaaS / product' },
  { key: 'restaurant', label: 'Restaurant' },
  { key: 'business', label: 'Business / agency' },
  { key: 'blog', label: 'Blog' },
];

const styles = [
  { key: 'minimal', label: 'Minimal' },
  { key: 'modern', label: 'Modern' },
  { key: 'bold', label: 'Bold' },
  { key: 'editorial', label: 'Editorial' },
  { key: 'warm', label: 'Warm' },
  { key: 'professional', label: 'Professional' },
];

const featureLabels = {
  catalog: 'Product catalogue',
  cart: 'Cart',
  filters: 'Filtering',
  newsletter: 'Newsletter capture',
  gallery: 'Image gallery',
  'case-studies': 'Case studies',
  'dark-mode': 'Dark mode',
  'contact-form': 'Contact form',
  'pricing-table': 'Pricing table',
  faq: 'FAQ',
  waitlist: 'Waitlist',
  testimonials: 'Testimonials',
  menu: 'Menu',
  reservations: 'Reservations',
  hours: 'Opening hours',
  map: 'Map / location',
  services: 'Services',
  team: 'Team profiles',
  'article-layout': 'Long-form article layout',
  tags: 'Tag index',
  search: 'Search',
  lookbook: 'Lookbook',
  schedule: 'Class schedule',
  responsive: 'Responsive',
};

module.exports = { templates, categories, styles, featureLabels };
