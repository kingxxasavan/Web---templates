"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { SectionHeading, Reveal } from "./ui";

const STEPS = [
  {
    n: "01",
    t: "Point it at your knowledge",
    d: "Connect your helpdesk and docs with OAuth. Helix indexes your entire ticket history and every source of truth you have — typically 20 minutes, no engineering time.",
    meta: "~20 min setup",
  },
  {
    n: "02",
    t: "Watch it shadow your team",
    d: "For the first week Helix drafts replies without sending them. You approve, edit, or reject. It calibrates to your tone, your policies, and your edge cases.",
    meta: "Week 1 — supervised",
  },
  {
    n: "03",
    t: "Hand over the queue",
    d: "Turn on autopilot per topic. Start with password resets, end with billing disputes. You set the confidence floor; anything under it routes to a human with context attached.",
    meta: "Week 2 — autopilot",
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.7", "end 0.6"],
  });
  const height = useSpring(useTransform(scrollYProgress, [0, 1], ["0%", "100%"]), {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section id="how" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          eyebrow="How it works"
          title="Live in a week."
          accent="Not a quarter."
          sub="Most AI support projects die in implementation. Helix is designed so a support lead can ship it without filing a single engineering ticket."
        />

        <div ref={ref} className="relative mt-20 pl-10 md:pl-0">
          {/* progress rail */}
          <div className="absolute left-[11px] top-2 h-full w-px bg-white/[0.08] md:left-1/2 md:-translate-x-1/2">
            <motion.div
              style={{ height }}
              className="w-px bg-gradient-to-b from-violet via-cyan to-transparent"
            />
          </div>

          <div className="flex flex-col gap-16 md:gap-24">
            {STEPS.map((s, i) => {
              const left = i % 2 === 0;
              const body = (
                <div className={left ? "md:pr-14 md:text-right" : "md:pl-14"}>
                  <span className="font-display text-[13px] tracking-[0.2em] text-muted/50">
                    {s.n}
                  </span>
                  <h3 className="mt-2 text-[24px] leading-tight tracking-[-0.015em] sm:text-[28px]">
                    {s.t}
                  </h3>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
                    {s.d}
                  </p>
                  <span className="mt-4 inline-block rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11.5px] text-muted">
                    {s.meta}
                  </span>
                </div>
              );

              return (
                <Reveal key={s.n} delay={0.05}>
                  <div className="relative md:grid md:grid-cols-2 md:gap-14">
                    {/* node on the rail */}
                    <span className="absolute -left-10 top-1.5 z-10 flex h-[23px] w-[23px] items-center justify-center rounded-full border border-white/15 bg-void md:left-1/2 md:-translate-x-1/2">
                      <span className="h-2 w-2 rounded-full bg-gradient-to-br from-violet to-cyan" />
                    </span>

                    {/* placing the spacer explicitly is what makes the
                        steps alternate sides on desktop */}
                    {left ? (
                      <>
                        {body}
                        <div aria-hidden className="hidden md:block" />
                      </>
                    ) : (
                      <>
                        <div aria-hidden className="hidden md:block" />
                        {body}
                      </>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
