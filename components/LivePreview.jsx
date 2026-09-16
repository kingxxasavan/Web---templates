"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const DEVICES = {
  desktop: { w: "100%", label: "Desktop", icon: "M3 5h18v11H3z M9 20h6" },
  tablet: { w: "820px", label: "Tablet", icon: "M6 3h12v18H6z" },
  phone: { w: "400px", label: "Phone", icon: "M8 2h8v20H8z" },
};

/**
 * The real template, running, with its pages as tabs — so a buyer can walk
 * every page and function before paying instead of squinting at one
 * screenshot. Templates that need a build step fall back to their still.
 */
export default function LivePreview({ template }) {
  const { slug, pageList, livePreview } = template;
  const [page, setPage] = useState(pageList[0]);
  const [device, setDevice] = useState("desktop");
  const [loading, setLoading] = useState(true);
  const frameRef = useRef(null);

  useEffect(() => {
    setLoading(true);
  }, [page, device]);

  if (!livePreview) {
    return (
      <div>
        <div className="card overflow-hidden rounded-2xl">
          <Image
            src={`/thumbs/${slug}.webp`}
            alt={`${template.name} preview`}
            width={1100}
            height={825}
            priority
            className="w-full"
          />
        </div>
        <p className="mt-3 text-[12.5px] text-faint">
          {template.name} is a Next.js project, so it runs after{" "}
          <code className="text-muted">npm install</code> rather than in a
          preview frame.
        </p>
        <PageList pages={pageList} />
      </div>
    );
  }

  return (
    <div>
      <div className="card overflow-hidden rounded-2xl">
        {/* browser chrome */}
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-raise px-3 py-2.5">
          <div className="flex gap-1.5 pr-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>

          <div className="flex flex-wrap gap-1">
            {pageList.map((p) => (
              <button
                key={p.file}
                onClick={() => setPage(p)}
                aria-pressed={page.file === p.file}
                className={`rounded-md px-2.5 py-1 text-[11.5px] transition-colors ${
                  page.file === p.file
                    ? "bg-ink text-base"
                    : "text-muted hover:bg-white/[0.05] hover:text-ink"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-1">
            {Object.entries(DEVICES).map(([key, d]) => (
              <button
                key={key}
                onClick={() => setDevice(key)}
                aria-label={d.label}
                aria-pressed={device === key}
                className={`rounded-md p-1.5 transition-colors ${
                  device === key
                    ? "bg-white/[0.08] text-ink"
                    : "text-faint hover:text-muted"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d={d.icon}
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            ))}
            <a
              href={`/preview/${slug}/${page.file}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 rounded-md px-2 py-1 text-[11.5px] text-muted transition-colors hover:text-ink"
            >
              Open ↗
            </a>
          </div>
        </div>

        {/* the template itself */}
        <div className="relative bg-white">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-raise">
              <span className="text-[12.5px] text-faint">Loading preview…</span>
            </div>
          )}
          <div
            className="mx-auto transition-all duration-500"
            style={{ width: DEVICES[device].w, maxWidth: "100%" }}
          >
            <iframe
              ref={frameRef}
              key={`${slug}-${page.file}`}
              src={`/preview/${slug}/${page.file}`}
              title={`${template.name} — ${page.name}`}
              onLoad={() => setLoading(false)}
              loading="lazy"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              className="h-[620px] w-full border-0 bg-white"
            />
          </div>
        </div>
      </div>

      <p className="mt-3 text-[12.5px] leading-relaxed text-faint">
        <span className="text-muted">{page.name}</span> — {page.blurb}
      </p>

      <PageList pages={pageList} />
    </div>
  );
}

function PageList({ pages }) {
  return (
    <div className="mt-10">
      <h2 className="text-[20px] tracking-[-0.015em]">
        Every page, and what&rsquo;s in it
      </h2>
      <ul className="mt-4 flex flex-col divide-y divide-line border-y border-line">
        {pages.map((p) => (
          <li key={p.name} className="flex flex-col gap-1 py-3.5 sm:flex-row sm:gap-5">
            <span className="w-32 shrink-0 text-[13.5px] font-medium">
              {p.name}
            </span>
            <span className="text-[13.5px] leading-relaxed text-muted">
              {p.blurb}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
