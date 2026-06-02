"use client";
import { useT, useLocale } from "@/lib/i18n/I18nProvider";
import { tServiceList } from "@/lib/i18n/localizeData";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { ServiceCard } from "@/components/layout/ServiceCard";
import { PACKAGES } from "@/data/services/catalog";

export function PaketlerContent() {
  const t = useT();
  const { locale } = useLocale();
  const items = tServiceList(PACKAGES, locale);
  return (
    <>
      <PageHero
        tag={t.page.paketler.pagehero_tag_ozel_paketler}
        title={t.page.paketler.pagehero_title_kapadokya}
        highlight={t.page.paketler.pagehero_highlight_kombo_paketleri}
        description={t.page.paketler.pagehero_description_balon_otel}
      />

      <Breadcrumb items={[{ name: t.page.paketler.breadcrumb_paketler, href: "/paketler" }]} />

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
