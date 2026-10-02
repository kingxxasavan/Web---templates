import { Suspense } from "react";
import Link from "next/link";
import AuthForm from "./AuthForm";
import { Check } from "./store";

const PERKS = [
  "Your purchases, re-downloadable any time",
  "Updates to templates you own",
  "Save your work in the online editor",
  "Leave verified-buyer reviews",
];

/** Shared frame for sign-in and sign-up. */
export default function AuthPage({ mode }) {
  return (
    <main className="shell grid grid-cols-1 items-center gap-12 py-14 md:py-20 lg:grid-cols-[1fr_1.05fr]">
      <div className="order-2 lg:order-1">
        <p className="eyebrow">{mode === "register" ? "Free account" : "Welcome back"}</p>
        <h2 className="h-section mt-3 max-w-md text-balance">
          Everything you buy, <span className="serif-accent text-accent">in one place.</span>
        </h2>
        <ul className="mt-7 flex flex-col gap-3">
          {PERKS.map((p) => (
            <li key={p} className="flex gap-2.5 text-[15px]">
              <Check /> {p}
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-md text-[13.5px] leading-relaxed text-muted">
          Accounts are secured by Google Firebase. Your password is checked by
          Firebase and never stored by us, and we never share your email.
        </p>
      </div>

      <div className="order-1 lg:order-2">
        <Suspense fallback={null}>
          <AuthForm mode={mode} />
        </Suspense>
      </div>
    </main>
  );
}
