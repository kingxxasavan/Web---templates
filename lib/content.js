import { SITE } from "./site.js";
import { MADE_FOR_YOU, CATALOG, TIERS, isOpenSource, money } from "./catalog.js";
import { GUIDES } from "./guides.js";

/**
 * Copy shared by several pages. Every claim here is something the store
 * actually does — if a feature changes, change the sentence with it.
 */

/** What sets the store apart. `icon` names a glyph in components/icons.jsx. */
export const PROMISES = [
  {
    icon: "eye",
    title: "Try it before you pay",
    body: "Our HTML templates run live on their product pages. Click through every page, test the forms and menus, and switch between phone, tablet and desktop. No screenshot standing in for the real thing.",
  },
  {
    icon: "pencil",
    title: "Customise it in your browser",
    body: "Every HTML template, at every price, includes the online editor. Change the words, colours, fonts and page titles on every page, then download your finished site. No code, no software to install.",
  },
  {
    icon: "sparkle",
    title: "Can't find it? We'll build it",
    body: `Answer six questions about your business, the look you like, your pages and colours, and we build your site in ${MADE_FOR_YOU.delivery}. ${money(MADE_FOR_YOU.priceCents)} per site.`,
  },
  {
    icon: "grid",
    title: "Built for your kind of business",
    body: "Every template is made for one kind of business, so a café gets its menu and opening hours, a SaaS gets pricing and a changelog, and a store gets its product grid. No lorem ipsum to clear out.",
  },
  {
    icon: "shield",
    title: "Honest, clear licences",
    body: "Each listing says exactly where a design comes from and what its licence asks of you, before you buy. Our originals need no credit; open-source editions keep their author's MIT or CC BY licence.",
  },
  {
    icon: "infinity",
    title: "One price, unlimited projects",
    body: "No subscriptions, per-site fees or \"extended\" licences. Pay once and use the template on as many personal and client sites as you like.",
  },
  {
    icon: "chat",
    title: "Help from people who know the code",
    body: "Stuck on setup? Send a message and it goes straight to the developers who prepared the template, not a ticket queue.",
  },
  {
    icon: "globe",
    title: "A guide for every host",
    body: `Step-by-step guides for ${GUIDES.filter((g) => g.kind !== "topic").length} hosts and platforms, from Netlify and Cloudflare to Shopify and WordPress, plus domains, forms and payments.`,
  },
  {
    icon: "refund",
    title: `${SITE.refundDays}-day money-back guarantee`,
    body: `If a template doesn't work for your project, tell us within ${SITE.refundDays} days and we'll refund you in full. No forms to fill in.`,
  },
];

const STATIC_COUNT = CATALOG.filter((t) => t.livePreview).length;
const OPEN_SOURCE_COUNT = CATALOG.filter(isOpenSource).length;

/** Smaller extras, shown as a checklist. */
export const EXTRAS = [
  "Instant download, straight after checkout",
  "Re-download the latest version any time",
  `${STATIC_COUNT} of ${CATALOG.length} templates need no build step: plain HTML, CSS and JS`,
  "Every download includes a README and setup notes",
  "Online editor included with every HTML template",
  `${GUIDES.length} launch guides: Netlify, Vercel, Cloudflare, Shopify and more`,
  `Can't find one? We build it to your brief for ${money(MADE_FOR_YOU.priceCents)}`,
  "Free account with email sign-in",
  "Verified-buyer reviews only",
];

export const BUILD_STEPS = [
  {
    title: "Start from the business",
    body: "Each template begins with a list of what that kind of site has to do. A restaurant needs its menu, opening hours and bookings; a gym needs its timetable; a store needs products and a cart. The layout is designed around those jobs.",
  },
  {
    title: "Design it, or choose a proven design",
    body: "Our originals are designed and hand-coded here. For open-source editions we pick well-made designs with permissive licences, then rework them for one kind of business: new copy, colours, typography and artwork.",
  },
  {
    title: "Keep the code readable",
    body: "Semantic HTML, modern CSS and small amounts of JavaScript, with colours and fonts set as a few variables at the top. No page builders and nothing you can't open and change.",
  },
  {
    title: "Check it everywhere",
    body: "Every page is checked at phone, tablet and desktop widths, with a keyboard, and for readable contrast before it's listed.",
  },
  {
    title: "Package it for you",
    body: "The download is the full, unminified source with a README that explains how to edit it and a plain-English licence.",
  },
];

export const BUY_STEPS = [
  {
    title: "Preview",
    body: "Open a template and click through its pages, on phone, tablet or desktop.",
  },
  {
    title: "Buy once",
    body: "Add it to your cart, create a free account at checkout, and pay once. No subscription.",
  },
  {
    title: "Download",
    body: "Your files are in your library straight away, and they stay there for good.",
  },
  {
    title: "Launch",
    body: "Swap in your words and pictures, upload the folder, and you're live. A simple site can be done in an afternoon.",
  },
];

export const LICENCE_CAN = [
  "Use it on unlimited personal and client projects",
  "Change the code, design and content however you like",
  "Charge your client for the finished website",
  "Launch commercial products and businesses with it",
  "Leave out any credit on our original designs",
];

export const LICENCE_CANNOT = [
  "Resell or give away our original templates, changed or not",
  "Include our originals in another template, theme or UI kit",
  "Remove the author credit an open-source licence requires",
];

/** The licences in the catalogue, for the licence page. */
export const LICENCE_KINDS = [
  {
    name: "Foundry licence",
    applies: `Our ${CATALOG.length - OPEN_SOURCE_COUNT} original designs`,
    body: "Unlimited personal and client projects, no credit required. You can't resell or redistribute the template itself.",
  },
  {
    name: "MIT",
    applies: `${CATALOG.filter((t) => isOpenSource(t) && t.source.license === "MIT").length} Start Bootstrap editions`,
    body: "Use it for anything, including commercially. Keep the copyright notice that ships in the source files; nothing needs to show on the page.",
  },
  {
    name: "CC BY 3.0",
    applies: `${CATALOG.filter((t) => isOpenSource(t) && t.source.license === "CC BY 3.0").length} HTML5 UP editions`,
    body: "Use it for anything, including commercially, as long as a visible credit to the original author stays on the site. The footer credit is already in place; just leave it there.",
  },
];

/** Short descriptions and cover templates for the category grid. */
export const CATEGORY_INFO = {
  "E-commerce": { cover: "aurora-commerce", blurb: "Storefronts, product pages and lookbooks for brands that sell online." },
  "SaaS & apps": { cover: "helix-ai", blurb: "Launch pages, pricing and changelogs for software and mobile apps." },
  "Agency & consulting": { cover: "sable-studio", blurb: "Studios, consultancies, law and accounting firms that sell expertise." },
  "Restaurants & food": { cover: "ember-table", blurb: "Menus, opening hours and bookings for restaurants, cafés and bakeries." },
  "Local services": { cover: "pulse-fitness", blurb: "Gyms, clinics, trades, salons and property: businesses people visit." },
  "Portfolio & photography": { cover: "monolith-portfolio", blurb: "Galleries and case studies for photographers, artists and designers." },
  "Blog & media": { cover: "quill-journal", blurb: "Blogs, magazines, newsletters and podcasts built for reading." },
  "Personal & resume": { cover: "html5up-prologue", blurb: "Résumés, link pages and personal sites for freelancers and job hunters." },
  "Events & courses": { cover: "html5up-twenty", blurb: "Conferences, exhibitions, weddings and online courses." },
};

const counts = {
  starter: CATALOG.filter((t) => t.tier === "starter").length,
  pro: CATALOG.filter((t) => t.tier === "pro").length,
  premium: CATALOG.filter((t) => t.tier === "premium").length,
};

export const FAQ = [
  {
    group: "Buying",
    items: [
      {
        q: "How much do templates cost?",
        a: `Every template is ${money(TIERS.starter.priceCents)}, ${money(TIERS.pro.priceCents)} or ${money(TIERS.premium.priceCents)}, paid once. ${counts.starter} are Starter (${money(TIERS.starter.priceCents)}), ${counts.pro} are Pro (${money(TIERS.pro.priceCents)}) and ${counts.premium} are Premium (${money(TIERS.premium.priceCents)}). Every HTML template includes the online editor.`,
      },
      {
        q: "What if none of the templates fit?",
        a: `Use Made for you. Answer six questions (your business, a template you like, what the site should say, your pages and your colours) and we build it in ${MADE_FOR_YOU.delivery} for ${money(MADE_FOR_YOU.priceCents)}.`,
      },
      {
        q: "Is it really a one-time payment?",
        a: "Yes. There's no subscription, no renewal and no per-domain fee. The template stays in your library and you can download it again whenever you want.",
      },
      {
        q: "Do I need an account?",
        a: "Not to browse, preview or fill a cart. You create a free account with your email at checkout, so your purchases have somewhere to live.",
      },
      {
        q: "Can I get a refund?",
        a: `Yes. If a template doesn't work for your project, send us a message within ${SITE.refundDays} days of buying and we'll refund you in full.`,
      },
    ],
  },
  {
    group: "Using the templates",
    items: [
      {
        q: "Do I need to know how to code?",
        a: "For most templates you need to be comfortable editing text in an HTML file, and nothing more. There's no build step, and the online editor means you may not need to open a file at all. Helix is a Next.js project and expects some React experience.",
      },
      {
        q: "Where can I host them?",
        a: "Anywhere that serves static files: Netlify, Vercel, Cloudflare Pages, GitHub Pages, Firebase or ordinary shared hosting. Our Guides section has step-by-step instructions for each, and for using a template alongside Shopify, WordPress, Squarespace or Wix.",
      },
      {
        q: "What can the online editor change?",
        a: "The words on every page, your colours, fonts and corner styles, and each page's title and search description. It also has a find-and-replace for swapping the template's placeholder business name for yours everywhere at once. Your changes save to your account, and you download the finished site as a zip. It's included with every HTML template, and anyone can try it free before buying.",
      },
      {
        q: "What is Made for you?",
        a: `A website built to your brief, for when no template is quite right. A short questionnaire asks about your business, shows you the five templates that suit it best to take inspiration from, then asks what the site should say, which pages you need and which colours, with a live preview. We build it within ${MADE_FOR_YOU.days} days of paying, for ${money(MADE_FOR_YOU.priceCents)}, with one round of changes. We take a limited number at a time so every build ships on time.`,
      },
      {
        q: "Do the forms and shopping carts work?",
        a: "They work in the browser with validation and state, but they don't come with a server. Point a form at Formspree or Netlify Forms, and a cart at Stripe Payment Links or Snipcart. The README shows you how.",
      },
      {
        q: "Do I get updates?",
        a: "Yes. When we improve a template, the new version replaces the old one in your library.",
      },
    ],
  },
  {
    group: "Licence",
    items: [
      {
        q: "Can I use a template for a client?",
        a: "Yes, on as many client projects as you like, and you can charge for the finished site. What you can't do is resell our original templates themselves.",
      },
      {
        q: "Are the templates original?",
        a: `${CATALOG.length - OPEN_SOURCE_COUNT} are original Foundry designs. The other ${OPEN_SOURCE_COUNT} are editions of free open-source designs from HTML5 UP and Start Bootstrap, each reworked for a specific kind of business with new copy, colours, typography and artwork. Every listing names the original design and its author, and the originals stay free from them. You're paying for the rework, the setup guide, the editor and our help.`,
      },
      {
        q: "Do I have to credit anyone?",
        a: "Not for our originals. HTML5 UP editions use CC BY 3.0, which asks for a visible credit to the author; it's already in the footer, so just leave it. Start Bootstrap editions use MIT, which only asks you to keep the copyright notice in the source files.",
      },
    ],
  },
];
