// Trip and Tick — Kapadokya balon operatörleri (tek kaynak).
//
// 2026-09-15 rewrite (trust cleanup). The previous file carried invented
// specifics about REAL third-party companies: licence numbers, founding years,
// fleet/pilot counts, phone numbers in an obvious pattern (271 0000 / 2200 /
// 3300 / 4488 / 5500 / 6677), Tripadvisor awards, passenger volumes. None of
// it had a source. Publishing fabricated facts about real businesses is both a
// legal exposure and the "scaled / deceptive content" class Google demoted
// this site for in the August 2026 spam update.
//
// Rule for this file: every field must be verifiable by us.
//   - name / aliases: how the company is actually searched (GSC 2026-09:
//     "asiana balon", "kaya balon", "universal balon", "istanbul balon
//     kapadokya", "urgup balon", "voyager balon", "air kapadokya").
//   - website: only when we fetched it live on 2026-09-15 (see `verifiedAt`).
//     asiana / aircappadocia have no verified site -> omitted.
//   - description / descriptionEn: what Trip and Tick itself offers with the
//     operator (packages come from balloons.ts operatorIds), plus the flight
//     facts that hold for every Cappadocia balloon flight (sunrise slot, daily
//     civil-aviation weather approval, hotel pickup). No numbers we cannot
//     back. Fleet size, founding year etc. are the operator's own claims —
//     link to their site instead of restating them.
//
// Importers: operatorler/page.tsx, operatorler/[id]/page.tsx,
//   OperatorlerContent.tsx, OperatorDetayContent.tsx, BalonlarContent.tsx,
//   BalonDetayContent.tsx, balonlar/[slug]/page.tsx, sitemap.ts, search.ts,
//   admin/page.tsx. balloons.ts references operators by `id` (operatorIds).

export interface Operator {
  id: string;
  /** Display name as searched in Turkish (e.g. "Asiana Balon"). */
  name: string;
  /** Other spellings people search / the company's own English name. */
  aliases: string[];
  /** One-line, verifiable positioning (what WE sell with them). */
  tagline: string;
  taglineEn: string;
  /** Honest long description — Turkish. */
  description: string;
  /** Honest long description — English (used for every non-TR locale). */
  descriptionEn: string;
  /** Operator's own site, only if fetched live by us. */
  website?: string;
  /** ISO date we last verified `website` responds. */
  verifiedAt?: string;
}

const FLIGHT_FACTS_TR =
  "Kapadokya'daki her balon uçuşu gibi bu uçuşlar da gün doğumu saatinde yapılır; " +
  "kalkış kararı her sabah Sivil Havacılık Genel Müdürlüğü'nün rüzgâr ve görüş " +
  "değerlendirmesine bağlıdır. Operatör hava nedeniyle iptal ederse ödemenizin " +
  "tamamı iade edilir veya uçuş başka bir güne alınır. Otelden alış ve otele " +
  "bırakış fiyata dahildir.";

const FLIGHT_FACTS_EN =
  "Like every balloon flight in Cappadocia, these flights take off around sunrise; " +
  "the go/no-go decision is made each morning by the Turkish civil aviation " +
  "authority based on wind and visibility. If the operator cancels for weather you " +
  "get a full refund or a new date. Hotel pickup and drop-off are included.";

const STANDARD_TR =
  "Trip and Tick üzerinden bu operatörle Standart Balon Uçuşu rezervasyonu " +
  "yapabilirsiniz: yaklaşık 60 dakikalık uçuş, 16-20 kişilik sepet, uçuş öncesi " +
  "hafif kahvaltı, iniş sonrası şampanyalı kutlama, uçuş sertifikası ve madalya, " +
  "40 milyon Euro yolcu sigortası dahildir. Fiyatlar 100 €'dan başlar; tarihinize " +
  "göre güncel fiyatı WhatsApp'tan anında öğrenebilirsiniz.";

const STANDARD_EN =
  "Through Trip and Tick you can book the Standard Balloon Flight with this " +
  "operator: about 60 minutes in the air, 16-20 passenger basket, light " +
  "pre-flight breakfast, champagne toast after landing, flight certificate and " +
  "medal, and EUR 40M passenger insurance. Prices start from EUR 100; the current " +
  "price for your date is confirmed on WhatsApp.";

const ROMANTIC_TR =
  "Ayrıca Romantik Özel Balon paketi (yalnızca iki kişilik özel sepet, evlilik " +
  "teklifi ve yıl dönümü için) bu operatörle talep üzerine fiyatlandırılır.";

const ROMANTIC_EN =
  "The Romantic Private Balloon package (a basket for two only, popular for " +
  "proposals and anniversaries) is also arranged with this operator and priced on " +
  "request.";

const NO_PACKAGE_TR =
  "Trip and Tick şu anda bu operatörle satışta olan bir paket sunmuyor; sayfayı " +
  "operatörü arayan ziyaretçiler için bilgi amaçlı tutuyoruz. Aynı gün doğumu " +
  "uçuşunu Standart paketimizle, anlaşmalı diğer operatörlerle " +
  "rezerve edebilirsiniz.";

const NO_PACKAGE_EN =
  "Trip and Tick does not currently sell a package with this operator; this page " +
  "is kept for visitors looking them up. You can book the same sunrise flight " +
  "with our Standard package through our partner operators.";

const introTr = (name: string) =>
  `${name}, Kapadokya'da gün doğumu sıcak hava balonu uçuşları düzenleyen operatörlerden biridir.`;
const introEn = (name: string) =>
  `${name} is one of the hot-air balloon operators flying sunrise flights over Cappadocia.`;

const OWN_TR =
  " Filo büyüklüğü, kuruluş yılı ve pilot kadrosu gibi bilgiler için operatörün kendi sitesine bakın.";
const OWN_EN = " For fleet size, founding year and pilot details see the operator's own site.";

export const OPERATORS: Operator[] = [
  {
    id: "kaya",
    name: "Kaya Balon",
    aliases: ["Kaya Balloons", "Kapadokya Kaya Balloons"],
    tagline: "Standart Balon Uçuşu — Trip and Tick üzerinden rezervasyon.",
    taglineEn: "Standard Balloon Flight — bookable through Trip and Tick.",
    description: `${introTr("Kaya Balon (Kaya Balloons)")} ${STANDARD_TR} ${FLIGHT_FACTS_TR}${OWN_TR}`,
    descriptionEn: `${introEn("Kaya Balloons (Kapadokya Kaya Balloons)")} ${STANDARD_EN} ${FLIGHT_FACTS_EN}${OWN_EN}`,
    website: "https://kapadokyakayaballoons.com",
    verifiedAt: "2026-09-15",
  },
  {
    id: "istanbul",
    name: "İstanbul Balon",
    aliases: ["Istanbul Balloons", "İstanbul Balloons Kapadokya"],
    tagline: "Standart Balon Uçuşu — Trip and Tick üzerinden rezervasyon.",
    taglineEn: "Standard Balloon Flight — bookable through Trip and Tick.",
    description: `${introTr("İstanbul Balon (İstanbul Balloons)")} Adına rağmen uçuşlar İstanbul'da değil Kapadokya'da, Göreme çevresinde yapılır. ${STANDARD_TR} ${FLIGHT_FACTS_TR}${OWN_TR}`,
    descriptionEn: `${introEn("İstanbul Balloons")} Despite the name, flights take place in Cappadocia around Göreme, not in Istanbul. ${STANDARD_EN} ${FLIGHT_FACTS_EN}${OWN_EN}`,
    website: "https://www.istanbulballoons.com",
    verifiedAt: "2026-09-15",
  },
  {
    id: "urgup",
    name: "Ürgüp Balon",
    aliases: ["Urgup Balloons", "Ürgüp Balloons"],
    tagline: "Ürgüp merkezli operatör — bilgi sayfası.",
    taglineEn: "Ürgüp-based operator — information page.",
    description: `${introTr("Ürgüp Balon (Ürgüp Balloons)")} ${NO_PACKAGE_TR} ${FLIGHT_FACTS_TR}${OWN_TR}`,
    descriptionEn: `${introEn("Ürgüp Balloons")} ${NO_PACKAGE_EN} ${FLIGHT_FACTS_EN}${OWN_EN}`,
    website: "https://www.urgupballoons.com",
    verifiedAt: "2026-09-15",
  },
  {
    id: "butterfly",
    name: "Butterfly Balloons",
    aliases: ["Butterfly Balon", "Butterfly Balloons Göreme"],
    tagline: "Standart ve Romantik Özel uçuşlar — Trip and Tick üzerinden.",
    taglineEn: "Standard and Romantic Private flights — through Trip and Tick.",
    description: `${introTr("Butterfly Balloons")} ${STANDARD_TR} ${ROMANTIC_TR} ${FLIGHT_FACTS_TR}${OWN_TR}`,
    descriptionEn: `${introEn("Butterfly Balloons")} ${STANDARD_EN} ${ROMANTIC_EN} ${FLIGHT_FACTS_EN}${OWN_EN}`,
    website: "https://www.butterflyballoons.com",
    verifiedAt: "2026-09-15",
  },
  {
    id: "asiana",
    name: "Asiana Balon",
    aliases: ["Asiana Balloons", "Assiana Balon", "Asiana Balloons Kapadokya"],
    tagline: "Standart Balon Uçuşu — Trip and Tick üzerinden rezervasyon.",
    taglineEn: "Standard Balloon Flight — bookable through Trip and Tick.",
    description: `${introTr("Asiana Balon (Asiana Balloons)")} ${STANDARD_TR} ${FLIGHT_FACTS_TR}`,
    descriptionEn: `${introEn("Asiana Balloons")} ${STANDARD_EN} ${FLIGHT_FACTS_EN}`,
  },
  {
    id: "turkiye",
    name: "Türkiye Balon",
    aliases: ["Turkiye Balloons", "Türkiye Balloons"],
    tagline: "Standart Balon Uçuşu — Trip and Tick üzerinden rezervasyon.",
    taglineEn: "Standard Balloon Flight — bookable through Trip and Tick.",
    description: `${introTr("Türkiye Balon (Türkiye Balloons)")} ${STANDARD_TR} ${FLIGHT_FACTS_TR}${OWN_TR}`,
    descriptionEn: `${introEn("Türkiye Balloons")} ${STANDARD_EN} ${FLIGHT_FACTS_EN}${OWN_EN}`,
    website: "https://www.turkiyeballoons.com",
    verifiedAt: "2026-09-15",
  },
  {
    id: "universal",
    name: "Universal Balon",
    aliases: ["Universal Balloons", "Universal Balloon Göreme"],
    tagline: "Göreme merkezli operatör — bilgi sayfası.",
    taglineEn: "Göreme-based operator — information page.",
    description: `${introTr("Universal Balon (Universal Balloons)")} ${NO_PACKAGE_TR} ${FLIGHT_FACTS_TR}${OWN_TR}`,
    descriptionEn: `${introEn("Universal Balloons")} ${NO_PACKAGE_EN} ${FLIGHT_FACTS_EN}${OWN_EN}`,
    website: "https://www.universalballoon.com",
    verifiedAt: "2026-09-15",
  },
  {
    id: "voyager",
    name: "Voyager Balloons",
    aliases: ["Voyager Balon", "Cappadocia Voyager Balloons"],
    tagline: "Kapadokya balon operatörü — bilgi sayfası.",
    taglineEn: "Cappadocia balloon operator — information page.",
    description: `${introTr("Voyager Balloons")} ${NO_PACKAGE_TR} ${FLIGHT_FACTS_TR}${OWN_TR}`,
    descriptionEn: `${introEn("Voyager Balloons")} ${NO_PACKAGE_EN} ${FLIGHT_FACTS_EN}${OWN_EN}`,
    website: "https://voyagerballoons.com",
    verifiedAt: "2026-09-15",
  },
  {
    id: "aircappadocia",
    name: "Air Cappadocia",
    aliases: ["Air Kapadokya", "Cappadocia Air Balloons"],
    tagline: "Kapadokya balon operatörü — bilgi sayfası.",
    taglineEn: "Cappadocia balloon operator — information page.",
    description: `${introTr("Air Cappadocia (Air Kapadokya)")} ${NO_PACKAGE_TR} ${FLIGHT_FACTS_TR}`,
    descriptionEn: `${introEn("Air Cappadocia")} ${NO_PACKAGE_EN} ${FLIGHT_FACTS_EN}`,
  },
  {
    id: "royal",
    name: "Royal Balloon",
    aliases: ["Royal Balon", "Royal Balloon Cappadocia"],
    tagline: "Romantik Özel uçuşlar — Trip and Tick üzerinden.",
    taglineEn: "Romantic Private flights — through Trip and Tick.",
    description: `${introTr("Royal Balloon")} ${ROMANTIC_TR} ${FLIGHT_FACTS_TR}${OWN_TR}`,
    descriptionEn: `${introEn("Royal Balloon")} ${ROMANTIC_EN} ${FLIGHT_FACTS_EN}${OWN_EN}`,
    website: "https://royalballoon.com",
    verifiedAt: "2026-09-15",
  },
];

export function getOperatorById(id: string): Operator | undefined {
  return OPERATORS.find((o) => o.id === id);
}

/** Locale-aware description: Turkish for tr, English for everything else. */
export function operatorDescription(op: Operator, locale: string): string {
  return locale === "tr" ? op.description : op.descriptionEn;
}

export function operatorTagline(op: Operator, locale: string): string {
  return locale === "tr" ? op.tagline : op.taglineEn;
}
