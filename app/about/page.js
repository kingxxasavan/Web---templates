import Link from "next/link";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import { Icon } from "@/components/icons";
import { Reveal } from "@/components/store";
import { PageHeader, SectionHeading, PromiseGrid, ClosingCta } from "@/components/sections";
import { CATALOG, CATEGORIES, TIERS, money, pageCount } from "@/lib/catalog";

export const metadata = {
  title: "About us",
  description:
    "Foundry is an independent studio making website templates for specific kinds of business: online stores, SaaS products, agencies, restaurants, local services and portfolios.",
};

const PRINCIPLES = [
  {
    title: "Honest about where it comes from",
    body: "Some templates are our own designs; others are reworked editions of free open-source designs. Every listing says which, names the original author, and tells you what the licence asks before you buy.",
  },
  {
    title: "Readable beats clever",
    body: "If you open a file and can't tell what it does, we've failed. Our code is written to be changed by the person who bought it, not just admired by other developers.",
  },
  {
    title: "Priced for people starting out",
    body: `A new business has a hundred costs. A website shouldn't be a big one, so every template is ${money(TIERS.starter.priceCents)} to ${money(TIERS.premium.priceCents)}, paid once.`,
  },
  {
    title: "Show, don't claim",
    body: "Anyone can say their templates are well made. We'd rather you tried the pages yourself, so our HTML templates run live, right on their product pages.",
  },
];

const AUDIENCES = [
  {
    icon: "bolt",
    title: "Small business owners",
    body: "Restaurants, gyms, shops and studios who need a professional site this week, not a three-month agency project.",
  },
  {
    icon: "layers",
    title: "Freelancers and agencies",
    body: "A clean starting point for client work. The licence covers unlimited client projects, so one purchase keeps paying off.",
  },
  {
    icon: "sparkle",
    title: "Founders and makers",
    body: "Launch pages, changelogs and storefronts that look established on day one, while you spend your time on the product.",
  },
  {
    icon: "code",
    title: "Students and new developers",
    body: "Readable, well-structured code worth learning from, at a price that won't hurt.",
  },
];

export default function AboutPage() {
  const totalPages = CATALOG.reduce((n, t) => n + pageCount(t), 0);

  return (
    <>
      <Masthead />
      <PageHeader eyebrow="About us" title="We make websites people can" accent="actually afford.">
        Foundry is an independent template studio. We make complete website
        templates for specific kinds of business, so they can look
        professional online without paying agency prices or renting a site
        builder every month.
      </PageHeader>

      {/* story */}
      <section className="shell grid grid-cols-1 gap-12 py-16 md:py-24 lg:grid-cols-2">
        <SectionHeading eyebrow="Why we started" title="Template shops had stopped serving the people who need them most." />
        <Reveal>
          <div className="flex flex-col gap-5 text-[16px] leading-relaxed text-body">
            <p>
              Look for a website template today and you&rsquo;ll find
              thousands: generic layouts full of lorem ipsum, open-source
              themes resold under new names with no credit to their authors,
              and previews that turn out to be a single screenshot.
            </p>
            <p>
              We wanted the opposite: a collection where every template is made
              for a real kind of business, where the licence fits in a
              paragraph and the original authors are credited, and where you can
              click through the pages yourself before spending a cent.
            </p>
            <p>
              So that&rsquo;s what Foundry is. We would rather sell {CATALOG.length}{" "}
              templates we&rsquo;re proud of than {CATALOG.length * 100} we
              aren&rsquo;t, and we keep prices low because the people who need
              a good website most are usually the ones just getting started.
            </p>
          </div>
        </Reveal>
      </section>

      {/* numbers */}
      <section className="border-y border-line bg-card">
        <dl className="shell grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
          {[
            [CATALOG.length, "templates"],
            [totalPages, "hand-built pages"],
            [CATEGORIES.length, "kinds of business covered"],
            ["$0", "to preview every page first"],
          ].map(([n, label]) => (
            <div key={label}>
              <dt className="sr-only">{label}</dt>
              <dd className="text-[40px] font-semibold leading-none tracking-tight">{n}</dd>
              <dd className="mt-2 text-[14px] text-muted">{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* principles */}
      <section className="shell py-16 md:py-24">
        <SectionHeading eyebrow="What we believe" title="Four rules every template has to pass." />
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.title} delay={(i % 2) * 0.05}>
              <div className="card h-full rounded-2xl p-7">
                <p className="text-[13px] font-semibold text-accent">0{i + 1}</p>
                <h3 className="mt-2 text-[19px] font-semibold tracking-[-0.015em]">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* who for */}
      <section className="border-y border-line bg-sunk/60">
        <div className="shell py-16 md:py-24">
          <SectionHeading eyebrow="Who it's for" title="Built for people who need a website, not a project." />
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCES.map((a, i) => (
              <Reveal key={a.title} delay={i * 0.05}>
                <div className="card h-full rounded-2xl p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <Icon name={a.icon} size={20} />
                  </span>
                  <h3 className="mt-4 text-[16px] font-semibold">{a.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">{a.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* promises */}
      <section className="shell py-16 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Our promises" title="What you can hold us to." />
          <Link href="/how-it-works" className="btn btn-secondary">
            See how we build <Icon name="arrow" size={16} />
          </Link>
        </div>
        <div className="mt-10">
          <PromiseGrid />
        </div>
      </section>

      <ClosingCta />
      <Footer />
    </>
  );
}
