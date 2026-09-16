import { redirect } from "next/navigation";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import CartView from "@/components/CartView";
import { currentUser } from "@/lib/auth";
import { getCart } from "@/lib/store";

export const metadata = { title: "Cart" };

export default async function CartPage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=%2Fcart");

  const cart = await getCart(user.id);

  return (
    <>
      <Masthead />
      <main className="mx-auto w-full max-w-5xl px-6 py-14">
        <h1 className="text-[30px] tracking-[-0.02em]">Your cart</h1>
        <div className="mt-8">
          <CartView initialCart={cart} />
        </div>
      </main>
      <Footer />
    </>
  );
}
