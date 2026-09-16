import { Inter, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["italic", "normal"],
  variable: "--font-instrument",
  display: "swap",
});

const SITE = "https://your-store.vercel.app";

export const metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Foundry — original website templates you can ship today",
    template: "%s · Foundry",
  },
  description:
    "Nine original, hand-built website templates. Clean source code, no build step on most, no attribution required. Download the source and ship.",
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
      "Nine original, hand-built website templates. Clean source, commercial licence, no attribution required.",
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
      </body>
    </html>
  );
}
