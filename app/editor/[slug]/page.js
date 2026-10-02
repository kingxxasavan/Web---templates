import Link from "next/link";
import { notFound } from "next/navigation";
import EditorApp from "@/components/EditorApp";
import { currentUser } from "@/lib/auth";
import { libraryFor } from "@/lib/store";
import { loadProject } from "@/lib/editor";
import { editorAccess } from "@/lib/editor-core";
import { TIERS, bySlug, money, themeFileOf } from "@/lib/catalog";

export async function generateMetadata({ params }) {
  const t = bySlug((await params).slug);
  return { title: t ? `Customise ${t.name}` : "Editor", robots: { index: false } };
}

/** What the demo banner offers while the editor is locked. */
function offerFor(template) {
  return {
    note: `Every template includes the editor. Buy ${template.name} to save your changes and download your site.`,
    label: `Buy ${template.name} — ${money(TIERS[template.tier].priceCents)}`,
    href: `/t/${template.slug}`,
  };
}

export default async function EditorPage({ params }) {
  const { slug } = await params;
  const template = bySlug(slug);
  if (!template) notFound();

  if (!template.livePreview) {
    return (
      <main className="shell flex min-h-[100dvh] flex-col items-center justify-center text-center">
        <h1 className="h-section">{template.name} is edited in code.</h1>
        <p className="lede mt-4 max-w-md">
          It&rsquo;s a Next.js project, so it&rsquo;s customised in a code editor rather than in the
          browser. Its README walks you through every change.
        </p>
        <Link href={`/t/${slug}`} className="btn btn-primary mt-8">Back to {template.name}</Link>
      </main>
    );
  }

  const user = await currentUser();
  const library = await libraryFor(user?.id);
  const access = editorAccess(template, library);
  const project = access.ok ? await loadProject(user.id, slug) : null;

  return (
    <EditorApp
      template={{
        slug,
        name: template.name,
        themeFile: themeFileOf(template),
        pages: template.pageList.map(({ file, name }) => ({ file, name })),
      }}
      full={access.ok}
      signedIn={Boolean(user)}
      project={project}
      offer={access.ok ? null : offerFor(template)}
    />
  );
}
