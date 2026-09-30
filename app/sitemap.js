import { TEMPLATES } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { GUIDES } from "@/lib/guides";

export default function sitemap() {
  const pages = ["", "/templates", "/made-for-you", "/pricing", "/guides", "/how-it-works", "/about", "/faq", "/licence", "/contact"];
  return [
    ...pages.map((p) => ({ url: `${SITE.url}${p}`, changeFrequency: "weekly", priority: p ? 0.8 : 1 })),
    ...GUIDES.map((g) => ({ url: `${SITE.url}/guides/${g.slug}`, changeFrequency: "monthly", priority: 0.6 })),
    ...TEMPLATES.map((t) => ({ url: `${SITE.url}/t/${t.slug}`, changeFrequency: "monthly", priority: 0.9 })),
  ];
}
