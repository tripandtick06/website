"use client";

import { useT, useLocale } from "@/lib/i18n/I18nProvider";
import { tServiceList } from "@/lib/i18n/localizeData";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { ServiceCard } from "@/components/layout/ServiceCard";
import { JsonLd } from "@/components/layout/JsonLd";
import { TRANSFERS } from "@/data/services/catalog";
import { breadcrumbSchema } from "@/lib/schema";

export function TransferlerContent() {
  const t = useT();
  const { locale } = useLocale();
  const items = tServiceList(TRANSFERS, locale);
  const breadcrumbItems = [{ name: t.page.transferler.breadcrumb_name, href: "/transferler" }];

  return (
    <>
      <PageHero
        tag={t.page.transferler.pagehero_tag_transferler}
        title={t.page.transferler.pagehero_title_havalimani}
        highlight={t.page.transferler.pagehero_highlight_ozel_transfer}
        description={t.page.transferler.pagehero_description_nevsehir_nav}
      />

      <Breadcrumb items={breadcrumbItems} />

      <section className="section-padding bg-slate-50">
        <div className="container-main">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ServiceCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      </section>

      <JsonLd data={breadcrumbSchema(breadcrumbItems)} />
    </>
  );
}
