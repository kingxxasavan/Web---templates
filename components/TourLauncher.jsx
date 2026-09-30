"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Tour from "./Tour";

/**
 * Opens the guided tour on request. It mounts over the page rather than
 * navigating, so closing it returns the visitor exactly where they were.
 */
export default function TourLauncher({ tour, showcase }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-lg btn-secondary">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        Take the 60-second tour
      </button>

      <AnimatePresence>
        {open && <Tour tour={tour} showcase={showcase} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
