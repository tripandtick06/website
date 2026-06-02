"use client";
import { useT, useLocale } from "@/lib/i18n/I18nProvider";
import { tServiceList } from "@/lib/i18n/localizeData";
import { Link } from "@/i18n/routing";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { ServiceCard } from "@/components/layout/ServiceCard";
import { ACTIVITIES } from "@/data/services/catalog";

export function AktivitelerContent() {
  const t = useT();
  const { locale } = useLocale();
  const items = tServiceList(ACTIVITIES, locale);
  return (
    <>
      <PageHero
        tag={t.page.aktiviteler.pagehero_tag_aktiviteler}
        title={t.page.aktiviteler.pagehero_title_kapadokya}
        highlight={t.page.aktiviteler.pagehero_highlight_macera}
        description={t.page.aktiviteler.pagehero_description_atv_turlari}
      />

      <Breadcrumb items={[{ name: t.page.aktiviteler.breadcrumb_aktiviteler, href: "/aktiviteler" }]} />

      <section className="section-padding bg-slate-50">
        <div className="container-main">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ServiceCard key={item.slug} item={item} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-600 mb-4">
              {t.page.aktiviteler.birden_fazla_aktivite_ister}
            </p>
            <Link href="/paketler" className="btn-primary inline-block">
              {t.page.aktiviteler.kombo_paketleri_gor}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
