import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { ServiceCard } from "@/components/layout/ServiceCard";
import { JsonLd } from "@/components/layout/JsonLd";
import { PACKAGES } from "@/data/services/catalog";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Kapadokya Tatil Paketleri — Balayı, Aile, Macera | Trip and Tick",
  description:
    "Kapadokya tam gün paketler, balayı, aile, macera ve evlilik teklifi paketleri. Tek rezervasyonda balon + otel + tur — avantajlı fiyat.",
  alternates: {
    canonical: `${SITE_URL}/paketler`,
    languages: generateHreflang("/paketler"),
  },
  openGraph: {
    title: "Kapadokya Tatil Paketleri",
    description: "Balayı, aile, macera paketleri — balon + otel + tur tek rezervasyon.",
    url: `${SITE_URL}/paketler`,
    type: "website",
    images: [
      {
        url: ogImageUrl(
          "Kapadokya Tatil Paketleri",
          "Balayı · Aile · Macera · Evlilik Teklifi"
        ),
        width: 1200,
        height: 630,
        alt: "Kapadokya Tatil Paketleri — Trip and Tick",
      },
    ],
  },
};

export default function PaketlerPage() {
  return (
    <>
      <PageHero
        tag="Özel Paketler"
        title="Kapadokya"
        highlight="Kombo Paketleri"
        description="Balon + otel + tur tek rezervasyonda. Balayı, aile, macera, evlilik teklifi ve kurumsal etkinlik paketleri — ayrı ayrı rezerve etmekten %20-30 daha ucuz."
      />

      <Breadcrumb items={[{ name: "Paketler", href: "/paketler" }]} />

      <section className="section-padding bg-slate-50">
        <div className="container-main">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PACKAGES.map((item) => (
              <ServiceCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      </section>

      <JsonLd data={breadcrumbSchema([{ name: "Paketler", href: "/paketler" }])} />
    </>
  );
}
