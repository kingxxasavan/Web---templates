import { Arrow } from "./store";

/**
 * One button, two modes. With a checkoutUrl it sends the buyer to the hosted
 * checkout (Gumroad / Lemon Squeezy / Polar), which handles payment, VAT and
 * file delivery. Without one it serves the zip straight from /public, so the
 * store is useful the moment it deploys.
 */
export default function GetButton({ item, size = "md", className = "" }) {
  const paid = Boolean(item.checkoutUrl);
  const href = paid ? item.checkoutUrl : `/downloads/${item.slug}.zip`;

  const sizes = {
    md: "px-5 py-2.5 text-[13.5px]",
    lg: "px-6 py-3.5 text-[14.5px]",
  };

  return (
    <a
      href={href}
      {...(paid
        ? { target: "_blank", rel: "noopener noreferrer" }
        : { download: `${item.slug}.zip` })}
      className={`group inline-flex items-center justify-center gap-2 rounded-full bg-ink font-medium text-base transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${sizes[size]} ${className}`}
    >
      {paid ? `Buy — $${item.price}` : "Download source"}
      <Arrow />
    </a>
  );
}
