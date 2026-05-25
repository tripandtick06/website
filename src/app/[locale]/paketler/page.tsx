import type { Metadata } from "next";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, itemListSchema, faqPageSchema, SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl } from "@/lib/hreflang";
import { DICTIONARIES, isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { PACKAGES } from "@/data/services/catalog";
import { PaketlerContent } from "./PaketlerContent";

const PACKAGE_FAQS = [
  {
    question: "Paket fiyatları kişi başı mı yoksa toplam mı?",
    answer: "Belirtilen fiyatlar kişi başıdır (çift-kişilik konaklamada). Balayı paketi €1495 çift için toplam, evlilik teklifi paketi €1295 organize edilen kişi başınadır. Aile paketi 2 yetişkin + 2 çocuk toplam fiyatıdır.",
  },
  {
    question: "Paketler içinde balon turu hangi seviyede?",
    answer: "Tam Gün Premium ve Macera paketleri Standart balon (€165); Aile paketi Standart balon (çocuk %80); Balayı ve Evlilik Teklifi paketleri VIP Romantik özel balon (sepette sadece siz veya 2 çift).",
  },
  {
    question: "Paket rezervasyonunu ne kadar önce yapmalıyım?",
    answer: "Yüksek sezon (Mayıs/Eylül-Ekim) paket rezervasyonu en az 4-6 hafta önce önerilir; düşük sezon 7-10 gün yeterli. Balayı ve Evlilik Teklifi paketleri sürpriz organizasyon için min 14 gün önce.",
  },
  {
    question: "Otel paketleri içinde hangi tip otel dahil?",
    answer: "Tam Gün Premium: mağara otel orta segment (€120-165 gece-değeri). Balayı: VIP Honeymoon Mağara (€285 gece-değeri). Aile: Aile Resort havuzlu (€145 gece-değeri). Tüm paketlerde otel açık büfe kahvaltı dahildir.",
  },
  {
    question: "Kurumsal paket nasıl çalışır?",
    answer: "Minimum 10 kişi grup; kişi başı €295. Grup balonu (15+ kişilik sepet), rehberli tur, gala akşam yemeği ve kurumsal organizatör dahildir. Faturalı ödeme ve özel branding seçeneği mevcut. info@tripandtick.com'a yazarak özel teklif alabilirsiniz.",
  },
];

export const runtime = "edge";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = DICTIONARIES[loc].page.paketler;
  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: `${SITE_URL}/paketler`,
      languages: generateHreflang("/paketler"),
    },
    openGraph: {
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: `${SITE_URL}/paketler`,
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

export default function PaketlerPage() {
  const itemList = itemListSchema(
    PACKAGES.map((p) => ({ name: p.name, urlPath: `/rezervasyon/${p.slug}` })),
    "Kapadokya Kombi Paketleri"
  );

  return (
    <>
      <PaketlerContent />
      <JsonLd data={breadcrumbSchema([{ name: "Paketler", href: "/paketler" }])} />
      <JsonLd data={itemList} />
      <JsonLd data={faqPageSchema(PACKAGE_FAQS)} />
    </>
  );
}
