// /operatorler — Anlasmali balon operatorleri liste sayfasi.
//
// Importers: Public URL Next.js routing; Footer FOOTER_COMPANY link
// Affected: SEO operator listeleme + her birinin detayina link.
// Data: OPERATORS from src/data/services/operators.ts (read-only)
//       Schema.org ItemList + BreadcrumbList JSON-LD
// User verbatim: "devam et"

import type { Metadata } from "next";
import Link from "next/link";
import { Star, MapPin, Calendar, Users as UsersIcon, ShieldCheck } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/layout/JsonLd";
import { OPERATORS } from "@/data/services/operators";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Anlaşmalı Balon Operatörleri | Trip and Tick",
  description:
    "Trip and Tick'in 9+ TÜRSAB lisanslı anlaşmalı balon operatörü. SHGM sertifikalı pilotlar, EASA standartları, yıllık 250.000+ yolcu kapasitesi.",
  alternates: {
    canonical: `${SITE_URL}/operatorler`,
  },
};

export default function OperatorlerPage() {
  const sorted = [...OPERATORS].sort((a, b) => b.rating - a.rating);
  const avgRating =
    OPERATORS.reduce((sum, o) => sum + o.rating, 0) / OPERATORS.length;
  const totalReviews = OPERATORS.reduce((sum, o) => sum + o.reviewCount, 0);

  return (
    <>
      <PageHero
        tag="Operatörler"
        title="Anlaşmalı"
        highlight={`${OPERATORS.length}+ Balon Operatörü`}
        description={`Trip and Tick, TÜRSAB ve SHGM lisanslı ${OPERATORS.length}+ premium balon operatörüyle doğrudan acentelik anlaşmasına sahiptir. Ortalama ${avgRating.toFixed(2)}★ ile ${totalReviews.toLocaleString("tr-TR")}+ doğrulanmış yorum.`}
      />

      <Breadcrumb items={[{ name: "Operatörler", href: "/operatorler" }]} />

      <section className="section-padding bg-slate-50">
        <div className="container-main">
          <div className="text-center mb-12">
            <span className="section-tag">Sektörel Standartlar</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              SHGM Lisanslı, EASA Sertifikalı
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Tüm operatörlerimiz EASA Part-BOP standartlarına uygun yıllık bakım
              programı uygular, SHGM sertifikalı pilot kadrosu çalıştırır ve
              uluslararası seyahat sigortası ile uçuş gerçekleştirir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((op) => (
              <article
                key={op.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="bg-gradient-to-br from-primary via-primary-light to-accent text-white p-5 relative">
                  <div className="absolute top-3 right-3 bg-white/95 text-primary px-2.5 py-1 rounded-md text-sm font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                    {op.rating.toFixed(2)}
                  </div>
                  <h3 className="text-xl font-bold mb-1 pr-16">{op.name}</h3>
                  <p className="text-xs uppercase tracking-wider opacity-90">
                    Lisans {op.licenseNo}
                  </p>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed line-clamp-3 flex-1">
                    {op.tagline ?? op.description.slice(0, 140) + "..."}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {op.founded} ({new Date().getFullYear() - op.founded}+ yıl)
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5" />
                      {op.reviewCount.toLocaleString("tr-TR")} yorum
                    </div>
                    {op.fleetSize && (
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {op.fleetSize} balon
                      </div>
                    )}
                    {op.pilotCount && (
                      <div className="flex items-center gap-1.5">
                        <UsersIcon className="w-3.5 h-3.5" />
                        {op.pilotCount} pilot
                      </div>
                    )}
                  </div>
                  {op.address && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
                      <MapPin className="w-3 h-3" />
                      {op.address}
                    </div>
                  )}
                  <Link
                    href={`/operatorler/${op.id}`}
                    className="mt-auto inline-flex items-center justify-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    Detayları Gör
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Operatörler", href: "/operatorler" }]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Trip and Tick Anlaşmalı Balon Operatörleri",
            itemListElement: sorted.map((op, idx) => ({
              "@type": "ListItem",
              position: idx + 1,
              url: `${SITE_URL}/operatorler/${op.id}`,
              name: op.name,
            })),
          },
        ]}
      />
    </>
  );
}
