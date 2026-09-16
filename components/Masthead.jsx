"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Masthead() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-line bg-base/85 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink">
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
              <path d="M2 11.5L8 2l6 9.5H2z" fill="#0a0a0b" />
            </svg>
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.01em]">Foundry</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/#templates"
            className="rounded-full px-3 py-2 text-[13.5px] text-muted transition-colors hover:text-ink"
          >
            Templates
          </Link>
          <Link
            href="/#licence"
            className="hidden rounded-full px-3 py-2 text-[13.5px] text-muted transition-colors hover:text-ink sm:block"
          >
            Licence
          </Link>
          <Link
            href="/#bundle"
            className="ml-1 rounded-full bg-ink px-4 py-2 text-[13.5px] font-medium text-base transition-transform duration-300 hover:-translate-y-0.5"
          >
            Get all 9
          </Link>
        </nav>
      </div>
    </header>
  );
}
