"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) return setError(data.error || "Something went wrong.");
    setSent(data.message);
  }

  if (sent) {
    return (
      <div className="mx-auto w-full max-w-sm text-center">
        <h1 className="text-[26px] tracking-[-0.02em]">Check your inbox</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-muted">{sent}</p>
        <p className="mt-2 text-[13px] text-faint">
          The link is valid for one hour.
        </p>
        <Link
          href="/login"
          className="mt-7 inline-block rounded-full bg-ink px-5 py-2.5 text-[13.5px] font-medium text-base"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="text-[28px] tracking-[-0.02em]">Reset your password</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">
        Enter the email you signed up with and we&rsquo;ll send a link to
        choose a new password.
      </p>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] text-muted">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-11 rounded-xl border border-line bg-raise px-3.5 text-[14px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent/60"
          />
        </label>

        {error && (
          <p role="alert" className="rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-2 h-11 rounded-full bg-ink text-[14px] font-medium text-base transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60"
        >
          {busy ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-muted">
        Remembered it?{" "}
        <Link href="/login" className="text-ink underline underline-offset-4 hover:text-accent">
          Sign in
        </Link>
      </p>
    </div>
  );
}
