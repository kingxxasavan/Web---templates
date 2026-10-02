"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Icon, Logo } from "./icons";
import ThemeToggle from "./ThemeToggle";
import {
  FONT_CHOICES,
  fontLinkHref,
  fontsFromOverrides,
  overrideCss,
  parseThemeVars,
} from "@/lib/editor-core";

/*
 * How editing stays exact:
 *
 * Each page's original HTML is parsed into a "source" document and every
 * element in <body> gets a data-fid id. The page is rendered from that
 * source with its scripts running, so it looks and behaves exactly like the
 * real site. Only elements that came from the source (they carry a data-fid)
 * are made editable, and each edit is copied back into the source element
 * with the same id. Saving and downloading serialise the source — never the
 * live page — so content a script generates (products, menus, timetables)
 * is never baked into the files twice.
 */

const DEVICES = {
  desktop: { width: "100%", label: "Desktop", icon: "M3 5h18v11H3z M9 20h6" },
  tablet: { width: "820px", label: "Tablet", icon: "M6 3h12v18H6z" },
  phone: { width: "400px", label: "Phone", icon: "M8 2h8v20H8z" },
};

const EDIT_CSS = `
[data-fe] { cursor: text; outline: 1px dashed transparent; outline-offset: 3px; transition: outline-color .15s; }
[data-fe]:hover { outline-color: rgba(99, 102, 241, .6); }
[data-fe]:focus { outline: 2px solid #6366f1; outline-offset: 3px; }
[data-reveal] { opacity: 1 !important; transform: none !important; }
`;

// Elements that make a candidate "structural" rather than a run of text.
const STRUCTURE =
  "img,picture,video,audio,input,select,textarea,iframe,canvas,form,div,p,ul,ol,li,table,section,article,nav,header,footer,main,aside,h1,h2,h3,h4,h5,h6,blockquote,figure";
const NEVER = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "OPTION", "SELECT", "TEXTAREA", "BODY", "HTML"]);

function hasOwnText(el) {
  return [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
}

/** Marks every source text run in a rendered page as editable. */
function enableEditing(doc) {
  for (const el of doc.body.querySelectorAll("[data-fid]")) {
    if (NEVER.has(el.tagName) || el.closest("svg") || el.closest("[data-fe]")) continue;
    if (!hasOwnText(el)) continue;
    if (el.querySelector(STRUCTURE)) continue;
    // Anything inside that a script added would be copied into the source.
    if ([...el.querySelectorAll("*")].some((c) => !c.hasAttribute("data-fid") && !c.closest("svg"))) continue;
    el.setAttribute("data-fe", "");
    el.setAttribute("contenteditable", "true");
    el.setAttribute("spellcheck", "true");
  }
}

/** A clean copy of a source page for saving: no editor ids. */
function serialize(doc) {
  const clone = doc.cloneNode(true);
  clone.querySelectorAll("[data-fid]").forEach((el) => el.removeAttribute("data-fid"));
  return `<!DOCTYPE html>\n${clone.documentElement.outerHTML}\n`;
}

const expandHex = (v) =>
  /^#[0-9a-f]{3}$/i.test(v) ? `#${[...v.slice(1)].map((c) => c + c).join("")}` : v;

export default function EditorApp({ template, full, signedIn, project, offer }) {
  const { slug, pages, themeFile } = template;
  const frameRef = useRef(null);
  const docs = useRef(new Map());
  const nextFid = useRef(0);
  const savedPages = useRef(project?.pages ?? {});
  const edited = useRef(new Set(Object.keys(project?.pages ?? {})));

  const [page, setPage] = useState(pages[0].file);
  const [mode, setMode] = useState("edit");
  const [device, setDevice] = useState("desktop");
  const [srcdoc, setSrcdoc] = useState("");
  const [loading, setLoading] = useState(true);
  const [css, setCss] = useState("");
  const [overrides, setOverrides] = useState(project?.overrides ?? {});
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState(project?.updatedAt ? "Saved" : "");
  const [error, setError] = useState(null);
  const [panel, setPanel] = useState("style");
  const [seo, setSeo] = useState({ title: "", description: "" });

  const overridesRef = useRef(overrides);
  overridesRef.current = overrides;
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const vars = useMemo(() => parseThemeVars(css), [css]);

  const markEdited = useCallback((file) => {
    edited.current.add(file);
    setDirty(true);
    setStatus("Unsaved changes");
  }, []);

  /* ------------------------------------------------------- source pages */

  const loadDoc = useCallback(
    async (file) => {
      if (docs.current.has(file)) return docs.current.get(file);
      let html = savedPages.current[file];
      if (!html) {
        const res = await fetch(`/preview/${slug}/${file}`);
        if (!res.ok) throw new Error(`Couldn't load ${file}`);
        html = await res.text();
      }
      const doc = new DOMParser().parseFromString(html, "text/html");
      doc.body.querySelectorAll("*").forEach((el) => el.setAttribute("data-fid", String(++nextFid.current)));
      docs.current.set(file, doc);
      return doc;
    },
    [slug]
  );

  const render = useCallback(
    (doc) => {
      const clone = doc.cloneNode(true);
      const head = clone.head;
      const base = clone.createElement("base");
      base.href = `${window.location.origin}/preview/${slug}/`;
      head.prepend(base);

      const href = fontLinkHref(fontsFromOverrides(overridesRef.current));
      if (href) {
        const link = clone.createElement("link");
        link.id = "__fe_fonts";
        link.rel = "stylesheet";
        link.href = href;
        head.append(link);
      }
      const themeStyle = clone.createElement("style");
      themeStyle.id = "__fe_vars";
      themeStyle.textContent = overrideCss(overridesRef.current);
      head.append(themeStyle);
      if (modeRef.current === "edit") {
        const style = clone.createElement("style");
        style.textContent = EDIT_CSS;
        head.append(style);
      }
      return `<!DOCTYPE html>${clone.documentElement.outerHTML}`;
    },
    [slug]
  );

  // Render the current page whenever it or the mode changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadDoc(page)
      .then((doc) => {
        if (cancelled) return;
        setSeo({
          title: doc.title,
          description: doc.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
        });
        setSrcdoc(render(doc));
      })
      .catch((err) => setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [page, mode, loadDoc, render]);

  // The stylesheet the theme controls are built from.
  useEffect(() => {
    fetch(`/preview/${slug}/${themeFile}`)
      .then((r) => (r.ok ? r.text() : ""))
      .then(setCss)
      .catch(() => setCss(""));
  }, [slug, themeFile]);

  // Theme changes apply to the live page without reloading it.
  useEffect(() => {
    const doc = frameRef.current?.contentDocument;
    if (!doc?.head) return;
    const themeStyle = doc.getElementById("__fe_vars");
    if (themeStyle) themeStyle.textContent = overrideCss(overrides);
    const href = fontLinkHref(fontsFromOverrides(overrides));
    let link = doc.getElementById("__fe_fonts");
    if (href) {
      if (!link) {
        link = doc.createElement("link");
        link.id = "__fe_fonts";
        link.rel = "stylesheet";
        doc.head.append(link);
      }
      if (link.getAttribute("href") !== href) link.setAttribute("href", href);
    } else {
      link?.remove();
    }
  }, [overrides]);

  /* ------------------------------------------------------ live page hooks */

  const onFrameLoad = useCallback(() => {
    const win = frameRef.current?.contentWindow;
    const doc = win?.document;
    // The frame's first, empty load happens before any page is rendered.
    if (!doc?.body?.querySelector("[data-fid]")) return;
    setLoading(false);
    const source = docs.current.get(page);

    if (modeRef.current === "edit") {
      enableEditing(doc);

      // Clicks select text; they never follow links or run the template's
      // buttons, so nothing navigates away mid-edit.
      win.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); }, true);
      win.addEventListener("submit", (e) => e.preventDefault(), true);
      win.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey && e.target.closest?.("[data-fe]")) e.preventDefault();
      }, true);
      win.addEventListener("paste", (e) => {
        if (!e.target.closest?.("[data-fe]")) return;
        e.preventDefault();
        doc.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
      }, true);
      win.addEventListener("input", (e) => {
        const live = e.target.closest?.("[data-fe]");
        const target = live && source?.querySelector(`[data-fid="${live.getAttribute("data-fid")}"]`);
        if (!target) return;
        const copy = live.cloneNode(true);
        copy.querySelectorAll("[contenteditable],[spellcheck],[data-fe]").forEach((n) => {
          n.removeAttribute("contenteditable");
          n.removeAttribute("spellcheck");
          n.removeAttribute("data-fe");
        });
        target.innerHTML = copy.innerHTML;
        markEdited(page);
      });
    } else {
      // Preview: links between the template's own pages open the edited
      // version of that page instead of the original.
      win.addEventListener("click", (e) => {
        const a = e.target.closest?.("a[href]");
        if (!a) return;
        const raw = a.getAttribute("href");
        if (raw.startsWith("#")) return;
        const url = new URL(raw, a.baseURI);
        const prefix = `/preview/${slug}/`;
        e.preventDefault();
        if (url.origin === window.location.origin && url.pathname.startsWith(prefix)) {
          const file = url.pathname.slice(prefix.length) || "index.html";
          if (pages.some((p) => p.file === file)) setPage(file);
        } else {
          window.open(url.href, "_blank", "noopener");
        }
      }, true);
    }
    win.addEventListener("keydown", saveShortcut);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pages, slug, markEdited]);

  /* ------------------------------------------------------------- saving */

  const save = useCallback(async () => {
    if (!full) return false;
    setError(null);
    setStatus("Saving…");
    const payload = { pages: { ...savedPages.current }, overrides: overridesRef.current };
    for (const file of edited.current) {
      const doc = docs.current.get(file);
      if (doc) payload.pages[file] = serialize(doc);
    }
    const res = await fetch(`/api/editor/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    if (!res?.ok) {
      setStatus("Unsaved changes");
      setError(data?.error || "Your changes couldn't be saved. Check your connection and try again.");
      return false;
    }
    savedPages.current = payload.pages;
    setDirty(false);
    setStatus("All changes saved");
    return true;
  }, [full, slug]);

  const saveRef = useRef(save);
  saveRef.current = save;
  function saveShortcut(e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      saveRef.current();
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", saveShortcut);
    return () => window.removeEventListener("keydown", saveShortcut);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!full || !dirty) return;
    const warn = (e) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [full, dirty]);

  async function download() {
    if (dirty && !(await save())) return;
    window.location.assign(`/api/editor/${slug}/download`);
  }

  async function startOver() {
    if (!window.confirm("Discard every change and go back to the original template?")) return;
    if (full) await fetch(`/api/editor/${slug}`, { method: "DELETE" }).catch(() => null);
    window.location.reload();
  }

  /* --------------------------------------------------------- panel logic */

  function setVar(name, value, original) {
    setOverrides((prev) => {
      const next = { ...prev };
      if (!value || value === original) delete next[name];
      else next[name] = value;
      return next;
    });
    setDirty(true);
    setStatus("Unsaved changes");
  }

  function updateSeo(field, value) {
    const doc = docs.current.get(page);
    if (!doc) return;
    setSeo((s) => ({ ...s, [field]: value }));
    if (field === "title") {
      doc.title = value;
    } else {
      let meta = doc.querySelector('meta[name="description"]');
      if (!meta) {
        meta = doc.createElement("meta");
        meta.setAttribute("name", "description");
        doc.head.append(meta);
      }
      meta.setAttribute("content", value);
    }
    markEdited(page);
  }

  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [replaced, setReplaced] = useState(null);

  async function replaceEverywhere() {
    if (!find) return;
    let count = 0;
    let pagesTouched = 0;
    for (const p of pages) {
      const doc = await loadDoc(p.file);
      let here = 0;
      const walker = doc.createTreeWalker(doc.documentElement, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (n.parentElement?.closest("script,style")) continue;
        const parts = n.textContent.split(find);
        if (parts.length > 1) {
          here += parts.length - 1;
          n.textContent = parts.join(replace);
        }
      }
      for (const el of doc.querySelectorAll('[alt],[placeholder],[aria-label],meta[name="description"]')) {
        for (const attr of ["alt", "placeholder", "aria-label", "content"]) {
          const v = el.getAttribute(attr);
          if (v?.includes(find)) {
            here += v.split(find).length - 1;
            el.setAttribute(attr, v.split(find).join(replace));
          }
        }
      }
      if (here) {
        count += here;
        pagesTouched++;
        markEdited(p.file);
      }
    }
    setReplaced({ count, pagesTouched });
    const doc = docs.current.get(page);
    if (doc && count) setSrcdoc(render(doc));
  }

  /* --------------------------------------------------------------- view */

  const colors = vars.filter((v) => v.kind === "color");
  const fonts = vars.filter((v) => v.kind === "font");
  const radii = vars.filter((v) => v.kind === "radius");
  const tabs = [
    ["style", "Style"],
    ["pages", "Pages"],
    ["replace", "Replace"],
    ["help", "Help"],
  ];

  return (
    <div className="flex h-[100dvh] flex-col bg-paper text-ink">
      {/* top bar */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-card px-3 sm:px-4">
        <Link href={full ? "/account" : `/t/${slug}`} className="flex items-center gap-2" aria-label="Leave the editor">
          <Icon name="back" size={18} className="text-muted" />
          <span className="hidden sm:block"><Logo /></span>
        </Link>
        <span className="ml-1 hidden truncate text-[14px] text-muted md:block">
          Customising <span className="font-semibold text-ink">{template.name}</span>
        </span>

        <div className="mx-auto flex items-center gap-1 rounded-full border border-line bg-sunk p-1" role="group" aria-label="Mode">
          {[["edit", "Edit"], ["preview", "Preview"]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              aria-pressed={mode === key}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${mode === key ? "bg-card text-ink shadow-sm" : "text-muted hover:text-ink"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-0.5 md:flex" role="group" aria-label="Screen size">
          {Object.entries(DEVICES).map(([key, d]) => (
            <button
              key={key}
              onClick={() => setDevice(key)}
              aria-label={d.label}
              aria-pressed={device === key}
              className={`rounded-lg p-2 ${device === key ? "bg-sunk text-ink" : "text-faint hover:text-ink"}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d={d.icon} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
          ))}
        </div>

        <ThemeToggle className="hidden sm:flex" />
        <span className="hidden text-[12.5px] text-faint lg:block" aria-live="polite">{full ? status : ""}</span>
        {full ? (
          <>
            <button onClick={save} disabled={!dirty} className="btn btn-sm btn-secondary">
              <Icon name="save" size={15} /> <span className="hidden sm:inline">Save</span>
            </button>
            <button onClick={download} className="btn btn-sm btn-primary">
              <Icon name="download" size={15} /> <span className="hidden sm:inline">Download site</span>
            </button>
          </>
        ) : (
          <Link href={offer.href} className="btn btn-sm btn-primary">Unlock</Link>
        )}
      </header>

      {!full && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-accent/20 bg-accent-soft px-4 py-2.5 text-[13.5px] text-accent-deep">
          <p>
            <strong className="font-semibold">You&rsquo;re trying the editor.</strong>{" "}
            Edit anything you like. Saving and downloading unlock when you own it. {offer.note}
          </p>
          <Link href={offer.href} className="btn btn-sm btn-accent">{offer.label}</Link>
        </div>
      )}
      {error && (
        <p role="alert" className="alert-error m-3 mb-0 rounded-xl">{error}</p>
      )}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* side panel */}
        <aside className="max-h-[42vh] shrink-0 overflow-y-auto border-b border-line bg-card lg:max-h-none lg:w-80 lg:border-b-0 lg:border-r">
          <div className="sticky top-0 z-10 flex gap-1 border-b border-line bg-card p-2" role="tablist">
            {tabs.map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={panel === key}
                onClick={() => setPanel(key)}
                className={`flex-1 rounded-lg px-2 py-1.5 text-[13px] font-medium ${panel === key ? "bg-sunk text-ink" : "text-muted hover:text-ink"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {panel === "style" && (
              <div className="flex flex-col gap-6">
                <section>
                  <h2 className="text-[13px] font-semibold">Colours</h2>
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    {colors.map((v) => {
                      const value = overrides[v.name] ?? v.value;
                      return (
                        <label key={v.name} className="flex items-center justify-between gap-3 text-[13px]">
                          <span className="text-muted">{v.label}</span>
                          <span className="flex items-center gap-2">
                            <code className="text-[11.5px] text-faint">{expandHex(value)}</code>
                            <input
                              type="color"
                              value={expandHex(value)}
                              onChange={(e) => setVar(v.name, e.target.value, v.value)}
                              className="h-8 w-10 cursor-pointer rounded-md border border-line bg-card"
                            />
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>

                <section>
                  <h2 className="text-[13px] font-semibold">Fonts</h2>
                  <div className="mt-3 flex flex-col gap-3">
                    {fonts.map((v) => (
                      <label key={v.name} className="flex flex-col gap-1.5 text-[13px]">
                        <span className="text-muted">{v.label}</span>
                        <select
                          value={overrides[v.name] ?? ""}
                          onChange={(e) => setVar(v.name, e.target.value, v.value)}
                          className="input h-10"
                        >
                          <option value="">Template default ({v.value.split(",")[0].replace(/"/g, "")})</option>
                          {FONT_CHOICES.map((f) => (
                            <option key={f.id} value={f.stack}>{f.label}</option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                </section>

                {radii.length > 0 && (
                  <section>
                    <h2 className="text-[13px] font-semibold">Corners</h2>
                    <div className="mt-3 flex flex-col gap-3">
                      {radii.map((v) => {
                        const px = parseFloat(overrides[v.name] ?? v.value);
                        return (
                          <label key={v.name} className="flex flex-col gap-1.5 text-[13px]">
                            <span className="flex justify-between text-muted">{v.label} <span>{px}px</span></span>
                            <input
                              type="range"
                              min="0"
                              max="32"
                              value={px}
                              onChange={(e) => setVar(v.name, `${e.target.value}px`, v.value)}
                              className="accent-[var(--color-accent)]"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </section>
                )}

                {Object.keys(overrides).length > 0 && (
                  <button onClick={() => { setOverrides({}); setDirty(true); setStatus("Unsaved changes"); }} className="btn btn-sm btn-secondary self-start">
                    <Icon name="undo" size={14} /> Reset style
                  </button>
                )}
              </div>
            )}

            {panel === "pages" && (
              <div className="flex flex-col gap-5">
                <p className="text-[13px] leading-relaxed text-muted">
                  How <strong className="text-ink">{pages.find((p) => p.file === page)?.name}</strong> appears
                  in search results and browser tabs.
                </p>
                <label className="flex flex-col gap-1.5 text-[13px]">
                  <span className="font-medium">Page title</span>
                  <input value={seo.title} onChange={(e) => updateSeo("title", e.target.value)} className="input" maxLength={120} />
                </label>
                <label className="flex flex-col gap-1.5 text-[13px]">
                  <span className="font-medium">Description</span>
                  <textarea rows={4} value={seo.description} onChange={(e) => updateSeo("description", e.target.value)} className="input resize-y" maxLength={300} />
                  <span className="text-[12px] text-faint">{seo.description.length}/160 recommended</span>
                </label>
              </div>
            )}

            {panel === "replace" && (
              <div className="flex flex-col gap-4">
                <p className="text-[13px] leading-relaxed text-muted">
                  Swap the template&rsquo;s placeholder business name, email or phone number for yours
                  on every page at once.
                </p>
                <label className="flex flex-col gap-1.5 text-[13px]">
                  <span className="font-medium">Find</span>
                  <input value={find} onChange={(e) => { setFind(e.target.value); setReplaced(null); }} className="input" placeholder="e.g. Aurora" />
                </label>
                <label className="flex flex-col gap-1.5 text-[13px]">
                  <span className="font-medium">Replace with</span>
                  <input value={replace} onChange={(e) => { setReplace(e.target.value); setReplaced(null); }} className="input" placeholder="e.g. Maple & Co" />
                </label>
                <button onClick={replaceEverywhere} disabled={!find} className="btn btn-sm btn-primary self-start">
                  Replace on every page
                </button>
                {replaced && (
                  <p role="status" className="text-[13px] text-muted">
                    {replaced.count
                      ? `Replaced ${replaced.count} match${replaced.count === 1 ? "" : "es"} on ${replaced.pagesTouched} page${replaced.pagesTouched === 1 ? "" : "s"}.`
                      : "No matches found."}
                  </p>
                )}
              </div>
            )}

            {panel === "help" && (
              <ul className="flex flex-col gap-3 text-[13px] leading-relaxed text-muted">
                <li><strong className="text-ink">Edit text:</strong> click any outlined text on the page and type. Shift+Enter adds a line break.</li>
                <li><strong className="text-ink">Try it out:</strong> switch to Preview to click through the pages with menus, forms and carts working.</li>
                <li><strong className="text-ink">Products, menus and timetables</strong> are listed in <code>assets/app.js</code> in your download. The README shows how to change them.</li>
                <li><strong className="text-ink">Photos:</strong> add your own to the <code>assets</code> folder after downloading.</li>
                <li><strong className="text-ink">Save:</strong> Ctrl+S or ⌘S. Your changes are kept in your account.</li>
                <li>
                  Stuck, or want us to do it?{" "}
                  <Link href="/made-for-you" className="font-medium text-accent hover:underline">Made for you</Link>{" "}
                  sets it up for you in 3 days.
                </li>
                <li>
                  <button onClick={startOver} className="font-medium text-danger hover:underline">Start over from the original</button>
                </li>
              </ul>
            )}
          </div>
        </aside>

        {/* canvas */}
        <main className="flex min-h-0 flex-1 flex-col bg-sunk">
          <nav aria-label="Template pages" className="flex shrink-0 gap-1 overflow-x-auto border-b border-line bg-card px-3 py-2">
            {pages.map((p) => (
              <button
                key={p.file}
                onClick={() => setPage(p.file)}
                aria-current={page === p.file ? "page" : undefined}
                className={`shrink-0 rounded-md px-3 py-1.5 text-[12.5px] ${page === p.file ? "bg-ink text-on-ink" : "text-muted hover:bg-sunk hover:text-ink"}`}
              >
                {p.name}
              </button>
            ))}
          </nav>
          <div className="relative min-h-0 flex-1 overflow-auto p-2 sm:p-4">
            <div className="mx-auto h-full min-h-[480px] transition-[width] duration-300" style={{ width: DEVICES[device].width, maxWidth: "100%" }}>
              {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center text-[13px] text-faint">Loading page…</div>
              )}
              <iframe
                ref={frameRef}
                title={`${template.name}: ${pages.find((p) => p.file === page)?.name}`}
                srcDoc={srcdoc}
                onLoad={onFrameLoad}
                sandbox="allow-same-origin allow-scripts allow-forms"
                className="h-full w-full rounded-xl border border-line bg-white shadow-[var(--shadow-card)]"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
