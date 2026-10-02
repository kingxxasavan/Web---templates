import Link from "next/link";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import TemplateBrowser from "@/components/TemplateBrowser";
import { PageHeader, ClosingCta } from "@/components/sections";
import { currentUser } from "@/lib/auth";
import { ownedSlugs } from "@/lib/store";
import { ratingSummary } from "@/lib/reviews";
import { CATALOG, TIERS, CATEGORIES, MADE_FOR_YOU, money } from "@/lib/catalog";
import CustomRequestNotice, { CustomRequestBand } from "@/components/CustomRequestNotice";

export const metadata = {
  title: "All templates",
  description:
    "Browse every Foundry template: online stores, SaaS launches, agencies, restaurants, local services, portfolios, blogs and events. Preview each page live before you buy.",
};

export default async function TemplatesPage({ searchParams }) {
  const { category } = await searchParams;
  const user = await currentUser();
  const [owned, ratings] = await Promise.all([
    user ? ownedSlugs(user.id) : Promise.resolve(new Set()),
    ratingSummary(),
  ]);

  return (
    <>
      <Masthead />
      <PageHeader eyebrow="The collection" title="Every template," accent="ready to preview.">
        {CATALOG.length} sites for {CATEGORIES.length} kinds of business, from{" "}
        {money(TIERS.starter.priceCents)} to {money(TIERS.premium.priceCents)}. Open
        one to click through its pages on phone, tablet or desktop before you
        spend anything.
      </PageHeader>

      <section className="shell py-12 md:py-16">
        <TemplateBrowser
          owned={[...owned]}
          ratings={Object.fromEntries(ratings)}
          initialCategory={CATEGORIES.includes(category) ? category : "All"}
        />
      </section>

      <section className="shell pb-6">
        <CustomRequestBand price={money(MADE_FOR_YOU.priceCents)} delivery={MADE_FOR_YOU.delivery} />
      </section>
      <CustomRequestNotice price={money(MADE_FOR_YOU.priceCents)} delivery={MADE_FOR_YOU.delivery} />

      <ClosingCta
        title="Every template includes"
        accent="the online editor."
        body="Change the words, colours and fonts on every page in your browser, then download your finished site. No code, whichever price you pick."
        primary={{ href: "/editor/aurora-commerce", label: "Try the editor" }}
        secondary={{ href: "/how-it-works", label: "How we build" }}
      />
      <Footer />
    </>
  );
}
