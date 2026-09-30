"use client";

import { motion } from "framer-motion";
import { Icon } from "./icons";

export function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Badge({ children, tone = "default" }) {
  const tones = {
    default: "border-line bg-card text-muted",
    accent: "border-accent/20 bg-accent-soft text-accent",
    good: "border-good/20 bg-good-soft text-good",
    dark: "border-transparent bg-ink text-white",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Check({ className = "text-good" }) {
  return <Icon name="check" size={16} strokeWidth={2.2} className={`mt-[3px] ${className}`} />;
}
