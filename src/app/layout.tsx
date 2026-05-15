import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import CookieConsentMount from "@/components/booking/CookieConsentMount";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter" });

export const metadata: Metadata = {
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
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://tripandtick.com",
    siteName: "Trip and Tick",
    title: "Trip and Tick — Kapadokya'nın En İyi Deneyimleri",
    description: "En düşük fiyat garantisi ile balon turu, otel, transfer ve aktiviteler.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trip and Tick — Kapadokya Balon Turu",
    description: "En düşük fiyat garantisi ile balon turu, otel, transfer ve aktiviteler.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="font-sans antialiased">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <CookieConsentMount />
      </body>
    </html>
  );
}
