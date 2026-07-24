"use client";

/**
 * GA4 funnel events, no-op when GA isn't mounted. The <GoogleAnalytics> tag in
 * the root layout renders only when NEXT_PUBLIC_GA_ID is set, so call sites
 * never need to check config — an unmounted GA just drops the event (the
 * try/catch swallows @next/third-parties' "not initialized" path).
 *
 * Funnel: search → checkout_opened → payment_started → booking_confirmed,
 * each tagged { kind: "flight" | "hotel" }.
 */

import { sendGAEvent } from "@next/third-parties/google";

export function trackEvent(
  name: string,
  params: Record<string, string | number> = {},
): void {
  try {
    sendGAEvent("event", name, params);
  } catch {
    /* GA absent — nothing to record */
  }
}
