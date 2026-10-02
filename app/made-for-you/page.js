import Link from "next/link";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import MadeForYouForm from "@/components/MadeForYouForm";
import { Icon } from "@/components/icons";
import { Reveal, Check } from "@/components/store";
import { PageHeader, SectionHeading, Steps, Faq } from "@/components/sections";
import { currentUser } from "@/lib/auth";
import { openBuildCount, BUILDABLE } from "@/lib/builds";
import { MADE_FOR_YOU, bySlug, money } from "@/lib/catalog";
import { SITE } from "@/lib/site";

const price = money(MADE_FOR_YOU.priceCents);

export const metadata = {
  title: "Made for you — your website set up in 3 days",
  description: `Send us a short brief and we'll set up a Foundry template for your business — your words, colours, pages and links — within ${MADE_FOR_YOU.days} days, for ${price}.`,
};

const INCLUDED = [
  "The template you choose, in your library to keep",
  "Your business name, words and contact details on every page",
  "Your colours and fonts",
  "Your pages and sections, rearranged to suit you",
  "Links to your socials, booking or shop",
  "Page titles and descriptions written for Google",
  "The contact form ready to send messages to your inbox",
  "One round of tweaks after delivery",
];

const STEPS = [
  { title: "Send your brief", body: "Tell us about your business and paste in any words you already have. Five minutes is plenty." },
  { title: `Pay ${price} once`, body: "That's everything, template included. No deposit, no hourly rate, no surprises." },
  { title: `We build it in ${MADE_FOR_YOU.days} days`, body: "You can follow progress in your library, and we email you the moment it's ready." },
  { title: "Launch it", body: "Download the finished site and put it online with one of our hosting guides, or ask us to help." },
];

const FAQ = [
  {
    q: "Is this a completely custom design?",
    a: "It's one of our templates, set up and personalised for your business: your words, colours, fonts, pages and links. That's what keeps it fast and affordable. If you need something designed from scratch, send us a message and we'll talk it through.",
  },
  {
    q: `What if I don't have any text yet?`,
    a: "Tell us what your business does and we'll write simple, clear placeholder copy you can change whenever you like.",
  },
  {
    q: `When do the ${MADE_FOR_YOU.days} days start?`,
    a: `When your payment goes through. The due date is shown in your library straight away.`,
  },
  {
    q: "Why is there sometimes a waiting list?",
    a: `We only take on ${MADE_FOR_YOU.maxOpen} builds at a time, so every one we accept can be delivered on time. If we're full, leave a message and we'll tell you as soon as a slot opens.`,
  },
  {
    q: "Can I still edit it myself afterwards?",
    a: "Yes. You get the full source, and the template is added to your library, so you can change anything later, by hand or with the online editor where your plan includes it.",
  },
  {
    q: "What if I'm not happy?",
    a: `You get one round of tweaks included, and our ${SITE.refundDays}-day money-back guarantee applies here too.`,
  },
];

export default async function MadeForYouPage({ searchParams }) {
  const { template } = await searchParams;
  const [user, open] = await Promise.all([currentUser(), openBuildCount()]);
  const slotsLeft = Math.max(MADE_FOR_YOU.maxOpen - open, 0);
  const preselect = bySlug(template)?.livePreview ? template : "";

  return (
    <>
      <Masthead />
      <PageHeader eyebrow="Made for you" title="Your website, set up for you" accent={`in ${MADE_FOR_YOU.days} days.`}>
        Don&rsquo;t want to edit it yourself? Send us a short brief and we&rsquo;ll set a
        template up for your business, with your words, colours, pages and links, for{" "}
        <strong className="text-ink">{price}</strong>, template included.
        <span className="mt-6 flex flex-wrap gap-3">
          <a href="#brief" className="btn btn-lg btn-primary">
            Start your brief <Icon name="arrow" size={16} />
          </a>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 text-[13.5px] text-muted">
            <span className={`h-2 w-2 rounded-full ${slotsLeft ? "bg-good" : "bg-danger"}`} />
            {slotsLeft
              ? `${slotsLeft} of ${MADE_FOR_YOU.maxOpen} build slots open`
              : "Fully booked right now"}
          </span>
        </span>
      </PageHeader>

      <section className="shell grid grid-cols-1 gap-12 py-16 md:py-20 lg:grid-cols-[1fr_1.1fr]">
        <SectionHeading eyebrow="What you get" title={`Everything set up for ${price}.`}>
          Agencies often charge hundreds for this. We can do it for the price of a template
          because we built the templates and know every line.
        </SectionHeading>
        <Reveal>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {INCLUDED.map((x) => (
              <li key={x} className="card flex gap-2.5 rounded-xl p-4 text-[14px]">
                <Check /> {x}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="border-y border-line bg-card">
        <div className="shell py-16 md:py-20">
          <SectionHeading eyebrow="How it works" title="Four steps, and three of them are ours." center />
          <div className="mt-12">
            <Steps steps={STEPS} />
          </div>
        </div>
      </section>

      <section id="brief" className="shell grid grid-cols-1 gap-10 py-16 md:py-20 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <SectionHeading eyebrow="Your brief" title="Tell us about your business.">
            Only three fields are required. The more you give us, the closer the first
            version will be.
          </SectionHeading>
          <div className="mt-8 rounded-2xl border border-line bg-sunk p-5 text-[13.5px] leading-relaxed text-muted">
            <p className="font-semibold text-ink">Not sure which template?</p>
            <p className="mt-1">
              Choose &ldquo;Help me choose&rdquo; and we&rsquo;ll pick the best fit, or{" "}
              <Link href="/templates" className="font-medium text-accent hover:underline">browse them all</Link> first.
            </p>
          </div>
        </div>
        {slotsLeft ? (
          <MadeForYouForm
            templates={BUILDABLE.map(({ slug, name, tagline }) => ({ slug, name, tagline }))}
            defaultEmail={user?.email ?? ""}
            defaultTemplate={preselect}
            price={price}
            open
          />
        ) : (
          <div className="card rounded-2xl p-8">
            <p className="text-[18px] font-semibold">We&rsquo;re fully booked right now.</p>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
              We only take {MADE_FOR_YOU.maxOpen} builds at a time so every one ships in{" "}
              {MADE_FOR_YOU.days} days. Leave your details and we&rsquo;ll email you as soon as a slot opens.
            </p>
            <Link href="/contact?topic=question" className="btn btn-primary mt-6">Join the waiting list</Link>
          </div>
        )}
      </section>

      <section className="border-t border-line bg-card">
        <div className="shell grid grid-cols-1 gap-10 py-16 md:py-20 lg:grid-cols-[1fr_1.6fr]">
          <SectionHeading eyebrow="Questions" title="About Made for you." />
          <Faq items={FAQ} />
        </div>
      </section>
      <Footer />
    </>
  );
}
