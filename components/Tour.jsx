"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { money } from "@/lib/catalog";
import { track } from "@/lib/firebase-client";

const ease = [0.16, 1, 0.3, 1];

/**
 * A tour you can actually use. The frame is live and unblocked — clicking a
 * product, opening the cart or navigating to another page all work, and the
 * guide follows the visitor rather than driving them.
 */
export default function Tour({ pool, showcase, onClose }) {
  // Chosen on the client so the tour differs per visit without the server
  // and the first client render disagreeing.
  const [tour, setTour] = useState(null);
  const [stopIndex, setStopIndex] = useState(0);
  const [visited, setVisited] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [minimised, setMinimised] = useState(false);
  const [seenCount, setSeenCount] = useState(0);
  const frameRef = useRef(null);

  const pick = useCallback(
    (exclude) => {
      const options = pool.filter((t) => t.slug !== exclude);
      return options[Math.floor(Math.random() * options.length)];
    },
    [pool]
  );

  useEffect(() => {
    const first = pick(null);
    setTour(first);
    track("tour_start", { template: first.slug });
  }, [pick]);

  const stop = tour?.stops[stopIndex] ?? null;
  const allSeen = tour ? visited.size >= tour.stops.length : false;

  const goto = useCallback((i) => {
    setStopIndex(i);
    setLoading(true);
  }, []);

  /** Keeps the guide in step when the visitor navigates inside the frame. */
  const syncToFrame = useCallback(() => {
    setLoading(false);
    if (!tour) return;
    try {
      const path = frameRef.current?.contentWindow?.location?.pathname ?? "";
      const file = path.split("/").pop() || "index.html";
      const i = tour.stops.findIndex((s) => s.file === file);
      if (i >= 0) {
        setStopIndex(i);
        setVisited((prev) => new Set(prev).add(file));
      }
    } catch {
      // A cross-origin frame can't be read; the manual controls still work.
    }
  }, [tour]);

  function nextTemplate() {
    const another = pick(tour.slug);
    track("tour_next_template", { from: tour.slug, to: another.slug });
    setSeenCount((n) => n + 1);
    setTour(another);
    setStopIndex(0);
    setVisited(new Set());
    setLoading(true);
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!tour) return null;

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
      <motion.div
        animate={
          revealed
            ? { scale: 0.4, y: "-31%", opacity: 0.3, filter: "blur(4px)" }
            : { scale: 1, y: 0, opacity: 1, filter: "blur(0px)" }
        }
        transition={{ duration: 1.1, ease }}
        className="absolute inset-0 origin-center overflow-hidden bg-white"
        style={{ borderRadius: revealed ? 24 : 0 }}
      >
        {loading && !revealed && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-base">
            <span className="text-[13px] text-faint">Loading…</span>
          </div>
        )}
        {/* No overlay: every link, button and form in here is live. */}
        <iframe
          ref={frameRef}
          key={`${tour.slug}-${stop.file}`}
          src={`/preview/${tour.slug}/${stop.file}`}
          title={`${tour.name} — ${stop.name}`}
          onLoad={syncToFrame}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          className="h-full w-full border-0 bg-white"
        />
      </motion.div>

      {!revealed && (
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-30 rounded-full bg-base/85 px-4 py-2 text-[13px] text-ink backdrop-blur-xl transition-colors hover:bg-base"
        >
          Skip tour
        </button>
      )}

      <AnimatePresence>
        {!revealed && (
          <motion.div
            key="guide"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.5, ease }}
            className="absolute bottom-5 right-5 z-30 w-[min(400px,calc(100%-2.5rem))]"
          >
            <div className="rounded-2xl border border-line bg-base/94 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.95)] backdrop-blur-xl">
              <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-accent">
                  {tour.name}
                </span>
                <span className="truncate text-[11.5px] text-faint">
                  {visited.size}/{tour.stops.length} pages
                </span>
                <button
                  onClick={() => setMinimised((m) => !m)}
                  className="ml-auto rounded-md px-2 py-1 text-[11.5px] text-muted transition-colors hover:text-ink"
                >
                  {minimised ? "Show guide" : "Hide"}
                </button>
              </div>

              {!minimised && (
                <div className="p-4">
                  <p className="text-[13.5px] font-medium">{stop.name}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                    {stop.blurb}
                  </p>
                  {stop.try && (
                    <p className="mt-2.5 rounded-lg border border-accent/20 bg-accent/[0.07] px-3 py-2 text-[12.5px] leading-relaxed text-accent">
                      Try it: {stop.try}
                    </p>
                  )}

                  {/* page switcher — or just click around in the page itself */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {tour.stops.map((s, i) => (
                      <button
                        key={s.file}
                        onClick={() => goto(i)}
                        className={`rounded-md px-2.5 py-1 text-[11.5px] transition-colors ${
                          i === stopIndex
                            ? "bg-ink text-base"
                            : visited.has(s.file)
                              ? "bg-white/[0.07] text-ink"
                              : "text-muted hover:bg-white/[0.05] hover:text-ink"
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-2 border-t border-line pt-3.5">
                    <button
                      onClick={nextTemplate}
                      className="rounded-full border border-line px-3.5 py-2 text-[12.5px] text-ink transition-colors hover:border-ink/25"
                    >
                      Show me another
                    </button>
                    <button
                      onClick={() => {
                        track("tour_reveal", {
                          template: tour.slug,
                          pages_seen: visited.size,
                          templates_seen: seenCount + 1,
                        });
                        setRevealed(true);
                      }}
                      className="ml-auto rounded-full bg-ink px-4 py-2 text-[12.5px] font-medium text-base transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      {allSeen ? "I've seen enough" : "Done exploring"}
                    </button>
                  </div>

                  {seenCount > 0 && (
                    <p className="mt-2.5 text-center text-[11px] text-faint">
                      {seenCount + 1} templates so far — there are{" "}
                      {showcase.length} in all.
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {revealed && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-end overflow-y-auto bg-gradient-to-t from-base via-base/98 via-45% to-transparent px-6 pb-10 pt-[46vh]"
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
                {seenCount > 0 ? "Those were all " : "That whole site was a "}
                <span className="serif-accent text-accent">
                  {seenCount > 0 ? "templates." : "template."}
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.15, ease }}
                className="mx-auto mt-5 max-w-lg text-pretty text-[15.5px] leading-relaxed text-muted"
              >
                Everything you just clicked through is {tour.name} —{" "}
                {tour.pages} pages of source you can own for{" "}
                {money(tour.priceCents)}. All {showcase.length} are built to
                that standard, which is easier to show than to claim.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.35, ease }}
                className="mt-9"
              >
                <Rotator items={showcase.filter((s) => s.slug !== tour.slug)} />
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

function Rotator({ items }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % items.length), 2600);
    return () => clearInterval(id);
  }, [items.length]);

  const item = items[i];
  if (!item) return null;

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
