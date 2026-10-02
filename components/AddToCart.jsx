"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";
import { track } from "@/lib/firebase-client";

export default function AddToCart({ slug, label, owned = false, className = "", variant = "primary", size = "lg" }) {
  const [state, setState] = useState("idle");
  const router = useRouter();

  if (owned) {
    return (
      <a href={`/api/download/${slug}`} className={`btn btn-${size} btn-accent ${className}`}>
        <Icon name="download" size={17} /> Download — you own this
      </a>
    );
  }

  if (state === "added") {
    return (
      <Link href="/cart" className={`btn btn-${size} btn-accent ${className}`}>
        <Icon name="check" size={17} /> Added — go to cart
      </Link>
    );
  }

  async function add() {
    setState("loading");
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, action: "add" }),
    }).catch(() => null);

    if (!res?.ok) {
      setState("error");
      return;
    }
    setState("added");
    track("add_to_cart", { item_id: slug });
    router.refresh();
  }

  return (
    <button
      onClick={add}
      disabled={state === "loading"}
      className={`btn btn-${size} ${variant === "dark" ? "btn-on-dark" : "btn-primary"} ${className}`}
    >
      {state === "loading" ? "Adding…" : state === "error" ? "Couldn't add — try again" : label}
    </button>
  );
}
