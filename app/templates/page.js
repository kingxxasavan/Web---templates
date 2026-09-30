import Link from "next/link";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import TemplateBrowser from "@/components/TemplateBrowser";
import AddToCart from "@/components/AddToCart";
import { PageHeader, ClosingCta } from "@/components/sections";
import { currentUser } from "@/lib/auth";
import { ownedSlugs } from "@/lib/store";
import { ratingSummary } from "@/lib/reviews";
import { bundlePriceFor } from "@/lib/pricing";
import { TEMPLATES, TIERS, BUNDLE, money, individualTotal } from "@/lib/catalog";

export const metadata = {
  title: "All templates",
  description:
    "Browse every Foundry template: storefronts, studio sites, restaurants, gyms, portfolios, blogs and launch pages. Preview each page live before you buy.",
};

export default async function TemplatesPage() {
  const user = await currentUser();
  const [owned, ratings] = await Promise.all([
    user ? ownedSlugs(user.id) : Promise.resolve(new Set()),
    ratingSummary(),
  ]);
  const bundlePrice = bundlePriceFor(owned);

  return (
    <>
      <Masthead />
      <PageHeader eyebrow="The collection" title="Every template," accent="ready to preview.">
        {TEMPLATES.length} original sites from {money(TIERS.starter.priceCents)} to{" "}
        {money(TIERS.premium.priceCents)}. Open one to click through its
        pages on phone, tablet or desktop before you spend anything.
      </PageHeader>

      <section className="shell py-12 md:py-16">
        <TemplateBrowser owned={[...owned]} ratings={Object.fromEntries(ratings)} />
      </section>

      {bundlePrice !== null && (
        <section className="shell pb-6">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-night p-8 text-white md:flex-row md:items-center md:p-10">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#a5b4fc]">All-access bundle</p>
              <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.02em]">
                All {TEMPLATES.length} templates, plus every future release, for {money(bundlePrice)}.
              </h2>
              <p className="mt-2 max-w-xl text-[14.5px] text-night-muted">
                {bundlePrice < BUNDLE.priceCents
                  ? `That's ${money(BUNDLE.priceCents)} minus what you already own.`
                  : `${money(individualTotal())} if bought one by one.`}{" "}
                <Link href="/pricing" className="text-white underline underline-offset-4">How pricing works</Link>
              </p>
            </div>
            <AddToCart slug={BUNDLE.slug} label={`Add the bundle — ${money(bundlePrice)}`} variant="dark" />
          </div>
        </section>
      )}

      <ClosingCta
        title="Can't find what you need?"
        accent="Ask for it."
        body="Tell us what kind of site you need. Requests decide what we build next, and we'll email you if yours makes the cut."
        primary={{ href: "/contact?topic=request", label: "Request a template" }}
        secondary={{ href: "/how-it-works", label: "How we build" }}
      />
      <Footer />
    </>
  );
}
