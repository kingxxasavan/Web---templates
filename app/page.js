import Image from "next/image";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import TemplateCard from "@/components/TemplateCard";
import TourLauncher from "@/components/TourLauncher";
import HelixField from "@/components/HelixField";
import { BriefButton } from "@/components/BriefWizard";
import { Icon } from "@/components/icons";
import { Reveal, Check } from "@/components/store";
import {
  SectionHeading,
  PromiseGrid,
  Steps,
  ClosingCta,
  Faq,
} from "@/components/sections";
import { currentUser } from "@/lib/auth";
import { ownedSlugs } from "@/lib/store";
import { ratingSummary } from "@/lib/reviews";
import { tourPool, showcase } from "@/lib/tour";
import { BUY_STEPS, FAQ, CATEGORY_INFO } from "@/lib/content";
import { SITE } from "@/lib/site";
import {
  CATALOG,
  TIERS,
  CATEGORIES,
  bySlug,
  money,
  MADE_FOR_YOU,
} from "@/lib/catalog";

// One strong example from each of the busiest categories.
const FEATURED = [
  "aurora-commerce",
  "helix-ai",
  "ember-table",
  "sable-studio",
  "pulse-fitness",
  "monolith-portfolio",
].map(bySlug);

const HERO_SHOTS = ["aurora-commerce", "ember-table", "sable-studio"];
const HELIX = bySlug("helix-ai");

const PILLARS = [
  {
    label: "What we are",
    title: "A small, independent template studio",
    body: "We design original templates, and rework the best open-source designs for specific kinds of business: new copy, colours, type and artwork, with the original authors credited.",
    href: "/about",
    cta: "About us",
  },
  {
    label: "What we do",
    title: "Websites for businesses that need one now",
    body: "Online stores, SaaS launches, agencies, restaurants, clinics, gyms, portfolios and blogs. Each template is built around what that kind of business has to show.",
    href: "/templates",
    cta: "See the templates",
  },
  {
    label: "How we do it",
    title: "Readable code, live previews, real help",
    body: "Plain HTML and CSS you can open and change, previewed live before you buy, with a README, an online editor, and a 3-day done-for-you option if you'd rather not.",
    href: "/how-it-works",
    cta: "How it works",
  },
];

export default async function Home() {
  const user = await currentUser();
  const [owned, ratings] = await Promise.all([
    user ? ownedSlugs(user.id) : Promise.resolve(new Set()),
    ratingSummary(),
  ]);
  const tiers = Object.values(TIERS);

  return (
    <>
      <Masthead />

      {/* ------------------------------------------------------------ hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 dot-grid" />
        <div className="shell grid grid-cols-1 items-center gap-14 pb-16 pt-14 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:pb-24">
          <div>
            <Reveal>
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-[12.5px] font-medium text-muted shadow-[var(--shadow-card)]">
                <span className="h-1.5 w-1.5 rounded-full bg-good" />
                {CATALOG.length} templates in {CATEGORIES.length} categories · from {money(TIERS.starter.priceCents)}
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="h-display mt-6 text-balance">
                A professional website,{" "}
                <span className="serif-accent text-accent">ready this afternoon.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="lede mt-6 max-w-xl text-pretty">
                Website templates made for specific businesses: online stores,
                SaaS products, agencies, restaurants, local services and
                portfolios. Try one live and customise it in your browser, for{" "}
                {money(TIERS.starter.priceCents)} to {money(TIERS.premium.priceCents)}.
                Can&rsquo;t find the right one? We&rsquo;ll build it to your brief for{" "}
                {money(MADE_FOR_YOU.priceCents)}.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/templates" className="btn btn-lg btn-primary">
                  Browse templates <Icon name="arrow" size={16} />
                </Link>
                <TourLauncher pool={tourPool()} showcase={showcase()} />
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <ul className="mt-9 grid max-w-lg grid-cols-2 gap-x-6 gap-y-2.5 text-[13.5px] text-muted">
                {[
                  "Pay once, no subscription",
                  "Unlimited client projects",
                  `${SITE.refundDays}-day money-back guarantee`,
                  "Instant download",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <Check />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* stacked previews of real templates, over the Helix field */}
          <Reveal delay={0.1} className="relative mx-auto w-full max-w-[560px]">
            <div className="pointer-events-none absolute -inset-6 overflow-hidden rounded-[2rem] bg-[#07070c] ring-1 ring-white/5 sm:-inset-8">
              <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_30%_20%,rgba(124,92,255,0.28),transparent_70%),radial-gradient(50%_40%_at_80%_90%,rgba(34,211,238,0.18),transparent_70%)]" />
              <HelixField />
            </div>
            <div className="relative aspect-[5/4]">
              {HERO_SHOTS.map((slug, i) => {
                const t = bySlug(slug);
                const pos = [
                  "left-0 top-[6%] w-[62%] -rotate-3 z-10",
                  "right-0 top-0 w-[66%] rotate-2 z-20",
                  "left-[16%] bottom-0 w-[68%] z-30",
                ][i];
                return (
                  <div key={slug} className={`absolute ${pos} overflow-hidden rounded-xl border border-line bg-card shadow-[var(--shadow-lift)]`}>
                    <div className="flex items-center gap-1.5 border-b border-line bg-sunk px-3 py-2">
                      <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                      <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
                      <span className="h-2 w-2 rounded-full bg-[#28c840]" />
                      <span className="ml-2 truncate text-[10.5px] text-faint">{t.name}</span>
                    </div>
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={`/thumbs/${slug}.webp`}
                        alt={`${t.name} template`}
                        fill
                        priority
                        sizes="(max-width: 1024px) 70vw, 380px"
                        className="object-cover object-top"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>

        {/* facts strip */}
        <div className="border-y border-line bg-card">
          <dl className="shell grid grid-cols-2 gap-y-6 py-7 md:grid-cols-4">
            {[
              [CATALOG.length, "templates"],
              [CATEGORIES.length, "business categories"],
              [money(TIERS.starter.priceCents), "starting price, paid once"],
              ["0", "subscriptions or per-site fees"],
            ].map(([n, label]) => (
              <div key={label} className="text-center md:border-r md:border-line md:last:border-0">
                <dt className="sr-only">{label}</dt>
                <dd className="text-[28px] font-semibold tracking-tight">{n}</dd>
                <dd className="mt-0.5 text-[13px] text-muted">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* -------------------------------------------------- categories */}
      <section className="shell pt-20 md:pt-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Shop by business" title="Find the site your business needs.">
            Every template is built for one kind of business, with the pages,
            sections and wording that business actually uses.
          </SectionHeading>
          <Link href="/templates" className="btn btn-secondary">
            Browse all {CATALOG.length} <Icon name="arrow" size={16} />
          </Link>
        </div>
        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c, i) => {
            const inCat = CATALOG.filter((t) => t.category === c);
            const cover = bySlug(CATEGORY_INFO[c].cover) ?? inCat[0];
            return (
              <Reveal key={c} delay={(i % 3) * 0.04} className="h-full">
                <li className="h-full">
                  <Link
                    href={`/templates?category=${encodeURIComponent(c)}`}
                    className="card card-hover group flex h-full items-center gap-4 overflow-hidden rounded-2xl p-3 pr-5"
                  >
                    <span className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl border border-line bg-sunk">
                      {cover && (
                        <Image
                          src={`/thumbs/${cover.slug}.webp`}
                          alt=""
                          fill
                          sizes="112px"
                          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="text-[15.5px] font-semibold tracking-[-0.01em]">{c}</span>
                        <span className="text-[12.5px] text-faint">{inCat.length}</span>
                      </span>
                      <span className="mt-1 block text-[13px] leading-snug text-muted">{CATEGORY_INFO[c].blurb}</span>
                    </span>
                  </Link>
                </li>
              </Reveal>
            );
          })}
        </ul>
      </section>

      {/* -------------------------------------------- what / what / how */}
      <section className="shell py-20 md:py-28">
        <SectionHeading eyebrow="Who we are" title="Good websites shouldn't cost a fortune.">
          Most small businesses don&rsquo;t need a $5,000 agency site or a
          monthly website-builder bill. They need a site that looks
          professional, works on every phone, and can go live today.
          That&rsquo;s what we make.
        </SectionHeading>
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.label} delay={i * 0.05}>
              <div className="card flex h-full flex-col rounded-2xl p-7">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-faint">{p.label}</p>
                <h3 className="mt-3 text-[20px] font-semibold tracking-[-0.015em]">{p.title}</h3>
                <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-muted">{p.body}</p>
                <Link href={p.href} className="group mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-accent">
                  {p.cta} <Icon name="arrow" size={15} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------- why different */}
      <section className="border-y border-line bg-sunk/60">
        <div className="shell py-20 md:py-28">
          <SectionHeading eyebrow="Why Foundry" title="What most template shops won't give you.">
            Plenty of shops sell templates. These are the things we think
            buyers deserve and rarely get.
          </SectionHeading>
          <div className="mt-12">
            <PromiseGrid />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ helix spotlight */}
      <section className="relative overflow-hidden bg-[#07070c] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_75%_40%,rgba(124,92,255,0.25),transparent_70%),radial-gradient(40%_50%_at_95%_90%,rgba(255,138,92,0.12),transparent_70%)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full opacity-70 lg:w-[62%]">
          <HelixField density={1.3} />
        </div>
        <div className="shell relative grid grid-cols-1 gap-10 py-20 md:py-28 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#a5b4fc]">Flagship template</p>
            <h2 className="mt-4 text-[clamp(2rem,4.6vw,3.2rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              Helix.{" "}
              <span className="serif-accent bg-gradient-to-r from-[#c4b5fd] via-[#a5b4fc] to-[#67e8f9] bg-clip-text text-transparent">
                The AI launch page.
              </span>
            </h2>
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-white/70">
              {HELIX.blurb} Built on {HELIX.stack.slice(0, 3).join(", ")}, ready to deploy to Vercel.
            </p>
            <ul className="mt-7 grid max-w-md grid-cols-1 gap-2.5 text-[14px] text-white/80 sm:grid-cols-2">
              {HELIX.features.slice(0, 4).map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="text-[#67e8f9]" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={`/t/${HELIX.slug}`} className="btn btn-on-dark">
                See Helix — {money(TIERS[HELIX.tier].priceCents)} <Icon name="arrow" size={16} />
              </Link>
              <Link href="/templates?category=SaaS%20%26%20apps" className="btn border border-white/20 text-white hover:border-white/50">
                More SaaS templates
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------ two ways to make it yours */}
      <section className="shell py-20 md:py-28">
        <SectionHeading eyebrow="Make it yours" title="Do it yourself, or let us do it." center>
          Either way you end up with a site that looks like your business, not
          like a template.
        </SectionHeading>
        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Reveal className="h-full">
            <div className="card flex h-full flex-col rounded-3xl p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Icon name="pencil" size={22} />
              </span>
              <h3 className="mt-5 text-[22px] font-semibold tracking-[-0.02em]">The online editor</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                Click any text on the page and type. Pick your colours and fonts, set
                page titles for Google, then download your finished site.
              </p>
              <ul className="mt-5 flex flex-1 flex-col gap-2 text-[14px]">
                {["No code and nothing to install", "Changes save to your account", "Included with every HTML template, at every price"].map((x) => (
                  <li key={x} className="flex gap-2"><Check /> {x}</li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/editor/aurora-commerce" className="btn btn-primary">
                  Try the editor free <Icon name="arrow" size={16} />
                </Link>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.06} className="h-full">
            <div className="flex h-full flex-col rounded-3xl bg-night p-8 text-white ring-1 ring-night-line">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#a5b4fc]">
                <Icon name="sparkle" size={22} />
              </span>
              <h3 className="mt-5 text-[22px] font-semibold tracking-[-0.02em]">
                Made for you, in {MADE_FOR_YOU.delivery}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-night-muted">
                Can&rsquo;t find the right template? Answer six questions about your business,
                the look you like, your pages and colours, and we build it for you.
              </p>
              <ul className="mt-5 flex flex-1 flex-col gap-2 text-[14px]">
                {[`${money(MADE_FOR_YOU.priceCents)} per site, built to your brief`, "Live colour preview as you choose", "One round of changes included"].map((x) => (
                  <li key={x} className="flex gap-2"><Check className="text-[#a5b4fc]" /> {x}</li>
                ))}
              </ul>
              <div className="mt-7">
                <BriefButton className="btn btn-on-dark">
                  Start your brief <Icon name="arrow" size={16} />
                </BriefButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------- featured */}
      <section className="shell py-20 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Featured" title="A few good places to start." />
          <Link href="/templates" className="btn btn-secondary">
            See all {CATALOG.length} templates <Icon name="arrow" size={16} />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED.map((t, i) => (
            <Reveal key={t.slug} delay={i * 0.05} className="h-full">
              <TemplateCard t={t} owned={owned.has(t.slug)} rating={ratings.get(t.slug)} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------- how it works */}
      <section className="border-y border-line bg-card">
        <div className="shell py-20 md:py-28">
          <SectionHeading eyebrow="How it works" title="From browsing to live in four steps." center>
            No calls, no quotes, no waiting on a designer.
          </SectionHeading>
          <div className="mt-12">
            <Steps steps={BUY_STEPS} />
          </div>
          <p className="mt-8 text-center text-[14px] text-muted">
            Step-by-step guides for Netlify, Vercel, Cloudflare, Shopify, WordPress and more are in{" "}
            <Link href="/guides" className="font-medium text-accent underline-offset-4 hover:underline">
              Guides
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------- pricing */}
      <section className="shell py-20 md:py-28">
        <SectionHeading eyebrow="Pricing" title="Simple prices. Paid once." center>
          Every template costs {money(TIERS.starter.priceCents)},{" "}
          {money(TIERS.pro.priceCents)} or {money(TIERS.premium.priceCents)}.
          Every HTML template includes the online editor.
        </SectionHeading>
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-4">
          {tiers.map((tier, i) => (
            <Reveal key={tier.id} delay={i * 0.05}>
              <div className="card h-full rounded-2xl p-6">
                <p className="text-[14px] font-semibold">{tier.name}</p>
                <p className="mt-3 text-[40px] font-semibold leading-none tracking-tight">{money(tier.priceCents)}</p>
                <p className="mt-3 text-[13.5px] leading-relaxed text-muted">{tier.note}</p>
                <p className="mt-4 border-t border-line pt-4 text-[12.5px] text-faint">
                  {CATALOG.filter((t) => t.tier === tier.id).length} template
                  {CATALOG.filter((t) => t.tier === tier.id).length === 1 ? "" : "s"}
                </p>
              </div>
            </Reveal>
          ))}
          <Reveal delay={0.15}>
            <div className="flex h-full flex-col rounded-2xl bg-night p-6 text-white">
              <p className="flex items-center justify-between text-[14px] font-semibold">
                Made for you <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px]">Custom</span>
              </p>
              <p className="mt-3 text-[40px] font-semibold leading-none tracking-tight">{money(MADE_FOR_YOU.priceCents)}</p>
              <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-night-muted">
                A site built to your brief in {MADE_FOR_YOU.delivery}.
              </p>
              <BriefButton className="mt-4 border-t border-night-line pt-4 text-left text-[12.5px] font-medium text-[#a5b4fc] hover:underline">
                Start your brief
              </BriefButton>
            </div>
          </Reveal>
        </div>
        <p className="mt-8 text-center">
          <Link href="/pricing" className="btn btn-secondary">
            Compare plans <Icon name="arrow" size={16} />
          </Link>
        </p>
      </section>

      {/* ----------------------------------------------------------- faq */}
      <section className="border-t border-line bg-card">
        <div className="shell grid grid-cols-1 gap-10 py-20 md:py-28 lg:grid-cols-[1fr_1.6fr]">
          <SectionHeading eyebrow="Questions" title="Things people ask before buying.">
            Something else on your mind?{" "}
            <Link href="/contact" className="font-medium text-accent hover:underline">Ask us directly</Link>.
          </SectionHeading>
          <div>
            <Faq items={FAQ.flatMap((g) => g.items).slice(0, 5)} />
            <Link href="/faq" className="group mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-accent">
              All questions <Icon name="arrow" size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <ClosingCta />
      <Footer />
    </>
  );
}
