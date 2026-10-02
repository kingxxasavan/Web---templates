import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import AddToCart from "@/components/AddToCart";
import { Icon } from "@/components/icons";
import { currentUser } from "@/lib/auth";
import { libraryFor, ordersFor, orderById, itemName } from "@/lib/store";
import { buildsFor } from "@/lib/builds";
import { editorAccess } from "@/lib/editor-core";
import BuildStatus from "@/components/BuildStatus";
import { bundlePriceFor } from "@/lib/pricing";
import { TEMPLATES, BUNDLE, money } from "@/lib/catalog";

export const metadata = { title: "Your library", robots: { index: false } };

const date = (ts) =>
  new Date(ts).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

export default async function AccountPage({ searchParams }) {
  const user = await currentUser();
  if (!user) redirect("/login?next=%2Faccount");

  const { order: justOrdered } = await searchParams;
  const [access, orders, builds] = await Promise.all([
    libraryFor(user.id),
    ordersFor(user.id).catch(() => []),
    buildsFor(user.id),
  ]);
  const { owned } = access;
  // The buyer can land back here before Stripe's webhook has arrived.
  const returned = justOrdered ? await orderById(String(justOrdered), user.id).catch(() => null) : null;

  const library = TEMPLATES.filter((t) => owned.has(t.slug));
  const hasAll = library.length === TEMPLATES.length;
  const bundlePrice = bundlePriceFor(owned);

  return (
    <>
      <Masthead />
      <main className="shell py-12 md:py-16">
        {returned?.status === "paid" && (
          <div role="status" className="mb-8 flex items-start gap-3 rounded-2xl border border-good/20 bg-good-soft px-5 py-4">
            <Icon name="check" size={20} strokeWidth={2.2} className="mt-0.5 text-good" />
            <div>
              <p className="text-[15px] font-semibold text-good">Payment complete. Your downloads are ready.</p>
              <p className="mt-0.5 text-[13px] text-good/80">
                Order {returned.id.slice(0, 8)} · a receipt is on its way to {user.email}
              </p>
            </div>
          </div>
        )}
        {returned && returned.status !== "paid" && (
          <div role="status" className="mb-8 flex items-start gap-3 rounded-2xl border border-line bg-sunk px-5 py-4">
            <Icon name="clock" size={20} className="mt-0.5 text-muted" />
            <div>
              <p className="text-[15px] font-semibold">Waiting for Stripe to confirm your payment</p>
              <p className="mt-0.5 text-[13px] text-muted">
                This usually takes a few seconds.{" "}
                <a href={`/account?order=${returned.id}`} className="font-medium text-accent hover:underline">Refresh</a>{" "}
                and your downloads will be here.
              </p>
            </div>
          </div>
        )}

        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[34px] font-semibold tracking-[-0.025em]">Your library</h1>
            <p className="mt-1.5 text-[14px] text-muted">Signed in as {user.email}</p>
          </div>
          <p className="text-[13.5px] text-muted">
            {library.length} of {TEMPLATES.length} templates
          </p>
        </header>

        <section className="mt-9">
          {library.length === 0 ? (
            <div className="card rounded-2xl p-12 text-center">
              <p className="text-[16px] font-medium">Nothing here yet</p>
              <p className="mt-1 text-[14px] text-muted">Templates you buy appear here, ready to download.</p>
              <Link href="/templates" className="btn btn-primary mt-6">Browse templates</Link>
            </div>
          ) : (
            <>
              {hasAll && (
                <a
                  href={`/api/download/${BUNDLE.slug}`}
                  className="mb-4 flex items-center justify-between gap-4 rounded-2xl bg-night p-6 text-white"
                >
                  <div>
                    <p className="text-[16px] font-semibold">Everything in one download</p>
                    <p className="mt-0.5 text-[13.5px] text-night-muted">
                      All {TEMPLATES.length} templates in a single zip. New releases appear here automatically.
                    </p>
                  </div>
                  <span className="btn btn-sm btn-on-dark">
                    <Icon name="download" size={15} /> Download all
                  </span>
                </a>
              )}

              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {library.map((t) => (
                  <li key={t.slug} className="card overflow-hidden rounded-2xl">
                    <Link href={`/t/${t.slug}`} className="relative block aspect-[16/9] border-b border-line bg-sunk">
                      <Image
                        src={`/thumbs/${t.slug}.webp`}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover object-top"
                      />
                    </Link>
                    <div className="p-4">
                      <p className="truncate text-[15px] font-semibold">{t.name}</p>
                      <p className="truncate text-[13px] text-muted">{t.tagline}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <a href={`/api/download/${t.slug}`} className="btn btn-sm btn-secondary">
                          <Icon name="download" size={15} /> Download
                        </a>
                        {editorAccess(t, access).ok ? (
                          <Link href={`/editor/${t.slug}`} className="btn btn-sm btn-primary">
                            <Icon name="pencil" size={15} /> Customise
                          </Link>
                        ) : t.livePreview ? (
                          <Link href={`/editor/${t.slug}`} className="btn btn-sm text-muted hover:text-ink">
                            <Icon name="lock" size={14} /> Editor with All-access
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {builds.length > 0 && (
          <section id="builds" className="mt-14">
            <h2 className="text-[20px] font-semibold tracking-[-0.015em]">Made-for-you builds</h2>
            <ul className="mt-5 flex flex-col gap-3">
              {builds.map((b) => (
                <li key={b.id}>
                  <BuildStatus build={b} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {bundlePrice !== null && library.length > 0 && (
          <section className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-accent/20 bg-accent-soft p-6 md:flex-row md:items-center">
            <div>
              <p className="text-[16px] font-semibold text-accent-deep">
                Complete your collection for {money(bundlePrice)}
              </p>
              <p className="mt-1 text-[14px] text-accent-deep/80">
                The {TEMPLATES.length - library.length} templates you don&rsquo;t have yet, plus
                every future release, and the online editor on all of them.
              </p>
            </div>
            <AddToCart slug={BUNDLE.slug} label={`Upgrade — ${money(bundlePrice)}`} size="sm" />
          </section>
        )}

        {orders.length > 0 && (
          <section className="mt-14">
            <h2 className="text-[20px] font-semibold tracking-[-0.015em]">Order history</h2>
            <div className="card mt-5 overflow-x-auto rounded-2xl">
              <table className="w-full min-w-[560px] text-left text-[14px]">
                <thead className="bg-sunk text-[12.5px] text-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Items</th>
                    <th className="px-5 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="px-5 py-3.5 font-mono text-[12.5px] text-muted">{o.id.slice(0, 8)}</td>
                      <td className="px-5 py-3.5 text-muted">{date(o.createdAt)}</td>
                      <td className="px-5 py-3.5">{o.items.map((i) => itemName(i.slug)).join(", ")}</td>
                      <td className="px-5 py-3.5 text-right font-medium">{money(o.totalCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[13px] text-muted">
              Need a refund?{" "}
              <Link href="/contact?topic=support" className="font-medium text-accent hover:underline">Contact us</Link>.
            </p>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
