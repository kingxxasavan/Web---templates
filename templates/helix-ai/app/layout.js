import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["italic", "normal"],
  variable: "--font-instrument",
  display: "swap",
});

const SITE = "https://helix-ai.vercel.app";

export const metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Helix — The AI support agent that closes tickets",
    template: "%s · Helix",
  },
  description:
    "Helix reads your docs, your codebase and your past tickets, then resolves 71% of customer conversations end-to-end — before your team wakes up.",
  keywords: [
    "AI customer support",
    "AI support agent",
    "support automation",
    "AI helpdesk",
    "Zendesk AI",
    "Intercom alternative",
  ],
  openGraph: {
    title: "Helix — The AI support agent that closes tickets",
    description:
      "Resolve 71% of support conversations end-to-end. Helix learns from your docs, code and ticket history.",
    url: SITE,
    siteName: "Helix",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Helix — The AI support agent that closes tickets",
    description:
      "Resolve 71% of support conversations end-to-end, automatically.",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#06060a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${instrument.variable}`}>
      <body className="grain antialiased">{children}</body>
    </html>
  );
}
