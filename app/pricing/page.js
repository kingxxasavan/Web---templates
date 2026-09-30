import Link from "next/link";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import AddToCart from "@/components/AddToCart";
import { Icon } from "@/components/icons";
import { Reveal, Check } from "@/components/store";
import { PageHeader, SectionHeading, ClosingCta, Faq } from "@/components/sections";
import { currentUser } from "@/lib/auth";
import { ownedSlugs } from "@/lib/store";
import { bundlePriceFor } from "@/lib/pricing";
import { EXTRAS, FAQ } from "@/lib/content";
import { SITE } from "@/lib/site";
import { TEMPLATES, TIERS, BUNDLE, MADE_FOR_YOU, money, individualTotal, priceOf } from "@/lib/catalog";

export const metadata = {
  title: "Pricing",
  description: `Every Foundry template is $5, $10 or $15, paid once. The all-access bundle is ${money(BUNDLE.priceCents)}, and anything you already own counts toward it.`,
};

// Kept deliberately general: "typical" describes the big multi-vendor
// marketplaces, and nothing here names or claims facts about a competitor.
const COMPARISON = [
  ["Price per template", "$5 to $15", "Often $20 to $60"],
  ["Pay once, keep forever", "Yes", "Sometimes a subscription"],
  ["Projects per purchase", "Unlimited", "Often one per licence"],
  ["Clickable, multi-device previews", "Yes", "Sometimes one demo"],
  ["Written from scratch", "Always", "Varies by seller"],
  ["What you own counts toward a bundle", "Yes", "Rarely"],
  ["Money-back guarantee", `${SITE.refundDays} days`, "Usually only if broken"],
  ["Help from the person who built it", "Yes", "Varies by seller"],
  ["Online editor to customise it", "Pro and All-access", "Rarely"],
  ["Set up for your business", `${money(MADE_FOR_YOU.priceCents)}, ${MADE_FOR_YOU.days} days`, "Quoted separately"],
];

export default async function PricingPage() {
  const user = await currentUser();
  const owned = user ? await ownedSlugs(user.id) : new Set();
  const bundlePrice = bundlePriceFor(owned);
  const example = TEMPLATES.find((t) => t.tier === "pro");

  return (
    <>
      <Masthead />
      <PageHeader eyebrow="Pricing" title="Fair prices," accent="paid once.">
        Every template is {money(TIERS.starter.priceCents)},{" "}
        {money(TIERS.pro.priceCents)} or {money(TIERS.premium.priceCents)}.
        No subscriptions, no per-site licences, and nothing you buy is ever
        wasted: it all counts toward the bundle.
      </PageHeader>

      {/* ------------------------------------------------------------ tiers */}
      <section className="shell py-16 md:py-20">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
          {Object.values(TIERS).map((tier, i) => {
            const list = TEMPLATES.filter((t) => t.tier === tier.id);
            return (
              <Reveal key={tier.id} delay={i * 0.05} className="h-full">
                <div className="card flex h-full flex-col rounded-2xl p-7">
                  <p className="text-[15px] font-semibold">{tier.name}</p>
                  <p className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-[46px] font-semibold leading-none tracking-tight">{money(tier.priceCents)}</span>
                    <span className="text-[13px] text-faint">per template</span>
                  </p>
                  <p className="mt-4 text-[14px] leading-relaxed text-muted">{tier.note}</p>
                  <ul className="mt-6 flex flex-1 flex-col gap-2 border-t border-line pt-5">
                    {list.map((t) => (
                      <li key={t.slug}>
                        <Link href={`/t/${t.slug}`} className="group flex items-center justify-between text-[14px] hover:text-accent">
                          <span>
                            {t.name} <span className="text-faint">· {t.category}</span>
                          </span>
                          <Icon name="arrow" size={14} className="text-faint group-hover:text-accent" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}

          <Reveal delay={0.15} className="h-full">
            <div className="flex h-full flex-col rounded-2xl bg-night p-7 text-white ring-1 ring-night">
              <p className="flex items-center justify-between text-[15px] font-semibold">
                All-access
                <span className="rounded-full bg-[#a5b4fc] px-2.5 py-0.5 text-[11px] font-semibold text-night">Best value</span>
              </p>
              <p className="mt-4 flex items-baseline gap-2">
                <span className="text-[46px] font-semibold leading-none tracking-tight">
                  {money(bundlePrice ?? BUNDLE.priceCents)}
                </span>
                {bundlePrice !== null && bundlePrice < BUNDLE.priceCents && (
                  <span className="text-[16px] text-night-muted line-through">{money(BUNDLE.priceCents)}</span>
                )}
              </p>
              <p className="mt-4 text-[14px] leading-relaxed text-night-muted">
                {bundlePrice !== null && bundlePrice < BUNDLE.priceCents
                  ? "Your price, with the templates you already own taken off."
                  : `All ${TEMPLATES.length} templates, worth ${money(individualTotal())} separately.`}
              </p>
              <ul className="mt-6 flex flex-1 flex-col gap-2.5 border-t border-night-line pt-5 text-[14px]">
                {[
                  `Every template (${TEMPLATES.length} today)`,
                  "Every future template, free",
                  "Online editor for every HTML template",
                  "One download with everything",
                  "Same licence, unlimited projects",
                ].map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="text-[#a5b4fc]" /> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                {bundlePrice === null ? (
                  <Link href="/account" className="btn btn-lg btn-on-dark w-full">You own everything</Link>
                ) : (
                  <AddToCart slug={BUNDLE.slug} label="Get all-access" variant="dark" className="w-full" />
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------ made for you */}
      <section className="shell pb-16 md:pb-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-accent/20 bg-accent-soft p-8 md:flex-row md:items-center md:p-10">
          <div className="max-w-2xl">
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">Made for you</p>
            <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.02em] text-accent-deep">
              Rather not do it yourself? {money(MADE_FOR_YOU.priceCents)}, set up in {MADE_FOR_YOU.days} days.
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-accent-deep/80">
              Send a short brief and we set a template up for your business: your words,
              colours, pages and links. The template is included, and so is one round of tweaks.
            </p>
          </div>
          <Link href="/made-for-you" className="btn btn-lg btn-accent shrink-0">
            Start your brief <Icon name="arrow" size={16} />
          </Link>
        </div>
      </section>

      {/* --------------------------------------------------- never pay twice */}
      <section className="border-y border-line bg-card">
        <div className="shell grid grid-cols-1 items-center gap-12 py-16 md:py-24 lg:grid-cols-2">
          <SectionHeading eyebrow="Never pay twice" title="Start with one template. Upgrade whenever you like.">
            The price of every template you already own comes off the bundle,
            automatically. Upgrading later never costs more than buying
            everything on day one would have.
          </SectionHeading>
          <Reveal>
            <div className="card rounded-2xl p-7">
              <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-faint">An example</p>
              <dl className="mt-5 flex flex-col gap-3 text-[15px]">
                <div className="flex justify-between">
                  <dt>Last month you bought {example.name}</dt>
                  <dd className="text-muted">{money(priceOf(example))}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Today, the all-access bundle</dt>
                  <dd className="text-muted">{money(BUNDLE.priceCents)}</dd>
                </div>
                <div className="flex justify-between text-good">
                  <dt>Credit for what you own</dt>
                  <dd>−{money(priceOf(example))}</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-3 text-[18px] font-semibold">
                  <dt>You pay</dt>
                  <dd>{money(BUNDLE.priceCents - priceOf(example))}</dd>
                </div>
              </dl>
              <p className="mt-5 text-[13px] leading-relaxed text-muted">
                Worked out in your cart. There&rsquo;s nothing to claim and no code to enter.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------ comparison */}
      <section className="shell py-16 md:py-24">
        <SectionHeading eyebrow="Compared" title="How we compare with the usual template marketplace." center />
        <Reveal>
          <div className="card mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-sunk text-[12.5px] text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3.5 font-medium"><span className="sr-only">Feature</span></th>
                  <th scope="col" className="px-5 py-3.5 font-semibold text-ink">{SITE.name}</th>
                  <th scope="col" className="px-5 py-3.5 font-medium">Typical marketplace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {COMPARISON.map(([label, us, them]) => (
                  <tr key={label}>
                    <th scope="row" className="px-5 py-3.5 font-normal text-muted">{label}</th>
                    <td className="px-5 py-3.5 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="check" size={15} strokeWidth={2.2} className="text-good" /> {us}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-faint">{them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------- every plan */}
      <section className="border-y border-line bg-sunk/60">
        <div className="shell grid grid-cols-1 gap-10 py-16 md:py-24 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeading eyebrow="Included" title="Whichever you choose, you get all of this." />
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {EXTRAS.map((e) => (
              <li key={e} className="card flex gap-2.5 rounded-xl p-4 text-[14px]">
                <Check /> {e}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="shell grid grid-cols-1 gap-10 py-16 md:py-24 lg:grid-cols-[1fr_1.6fr]">
        <SectionHeading eyebrow="Questions" title="About paying." />
        <Faq items={FAQ.find((g) => g.group === "Buying").items} />
      </section>

      <ClosingCta />
      <Footer />
    </>
  );
}
