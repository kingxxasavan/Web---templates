"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal, SectionHeading, Button } from "./ui";

const TIERS = [
  {
    name: "Starter",
    tagline: "For small teams drowning in tier-1.",
    monthly: 149,
    yearly: 119,
    unit: "/mo",
    cta: "Start free trial",
    variant: "ghost",
    features: [
      "Up to 1,000 resolutions / mo",
      "1 helpdesk + 3 knowledge sources",
      "Supervised & autopilot modes",
      "Source citations on every reply",
      "Email support",
    ],
  },
  {
    name: "Growth",
    tagline: "For teams running autopilot at scale.",
    monthly: 549,
    yearly: 439,
    unit: "/mo",
    cta: "Start free trial",
    variant: "glow",
    featured: true,
    features: [
      "Up to 10,000 resolutions / mo",
      "Unlimited knowledge sources",
      "Actions & workflow permissions",
      "Custom confidence thresholds",
      "Analytics + weekly quality reports",
      "Slack Connect support",
    ],
  },
  {
    name: "Enterprise",
    tagline: "For regulated and multi-brand support orgs.",
    price: "Custom",
    cta: "Talk to sales",
    variant: "ghost",
    features: [
      "Unlimited resolutions",
      "EU / US data residency",
      "SSO, SCIM, audit logs",
      "Private model deployment",
      "99.9% uptime SLA",
      "Dedicated solutions engineer",
    ],
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(true);

  return (
    <section id="pricing" className="relative px-6 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] aurora opacity-40" />
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          eyebrow="Pricing"
          title="Priced per resolution."
          accent="Not per seat."
          sub="You pay when Helix actually closes something. If it hands off to a human, it's free — which is the only pricing model that keeps us honest."
        />

        <Reveal delay={0.1}>
          <div className="mt-10 flex justify-center">
            <div className="relative flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 backdrop-blur-xl">
              {[
                { k: false, l: "Monthly" },
                { k: true, l: "Yearly" },
              ].map((o) => (
                <button
                  key={o.l}
                  onClick={() => setYearly(o.k)}
                  className={`relative rounded-full px-5 py-2 text-[13px] font-medium transition-colors ${
                    yearly === o.k ? "text-void" : "text-muted hover:text-ink"
                  }`}
                >
                  {yearly === o.k && (
                    <motion.span
                      layoutId="billing-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-ink"
                    />
                  )}
                  <span className="relative">{o.l}</span>
                </button>
              ))}
              <span className="ml-1 mr-2 rounded-full bg-cyan/15 px-2 py-0.5 text-[11px] font-medium text-cyan">
                −20%
              </span>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
          {TIERS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <div
                className={`relative h-full rounded-3xl p-7 transition-transform duration-500 ${
                  t.featured
                    ? "hairline glass lg:-translate-y-4 lg:scale-[1.03] shadow-[0_40px_90px_-40px_rgba(124,92,255,0.8)]"
                    : "border border-white/[0.08] bg-white/[0.02] hover:border-white/15"
                }`}
              >
                {t.featured && (
                  <span className="absolute -top-3 left-7 rounded-full bg-gradient-to-r from-violet to-cyan px-3 py-1 text-[11px] font-semibold text-void">
                    Most popular
                  </span>
                )}

                <h3 className="text-[17px] font-medium">{t.name}</h3>
                <p className="mt-1.5 text-[13px] leading-snug text-muted">
                  {t.tagline}
                </p>

                <div className="mt-6 flex items-end gap-1.5">
                  {t.price ? (
                    <span className="font-display text-4xl tracking-tight">
                      {t.price}
                    </span>
                  ) : (
                    <>
                      <span className="text-[17px] text-muted">$</span>
                      <motion.span
                        key={yearly ? "y" : "m"}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="font-display text-5xl leading-none tracking-tight"
                      >
                        {yearly ? t.yearly : t.monthly}
                      </motion.span>
                      <span className="pb-1 text-[13px] text-muted">
                        {t.unit}
                      </span>
                    </>
                  )}
                </div>
                <p className="mt-1.5 text-[12px] text-muted/60">
                  {t.price
                    ? "annual contract · volume pricing"
                    : `${yearly ? "billed annually" : "billed monthly"} · then $0.14 / extra resolution`}
                </p>

                <Button
                  href="#cta"
                  variant={t.variant}
                  className="mt-7 w-full"
                >
                  {t.cta}
                </Button>

                <ul className="mt-7 flex flex-col gap-3 border-t border-white/[0.07] pt-6">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="mt-0.5 shrink-0 text-cyan"
                        aria-hidden
                      >
                        <path
                          d="M3.5 8.5l3 3 6-7"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-[13.5px] leading-snug text-muted">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-10 text-center text-[13px] text-muted/70">
            All plans include SOC 2 Type II, unlimited seats, and zero training
            on your data.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
