// Aktivite detay sayfalari icin SORGU-ODAKLI SEO katmani (TR + EN).
// 2026-10-20 (w4): insanlarin gercekten yazdigi varyantlar — "kapadokya atv turu",
// "cappadocia atv tour price", "kapadokya jeep safari fiyat", "at binme" ... —
// icin title/meta + 40-60 kelimelik ilk-cevap paragrafi + FAQ (FAQPage JSON-LD gorunur
// metinle birebir) + baglamsal ic linkler.
//
// KURALLAR:
//  - Yalniz katalogda / descriptions.ts / pageFaqs.ts'te zaten yazili olgular. Uydurma yok.
//  - Net fiyat YOK: "{from}" belirteci fromPriceShort() ile "€25'dan" / "from €25" olur
//    (guard: tests/lib/from-pricing.test.ts + tests/lib/activity-seo.test.ts).
//  - Title: layout template " | Trip and Tick" ekler -> burada marka YOK, 44 karakter butce.
//  - Diger locale'ler (de, fr, ja ...) bu katmani kullanmaz; mevcut metinlere duser.

import type { Locale } from "@/lib/i18n/dictionaries";

export interface ActivitySeoFaq {
  q: string;
  a: string;
}

export interface ActivitySeoCopy {
  /** <title> govdesi (marka suffix'i layout ekler). "{from}" -> fromPriceShort. */
  title: string;
  /** meta description <=155. "{from}" belirteci kullanilabilir. */
  description: string;
  /** H1 altindaki ilk-cevap paragrafi (40-60 kelime). */
  answer: string;
  faqs: ActivitySeoFaq[];
}

export type ActivitySeoLocale = "tr" | "en";

export interface ActivitySeoEntry {
  tr: ActivitySeoCopy;
  en: ActivitySeoCopy;
  /** Baglamsal ic linkler: ayni aktivite ailesi + ilgili sayfa (slug veya kok yol). */
  related: string[];
}

/** Bu veri dosyasinin gercek son degisiklik tarihi (JSON-LD dateModified). */
export const ACTIVITY_SEO_UPDATED = "2026-10-20";

export const ACTIVITY_SEO: Record<string, ActivitySeoEntry> = {
  "atv-standart": {
    related: ["atv-sunset", "atv-sunrise", "jeep-standart"],
    tr: {
      title: "Kapadokya ATV Turu Fiyat — {from}",
      description:
        "Kapadokya ATV turu {from}: 1-2 saat, Sword, Red & Rose, Çavuşin ve Aşk Vadisi. Güvenlik ekipmanı, rehber ve otel transferi dahil. Ehliyet gerekmez.",
      answer:
        "Kapadokya ATV turu kişi başı {from} başlayan fiyatlarla 1-2 saat sürer. Rota Sword Valley, Red & Rose Valley, Çavuşin ve Aşk Vadisi'ni kapsar; güvenlik ekipmanı, rehber ve otel transferi dahildir. Gün içinde istediğiniz saatte çıkabilirsiniz, ATV ehliyeti gerekmez. Rezervasyon için WhatsApp veya iletişim formunu kullanabilirsiniz; saat ve müsaitlik rezervasyon sırasında netleşir.",
      faqs: [
        {
          q: "Kapadokya ATV turu fiyatı ne kadar?",
          a: "ATV Standart Tur kişi başı {from} başlar. Fiyata ATV, güvenlik ekipmanı, rehber eşliği ve otel transferi dahildir. Güncel fiyat ve müsaitlik için rezervasyon formundan veya WhatsApp'tan bilgi alabilirsiniz.",
        },
        {
          q: "ATV turu kaç saat sürer, hangi vadiler görülür?",
          a: "Standart ATV turu 1-2 saat sürer ve Sword Valley, Red & Rose Valley, Çavuşin ve Aşk Vadisi'ni (Love Valley) kapsar. Gün içinde herhangi bir saatte başlayabilir.",
        },
        {
          q: "ATV kullanmak için ehliyet gerekir mi, yaş sınırı var mı?",
          a: "ATV ehliyeti gerekmez; kısa bir eğitimden sonra herkes sürebilir. 16 yaş ve üzeri tek başına sürücü olabilir, 6-15 yaş arası çocuklar yetişkinin arkasında yolcu olarak katılır.",
        },
        {
          q: "ATV turuna otelden transfer dahil mi?",
          a: "Evet. Otel transferi, güvenlik ekipmanı ve rehber eşliği fiyata dahildir.",
        },
      ],
    },
    en: {
      title: "Cappadocia ATV Tour Price — {from}",
      description:
        "Cappadocia ATV tour {from}: 1-2 hours through Sword, Red & Rose, Çavuşin and Love Valley. Safety gear, guide and transfer included. No licence needed.",
      answer:
        "The Cappadocia ATV tour takes 1-2 hours starting {from} per person. The route covers Sword Valley, Red & Rose Valley, Çavuşin and Love Valley, with safety gear, a guide and hotel transfer included. You can start at any time of day, and no licence is required.",
      faqs: [
        {
          q: "How much does a Cappadocia ATV tour cost?",
          a: "The Standard ATV Tour starts {from} per person. The price includes the ATV, safety gear, a guide and hotel transfer. Ask on the booking form or WhatsApp for the current price and availability.",
        },
        {
          q: "How long is the ATV tour and which valleys do I see?",
          a: "The standard ATV tour lasts 1-2 hours and covers Sword Valley, Red & Rose Valley, Çavuşin and Love Valley. It can start at any time of day.",
        },
        {
          q: "Do I need a licence to ride an ATV, and is there an age limit?",
          a: "No ATV licence is needed; after a short briefing anyone can ride. Guests aged 16 and over can drive alone, and children aged 6-15 ride as passengers behind an adult.",
        },
        {
          q: "Is hotel transfer included in the ATV tour?",
          a: "Yes. Hotel transfer, safety gear and a guide are included in the price.",
        },
      ],
    },
  },
  "atv-sunrise": {
    related: ["atv-standart", "atv-sunset", "jeep-sunrise", "/balonlar"],
    tr: {
      title: "Gün Doğumu ATV Turu Kapadokya — {from}",
      description:
        "Gün doğumu ATV turu {from}: 2 saat, sabah ışığında Kapadokya vadileri, balon turuyla uyumlu. Güvenlik ekipmanı, rehber ve otel transferi dahil.",
      answer:
        "Gün doğumu ATV turu kişi başı {from} başlayan fiyatlarla 2 saat sürer. Sabahın ilk ışığında Kapadokya vadilerini sürersiniz; rota balon turuyla uyumludur, gökyüzü balonlarla dolarken siz vadidesiniz. Güvenlik ekipmanı, rehber ve otel transferi dahildir. Rezervasyon için WhatsApp veya iletişim formunu kullanabilirsiniz; saat ve müsaitlik rezervasyon sırasında netleşir.",
      faqs: [
        {
          q: "Gün doğumu ATV turu ne kadar?",
          a: "Sunrise ATV Turu kişi başı {from} başlar ve 2 saat sürer. ATV, güvenlik ekipmanı, rehber ve otel transferi fiyata dahildir.",
        },
        {
          q: "Gün doğumu ATV turu balon turuyla birlikte yapılabilir mi?",
          a: "Rota balon turuyla uyumlu planlanmıştır: gökyüzü balonlarla dolarken vadilerde sürersiniz. Balon uçuşu ve ATV saatlerini birlikte ayarlamak için rezervasyon sırasında bize yazın.",
        },
        {
          q: "Gün doğumu ve gün batımı ATV arasındaki fark nedir?",
          a: "İkisi de 2 saat sürer ve aynı başlangıç fiyatındadır. Gün doğumunda sabah ışığı ve sakin patikalar, gün batımında altın ışık ve panorama durakları öne çıkar.",
        },
      ],
    },
    en: {
      title: "Sunrise ATV Tour Cappadocia — {from}",
      description:
        "Sunrise ATV tour in Cappadocia {from}: 2 hours in soft morning light, pairs with a balloon flight. Safety gear, guide and hotel transfer included.",
      answer:
        "The sunrise ATV tour in Cappadocia lasts 2 hours starting {from} per person. You ride the valleys in the first light of day, and the route pairs well with a balloon flight, as the sky fills with balloons above you. Safety gear, guide and hotel transfer are included.",
      faqs: [
        {
          q: "How much is the sunrise ATV tour?",
          a: "The Sunrise ATV Tour starts {from} per person and lasts 2 hours. The ATV, safety gear, a guide and hotel transfer are included.",
        },
        {
          q: "Can I combine a sunrise ATV tour with a balloon flight?",
          a: "The route is planned to pair with a balloon flight: you ride the valleys while the sky fills with balloons. Message us when booking to line up both times.",
        },
        {
          q: "What is the difference between the sunrise and sunset ATV tours?",
          a: "Both last 2 hours and share the same starting price. Sunrise offers soft morning light and quiet trails; sunset offers golden light and panoramic photo stops.",
        },
      ],
    },
  },
  "atv-sunset": {
    related: ["atv-standart", "atv-sunrise", "jeep-sunset"],
    tr: {
      title: "Gün Batımı ATV Turu Kapadokya — {from}",
      description:
        "Gün batımı ATV turu {from}: 2 saat, altın ışıkta Kapadokya vadileri ve panorama durakları. Güvenlik ekipmanı, rehber ve otel transferi dahil.",
      answer:
        "Gün batımı ATV turu kişi başı {from} başlayan fiyatlarla 2 saat sürer ve Kapadokya'da en çok tercih edilen ATV seçeneğidir. Günbatımının altın ışığında vadilerde sürer, panoramik duraklarda fotoğraf molası verirsiniz. Güvenlik ekipmanı, rehber ve otel transferi dahildir. Rezervasyon için WhatsApp veya iletişim formunu kullanabilirsiniz; saat ve müsaitlik rezervasyon sırasında netleşir.",
      faqs: [
        {
          q: "Gün batımı ATV turu fiyatı ne kadar?",
          a: "Sunset ATV Turu kişi başı {from} başlar, 2 saat sürer. ATV, güvenlik ekipmanı, rehber ve otel transferi dahildir.",
        },
        {
          q: "Gün batımı ATV turunda fotoğraf molası var mı?",
          a: "Evet, rota panoramik duraklarda fotoğraf molası içerir; günbatımının altın ışığı peribacalarını turuncuya boyar.",
        },
        {
          q: "Gün batımı ATV mi, standart ATV mi tercih etmeliyim?",
          a: "Standart tur gün içinde istediğiniz saatte yapılır ve 1-2 saat sürer. Gün batımı turu 2 saattir; ışığın yumuşadığı saatte hem sürüş hem fotoğraf için daha elverişlidir.",
        },
      ],
    },
    en: {
      title: "Sunset ATV Tour Cappadocia — {from}",
      description:
        "Sunset ATV tour in Cappadocia {from}: 2 hours in golden light with panoramic photo stops. Safety gear, guide and hotel transfer included.",
      answer:
        "The sunset ATV tour is Cappadocia's most popular ATV choice, lasting 2 hours starting {from} per person. You ride the valleys as golden light paints the fairy chimneys orange, with photo stops at panoramic viewpoints. Safety gear, guide and hotel transfer are included.",
      faqs: [
        {
          q: "How much is the sunset ATV tour?",
          a: "The Sunset ATV Tour starts {from} per person and lasts 2 hours. The ATV, safety gear, a guide and hotel transfer are included.",
        },
        {
          q: "Are there photo stops on the sunset ATV tour?",
          a: "Yes, the route includes photo stops at panoramic viewpoints, with golden light on the fairy chimneys.",
        },
        {
          q: "Should I choose the sunset or the standard ATV tour?",
          a: "The standard tour runs at any time of day for 1-2 hours. The sunset tour is 2 hours in softer evening light, which suits both riding and photos.",
        },
      ],
    },
  },
  "jeep-standart": {
    related: ["jeep-sunset", "jeep-sunrise", "atv-standart"],
    tr: {
      title: "Kapadokya Jeep Safari Fiyat — {from}",
      description:
        "Kapadokya jeep safari {from}: 3-4 saat, Göreme vadileri panorama turu, rehber ve otel transferi dahil. Gün içi istediğiniz saatte, aileler için uygun.",
      answer:
        "Kapadokya jeep safari kişi başı {from} başlayan fiyatlarla 3-4 saat sürer. Rota Göreme vadilerinde 4x4 araçla panoramik bir tur sunar; rehber ve otel transferi dahildir. Gün içinde istediğiniz saatte başlayabilir, yaş sınırı yoktur ve çocuk koltuğu mevcuttur. Rezervasyon için WhatsApp veya iletişim formunu kullanabilirsiniz; saat ve müsaitlik rezervasyon sırasında netleşir.",
      faqs: [
        {
          q: "Kapadokya jeep safari fiyatı ne kadar?",
          a: "Jeep Safari Standart kişi başı {from} başlar ve 3-4 saat sürer. Jeep, rehber ve otel transferi dahildir.",
        },
        {
          q: "Jeep safaride yaş sınırı var mı?",
          a: "Jeep safaride yaş sınırı yoktur ve çocuk koltuğu mevcuttur; bu yüzden aileler için uygundur.",
        },
        {
          q: "Jeep safari mi ATV mi seçmeliyim?",
          a: "Jeep safari 3-4 saatlik, rehberli bir panorama turudur ve aracı siz sürmezsiniz. ATV turu 1-2 saatlik, kendi sürdüğünüz bir maceradır. Fiyatlar ikisinde de aynı başlangıç noktasındadır.",
        },
      ],
    },
    en: {
      title: "Cappadocia Jeep Safari Price — {from}",
      description:
        "Cappadocia jeep safari {from}: 3-4 hour panoramic tour of the Göreme valleys with a guide and hotel transfer. Any time of day, suitable for families.",
      answer:
        "The Cappadocia jeep safari lasts 3-4 hours starting {from} per person. It is a panoramic 4x4 tour of the Göreme valleys with a guide and hotel transfer included. You can start at any time of day, there is no age limit and child seats are available.",
      faqs: [
        {
          q: "How much does a Cappadocia jeep safari cost?",
          a: "The Standard Jeep Safari starts {from} per person and lasts 3-4 hours. The jeep, a guide and hotel transfer are included.",
        },
        {
          q: "Is there an age limit on the jeep safari?",
          a: "There is no age limit on the jeep safari and child seats are available, so it suits families.",
        },
        {
          q: "Jeep safari or ATV tour: which should I pick?",
          a: "The jeep safari is a 3-4 hour guided panorama tour where you do not drive. The ATV tour is a 1-2 hour ride you drive yourself. Both start from the same price point.",
        },
      ],
    },
  },
  "jeep-sunrise": {
    related: ["jeep-standart", "jeep-sunset", "atv-sunrise", "/balonlar"],
    tr: {
      title: "Gün Doğumu Jeep Safari Kapadokya — {from}",
      description:
        "Gün doğumu jeep safari {from}: 3-4 saat, balon manzarası noktaları ve Göreme vadileri. Rehber ve otel transferi dahil. Fotoğrafçılar için ideal.",
      answer:
        "Gün doğumu jeep safari kişi başı {from} başlayan fiyatlarla 3-4 saat sürer. 4x4 araçla önce en iyi balon manzara noktalarına çıkar, ardından Göreme vadilerinde gezinirsiniz. Rehber ve otel transferi dahildir; fotoğrafçılar için günün en etkileyici turudur. Rezervasyon için WhatsApp veya iletişim formunu kullanabilirsiniz; saat ve müsaitlik rezervasyon sırasında netleşir.",
      faqs: [
        {
          q: "Gün doğumu jeep safari ne kadar?",
          a: "Sunrise Jeep Safari kişi başı {from} başlar ve 3-4 saat sürer. Jeep, rehber ve otel transferi dahildir.",
        },
        {
          q: "Gün doğumu jeep safaride balonları görür müyüm?",
          a: "Rota, balonların gökyüzünü doldurduğu sabah saatinde en iyi balon manzara noktalarına çıkar; balonları vadilerin üzerinde fotoğraflayabilirsiniz.",
        },
        {
          q: "Gün doğumu jeep safari kaç saat sürer?",
          a: "3-4 saat sürer: önce manzara noktalarına çıkılır, sonra Göreme vadilerinde gezilir.",
        },
      ],
    },
    en: {
      title: "Sunrise Jeep Safari Cappadocia — {from}",
      description:
        "Sunrise jeep safari in Cappadocia {from}: 3-4 hours with balloon viewpoints and the Göreme valleys. Guide and hotel transfer included.",
      answer:
        "The sunrise jeep safari lasts 3-4 hours starting {from} per person. A 4x4 first climbs to the best balloon-viewing points, then winds through the Göreme valleys. A guide and hotel transfer are included, and it is the most striking tour of the day for photographers.",
      faqs: [
        {
          q: "How much is the sunrise jeep safari?",
          a: "The Sunrise Jeep Safari starts {from} per person and lasts 3-4 hours. The jeep, a guide and hotel transfer are included.",
        },
        {
          q: "Will I see the balloons on a sunrise jeep safari?",
          a: "Yes, the route heads to the best balloon-viewing points in the morning, when balloons fill the sky above the valleys.",
        },
        {
          q: "How long does the sunrise jeep safari take?",
          a: "It takes 3-4 hours: first the viewpoints, then a drive through the Göreme valleys.",
        },
      ],
    },
  },
  "jeep-sunset": {
    related: ["jeep-standart", "jeep-sunrise", "atv-sunset"],
    tr: {
      title: "Gün Batımı Jeep Safari Kapadokya — {from}",
      description:
        "Gün batımı jeep safari {from}: 3-4 saat, Göreme vadilerinde altın ışık ve en iyi gün batımı noktaları. Rehber ve otel transferi dahil.",
      answer:
        "Gün batımı jeep safari kişi başı {from} başlayan fiyatlarla 3-4 saat sürer. 4x4 araçla Göreme vadilerini dolaşır, en iyi gün batımı noktalarında durup fotoğraf çekersiniz. Rehber ve otel transferi dahildir; Kapadokya'da tercih edilen turlardan biridir. Rezervasyon için WhatsApp veya iletişim formunu kullanabilirsiniz; saat ve müsaitlik rezervasyon sırasında netleşir.",
      faqs: [
        {
          q: "Gün batımı jeep safari ne kadar?",
          a: "Sunset Jeep Safari kişi başı {from} başlar ve 3-4 saat sürer. Jeep, rehber ve otel transferi dahildir.",
        },
        {
          q: "Gün batımı jeep safaride nerelerde duruluyor?",
          a: "Göreme vadilerinde dolaşılır ve en iyi gün batımı noktalarında fotoğraf için durulur.",
        },
        {
          q: "Gün batımı jeep safarisini sıcakta mı yaparız?",
          a: "Hayır; tur gündüz sıcağının geçtiği, ışığın yumuşadığı saatte yapılır.",
        },
      ],
    },
    en: {
      title: "Sunset Jeep Safari Cappadocia — {from}",
      description:
        "Sunset jeep safari in Cappadocia {from}: 3-4 hours through the Göreme valleys in golden light with top sunset viewpoints. Guide and transfer included.",
      answer:
        "The sunset jeep safari lasts 3-4 hours starting {from} per person. A 4x4 tours the Göreme valleys and pauses at the best sunset points for photos. A guide and hotel transfer are included, and it is one of the most popular tours in Cappadocia.",
      faqs: [
        {
          q: "How much is the sunset jeep safari?",
          a: "The Sunset Jeep Safari starts {from} per person and lasts 3-4 hours. The jeep, a guide and hotel transfer are included.",
        },
        {
          q: "Where does the sunset jeep safari stop?",
          a: "It tours the Göreme valleys and pauses at the best sunset viewpoints for photos.",
        },
        {
          q: "Is the sunset jeep safari in the midday heat?",
          a: "No, it runs after the daytime heat has passed, when the light softens.",
        },
      ],
    },
  },
  "at-standart": {
    related: ["at-sunset", "at-sunrise", "atv-standart"],
    tr: {
      title: "Kapadokya At Binme Turu Fiyat — {from}",
      description:
        "Kapadokya at binme turu {from}: 1-2 saat Ürgüp vadilerinde rehberli at gezisi. At, kask ve otel transferi dahil; gün içi istediğiniz saatte.",
      answer:
        "Kapadokya at binme turu kişi başı {from} başlayan fiyatlarla 1-2 saat sürer. Rehber eşliğinde Ürgüp vadilerinde at sırtında ilerlersiniz; at, kask ve otel transferi dahildir. Gün içinde istediğiniz saatte başlayabilir, hiç ata binmemiş misafirler de katılabilir. Rezervasyon için WhatsApp veya iletişim formunu kullanabilirsiniz; saat ve müsaitlik rezervasyon sırasında netleşir.",
      faqs: [
        {
          q: "Kapadokya at binme turu fiyatı ne kadar?",
          a: "At Binme Standart kişi başı {from} başlar ve 1-2 saat sürer. At, rehber, kask ve otel transferi dahildir.",
        },
        {
          q: "Hiç ata binmediysem katılabilir miyim?",
          a: "Evet; tur rehber eşliğinde yapılır ve hiç ata binmemiş misafirler de katılabilir.",
        },
        {
          q: "At binme turu nerede yapılıyor?",
          a: "Ürgüp vadilerinde yapılır. At, kask ve otel transferi fiyata dahildir.",
        },
      ],
    },
    en: {
      title: "Cappadocia Horse Riding Price — {from}",
      description:
        "Cappadocia horse riding tour {from}: 1-2 hours guided through the Ürgüp valleys. Horse, helmet and hotel transfer included; any time of day.",
      answer:
        "The Cappadocia horse riding tour lasts 1-2 hours starting {from} per person. You ride through the Ürgüp valleys with a guide, and the horse, helmet and hotel transfer are included. It runs at any time of day, and guests who have never ridden before can join.",
      faqs: [
        {
          q: "How much does horse riding in Cappadocia cost?",
          a: "Standard Horse Riding starts {from} per person and lasts 1-2 hours. The horse, a guide, a helmet and hotel transfer are included.",
        },
        {
          q: "Can I join if I have never ridden a horse?",
          a: "Yes. The ride is guided, and guests who have never ridden before can join.",
        },
        {
          q: "Where does the horse riding tour take place?",
          a: "In the Ürgüp valleys. The horse, helmet and hotel transfer are included in the price.",
        },
      ],
    },
  },
  "at-sunrise": {
    related: ["at-standart", "at-sunset", "/balonlar"],
    tr: {
      title: "Gün Doğumu At Binme Kapadokya — {from}",
      description:
        "Gün doğumu at binme turu {from}: 1 saat, Ürgüp vadilerinde sabah ışığı ve balonlar. At, kask, rehber ve otel transferi dahil.",
      answer:
        "Gün doğumu at binme turu kişi başı {from} başlayan fiyatlarla 1 saat sürer. Sabahın sessizliğinde Ürgüp vadilerinde rehber eşliğinde ilerlerken gökyüzü balonlarla dolar. At, kask ve otel transferi dahildir; çiftler ve doğa tutkunları için sakin bir başlangıçtır. Rezervasyon için WhatsApp veya iletişim formunu kullanabilirsiniz; saat ve müsaitlik rezervasyon sırasında netleşir.",
      faqs: [
        {
          q: "Gün doğumu at binme turu ne kadar?",
          a: "Sunrise At Binme Turu kişi başı {from} başlar ve 1 saat sürer. At, rehber, kask ve otel transferi dahildir.",
        },
        {
          q: "Gün doğumunda at sırtında balonları görebilir miyim?",
          a: "Evet; tur sabah ışığında yapılır ve gökyüzü balonlarla dolarken Ürgüp vadilerinde ilerlersiniz.",
        },
        {
          q: "Gün doğumu at turu kimler için uygun?",
          a: "Romantik ve sakin bir sabah başlangıcı arayan çiftler ile doğa tutkunları için uygundur.",
        },
      ],
    },
    en: {
      title: "Sunrise Horse Riding Cappadocia — {from}",
      description:
        "Sunrise horse riding in Cappadocia {from}: 1 hour through the Ürgüp valleys in soft morning light. Horse, helmet, guide and hotel transfer included.",
      answer:
        "The sunrise horse riding tour lasts 1 hour starting {from} per person. You ride through the Ürgüp valleys with a guide in the quiet of the morning as the sky fills with balloons. The horse, helmet and hotel transfer are included, a calm start for couples and nature lovers.",
      faqs: [
        {
          q: "How much is the sunrise horse riding tour?",
          a: "The Sunrise Horse Riding Tour starts {from} per person and lasts 1 hour. The horse, a guide, a helmet and hotel transfer are included.",
        },
        {
          q: "Can I see the balloons from horseback at sunrise?",
          a: "Yes. The ride is in morning light, and the sky fills with balloons while you move through the Ürgüp valleys.",
        },
        {
          q: "Who is the sunrise horse ride suited to?",
          a: "Couples looking for a romantic, calm morning and nature lovers.",
        },
      ],
    },
  },
  "at-sunset": {
    related: ["at-standart", "at-sunrise", "atv-sunset"],
    tr: {
      title: "Gün Batımı At Binme Kapadokya — {from}",
      description:
        "Gün batımı at binme turu {from}: 1,5 saat, Ürgüp vadilerinde panoramik manzara ve altın ışık. At, kask, rehber ve otel transferi dahil.",
      answer:
        "Gün batımı at binme turu kişi başı {from} başlayan fiyatlarla 1,5 saat sürer. Ürgüp vadilerinde panoramik manzaralar eşliğinde, günbatımının altın ışığı peribacalarını sararken rehberle ilerlersiniz. At, kask ve otel transferi dahildir; sakin tempolu, fotojenik bir deneyimdir. Rezervasyon için WhatsApp veya iletişim formunu kullanabilirsiniz; saat ve müsaitlik rezervasyon sırasında netleşir.",
      faqs: [
        {
          q: "Gün batımı at binme turu ne kadar?",
          a: "Sunset At Binme Turu kişi başı {from} başlar ve 1,5 saat sürer. At, rehber, kask ve otel transferi dahildir.",
        },
        {
          q: "Gün batımı at turu romantik mi?",
          a: "Tur, günün en romantik ve fotojenik saatinde, sakin tempoda yapılır; panoramik manzara eşliğinde altın ışıkta ilerlersiniz.",
        },
        {
          q: "Gün batımı at binme turu kaç saat sürer?",
          a: "1,5 saat sürer.",
        },
      ],
    },
    en: {
      title: "Sunset Horse Riding Cappadocia — {from}",
      description:
        "Sunset horse riding in Cappadocia {from}: 1.5 hours through the Ürgüp valleys with panoramic views in golden light. Horse, helmet, guide, transfer incl.",
      answer:
        "The sunset horse riding tour lasts 1.5 hours starting {from} per person. You ride through the Ürgüp valleys with a guide, with panoramic views, as golden light wraps the fairy chimneys. The horse, helmet and hotel transfer are included, in a calm-paced, photogenic hour.",
      faqs: [
        {
          q: "How much is the sunset horse riding tour?",
          a: "The Sunset Horse Riding Tour starts {from} per person and lasts 1.5 hours. The horse, a guide, a helmet and hotel transfer are included.",
        },
        {
          q: "Is the sunset horse ride romantic?",
          a: "It runs at the most romantic and photogenic hour of the day, at a calm pace, with panoramic views in golden light.",
        },
        {
          q: "How long is the sunset horse riding tour?",
          a: "It lasts 1.5 hours.",
        },
      ],
    },
  },
  "hamam-standart": {
    related: ["hamam-deluxe", "turk-gecesi-yemekli"],
    tr: {
      title: "Kapadokya Türk Hamamı Fiyat — {from}",
      description:
        "Kapadokya Türk hamamı {from}: 90 dakika sıcak bölüm, kese, köpük masajı, sauna ve jakuzi. Çay/kahve ve otel transferi dahil.",
      answer:
        "Kapadokya'da Türk hamamı kişi başı {from} başlayan fiyatlarla 90 dakika sürer. Paket sıcak bölüm, kese, köpük masajı, sauna ve buhar odası, jakuzi ve Türk çayı veya kahveyi içerir; otel transferi dahildir. Rezervasyon için WhatsApp veya iletişim formunu kullanabilirsiniz; saat ve müsaitlik rezervasyon sırasında netleşir.",
      faqs: [
        {
          q: "Kapadokya Türk hamamı fiyatı ne kadar?",
          a: "Türk Hamamı Standart kişi başı {from} başlar ve 90 dakika sürer. Otel transferi dahildir.",
        },
        {
          q: "Standart hamam paketinde neler var?",
          a: "Sıcak bölüm, kese, köpük masajı, sauna ve buhar odası, jakuzi ile Türk çayı veya kahve ve otel transferi.",
        },
        {
          q: "Standart ve Deluxe hamam arasındaki fark nedir?",
          a: "Standart paket 90 dakikadır. Deluxe paket 2 saat sürer ve buna 30 dakika İsveç yağ masajı ile tam vücut yosun/çamur maskesi eklenir.",
        },
      ],
    },
    en: {
      title: "Cappadocia Turkish Bath Price — {from}",
      description:
        "Turkish bath (hammam) in Cappadocia {from}: 90 minutes with hot room, scrub, foam massage, sauna and jacuzzi. Tea/coffee and hotel transfer included.",
      answer:
        "A Turkish bath in Cappadocia lasts 90 minutes starting {from} per person. The package includes the hot room, scrub, foam massage, sauna and steam room, jacuzzi, and Turkish tea or coffee, with hotel transfer included. Book through WhatsApp or the contact form; time and availability are confirmed at booking.",
      faqs: [
        {
          q: "How much is a Turkish bath in Cappadocia?",
          a: "The Standard Turkish Bath starts {from} per person and lasts 90 minutes. Hotel transfer is included.",
        },
        {
          q: "What is included in the standard hammam package?",
          a: "The hot room, scrub, foam massage, sauna and steam room, jacuzzi, Turkish tea or coffee and hotel transfer.",
        },
        {
          q: "What is the difference between the Standard and Deluxe hammam?",
          a: "The Standard package is 90 minutes. The Deluxe package lasts 2 hours and adds a 30-minute Swedish oil massage and a full-body algae/mud mask.",
        },
      ],
    },
  },
  "hamam-deluxe": {
    related: ["hamam-standart", "turk-gecesi-yemekli"],
    tr: {
      title: "Hamam + Masaj Kapadokya Deluxe — {from}",
      description:
        "Kapadokya Deluxe hamam {from}: 2 saat, kese, köpük, 30 dk İsveç yağ masajı ve tam vücut maskesi. Sauna, jakuzi ve VIP transfer dahil.",
      answer:
        "Türk Hamamı Deluxe + Masaj kişi başı {from} başlayan fiyatlarla 2 saat sürer. Tam hamam paketi (kese ve köpük), 30 dakika İsveç yağ masajı ve tam vücut yosun/çamur maskesi uygulanır; sauna, jakuzi, içecek servisi ve VIP transfer dahildir. Rezervasyon için WhatsApp veya iletişim formunu kullanabilirsiniz; saat ve müsaitlik rezervasyon sırasında netleşir.",
      faqs: [
        {
          q: "Deluxe hamam ve masaj paketi ne kadar?",
          a: "Türk Hamamı Deluxe + Masaj kişi başı {from} başlar ve 2 saat sürer. VIP transfer dahildir.",
        },
        {
          q: "Deluxe pakette masaj kaç dakika?",
          a: "30 dakika İsveç yağ masajı yapılır; ayrıca tam vücut yosun/çamur maskesi uygulanır.",
        },
      ],
    },
    en: {
      title: "Cappadocia Deluxe Hammam — {from}",
      description:
        "Deluxe Turkish bath in Cappadocia {from}: 2 hours: scrub, foam, 30-minute Swedish oil massage, full-body mask. Sauna, jacuzzi, VIP transfer included.",
      answer:
        "The Deluxe Turkish Bath + Massage lasts 2 hours starting {from} per person. It includes the full bath package (scrub and foam), a 30-minute Swedish oil massage and a full-body algae/mud mask, plus sauna, jacuzzi, drinks and VIP transfer.",
      faqs: [
        {
          q: "How much is the Deluxe hammam and massage package?",
          a: "The Deluxe Turkish Bath + Massage starts {from} per person and lasts 2 hours. VIP transfer is included.",
        },
        {
          q: "How long is the massage in the Deluxe package?",
          a: "A 30-minute Swedish oil massage, plus a full-body algae/mud mask.",
        },
      ],
    },
  },
  "turk-gecesi-yemekli": {
    related: ["hamam-standart", "atv-sunset"],
    tr: {
      title: "Kapadokya Türk Gecesi Fiyat — {from}",
      description:
        "Kapadokya Türk Gecesi {from}: mağara restoranda 3 saat semah, folklor, oryantal ve Kafkas dansı, 3 çeşit yemek, sınırsız içecek. Transfer dahil.",
      answer:
        "Kapadokya Türk Gecesi kişi başı {from} başlayan fiyatlarla 3 saat sürer (20:30-23:30). Mağara restoranda semah, folklor, oryantal dans ve Kafkas dans gösterilerini izlersiniz; 3 çeşit yemek, sınırsız alkollü veya alkolsüz içecek ve otel transferi dahildir. Rezervasyon için WhatsApp veya iletişim formunu kullanabilirsiniz; saat ve müsaitlik rezervasyon sırasında netleşir.",
      faqs: [
        {
          q: "Kapadokya Türk Gecesi ne kadar?",
          a: "Türk Gecesi (Yemekli + İçecek) kişi başı {from} başlar. 3 saatlik şov, 3 çeşit yemek, sınırsız içecek ve otel transferi dahildir.",
        },
        {
          q: "Türk Gecesi saat kaçta, ne kadar sürer?",
          a: "20:30-23:30 arasında, 3 saat sürer.",
        },
        {
          q: "Türk Gecesi şovunda neler izlenir?",
          a: "Semah, yöresel Anadolu folkloru, oryantal dans, Kafkas dans şovu ve Türk Klasik Müziği; mağara restoranda sunulur.",
        },
      ],
    },
    en: {
      title: "Cappadocia Turkish Night Show — {from}",
      description:
        "Turkish Night in Cappadocia {from}: 3 hours in a cave restaurant with whirling dervish, folk and belly dance shows, 3-course dinner and unlimited drinks.",
      answer:
        "The Cappadocia Turkish Night lasts 3 hours (20:30-23:30) starting {from} per person. In a cave restaurant you watch a whirling dervish ceremony, folk, belly and Caucasian dance shows, with a 3-course dinner, unlimited drinks and hotel transfer included. Book through WhatsApp or the contact form; time and availability are confirmed at booking.",
      faqs: [
        {
          q: "How much is the Turkish Night in Cappadocia?",
          a: "The Turkish Night (Dinner + Drinks) starts {from} per person. The 3-hour show, a 3-course dinner, unlimited drinks and hotel transfer are included.",
        },
        {
          q: "What time does the Turkish Night start and how long is it?",
          a: "It runs 20:30-23:30, three hours.",
        },
        {
          q: "What is performed at the Turkish Night?",
          a: "A whirling dervish (sema) ceremony, Anatolian folk, belly dance, a Caucasian dance show and Turkish classical music, in a cave restaurant.",
        },
      ],
    },
  },
  "microlight-standart": {
    related: ["microlight-deluxe", "/balonlar"],
    tr: {
      title: "Kapadokya Microlight Uçuşu Fiyat — {from}",
      description:
        "Kapadokya microlight uçuşu {from}: 15-18 dakika pilotla uçuş, sertifika, ekipman, fotoğraf çekimi ve özel transfer dahil.",
      answer:
        "Kapadokya microlight uçuşu kişi başı {from} başlayan fiyatlarla 15-18 dakika sürer (operasyonla birlikte yaklaşık 1 saat). Profesyonel pilotla vadilerin üzerinde uçarsınız; uçuş sertifikası, ekipman, fotoğraf çekimi ve özel transfer dahildir. Rezervasyon için WhatsApp veya iletişim formunu kullanabilirsiniz; saat ve müsaitlik rezervasyon sırasında netleşir.",
      faqs: [
        {
          q: "Kapadokya microlight uçuşu ne kadar?",
          a: "Microlight Standart Uçuş kişi başı {from} başlar. 15-18 dakikalık uçuş, uçuş sertifikası, ekipman, fotoğraf çekimi ve özel transfer dahildir.",
        },
        {
          q: "Microlight uçuşu kaç dakika sürer?",
          a: "Standart uçuş 15-18 dakikadır; hazırlık ve operasyonla birlikte yaklaşık 1 saat ayrılmalıdır.",
        },
        {
          q: "Standart ve Deluxe microlight arasındaki fark nedir?",
          a: "Deluxe uçuş 30-35 dakikadır, daha uzun rota ve premium fotoğraf paketi içerir.",
        },
      ],
    },
    en: {
      title: "Cappadocia Microlight Flight — {from}",
      description:
        "Microlight flight in Cappadocia {from}: 15-18 minutes with a pilot, flight certificate, equipment, photos and private transfer included.",
      answer:
        "The Cappadocia microlight flight lasts 15-18 minutes (about 1 hour including operations) starting {from} per person. You fly over the valleys with a professional pilot, and the flight certificate, equipment, photos and private transfer are included. Book through WhatsApp or the contact form; time and availability are confirmed at booking.",
      faqs: [
        {
          q: "How much is a microlight flight in Cappadocia?",
          a: "The Standard Microlight Flight starts {from} per person. The 15-18 minute flight, certificate, equipment, photos and private transfer are included.",
        },
        {
          q: "How long is the microlight flight?",
          a: "The standard flight is 15-18 minutes; allow about 1 hour including preparation and operations.",
        },
        {
          q: "What is the difference between Standard and Deluxe microlight?",
          a: "The Deluxe flight is 30-35 minutes with a longer route and a premium photo package.",
        },
      ],
    },
  },
  "microlight-deluxe": {
    related: ["microlight-standart", "/balonlar"],
    tr: {
      title: "Kapadokya Microlight Deluxe Uçuş — {from}",
      description:
        "Kapadokya Deluxe microlight {from}: 30-35 dakika uzun rota, daha fazla vadi, premium fotoğraf paketi, sertifika ve VIP transfer dahil.",
      answer:
        "Microlight Deluxe uçuş kişi başı {from} başlayan fiyatlarla 30-35 dakika sürer (operasyonla birlikte yaklaşık 1 saat). Profesyonel pilotla uzun rotada daha fazla vadi ve peribaca üzerinde uçarsınız; premium fotoğraf paketi, uçuş sertifikası ve VIP transfer dahildir. Rezervasyon için WhatsApp veya iletişim formunu kullanabilirsiniz; saat ve müsaitlik rezervasyon sırasında netleşir.",
      faqs: [
        {
          q: "Microlight Deluxe uçuş ne kadar?",
          a: "Microlight Deluxe Uçuş kişi başı {from} başlar. 30-35 dakikalık uçuş, sertifika, premium fotoğraf paketi ve VIP transfer dahildir.",
        },
        {
          q: "Deluxe uçuş standart uçuştan neden uzun?",
          a: "Daha uzun rotada tüm Kapadokya üzerinde daha fazla vadi ve kaya oluşumu görülür.",
        },
      ],
    },
    en: {
      title: "Cappadocia Deluxe Microlight — {from}",
      description:
        "Deluxe microlight flight in Cappadocia {from}: 30-35 minute long route over more valleys, premium photo package, certificate and VIP transfer included.",
      answer:
        "The Deluxe Microlight Flight lasts 30-35 minutes (about 1 hour including operations) starting {from} per person. On the longer route with a professional pilot you fly over more valleys and fairy chimneys, with a premium photo package, certificate and VIP transfer included.",
      faqs: [
        {
          q: "How much is the Deluxe microlight flight?",
          a: "The Deluxe Microlight Flight starts {from} per person. The 30-35 minute flight, certificate, premium photo package and VIP transfer are included.",
        },
        {
          q: "Why is the Deluxe flight longer than the standard one?",
          a: "The longer route covers more valleys and rock formations across Cappadocia.",
        },
      ],
    },
  },
  "balon-flying-dress-cekimi": {
    related: ["/balonlar", "microlight-deluxe"],
    tr: {
      title: "Balon + Flying Dress Çekimi — {from}",
      description:
        "Kapadokya balon ve flying dress fotoğraf çekimi {from}: gün doğumu standart balon uçuşu, 30 dakikalık özel çekim, 20 düzenlenmiş dijital fotoğraf.",
      answer:
        "Balon + Flying Dress fotoğraf çekimi kişi başı {from} başlayan fiyatlarla sunulur. Gün doğumunda standart balon uçuşunun ardından fotoğrafçınız sepet içinde ve vadi manzarasının önünde 30 dakikalık özel çekim yapar; en iyi karelerden 20'si düzenlenerek dijital teslim edilir. Rezervasyon için WhatsApp veya iletişim formunu kullanabilirsiniz; saat ve müsaitlik rezervasyon sırasında netleşir.",
      faqs: [
        {
          q: "Balon + Flying Dress çekimi ne kadar?",
          a: "Balon + Flying Dress Fotoğraf Çekimi kişi başı {from} başlar. Standart balon uçuşu ve özel fotoğraf çekimi birlikte sunulur.",
        },
        {
          q: "Çekimde kaç fotoğraf teslim ediliyor?",
          a: "30 dakikalık özel çekimden en iyi 20 kare düzenlenerek dijital olarak teslim edilir.",
        },
      ],
    },
    en: {
      title: "Balloon Flying Dress Photoshoot — {from}",
      description:
        "Cappadocia balloon and flying dress photoshoot {from}: sunrise standard balloon flight, a private 30-minute shoot and 20 edited digital photos.",
      answer:
        "The Balloon + Flying Dress photoshoot starts {from} per person. After a sunrise flight in a standard basket, your photographer runs a private 30-minute shoot in the basket against the valley view, and 20 of the best frames are edited and delivered digitally.",
      faqs: [
        {
          q: "How much is the balloon and flying dress photoshoot?",
          a: "The Balloon + Flying Dress Photoshoot starts {from} per person. A standard balloon flight and the private shoot come together.",
        },
        {
          q: "How many photos do I receive?",
          a: "20 of the best frames from the 30-minute private shoot are edited and delivered digitally.",
        },
      ],
    },
  },
};

export function getActivitySeo(slug: string, locale: Locale): ActivitySeoCopy | undefined {
  const entry = ACTIVITY_SEO[slug];
  if (!entry) return undefined;
  if (locale === "tr") return entry.tr;
  if (locale === "en") return entry.en;
  return undefined;
}
