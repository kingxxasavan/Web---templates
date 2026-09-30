"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";

const money = (c) => `$${(c / 100).toFixed(c % 100 === 0 ? 0 : 2)}`;

export default function CartView({ initialCart, signedIn, refundDays }) {
  const [cart, setCart] = useState(initialCart);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  async function update(body) {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);
    if (res?.ok) {
      setCart(await res.json());
      router.refresh();
    }
  }

  async function checkout() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/checkout", { method: "POST" }).catch(() => null);
    const data = await res?.json().catch(() => ({}));

    if (!res?.ok) {
      // Signed out: off to create an account, cart intact in its cookie.
      if (data?.needsAuth && data.redirect) {
        router.push(data.redirect);
        return;
      }
      setError(data?.error || "Checkout didn't start. Please try again.");
      setBusy(false);
      return;
    }
    window.location.assign(data.redirect);
  }

  if (!cart.items.length) {
    return (
      <div className="card rounded-2xl p-12 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sunk text-muted">
          <Icon name="cart" size={22} />
        </span>
        <p className="mt-4 text-[16px] font-medium">Your cart is empty</p>
        {cart.removedOwned > 0 && (
          <p className="mt-1 text-[14px] text-muted">
            Everything that was in it is already in your library.
          </p>
        )}
        <Link href="/templates" className="btn btn-primary mt-6">
          Browse templates
        </Link>
      </div>
    );
  }

  const { upgrade } = cart;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-3">
        <ul className="flex flex-col gap-3">
          {cart.items.map((i) => (
            <li key={i.slug} className="card flex items-center justify-between gap-4 rounded-2xl p-5">
              <div className="min-w-0">
                <p className="text-[15.5px] font-semibold">{i.name}</p>
                <p className="mt-0.5 text-[13.5px] text-muted">{i.tagline}</p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <span className="text-right">
                  {i.listPriceCents !== i.priceCents && (
                    <span className="mr-2 text-[14px] text-faint line-through">{money(i.listPriceCents)}</span>
                  )}
                  <span className="text-[19px] font-semibold">{money(i.priceCents)}</span>
                </span>
                <button
                  onClick={() => update({ slug: i.slug, action: "remove" })}
                  aria-label={`Remove ${i.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-faint transition-colors hover:bg-sunk hover:text-ink"
                >
                  <Icon name="close" size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>

        {upgrade && (
          <div className="rounded-2xl border border-accent/25 bg-accent-soft p-5">
            <p className="text-[15px] font-semibold text-accent-deep">
              {upgrade.differenceCents <= 0
                ? `The all-access bundle is cheaper: ${money(upgrade.bundlePriceCents)} for everything.`
                : `For ${money(upgrade.differenceCents)} more, get every template.`}
            </p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-accent-deep/80">
              The bundle adds {upgrade.extraTemplates} more template
              {upgrade.extraTemplates === 1 ? "" : "s"}, plus every one we release
              later{signedIn ? ", with what you already own taken off the price" : ""}.
            </p>
            <button onClick={() => update({ action: "upgrade" })} className="btn btn-sm btn-accent mt-4">
              Switch to the bundle — {money(upgrade.bundlePriceCents)}
            </button>
          </div>
        )}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card rounded-2xl p-6">
          <h2 className="text-[16px] font-semibold">Order summary</h2>

          {cart.removedOwned > 0 && (
            <p className="mt-3 rounded-lg bg-sunk px-3 py-2 text-[12.5px] text-muted">
              {cart.removedOwned} item{cart.removedOwned > 1 ? "s" : ""} you already own{" "}
              {cart.removedOwned > 1 ? "were" : "was"} removed.
            </p>
          )}

          <dl className="mt-5 flex flex-col gap-2 border-t border-line pt-5 text-[14px]">
            {cart.creditCents > 0 && (
              <div className="flex justify-between text-good">
                <dt>Credit for templates you own</dt>
                <dd>−{money(cart.creditCents)}</dd>
              </div>
            )}
            <div className="flex items-baseline justify-between">
              <dt className="text-muted">Total</dt>
              <dd className="text-[30px] font-semibold tracking-tight">{money(cart.totalCents)}</dd>
            </div>
          </dl>
          <p className="text-right text-[12px] text-faint">One-time payment, USD</p>

          {error && (
            <p role="alert" className="mt-4 alert-error">
              {error}
            </p>
          )}

          <button onClick={checkout} disabled={busy} className="btn btn-lg btn-primary mt-5 w-full">
            <Icon name="lock" size={16} />
            {busy ? "Processing…" : signedIn ? "Checkout securely" : "Continue to checkout"}
          </button>

          {!signedIn && (
            <p className="mt-3 text-center text-[12.5px] leading-relaxed text-muted">
              You&rsquo;ll create a free account next, so your downloads have a
              home. Your cart comes with you.
            </p>
          )}

          <ul className="mt-5 flex flex-col gap-2 border-t border-line pt-5 text-[12.5px] text-muted">
            {[
              "Instant download after payment",
              "Commercial licence, unlimited projects",
              `${refundDays}-day money-back guarantee`,
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Icon name="check" size={14} strokeWidth={2.2} className="text-good" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
