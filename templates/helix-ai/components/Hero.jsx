"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Button, Eyebrow } from "./ui";

const HelixCanvas = dynamic(() => import("./HelixCanvas"), { ssr: false });

const STATS = [
  { value: "71%", label: "of tickets resolved end-to-end" },
  { value: "38s", label: "median first response" },
  { value: "4.8/5", label: "CSAT on Helix-handled chats" },
];

const ease = [0.16, 1, 0.3, 1];

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-32"
    >
      {/* layered background */}
      <div className="pointer-events-none absolute inset-0 -z-20 aurora opacity-80" />
      <div className="pointer-events-none absolute inset-0 -z-10 grid-lines" />
      <div className="absolute inset-0 -z-10">
        <HelixCanvas />
      </div>
      {/* dims the helix directly behind the copy so the headline stays
          legible without losing the form at the edges */}
      <div className="hero-veil pointer-events-none absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-64 bg-gradient-to-t from-void to-transparent" />

      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          <Eyebrow>Now resolving 2.4M conversations / month</Eyebrow>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.1, ease }}
          className="mt-7 text-balance text-[2.75rem] leading-[1.03] tracking-[-0.03em] sm:text-6xl md:text-[4.75rem]"
        >
          Your support queue,
          <br />
          <span className="font-display italic text-gradient">
            solved before you wake up.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.24, ease }}
          className="mt-7 max-w-xl text-pretty text-[16px] leading-relaxed text-muted sm:text-[17px]"
        >
          Helix reads your docs, your codebase and every ticket you&rsquo;ve ever
          closed — then handles the next one itself. Not a deflection bot. An
          agent that actually finishes the job.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.34, ease }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button href="#pricing" variant="primary">
            Start free for 14 days
            <Arrow />
          </Button>
          <Button href="#product" variant="ghost">
            <Play />
            Watch it work
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.46 }}
          className="mt-5 text-[13px] text-muted/70"
        >
          No credit card · Live on your helpdesk in under an hour
        </motion.p>

        {/* stat strip */}
        <motion.dl
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.56, ease }}
          className="mt-16 grid w-full max-w-2xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl sm:grid-cols-3"
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1 bg-void/40 px-5 py-6"
            >
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-3xl tracking-tight text-ink">
                {s.value}
              </dd>
              <p className="text-[12.5px] leading-snug text-muted">{s.label}</p>
            </div>
          ))}
        </motion.dl>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="pointer-events-none absolute bottom-7 left-1/2 -translate-x-1/2"
      >
        <div className="flex h-9 w-5 items-start justify-center rounded-full border border-white/15 p-1">
          <motion.span
            animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="h-1.5 w-0.5 rounded-full bg-ink/70"
          />
        </div>
      </motion.div>
    </section>
  );
}

function Arrow() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      className="transition-transform duration-300 group-hover:translate-x-0.5"
      aria-hidden
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Play() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M5 3.5l8 4.5-8 4.5z" fill="currentColor" />
    </svg>
  );
}
