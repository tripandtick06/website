"use client";

// Trip and Tick — Analytics ve error-tracking script injector.
// Production-safe: env-degiskeni yoksa hicbir HTTP request yapilmaz.
// Mount-noktasi: src/app/layout.tsx <body> sonu.

import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const HOTJAR_ID = process.env.NEXT_PUBLIC_HOTJAR_ID;
const HOTJAR_SV = process.env.NEXT_PUBLIC_HOTJAR_SV || "6";
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

export function Analytics() {
  return (
    <>
      {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
      {HOTJAR_ID ? <Hotjar hjid={HOTJAR_ID} hjsv={HOTJAR_SV} /> : null}
      {SENTRY_DSN ? <SentryStub dsn={SENTRY_DSN} /> : null}
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
