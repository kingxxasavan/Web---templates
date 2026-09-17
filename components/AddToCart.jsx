"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/firebase-client";

export default function AddToCart({ slug, label, owned = false, className = "" }) {
  const [state, setState] = useState("idle");
  const router = useRouter();

  if (owned) {
    return (
      <a
        href={`/api/download/${slug}`}
        className={`inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-[14.5px] font-medium text-base transition-transform duration-300 hover:-translate-y-0.5 ${className}`}
      >
        Download — you own this
      </a>
    );
  }

  async function add() {
    setState("loading");
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, action: "add" }),
    });

    if (!res.ok) {
      setState("error");
      return;
    }
    setState("added");
    track("add_to_cart", { item_id: slug });
    router.refresh();
  }

  const text = {
    idle: label,
    loading: "Adding…",
    added: "In your cart ✓",
    error: "Try again",
  }[state];

  return (
    <button
      onClick={add}
      disabled={state === "loading"}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[14.5px] font-medium text-base transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60 ${className}`}
    >
      {text}
    </button>
  );
}
