import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import CartView from "@/components/CartView";
import { currentUser } from "@/lib/auth";
import { getCart } from "@/lib/store";
import { readGuestCart } from "@/lib/guest-cart";

export const metadata = { title: "Cart" };

export default async function CartPage() {
  const user = await currentUser();
  const guest = user ? [] : await readGuestCart();
  const cart = await getCart(user?.id ?? null, guest);

  return (
    <>
      <Masthead />
      <main className="mx-auto w-full max-w-5xl px-6 py-14">
        <h1 className="text-[30px] tracking-[-0.02em]">Your cart</h1>
        <div className="mt-8">
          <CartView initialCart={cart} signedIn={Boolean(user)} />
        </div>
      </main>
      <Footer />
    </>
  );
}
