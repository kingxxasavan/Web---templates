"use client";

import { useState } from "react";

/** Shown to an allowlisted admin whose address isn't confirmed yet. */
export default function VerifyEmail({ email }) {
  const [state, setState] = useState("idle");

  async function send() {
    setState("sending");
    const res = await fetch("/api/auth/verify", { method: "POST" }).catch(() => null);
    setState(res?.ok ? "sent" : "error");
  }

  return (
    <div className="card mx-auto max-w-md rounded-3xl p-8 text-center">
      <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Confirm your email first</h1>
      <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
        {email} is on the admin list, but the dashboard opens only once Firebase
        has confirmed you own the address. Click the link in the verification
        email, then sign out and back in.
      </p>
      <button onClick={send} disabled={state === "sending" || state === "sent"} className="btn btn-primary mt-6">
        {state === "sent" ? "Sent. Check your inbox" : state === "sending" ? "Sending…" : "Send verification email"}
      </button>
      {state === "error" && (
        <p role="alert" className="alert-error mt-4">We couldn&rsquo;t send it just now. Try again in a minute.</p>
      )}
    </div>
  );
}
