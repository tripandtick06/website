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
    hero_trust: {
      refund: "%100 İade Garantisi",
      insurance: "40M€ Sigorta",
      operators: "9+ Operatör",
      tursab: "TÜRSAB Lisanslı",
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
    categories: {
      tag: "Hizmetlerimiz",
      title: "Her Şey Tek Yerden",
      subtitle:
        "Uçak bileti hariç, Kapadokya'da ihtiyacınız olan her seyahat hizmeti burada.",
      balloons: "Balon Turları",
      balloons_sub: "€165'ten başlayan",
      hotels: "Otel & Konaklama",
      hotels_sub: "Mağara otellerinden resort'lara",
      transfer: "Transfer",
      transfer_sub: "Havalimanı & Şehirlerarası",
      atv: "ATV Turları",
      atv_sub: "$29'dan başlayan",
      tours: "Gezi Turları",
      tours_sub: "Kırmızı & Yeşil Tur",
      packages: "Özel Paketler",
      packages_sub: "Balayı, teklif, doğum günü",
      horse: "At Binme",
      horse_sub: "Gün doğumu & batımı",
      insurance: "Seyahat Sigortası",
      insurance_sub: "Kapsamlı güvence",
    },
    packages_section: {
      tag: "Öne Çıkan Paketler",
      title: "En Çok Tercih Edilenler",
      subtitle:
        "Rakip fiyatları karşılaştırdık, en iyi teklifleri sizin için seçtik.",
      standart_badge: "En Popüler",
      standart_title: "Standart Balon Uçuşu",
      balayi_badge: "Deluxe",
      balayi_title: "Romantik Balayı Paketi",
      macera_badge: "Macera",
      macera_title: "Macera Paketi (2 Gün)",
      reserve: "Rezervasyon",
      market_price: "Piyasa",
    },
    not_found: {
      title: "Bu Sayfa Balona Bindi",
      message:
        "Aradığınız sayfa balona bindi ve geri dönmedi 🎈 Endişelenmeyin — sizi en güzel destinasyonlara götürelim.",
      suggestions_title: "Belki bunları arıyorsunuz",
      search_placeholder: "Ne aramıştınız?",
      back: "Geri Dön",
      home: "Ana Sayfa",
      suggestions: {
        balonlar: "Balon Turları",
        aktiviteler: "Aktiviteler",
        turlar: "Gezi Turları",
        paketler: "Paketler",
        sss: "SSS",
        iletisim: "İletişim",
      },
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
    hero_trust: {
      refund: "100% Refund Guarantee",
      insurance: "€40M Insurance",
      operators: "9+ Operators",
      tursab: "TÜRSAB Licensed",
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
    categories: {
      tag: "Our Services",
      title: "Everything in One Place",
      subtitle:
        "Excluding flights, every travel service you need in Cappadocia is right here.",
      balloons: "Balloon Tours",
      balloons_sub: "from €165",
      hotels: "Hotels & Stays",
      hotels_sub: "Cave hotels to resorts",
      transfer: "Transfer",
      transfer_sub: "Airport & intercity",
      atv: "ATV Tours",
      atv_sub: "from $29",
      tours: "Sightseeing Tours",
      tours_sub: "Red & Green Tours",
      packages: "Special Packages",
      packages_sub: "Honeymoon, proposal, birthday",
      horse: "Horse Riding",
      horse_sub: "Sunrise & sunset",
      insurance: "Travel Insurance",
      insurance_sub: "Comprehensive cover",
    },
    packages_section: {
      tag: "Featured Packages",
      title: "Most Popular Picks",
      subtitle:
        "We compared competitor pricing and curated the best deals for you.",
      standart_badge: "Most Popular",
      standart_title: "Standard Balloon Flight",
      balayi_badge: "Deluxe",
      balayi_title: "Romantic Honeymoon Package",
      macera_badge: "Adventure",
      macera_title: "Adventure Package (2 Days)",
      reserve: "Book",
      market_price: "Market",
    },
    not_found: {
      title: "This Page Took Off",
      message:
        "The page you are looking for took off in a balloon and never came back 🎈 Don't worry — let us take you to the best destinations.",
      suggestions_title: "Maybe you were looking for",
      search_placeholder: "What were you looking for?",
      back: "Go Back",
      home: "Home",
      suggestions: {
        balonlar: "Balloon Tours",
        aktiviteler: "Activities",
        turlar: "Sightseeing Tours",
        paketler: "Packages",
        sss: "FAQ",
        iletisim: "Contact",
      },
    },
  },
} as const;

export type Dictionary = typeof DICTIONARIES.tr;

export const LOCALE_STORAGE_KEY = "tripandtick:locale";

export function isLocale(value: unknown): value is Locale {
  return value === "tr" || value === "en";
}
