import { currentUser } from "@/lib/auth";
import { readCart } from "@/lib/cart";
import MastheadBar from "./MastheadBar";

export default async function Masthead() {
  const [user, cart] = await Promise.all([currentUser(), readCart()]);
  return (
    <MastheadBar
      user={user ? { email: user.email } : null}
      cartCount={cart.length}
    />
  );
}
