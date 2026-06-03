"use client";

import NextImage from "next/image";
import { Link } from "@/i18n/routing";
import { Wind, Star, Clock, Users, Check, Shield } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { OPERATORS } from "@/data/services/operators";
import { formatPrice } from "@/lib/utils";
import { useT, useLocale } from "@/lib/i18n/I18nProvider";
import { tBalloons, tFaq } from "@/lib/i18n/localizeData";

const BADGE_BG: Record<string, string> = {
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  primary: "bg-primary",
};

export function BalonlarContent() {
  const t = useT();
  const { locale } = useLocale();
  const b = t.page.balonlar;
  const balonFaqs = tFaq(locale).filter((f) => f.category === "balon");
  const packages = tBalloons(locale);

  return (
    <>
      <PageHero
        tag={b.pagehero_tag_balon_turlari}
        title={b.pagehero_title_kapadokya_balon}
        highlight="€165'ten"
        description={b.pagehero_description_tursab_lisansli}
      />

      <Breadcrumb items={[{ name: b.pagehero_tag_balon_turlari, href: "/balonlar" }]} />

      {/* Packages grid */}
      <section className="section-padding bg-slate-50">
        <div className="container-main">
          <div className="text-center mb-12">
            <span className="section-tag">{b.paket}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              {b.paket_karsilastirmasi}
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              {b.standart_ekonomik_ucustan}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packages.map((pkg, index) => (
              <article key={pkg.slug} className="card overflow-hidden flex flex-col">
                <div className={`relative h-56 ${pkg.images[0] ? "bg-slate-100" : "bg-gradient-to-br from-primary via-primary-light to-accent flex items-center justify-center"}`}>
                  {pkg.images[0] ? (
                    <NextImage
                      src={pkg.images[0]}
                      alt={`${pkg.name} — Kapadokya`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                      priority={index === 0}
                      loading={index === 0 ? undefined : "lazy"}
                    />
                  ) : (
                    <Wind className="w-24 h-24 text-white/85" strokeWidth={1.2} />
                  )}
                  <span
                    className={`absolute top-4 left-4 ${BADGE_BG[pkg.badgeColor]} text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-md z-10`}
                  >
                    {pkg.badge}
                  </span>
                  <div className="absolute top-4 right-4 bg-white/95 text-primary px-2.5 py-1 rounded-md text-sm font-bold flex items-center gap-1 z-10">
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
                        {pkg.capacity.min}-{pkg.capacity.max} {b.kisi}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <Shield className="w-4 h-4 text-success mx-auto mb-1" />
                      <div className="text-xs font-semibold text-slate-700">{b["40m_sigorta"]}</div>
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
                            {b.ozel_fiyat_sorunuz}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">{b.kisiye_ozel_teklif}</div>
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
                            {pkg.dynamicPricing ? b.kisi_basi_dinamik : b.kisi_basi_yetiskin}
                          </div>
                        </>
                      )}
                    </div>
                    <Link href={{ pathname: "/balonlar/[slug]", params: { slug: pkg.slug } }} className="btn-accent text-sm">
                      {pkg.priceOnRequest ? b.detay_iletisim : b.detay_rezerve}
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
            <span className="section-tag">{b.operatorler}</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
              {b.anlasmali_10_tursab_lisansli}
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              {b.sadece_sivil_havacilik_genel}
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
                <div className="text-[10px] text-slate-500 mb-1.5">{b.lisans_prefix} {op.licenseNo}</div>
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
            <span className="section-tag">{b.sss_tag}</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
              {b.balon_turu_hakkinda_sik_sorulan}
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
    </>
  );
}
