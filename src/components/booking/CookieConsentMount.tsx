"use client";

import dynamic from "next/dynamic";

// Client-only, no SSR: cookie banner reads localStorage and must mount after hydration.
const CookieConsent = dynamic(() => import("./CookieConsent"), {
  ssr: false,
  loading: () => null,
});

export default function CookieConsentMount() {
  return <CookieConsent />;
}
