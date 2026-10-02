import Link from "next/link";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import { Icon } from "@/components/icons";
import { Reveal } from "@/components/store";
import { PageHeader, ClosingCta } from "@/components/sections";
import { GUIDES, GUIDE_GROUPS } from "@/lib/guides";

export const metadata = {
  title: "Hosting guides",
  description:
    "Step-by-step guides for putting a Foundry template online with Netlify, Vercel, Cloudflare Pages, GitHub Pages, Firebase, cPanel, Shopify, WordPress, Squarespace and Wix.",
};

export default function GuidesPage() {
  return (
    <>
      <Masthead />
      <PageHeader eyebrow="Guides" title="Put your site online," accent="wherever you like.">
        Step-by-step guides for every popular host and site builder, plus
        domains, forms and payments. Most of the hosts are free.
      </PageHeader>

      {GUIDE_GROUPS.map((group) => (
        <section key={group.kind} className="shell py-12 md:py-14">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[24px] font-semibold tracking-[-0.02em]">{group.title}</h2>
            <p className="text-[14px] text-muted">{group.blurb}</p>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GUIDES.filter((g) => g.kind === group.kind).map((g, i) => (
              <Reveal key={g.slug} delay={(i % 3) * 0.04} className="h-full">
                <Link href={`/guides/${g.slug}`} className="card card-hover group flex h-full flex-col rounded-2xl p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-[17px] font-semibold">{g.name}</h3>
                    <span className="rounded-full bg-sunk px-2.5 py-1 text-[11.5px] text-muted">{g.difficulty}</span>
                  </div>
                  <p className="mt-2 flex-1 text-[14px] leading-relaxed text-muted">{g.summary ?? g.bestFor}</p>
                  <p className="mt-5 flex items-center justify-between text-[12.5px] text-faint">
                    <span className="inline-flex items-center gap-1.5"><Icon name="clock" size={14} /> {g.time}</span>
                    <span className="inline-flex items-center gap-1 font-medium text-ink opacity-70 group-hover:opacity-100">
                      Read <Icon name="arrow" size={14} />
                    </span>
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      ))}

      <ClosingCta
        title="Rather we set it up?"
        accent="Made for you."
        body="Answer six quick questions and we'll build your website in under two weeks, ready to put online."
        primary={{ href: "/made-for-you", label: "See Made for you" }}
        secondary={{ href: "/contact?topic=support", label: "Ask a question" }}
      />
      <Footer />
    </>
  );
}
