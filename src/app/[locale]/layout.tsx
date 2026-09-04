import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import "@/styles/globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import CookieConsentMount from "@/components/booking/CookieConsentMount";
import { WhatsAppFAB } from "@/components/booking/WhatsAppFAB";
import { SocialProofPopup } from "@/components/booking/SocialProofPopup";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { CurrencyProvider } from "@/lib/currency";
import { JsonLd } from "@/components/layout/JsonLd";
import { Analytics } from "@/components/analytics/Analytics";
import { RegisterSW } from "@/components/sw/RegisterSW";
import { ORGANIZATION_SCHEMA, SITE_URL } from "@/lib/schema";
import { generateHreflang, canonicalFor } from "@/lib/hreflang";
import { LOCALE_DIR, isLocale, type Locale } from "@/lib/i18n/dictionaries";
import { routing } from "@/i18n/routing";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const DEFAULT_OG_IMAGE = `/api/og?title=${encodeURIComponent(
  "Trip and Tick"
)}&subtitle=${encodeURIComponent(
  "Kapadokya Balon Turu — Aracısız Operatör Fiyatları"
)}`;

export const viewport: Viewport = {
  themeColor: "#FF6B35",
  width: "device-width",
  initialScale: 1,
};

// OpenGraph locale tags (Facebook-style underscore format) per app locale.
const OG_LOCALE: Record<Locale, string> = {
  tr: "tr_TR",
  en: "en_US",
  de: "de_DE",
  fr: "fr_FR",
  es: "es_ES",
  nl: "nl_NL",
  zh: "zh_CN",
  hi: "hi_IN",
  ur: "ur_PK",
  pt: "pt_PT",
  "pt-BR": "pt_BR",
  ja: "ja_JP",
  ko: "ko_KR",
  it: "it_IT",
  ru: "ru_RU",
  uk: "uk_UA",
  az: "az_AZ",
};

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const typedLocale = isLocale(params.locale) ? params.locale : routing.defaultLocale;
  return {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Trip and Tick — Kapadokya Balon Turu & Seyahat Acentası",
    template: "%s | Trip and Tick",
  },
  description:
    "Kapadokya balon turu, otel rezervasyonu, ATV turu, at binme ve gezi turları. En düşük fiyat garantisi, %100 iade güvencesi. Şimdi rezervasyon yap!",
  keywords: [
    "kapadokya balon turu",
    "cappadocia balloon tour",
    "kapadokya balon fiyat",
    "kapadokya otel",
    "kapadokya atv turu",
    "trip and tick",
  ],
  alternates: {
    canonical: canonicalFor("/", typedLocale),
    languages: generateHreflang("/"),
  },
  openGraph: {
    type: "website",
    locale: OG_LOCALE[typedLocale],
    url: canonicalFor("/", typedLocale),
    siteName: "Trip and Tick",
    title: "Trip and Tick — Kapadokya'nın En İyi Deneyimleri",
    description: "En düşük fiyat garantisi ile balon turu, otel, transfer ve aktiviteler.",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Trip and Tick — Kapadokya Balon Turu",
      },
    ],
  },
  // Twitter title/description intentionally omitted here so per-page
  // generateMetadata controls them; card + default image stay as fallback.
  twitter: {
    card: "summary_large_image",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: { index: true, follow: true },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || "4e0712c04a695041",
    other: {
      "msvalidate.01":
        process.env.NEXT_PUBLIC_BING_VERIFICATION ||
        "71595D2C81CF0978FCE567579E41EB8F",
      ...(process.env.NEXT_PUBLIC_BAIDU_VERIFICATION
        ? { "baidu-site-verification": process.env.NEXT_PUBLIC_BAIDU_VERIFICATION }
        : {}),
    },
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "TripAndTick",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" }],
  },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const typedLocale = locale as Locale;
  return (
    <html lang={typedLocale} dir={LOCALE_DIR[typedLocale]} className={inter.variable}>
      <head>
        {/* Aanloop site-acties beacon: counts tel/mailto/WhatsApp/Maps clicks + form
            submits, POSTs to https://aanloopai.nl/api/visibility/event. No cookies. */}
        <script src="https://aanloopai.nl/v.js" defer></script>
      </head>
      <body className="font-sans antialiased">
        <JsonLd data={ORGANIZATION_SCHEMA} />
        <NextIntlClientProvider messages={messages} locale={typedLocale}>
          <I18nProvider initialLocale={typedLocale}>
            <CurrencyProvider>
              <Header />
              <main className="min-h-screen">{children}</main>
              <Footer />
              <WhatsAppFAB />
              <SocialProofPopup />
              <CookieConsentMount />
            </CurrencyProvider>
          </I18nProvider>
        </NextIntlClientProvider>
        <Analytics />
        <RegisterSW />
      </body>
    </html>
  );
}
