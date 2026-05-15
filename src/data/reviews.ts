// Trip and Tick — musteri yorumlari (mock data).
// User verbatim: "mail isini sonraya birak (baglantisini) onun haricinde olan islemlere devam et."

export interface Review {
  id: string;
  name: string;
  country: string; // ISO 2-letter
  flag: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  textEn?: string;
  service: string;
  date: string; // YYYY-MM-DD
  avatar?: string;
}

export const REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Ayşe K.",
    country: "tr",
    flag: "🇹🇷",
    rating: 5,
    text: "Harika bir deneyimdi! Fiyatlar gerçekten rekabetçi, diğer sitelerle karşılaştırdım, en uygunu Trip and Tick oldu. Transfer dakikası dakikasına geldi.",
    service: "Balon",
    date: "2026-05-10",
    avatar: "A",
  },
  {
    id: "r2",
    name: "Mehmet Y.",
    country: "tr",
    flag: "🇹🇷",
    rating: 5,
    text: "Eşimle balayı için Kapadokya'yı seçtik. Otel rezervasyonu, balon turu ve ATV hepsini Trip and Tick'ten aldık. Her şey kusursuzdu, kesinlikle tavsiye ederim.",
    service: "Paket",
    date: "2026-05-03",
    avatar: "M",
  },
  {
    id: "r3",
    name: "Marco T.",
    country: "it",
    flag: "🇮🇹",
    rating: 5,
    text: "Esperienza incredibile! Il volo all'alba in mongolfiera era mozzafiato. Prezzo migliore trovato online, servizio impeccabile.",
    textEn:
      "Amazing experience! Booking was super easy, the price was the best we found online. The sunrise balloon flight was absolutely breathtaking.",
    service: "Balon",
    date: "2026-04-28",
    avatar: "M",
  },
  {
    id: "r4",
    name: "Laura S.",
    country: "de",
    flag: "🇩🇪",
    rating: 5,
    text: "Das Preis-Leistungs-Verhältnis ist unschlagbar. Wir haben mehrere Anbieter verglichen — Trip and Tick war mit Abstand am günstigsten und die Kommunikation auf WhatsApp war exzellent.",
    textEn:
      "The price-performance ratio is unbeatable. We compared several providers, Trip and Tick was by far the cheapest and WhatsApp communication was excellent.",
    service: "Otel",
    date: "2026-04-22",
    avatar: "L",
  },
  {
    id: "r5",
    name: "Zeynep A.",
    country: "tr",
    flag: "🇹🇷",
    rating: 4,
    text: "ATV turu çok eğlenceliydi, rehber Türkçe ve İngilizce konuştu. Tek eksik: kask birkaç kişide bol geldi. Yine de fiyata göre mükemmel.",
    service: "ATV",
    date: "2026-04-18",
    avatar: "Z",
  },
  {
    id: "r6",
    name: "Sarah J.",
    country: "gb",
    flag: "🇬🇧",
    rating: 5,
    text: "Booked the horse riding tour at sunset — truly magical experience. The team responded on WhatsApp within minutes and helped us swap our balloon date due to weather. Highly professional.",
    service: "At Binme",
    date: "2026-04-15",
    avatar: "S",
  },
  {
    id: "r7",
    name: "Emre D.",
    country: "tr",
    flag: "🇹🇷",
    rating: 5,
    text: "Aile olarak 4 kişi gittik, çocuklar 8 ve 11 yaşında. Balon için yaş sınırı net belirtilmiş, otelde aile odası ayarladılar. Şeffaf fiyat, hiç sürpriz çıkmadı.",
    service: "Balon",
    date: "2026-04-08",
    avatar: "E",
  },
  {
    id: "r8",
    name: "Pierre L.",
    country: "fr",
    flag: "🇫🇷",
    rating: 5,
    text: "Excellent service du début à la fin. La réservation en ligne était simple, le transfert depuis l'aéroport ponctuel, et le vol en montgolfière inoubliable. Je recommande vivement.",
    textEn:
      "Excellent service from start to finish. Online booking was easy, airport transfer was punctual, balloon flight unforgettable. Highly recommend.",
    service: "Tur",
    date: "2026-04-02",
    avatar: "P",
  },
  {
    id: "r9",
    name: "Selin Ö.",
    country: "tr",
    flag: "🇹🇷",
    rating: 5,
    text: "Hava yüzünden balonumuz iptal oldu, aynı gün başka tarihe alındık ekstra ücret olmadan. İade politikaları gerçek — yazılı gibi uygulandı. Güven veriyor.",
    service: "Balon",
    date: "2026-03-26",
    avatar: "S",
  },
  {
    id: "r10",
    name: "李 Wei",
    country: "cn",
    flag: "🇨🇳",
    rating: 5,
    text: "土耳其卡帕多西亚热气球太美了！预订流程简单，价格透明，全程英文沟通顺畅。绝对推荐 Trip and Tick。",
    textEn:
      "Cappadocia balloon was stunning! Booking was simple, prices transparent, English communication smooth throughout. Absolutely recommend Trip and Tick.",
    service: "Balon",
    date: "2026-03-22",
    avatar: "W",
  },
  {
    id: "r11",
    name: "Burak T.",
    country: "tr",
    flag: "🇹🇷",
    rating: 4,
    text: "Yeşil tur rehberi bilgili ve esprili. Öğle yemeği menüsü zenginleştirilebilir ama genel olarak yaşadığımız deneyim fiyatın çok üstündeydi.",
    service: "Tur",
    date: "2026-03-18",
    avatar: "B",
  },
  {
    id: "r12",
    name: "Deniz K.",
    country: "tr",
    flag: "🇹🇷",
    rating: 5,
    text: "Bir günde balon + ATV + cave otel paketi aldık. Lojistik mükemmeldi, hiç beklemedik, ekstra masraf çıkmadı. Kapadokya'ya gidecek arkadaşlarıma direkt bunu öneririm.",
    service: "Paket",
    date: "2026-03-12",
    avatar: "D",
  },
];

/**
 * Append-only helper (Faz 1) — moderation-onayli yorumlari REVIEWS dizisine
 * eklemek icin. Faz 2'de Supabase fetch ile yer degistirir.
 *
 * Caller: programatik test + Faz 2 promote-from-store akisi.
 */
export function addReview(review: Review): Review {
  REVIEWS.unshift(review);
  return review;
}

/**
 * Stabil "random" secimi: site server-render edildiginde tutarli olsun diye
 * basit deterministic shuffle (seed-tabanli) yapilabilir, fakat default'ta
 * tum review'lari donduruyoruz; component tarafinda slice/sort tercih edilir.
 */
export function pickReviews(count: number, seedKey = "default"): Review[] {
  let seed = 0;
  for (let i = 0; i < seedKey.length; i++) seed = (seed * 31 + seedKey.charCodeAt(i)) >>> 0;
  const arr = [...REVIEWS];
  for (let i = arr.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const j = seed % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(count, arr.length));
}
