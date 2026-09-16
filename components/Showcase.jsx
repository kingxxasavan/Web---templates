"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Reveal, SectionHeading } from "./ui";

const TICKETS = [
  {
    id: "#48213",
    who: "Priya N.",
    subject: "Webhook retries firing twice on 5xx",
    tag: "Integrations",
    reply:
      "Your endpoint returned 502 twice, so Helix re-queued both attempts. I've enabled idempotency keys on your webhook and backfilled the 3 duplicate events. Nothing downstream was double-charged — I checked.",
    confidence: 96,
  },
  {
    id: "#48214",
    who: "Marcus B.",
    subject: "Can't invite teammates on the Team plan",
    tag: "Billing",
    reply:
      "Your seat count was capped at 5 from an old plan. I've lifted it to 25 to match your current subscription and sent Dana and Omar their invites. No charge until they accept.",
    confidence: 99,
  },
  {
    id: "#48215",
    who: "Sofia R.",
    subject: "SSO login loops back to the sign-in page",
    tag: "Security",
    reply:
      "Your Okta ACS URL still pointed at the staging callback. I've corrected it in your SAML config and verified a test assertion passes. Try again — should land straight in the dashboard.",
    confidence: 93,
  },
];

const STEPS = [
  "Reading ticket + customer history",
  "Searching docs, code and 14,208 past tickets",
  "Drafting resolution",
  "Taking action in your systems",
  "Resolved",
];

export default function Showcase() {
  const wrapRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start end", "end start"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 0.45], [14, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.45], [0.93, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.25], [0.4, 1]);

  const [active, setActive] = useState(0);
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setStep((s) => {
        if (s < STEPS.length - 1) return s + 1;
        setActive((a) => (a + 1) % TICKETS.length);
        return 0;
      });
    }, 1600);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setRunning(e.isIntersecting),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const ticket = TICKETS[active];
  const done = step === STEPS.length - 1;

  return (
    <section id="product" className="relative px-6 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-1/4 -z-10 h-[520px] aurora opacity-50" />
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          eyebrow="The product"
          title="Watch it close a ticket"
          accent="in real time."
          sub="No canned macros, no 'here are 3 help articles'. Helix investigates, acts inside your tools, and writes back like the best agent on your team."
        />

        <motion.div
          ref={wrapRef}
          style={{ rotateX, scale, opacity, transformPerspective: 1400 }}
          className="mt-16"
        >
          <div className="hairline glass overflow-hidden rounded-[22px] shadow-[0_50px_120px_-40px_rgba(124,92,255,0.5)]">
            {/* window chrome */}
            <div className="flex items-center gap-2 border-b border-white/[0.07] bg-white/[0.02] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <p className="ml-3 text-[12px] text-muted/70">
                helix.app / inbox — live
              </p>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-wider text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Autopilot
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_1fr]">
              {/* queue */}
              <div className="border-b border-white/[0.07] p-4 lg:border-b-0 lg:border-r">
                <div className="mb-3 flex items-center justify-between px-1">
                  <p className="text-[12px] font-medium text-muted">
                    Inbox — 3 open
                  </p>
                  <p className="text-[11px] text-muted/50">Auto-sorted</p>
                </div>
                <div className="flex flex-col gap-2">
                  {TICKETS.map((t, i) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setActive(i);
                        setStep(0);
                      }}
                      className={`relative w-full rounded-xl border p-3 text-left transition-all duration-300 ${
                        i === active
                          ? "border-violet/40 bg-violet/[0.10]"
                          : "border-white/[0.06] bg-white/[0.015] hover:border-white/15 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12.5px] font-medium">{t.who}</span>
                        <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-muted">
                          {t.tag}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-muted">
                        {t.subject}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            i === active && done
                              ? "bg-emerald-400"
                              : i === active
                                ? "bg-violet"
                                : "bg-muted/30"
                          }`}
                        />
                        <span className="text-[10.5px] text-muted/60">
                          {i === active
                            ? done
                              ? "Resolved by Helix"
                              : "Helix working…"
                            : "Queued"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* work surface */}
              <div className="relative min-h-[460px] p-5 sm:p-7">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[11px] text-muted/60">
                        {ticket.id}
                      </span>
                      <h3 className="text-[16px] font-medium tracking-[-0.01em]">
                        {ticket.subject}
                      </h3>
                    </div>

                    {/* reasoning trace */}
                    <ol className="mt-6 flex flex-col gap-2.5">
                      {STEPS.map((label, i) => {
                        const state =
                          i < step ? "done" : i === step ? "active" : "idle";
                        return (
                          <li
                            key={label}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-500 ${
                              state === "active"
                                ? "bg-white/[0.05]"
                                : "bg-transparent"
                            }`}
                          >
                            <StepDot state={state} />
                            <span
                              className={`text-[13px] transition-colors duration-500 ${
                                state === "idle"
                                  ? "text-muted/35"
                                  : state === "active"
                                    ? "text-ink"
                                    : "text-muted"
                              }`}
                            >
                              {label}
                            </span>
                            {state === "done" && (
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 16 16"
                                fill="none"
                                className="ml-auto text-emerald-400"
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
                            )}
                          </li>
                        );
                      })}
                    </ol>

                    {/* the reply */}
                    <AnimatePresence>
                      {step >= 2 && (
                        <motion.div
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          className="mt-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent p-4"
                        >
                          <div className="mb-2.5 flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet to-cyan text-[10px] font-bold text-void">
                              H
                            </span>
                            <span className="text-[12.5px] font-medium">
                              Helix
                            </span>
                            <span className="rounded-md border border-cyan/20 bg-cyan/10 px-1.5 py-0.5 text-[10px] text-cyan">
                              {ticket.confidence}% confidence
                            </span>
                          </div>
                          <Typewriter text={ticket.reply} play={step >= 2} />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {done && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mt-4 flex flex-wrap items-center gap-2"
                        >
                          <Pill tone="emerald">Ticket closed</Pill>
                          <Pill>CSAT 5/5</Pill>
                          <Pill>Handled in 41s</Pill>
                          <Pill>0 human touches</Pill>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        <Reveal delay={0.1}>
          <p className="mt-6 text-center text-[12.5px] text-muted/60">
            Illustrative product interface. Every action shown is one Helix
            performs through your existing integrations.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function StepDot({ state }) {
  return (
    <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
      {state === "active" && (
        <span className="absolute h-4 w-4 rounded-full bg-violet/40 animate-pulse-ring" />
      )}
      <span
        className={`h-2 w-2 rounded-full transition-colors duration-500 ${
          state === "done"
            ? "bg-emerald-400"
            : state === "active"
              ? "bg-violet"
              : "bg-white/15"
        }`}
      />
    </span>
  );
}

function Pill({ children, tone }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] ${
        tone === "emerald"
          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
          : "border-white/10 bg-white/[0.04] text-muted"
      }`}
    >
      {children}
    </span>
  );
}

function Typewriter({ text, play }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!play) return;
    setN(0);
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(id);
          return v;
        }
        return v + 3;
      });
    }, 16);
    return () => clearInterval(id);
  }, [text, play]);

  return (
    <p className="text-[13.5px] leading-relaxed text-muted">
      {text.slice(0, n)}
      {n < text.length && (
        <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 bg-cyan align-middle" />
      )}
    </p>
  );
}
