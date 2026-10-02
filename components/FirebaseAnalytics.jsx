"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { track, firebaseConfigured } from "@/lib/firebase-client";

/**
 * Sends a page_view on every client navigation. The App Router doesn't do a
 * full page load between routes, so Firebase's automatic collection only ever
 * sees the first one.
 */
export default function FirebaseAnalytics() {
  const pathname = usePathname();
  const params = useSearchParams();

  useEffect(() => {
    if (!firebaseConfigured) return;
    const query = params.toString();
    track("page_view", {
      page_path: query ? `${pathname}?${query}` : pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
    // Once per visit: where they came in, and which template brought them,
    // so marketing can see which templates pull people into the store.
    try {
      if (!sessionStorage.getItem("tracked:landing")) {
        sessionStorage.setItem("tracked:landing", "1");
        const entry = /^\/(?:t|preview|editor)\/([^/]+)/.exec(pathname);
        track("landing", {
          landing_path: pathname,
          entry_template: entry ? entry[1] : "(none)",
          referrer: document.referrer || "(direct)",
          campaign: params.get("utm_campaign") || "(none)",
          source: params.get("utm_source") || "(none)",
        });
      }
    } catch {
      /* storage blocked: skip the landing event */
    }
  }, [pathname, params]);

  return null;
}
