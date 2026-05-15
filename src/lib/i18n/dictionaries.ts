// i18n dictionaries — FAZ 1: TR + EN only.
// User verbatim: "dil degismiyor. bu ilk hata."
// localStorage key: "tripandtick:locale", value "tr" | "en".

export type Locale = "tr" | "en";

export const DEFAULT_LOCALE: Locale = "tr";
export const SUPPORTED_LOCALES: Locale[] = ["tr", "en"];

export const DICTIONARIES = {
  tr: {
    common: {
      reserve: "Rezervasyon Yap",
      learnMore: "Detayları Gör",
      from: "başlayan",
      perPerson: "kişi başı",
      loading: "Yükleniyor...",
    },
    nav: {
      balloons: "Balon Turları",
      hotels: "Oteller",
      activities: "Aktiviteler",
      tours: "Gezi Turları",
      packages: "Paketler",
      blog: "Blog",
      about: "Hakkımızda",
      contact: "İletişim",
      faq: "SSS",
    },
    hero: {
      badge: "Nevşehir / Kapadokya",
      title1: "Kapadokya'nın",
      title2: "En İyi Deneyimleri",
      title3: "En Uygun Fiyatla",
      subtitle:
        "Balon turlarından otel rezervasyonuna, ATV turlarından özel paketlere — tek platformda, şeffaf fiyatlarla.",
    },
    footer: {
      rights: "Tüm hakları saklıdır.",
      services: "Hizmetler",
      company: "Şirket",
      legal: "Yasal",
    },
    trust: {
      refund: "%100 İade Garantisi",
      secure: "3D Secure Ödeme",
      insurance: "40M€ Sigorta",
      languages: "9 Dil Desteği",
    },
    stats: {
      operators: "Anlaşmalı Operatör",
      customers: "Mutlu Yolcu",
      rating: "Ortalama Puan",
      refund: "İade Garantisi",
      langs: "Dil Desteği",
    },
    cta: {
      mobile: "Hemen Rezervasyon Yap",
      price_guarantee: "En Düşük Fiyat Garantisi",
    },
  },
  en: {
    common: {
      reserve: "Book Now",
      learnMore: "Learn More",
      from: "from",
      perPerson: "per person",
      loading: "Loading...",
    },
    nav: {
      balloons: "Balloon Tours",
      hotels: "Hotels",
      activities: "Activities",
      tours: "Sightseeing Tours",
      packages: "Packages",
      blog: "Blog",
      about: "About",
      contact: "Contact",
      faq: "FAQ",
    },
    hero: {
      badge: "Nevşehir / Cappadocia",
      title1: "Cappadocia's",
      title2: "Best Experiences",
      title3: "At Best Prices",
      subtitle:
        "From hot air balloon tours to hotel bookings, ATV adventures to private packages — all in one platform, transparent pricing.",
    },
    footer: {
      rights: "All rights reserved.",
      services: "Services",
      company: "Company",
      legal: "Legal",
    },
    trust: {
      refund: "100% Refund Guarantee",
      secure: "3D Secure Payment",
      insurance: "€40M Insurance",
      languages: "9 Languages",
    },
    stats: {
      operators: "Partner Operators",
      customers: "Happy Travelers",
      rating: "Average Rating",
      refund: "Refund Guarantee",
      langs: "Languages",
    },
    cta: {
      mobile: "Book Now",
      price_guarantee: "Lowest Price Guarantee",
    },
  },
} as const;

export type Dictionary = typeof DICTIONARIES.tr;

export const LOCALE_STORAGE_KEY = "tripandtick:locale";

export function isLocale(value: unknown): value is Locale {
  return value === "tr" || value === "en";
}
