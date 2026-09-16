"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LINKS = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how" },
  { label: "Results", href: "#results" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3 transition-all duration-500 sm:px-5 ${
          scrolled
            ? "glass shadow-[0_10px_40px_-18px_rgba(0,0,0,0.9)]"
            : "border border-transparent bg-transparent"
        }`}
      >
        <a href="#top" className="flex items-center gap-2.5">
          <Mark />
          <span className="text-[15px] font-semibold tracking-[-0.01em]">
            Helix
          </span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-full px-3.5 py-2 text-[13.5px] text-muted transition-colors hover:bg-white/[0.06] hover:text-ink"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href="#pricing"
            className="rounded-full px-4 py-2 text-[13.5px] text-muted transition-colors hover:text-ink"
          >
            Sign in
          </a>
          <a
            href="#pricing"
            className="rounded-full bg-ink px-4 py-2 text-[13.5px] font-medium text-void transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-12px_rgba(124,92,255,0.9)]"
          >
            Start free
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 md:hidden"
        >
          <div className="flex flex-col gap-1">
            <span
              className={`h-px w-4 bg-ink transition-transform duration-300 ${
                open ? "translate-y-[3px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-4 bg-ink transition-transform duration-300 ${
                open ? "-translate-y-[3px] -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-2 max-w-6xl rounded-2xl border border-white/10 bg-void/95 p-3 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-2xl md:hidden"
          >
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm text-muted transition-colors hover:bg-white/[0.05] hover:text-ink"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#pricing"
              onClick={() => setOpen(false)}
              className="mt-2 block rounded-xl bg-ink px-4 py-3 text-center text-sm font-medium text-void"
            >
              Start free
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Mark() {
  return (
    <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-cyan">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M3.5 2c0 3 9 3.5 9 6.5S3.5 11 3.5 14M12.5 2c0 3-9 3.5-9 6.5s9 2.5 9 5.5"
          stroke="#06060a"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
