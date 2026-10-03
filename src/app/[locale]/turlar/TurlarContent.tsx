"use client";
import { useT, useLocale } from "@/lib/i18n/I18nProvider";
import { tServiceList } from "@/lib/i18n/localizeData";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { ServiceCard } from "@/components/layout/ServiceCard";
import { TOURS } from "@/data/services/catalog";

type FaqItem = { question: string; answer: string };

export function TurlarContent({ faqs }: { faqs: FaqItem[] }) {
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
      <section className="section-padding bg-white" aria-label="FAQ">
        <div className="container-main max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">
            {t.nav.faq}
          </h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 open:shadow-sm"
              >
                <summary className="cursor-pointer list-none font-semibold text-slate-900 group-open:mb-2">
                  {faq.question}
                </summary>
                <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
