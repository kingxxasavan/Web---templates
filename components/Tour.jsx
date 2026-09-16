"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { money } from "@/lib/catalog";

const ease = [0.16, 1, 0.3, 1];

/**
 * The visitor lands inside a real, working template and is walked through it
 * as though it were simply the site. Only at the end is it revealed that
 * everything they just used is a product — which argues for the quality far
 * better than a screenshot grid does.
 */
export default function Tour({ tour, showcase, onClose }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);

  const steps = tour.steps;
  const atReveal = step >= steps.length;
  const current = steps[Math.min(step, steps.length - 1)];

  const next = useCallback(() => setStep((s) => s + 1), []);
  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  useEffect(() => {
    if (!atReveal) setLoading(true);
  }, [step, atReveal]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [next, back, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] bg-base"
      role="dialog"
      aria-modal="true"
      aria-label="Template tour"
    >
      {/* the template, running full screen until the reveal */}
      <motion.div
        animate={
          atReveal
            ? { scale: 0.4, y: "-31%", opacity: 0.3, filter: "blur(4px)" }
            : { scale: 1, y: 0, opacity: 1, filter: "blur(0px)" }
        }
        transition={{ duration: 1.1, ease }}
        className="absolute inset-0 origin-center overflow-hidden rounded-none bg-white"
        style={{ borderRadius: atReveal ? 24 : 0 }}
      >
        {loading && !atReveal && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-base">
            <span className="text-[13px] text-faint">Loading…</span>
          </div>
        )}
        <iframe
          key={current.file}
          src={`/preview/${tour.slug}/${current.file}`}
          title={current.name}
          onLoad={() => setLoading(false)}
          sandbox="allow-same-origin allow-scripts allow-forms"
          className="h-full w-full border-0 bg-white"
        />
        {/* stops clicks inside the frame from navigating away mid-tour */}
        {!atReveal && <div className="absolute inset-0" aria-hidden />}
      </motion.div>

      {/* skip */}
      {!atReveal && (
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-20 rounded-full bg-base/85 px-4 py-2 text-[13px] text-ink backdrop-blur-xl transition-colors hover:bg-base"
        >
          Skip tour
        </button>
      )}

      {/* guide */}
      <AnimatePresence>
        {!atReveal && (
          <motion.div
            key="guide"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.5, ease }}
            className="absolute bottom-5 left-1/2 z-20 w-[min(560px,calc(100%-2.5rem))] -translate-x-1/2"
          >
            <div className="rounded-2xl border border-line bg-base/92 p-5 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.9)] backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-accent">
                  {current.name}
                </span>
                <span className="text-[11.5px] text-faint">
                  {step + 1} of {steps.length}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="mt-2.5 text-[14.5px] leading-relaxed text-ink"
                >
                  {current.copy}
                </motion.p>
              </AnimatePresence>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex flex-1 gap-1">
                  {steps.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                        i <= step ? "bg-accent" : "bg-line"
                      }`}
                    />
                  ))}
                </div>
                {step > 0 && (
                  <button
                    onClick={back}
                    className="text-[13px] text-muted transition-colors hover:text-ink"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={next}
                  className="rounded-full bg-ink px-5 py-2 text-[13.5px] font-medium text-base transition-transform duration-300 hover:-translate-y-0.5"
                >
                  {step === steps.length - 1 ? "Finish" : "Next"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* the reveal */}
      <AnimatePresence>
        {atReveal && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-end overflow-y-auto bg-gradient-to-t from-base via-base/98 via-45% to-transparent px-6 pb-10 pt-[46vh]"
          >
            <div className="w-full max-w-3xl text-center">
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.7, ease }}
                className="text-[13px] uppercase tracking-[0.2em] text-accent"
              >
                One thing
              </motion.p>

              <motion.h2
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9, ease }}
                className="mt-4 text-balance text-[2.2rem] leading-[1.08] tracking-[-0.03em] sm:text-5xl"
              >
                That whole site was a{" "}
                <span className="serif-accent text-accent">template.</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.15, ease }}
                className="mx-auto mt-5 max-w-lg text-pretty text-[15.5px] leading-relaxed text-muted"
              >
                Every page you just clicked through is {tour.name} —{" "}
                {tour.pages} pages of source you can own for{" "}
                {money(tour.priceCents)}. We build all nine of them to that
                standard, which is easier to show than to claim.
              </motion.p>

              {/* rotating proof */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.35, ease }}
                className="mt-9"
              >
                <Rotator items={showcase} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.55, ease }}
                className="mt-9 flex flex-col items-center justify-center gap-3 pb-4 sm:flex-row"
              >
                <button
                  onClick={onClose}
                  className="rounded-full bg-ink px-6 py-3 text-[14px] font-medium text-base transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Welcome — show me the store
                </button>
                <a
                  href={`/t/${tour.slug}`}
                  className="rounded-full border border-line px-6 py-3 text-[14px] text-ink transition-colors hover:border-ink/25"
                >
                  See {tour.name} — {money(tour.priceCents)}
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Cycles the other templates so the reveal shows range, not one lucky build. */
function Rotator({ items }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % items.length), 2600);
    return () => clearInterval(id);
  }, [items.length]);

  const item = items[i];

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="card relative h-[190px] overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.img
            key={item.slug}
            src={`/thumbs/${item.slug}.webp`}
            alt={item.name}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        </AnimatePresence>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-base to-transparent p-3.5 pt-10 text-left">
          <p className="text-[13.5px] font-medium">{item.name}</p>
          <p className="text-[12px] text-muted">
            {item.tagline} · {money(item.priceCents)}
          </p>
        </div>
      </div>
      <div className="mt-2.5 flex justify-center gap-1">
        {items.map((_, n) => (
          <span
            key={n}
            className={`h-1 w-4 rounded-full transition-colors duration-400 ${
              n === i ? "bg-accent" : "bg-line"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
