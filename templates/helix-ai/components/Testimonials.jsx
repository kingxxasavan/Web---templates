"use client";

import { Reveal, SectionHeading } from "./ui";

const QUOTES = [
  {
    q: "We were three weeks from hiring four more agents. We hired zero. Helix took the entire tier-1 queue and our CSAT went up, which nobody on my team believed would happen.",
    n: "Dana Whitfield",
    r: "VP Customer Experience, Northwind",
    i: "DW",
  },
  {
    q: "The difference is that it does things. Every other tool we trialled would find the right help article and stop. Helix reset the customer's API keys and told them what it did.",
    n: "Arjun Mehta",
    r: "Head of Support, Cadence",
    i: "AM",
  },
  {
    q: "Our nights and weekends are covered now. I stopped carrying a support pager after eleven years. That's the whole review.",
    n: "Lena Okafor",
    r: "Director of Ops, Foundry",
    i: "LO",
  },
  {
    q: "Setup took an afternoon. Week one it shadowed us, week two it was closing 40% on its own, and it's at 74% today.",
    n: "Tomás Rivera",
    r: "Support Lead, Lumen",
    i: "TR",
  },
];

export default function Testimonials() {
  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          eyebrow="Customers"
          title="Support leaders who stopped"
          accent="hiring to keep up."
        />

        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2">
          {QUOTES.map((t, i) => (
            <Reveal key={t.n} delay={(i % 2) * 0.08}>
              <figure className="hairline glass flex h-full flex-col rounded-3xl p-7">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  className="text-violet/50"
                  aria-hidden
                >
                  <path
                    d="M9 7c-2.8 1-4.5 3.4-4.5 6.4V17h5.2v-4.6H7.4c0-1.6.6-2.7 2-3.4L9 7zm8.4 0c-2.8 1-4.5 3.4-4.5 6.4V17H18v-4.6h-2.3c0-1.6.6-2.7 2-3.4L17.4 7z"
                    fill="currentColor"
                  />
                </svg>
                <blockquote className="mt-4 text-pretty text-[15.5px] leading-relaxed text-ink/90">
                  {t.q}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-white/[0.07] pt-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet/30 to-cyan/20 text-[12px] font-semibold">
                    {t.i}
                  </span>
                  <span>
                    <span className="block text-[13.5px] font-medium">{t.n}</span>
                    <span className="block text-[12px] text-muted">{t.r}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
