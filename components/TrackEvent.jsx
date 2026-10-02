"use client";

import { useEffect } from "react";
import { track } from "@/lib/firebase-client";

/**
 * Records one analytics event when it mounts, so server pages can mark a
 * funnel step without becoming client components. Pass `once` to send it at
 * most once per browser session (a purchase shouldn't count twice because
 * someone refreshed the page).
 */
export default function TrackEvent({ name, params = {}, once }) {
  const key = JSON.stringify(params);
  useEffect(() => {
    if (once) {
      try {
        const k = `tracked:${once}`;
        if (sessionStorage.getItem(k)) return;
        sessionStorage.setItem(k, "1");
      } catch {
        /* storage blocked: send it anyway */
      }
    }
    track(name, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, key, once]);
  return null;
}
