import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { cartCount } from "@/lib/store";
import MastheadBar from "./MastheadBar";

export default async function Masthead() {
  const user = await currentUser();
  const count = user ? await cartCount(user.id) : 0;
  return <MastheadBar user={user} cartCount={count} />;
}
