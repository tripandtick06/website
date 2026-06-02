"use client";

import { useT } from "@/lib/i18n/I18nProvider";
import { Link } from "@/i18n/routing";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/layout/JsonLd";
import { HOTELS } from "@/data/services/catalog";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { HotelsGrid } from "@/components/oteller/HotelsGrid";
import { Banner } from "@/components/ui/Banner";

export function OtellerContent() {
  const t = useT();
  const breadcrumbItems = [{ name: t.page.oteller.breadcrumb_name, href: "/oteller" }];

  return (
    <>
      <PageHero
        tag={t.page.oteller.pagehero_tag_oteller}
        title={t.page.oteller.pagehero_title_kapadokya}
        highlight={t.page.oteller.pagehero_highlight_magara_otelleri}
        description={t.page.oteller.pagehero_description_unesco_mirasi}
      />

      <Breadcrumb items={breadcrumbItems} />

      <section className="section-padding bg-slate-50">
        <div className="container-main">
          {/* Contact-only akis: net + pozitif cerceve (i18n-debt: TR hardcode). */}
          <Banner
            variant="info"
            title="Online rezervasyon yakında"
            className="mb-8"
          >
            Şu an otelleri online rezerve edemiyorsunuz. Uzman ekibimiz size özel fiyat ve uygun
            müsaitlik hazırlıyor — kartlardan <b>&ldquo;Fiyat teklifi al&rdquo;</b> deyin, 24 saat içinde dönüş yapalım.
          </Banner>

          <HotelsGrid hotels={HOTELS} />

          <div className="mt-12 text-center bg-white rounded-2xl p-8 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {t.page.oteller.daha_fazla_otel_secenegi_yakinda}
            </h3>
            <p className="text-slate-600 max-w-xl mx-auto mb-5">
              {t.page.oteller["50_partner_otel_anlasmamiz_var"]}
            </p>
            <Link href="/iletisim" className="btn-accent inline-block">
              {t.page.oteller.ozel_otel_talebi_gonder}
            </Link>
          </div>
        </div>
      </section>

      <JsonLd
        data={[
          breadcrumbSchema(breadcrumbItems),
          itemListSchema(
            HOTELS.map((h) => ({
              name: h.name,
              urlPath: `/oteller/${h.slug}`,
            })),
            t.page.oteller.jsonld_item_list_name
          ),
        ]}
      />
    </>
  );
}
