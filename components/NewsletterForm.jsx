"use client";

import { useState } from "react";

/** New-release alerts. Saved to Firestore; shown on /admin. */
export default function NewsletterForm({ source = "footer", dark = false }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState({ status: "idle", message: "" });

  async function submit(e) {
    e.preventDefault();
    setState({ status: "busy", message: "" });
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source, website: e.target.website.value }),
    }).catch(() => null);
    const data = await res?.json().catch(() => ({}));

    if (!res?.ok) {
      setState({ status: "error", message: data?.error || "That didn't go through. Please try again." });
      return;
    }
    setState({ status: "done", message: "You're on the list. We'll email you when something new ships." });
    setEmail("");
  }

  if (state.status === "done") {
    return (
      <p role="status" className={`text-[14px] ${dark ? "text-white" : "text-good"}`}>
        {state.message}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={`nl-${source}`}>Email address</label>
        <input
          id={`nl-${source}`}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={`input flex-1 ${dark ? "border-night-line bg-night-raise text-white placeholder:text-night-muted" : ""}`}
        />
        {/* honeypot: hidden from people, irresistible to bots */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <button
          type="submit"
          disabled={state.status === "busy"}
          className={`btn ${dark ? "btn-on-dark" : "btn-primary"}`}
        >
          {state.status === "busy" ? "Adding…" : "Notify me"}
        </button>
      </div>
      {state.status === "error" && (
        <p role="alert" className="mt-2 text-[13px] text-danger">
          {state.message}
        </p>
      )}
    </form>
  );
}
