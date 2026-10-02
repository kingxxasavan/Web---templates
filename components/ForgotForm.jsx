"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Firebase sends the reset email; its link comes back to /reset, where the
 * new password is chosen.
 */
export default function ForgotForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || "Something went wrong. Please try again.");
      else setSent(data.message || `If ${email.trim()} has an account, a reset link is on its way.`);
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    }
    setBusy(false);
  }

  if (sent) {
    return (
      <div className="card mx-auto w-full max-w-md rounded-3xl p-9 text-center">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Check your inbox</h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
          {sent} It may take a minute, and it&rsquo;s worth checking spam.
        </p>
        <Link href="/login" className="btn btn-primary mt-7">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="card mx-auto w-full max-w-md rounded-3xl p-7 sm:p-9">
      <h1 className="text-[28px] font-semibold tracking-[-0.025em]">Reset your password</h1>
      <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
        Enter the email you signed up with and we&rsquo;ll send you a link to
        choose a new password.
      </p>

      <form onSubmit={submit} className="mt-7 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input"
          />
        </label>

        {error && (
          <p role="alert" className="alert-error">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn btn-primary w-full">
          {busy ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-[14px] text-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-ink underline underline-offset-4 hover:text-accent">
          Sign in
        </Link>
      </p>
    </div>
  );
}
