"use client";
import { useT } from "@/lib/i18n/I18nProvider";

export type FaqItem = { question: string; answer: string };

// Visible FAQ block. Renders the same `faqs` array that feeds the FAQPage JSON-LD
// (see getPageFaqs in src/data/i18n/pageFaqs.ts), so schema and page text stay in sync.
export function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  const t = useT();
  return (
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
  );
}
