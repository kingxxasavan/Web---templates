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
      <div className="card mx-auto w-full max-w-md rounded-3xl p-9 text-center">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Link no longer valid</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-muted">
          Reset links expire after an hour and can only be used once.
        </p>
        <Link
          href="/forgot"
          className="btn btn-primary mt-7"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="card mx-auto w-full max-w-md rounded-3xl p-9 text-center">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Password updated</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-muted">
          Every other session has been signed out. Sign in with your new
          password.
        </p>
        <Link
          href="/login"
          className="btn btn-primary mt-7"
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
    try {
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
    } catch { setError("Unable to connect. Please try again."); }
    finally { setBusy(false); }
  }

  return (
    <div className="card mx-auto w-full max-w-md rounded-3xl p-7 sm:p-9">
      <h1 className="text-[28px] font-semibold tracking-[-0.025em]">Choose a new password</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">
        At least 8 characters. Setting it will sign out every other session.
      </p>

      <form onSubmit={submit} className="mt-7 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">New password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">Confirm password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="input"
          />
        </label>

        {error && (
          <p role="alert" className="alert-error">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="btn btn-primary mt-1 w-full"
        >
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
