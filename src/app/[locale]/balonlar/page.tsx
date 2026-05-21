import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { Wind, Star, Clock, Users, Check, Shield } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/layout/JsonLd";
import { BALLOON_PACKAGES } from "@/data/services/balloons";
import { OPERATORS } from "@/data/services/operators";
import { FAQ_ITEMS } from "@/data/faq";
import { formatPrice } from "@/lib/utils";
import {
  breadcrumbSchema,
  faqPageSchema,
  itemListSchema,
  SITE_URL,
} from "@/lib/schema";
import { generateHreflang, ogImageUrl } from "@/lib/hreflang";

export const runtime = "edge";


export const metadata: Metadata = {
  title: "Kapadokya Balon Turu Fiyatları 2026 — Trip and Tick",
  description:
    "Kapadokya balon turu €165'ten başlar. Standart, Konfor, Deluxe ve Romantik özel paketler. 9+ TÜRSAB lisanslı operatör, %100 iade garantisi, en düşük fiyat garantisi.",
  alternates: {
    canonical: `${SITE_URL}/balonlar`,
    languages: generateHreflang("/balonlar"),
  },
  openGraph: {
    title: "Kapadokya Balon Turu Fiyatları 2026",
    description: "€165'ten başlayan paketler. 9+ operatör, %100 iade garantisi.",
    url: `${SITE_URL}/balonlar`,
    type: "website",
    images: [
      {
        url: ogImageUrl(
          "Kapadokya Balon Turu Fiyatları 2026",
          "€165'ten · 9+ TÜRSAB Operatör · %100 İade Garantisi"
        ),
        width: 1200,
        height: 630,
        alt: "Kapadokya Balon Turu — Trip and Tick",
      },
    ],
  },
};

const BADGE_BG: Record<string, string> = {
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  primary: "bg-primary",
};

export default function BalonlarPage() {
  const balonFaqs = FAQ_ITEMS.filter((f) => f.category === "balon");

  return (
    <>
      <PageHero
        tag="Balon Turları"
        title="Kapadokya Balon Turu"
        highlight="€165'ten"
        description="9+ TÜRSAB lisanslı operatörle anlaşmalı doğrudan acentelik. En düşük fiyat garantisi, %100 iade güvencesi, 40 milyon Euro sigorta."
      />

      <Breadcrumb items={[{ name: "Balon Turları", href: "/balonlar" }]} />

      {/* Packages grid */}
      <section className="section-padding bg-slate-50">
        <div className="container-main">
          <div className="text-center mb-12">
            <span className="section-tag">4 Paket</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              Paket Karşılaştırması
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Standart ekonomik uçuştan romantik özel sepete kadar her bütçeye uygun
              seçenekler. Tüm fiyatlara transfer, kahvaltı, sigorta, sertifika ve
              şampanya servisi dahildir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {BALLOON_PACKAGES.map((pkg) => (
              <article key={pkg.slug} className="card overflow-hidden flex flex-col">
                <div className="relative h-56 bg-gradient-to-br from-primary via-primary-light to-accent flex items-center justify-center">
                  <Wind className="w-24 h-24 text-white/85" strokeWidth={1.2} />
                  <span
                    className={`absolute top-4 left-4 ${BADGE_BG[pkg.badgeColor]} text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-md`}
                  >
                    {pkg.badge}
                  </span>
                  <div className="absolute top-4 right-4 bg-white/95 text-primary px-2.5 py-1 rounded-md text-sm font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                    {pkg.rating}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{pkg.name}</h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    {pkg.shortDescription}
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
                      <div className="text-xs font-semibold text-slate-700">{pkg.duration}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <Users className="w-4 h-4 text-primary mx-auto mb-1" />
                      <div className="text-xs font-semibold text-slate-700">
                        {pkg.capacity.min}-{pkg.capacity.max} kişi
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <Shield className="w-4 h-4 text-success mx-auto mb-1" />
                      <div className="text-xs font-semibold text-slate-700">40M€ sigorta</div>
                    </div>
                  </div>

                  <ul className="text-sm text-slate-700 space-y-1.5 mb-5">
                    {pkg.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-success flex-shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-end justify-between gap-3 mt-auto pt-4 border-t border-slate-100">
                    <div>
                      {pkg.priceOnRequest ? (
                        <>
                          <div className="text-2xl font-extrabold text-primary leading-tight">
                            Özel fiyat sorunuz
                          </div>
                          <div className="text-xs text-slate-500 mt-1">Kişiye özel teklif</div>
                        </>
                      ) : (
                        <>
                          <div className="text-xs text-slate-400 line-through">
                            {formatPrice(pkg.marketPrice, pkg.currency)}
                          </div>
                          <div className="text-3xl font-extrabold text-primary leading-none">
                            {formatPrice(pkg.adultPrice, pkg.currency)}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {pkg.dynamicPricing ? "kişi başı (7 gün içi günlük değişir)" : "kişi başı / yetişkin"}
                          </div>
                        </>
                      )}
                    </div>
                    <Link href={`/balonlar/${pkg.slug}`} className="btn-accent text-sm">
                      {pkg.priceOnRequest ? "Detay & İletişim" : "Detay & Rezerve"}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Operators */}
      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="text-center mb-12">
            <span className="section-tag">Operatörler</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
              Anlaşmalı 10 TÜRSAB Lisanslı Operatör
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Sadece Sivil Havacılık Genel Müdürlüğü lisanslı, en az 5 yıl deneyimli
              operatörlerle çalışıyoruz. Aracı komisyonu yok — fiyat direkt operatörden.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {OPERATORS.map((op) => (
              <div
                key={op.id}
                className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center hover:shadow-card transition-all"
              >
                <Wind className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-bold text-slate-900 text-sm mb-1">{op.name}</h4>
                <div className="text-[10px] text-slate-500 mb-1.5">Lisans {op.licenseNo}</div>
                <div className="flex items-center justify-center gap-1 text-xs">
                  <Star className="w-3 h-3 fill-warning text-warning" />
                  <span className="font-semibold text-slate-700">{op.rating}</span>
                  <span className="text-slate-400">({op.reviewCount.toLocaleString("tr-TR")})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-slate-50">
        <div className="container-main max-w-4xl">
          <div className="text-center mb-10">
            <span className="section-tag">SSS</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
              Balon Turu Hakkında Sık Sorulan Sorular
            </h2>
          </div>
          <div className="space-y-3">
            {balonFaqs.map((f) => (
              <details
                key={f.question}
                className="group bg-white rounded-xl border border-slate-200 p-5"
              >
                <summary className="font-bold text-slate-900 cursor-pointer flex items-center justify-between">
                  <span>{f.question}</span>
                  <span className="text-accent text-xl group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-slate-600 leading-relaxed">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Balon Turları", href: "/balonlar" }]),
          itemListSchema(
            BALLOON_PACKAGES.map((pkg) => ({
              name: pkg.name,
              urlPath: `/balonlar/${pkg.slug}`,
            })),
            "Kapadokya Balon Turu Paketleri"
          ),
          faqPageSchema(balonFaqs.map((f) => ({ question: f.question, answer: f.answer }))),
        ]}
      />
    </>
  );
}
