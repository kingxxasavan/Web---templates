"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Tour from "./Tour";

/**
 * The tour is opt-in. It used to open itself on a first visit, which meant
 * every arrival was interrupted before they had seen anything — and anyone
 * clearing site data got interrupted again. It is a button now.
 */
export default function TourLauncher({ pool, showcase }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-[14px] text-ink transition-colors hover:border-ink/25"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
        Try a template live
      </button>

      <AnimatePresence>
        {open && (
          <Tour pool={pool} showcase={showcase} onClose={() => setOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
