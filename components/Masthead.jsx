import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { cartCount } from "@/lib/store";
import { readGuestCart } from "@/lib/guest-cart";
import MastheadBar from "./MastheadBar";

export default async function Masthead() {
  const user = await currentUser();
  const guest = user ? [] : await readGuestCart();
  const count = await cartCount(user?.id ?? null, guest);
  return <MastheadBar user={user} cartCount={count} />;
}
