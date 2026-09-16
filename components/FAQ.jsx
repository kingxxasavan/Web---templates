"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, SectionHeading } from "./ui";

const ITEMS = [
  {
    q: "How is this different from the AI already in my helpdesk?",
    a: "Bundled helpdesk AI mostly does deflection: it searches your articles and suggests them. Helix reasons over your full history, then takes the action the ticket actually needs — issuing the refund, fixing the config, re-running the sync — and writes back a resolution. Deflection lowers your reply count. Resolution lowers your headcount pressure.",
  },
  {
    q: "What happens when it doesn't know the answer?",
    a: "It escalates. You set a confidence floor per topic; anything below it routes to a human with the full investigation attached — what Helix checked, what it found, and what it would have done. Agents tell us the handoff summary alone saves them several minutes per ticket.",
  },
  {
    q: "Will it hallucinate at my customers?",
    a: "Every reply is grounded in retrieved sources and cites them inline. Helix is constrained to answer only from your indexed knowledge; when the sources don't support an answer, it escalates rather than improvising. You can audit any reply's sources in one click, and reject-and-correct feeds straight back into calibration.",
  },
  {
    q: "Do you train on our customer data?",
    a: "No. Your data is never used to train shared models — it's isolated to your workspace and used only to serve your own resolutions. We're SOC 2 Type II and GDPR compliant, with EU or US data residency on Enterprise.",
  },
  {
    q: "How long until it's actually useful?",
    a: "Indexing takes about 20 minutes. Most teams run one week in supervised mode, where Helix drafts and humans approve, then switch on autopilot for their safest topics. Typical numbers are 30–45% autonomous resolution by the end of week two, climbing to 65–75% by day 90.",
  },
  {
    q: "What if we want to cancel?",
    a: "Month-to-month, cancel in the dashboard, no call required. Annual plans are refunded pro rata. You can export your full conversation and resolution history as JSON at any time — it's your data.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto w-full max-w-3xl">
        <SectionHeading
          eyebrow="FAQ"
          title="The questions you were"
          accent="about to email us."
        />

        <div className="mt-14 flex flex-col gap-2">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={i * 0.04}>
                <div
                  className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
                    isOpen
                      ? "border-white/15 bg-white/[0.04]"
                      : "border-white/[0.07] bg-white/[0.015] hover:border-white/12"
                  }`}
                >
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-5 px-5 py-4.5 text-left sm:px-6"
                  >
                    <span className="text-[15px] font-medium tracking-[-0.01em]">
                      {item.q}
                    </span>
                    <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/12">
                      <span className="absolute h-[1.5px] w-2.5 rounded-full bg-ink" />
                      <span
                        className={`absolute h-2.5 w-[1.5px] rounded-full bg-ink transition-transform duration-300 ${
                          isOpen ? "rotate-90 opacity-0" : ""
                        }`}
                      />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <p className="px-5 pb-5 text-[14px] leading-relaxed text-muted sm:px-6">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
