// Balon paket katalogu — admin paneliyle dinamik olacak (Faz 2). Faz 1 statik.

export type Currency = "EUR" | "TRY" | "USD";

export interface BalloonPackage {
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  duration: string;
  durationMinutes: number;
  capacity: { min: number; max: number };
  adultPrice: number;
  childRatio: number;
  marketPrice: number;
  currency: Currency;
  operatorIds: string[];
  badge: string;
  badgeColor: "accent" | "success" | "warning" | "primary";
  rating: number;
  reviewCount: number;
  images: string[];
  includes: string[];
  excludes: string[];
  warnings: string[];
  minAge: number;
  highlights: string[];
  // Fiyat gizli — UI "Özel fiyat sorunuz" CTA gosterir (telefon/WhatsApp).
  priceOnRequest?: boolean;
  // Standart balon icin: > 7 gun catalog adultPrice; <= 7 gun admin /admin/fiyat override.
  dynamicPricing?: boolean;
}

export const BALLOON_PACKAGES: BalloonPackage[] = [
  {
    slug: "standart-balon-ucusu",
    name: "Standart Balon Uçuşu",
    shortDescription: "En ekonomik balon turu. 60 dk uçuş, geniş sepet, %100 hava iptali iadesi.",
    longDescription:
      "Kapadokya'nın peri bacalarını, vadilerini ve gün doğumunu kuş bakışı görmenin en uygun fiyatlı yolu. Uçuş yaklaşık 60 dakika sürer; 16-20 kişilik geniş sepette profesyonel pilot eşliğinde uçarsınız. Otelden alış gün doğumundan yaklaşık bir saat önce yapılır; kalkış alanında hafif kahvaltı, iniş sonrası şampanyalı kutlama, uçuş sertifikası ve madalya, 40 milyon Euro yolcu sigortası ve otele dönüş transferi fiyata dahildir. Bu paketi Kaya, İstanbul, Butterfly, Asiana ve Türkiye Balon ile uçuruyoruz; operatör, uçuş gününe ve doluluğa göre atanır. 6 yaş altı çocuklar, hamileler ve ciddi kalp/sağlık sorunu olanlar uçamaz. Kalkış kararı her sabah sivil havacılık otoritesi tarafından verilir; hava nedeniyle iptalde ödemenin tamamı iade edilir veya uçuş başka bir güne alınır. 7 günden uzak tarihlerde katalog fiyatı, 7 gün içinde hava ve doluluğa göre güncel fiyat geçerlidir.",
    duration: "60 dk",
    durationMinutes: 60,
    capacity: { min: 16, max: 20 },
    adultPrice: 165,
    childRatio: 0.8,
    marketPrice: 200,
    currency: "EUR",
    operatorIds: ["kaya", "istanbul", "butterfly", "asiana", "turkiye"],
    badge: "En Popüler",
    badgeColor: "accent",
    rating: 4.9,
    reviewCount: 2847,
    images: ["/images/balloons/standart-balon-ucusu.jpg"],
    includes: [
      "Otelden transfer",
      "Hafif kahvaltı",
      "40M€ sigorta",
      "Uçuş sertifikası ve madalya",
      "Şampanya ile iniş kutlaması",
      "Profesyonel pilot",
    ],
    excludes: ["Kişisel harcamalar", "Fotoğraf paketi (opsiyonel)"],
    warnings: [
      "6 yaş altı çocuklar binemez",
      "Hamileler binemez",
      "Ciddi kalp veya sağlık sorunu olanlar binemez",
      "Hava durumuna bağlı iptal — operatör iptalinde %100 iade",
      "Fiyat 7 gün içi günlük değişebilir (hava şartları + yoğunluk)",
    ],
    minAge: 6,
    highlights: ["60 dakika", "Sertifika dahil", "Şampanya servis"],
    dynamicPricing: true,
  },
  {
    slug: "deluxe-balon-ucusu",
    name: "Deluxe Balon Uçuşu",
    shortDescription: "Küçük sepet (max 16 kişi), 60 dakika lüks deneyim + karton sertifika.",
    longDescription:
      "Daha az yolcu, daha çok yer ve daha özenli servis isteyenler için. Deluxe uçuş da yaklaşık 60 dakika sürer ama sepet en fazla 16 kişiliktir; herkes kenarda, manzaraya dönük durur. Otelden VIP transferle alınır, kalkış alanında gourmet kahvaltı sunulur, inişte premium şampanya açılır; karton uçuş sertifikası, profesyonel fotoğraf çekimi ve 40 milyon Euro yolcu sigortası dahildir. Bu paketi Royal Balloon, Butterfly Balloons ve Voyager Balloons ile uçuruyoruz. 6 yaş altı çocuklar, hamileler ve ciddi kalp/sağlık sorunu olanlar uçamaz. Kalkış kararı her sabah sivil havacılık otoritesi tarafından verilir; hava nedeniyle iptalde ödemenin tamamı iade edilir veya uçuş başka bir güne alınır. Balayı, doğum günü ve küçük gruplar için Standart ile Romantik Özel arasındaki en dengeli seçenektir.",
    duration: "60 dk",
    durationMinutes: 60,
    capacity: { min: 8, max: 16 },
    adultPrice: 295,
    childRatio: 0.85,
    marketPrice: 380,
    currency: "EUR",
    operatorIds: ["royal", "butterfly", "voyager"],
    badge: "Deluxe",
    badgeColor: "warning",
    rating: 5.0,
    reviewCount: 894,
    images: ["/images/balloons/deluxe-balon-ucusu.jpg"],
    includes: [
      "VIP otel transferi",
      "Gourmet kahvaltı",
      "40M€ sigorta",
      "Karton uçuş sertifikası",
      "Premium şampanya",
      "Profesyonel fotoğraf çekimi",
    ],
    excludes: ["Kişisel harcamalar"],
    warnings: [
      "6 yaş altı çocuklar binemez",
      "Hamileler binemez",
      "Ciddi kalp veya sağlık sorunu olanlar binemez",
    ],
    minAge: 6,
    highlights: ["60 dakika", "Küçük sepet (max 16)", "Karton sertifika"],
  },
  {
    slug: "romantik-ozel-balon",
    name: "Romantik Özel Balon",
    shortDescription: "Sadece çiftler için özel sepet. Evlilik teklifi, balayı, yıldönümü. Özel fiyat sorunuz.",
    longDescription:
      "Sepette yalnızca siz ve pilotunuz: evlilik teklifi, balayı, yıl dönümü veya sürpriz kutlama için tasarlanmış özel uçuş. İki kişilik özel sepet ya da en fazla 8 kişilik küçük grup seçilebilir; uçuş 60-90 dakika sürer. Otelden VIP transfer, kalkış alanında gourmet kahvaltı, inişte premium şampanya, kişiselleştirilmiş sertifika, profesyonel fotoğrafçı, isteğe göre özel dekor ve sürpriz organizasyon ile 40 milyon Euro yolcu sigortası dahildir. Bu paketi Royal Balloon ve Butterfly Balloons ile düzenliyoruz. Her organizasyon kişiye özel hazırlandığı için fiyat teklif üzerine verilir; tarihinizi ve isteğinizi WhatsApp'tan yazın, aynı gün teklif alın. 6 yaş altı çocuklar, hamileler ve ciddi kalp/sağlık sorunu olanlar uçamaz. Kalkış kararı her sabah sivil havacılık otoritesi tarafından verilir; hava nedeniyle iptalde ödemenin tamamı iade edilir veya uçuş konaklamanızdaki başka bir güne alınır.",
    duration: "60-90 dk",
    durationMinutes: 75,
    capacity: { min: 2, max: 8 },
    adultPrice: 580,
    childRatio: 0.9,
    marketPrice: 750,
    currency: "EUR",
    operatorIds: ["royal", "butterfly"],
    badge: "Romantik",
    badgeColor: "accent",
    rating: 5.0,
    reviewCount: 412,
    images: ["/images/balloons/romantik-ozel-balon.jpg"],
    includes: [
      "VIP transfer",
      "Özel dekor",
      "Premium şampanya",
      "Profesyonel fotoğrafçı",
      "Karton sertifika",
      "Sürpriz organizasyon",
    ],
    excludes: ["Yüzük (evlilik teklifi paketi varsa)"],
    warnings: [
      "Çocuk binemez (özel sepet)",
      "Hamileler binemez",
      "Ciddi kalp veya sağlık sorunu olanlar binemez",
    ],
    minAge: 16,
    highlights: ["Sadece çiftler", "Özel dekor", "Fotoğrafçı dahil"],
    priceOnRequest: true,
  },
];

export function getBalloonPackageBySlug(slug: string): BalloonPackage | undefined {
  return BALLOON_PACKAGES.find((p) => p.slug === slug);
}
