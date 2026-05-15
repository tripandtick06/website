import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { ServiceCard } from "@/components/layout/ServiceCard";
import { JsonLd } from "@/components/layout/JsonLd";
import { ACTIVITIES } from "@/data/services/catalog";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Kapadokya Aktiviteleri — ATV, At Binme, Jeep Safari | Trip and Tick",
  description:
    "Kapadokya'da yapılacak en iyi aktiviteler: ATV turları, at binme, jeep safari. Rehberli, sigortalı, otel transferi dahil. Anında rezervasyon.",
  alternates: {
    canonical: `${SITE_URL}/aktiviteler`,
    languages: generateHreflang("/aktiviteler"),
  },
  openGraph: {
    title: "Kapadokya Aktiviteleri",
    description: "ATV, at binme, jeep safari — rehberli & sigortalı.",
    url: `${SITE_URL}/aktiviteler`,
    type: "website",
    images: [
      {
        url: ogImageUrl(
          "Kapadokya Aktiviteleri",
          "ATV · At Binme · Jeep Safari — €29'dan"
        ),
        width: 1200,
        height: 630,
        alt: "Kapadokya Aktiviteleri — Trip and Tick",
      },
    ],
  },
};

export default function AktivitelerPage() {
  return (
    <>
      <PageHero
        tag="Aktiviteler"
        title="Kapadokya"
        highlight="Macera Aktiviteleri"
        description="ATV turları, at binme deneyimleri ve jeep safari. Profesyonel rehberler, tam sigortalı, otel transferi dahil. €29'dan başlayan fiyatlar."
      />

      <Breadcrumb items={[{ name: "Aktiviteler", href: "/aktiviteler" }]} />

      <section className="section-padding bg-slate-50">
        <div className="container-main">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ACTIVITIES.map((item) => (
              <ServiceCard key={item.slug} item={item} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-600 mb-4">
              Birden fazla aktivite ister misiniz? Avantajlı paketlerimize bakın.
            </p>
            <Link href="/paketler" className="btn-primary inline-block">
              Kombo Paketleri Gör
            </Link>
          </div>
        </div>
      </section>

      <JsonLd data={breadcrumbSchema([{ name: "Aktiviteler", href: "/aktiviteler" }])} />
    </>
  );
}
