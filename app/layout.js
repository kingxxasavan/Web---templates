import { Inter, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";
import FirebaseAnalytics from "@/components/FirebaseAnalytics";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["italic", "normal"],
  variable: "--font-instrument",
  display: "swap",
});

const SITE = "https://web-templates-mu.vercel.app";

export const metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Foundry — original website templates you can ship today",
    template: "%s · Foundry",
  },
  description:
    "59 website templates for portfolios, businesses and product launches. Original designs and adapted open-source editions, priced from $5 to $15.",
  keywords: [
    "website templates",
    "HTML templates",
    "Next.js templates",
    "landing page template",
    "SaaS template",
  ],
  openGraph: {
    title: "Foundry — original website templates you can ship today",
    description:
      "59 website templates with live previews, readable source and clear licenses. Individual designs from $5 to $15.",
    url: SITE,
    siteName: "Foundry",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${instrument.variable}`}>
      <body>
        {children}
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
