/**
 * The building blocks of the Made-for-you brief wizard: the kinds of business
 * we build for, the pages each usually needs, colour palettes, and how a
 * finished brief reads. Pure data and functions, shared by the wizard in the
 * browser and the API that checks a submitted brief.
 */

export const BUSINESS_TYPES = [
  { id: "store", label: "Online store", category: "E-commerce", words: ["shop", "store", "product", "fashion", "skincare", "coffee"], pages: [["Home", "Featured products, a strong hero and what makes you different"], ["Shop", "All products with filters and prices"], ["Product", "Photos, sizes, price and add to cart"], ["About", "Your story and how things are made"], ["Contact", "Questions, returns and delivery info"]], palettes: ["sand", "espresso", "mono", "coral", "sage"] },
  { id: "saas", label: "Software or app", category: "SaaS & apps", words: ["saas", "app", "software", "startup", "analytics"], pages: [["Home", "Headline, product screenshot, features and sign-up"], ["Features", "Each feature with a short explanation"], ["Pricing", "Plans side by side with an FAQ"], ["Blog", "Product news and guides"], ["Contact", "Sales and support"]], palettes: ["midnight", "ocean", "plum", "citrus", "mono"] },
  { id: "agency", label: "Agency or consultancy", category: "Agency & consulting", words: ["agency", "studio", "consulting", "law", "accounting", "branding"], pages: [["Home", "What you do, for whom, and selected work"], ["Services", "Each service with outcomes and price guide"], ["Work", "Case studies with results"], ["About", "Team, values and credentials"], ["Contact", "Project enquiry form"]], palettes: ["mono", "midnight", "forest", "plum", "sand"] },
  { id: "food", label: "Restaurant or café", category: "Restaurants & food", words: ["restaurant", "cafe", "bakery", "bar", "brewery", "food"], pages: [["Home", "Atmosphere, opening hours and a booking button"], ["Menu", "Dishes and drinks with prices and dietary notes"], ["About", "The people and the story"], ["Book a table", "Reservation form or booking link"], ["Contact", "Address, map and opening hours"]], palettes: ["espresso", "forest", "coral", "sand", "midnight"] },
  { id: "local", label: "Local service", category: "Local services", words: ["gym", "salon", "dental", "clinic", "plumber", "builder", "barber", "real estate"], pages: [["Home", "What you offer, where, and how to book"], ["Services", "Treatments or services with prices"], ["About", "Team, qualifications and reviews"], ["Book", "Booking form or calendar link"], ["Contact", "Address, map, phone and hours"]], palettes: ["ocean", "sage", "forest", "coral", "mono"] },
  { id: "portfolio", label: "Portfolio or photography", category: "Portfolio & photography", words: ["portfolio", "photographer", "artist", "designer", "illustrator"], pages: [["Home", "Your best work, big and first"], ["Work", "Gallery or project grid"], ["Project", "One project in depth"], ["About", "Who you are and how you work"], ["Contact", "Commission or booking enquiry"]], palettes: ["mono", "sand", "plum", "midnight", "sage"] },
  { id: "blog", label: "Blog, magazine or podcast", category: "Blog & media", words: ["blog", "magazine", "newsletter", "podcast", "writer"], pages: [["Home", "Latest posts and a newsletter sign-up"], ["Article", "A long-form reading layout"], ["Archive", "Every post by topic or date"], ["About", "Who writes it and why"], ["Contact", "Pitches, sponsors and questions"]], palettes: ["sand", "mono", "forest", "plum", "espresso"] },
  { id: "personal", label: "Personal site or résumé", category: "Personal & resume", words: ["resume", "cv", "personal", "developer", "freelancer"], pages: [["Home", "Name, what you do and a photo"], ["Projects", "Selected work with links"], ["Résumé", "Experience, education and skills"], ["Contact", "Email, socials and a short form"]], palettes: ["mono", "ocean", "plum", "citrus", "sage"] },
  { id: "events", label: "Event, course or nonprofit", category: "Events & courses", words: ["event", "conference", "wedding", "course", "nonprofit", "festival"], pages: [["Home", "What, when, where, and the main call to action"], ["Schedule", "Agenda, sessions or lessons"], ["Speakers", "People involved, with photos"], ["Tickets", "Prices, what's included and sign-up"], ["FAQ", "Practical answers and contact"]], palettes: ["citrus", "coral", "midnight", "ocean", "forest"] },
];

export const TONES = ["Friendly", "Professional", "Premium", "Bold", "Calm", "Playful", "Minimal", "Warm"];

/** brand, accent, background, text */
export const PALETTES = {
  espresso: { name: "Espresso", colors: ["#6b3f2a", "#d9a441", "#faf6f0", "#2a1d16"] },
  sage: { name: "Sage", colors: ["#4f7360", "#d8a05b", "#f5f4ee", "#1f2a24"] },
  ocean: { name: "Ocean", colors: ["#1f6fb2", "#20c4b4", "#f5f9fc", "#0f1f2e"] },
  midnight: { name: "Midnight", colors: ["#6d5dfc", "#22d3ee", "#0d0d16", "#f3f2ff"] },
  coral: { name: "Coral", colors: ["#e4572e", "#29335c", "#fff8f3", "#1c1c28"] },
  forest: { name: "Forest", colors: ["#2f5d50", "#c46a1b", "#f6f3ea", "#1a2420"] },
  plum: { name: "Plum", colors: ["#7b2d6e", "#f2a65a", "#fbf7fb", "#24131f"] },
  sand: { name: "Sand", colors: ["#a26b3f", "#3d5a6c", "#f7f1e8", "#2b2520"] },
  mono: { name: "Monochrome", colors: ["#111111", "#e11d48", "#ffffff", "#111111"] },
  citrus: { name: "Citrus", colors: ["#f25c05", "#0f9d74", "#fffdf6", "#1a1a1a"] },
};

export const COLOR_ROLES = ["Brand", "Accent", "Background", "Text"];

export const typeById = (id) => BUSINESS_TYPES.find((t) => t.id === id) ?? null;

/**
 * The five templates that best suit a kind of business: same category first,
 * then anything whose words match, then the best of the rest.
 */
export function recommend(templates, typeId, query = "") {
  const type = typeById(typeId);
  const words = [...(type?.words ?? []), ...query.toLowerCase().split(/\W+/).filter((w) => w.length > 2)];
  const scored = templates.map((t) => {
    const hay = [t.name, t.tagline, t.category, t.audience, ...(t.keywords ?? [])].join(" ").toLowerCase();
    let score = 0;
    if (type && t.category === type.category) score += 10;
    for (const w of words) if (hay.includes(w)) score += 3;
    score += { premium: 2, pro: 1, starter: 0 }[t.tier] ?? 0;
    if (t.featured) score += 2;
    return { t, score };
  });
  return scored
    .sort((a, b) => b.score - a.score || a.t.name.localeCompare(b.t.name))
    .slice(0, 5)
    .map(({ t }) => t);
}

const HEX = /^#[0-9a-f]{6}$/i;
export const isPalette = (list) => Array.isArray(list) && list.length === 4 && list.every((c) => HEX.test(c));

/** The brief as one readable prompt, for the buyer, the admin and the email. */
export function briefText(b) {
  const type = typeById(b.businessType)?.label ?? (b.businessTypeOther || "business");
  const pages = (b.pageList ?? []).filter((p) => p.name?.trim());
  const lines = [
    `Build a ${pages.length || "multi"}-page website for ${b.business || "my business"}, a ${type.toLowerCase()}.`,
    b.tagline ? `In one line: ${b.tagline}` : null,
    b.inspiration ? `Take inspiration from the ${b.inspirationName ?? b.inspiration} template.` : "Choose the template that fits best.",
    b.inspirationUrl ? `A site I like: ${b.inspirationUrl}` : null,
    "",
    b.about ? `About the business: ${b.about}` : null,
    b.audience ? `Audience: ${b.audience}` : null,
    b.tones?.length ? `Tone: ${b.tones.join(", ").toLowerCase()}.` : null,
    "",
    pages.length ? "Pages:" : null,
    ...pages.map((p, i) => `${i + 1}. ${p.name.trim()}${p.notes?.trim() ? ` — ${p.notes.trim()}` : ""}`),
    "",
    isPalette(b.palette) ? `Colours: ${COLOR_ROLES.map((r, i) => `${r.toLowerCase()} ${b.palette[i]}`).join(", ")}.` : null,
    b.notes ? `Anything else: ${b.notes}` : null,
  ];
  return lines.filter((l) => l !== null).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
