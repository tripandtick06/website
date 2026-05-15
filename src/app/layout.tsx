import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import CookieConsentMount from "@/components/booking/CookieConsentMount";
import { WhatsAppFAB } from "@/components/booking/WhatsAppFAB";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { CurrencyProvider } from "@/lib/currency";
import { JsonLd } from "@/components/layout/JsonLd";
import { Analytics } from "@/components/analytics/Analytics";
import { RegisterSW } from "@/components/sw/RegisterSW";
import { ORGANIZATION_SCHEMA, SITE_URL } from "@/lib/schema";
import { generateHreflang } from "@/lib/hreflang";

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

export const metadata: Metadata = {
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
    canonical: SITE_URL,
    languages: generateHreflang("/"),
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: SITE_URL,
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
  twitter: {
    card: "summary_large_image",
    title: "Trip and Tick — Kapadokya Balon Turu",
    description: "En düşük fiyat garantisi ile balon turu, otel, transfer ve aktiviteler.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: { index: true, follow: true },
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="font-sans antialiased">
        <JsonLd data={ORGANIZATION_SCHEMA} />
        <I18nProvider>
          <CurrencyProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <WhatsAppFAB />
            <CookieConsentMount />
          </CurrencyProvider>
        </I18nProvider>
        <Analytics />
        <RegisterSW />
      </body>
    </html>
  );
}
