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
  }, [pathname, params]);

  return null;
}
