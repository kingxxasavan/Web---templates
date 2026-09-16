import { cookies } from "next/headers";
import { isSellableSlug } from "./catalog.js";

/**
 * A cart for visitors who have not signed up. It lives entirely in a cookie,
 * so browsing, adding and seeing a total all work with no account and no
 * database — which is also what keeps the storefront up when the database
 * isn't configured yet.
 *
 * Only slugs are stored. Prices are always recomputed server-side from the
 * catalogue, so editing the cookie changes which items are in the cart and
 * nothing else.
 */

const COOKIE = "guest_cart";
const MAX_ITEMS = 12;
const MAX_AGE = 30 * 86_400;

function sanitise(list) {
  if (!Array.isArray(list)) return [];
  const clean = list.filter(
    (s) => typeof s === "string" && isSellableSlug(s)
  );
  return [...new Set(clean)].slice(0, MAX_ITEMS);
}

export async function readGuestCart() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return [];
  try {
    return sanitise(JSON.parse(raw));
  } catch {
    return [];
  }
}

export async function writeGuestCart(slugs) {
  const clean = sanitise(slugs);
  const jar = await cookies();

  if (!clean.length) {
    jar.delete(COOKIE);
    return [];
  }

  jar.set(COOKIE, JSON.stringify(clean), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return clean;
}

export async function addGuestItem(slug) {
  const current = await readGuestCart();
  return writeGuestCart([...current, slug]);
}

export async function removeGuestItem(slug) {
  const current = await readGuestCart();
  return writeGuestCart(current.filter((s) => s !== slug));
}

export async function clearGuestCart() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
