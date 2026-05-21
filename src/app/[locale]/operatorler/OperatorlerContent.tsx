"use client";

import { useT } from "@/lib/i18n/I18nProvider";
import { Link } from "@/i18n/routing";
import { Star, MapPin, Calendar, Users as UsersIcon, ShieldCheck } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/layout/JsonLd";
import { OPERATORS } from "@/data/services/operators";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";

export function OperatorlerContent() {
  const t = useT();

  const sorted = [...OPERATORS].sort((a, b) => b.rating - a.rating);
  const avgRating =
    OPERATORS.reduce((sum, o) => sum + o.rating, 0) / OPERATORS.length;
  const totalReviews = OPERATORS.reduce((sum, o) => sum + o.reviewCount, 0);

  const breadcrumbItems = [{ name: t.page.operatorler.breadcrumb_name, href: "/operatorler" }];

  const heroHighlight = t.page.operatorler.pagehero_highlight_balon_operatoru.replace(
    "{count}",
    String(OPERATORS.length)
  );
  const heroDescription = t.page.operatorler.pagehero_description_dynamic
    .replace("{count}", String(OPERATORS.length))
    .replace("{rating}", avgRating.toFixed(2))
    .replace("{reviews}", totalReviews.toLocaleString("tr-TR"));

  return (
    <>
      <PageHero
        tag={t.page.operatorler.pagehero_tag_operatorler}
        title={t.page.operatorler.pagehero_title_anlasmali}
        highlight={heroHighlight}
        description={heroDescription}
      />

      <Breadcrumb items={breadcrumbItems} />

      <section className="section-padding bg-slate-50">
        <div className="container-main">
          <div className="text-center mb-12">
            <span className="section-tag">{t.page.operatorler.sektorel_standartlar}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              {t.page.operatorler.shgm_lisansli_easa_sertifikali}
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              {t.page.operatorler.tum_operatorlerimiz_easa_part}
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
                    {t.page.operatorler.lisans_prefix} {op.licenseNo}
                  </p>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed line-clamp-3 flex-1">
                    {op.tagline ?? op.description.slice(0, 140) + "..."}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {op.founded} ({new Date().getFullYear() - op.founded}{t.page.operatorler.yil}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5" />
                      {op.reviewCount.toLocaleString("tr-TR")} {t.page.operatorler.yorum_suffix}
                    </div>
                    {op.fleetSize && (
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {op.fleetSize} {t.page.operatorler.balon_suffix}
                      </div>
                    )}
                    {op.pilotCount && (
                      <div className="flex items-center gap-1.5">
                        <UsersIcon className="w-3.5 h-3.5" />
                        {op.pilotCount} {t.page.operatorler.pilot_suffix}
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
                    {t.page.operatorler.detaylari_gor}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <JsonLd
        data={[
          breadcrumbSchema(breadcrumbItems),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: t.page.operatorler.jsonld_item_list_name,
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
