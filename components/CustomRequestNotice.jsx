"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icons";
import { openBrief } from "./BriefWizard";

const KEY = "foundry-custom-notice";
const WEEK = 7 * 86_400_000;

/**
 * A quiet card that appears after someone has been browsing for a while:
 * if nothing fits, we'll build one to their brief. Dismissing it hides it
 * for a week.
 */
export default function CustomRequestNotice({ price, delivery, delay = 12000 }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (Date.now() - Number(localStorage.getItem(KEY) || 0) < WEEK) return;
    } catch {
      /* no storage: show it anyway */
    }
    const id = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(id);
  }, [delay]);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  if (!show) return null;
  return (
    <div role="status" className="fixed bottom-4 left-4 right-4 z-[80] sm:left-auto sm:right-6 sm:max-w-sm">
      <div className="card relative rounded-2xl p-5 shadow-[var(--shadow-lift)]">
        <button type="button" onClick={dismiss} aria-label="Dismiss" className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-faint hover:bg-sunk hover:text-ink">
          <Icon name="close" size={15} />
        </button>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Icon name="sparkle" size={18} />
        </span>
        <p className="mt-3 pr-6 text-[15px] font-semibold">Can&rsquo;t find the right template?</p>
        <p className="mt-1 text-[13.5px] leading-relaxed text-muted">
          Tell us what you need and we&rsquo;ll build one to your liking in {delivery}, for {price}.
        </p>
        <button
          type="button"
          onClick={() => {
            dismiss();
            openBrief();
          }}
          className="btn btn-sm btn-primary mt-4"
        >
          Describe your site <Icon name="arrow" size={14} />
        </button>
      </div>
    </div>
  );
}

/** The same offer as a band, for the bottom of the template list. */
export function CustomRequestBand({ price, delivery }) {
  return (
    <div className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-accent/20 bg-accent-soft p-7 md:flex-row md:items-center md:p-9">
      <div className="max-w-2xl">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">Made for you</p>
        <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.02em] text-accent-deep">
          Can&rsquo;t find it? We&rsquo;ll build one to your liking in {delivery}.
        </h2>
        <p className="mt-2 text-[14.5px] leading-relaxed text-accent-deep/80">
          Answer a few questions: your business, a template you like, your pages and your colours.
          We build it for {price}.
        </p>
      </div>
      <button type="button" onClick={() => openBrief()} className="btn btn-lg btn-accent shrink-0">
        Start your brief <Icon name="arrow" size={16} />
      </button>
    </div>
  );
}
