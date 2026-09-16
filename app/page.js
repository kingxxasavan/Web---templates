import Masthead from "@/components/Masthead";
import TemplateCard from "@/components/TemplateCard";
import GetButton from "@/components/GetButton";
import Footer from "@/components/Footer";
import { Reveal, Check, Badge } from "@/components/store";
import { TEMPLATES, BUNDLE, bundleSaving } from "@/lib/templates";

const LICENCE = [
  "Use on unlimited personal and client projects",
  "Modify the source however you like",
  "No attribution or backlink required",
  "Sell the finished site to your client",
];

const LICENCE_NOT = [
  "Reselling or redistributing the template itself",
  "Including it in another template or theme pack",
];

const FAQ = [
  {
    q: "Are these actually original?",
    a: "Yes. Every template here was written from scratch for this store — none of it is a repackaged open-source theme. That matters to you as a buyer: there is no upstream licence to comply with, no attribution to preserve, and no risk of the same design being sold in five other shops.",
  },
  {
    q: "Do I need to know how to code?",
    a: "For the eight HTML templates, no build step is involved — open the folder, edit the text in index.html, and upload it anywhere. You will need to be comfortable editing HTML to change copy and images. Helix is a Next.js project and does expect some React familiarity.",
  },
  {
    q: "Where can I host them?",
    a: "Anywhere that serves static files: Vercel, Netlify, Cloudflare Pages, GitHub Pages, or ordinary shared hosting over FTP. Helix deploys to Vercel with no configuration.",
  },
  {
    q: "What do I get in the download?",
    a: "A zip of the complete, readable source — HTML, CSS, JavaScript and assets, plus a README for that template. Nothing is minified or obfuscated, and there is no licence key or phone-home.",
  },
  {
    q: "Do the forms and carts work?",
    a: "They are wired up on the front end with validation and state, but they do not include a backend. Point the form at Formspree, Netlify Forms or your own endpoint, and the cart at Stripe Payment Links or Snipcart.",
  },
  {
    q: "Can I get a refund?",
    a: "Since the download is the whole product, all sales are final once the file has been delivered. Every template can be previewed in full before you buy, so you know exactly what you are getting.",
  },
];

export default function Home() {
  const total = TEMPLATES.reduce((s, t) => s + t.price, 0);

  return (
    <>
      <Masthead />

      {/* hero */}
      <section className="relative overflow-hidden px-6 pb-16 pt-20 md:pt-28">
        <div className="pointer-events-none absolute inset-0 -z-20 wash" />
        <div className="pointer-events-none absolute inset-0 -z-10 grid-lines" />
        <div className="mx-auto w-full max-w-3xl text-center">
          <Reveal>
            <Badge>{TEMPLATES.length} templates · all original work</Badge>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="mt-6 text-balance text-[2.6rem] leading-[1.05] tracking-[-0.03em] sm:text-6xl">
              Website templates you can{" "}
              <span className="serif-accent text-accent">ship today.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-[16px] leading-relaxed text-muted">
              Hand-built, readable source code for the sites entrepreneurs
              actually need — a storefront, a portfolio, a launch page, a
              booking site. Download the folder, change the words, go live.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#templates"
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[14px] font-medium text-base transition-transform duration-300 hover:-translate-y-0.5"
              >
                Browse all {TEMPLATES.length}
              </a>
              <a
                href="#bundle"
                className="rounded-full border border-line px-6 py-3 text-[14px] text-ink transition-colors hover:border-ink/25"
              >
                Get the bundle — ${BUNDLE.price}
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.24}>
            <p className="mt-5 text-[12.5px] text-faint">
              Commercial licence · No attribution required · Full source
            </p>
          </Reveal>
        </div>
      </section>

      {/* grid */}
      <section id="templates" className="px-6 py-16 md:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="text-[26px] tracking-[-0.02em]">Every template</h2>
            <p className="text-[13px] text-faint">
              ${total} separately · ${BUNDLE.price} together
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((t, i) => (
              <Reveal key={t.slug} delay={(i % 3) * 0.06}>
                <TemplateCard t={t} priority={i < 3} />
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
                download. Bought separately it would be ${total}.
              </p>
              <div className="mt-7 flex items-center justify-center gap-3">
                <span className="font-display text-5xl tracking-tight">
                  <span className="text-xl text-muted">$</span>
                  {BUNDLE.price}
                </span>
                <span className="text-left text-[12.5px] leading-tight text-faint">
                  one payment
                  <br />
                  save ${bundleSaving()}
                </span>
              </div>
              <div className="mt-8">
                <GetButton item={BUNDLE} size="lg" />
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
                  {LICENCE.map((l) => (
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
                  {LICENCE_NOT.map((l) => (
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
