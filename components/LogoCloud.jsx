"use client";

const LOGOS = [
  "Northwind", "Cadence", "Lumen", "Foundry", "Arcadia",
  "Vela", "Monolith", "Kepler", "Brightside", "Runway Labs",
];

export default function LogoCloud() {
  return (
    <section className="relative border-y border-white/[0.06] py-10">
      <p className="mb-8 text-center text-[11px] uppercase tracking-[0.22em] text-muted/60">
        Trusted by support teams at
      </p>
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="flex w-max animate-marquee gap-14 pr-14">
          {[...LOGOS, ...LOGOS].map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="whitespace-nowrap text-lg font-medium tracking-[-0.01em] text-muted/45 transition-colors duration-300 hover:text-ink"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
