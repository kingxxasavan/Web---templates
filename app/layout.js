import { Inter, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["italic", "normal"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Foundry — original website templates from $5",
    template: "%s · Foundry",
  },
  description:
    "Original, hand-coded website templates for small businesses, freelancers and founders. Preview the pages live, pay $5 to $15 once, and launch this afternoon.",
  keywords: [
    "website templates",
    "HTML templates",
    "Next.js templates",
    "landing page template",
    "SaaS template",
  ],
  openGraph: {
    title: "Foundry — original website templates from $5",
    description:
      "Hand-coded website templates you can preview page by page before you buy. $5 to $15, paid once, commercial licence included.",
    url: SITE.url,
    siteName: "Foundry",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#fafaf8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${instrument.variable}`}>
      <body>
        {children}
        {/* Cookie-less visitor and performance data, collected by Vercel.
            Both no-op outside a Vercel deployment. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
