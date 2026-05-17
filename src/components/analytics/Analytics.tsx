"use client";

// Trip and Tick — Analytics ve error-tracking script injector.
// Production-safe: env-degiskeni yoksa hicbir HTTP request yapilmaz.
// Mount-noktasi: src/app/[locale]/layout.tsx <body> sonu.
//
// GDPR/KVKK: GA4 + Hotjar SADECE cookie-consent "accepted" sonra yuklenir.
// Sentry "necessary" kategoride — consent-disi calisir (security/error tracking).
// CookieConsent component "tripandtick:consent" key'ine accepted/rejected yazar
// + window 'tripandtick:consent-change' event tetikler.

import { useEffect, useState } from "react";
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const HOTJAR_ID = process.env.NEXT_PUBLIC_HOTJAR_ID;
const HOTJAR_SV = process.env.NEXT_PUBLIC_HOTJAR_SV || "6";
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const CONSENT_KEY = "tripandtick:consent";

function readConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

export function Analytics() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    setConsented(readConsent());
    function onStorage(e: StorageEvent) {
      if (e.key === CONSENT_KEY) setConsented(readConsent());
    }
    function onCustom() {
      setConsented(readConsent());
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("tripandtick:consent-change", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("tripandtick:consent-change", onCustom);
    };
  }, []);

  return (
    <>
      {SENTRY_DSN ? <SentryStub dsn={SENTRY_DSN} /> : null}
      {consented && GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
      {consented && HOTJAR_ID ? <Hotjar hjid={HOTJAR_ID} hjsv={HOTJAR_SV} /> : null}
    </>
  );
}

function GoogleAnalytics({ gaId }: { gaId: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
            anonymize_ip: true,
          });
        `}
      </Script>
    </>
  );
}

function Hotjar({ hjid, hjsv }: { hjid: string; hjsv: string }) {
  return (
    <Script id="hotjar-init" strategy="afterInteractive">
      {`
        (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:${hjid},hjsv:${hjsv}};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `}
    </Script>
  );
}

// Sentry stub — gercek @sentry/nextjs paketi yuklenmemis. Sadece DSN environment
// degiskenini global window'a tasir, ileride sentry/nextjs eklenince init bu
// stub yerine sentry.client.config.ts dosyasindan calisir.
function SentryStub({ dsn }: { dsn: string }) {
  return (
    <Script id="sentry-stub" strategy="afterInteractive">
      {`
        window.__SENTRY_DSN__ = '${dsn}';
        // Sentry init placeholder — replace with @sentry/nextjs when added.
      `}
    </Script>
  );
}

export default Analytics;
