import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { marked } from "marked";
import { notFound } from "next/navigation";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import AddToCart from "@/components/AddToCart";
import TemplateCard from "@/components/TemplateCard";
import { Check, Badge } from "@/components/store";
import { Icon } from "@/components/icons";
import Reviews from "@/components/Reviews";
import LivePreview from "@/components/LivePreview";
import TrackEvent from "@/components/TrackEvent";
import Stars from "@/components/Stars";
import { currentUser } from "@/lib/auth";
import { libraryFor } from "@/lib/store";
import { editorAccess } from "@/lib/editor-core";
import { CATALOG, TIERS, MADE_FOR_YOU, bySlug, money, pageCount, isOpenSource } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { reviewsFor, ratingFor, myReview } from "@/lib/reviews";

/** The template's README as HTML. Our own files, so safe to render. */
async function readDocs(slug) {
  try {
    const md = await readFile(path.join(process.cwd(), "templates", slug, "README.md"), "utf8");
    // The README's title repeats the template name shown above it.
    return marked.parse(md.replace(/^# .*\n/, ""));
  } catch {
    return null;
  }
}

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
  const [library, reviews, rating, docs] = await Promise.all([
    libraryFor(user?.id),
    reviewsFor(t.slug),
    ratingFor(t.slug),
    readDocs(t.slug),
  ]);
  const { owned } = library;
  const isOwned = owned.has(t.slug);
  const canEdit = editorAccess(t, library).ok;
  const mine = user && isOwned ? await myReview(user.id, t.slug) : null;
  const price = TIERS[t.tier].priceCents;
  const src = isOpenSource(t) ? t.source : null;
  const licence = src
    ? `${src.license}${src.attributionRequired ? ", credit the author" : ", keep the notice"}`
    : t.photos
      ? "Commercial; photos CC BY 2.0"
      : "Commercial, no attribution";
  // Same category first, then anything else, so "more like this" means it.
  const others = [
    ...CATALOG.filter((o) => o.slug !== t.slug && o.category === t.category),
    ...CATALOG.filter((o) => o.slug !== t.slug && o.category !== t.category),
  ].slice(0, 3);

  return (
    <>
      <Masthead />
      <TrackEvent
        name="view_item"
        params={{
          currency: "USD",
          value: price / 100,
          items: [{ item_id: t.slug, item_name: t.name, item_category: t.category, item_variant: t.tier, price: price / 100 }],
        }}
      />

      <article className="pb-16 pt-8">
        <div className="shell">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-muted">
            <Link href="/templates" className="inline-flex items-center gap-1.5 hover:text-ink">
              <Icon name="back" size={14} /> All templates
            </Link>
            <span className="text-line-strong">/</span>
            <span>{t.category}</span>
          </nav>

          <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
            <div>
              <LivePreview template={t} />

              <div className="mt-12">
                <h2 className="text-[22px] font-semibold tracking-[-0.02em]">
                  What&rsquo;s included
                </h2>
                <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {t.features.map((f) => (
                    <li key={f} className="flex gap-2.5 text-[14.5px] leading-snug">
                      <Check />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-12">
                <h2 className="text-[22px] font-semibold tracking-[-0.02em]">
                  Getting it running
                </h2>
                <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-muted">
                  Unzip the folder and run:
                </p>
                <pre className="mt-3 overflow-x-auto rounded-xl bg-night px-4 py-3.5 text-[13.5px] text-white">
                  <code>{t.build}</code>
                </pre>
                <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted">
                  The download is the complete, unminified source with a README
                  and the licence.{" "}
                  <Link href="/guides" className="font-medium text-accent hover:underline">
                    Guides for every host, from Netlify to Shopify
                  </Link>
                </p>
              </div>

              {docs && (
                <details className="card group mt-12 rounded-2xl">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 [&::-webkit-details-marker]:hidden">
                    <span>
                      <span className="flex items-center gap-2 text-[18px] font-semibold tracking-[-0.015em]">
                        <Icon name="book" size={19} /> Documentation
                      </span>
                      <span className="mt-1 block text-[13.5px] text-muted">
                        The full README that comes in the download. Read it before you buy.
                      </span>
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-transform duration-300 group-open:rotate-45">
                      <Icon name="plus" size={14} />
                    </span>
                  </summary>
                  <div className="doc-prose border-t border-line p-6" dangerouslySetInnerHTML={{ __html: docs }} />
                </details>
              )}
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="card rounded-2xl p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-[26px] font-semibold tracking-[-0.02em]">{t.name}</h1>
                    <p className="mt-1 text-[14px] text-muted">{t.tagline}</p>
                  </div>
                  {isOwned ? (
                    <Badge tone="good">Owned</Badge>
                  ) : (
                    <Badge>{TIERS[t.tier].name}</Badge>
                  )}
                </div>

                {rating.count > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <Stars value={rating.average} />
                    <span className="text-[12.5px] text-muted">
                      {rating.average.toFixed(1)} · {rating.count} review
                      {rating.count > 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                <p className="mt-4 text-[14px] leading-relaxed text-muted">
                  {t.blurb}
                </p>

                <div className="mt-6 flex items-baseline gap-2 border-t border-line pt-6">
                  <span className="text-[40px] font-semibold leading-none tracking-tight">
                    {money(price)}
                  </span>
                  <span className="text-[13px] text-faint">
                    one-time payment
                  </span>
                </div>

                <AddToCart
                  slug={t.slug}
                  owned={isOwned}
                  label={`Add to cart — ${money(price)}`}
                  className="mt-5 w-full"
                />

                {t.livePreview && (
                  <Link href={`/editor/${t.slug}`} className="btn btn-secondary mt-3 w-full">
                    <Icon name="pencil" size={16} />
                    {canEdit ? "Customise in the editor" : "Try the online editor free"}
                  </Link>
                )}

                <ul className="mt-5 flex flex-col gap-2 text-[13px] text-muted">
                  {[
                    "Instant download",
                    src?.attributionRequired ? "Unlimited projects, keep the author credit" : "Unlimited personal and client projects",
                    `${SITE.refundDays}-day money-back guarantee`,
                  ].map((x) => (
                    <li key={x} className="flex items-center gap-2">
                      <Icon name="check" size={14} strokeWidth={2.2} className="text-good" /> {x}
                    </li>
                  ))}
                </ul>

                <dl className="mt-6 flex flex-col gap-3 border-t border-line pt-5 text-[13px]">
                  {[
                    ["Built for", t.audience],
                    ["Pages", pageCount(t)],
                    ["Stack", t.stack.join(", ")],
                    [
                      "Online editor",
                      !t.livePreview ? "Edited in code" : "Included",
                    ],
                    ["Licence", licence],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <dt className="shrink-0 text-faint">{k}</dt>
                      <dd className="text-right text-muted">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {t.livePreview && (
                <Link
                  href={`/made-for-you?template=${t.slug}&start=1`}
                  className="card card-hover mt-4 flex items-start gap-3 rounded-2xl p-5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <Icon name="sparkle" size={18} />
                  </span>
                  <span>
                    <span className="block text-[14px] font-semibold">Want it built to your brief?</span>
                    <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">
                      We&rsquo;ll build a site inspired by {t.name}, made to your liking, in{" "}
                      {MADE_FOR_YOU.delivery}. {money(MADE_FOR_YOU.priceCents)}.
                    </span>
                  </span>
                </Link>
              )}

              <p className="mt-4 px-1 text-[12.5px] leading-relaxed text-faint">
                {src ? (
                  <>
                    Based on{" "}
                    <a className="underline underline-offset-2 hover:text-ink" href={src.url} target="_blank" rel="noopener noreferrer">
                      {src.design ?? "a design"} by {src.provider}
                    </a>
                    , which is free from its author. This edition is reworked for{" "}
                    {t.category.toLowerCase()} with new copy, colours, type and artwork, plus a setup
                    guide. It keeps the{" "}
                    <a className="underline underline-offset-2 hover:text-ink" href={src.licenseUrl} target="_blank" rel="noopener noreferrer">
                      {src.license} licence
                    </a>
                    {src.attributionRequired
                      ? ", so the author's credit stays visible on your site."
                      : ", so its copyright notice stays in the source."}
                  </>
                ) : t.photos ? (
                  <>
                    An original Foundry design. Its commercial licence covers personal and client
                    projects, with no credit required for the template. The photographs are by
                    named photographers under{" "}
                    <a className="underline underline-offset-2 hover:text-ink" href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noopener noreferrer">
                      CC BY 2.0
                    </a>
                    : keep the included credits page if you keep them, or swap in your own.
                  </>
                ) : (
                  "An original Foundry design. Its commercial licence covers personal and client projects, with no credit required."
                )}
              </p>
            </aside>
          </div>

          <Reviews
            slug={t.slug}
            initialReviews={reviews}
            canReview={isOwned}
            mine={mine}
          />

          <div className="mt-20">
            <h2 className="mb-6 text-[22px] font-semibold tracking-[-0.02em]">
              You might also like
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
