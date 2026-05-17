import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/layout/JsonLd";
import { FAQ_ITEMS, type FAQItem } from "@/data/faq";
import { breadcrumbSchema, faqPageSchema, SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl } from "@/lib/hreflang";

export const runtime = "edge";


export const metadata: Metadata = {
  title: "Sık Sorulan Sorular — Kapadokya Balon Turu SSS | Trip and Tick",
  description:
    "Kapadokya balon turu fiyatı, yaş sınırı, iptal politikası, ödeme yöntemleri ve diğer sık sorulan sorulara hızlı cevaplar. AI search optimize.",
  alternates: {
    canonical: `${SITE_URL}/sss`,
    languages: generateHreflang("/sss"),
  },
  openGraph: {
    title: "Sık Sorulan Sorular",
    description: "Balon turu, fiyat, yaş, iptal, ödeme — hızlı cevaplar.",
    url: `${SITE_URL}/sss`,
    type: "website",
    images: [
      {
        url: ogImageUrl(
          "Sık Sorulan Sorular",
          "Balon Turu · Fiyat · İptal · Ödeme — Hızlı Cevaplar"
        ),
        width: 1200,
        height: 630,
        alt: "SSS — Trip and Tick",
      },
    ],
  },
};

const CATEGORY_LABELS: Record<FAQItem["category"], string> = {
  balon: "Balon Turu",
  rezervasyon: "Rezervasyon",
  odeme: "Ödeme",
  iptal: "İptal & İade",
  genel: "Genel",
};

export default function SssPage() {
  const grouped: Record<string, FAQItem[]> = {};
  FAQ_ITEMS.forEach((item) => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  const categories = Object.keys(grouped) as FAQItem["category"][];

  return (
    <>
      <PageHero
        tag="SSS"
        title="Sık"
        highlight="Sorulan Sorular"
        description="Kapadokya tatili, balon turu rezervasyonu, ödeme ve iptal politikası hakkında en sık sorulan soruların hızlı cevapları."
      />

      <Breadcrumb items={[{ name: "SSS", href: "/sss" }]} />

      <section className="section-padding bg-slate-50">
        <div className="container-main max-w-4xl">
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {categories.map((cat) => (
              <a
                key={cat}
                href={`#${cat}`}
                className="px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition-all"
              >
                {CATEGORY_LABELS[cat]}
                <span className="ml-1.5 text-xs opacity-60">({grouped[cat].length})</span>
              </a>
            ))}
          </div>

          {categories.map((cat) => (
            <section key={cat} id={cat} className="mb-10 scroll-mt-24">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-1 h-7 bg-accent rounded-full" />
                {CATEGORY_LABELS[cat]}
              </h2>
              <div className="space-y-3">
                {grouped[cat].map((f) => (
                  <details
                    key={f.question}
                    className="group bg-white rounded-xl border border-slate-200 p-5"
                  >
                    <summary className="font-bold text-slate-900 cursor-pointer flex items-center justify-between speakable">
                      <span>{f.question}</span>
                      <span className="text-accent text-xl group-open:rotate-45 transition-transform flex-shrink-0 ml-3">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-slate-600 leading-relaxed speakable">
                      {f.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}

          <div className="mt-12 bg-primary text-white rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-extrabold mb-2">Cevabını bulamadın mı?</h3>
            <p className="text-white/85 mb-5">
              Ekibimiz 7/24 WhatsApp'ta. Sorunuzu yazın, anında yanıt alın.
            </p>
            <a
              href="https://wa.me/905374647861"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent inline-block"
            >
              WhatsApp ile Sor
            </a>
          </div>
        </div>
      </section>

      <JsonLd
        data={[
          breadcrumbSchema([{ name: "SSS", href: "/sss" }]),
          faqPageSchema(
            FAQ_ITEMS.map((f) => ({ question: f.question, answer: f.answer }))
          ),
        ]}
      />
    </>
  );
}
