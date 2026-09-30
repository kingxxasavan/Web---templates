import { NextResponse } from "next/server";
import { clearCart } from "@/lib/cart";

/**
 * Stripe's success redirect lands here so the cart cookie can be cleared
 * before the buyer sees their library. Fulfilment itself happens in the
 * webhook, which arrives even if the buyer closes the tab first.
 */
export async function GET(request) {
  const url = new URL(request.url);
  const order = url.searchParams.get("order") ?? "";
  await clearCart();
  const target = new URL("/account", url.origin);
  if (/^[A-Za-z0-9]{1,40}$/.test(order)) target.searchParams.set("order", order);
  return NextResponse.redirect(target, 303);
}
