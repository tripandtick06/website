import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { ServiceCard } from "@/components/layout/ServiceCard";
import { JsonLd } from "@/components/layout/JsonLd";
import { HOTELS } from "@/data/services/catalog";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Kapadokya Otel Rezervasyonu — Mağara Otel & Butik | Trip and Tick",
  description:
    "Kapadokya mağara otelleri, butik konaklamalar ve aile otelleri. Göreme & Ürgüp merkezli seçenekler — en uygun fiyat, anında onay.",
  alternates: {
    canonical: `${SITE_URL}/oteller`,
    languages: generateHreflang("/oteller"),
  },
  openGraph: {
    title: "Kapadokya Otel Rezervasyonu",
    description: "Mağara otelleri, butik & aile otelleri — Göreme & Ürgüp.",
    url: `${SITE_URL}/oteller`,
    type: "website",
    images: [
      {
        url: ogImageUrl(
          "Kapadokya Otel Rezervasyonu",
          "Mağara Oteller · Butik Konaklamalar · En Uygun Fiyat"
        ),
        width: 1200,
        height: 630,
        alt: "Kapadokya Otelleri — Trip and Tick",
      },
    ],
  },
};

export default function OtellerPage() {
  return (
    <>
      <PageHero
        tag="Oteller"
        title="Kapadokya"
        highlight="Mağara Otelleri"
        description="UNESCO mirası bölgede otantik mağara odalı butik oteller. Kahvaltı, Wi-Fi, klima dahil. Göreme, Ürgüp ve Nevşehir merkezleri."
      />

      <Breadcrumb items={[{ name: "Oteller", href: "/oteller" }]} />

      <section className="section-padding bg-slate-50">
        <div className="container-main">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {HOTELS.map((item) => (
              <ServiceCard key={item.slug} item={item} />
            ))}
          </div>

          <div className="mt-12 text-center bg-white rounded-2xl p-8 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Daha fazla otel seçeneği yakında
            </h3>
            <p className="text-slate-600 max-w-xl mx-auto mb-5">
              50+ partner otel ile anlaşmamız var. İhtiyacınıza özel öneri için bizimle
              iletişime geçin — bütçenize uygun en doğru otel bulalım.
            </p>
            <Link href="/iletisim" className="btn-accent inline-block">
              Özel Otel Talebi Gönder
            </Link>
          </div>
        </div>
      </section>

      <JsonLd data={breadcrumbSchema([{ name: "Oteller", href: "/oteller" }])} />
    </>
  );
}
