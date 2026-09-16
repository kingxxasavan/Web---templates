"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MastheadBar({ user, cartCount }) {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-line bg-base/85 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink">
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
              <path d="M2 11.5L8 2l6 9.5H2z" fill="#0a0a0b" />
            </svg>
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.01em]">
            Foundry
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/#templates"
            className="hidden rounded-full px-3 py-2 text-[13.5px] text-muted transition-colors hover:text-ink sm:block"
          >
            Templates
          </Link>

          <Link
            href="/cart"
            className="relative rounded-full px-3 py-2 text-[13.5px] text-muted transition-colors hover:text-ink"
          >
            Cart
            {cartCount > 0 && (
              <span className="ml-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-base">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link
                href="/account"
                className="rounded-full px-3 py-2 text-[13.5px] text-muted transition-colors hover:text-ink"
              >
                Library
              </Link>
              <button
                onClick={signOut}
                className="rounded-full px-3 py-2 text-[13.5px] text-faint transition-colors hover:text-ink"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-[13.5px] text-muted transition-colors hover:text-ink"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="ml-1 rounded-full bg-ink px-4 py-2 text-[13.5px] font-medium text-base transition-transform duration-300 hover:-translate-y-0.5"
              >
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
