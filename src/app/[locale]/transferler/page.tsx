import type { Metadata } from "next";
import { DICTIONARIES, isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { SITE_URL, itemListSchema, faqPageSchema } from "@/lib/schema";
import { generateHreflang, ogImageUrl } from "@/lib/hreflang";
import { JsonLd } from "@/components/layout/JsonLd";
import { TRANSFERS } from "@/data/services/catalog";
import { tServiceList } from "@/lib/i18n/localizeData";
import { TransferlerContent } from "./TransferlerContent";

const TRANSFER_FAQS = [
  {
    question: "Hangi havalimanlarından transfer yapıyorsunuz?",
    answer: "Nevşehir Havalimanı (NAV, 30-45 dk, €35) ve Kayseri Havalimanı (ASR, 60-75 dk, €55). İki havalimanı da Göreme/Ürgüp/Uçhisar otellerine direkt servis sunar.",
  },
  {
    question: "Transfer fiyatı kişi başı mı?",
    answer: "Hayır, fiyat araç başınadır (1-4 kişi). 5+ kişi için minibüs (€65-95) veya VIP araç (€85-120) seçeneği vardır. Bagaj limiti yoktur; özel ekipman (bisiklet, snowboard) için önceden bildirim.",
  },
  {
    question: "Şoför otelden alacak mı?",
    answer: "Geliş: havalimanı arrivals çıkışında isim levhalı şoför sizi bekliyor. Dönüş: belirtilen tarih+saatte otel girişinden alır. WhatsApp +90 537 464 78 61 üzerinden anlık iletişim mevcut.",
  },
  {
    question: "Uçuş gecikirse ek ücret var mı?",
    answer: "Hayır, uçuşunuzu izliyoruz. 90 dakikaya kadar gecikme ücretsiz. 90+ dakika veya yeni gün geçişi durumunda €15-25 bekleme ücreti uygulanabilir. İptal: 4+ saat öncesinden %100 iade.",
  },
];

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = DICTIONARIES[loc].page.transferler;
  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: `${SITE_URL}/transferler`,
      languages: generateHreflang("/transferler"),
    },
    openGraph: {
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: `${SITE_URL}/transferler`,
      type: "website",
      images: [
        {
          url: ogImageUrl(d.meta_title_2, d.meta_desc_2),
          width: 1200,
          height: 630,
          alt: d.meta_og_alt,
        },
      ],
    },
  };
}

export default function Page({
  params,
}: {
  params: { locale: string };
}) {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const itemList = itemListSchema(
    tServiceList(TRANSFERS, loc).map((t) => ({ name: t.name, urlPath: `/rezervasyon/${t.slug}` })),
    "Kapadokya Havalimanı Transferleri"
  );

  return (
    <>
      <TransferlerContent />
      <JsonLd data={itemList} />
      <JsonLd data={faqPageSchema(TRANSFER_FAQS)} />
    </>
  );
}
