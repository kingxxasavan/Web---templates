import Link from "next/link";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import { BriefButton } from "@/components/BriefWizard";
import { Icon } from "@/components/icons";
import { Reveal, Check } from "@/components/store";
import { PageHeader, SectionHeading, ClosingCta, Faq } from "@/components/sections";
import { EXTRAS, FAQ } from "@/lib/content";
import { SITE } from "@/lib/site";
import { CATALOG, TIERS, MADE_FOR_YOU, money } from "@/lib/catalog";

export const metadata = {
  title: "Pricing",
  description: `Every Foundry template is $5, $10 or $15, paid once, with the online editor included. Or have one built to your brief for ${money(MADE_FOR_YOU.priceCents)}.`,
};

// Kept deliberately general: "typical" describes the big multi-vendor
// marketplaces, and nothing here names or claims facts about a competitor.
const COMPARISON = [
  ["Price per template", "$5 to $15", "Often $20 to $60"],
  ["Pay once, keep forever", "Yes", "Sometimes a subscription"],
  ["Projects per purchase", "Unlimited", "Often one per licence"],
  ["Clickable, multi-device previews", "Yes", "Sometimes one demo"],
  ["Made for a specific kind of business", "Always", "Often generic"],
  ["Original author credited", "Always", "Varies by seller"],
  ["Money-back guarantee", `${SITE.refundDays} days`, "Usually only if broken"],
  ["Help from people who know the code", "Yes", "Varies by seller"],
  ["Online editor to customise it", "Every template", "Rarely"],
  ["Built to your brief", `${money(MADE_FOR_YOU.priceCents)}, ${MADE_FOR_YOU.delivery}`, "Quoted separately"],
];

export default function PricingPage() {
  return (
    <>
      <Masthead />
      <PageHeader eyebrow="Pricing" title="Fair prices," accent="paid once.">
        Every template is {money(TIERS.starter.priceCents)},{" "}
        {money(TIERS.pro.priceCents)} or {money(TIERS.premium.priceCents)}.
        No subscriptions and no per-site licences, and every price includes the online
        editor. Can&rsquo;t find the right one? We&rsquo;ll build it for{" "}
        {money(MADE_FOR_YOU.priceCents)}.
      </PageHeader>

      {/* ------------------------------------------------------------ tiers */}
      <section className="shell py-16 md:py-20">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
          {Object.values(TIERS).map((tier, i) => {
            const list = CATALOG.filter((t) => t.tier === tier.id);
            return (
              <Reveal key={tier.id} delay={i * 0.05} className="h-full">
                <div className="card flex h-full flex-col rounded-2xl p-7">
                  <p className="text-[15px] font-semibold">{tier.name}</p>
                  <p className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-[46px] font-semibold leading-none tracking-tight">{money(tier.priceCents)}</span>
                    <span className="text-[13px] text-faint">per template</span>
                  </p>
                  <p className="mt-4 text-[14px] leading-relaxed text-muted">{tier.note}</p>
                  <ul className="mt-5 flex flex-col gap-2 text-[13.5px]">
                    {["Online editor included", "Unlimited projects", `${SITE.refundDays}-day money-back guarantee`].map((f) => (
                      <li key={f} className="flex gap-2"><Check /> {f}</li>
                    ))}
                  </ul>
                  <ul className="mt-6 flex flex-1 flex-col gap-2 border-t border-line pt-5">
                    {list.slice(0, 6).map((t) => (
                      <li key={t.slug}>
                        <Link href={`/t/${t.slug}`} className="group flex items-center justify-between text-[14px] hover:text-accent">
                          <span>
                            {t.name} <span className="text-faint">· {t.category}</span>
                          </span>
                          <Icon name="arrow" size={14} className="text-faint group-hover:text-accent" />
                        </Link>
                      </li>
                    ))}
                    {list.length > 6 && (
                      <li className="pt-1">
                        <Link href="/templates" className="text-[13.5px] font-medium text-accent hover:underline">
                          and {list.length - 6} more
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              </Reveal>
            );
          })}

          <Reveal delay={0.15} className="h-full">
            <div className="flex h-full flex-col rounded-2xl bg-night p-7 text-white ring-1 ring-night">
              <p className="flex items-center justify-between text-[15px] font-semibold">
                Made for you
                <span className="rounded-full bg-[#a5b4fc] px-2.5 py-0.5 text-[11px] font-semibold text-night">Custom</span>
              </p>
              <p className="mt-4 flex items-baseline gap-1.5">
                <span className="text-[46px] font-semibold leading-none tracking-tight">{money(MADE_FOR_YOU.priceCents)}</span>
                <span className="text-[13px] text-night-muted">per site</span>
              </p>
              <p className="mt-4 text-[14px] leading-relaxed text-night-muted">
                Can&rsquo;t find it? Describe the site you want and we build it in {MADE_FOR_YOU.delivery}.
              </p>
              <ul className="mt-6 flex flex-1 flex-col gap-2.5 border-t border-night-line pt-5 text-[14px]">
                {[
                  "Six-question brief with live colour preview",
                  "Your pages, words and colours",
                  "Inspired by any template you like",
                  "That template added to your library",
                  "One round of changes included",
                ].map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="text-[#a5b4fc]" /> {f}
                  </li>
                ))}
              </ul>
              <BriefButton className="btn btn-lg btn-on-dark mt-7 w-full">Start your brief</BriefButton>
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
