"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { clientAuth, authErrorMessage } from "@/lib/firebase-client";

/**
 * Firebase sends the reset email and hosts the page where the new password is
 * chosen, so no mail provider is needed for this flow.
 */
export default function ForgotForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await sendPasswordResetEmail(await clientAuth(), email.trim());
      setSent(true);
    } catch (err) {
      // Never reveal whether an address has an account.
      if (err.code === "auth/user-not-found") setSent(true);
      else setError(authErrorMessage(err));
    }
    setBusy(false);
  }

  if (sent) {
    return (
      <div className="card mx-auto w-full max-w-md rounded-3xl p-9 text-center">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Check your inbox</h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
          If {email.trim()} has an account, a link to choose a new password is
          on its way. It may take a minute, and it&rsquo;s worth checking spam.
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
        choose a new password. Signed up with Google? Just use Continue with
        Google instead.
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
