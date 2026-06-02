"use client";
import { useT, useLocale } from "@/lib/i18n/I18nProvider";
import { tServiceList } from "@/lib/i18n/localizeData";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { ServiceCard } from "@/components/layout/ServiceCard";
import { TOURS } from "@/data/services/catalog";

export function TurlarContent() {
  const t = useT();
  const { locale } = useLocale();
  const items = tServiceList(TOURS, locale);
  return (
    <>
      <PageHero
        tag={t.page.turlar.pagehero_tag_gezi_turlari}
        title={t.page.turlar.pagehero_title_kapadokya}
        highlight={t.page.turlar.pagehero_highlight_klasik_turlari}
        description={t.page.turlar.pagehero_description_unesco_dunya}
      />

      <Breadcrumb items={[{ name: t.page.turlar.breadcrumb_gezi_turlari, href: "/turlar" }]} />

      <section className="section-padding bg-slate-50">
        <div className="container-main">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ServiceCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
