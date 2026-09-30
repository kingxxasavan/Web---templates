import { SITE } from "./site.js";
import { BUNDLE, TEMPLATES, TIERS, money } from "./catalog.js";

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
    icon: "credit",
    title: "Never pay twice",
    body: `Everything you've already bought counts toward the ${money(BUNDLE.priceCents)} all-access bundle. Upgrade whenever you like and you only pay the difference.`,
  },
  {
    icon: "shield",
    title: "Original code, clean licence",
    body: "Written from scratch for this store and never repackaged from an open-source theme. There's no upstream licence to comply with and no attribution to keep.",
  },
  {
    icon: "infinity",
    title: "One price, unlimited projects",
    body: "No subscriptions, per-site fees or \"extended\" licences. Pay once and use the template on as many personal and client sites as you like.",
  },
  {
    icon: "chat",
    title: "Help from the person who built it",
    body: "Stuck on setup? Send a message and it goes straight to the developer who wrote the code, not a ticket queue.",
  },
  {
    icon: "refund",
    title: `${SITE.refundDays}-day money-back guarantee`,
    body: `If a template doesn't work for your project, tell us within ${SITE.refundDays} days and we'll refund you in full. No forms to fill in.`,
  },
];

const STATIC_COUNT = TEMPLATES.filter((t) => t.livePreview).length;

/** Smaller extras, shown as a checklist. */
export const EXTRAS = [
  "Instant download, straight after checkout",
  "Re-download the latest version any time",
  `${STATIC_COUNT} of ${TEMPLATES.length} templates need no build step: plain HTML, CSS and JS`,
  "Every download includes a README and setup notes",
  "Works on any host: Netlify, Vercel, GitHub Pages or cPanel",
  "Bundle owners get every future template free",
  "Sign in with Google or email",
  "Verified-buyer reviews only",
];

export const BUILD_STEPS = [
  {
    title: "Start from the business",
    body: "Each template begins with a list of what that kind of site has to do. A restaurant needs its menu, opening hours and bookings; a gym needs its timetable. The layout is designed around those jobs.",
  },
  {
    title: "Design in the browser",
    body: "Type scale, spacing and colour are set as a small system of variables, so changing a brand colour or font is one edit instead of fifty.",
  },
  {
    title: "Hand-write the code",
    body: "Semantic HTML, modern CSS and small amounts of plain JavaScript. No page builders, no minified bundles, nothing you can't read and change.",
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

export const HOSTING_GUIDES = [
  {
    name: "Netlify Drop",
    time: "2 minutes",
    steps: [
      "Unzip your download.",
      "Open app.netlify.com/drop.",
      "Drag the template folder onto the page.",
      "Your site is live on a netlify.app address. Add your own domain under Domain settings.",
    ],
  },
  {
    name: "Vercel",
    time: "5 minutes",
    steps: [
      "Push the folder to a GitHub repository.",
      "Import the repository at vercel.com/new.",
      "Leave the settings as they are and click Deploy.",
      "Helix, the Next.js template, deploys the same way.",
    ],
  },
  {
    name: "GitHub Pages",
    time: "5 minutes",
    steps: [
      "Push the folder to a GitHub repository.",
      "Open Settings → Pages.",
      "Choose Deploy from a branch and select main.",
      "The site appears at your-name.github.io/repository.",
    ],
  },
  {
    name: "Shared hosting (cPanel / FTP)",
    time: "10 minutes",
    steps: [
      "Open File Manager in cPanel, or connect with an FTP app.",
      "Go to the public_html folder.",
      "Upload everything inside the template folder.",
      "Visit your domain. index.html is the home page.",
    ],
  },
];

export const LICENCE_CAN = [
  "Use it on unlimited personal and client projects",
  "Change the code, design and content however you like",
  "Charge your client for the finished website",
  "Launch commercial products and businesses with it",
  "Leave out any credit, attribution or backlink",
];

export const LICENCE_CANNOT = [
  "Resell or give away the template itself, changed or not",
  "Include it in another template, theme or UI kit",
  "Upload it to a marketplace or share the source publicly",
];

const counts = {
  starter: TEMPLATES.filter((t) => t.tier === "starter").length,
  pro: TEMPLATES.filter((t) => t.tier === "pro").length,
  premium: TEMPLATES.filter((t) => t.tier === "premium").length,
};

export const FAQ = [
  {
    group: "Buying",
    items: [
      {
        q: "How much do templates cost?",
        a: `Every template is ${money(TIERS.starter.priceCents)}, ${money(TIERS.pro.priceCents)} or ${money(TIERS.premium.priceCents)}, paid once. ${counts.starter} are Starter (${money(TIERS.starter.priceCents)}), ${counts.pro} are Pro (${money(TIERS.pro.priceCents)}) and ${counts.premium} is Premium (${money(TIERS.premium.priceCents)}). The all-access bundle is ${money(BUNDLE.priceCents)} and includes future templates too.`,
      },
      {
        q: "What does \"never pay twice\" mean?",
        a: `The price of every template you already own is taken off the bundle. If you bought a ${money(TIERS.pro.priceCents)} template last month, the bundle costs you ${money(BUNDLE.priceCents - TIERS.pro.priceCents)} today. It's worked out automatically in your cart.`,
      },
      {
        q: "Is it really a one-time payment?",
        a: "Yes. There's no subscription, no renewal and no per-domain fee. The template stays in your library and you can download it again whenever you want.",
      },
      {
        q: "Do I need an account?",
        a: "Not to browse, preview or fill a cart. You create a free account at checkout, with Google or an email address, so your purchases have somewhere to live.",
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
        a: "For the Starter and Pro templates you need to be comfortable editing text in an HTML file, and nothing more. There's no build step. Helix, the Premium template, is a Next.js project and expects some React experience.",
      },
      {
        q: "Where can I host them?",
        a: "Anywhere that serves static files: Netlify, Vercel, Cloudflare Pages, GitHub Pages or ordinary shared hosting. How it works has step-by-step guides for each.",
      },
      {
        q: "Do the forms and shopping carts work?",
        a: "They work in the browser with validation and state, but they don't come with a server. Point a form at Formspree or Netlify Forms, and a cart at Stripe Payment Links or Snipcart. The README shows you how.",
      },
      {
        q: "Do I get updates?",
        a: "Yes. When we improve a template, the new version replaces the old one in your library. Bundle owners also get every new template as it's released.",
      },
    ],
  },
  {
    group: "Licence",
    items: [
      {
        q: "Can I use a template for a client?",
        a: "Yes, on as many client projects as you like, and you can charge for the finished site. What you can't do is resell the template itself.",
      },
      {
        q: "Are these really original?",
        a: "Yes. Every template was written from scratch for this store. None is a repackaged open-source theme, so there's no upstream licence, no attribution to keep, and no chance of finding the same design in five other shops.",
      },
    ],
  },
];
