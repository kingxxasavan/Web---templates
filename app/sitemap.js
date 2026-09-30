import { TEMPLATES } from "@/lib/catalog";
import { SITE } from "@/lib/site";

export default function sitemap() {
  const pages = ["", "/templates", "/pricing", "/how-it-works", "/about", "/faq", "/licence", "/contact"];
  return [
    ...pages.map((p) => ({ url: `${SITE.url}${p}`, changeFrequency: "weekly", priority: p ? 0.8 : 1 })),
    ...TEMPLATES.map((t) => ({ url: `${SITE.url}/t/${t.slug}`, changeFrequency: "monthly", priority: 0.9 })),
  ];
}
