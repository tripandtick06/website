import type { Metadata } from "next";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, itemListSchema, faqPageSchema, SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl } from "@/lib/hreflang";
import { DICTIONARIES, isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { ACTIVITIES } from "@/data/services/catalog";
import { AktivitelerContent } from "./AktivitelerContent";

const ACTIVITY_FAQS = [
  {
    question: "Kapadokya'da hangi aktiviteler var?",
    answer: "ATV safari, Jeep safari, at binme, Türk hamamı, Türk gecesi folklor şovu ve microlight uçuşu dahil 7+ kategori, toplam 16 farklı aktivite paketi sunuyoruz. Hepsi otel transferi dahil €29'dan başlıyor.",
  },
  {
    question: "ATV ve jeep safarinin yaş limiti nedir?",
    answer: "ATV ehliyeti gereksizdir; 16+ yaş tek sürücü olabilir, 6-15 yaş yetişkin arkasında yolcu. Jeep safaride yaş sınırı yoktur, çocuk koltuğu mevcuttur.",
  },
  {
    question: "Aktiviteler hangi mevsimde yapılabilir?",
    answer: "ATV, jeep, at binme yıl-içi tüm sezonlar açıktır. Hamam ve Türk gecesi yıl-içi kapalı mekân. Microlight uçuşu rüzgâr durumuna bağlı (genelde Mart-Kasım optimal).",
  },
  {
    question: "Türk Gecesi şovunda ne dahil?",
    answer: "Yemekli paket €55: semah + folklor + oryantal + Kafkas dansı + 3 çeşit yemek + sınırsız alkollü/alkolsüz içecek + otel transferi (3 saat). Yemeksiz paket €35: sadece şov + hoşgeldin içeceği + transfer.",
  },
  {
    question: "Hamam paketi ne kadar sürer?",
    answer: "Standart Türk Hamamı 90 dakika (€50): kese + köpük masajı + sauna + jakuzi. Deluxe paket 2 saat (€75): hamam + 30 dakika İsveç yağ masajı + tam vücut mask. Her ikisi de otel transferi dahil.",
  },
];

export const runtime = "edge";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = DICTIONARIES[loc].page.aktiviteler;
  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: `${SITE_URL}/aktiviteler`,
      languages: generateHreflang("/aktiviteler"),
    },
    openGraph: {
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: `${SITE_URL}/aktiviteler`,
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

export default function AktivitelerPage() {
  const itemList = itemListSchema(
    ACTIVITIES.map((a) => ({ name: a.name, urlPath: `/rezervasyon/${a.slug}` })),
    "Kapadokya Aktiviteleri"
  );

  return (
    <>
      <AktivitelerContent />
      <JsonLd data={breadcrumbSchema([{ name: "Aktiviteler", href: "/aktiviteler" }])} />
      <JsonLd data={itemList} />
      <JsonLd data={faqPageSchema(ACTIVITY_FAQS)} />
    </>
  );
}
