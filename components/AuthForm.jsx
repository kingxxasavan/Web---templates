"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthForm({ mode }) {
  const isRegister = mode === "register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [configProblem, setConfigProblem] = useState(false);
  const [busy, setBusy] = useState(false);

  const router = useRouter();
  const next = useSearchParams().get("next") || "/account";

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await fetch(`/api/auth/${isRegister ? "register" : "login"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      setConfigProblem(data.reason === "not_configured");
      setBusy(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="text-[28px] tracking-[-0.02em]">
        {isRegister ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">
        {isRegister
          ? "Your purchases stay in your library, re-downloadable whenever you need them."
          : "Sign in to reach your library and downloads."}
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
            className="h-11 rounded-xl border border-line bg-raise px-3.5 text-[14px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent/60"
            placeholder="you@example.com"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="flex items-center justify-between text-[12.5px] text-muted">
            Password
            {!isRegister && (
              <Link
                href="/forgot"
                className="text-faint underline underline-offset-4 transition-colors hover:text-ink"
              >
                Forgot?
              </Link>
            )}
          </span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete={isRegister ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 rounded-xl border border-line bg-raise px-3.5 text-[14px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent/60"
            placeholder={isRegister ? "At least 8 characters" : "••••••••"}
          />
        </label>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-300"
          >
            <p>{error}</p>
            {configProblem && (
              <p className="mt-1.5 text-[12px] text-red-300/70">
                Diagnostics:{" "}
                <a
                  href="/api/health"
                  className="underline underline-offset-2"
                  target="_blank"
                  rel="noreferrer"
                >
                  /api/health
                </a>
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-2 h-11 rounded-full bg-ink text-[14px] font-medium text-base transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60"
        >
          {busy ? "One moment…" : isRegister ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-muted">
        {isRegister ? "Already have an account? " : "No account yet? "}
        <Link
          href={isRegister ? "/login" : "/register"}
          className="text-ink underline underline-offset-4 hover:text-accent"
        >
          {isRegister ? "Sign in" : "Create one"}
        </Link>
      </p>
    </div>
  );
}
