"use client";

import { Icon } from "./icons";

/**
 * Flips between light and dark and remembers the choice. With no choice
 * stored the site follows the system setting (see globals.css), so the
 * current theme is read from the page rather than kept in React state.
 */
export default function ThemeToggle({ className = "" }) {
  function toggle() {
    const root = document.documentElement;
    const current =
      root.dataset.theme ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* private mode: the choice lasts for this page view */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark mode"
      title="Light / dark mode"
      className={`flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-sunk ${className}`}
    >
      <Icon name="contrast" size={19} />
    </button>
  );
}
