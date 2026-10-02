import Link from "next/link";
import { notFound } from "next/navigation";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import { Icon } from "@/components/icons";
import { PageHeader } from "@/components/sections";
import { GUIDES, guideBySlug } from "@/lib/guides";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }) {
  const g = guideBySlug((await params).slug);
  if (!g) return {};
  const title = g.kind === "topic" ? g.name : `Host your website on ${g.name}`;
  return { title, description: g.summary ?? g.bestFor };
}

export default async function GuidePage({ params }) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();

  const others = GUIDES.filter((o) => o.slug !== g.slug && o.kind === g.kind).slice(0, 4);
  // HowTo structured data, so the steps can appear directly in search.
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: g.kind === "topic" ? g.name : `Put a website template online with ${g.name}`,
    step: g.steps.map((s) => ({ "@type": "HowToStep", name: s.title, text: s.body })),
  };

  return (
    <>
      <Masthead />
      <PageHeader eyebrow={g.kind === "topic" ? "Guide" : "Hosting guide"} title={g.kind === "topic" ? g.name : `Put your site on ${g.name}.`}>
        {g.summary ?? g.bestFor}
      </PageHeader>

      <article className="shell grid grid-cols-1 gap-12 py-12 md:py-16 lg:grid-cols-[1fr_300px]">
        <div>
          <ol className="flex flex-col">
            {g.steps.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[auto_1fr] gap-4 border-t border-line py-6 first:border-t-0 first:pt-0">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[13px] font-semibold text-on-ink">
                  {i + 1}
                </span>
                <div>
                  <h2 className="text-[18px] font-semibold tracking-[-0.01em]">{s.title}</h2>
                  <p className="mt-1.5 text-[15.5px] leading-relaxed text-body">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          {(g.notes?.length || g.helix) && (
            <div className="mt-8 rounded-2xl border border-line bg-sunk p-6">
              <h2 className="text-[15px] font-semibold">Good to know</h2>
              <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-[14.5px] leading-relaxed text-body">
                {g.notes?.map((n) => <li key={n}>{n}</li>)}
                {g.helix && <li><strong className="font-semibold text-ink">Helix:</strong> {g.helix}</li>}
              </ul>
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <dl className="card flex flex-col gap-3 rounded-2xl p-5 text-[14px]">
            {[
              ["Time", g.time],
              ["Cost", g.cost],
              ["Difficulty", g.difficulty],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-faint">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="rounded-2xl border border-accent/20 bg-accent-soft p-5">
            <p className="text-[14.5px] font-semibold text-accent-deep">Stuck, or short on time?</p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-accent-deep/80">
              Ask the developer who built your template, or have us set the whole thing up.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/contact?topic=support" className="btn btn-sm btn-accent">Get help</Link>
              <Link href="/made-for-you" className="btn btn-sm btn-secondary">Made for you</Link>
            </div>
          </div>
          {others.length > 0 && (
            <nav aria-label="Related guides" className="card rounded-2xl p-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-faint">Related</p>
              <ul className="mt-3 flex flex-col gap-2 text-[14px]">
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link href={`/guides/${o.slug}`} className="group inline-flex items-center gap-1.5 hover:text-accent">
                      {o.name} <Icon name="arrow" size={13} className="text-faint group-hover:text-accent" />
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/guides" className="font-medium text-accent hover:underline">All guides</Link>
                </li>
              </ul>
            </nav>
          )}
        </aside>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <Footer />
    </>
  );
}
