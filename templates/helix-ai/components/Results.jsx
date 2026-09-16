"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal, SectionHeading } from "./ui";

const METRICS = [
  { to: 71, suffix: "%", label: "Tickets fully resolved", note: "median across 340 teams" },
  { to: 62, suffix: "%", label: "Lower cost per ticket", note: "vs. human-only baseline" },
  { to: 38, suffix: "s", label: "First response time", note: "down from 4h 12m" },
  { to: 9, suffix: " pts", label: "CSAT lift in 90 days", note: "measured post-resolution" },
];

function Counter({ to, suffix }) {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || done.current) return;
        done.current = true;
        const start = performance.now();
        const dur = 1500;
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          // easeOutExpo
          const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          setV(to * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);

  return (
    <span ref={ref} className="font-display text-5xl tracking-tight sm:text-6xl">
      {Math.round(v)}
      <span className="text-gradient">{suffix}</span>
    </span>
  );
}

export default function Results() {
  return (
    <section id="results" className="relative px-6 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 grid-lines opacity-60" />
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          eyebrow="Results"
          title="The numbers teams actually"
          accent="report back."
          sub="Aggregated from 340 Helix accounts running autopilot for 90 days or more. Your mileage will vary — we'll benchmark yours in the trial."
        />

        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((m, i) => (
            <Reveal key={m.label} delay={i * 0.08}>
              <div className="h-full bg-void px-6 py-10 transition-colors duration-500 hover:bg-white/[0.02]">
                <Counter to={m.to} suffix={m.suffix} />
                <p className="mt-4 text-[14.5px] font-medium">{m.label}</p>
                <p className="mt-1 text-[12.5px] text-muted/70">{m.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
