const PATHS = {
  eye: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  credit: "M3 7h18v10H3z M3 11h18 M7 15h3",
  shield: "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z M9 12l2 2 4-4",
  infinity: "M7.5 8.5C5 8.5 3.5 10 3.5 12s1.5 3.5 4 3.5c3.5 0 5.5-7 9-7 2.5 0 4 1.5 4 3.5s-1.5 3.5-4 3.5c-3.5 0-5.5-7-9-7z",
  chat: "M4 5h16v11H9l-5 4V5z M8 9h8 M8 12h5",
  refund: "M4 12a8 8 0 1 0 2.3-5.7 M4 4v4h4 M12 8v8 M9.5 10.5c0-1 1-1.5 2.5-1.5s2.5.6 2.5 1.6c0 2.4-5 1.2-5 3.6 0 1 1 1.8 2.5 1.8s2.5-.6 2.5-1.5",
  check: "M5 12.5l4.5 4.5L19 7.5",
  arrow: "M5 12h14 M13 6l6 6-6 6",
  back: "M19 12H5 M11 6l-6 6 6 6",
  cart: "M3 4h2.5l2.2 10.5h10.6L20.5 8H7 M9.5 19.5a1 1 0 1 0 0-.01 M17 19.5a1 1 0 1 0 0-.01",
  menu: "M4 7h16 M4 12h16 M4 17h16",
  close: "M6 6l12 12 M18 6L6 18",
  download: "M12 4v11 M7 10l5 5 5-5 M5 20h14",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M20 20l-4-4",
  code: "M8 8l-4 4 4 4 M16 8l4 4-4 4 M13.5 5l-3 14",
  layers: "M12 3l9 5-9 5-9-5 9-5z M3 13l9 5 9-5",
  bolt: "M13 3L5 14h6l-1 7 8-11h-6l1-7z",
  mail: "M3 6h18v12H3z M3 7l9 6 9-6",
  sparkle: "M12 3v4 M12 17v4 M3 12h4 M17 12h4 M6 6l2.5 2.5 M15.5 15.5L18 18 M6 18l2.5-2.5 M15.5 8.5L18 6",
  lock: "M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  plus: "M12 5v14 M5 12h14",
  minus: "M5 12h14",
  contrast: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 3v18 M12 7.5h4.5 M12 12h6 M12 16.5h4.5",
  pencil: "M4 20h4L19 9l-4-4L4 16v4z M13.5 6.5l4 4",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2",
  book: "M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z M5 17a3 3 0 0 1 3-3h11",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M3 12h18 M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z",
  save: "M5 4h11l3 3v13H5z M8 4v5h7V4 M8 20v-6h8v6",
  undo: "M9 14L4 9l5-5 M4 9h10a6 6 0 0 1 0 12h-3",
  grid: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",
  star: "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z",
};

export function Icon({ name, size = 20, className = "", strokeWidth = 1.7 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`shrink-0 ${className}`}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

export function Logo({ className = "" }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-ink">
        <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden>
          <path d="M2 12L8 2.5 14 12H2z" style={{ fill: "var(--color-on-ink)" }} />
          <path d="M5.2 12L8 7.4 10.8 12H5.2z" style={{ fill: "var(--color-accent)" }} />
        </svg>
      </span>
      <span className="text-[16px] font-semibold tracking-[-0.02em]">Foundry</span>
    </span>
  );
}
