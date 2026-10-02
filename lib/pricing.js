import { BUNDLE, TEMPLATES } from "./catalog.js";

/**
 * What the all-access bundle costs this buyer, or null once they already
 * have everything (a bundle purchase grants every current and future
 * template, so there is nothing left to sell them).
 */
export function bundlePriceFor(owned = new Set()) {
  return TEMPLATES.every((t) => owned.has(t.slug)) ? null : BUNDLE.priceCents;
}
