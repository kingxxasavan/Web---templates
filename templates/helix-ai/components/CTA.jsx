"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "./ui";

export default function CTA() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <section id="cta" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto w-full max-w-5xl">
        <Reveal>
          <div className="hairline relative overflow-hidden rounded-[32px] border border-white/10 px-7 py-16 text-center sm:px-14 sm:py-20">
            <div className="pointer-events-none absolute inset-0 -z-10 aurora opacity-100" />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-void/25" />
            <div className="pointer-events-none absolute inset-0 -z-10 grid-lines opacity-70" />

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet to-cyan"
            >
              <svg width="26" height="26" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M3.5 2c0 3 9 3.5 9 6.5S3.5 11 3.5 14M12.5 2c0 3-9 3.5-9 6.5s9 2.5 9 5.5"
                  stroke="#06060a"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>

            <h2 className="text-balance text-4xl leading-[1.08] tracking-[-0.025em] sm:text-5xl md:text-[3.5rem]">
              Tomorrow morning, your queue
              <br className="hidden sm:block" />{" "}
              <span className="font-display italic text-gradient">
                can already be empty.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-lg text-pretty text-[15.5px] leading-relaxed text-muted">
              Fourteen days free, on your real tickets. If Helix doesn&rsquo;t
              resolve at least 30% of them autonomously, don&rsquo;t pay us.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="mx-auto mt-10 flex w-full max-w-md flex-col gap-2.5 sm:flex-row"
            >
              <label htmlFor="work-email" className="sr-only">
                Work email
              </label>
              <input
                id="work-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="h-12 flex-1 rounded-full border border-white/12 bg-white/[0.04] px-5 text-[14px] text-ink outline-none backdrop-blur-xl transition-colors placeholder:text-muted/50 focus:border-violet/60"
              />
              <button
                type="submit"
                className="h-12 shrink-0 rounded-full bg-ink px-6 text-[14px] font-medium text-void transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-14px_rgba(124,92,255,0.95)]"
              >
                {sent ? "Check your inbox ✓" : "Start free"}
              </button>
            </form>

            <p className="mt-5 text-[12.5px] text-muted/60">
              No credit card · SOC 2 Type II · Cancel anytime
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
