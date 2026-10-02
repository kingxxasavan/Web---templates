"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

/** Only same-site paths, so ?next= can't bounce a buyer to another site. */
function safeNext(value) {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
    ? value
    : "/account";
}

/**
 * Email and password go to our own API, which signs in with Firebase on the
 * server and sets an httpOnly session cookie. Nothing about the session is
 * readable from the page.
 */
export default function AuthForm({ mode }) {
  const isRegister = mode === "register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [configProblem, setConfigProblem] = useState(false);
  const [busy, setBusy] = useState(false);

  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const carryNext = params.get("next") ? `?next=${encodeURIComponent(next)}` : "";

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setConfigProblem(false);
    if (isRegister && password.length < 8) {
      setError("Choose a password of at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setConfigProblem(data.reason === "not_configured");
        setBusy(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <div className="card mx-auto w-full max-w-md rounded-3xl p-7 sm:p-9">
      <h1 className="text-[28px] font-semibold tracking-[-0.025em]">
        {isRegister ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
        {isRegister
          ? "Free, and it takes a few seconds. Your purchases live in your library for good."
          : "Sign in to reach your library and downloads."}
      </p>

      <form onSubmit={submit} className="mt-7 flex flex-col gap-4" noValidate>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[13px]">
            <label htmlFor="auth-password" className="font-medium">Password</label>
            {!isRegister && (
              <Link href="/forgot" className="text-muted underline-offset-4 hover:text-ink hover:underline">
                Forgot password?
              </Link>
            )}
          </div>
          <input
            id="auth-password"
            type="password"
            required
            minLength={isRegister ? 8 : undefined}
            maxLength={200}
            autoComplete={isRegister ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder={isRegister ? "At least 8 characters" : "Your password"}
          />
        </div>

        {error && (
          <div role="alert" className="alert-error">
            <p>{error}</p>
            {configProblem && (
              <p className="mt-1.5 text-[12px] opacity-80">
                Diagnostics:{" "}
                <a href="/api/health" className="underline underline-offset-2" target="_blank" rel="noreferrer">
                  /api/health
                </a>
              </p>
            )}
          </div>
        )}

        <button type="submit" disabled={busy} className="btn btn-primary mt-1 w-full">
          {busy ? "One moment…" : isRegister ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-[14px] text-muted">
        {isRegister ? "Already have an account? " : "New here? "}
        <Link
          href={`${isRegister ? "/login" : "/register"}${carryNext}`}
          className="font-medium text-ink underline underline-offset-4 hover:text-accent"
        >
          {isRegister ? "Sign in" : "Create a free account"}
        </Link>
      </p>

      {isRegister && (
        <p className="mt-4 text-center text-[12px] leading-relaxed text-faint">
          By creating an account you agree to the{" "}
          <Link href="/licence" className="underline underline-offset-2 hover:text-ink">licence terms</Link>.
        </p>
      )}
    </div>
  );
}
