// /transferler/[slug] — transfer detay (landing) sayfasi. index:true.
// nav sozlugunde "transfers" anahtari yok -> etiket inline locale map ile.
import { TRANSFERS } from "@/data/services/catalog";
import type { Locale } from "@/lib/i18n/dictionaries";
import { makeServiceDetailPage } from "@/lib/service-detail-page";

// Blog pattern: tam statik SSG (Worker'a girmez) — uzun aciklama JSON build-time fs.
export const dynamic = "force-static";
export const dynamicParams = false;

const TRANSFER_LABEL: Record<Locale, string> = {
  tr: "Transferler",
  en: "Transfers",
  de: "Transfers",
  fr: "Transferts",
  es: "Traslados",
  nl: "Transfers",
  zh: "接送服务",
  hi: "ट्रांसफर",
  ur: "ٹرانسفر",
  pt: "Transfers",
  "pt-BR": "Transfers",
  ja: "送迎",
  ko: "트랜스퍼",
  it: "Transfer",
  ru: "Трансферы",
  uk: "Трансфери",
  az: "Transfer",
};

const handlers = makeServiceDetailPage({
  items: TRANSFERS,
  categoryPath: "/transferler",
  navLabel: (loc) => TRANSFER_LABEL[loc] ?? "Transfers",
});

export const generateStaticParams = handlers.generateStaticParams;
export const generateMetadata = handlers.generateMetadata;
export default handlers.Page;
