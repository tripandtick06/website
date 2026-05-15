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
}

export const BALLOON_PACKAGES: BalloonPackage[] = [
  {
    slug: "standart-balon-ucusu",
    name: "Standart Balon Uçuşu",
    shortDescription: "En ekonomik balon turu. 60+ dk uçuş, geniş sepet, %100 hava iptali iadesi.",
    longDescription:
      "Kapadokya'nın efsanevi peri bacalarını kuş bakışı izlemek için en uygun fiyatlı seçenek. Standart sepet 16-20 yolcu kapasiteli olup, profesyonel pilotlar eşliğinde 60 dakikadan fazla uçuş sunar. Otel transferi, hafif kahvaltı, 40 milyon Euro sigorta, uçuş sertifikası ve madalya, şampanya ile iniş kutlaması — hepsi fiyata dahildir.",
    duration: "60+ dk",
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
    images: ["/images/balloons/standart-1.jpg", "/images/balloons/standart-2.jpg"],
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
    ],
    minAge: 6,
    highlights: ["60+ dakika", "Sertifika dahil", "Şampanya servis"],
  },
  {
    slug: "konfor-balon-ucusu",
    name: "Konfor Balon Uçuşu",
    shortDescription: "Orta kapasite sepet (12-16 kişi), 75 dakika daha geniş ferah uçuş.",
    longDescription:
      "Daha az kalabalık sepet ister misiniz? Konfor uçuşu 12-16 yolcu ile orta kapasite sepette 75 dakikalık premium deneyim sunar. Daha geniş alan, daha rahat fotoğraf çekimi, kaliteli kahvaltı.",
    duration: "75 dk",
    durationMinutes: 75,
    capacity: { min: 12, max: 16 },
    adultPrice: 215,
    childRatio: 0.8,
    marketPrice: 260,
    currency: "EUR",
    operatorIds: ["urgup", "voyager", "universal", "aircappadocia"],
    badge: "Konfor",
    badgeColor: "primary",
    rating: 4.95,
    reviewCount: 1623,
    images: ["/images/balloons/konfor-1.jpg"],
    includes: [
      "Otelden transfer",
      "Sıcak kahvaltı",
      "40M€ sigorta",
      "Uçuş sertifikası ve madalya",
      "Şampanya servisi",
      "Daha geniş sepet",
    ],
    excludes: ["Kişisel harcamalar", "Premium fotoğraf paketi"],
    warnings: [
      "6 yaş altı çocuklar binemez",
      "Hamileler binemez",
      "Ciddi kalp veya sağlık sorunu olanlar binemez",
    ],
    minAge: 6,
    highlights: ["75 dakika", "12-16 kişi", "Sıcak kahvaltı"],
  },
  {
    slug: "deluxe-balon-ucusu",
    name: "Deluxe Balon Uçuşu",
    shortDescription: "Premium sepet (8-12 kişi), 90 dakika lüks deneyim + çerçeveli sertifika.",
    longDescription:
      "Premium balon deneyimi. 8-12 yolcu kapasiteli özel sepette 90 dakikalık uçuş, çerçeveli sertifika, gourmet kahvaltı ve VIP transfer. En seçkin operatörlerle çalışılır.",
    duration: "90 dk",
    durationMinutes: 90,
    capacity: { min: 8, max: 12 },
    adultPrice: 295,
    childRatio: 0.85,
    marketPrice: 380,
    currency: "EUR",
    operatorIds: ["royal", "butterfly", "voyager"],
    badge: "Deluxe",
    badgeColor: "warning",
    rating: 5.0,
    reviewCount: 894,
    images: ["/images/balloons/deluxe-1.jpg"],
    includes: [
      "VIP otel transferi",
      "Gourmet kahvaltı",
      "40M€ sigorta",
      "Çerçeveli uçuş sertifikası",
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
    highlights: ["90 dakika", "8-12 kişi", "Çerçeveli sertifika"],
  },
  {
    slug: "romantik-ozel-balon",
    name: "Romantik Özel Balon",
    shortDescription: "Sadece çiftler için özel sepet. Evlilik teklifi, balayı, yıldönümü.",
    longDescription:
      "Sadece 2 kişilik özel sepet veya küçük grup (max 8). Hayatın en özel anları için tasarlandı. Özel dekor, sürpriz organizasyon, fotoğrafçı, premium şampanya, kişiselleştirilmiş sertifika.",
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
    images: ["/images/balloons/romantic-1.jpg"],
    includes: [
      "VIP transfer",
      "Özel dekor",
      "Premium şampanya",
      "Profesyonel fotoğrafçı",
      "Çerçeveli sertifika",
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
  },
];

export function getBalloonPackageBySlug(slug: string): BalloonPackage | undefined {
  return BALLOON_PACKAGES.find((p) => p.slug === slug);
}
