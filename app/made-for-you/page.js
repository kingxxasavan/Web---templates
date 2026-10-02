import Link from "next/link";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import { BriefButton } from "@/components/BriefWizard";
import { Icon } from "@/components/icons";
import { Reveal, Check } from "@/components/store";
import { PageHeader, SectionHeading, Faq } from "@/components/sections";
import { openBuildCount } from "@/lib/builds";
import { MADE_FOR_YOU, money } from "@/lib/catalog";
import { PALETTES } from "@/lib/brief";
import { SITE } from "@/lib/site";

const price = money(MADE_FOR_YOU.priceCents);

export const metadata = {
  title: `Made for you — a website built to your brief in ${MADE_FOR_YOU.delivery}`,
  description: `Can't find the right template? Answer a few questions and we'll build a website to your liking in ${MADE_FOR_YOU.delivery}, for ${price}.`,
};

const QUESTIONS = [
  { icon: "layers", title: "Your business", body: "What kind of business it is, its name and what you do in one line." },
  { icon: "eye", title: "A template you like", body: "We show the five that suit you best. Pick one for inspiration, or let us choose." },
  { icon: "pencil", title: "What it should say", body: "Describe the business, your customers and how the site should feel." },
  { icon: "book", title: "Your pages", body: "How many pages, and what goes on each. We suggest the usual ones for your kind of business." },
  { icon: "sparkle", title: "Your colours", body: "Pick a palette and fine-tune it, with a live preview of how your site will look." },
  { icon: "check", title: "Your brief", body: "Your answers become one clear brief, like a prompt for your website. Check it, pay, done." },
];

const INCLUDED = [
  "A website built to your brief, not just a reskin",
  "Your business name, words and contact details on every page",
  "The pages you asked for, in your colours",
  "Links to your socials, booking or shop",
  "Page titles and descriptions written for Google",
  "Contact forms ready to send to your inbox",
  "The template it's inspired by, in your library",
  "One round of changes after delivery",
];

const FAQ = [
  {
    q: "How is this different from buying a template?",
    a: "A template is yours to set up. Made for you is for when nothing fits quite right, or you'd rather not do it yourself: you describe what you need and we build it, using our templates as the starting point so it stays fast and affordable.",
  },
  {
    q: `When does the ${MADE_FOR_YOU.days}-day clock start?`,
    a: "When your payment goes through. The due date shows in your library straight away, and most sites are delivered sooner.",
  },
  {
    q: "What if I don't have any words or photos yet?",
    a: "Tell us what your business does and we'll write clear placeholder copy you can change whenever you like. Where you haven't got photos, we use tasteful placeholders that show the size each image should be.",
  },
  {
    q: "Why is there sometimes a waiting list?",
    a: `We take ${MADE_FOR_YOU.maxOpen} builds at a time, so every one we accept is delivered on time. If we're full, your brief stays saved and you can send it when a slot opens.`,
  },
  {
    q: "Can I edit it myself afterwards?",
    a: "Yes. You get the full site files and it works with our online editor, so you can change any words, colours or fonts later.",
  },
  {
    q: "What if I'm not happy?",
    a: `One round of changes is included, and our ${SITE.refundDays}-day money-back guarantee applies here too.`,
  },
];

export default async function MadeForYouPage() {
  const open = await openBuildCount();
  const slotsLeft = Math.max(MADE_FOR_YOU.maxOpen - open, 0);

  return (
    <>
      <Masthead />
      <PageHeader eyebrow="Made for you" title="Can't find the right template?" accent="We'll build yours.">
        Answer six quick questions about your business, the look you like and the pages you
        need. We turn it into a brief and build your site in{" "}
        <strong className="text-ink">{MADE_FOR_YOU.delivery}</strong>, for{" "}
        <strong className="text-ink">{price}</strong>.
        <span className="mt-6 flex flex-wrap gap-3">
          <BriefButton className="btn btn-lg btn-primary">
            Start your brief <Icon name="arrow" size={16} />
          </BriefButton>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 text-[13.5px] text-muted">
            <span className={`h-2 w-2 rounded-full ${slotsLeft ? "bg-good" : "bg-danger"}`} />
            {slotsLeft ? `${slotsLeft} of ${MADE_FOR_YOU.maxOpen} build slots open` : "Fully booked right now"}
          </span>
        </span>
      </PageHeader>

      {/* the six questions */}
      <section className="shell py-16 md:py-20">
        <SectionHeading eyebrow="How it works" title="Like writing a prompt, but for your website." center>
          Each answer adds a line to your brief. By the end you&rsquo;ve described exactly what
          you want, with a preview of your colours.
        </SectionHeading>
        <ol className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUESTIONS.map((q, i) => (
            <Reveal key={q.title} delay={(i % 3) * 0.05} className="h-full">
              <li className="card h-full rounded-2xl p-6">
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <Icon name={q.icon} size={19} />
                  </span>
                  <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-faint">Step {i + 1}</span>
                </span>
                <h3 className="mt-4 text-[17px] font-semibold">{q.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{q.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* sample brief */}
      <section className="border-y border-line bg-card">
        <div className="shell grid grid-cols-1 items-center gap-10 py-16 md:py-20 lg:grid-cols-2">
          <SectionHeading eyebrow="What we receive" title="A brief our designers can build from.">
            No back-and-forth emails to work out what you meant. Everything that matters is
            in one place before we start.
          </SectionHeading>
          <Reveal>
            <div className="rounded-2xl border border-line bg-paper p-5">
              <pre className="whitespace-pre-wrap font-mono text-[12.5px] leading-relaxed text-body">{`Build a 5-page website for Ridgeline Coffee, a online store.
In one line: Small-batch coffee, roasted on Tuesday.
Take inspiration from the Ridgeline Coffee template.

About the business: We roast single-origin coffee and sell
it online and at two markets.
Tone: warm, premium.

Pages:
1. Home — this week's coffees and a subscription offer
2. Shop — every coffee with tasting notes
3. Subscriptions — how it works and prices
4. Our story — the farms we buy from
5. Contact — markets, wholesale and questions

Colours: brand #6b3f2a, accent #d9a441,
background #faf6f0, text #2a1d16.`}</pre>
              <div className="mt-4 flex h-8 overflow-hidden rounded-lg">
                {PALETTES.espresso.colors.map((c) => (
                  <span key={c} className="flex-1" style={{ background: c }} />
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="shell grid grid-cols-1 gap-12 py-16 md:py-20 lg:grid-cols-[1fr_1.1fr]">
        <SectionHeading eyebrow="What you get" title={`Everything built for ${price}.`}>
          Agencies charge hundreds for a site like this. We start from our own templates, which
          is how we keep it to {price} and {MADE_FOR_YOU.delivery}.
        </SectionHeading>
        <Reveal>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {INCLUDED.map((x) => (
              <li key={x} className="card flex gap-2.5 rounded-xl p-4 text-[14px]">
                <Check /> {x}
              </li>
            ))}
          </ul>
          <BriefButton className="btn btn-lg btn-accent mt-6">
            Start your brief <Icon name="arrow" size={16} />
          </BriefButton>
        </Reveal>
      </section>

      <section className="border-t border-line bg-card">
        <div className="shell grid grid-cols-1 gap-10 py-16 md:py-20 lg:grid-cols-[1fr_1.6fr]">
          <SectionHeading eyebrow="Questions" title="About Made for you.">
            Something else?{" "}
            <Link href="/contact" className="font-medium text-accent hover:underline">Ask us</Link>.
          </SectionHeading>
          <Faq items={FAQ} />
        </div>
      </section>
      <Footer />
    </>
  );
}
