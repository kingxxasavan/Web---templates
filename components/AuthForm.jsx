"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { clientAuth, authErrorMessage } from "@/lib/firebase-client";

/** Only same-site paths, so ?next= can't bounce a buyer to another site. */
function safeNext(value) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/account";
}

export default function AuthForm({ mode }) {
  const isRegister = mode === "register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null); // "email" | "google" | null

  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const carryNext = params.get("next") ? `?next=${encodeURIComponent(next)}` : "";

  /** Hands the fresh Firebase sign-in to the server as a session cookie. */
  async function finish(credential) {
    const idToken = await credential.user.getIdToken();
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    const data = await res.json().catch(() => ({}));
    // The server cookie is the login from here on.
    await signOut(await clientAuth()).catch(() => {});
    if (!res.ok) throw new Error(data.error || "We couldn't finish signing you in. Please try again.");
    router.push(next);
    router.refresh();
  }

  async function submitEmail(e) {
    e.preventDefault();
    setError(null);
    if (isRegister && password.length < 8) {
      setError("Choose a password of at least 8 characters.");
      return;
    }
    setBusy("email");
    try {
      const auth = await clientAuth();
      const credential = isRegister
        ? await createUserWithEmailAndPassword(auth, email.trim(), password)
        : await signInWithEmailAndPassword(auth, email.trim(), password);
      if (isRegister) {
        // Best effort: a missing verification email must not block the sale.
        await sendEmailVerification(credential.user).catch(() => {});
      }
      await finish(credential);
    } catch (err) {
      setError(err.code ? authErrorMessage(err) : err.message);
      setBusy(null);
    }
  }

  async function google() {
    setError(null);
    setBusy("google");
    try {
      const auth = await clientAuth();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await finish(await signInWithPopup(auth, provider));
    } catch (err) {
      setError(err.code ? authErrorMessage(err) : err.message);
      setBusy(null);
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

      <button
        type="button"
        onClick={google}
        disabled={Boolean(busy)}
        className="btn btn-secondary mt-7 w-full"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
        {busy === "google" ? "Opening Google…" : "Continue with Google"}
      </button>

      <div className="my-6 flex items-center gap-3 text-[12px] text-faint">
        <span className="h-px flex-1 bg-line" /> or with email <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={submitEmail} className="flex flex-col gap-4" noValidate>
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
            autoComplete={isRegister ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder={isRegister ? "At least 8 characters" : "Your password"}
          />
        </div>

        {error && (
          <p role="alert" className="alert-error">
            {error}
          </p>
        )}

        <button type="submit" disabled={Boolean(busy)} className="btn btn-primary mt-1 w-full">
          {busy === "email" ? "One moment…" : isRegister ? "Create account" : "Sign in"}
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
