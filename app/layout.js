import { Inter, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";
import FirebaseAnalytics from "@/components/FirebaseAnalytics";
import BriefWizardRoot from "@/components/BriefWizard";
import { SITE } from "@/lib/site";
import { CATALOG, MADE_FOR_YOU, money } from "@/lib/catalog";

// What the brief wizard needs to recommend templates, kept small.
const WIZARD_TEMPLATES = CATALOG.map(({ slug, name, tagline, category, tier, audience, keywords, livePreview, featured }) => ({
  slug, name, tagline, category, tier, audience, keywords, livePreview: Boolean(livePreview), featured: Boolean(featured),
}));
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["italic", "normal"],
  variable: "--font-instrument",
  display: "swap",
});

const DESCRIPTION = `${CATALOG.length} website templates for online stores, SaaS products, agencies, restaurants, local businesses and portfolios. Preview every page live, pay $5 to $15 once, and launch this afternoon.`;

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Foundry — website templates for real businesses, from $5",
    template: "%s · Foundry",
  },
  description: DESCRIPTION,
  keywords: [
    "website templates",
    "HTML templates",
    "ecommerce template",
    "SaaS landing page template",
    "restaurant website template",
    "portfolio template",
  ],
  openGraph: {
    title: "Foundry — website templates for real businesses, from $5",
    description: DESCRIPTION,
    url: SITE.url,
    siteName: "Foundry",
    type: "website",
  },
  robots: { index: true, follow: true },
};

// Runs before the page paints, so a visitor who chose a theme never sees
// the other one flash first.
const THEME_SCRIPT = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf8" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d10" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${instrument.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        {children}
        <BriefWizardRoot templates={WIZARD_TEMPLATES} price={money(MADE_FOR_YOU.priceCents)} delivery={MADE_FOR_YOU.delivery} />
        {/* Cookie-less visitor and performance data, collected by Vercel.
            Both no-op outside a Vercel deployment. */}
        <Analytics />
        <SpeedInsights />
        {/* Firebase Analytics. Suspense because it reads search params, and
            it no-ops entirely when the project isn't configured. */}
        <Suspense fallback={null}>
          <FirebaseAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
