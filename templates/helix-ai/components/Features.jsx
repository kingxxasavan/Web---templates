"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Reveal, SectionHeading } from "./ui";

function Spotlight({ children, className = "" }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: -400, y: -400 });

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onMouseLeave={() => setPos({ x: -400, y: -400 })}
      className={`group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] p-7 transition-colors duration-500 hover:border-white/15 ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(360px circle at ${pos.x}px ${pos.y}px, rgba(124,92,255,0.14), transparent 70%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export default function Features() {
  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          eyebrow="Capabilities"
          title="Everything a great agent does."
          accent="None of what they hate."
          sub="Helix isn't a search box with a personality. It reasons, acts, escalates when it should, and gets measurably better every week."
        />

        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-6">
          {/* big one */}
          <Reveal className="md:col-span-4">
            <Spotlight className="h-full">
              <Icon>{iconBrain}</Icon>
              <h3 className="mt-5 text-[21px] tracking-[-0.01em]">
                Grounded in everything you&rsquo;ve ever written
              </h3>
              <p className="mt-2.5 max-w-lg text-[14.5px] leading-relaxed text-muted">
                Docs, Notion, GitHub, Linear, past tickets, internal runbooks.
                Helix cites its sources on every answer, so you can audit any
                reply in one click.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  "Zendesk", "Intercom", "Notion", "GitHub",
                  "Linear", "Slack", "Confluence", "Stripe",
                ].map((s, i) => (
                  <motion.span
                    key={s}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[12px] text-muted"
                  >
                    {s}
                  </motion.span>
                ))}
              </div>
            </Spotlight>
          </Reveal>

          <Reveal delay={0.06} className="md:col-span-2">
            <Spotlight className="h-full">
              <Icon>{iconShield}</Icon>
              <h3 className="mt-5 text-[19px] tracking-[-0.01em]">
                It knows when to stop
              </h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-muted">
                Confidence below your threshold, an angry customer, or anything
                touching refunds — Helix hands off with a full summary instead
                of guessing.
              </p>
            </Spotlight>
          </Reveal>

          <Reveal delay={0.04} className="md:col-span-2">
            <Spotlight className="h-full">
              <Icon>{iconBolt}</Icon>
              <h3 className="mt-5 text-[19px] tracking-[-0.01em]">
                Acts, doesn&rsquo;t just answer
              </h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-muted">
                Issue the refund, reset the seat cap, re-run the sync, open the
                bug. Scoped permissions you approve, per action.
              </p>
            </Spotlight>
          </Reveal>

          <Reveal delay={0.08} className="md:col-span-2">
            <Spotlight className="h-full">
              <Icon>{iconChart}</Icon>
              <h3 className="mt-5 text-[19px] tracking-[-0.01em]">
                Learns from every correction
              </h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-muted">
                Edit a reply and Helix absorbs the change. Teams see resolution
                rate climb ~9 points in the first month.
              </p>
            </Spotlight>
          </Reveal>

          <Reveal delay={0.12} className="md:col-span-2">
            <Spotlight className="h-full">
              <Icon>{iconLock}</Icon>
              <h3 className="mt-5 text-[19px] tracking-[-0.01em]">
                Enterprise-grade by default
              </h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-muted">
                SOC 2 Type II, GDPR, data residency in the EU or US, and zero
                training on your customer data. Ever.
              </p>
            </Spotlight>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Icon({ children }) {
  return (
    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-violet/20 to-cyan/10 text-ink">
      {children}
    </span>
  );
}

const sp = { stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };

const iconBrain = (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <path d="M12 5a3 3 0 00-3 3 3 3 0 00-1 5.8V16a3 3 0 006 0V8a3 3 0 00-2-3z" {...sp} />
    <path d="M12 5a3 3 0 013 3 3 3 0 011 5.8V16a3 3 0 01-4 2.8" {...sp} />
  </svg>
);
const iconShield = (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" {...sp} />
    <path d="M9 12l2 2 4-4" {...sp} />
  </svg>
);
const iconBolt = (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <path d="M13 3L5 13h6l-1 8 8-10h-6l1-8z" {...sp} />
  </svg>
);
const iconChart = (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <path d="M4 19h16M7 16v-4M12 16V8M17 16v-7" {...sp} />
  </svg>
);
const iconLock = (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <rect x="5" y="10" width="14" height="10" rx="2" {...sp} />
    <path d="M8 10V7a4 4 0 018 0v3" {...sp} />
  </svg>
);
