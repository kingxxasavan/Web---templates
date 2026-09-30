/**
 * Store-wide facts used in copy across the site. Change them here and every
 * page, the receipt and the metadata follow.
 */
export const SITE = {
  name: "Foundry",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://your-store.vercel.app",
  tagline: "Original website templates, $5 to $15",
  // The refund window promised on the pricing, licence and FAQ pages.
  // Refunds are issued by hand from the Stripe dashboard.
  refundDays: 14,
};
