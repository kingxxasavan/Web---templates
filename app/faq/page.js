import Link from "next/link";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import { PageHeader, Faq, ClosingCta } from "@/components/sections";
import { FAQ } from "@/lib/content";

export const metadata = {
  title: "Frequently asked questions",
  description: "Answers about buying, using and licensing Foundry website templates.",
};

// Structured data so search engines can show the answers directly.
const schema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.flatMap((g) => g.items).map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FaqPage() {
  return (
    <>
      <Masthead />
      <PageHeader eyebrow="FAQ" title="Questions," accent="answered.">
        Can&rsquo;t find what you&rsquo;re looking for?{" "}
        <Link href="/contact" className="font-medium text-accent hover:underline">
          Send us a message
        </Link>{" "}
        and a real person will reply.
      </PageHeader>

      <section className="shell py-16 md:py-20">
        <div className="flex flex-col gap-14">
          {FAQ.map((g) => (
            <div key={g.group} className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
              <h2 className="text-[20px] font-semibold tracking-[-0.015em]">{g.group}</h2>
              <Faq items={g.items} />
            </div>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <ClosingCta />
      <Footer />
    </>
  );
}
