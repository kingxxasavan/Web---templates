"use client";

import { motion } from "framer-motion";

export function Reveal({ children, delay = 0, y = 24, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Eyebrow({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted backdrop-blur-xl">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-cyan animate-pulse-ring" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan" />
      </span>
      {children}
    </span>
  );
}

export function Button({
  children,
  href = "#",
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "group relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet";

  const styles = {
    primary:
      "bg-ink text-void hover:bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_18px_40px_-14px_rgba(124,92,255,0.7)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_22px_60px_-14px_rgba(124,92,255,0.95)] hover:-translate-y-0.5",
    ghost:
      "border border-white/12 bg-white/[0.02] text-ink backdrop-blur-xl hover:bg-white/[0.07] hover:border-white/25",
    glow: "bg-gradient-to-r from-violet to-cyan text-void font-semibold hover:-translate-y-0.5 shadow-[0_18px_50px_-16px_rgba(124,92,255,0.9)]",
  };

  return (
    <a href={href} className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </a>
  );
}

export function SectionHeading({ eyebrow, title, accent, sub, align = "center" }) {
  const alignment =
    align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <div className={`flex flex-col ${alignment} gap-5`}>
      {eyebrow && (
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
      )}
      <Reveal delay={0.06}>
        <h2 className="max-w-3xl text-balance text-4xl leading-[1.08] tracking-[-0.02em] sm:text-5xl md:text-[3.4rem]">
          {title}{" "}
          {accent && (
            <span className="font-display italic text-gradient">{accent}</span>
          )}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.12}>
          <p className="max-w-xl text-pretty text-[15px] leading-relaxed text-muted sm:text-base">
            {sub}
          </p>
        </Reveal>
      )}
    </div>
  );
}

export function Section({ id, children, className = "" }) {
  return (
    <section id={id} className={`relative px-6 py-24 md:py-32 ${className}`}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}
