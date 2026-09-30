import { Suspense } from "react";
import Link from "next/link";
import AuthForm from "./AuthForm";
import { Check } from "./store";
import { missingServerConfig } from "@/lib/firebase-admin";
import { missingClientConfig } from "@/lib/firebase-config";
import { SITE } from "@/lib/site";

const PERKS = [
  "Your purchases, re-downloadable any time",
  "Updates to templates you own",
  "What you own counts toward the bundle",
  "Leave verified-buyer reviews",
];

/**
 * Shared frame for sign-in and sign-up. If Firebase isn't configured yet the
 * form is replaced with a notice, instead of letting a visitor fill it in and
 * hit an error at the end.
 */
export default function AuthPage({ mode }) {
  const missing = [...missingClientConfig(), ...missingServerConfig()];

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
          Accounts are secured by Google Firebase. We never see or store your
          password, and we never share your email.
        </p>
      </div>

      <div className="order-1 lg:order-2">
        {missing.length ? (
          <div className="card mx-auto w-full max-w-md rounded-3xl p-8">
            <h1 className="text-[24px] font-semibold tracking-[-0.02em]">
              Accounts are almost ready
            </h1>
            <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
              Sign-in is being switched on for {SITE.name}. You can still
              browse, preview and fill your cart. It will be saved for when
              you come back.
            </p>
            <Link href="/templates" className="btn btn-primary mt-6">Browse templates</Link>
            <details className="mt-6 border-t border-line pt-4 text-[12.5px] text-faint">
              <summary className="cursor-pointer">For the site owner</summary>
              <p className="mt-2">
                Set these environment variables, then redeploy (see README → Firebase):
              </p>
              <ul className="mt-2 list-disc pl-5 font-mono">
                {missing.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </details>
          </div>
        ) : (
          <Suspense fallback={null}>
            <AuthForm mode={mode} />
          </Suspense>
        )}
      </div>
    </main>
  );
}
