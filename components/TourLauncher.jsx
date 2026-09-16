"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Tour from "./Tour";

const SEEN = "foundry_tour_seen";

/**
 * Opens the tour once per visitor, and leaves a way back in.
 *
 * It mounts over the storefront rather than redirecting, so the page a crawler
 * or a returning visitor gets is still the store — the tour is an addition,
 * never a gate.
 */
export default function TourLauncher({ tour, showcase, variant = "auto" }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (variant !== "auto") return;
    let seen = true;
    try {
      seen = localStorage.getItem(SEEN) === "1";
    } catch {
      // private mode or blocked storage: don't ambush them, just skip
    }
    if (!seen) {
      const id = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(id);
    }
  }, [variant]);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(SEEN, "1");
    } catch {
      /* nothing to persist to; the tour simply shows again next time */
    }
  }

  return (
    <>
      {variant === "button" && (
        <button
          onClick={() => setOpen(true)}
          className="group inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-[14px] text-ink transition-colors hover:border-ink/25"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          Take the tour
        </button>
      )}

      <AnimatePresence>
        {open && <Tour tour={tour} showcase={showcase} onClose={close} />}
      </AnimatePresence>
    </>
  );
}
