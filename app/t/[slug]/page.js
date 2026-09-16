import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import AddToCart from "@/components/AddToCart";
import TemplateCard from "@/components/TemplateCard";
import { Check, Badge } from "@/components/store";
import { currentUser } from "@/lib/auth";
import { ownedSlugs } from "@/lib/store";
import { TEMPLATES, TIERS, bySlug, money } from "@/lib/catalog";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const t = bySlug(slug);
  if (!t) return {};
  return {
    title: `${t.name} — ${t.tagline} template`,
    description: t.blurb,
    openGraph: {
      title: `${t.name} — ${t.tagline} template`,
      description: t.blurb,
      images: [`/thumbs/${t.slug}.webp`],
    },
  };
}

export default async function TemplatePage({ params }) {
  const { slug } = await params;
  const t = bySlug(slug);
  if (!t) notFound();

  const user = await currentUser();
  const owned = user ? await ownedSlugs(user.id) : new Set();
  const isOwned = owned.has(t.slug);
  const price = TIERS[t.tier].priceCents;
  const others = TEMPLATES.filter((o) => o.slug !== t.slug).slice(0, 3);

  return (
    <>
      <Masthead />

      <article className="px-6 pb-16 pt-10">
        <div className="mx-auto w-full max-w-6xl">
          <Link
            href="/#templates"
            className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-ink"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M13 8H3M7 4L3 8l4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            All templates
          </Link>

          <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
            <div>
              <div className="card overflow-hidden rounded-2xl">
                <Image
                  src={`/thumbs/${t.slug}.webp`}
                  alt={`${t.name} template preview`}
                  width={1100}
                  height={825}
                  priority
                  className="w-full"
                />
              </div>

              <div className="mt-10">
                <h2 className="text-[20px] tracking-[-0.015em]">
                  What&rsquo;s included
                </h2>
                <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {t.features.map((f) => (
                    <li key={f} className="flex gap-2.5">
                      <Check />
                      <span className="text-[13.5px] leading-snug text-muted">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-10">
                <h2 className="text-[20px] tracking-[-0.015em]">
                  Getting it running
                </h2>
                <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted">
                  Unzip the folder and run:
                </p>
                <pre className="mt-3 overflow-x-auto rounded-xl border border-line bg-raise px-4 py-3 text-[13px] text-ink">
                  <code>{t.build}</code>
                </pre>
                <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-faint">
                  The download contains the complete, unminified source plus a
                  README and the licence for this template.
                </p>
              </div>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="card rounded-2xl p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-[22px] tracking-[-0.015em]">{t.name}</h1>
                    <p className="mt-1 text-[13.5px] text-muted">{t.tagline}</p>
                  </div>
                  {isOwned ? (
                    <Badge tone="accent">Owned</Badge>
                  ) : (
                    t.tier === "pro" && <Badge>Pro</Badge>
                  )}
                </div>

                <p className="mt-4 text-[13.5px] leading-relaxed text-muted">
                  {t.blurb}
                </p>

                <div className="mt-6 flex items-baseline gap-2 border-t border-line pt-6">
                  <span className="font-display text-4xl tracking-tight">
                    {money(price)}
                  </span>
                  <span className="text-[12.5px] text-faint">
                    one-time payment
                  </span>
                </div>

                <AddToCart
                  slug={t.slug}
                  owned={isOwned}
                  label={`Add to cart — ${money(price)}`}
                  className="mt-5 w-full"
                />

                <dl className="mt-6 flex flex-col gap-3 border-t border-line pt-5 text-[13px]">
                  {[
                    ["Built for", t.audience],
                    ["Pages", t.pages],
                    ["Stack", t.stack.join(", ")],
                    ["Licence", "Commercial, no attribution"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <dt className="shrink-0 text-faint">{k}</dt>
                      <dd className="text-right text-muted">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <p className="mt-4 px-1 text-[12px] leading-relaxed text-faint">
                Original work — not a repackaged open-source theme, so there is
                no upstream licence to comply with.
              </p>
            </aside>
          </div>

          <div className="mt-20">
            <h2 className="mb-6 text-[20px] tracking-[-0.015em]">
              Other templates
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((o) => (
                <TemplateCard key={o.slug} t={o} owned={owned.has(o.slug)} />
              ))}
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </>
  );
}
