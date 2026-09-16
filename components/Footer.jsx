const GROUPS = [
  {
    t: "Product",
    l: ["Overview", "Integrations", "Security", "Changelog", "Status"],
  },
  { t: "Company", l: ["About", "Customers", "Careers", "Blog", "Contact"] },
  { t: "Resources", l: ["Docs", "API reference", "Benchmarks", "Help center"] },
  { t: "Legal", l: ["Privacy", "Terms", "DPA", "Subprocessors"] },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.07] px-6 pb-10 pt-16">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-cyan">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M3.5 2c0 3 9 3.5 9 6.5S3.5 11 3.5 14M12.5 2c0 3-9 3.5-9 6.5s9 2.5 9 5.5"
                    stroke="#06060a"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="text-[15px] font-semibold">Helix</span>
            </div>
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-muted">
              The AI support agent that closes tickets instead of deflecting
              them.
            </p>
            <div className="mt-5 flex gap-2">
              {["SOC 2 Type II", "GDPR"].map((b) => (
                <span
                  key={b}
                  className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] text-muted"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {GROUPS.map((g) => (
            <div key={g.t}>
              <h3 className="text-[12px] font-medium uppercase tracking-[0.14em] text-muted/60">
                {g.t}
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {g.l.map((item) => (
                  <li key={item}>
                    <a
                      href="#top"
                      className="text-[13.5px] text-muted transition-colors hover:text-ink"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.07] pt-7 sm:flex-row">
          <p className="text-[12.5px] text-muted/60">
            © {new Date().getFullYear()} Helix Labs, Inc. All rights reserved.
          </p>
          <p className="text-[12.5px] text-muted/50">
            Built for teams who&rsquo;d rather sleep.
          </p>
        </div>
      </div>
    </footer>
  );
}
