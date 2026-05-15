import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { ServiceCard } from "@/components/layout/ServiceCard";
import { JsonLd } from "@/components/layout/JsonLd";
import { TOURS } from "@/data/services/catalog";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Kapadokya Gezi Turları — Kırmızı, Yeşil, Gün Batımı | Trip and Tick",
  description:
    "Kapadokya'nın en popüler gezi turları: Kırmızı Tur (Göreme + Uçhisar), Yeşil Tur (Ihlara + Derinkuyu), gün batımı ve fotoğraf turları. Rehberli, transfer dahil.",
  alternates: { canonical: `${SITE_URL}/turlar` },
};

export default function TurlarPage() {
  return (
    <>
      <PageHero
        tag="Gezi Turları"
        title="Kapadokya"
        highlight="Klasik Turları"
        description="UNESCO Dünya Mirası bölgesinin en önemli noktalarını profesyonel rehber eşliğinde keşfedin. Kırmızı, Yeşil, gün batımı ve özel fotoğraf turları."
      />

      <Breadcrumb items={[{ name: "Gezi Turları", href: "/turlar" }]} />

      <section className="section-padding bg-slate-50">
        <div className="container-main">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOURS.map((item) => (
              <ServiceCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      </section>

      <JsonLd data={breadcrumbSchema([{ name: "Gezi Turları", href: "/turlar" }])} />
    </>
  );
}
