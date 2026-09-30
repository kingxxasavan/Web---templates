import { cookies } from "next/headers";
import { isSellableSlug } from "./catalog.js";

/**
 * The cart lives in a cookie for everyone, signed in or not. Browsing, adding
 * and seeing a total need no account and no database, and nothing has to be
 * merged when a visitor signs up at checkout — the cookie simply comes along.
 *
 * Only slugs are stored. Prices are always recomputed server-side from the
 * catalogue, so editing the cookie changes which items are in the cart and
 * nothing else.
 */

const COOKIE = "cart";
const MAX_ITEMS = 16;
const MAX_AGE = 30 * 86_400;

export function sanitise(list) {
  if (!Array.isArray(list)) return [];
  const clean = list.filter((s) => typeof s === "string" && isSellableSlug(s));
  return [...new Set(clean)].slice(0, MAX_ITEMS);
}

export async function readCart() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return [];
  try {
    return sanitise(JSON.parse(raw));
  } catch {
    return [];
  }
}

export async function writeCart(slugs) {
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

export async function addCartItem(slug) {
  return writeCart([...(await readCart()), slug]);
}

export async function removeCartItem(slug) {
  return writeCart((await readCart()).filter((s) => s !== slug));
}

export async function clearCart() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
