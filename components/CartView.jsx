"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const money = (c) => `$${(c / 100).toFixed(c % 100 === 0 ? 0 : 2)}`;

export default function CartView({ initialCart }) {
  const [cart, setCart] = useState(initialCart);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  async function remove(slug) {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, action: "remove" }),
    });
    if (res.ok) {
      setCart(await res.json());
      router.refresh();
    }
  }

  async function checkout() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/checkout", { method: "POST" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error || "Checkout failed.");
      setBusy(false);
      return;
    }
    router.push(data.redirect);
    router.refresh();
  }

  if (!cart.items.length) {
    return (
      <div className="card rounded-2xl p-10 text-center">
        <p className="text-[15px] text-muted">Your cart is empty.</p>
        <Link
          href="/#templates"
          className="mt-5 inline-block rounded-full bg-ink px-5 py-2.5 text-[13.5px] font-medium text-base"
        >
          Browse templates
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <ul className="flex flex-col gap-3">
        {cart.items.map((i) => (
          <li
            key={i.slug}
            className="card flex items-center justify-between gap-4 rounded-2xl p-5"
          >
            <div>
              <p className="text-[15px] font-medium">{i.name}</p>
              <p className="mt-0.5 text-[13px] text-muted">{i.tagline}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-display text-xl">{money(i.priceCents)}</span>
              <button
                onClick={() => remove(i.slug)}
                aria-label={`Remove ${i.name}`}
                className="text-[12.5px] text-faint underline underline-offset-4 transition-colors hover:text-ink"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card rounded-2xl p-6">
          <h2 className="text-[15px] font-medium">Order summary</h2>

          {cart.removedOwned > 0 && (
            <p className="mt-3 rounded-lg border border-line bg-white/[0.02] px-3 py-2 text-[12px] text-muted">
              {cart.removedOwned} item{cart.removedOwned > 1 ? "s" : ""} already
              in your library {cart.removedOwned > 1 ? "were" : "was"} removed.
            </p>
          )}
          {cart.hasBundle && (
            <p className="mt-3 rounded-lg border border-accent/25 bg-accent/10 px-3 py-2 text-[12px] text-accent">
              The bundle covers every template, so individual items were folded
              into it.
            </p>
          )}

          <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
            <span className="text-[13.5px] text-muted">Total</span>
            <span className="font-display text-3xl tracking-tight">
              {money(cart.subtotalCents)}
            </span>
          </div>
          <p className="mt-1 text-right text-[12px] text-faint">
            one-time payment
          </p>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-[12.5px] text-red-300"
            >
              {error}
            </p>
          )}

          <button
            onClick={checkout}
            disabled={busy}
            className="mt-5 h-11 w-full rounded-full bg-ink text-[14px] font-medium text-base transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60"
          >
            {busy ? "Processing…" : "Complete purchase"}
          </button>

          <p className="mt-4 text-center text-[11.5px] leading-relaxed text-faint">
            Instant download · Lifetime access · Commercial licence
          </p>
        </div>
      </aside>
    </div>
  );
}
