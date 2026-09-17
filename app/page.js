import Link from "next/link";
import Masthead from "@/components/Masthead";
import TemplateCard from "@/components/TemplateCard";
import AddToCart from "@/components/AddToCart";
import Footer from "@/components/Footer";
import TourLauncher from "@/components/TourLauncher";
import { Reveal, Check, Badge } from "@/components/store";
import { currentUser } from "@/lib/auth";
import { ownedSlugs } from "@/lib/store";
import { ratingSummary } from "@/lib/reviews";
import { tourPool, showcase } from "@/lib/tour";
import {
  TEMPLATES,
  TIERS,
  BUNDLE,
  money,
  individualTotal,
} from "@/lib/catalog";

const LICENCE_CAN = [
  "Use on unlimited personal and client projects",
  "Modify the source however you like",
  "No attribution or backlink required",
  "Sell the finished site to your client",
];

const LICENCE_CANNOT = [
  "Reselling or redistributing the template itself",
  "Including it in another template or theme pack",
];

const FAQ = [
  {
    q: "Are these actually original?",
    a: "Yes. Every template was written from scratch for this store — none of it is a repackaged open-source theme. That matters to you as a buyer: there is no upstream licence to comply with, no attribution to preserve, and no risk of the same design turning up in five other shops.",
  },
  {
    q: "What does one-time mean?",
    a: "You pay once and the template is yours permanently. No subscription, no renewal, no per-domain fee. It stays in your library and you can re-download it whenever you like.",
  },
  {
    q: "Do I need to know how to code?",
    a: "For the $5 templates, no build step is involved — open the folder, edit the text in index.html, and upload it anywhere. You'll need to be comfortable editing HTML to change copy and images. The Pro templates assume a bit more, and Helix is a Next.js project that expects some React familiarity.",
  },
  {
    q: "Where can I host them?",
    a: "Anywhere that serves static files: Vercel, Netlify, Cloudflare Pages, GitHub Pages, or ordinary shared hosting over FTP. Helix deploys to Vercel with no configuration.",
  },
  {
    q: "Do the forms and carts work?",
    a: "They are wired up on the front end with validation and state, but they do not ship a backend. Point the form at Formspree or Netlify Forms, and the cart at Stripe Payment Links or Snipcart.",
  },
  {
    q: "Can I get a refund?",
    a: "Because the download is the entire product, sales are final once the file has been delivered. Every template is fully previewable before you buy, so you know exactly what you are getting.",
  },
];

export default async function Home() {
  const user = await currentUser();
  const [owned, ratings] = await Promise.all([
    user ? ownedSlugs(user.id) : Promise.resolve(new Set()),
    ratingSummary(),
  ]);
  const total = individualTotal();
  const pool = tourPool();
  const proof = showcase();

  return (
    <>
      <TourLauncher pool={pool} showcase={proof} variant="auto" />
      <Masthead />

      {/* hero */}
      <section className="relative overflow-hidden px-6 pb-16 pt-20 md:pt-28">
        <div className="pointer-events-none absolute inset-0 -z-20 wash" />
        <div className="pointer-events-none absolute inset-0 -z-10 grid-lines" />
        <div className="mx-auto w-full max-w-3xl text-center">
          <Reveal>
            <Badge>{TEMPLATES.length} templates · pay once, keep forever</Badge>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="mt-6 text-balance text-[2.6rem] leading-[1.05] tracking-[-0.03em] sm:text-6xl">
              Websites from{" "}
              <span className="serif-accent text-accent">$5.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-[16px] leading-relaxed text-muted">
              Hand-built, readable source code for the sites entrepreneurs
              actually need — a storefront, a portfolio, a launch page, a
              booking site. Buy it once, download the folder, go live.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#templates"
                className="rounded-full bg-ink px-6 py-3 text-[14px] font-medium text-base transition-transform duration-300 hover:-translate-y-0.5"
              >
                Browse all {TEMPLATES.length}
              </a>
              <TourLauncher pool={pool} showcase={proof} variant="button" />
            </div>
          </Reveal>
        </div>

        {/* price tiers */}
        <Reveal delay={0.24}>
          <div className="mx-auto mt-14 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                price: TIERS.starter.priceCents,
                label: TIERS.starter.name,
                note: TIERS.starter.note,
                count: `${TEMPLATES.filter((t) => t.tier === "starter").length} templates`,
              },
              {
                price: TIERS.pro.priceCents,
                label: TIERS.pro.name,
                note: TIERS.pro.note,
                count: `${TEMPLATES.filter((t) => t.tier === "pro").length} templates`,
              },
              {
                price: BUNDLE.priceCents,
                label: "Bundle",
                note: `Everything — save ${money(total - BUNDLE.priceCents)}`,
                count: `All ${TEMPLATES.length}`,
                accent: true,
              },
            ].map((tier) => (
              <div
                key={tier.label}
                className={`card rounded-2xl p-5 text-center ${
                  tier.accent ? "border-accent/30" : ""
                }`}
              >
                <p className="font-display text-4xl tracking-tight">
                  {money(tier.price)}
                </p>
                <p
                  className={`mt-1.5 text-[13.5px] font-medium ${
                    tier.accent ? "text-accent" : "text-ink"
                  }`}
                >
                  {tier.label}
                </p>
                <p className="mt-1 min-h-[32px] text-[12px] leading-snug text-faint">
                  {tier.note}
                </p>
                <p className="mt-3 border-t border-line pt-3 text-[11.5px] text-muted">
                  {tier.count}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* grid */}
      <section id="templates" className="px-6 py-16 md:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-[26px] tracking-[-0.02em]">Every template</h2>
            <p className="text-[13px] text-faint">
              {money(total)} separately · {money(BUNDLE.priceCents)} together
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((t, i) => (
              <Reveal key={t.slug} delay={(i % 3) * 0.06}>
                <TemplateCard
                  t={t}
                  owned={owned.has(t.slug)}
                  rating={ratings.get(t.slug)}
                  priority={i < 3}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* bundle */}
      <section id="bundle" className="px-6 py-16 md:py-20">
        <div className="mx-auto w-full max-w-4xl">
          <Reveal>
            <div className="card relative overflow-hidden rounded-3xl p-8 text-center sm:p-12">
              <div className="pointer-events-none absolute inset-0 -z-10 wash opacity-70" />
              <Badge tone="accent">Best value</Badge>
              <h2 className="mt-5 text-balance text-3xl leading-tight tracking-[-0.02em] sm:text-[2.6rem]">
                Take all {TEMPLATES.length}, keep them{" "}
                <span className="serif-accent text-accent">forever.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted">
                Every current template, plus anything added later, in one
                download. Bought separately it would be {money(total)}.
              </p>
              <div className="mt-7 flex items-center justify-center gap-3">
                <span className="font-display text-5xl tracking-tight">
                  {money(BUNDLE.priceCents)}
                </span>
                <span className="text-left text-[12.5px] leading-tight text-faint">
                  one payment
                  <br />
                  save {money(total - BUNDLE.priceCents)}
                </span>
              </div>
              <div className="mt-8">
                <AddToCart
                  slug={BUNDLE.slug}
                  label={`Add the bundle — ${money(BUNDLE.priceCents)}`}
                  owned={owned.size === TEMPLATES.length}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* licence */}
      <section id="licence" className="px-6 py-16 md:py-20">
        <div className="mx-auto w-full max-w-4xl">
          <Reveal>
            <h2 className="text-[26px] tracking-[-0.02em]">
              What the licence lets you do
            </h2>
            <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-muted">
              One plain-English licence covers every template. No tiers, no
              per-domain counting, no expiry.
            </p>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Reveal>
              <div className="card h-full rounded-2xl p-6">
                <h3 className="text-[15px] font-medium">You can</h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {LICENCE_CAN.map((l) => (
                    <li key={l} className="flex gap-2.5">
                      <Check />
                      <span className="text-[13.5px] leading-snug text-muted">
                        {l}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.06}>
              <div className="card h-full rounded-2xl p-6">
                <h3 className="text-[15px] font-medium">You can&rsquo;t</h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {LICENCE_CANNOT.map((l) => (
                    <li key={l} className="flex gap-2.5">
                      <span className="mt-[7px] h-px w-3 shrink-0 bg-faint" />
                      <span className="text-[13.5px] leading-snug text-muted">
                        {l}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 border-t border-line pt-4 text-[12.5px] leading-relaxed text-faint">
                  In short: sell the websites you build with these, not the
                  templates themselves.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* faq */}
      <section id="faq" className="px-6 py-16 md:py-20">
        <div className="mx-auto w-full max-w-3xl">
          <Reveal>
            <h2 className="text-[26px] tracking-[-0.02em]">Questions</h2>
          </Reveal>
          <div className="mt-8 flex flex-col divide-y divide-line border-y border-line">
            {FAQ.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.03}>
                <details className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line">
                      <span className="absolute h-[1.5px] w-2 rounded-full bg-ink" />
                      <span className="absolute h-2 w-[1.5px] rounded-full bg-ink transition-transform duration-300 group-open:rotate-90 group-open:opacity-0" />
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-muted">
                    {f.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
