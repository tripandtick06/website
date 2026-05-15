import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { ServiceCard } from "@/components/layout/ServiceCard";
import { JsonLd } from "@/components/layout/JsonLd";
import { TRANSFERS } from "@/data/services/catalog";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Kapadokya Havalimanı Transfer — Nevşehir & Kayseri | Trip and Tick",
  description:
    "Nevşehir (NAV) ve Kayseri (ASR) havalimanı transferleri. Özel araç, minibüs ve VIP seçenekleri. 7/24 hizmet, sabit fiyat, anında rezervasyon.",
  alternates: { canonical: `${SITE_URL}/transferler` },
};

export default function TransferlerPage() {
  return (
    <>
      <PageHero
        tag="Transferler"
        title="Havalimanı"
        highlight="Özel Transfer"
        description="Nevşehir (NAV) 30-45 dk ve Kayseri (ASR) 60-75 dk transfer hizmetleri. Özel araç, minibüs, VIP seçenekleri. Sabit fiyat — sürpriz yok."
      />

      <Breadcrumb items={[{ name: "Transferler", href: "/transferler" }]} />

      <section className="section-padding bg-slate-50">
        <div className="container-main">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TRANSFERS.map((item) => (
              <ServiceCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      </section>

      <JsonLd data={breadcrumbSchema([{ name: "Transferler", href: "/transferler" }])} />
    </>
  );
}
