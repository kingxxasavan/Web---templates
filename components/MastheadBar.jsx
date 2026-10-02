"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon, Logo } from "./icons";
import ThemeToggle from "./ThemeToggle";

export const NAV = [
  { href: "/templates", label: "Templates" },
  { href: "/made-for-you", label: "Made for you" },
  { href: "/pricing", label: "Pricing" },
  { href: "/guides", label: "Guides" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
];

// The mobile menu has room for everything.
const MOBILE_NAV = [...NAV, { href: "/contact", label: "Contact" }];

export default function MastheadBar({ user, cartCount }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled || open
          ? "border-line bg-paper/90 backdrop-blur-xl"
          : "border-transparent bg-paper"
      }`}
    >
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Foundry home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isActive(n.href) ? "page" : undefined}
              className={`rounded-full px-3 py-2 text-[14px] transition-colors ${
                isActive(n.href) ? "text-ink font-medium" : "text-muted hover:text-ink"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href="/cart"
            aria-label={`Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-sunk"
          >
            <Icon name="cart" size={20} />
            {cartCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10.5px] font-semibold text-on-accent">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-1.5 sm:flex">
            {user ? (
              <>
                <Link href="/account" className="btn btn-sm btn-secondary">
                  My library
                </Link>
                <button onClick={signOut} className="px-3 text-[13.5px] text-muted hover:text-ink">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-3 text-[14px] text-muted transition-colors hover:text-ink">
                  Sign in
                </Link>
                <Link href="/templates" className="btn btn-sm btn-primary hidden xl:inline-flex">
                  Browse templates
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-sunk lg:hidden"
          >
            <Icon name={open ? "close" : "menu"} size={20} />
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t border-line bg-paper lg:hidden">
          <div className="shell flex flex-col py-3">
            {MOBILE_NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={isActive(n.href) ? "page" : undefined}
                className="border-b border-line py-3.5 text-[16px] font-medium last:border-0"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-3 flex gap-2 pb-2">
              {user ? (
                <>
                  <Link href="/account" className="btn btn-primary flex-1">My library</Link>
                  <button onClick={signOut} className="btn btn-secondary flex-1">Sign out</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn btn-secondary flex-1">Sign in</Link>
                  <Link href="/register" className="btn btn-primary flex-1">Create account</Link>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
