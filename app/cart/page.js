import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import CartView from "@/components/CartView";
import { currentUser } from "@/lib/auth";
import { getCart } from "@/lib/store";
import { readGuestCart } from "@/lib/guest-cart";
import { SITE } from "@/lib/site";

export const metadata = { title: "Your cart", robots: { index: false } };

export default async function CartPage() {
  const user = await currentUser();
  const cart = await getCart(user?.id ?? null, user ? [] : await readGuestCart());

  return (
    <>
      <Masthead />
      <main className="shell py-12 md:py-16">
        <h1 className="text-[34px] font-semibold tracking-[-0.025em]">Your cart</h1>
        <div className="mt-8">
          <CartView initialCart={cart} signedIn={Boolean(user)} refundDays={SITE.refundDays} />
        </div>
      </main>
      <Footer />
    </>
  );
}
