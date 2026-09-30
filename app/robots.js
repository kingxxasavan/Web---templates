import { SITE } from "@/lib/site";

export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/account", "/cart"] },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
