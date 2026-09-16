"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResetForm({ token, valid }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  if (!valid) {
    return (
      <div className="mx-auto w-full max-w-sm text-center">
        <h1 className="text-[26px] tracking-[-0.02em]">Link no longer valid</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-muted">
          Reset links expire after an hour and can only be used once.
        </p>
        <Link
          href="/forgot"
          className="mt-7 inline-block rounded-full bg-ink px-5 py-2.5 text-[13.5px] font-medium text-base"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto w-full max-w-sm text-center">
        <h1 className="text-[26px] tracking-[-0.02em]">Password updated</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-muted">
          Every other session has been signed out. Sign in with your new
          password.
        </p>
        <Link
          href="/login"
          className="mt-7 inline-block rounded-full bg-ink px-5 py-2.5 text-[13.5px] font-medium text-base"
        >
          Sign in
        </Link>
      </div>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) return setError("The two passwords don't match.");

    setBusy(true);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) return setError(data.error || "Something went wrong.");
    setDone(true);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="text-[28px] tracking-[-0.02em]">Choose a new password</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">
        At least 8 characters. Setting it will sign out every other session.
      </p>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] text-muted">New password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 rounded-xl border border-line bg-raise px-3.5 text-[14px] text-ink outline-none transition-colors focus:border-accent/60"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] text-muted">Confirm password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="h-11 rounded-xl border border-line bg-raise px-3.5 text-[14px] text-ink outline-none transition-colors focus:border-accent/60"
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
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
