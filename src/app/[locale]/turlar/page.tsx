import type { Metadata } from "next";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, itemListSchema, faqPageSchema, SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl } from "@/lib/hreflang";
import { DICTIONARIES, isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { TOURS } from "@/data/services/catalog";
import { TurlarContent } from "./TurlarContent";

const TOUR_FAQS = [
  {
    question: "Kapadokya turları kaç saat sürer?",
    answer: "Kırmızı, Yeşil ve Mix turlar tam gün (8-10 saat), Sarı tur 7-8 saat, Yeraltı Şehirleri turu yarım gün (5-6 saat), Gün Batımı turu 3 saat ve Instagram/Foto turu yarım gündür.",
  },
  {
    question: "Otelimden alınıp bırakılacak mıyım?",
    answer: "Evet, tüm tur paketlerinde Göreme, Ürgüp, Uçhisar ve Avanos bölgelerindeki otellerden ücretsiz transfer dahildir. Diğer bölgelerden ek ücret olabilir.",
  },
  {
    question: "Tur fiyatları neyi içeriyor?",
    answer: "Profesyonel TR/EN/RU rehber, otel transferi, müze giriş biletleri, öğle yemeği (Kırmızı/Yeşil/Mix turlar) ve tüm vergiler dahildir. Sadece bahşiş ve kişisel harcamalar dahil değildir.",
  },
  {
    question: "Hangi tur en popüler?",
    answer: "Kırmızı Tur (Red Tour) en çok tercih edileni — Göreme Açık Hava Müzesi, Uçhisar Kalesi, Paşabağ ve Avanos çömlek atölyesini içerir. €45'ten başlar.",
  },
  {
    question: "Birden fazla turu aynı günde yapabilir miyim?",
    answer: "Hayır, tam gün turlar (Kırmızı/Yeşil/Mix/Sarı) ayrı günlerde planlanmalı. Ancak yarım gün turlar (Yeraltı Şehirleri + Gün Batımı veya Instagram + Gün Batımı) aynı günde kombine edilebilir.",
  },
];

export const runtime = "edge";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = DICTIONARIES[loc].page.turlar;
  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: `${SITE_URL}/turlar`,
      languages: generateHreflang("/turlar"),
    },
    openGraph: {
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: `${SITE_URL}/turlar`,
      type: "website",
      images: [
        {
          url: ogImageUrl(
            d.meta_title_2,
            d.og_image_subtitle
          ),
          width: 1200,
          height: 630,
          alt: d.meta_og_alt,
        },
      ],
    },
  };
}

export default function TurlarPage() {
  const itemList = itemListSchema(
    TOURS.map((t) => ({ name: t.name, urlPath: `/rezervasyon/${t.slug}` })),
    "Kapadokya Gezi Turları"
  );

  return (
    <>
      <TurlarContent />
      <JsonLd data={breadcrumbSchema([{ name: "Gezi Turları", href: "/turlar" }])} />
      <JsonLd data={itemList} />
      <JsonLd data={faqPageSchema(TOUR_FAQS)} />
    </>
  );
}
