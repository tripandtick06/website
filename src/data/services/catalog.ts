// Yan hizmetler statik katalog. Faz 2'de admin paneli yonetimine gecer.

export interface ServiceItem {
  slug: string;
  category: "activity" | "tour" | "hotel" | "package" | "transfer";
  name: string;
  shortDescription: string;
  duration: string;
  adultPrice: number;
  marketPrice?: number;
  currency: "EUR" | "TRY" | "USD";
  badge?: string;
  rating: number;
  reviewCount: number;
  includes: string[];
  highlights: string[];
}

export const ACTIVITIES: ServiceItem[] = [
  { slug: "atv-standart", category: "activity", name: "ATV Standart Tur", shortDescription: "2 saatlik ATV macerası — Sword Valley, Red & Rose Valley, Çavuşin, Love Valley.", duration: "2 saat", adultPrice: 29, marketPrice: 40, currency: "EUR", badge: "En Popüler", rating: 4.8, reviewCount: 1247, includes: ["ATV kullanımı", "Güvenlik ekipmanı", "Rehber eşliği", "Otel transferi"], highlights: ["4 ünlü vadi", "2 saat", "Rehber dahil"] },
  { slug: "atv-full", category: "activity", name: "ATV Full Experience", shortDescription: "4 saatlik genişletilmiş ATV macerası — tüm vadiler + Uçhisar kalesi çevresi.", duration: "4 saat", adultPrice: 55, marketPrice: 75, currency: "EUR", rating: 4.85, reviewCount: 642, includes: ["ATV", "Güvenlik ekipmanı", "Rehber", "Otel transferi", "İkram"], highlights: ["4 saat", "Tüm vadiler", "İkram dahil"] },
  { slug: "jeep-yarim", category: "activity", name: "Jeep Safari Yarım Gün", shortDescription: "3-4 saatlik Jeep Safari — Ihlara Vadisi, Selime Katedrali.", duration: "3-4 saat", adultPrice: 45, marketPrice: 60, currency: "EUR", rating: 4.75, reviewCount: 521, includes: ["Jeep", "Rehber", "Otel transferi"], highlights: ["Ihlara Vadisi", "Selime", "Rehber dahil"] },
  { slug: "jeep-tam", category: "activity", name: "Jeep Safari Tam Gün", shortDescription: "7-8 saatlik tam gün Jeep Safari — Ihlara + Derinkuyu + Güvercinlik.", duration: "7-8 saat", adultPrice: 85, marketPrice: 110, currency: "EUR", rating: 4.9, reviewCount: 384, includes: ["Jeep", "Rehber", "Transfer", "Öğle yemeği", "Giriş ücretleri"], highlights: ["Tam gün", "Yeraltı şehri", "Öğle yemeği"] },
  { slug: "at-sunrise", category: "activity", name: "Sunrise At Binme Turu", shortDescription: "1 saatlik gün doğumu at binme turu — Ürgüp vadileri.", duration: "1 saat", adultPrice: 35, marketPrice: 50, currency: "EUR", rating: 4.85, reviewCount: 432, includes: ["At kullanımı", "Rehber", "Kask", "Otel transferi"], highlights: ["Gün doğumu", "Vadi turu", "Rehber"] },
  { slug: "at-sunset", category: "activity", name: "Sunset At Binme Turu", shortDescription: "1,5 saatlik gün batımı at binme turu — panoramik manzara.", duration: "1,5 saat", adultPrice: 45, marketPrice: 65, currency: "EUR", rating: 4.9, reviewCount: 387, includes: ["At", "Rehber", "Kask", "Otel transferi", "İkram"], highlights: ["Gün batımı", "Panorama", "İkram"] },
  { slug: "at-full", category: "activity", name: "Full Experience At Binme", shortDescription: "3 saatlik geniş at binme deneyimi — kahvaltı + uzun rota + fotoğraf molası.", duration: "3 saat", adultPrice: 75, marketPrice: 100, currency: "EUR", rating: 4.92, reviewCount: 256, includes: ["At", "Rehber", "Kask", "Transfer", "Kahvaltı"], highlights: ["3 saat", "Kahvaltı", "Fotoğraf molası"] },
];

export const TOURS: ServiceItem[] = [
  { slug: "kirmizi-tur", category: "tour", name: "Kapadokya Kırmızı Tur", shortDescription: "Güneş Vadisi, Uçhisar Kalesi, Göreme Açık Hava Müzesi, Çavuşin.", duration: "Tam gün", adultPrice: 35, marketPrice: 55, currency: "EUR", badge: "En Popüler", rating: 4.85, reviewCount: 1842, includes: ["Rehber", "Transfer", "Öğle yemeği", "Giriş ücretleri"], highlights: ["UNESCO miras", "Öğle yemeği", "Rehber"] },
  { slug: "yesil-tur", category: "tour", name: "Kapadokya Yeşil Tur", shortDescription: "Ihlara Vadisi, Selime Katedrali, Derinkuyu Yeraltı Şehri.", duration: "Tam gün", adultPrice: 40, marketPrice: 60, currency: "EUR", rating: 4.8, reviewCount: 1421, includes: ["Rehber", "Transfer", "Öğle yemeği", "Giriş"], highlights: ["Yeraltı şehri", "Vadi yürüyüşü", "Öğle yemeği"] },
  { slug: "gun-batimi-turu", category: "tour", name: "Gün Batımı Turu", shortDescription: "Aktepe + Göreme panorama — şarap + ikram dahil.", duration: "3 saat", adultPrice: 25, marketPrice: 40, currency: "EUR", rating: 4.9, reviewCount: 968, includes: ["Rehber", "Transfer", "Şarap", "İkram"], highlights: ["Gün batımı", "Şarap servisi", "Panorama"] },
  { slug: "instagram-turu", category: "tour", name: "Fotoğraf & Instagram Turu", shortDescription: "Rehberli Instagram noktaları — profesyonel fotoğraf ile.", duration: "Yarım gün", adultPrice: 60, marketPrice: 85, currency: "EUR", rating: 4.88, reviewCount: 521, includes: ["Profesyonel fotoğrafçı", "Transfer", "Editlenmiş fotoğraflar"], highlights: ["Profesyonel fotoğraf", "Instagram noktaları", "Editleme dahil"] },
  { slug: "yeralti-turu", category: "tour", name: "Yeraltı Şehirleri Turu", shortDescription: "Derinkuyu + Kaymaklı yeraltı şehirleri detaylı tur.", duration: "Yarım gün", adultPrice: 30, marketPrice: 45, currency: "EUR", rating: 4.75, reviewCount: 731, includes: ["Rehber", "Transfer", "Giriş"], highlights: ["2 yeraltı şehri", "Tarihçe", "Rehber"] },
];

export const HOTELS: ServiceItem[] = [
  { slug: "magara-otel-deluxe", category: "hotel", name: "Mağara Otel Deluxe (Göreme)", shortDescription: "Otantik mağara odalı butik otel, kahvaltı dahil.", duration: "Gece başı", adultPrice: 120, marketPrice: 160, currency: "EUR", rating: 4.85, reviewCount: 943, includes: ["Mağara odası", "Kahvaltı", "Wifi", "Klima"], highlights: ["UNESCO bölgesi", "Mağara odası", "Kahvaltı"] },
  { slug: "magara-otel-suit", category: "hotel", name: "Mağara Otel Süit (Ürgüp)", shortDescription: "Premium süit, jakuzili, terasta kahvaltı.", duration: "Gece başı", adultPrice: 195, marketPrice: 260, currency: "EUR", rating: 4.95, reviewCount: 524, includes: ["Süit", "Jakuzi", "Kahvaltı", "Wifi"], highlights: ["Jakuzi", "Premium süit", "Teras"] },
  { slug: "butik-otel-standart", category: "hotel", name: "Butik Otel Standart", shortDescription: "Konforlu butik otel, modern dekor, kahvaltı dahil.", duration: "Gece başı", adultPrice: 75, marketPrice: 100, currency: "EUR", rating: 4.7, reviewCount: 1287, includes: ["Standart oda", "Kahvaltı", "Wifi"], highlights: ["Şehir merkezi", "Kahvaltı", "Modern"] },
  { slug: "resort-aile", category: "hotel", name: "Aile Resort (Nevşehir)", shortDescription: "Çocuklu aileler için resort — havuz, bahçe, aile odası.", duration: "Gece başı", adultPrice: 145, marketPrice: 195, currency: "EUR", rating: 4.8, reviewCount: 671, includes: ["Aile odası", "Havuz", "Kahvaltı", "Bahçe"], highlights: ["Çocuk dostu", "Havuz", "Bahçe"] },
];

export const PACKAGES: ServiceItem[] = [
  { slug: "tam-gun-paket", category: "package", name: "Kapadokya Tam Gün", shortDescription: "Balon + Kırmızı Tur + Akşam Yemeği — bireysel veya çift için ideal.", duration: "1 gün", adultPrice: 199, marketPrice: 280, currency: "EUR", badge: "Avantajlı", rating: 4.88, reviewCount: 612, includes: ["Standart balon", "Kırmızı tur", "Akşam yemeği", "Tüm transferler"], highlights: ["3-in-1 paket", "Avantajlı fiyat", "Tam gün"] },
  { slug: "balayi-paketi", category: "package", name: "Balayı Paketi", shortDescription: "Romantik balon + Mağara Otel 2 gece + VIP transfer.", duration: "3 gün 2 gece", adultPrice: 920, marketPrice: 1250, currency: "EUR", badge: "Premium", rating: 4.97, reviewCount: 287, includes: ["Romantik balon", "Mağara otel 2 gece", "VIP transfer", "Sürpriz dekor"], highlights: ["Romantik balon", "VIP transfer", "Sürpriz dekor"] },
  { slug: "macera-paketi", category: "package", name: "Macera Paketi (2 Gün)", shortDescription: "Balon + ATV + At Binme — genç ve aktif misafirler için.", duration: "2 gün", adultPrice: 229, marketPrice: 320, currency: "EUR", rating: 4.85, reviewCount: 471, includes: ["Standart balon", "2s ATV", "1s at binme", "Tüm transferler"], highlights: ["3 aktivite", "Aktif paket", "Rehber"] },
  { slug: "aile-paketi", category: "package", name: "Aile Paketi", shortDescription: "Standart balon + çocuk uyumlu tur + aile oteli — 2 yetişkin + 2 çocuk.", duration: "2 gün 1 gece", adultPrice: 545, marketPrice: 720, currency: "EUR", rating: 4.83, reviewCount: 312, includes: ["Standart balon", "Çocuk uyumlu tur", "Aile odası 1 gece", "Transfer"], highlights: ["Çocuk dostu", "Aile odası", "Toplam fiyat"] },
  { slug: "evlilik-teklifi", category: "package", name: "Evlilik Teklifi Paketi", shortDescription: "Özel balon + şampanya + çiçek + fotoğrafçı.", duration: "Yarım gün", adultPrice: 720, marketPrice: 950, currency: "EUR", badge: "Özel", rating: 5.0, reviewCount: 142, includes: ["Romantik balon", "Premium şampanya", "Buket", "Fotoğrafçı", "Çerçeve"], highlights: ["Özel sepet", "Fotoğrafçı", "Sürpriz dekor"] },
  { slug: "kurumsal-paket", category: "package", name: "Kurumsal Etkinlik Paketi", shortDescription: "Şirket etkinliği için grup aktiviteleri — 10+ kişi.", duration: "1-3 gün (özelleştirilebilir)", adultPrice: 165, marketPrice: 220, currency: "EUR", rating: 4.8, reviewCount: 87, includes: ["Grup balonu", "Grup turu", "Akşam yemeği", "Kurumsal organizasyon"], highlights: ["Grup indirimi", "Kurumsal", "Esnek program"] },
];

export const TRANSFERS: ServiceItem[] = [
  { slug: "nev-otel", category: "transfer", name: "Nevşehir Havalimanı → Otel", shortDescription: "Özel transfer (1-4 kişi). VIP araç seçenekli.", duration: "30-45 dk", adultPrice: 35, marketPrice: 50, currency: "EUR", rating: 4.92, reviewCount: 1842, includes: ["Özel araç", "Şoför", "Bagaj desteği"], highlights: ["Özel araç", "Otele kadar", "VIP opsiyon"] },
  { slug: "kayseri-otel", category: "transfer", name: "Kayseri Havalimanı → Otel", shortDescription: "Özel transfer (1-4 kişi). Daha uzun mesafe için ideal araç.", duration: "60-75 dk", adultPrice: 55, marketPrice: 75, currency: "EUR", rating: 4.9, reviewCount: 1456, includes: ["Özel araç", "Şoför", "Bagaj"], highlights: ["Kayseri-Kapadokya", "Konforlu", "Bagaj"] },
  { slug: "minibus-grup", category: "transfer", name: "Minibüs (5-12 kişi)", shortDescription: "Grup transferi — Nevşehir veya Kayseri'den.", duration: "30-75 dk", adultPrice: 12, marketPrice: 18, currency: "EUR", rating: 4.78, reviewCount: 723, includes: ["Minibüs", "Şoför", "Bagaj"], highlights: ["Grup indirimi", "Kişi başı fiyat", "Konforlu"] },
  { slug: "vip-arac", category: "transfer", name: "VIP Araç + Şoför (Saatlik)", shortDescription: "VIP araç ve şoför — saatlik kiralama, Kapadokya gezisi.", duration: "Saatlik", adultPrice: 35, marketPrice: 50, currency: "EUR", rating: 4.95, reviewCount: 412, includes: ["VIP araç", "Profesyonel şoför", "Yakıt"], highlights: ["VIP araç", "Saatlik esneklik", "Profesyonel şoför"] },
];

export const KAPADOKYA_PILLARS = [
  { slug: "kapadokya-balon-turu-rehberi", title: "Kapadokya Balon Turu Rehberi 2026", desc: "Fiyatlar, en iyi mevsim, operatör karşılaştırma, ipuçları." },
  { slug: "kapadokya-ne-zaman-gidilir", title: "Kapadokya Ne Zaman Gidilir?", desc: "Mevsim mevsim analiz, hava durumu, balon uçuş oranları." },
  { slug: "kapadokya-otel-tavsiye", title: "Kapadokya Otel Tavsiye", desc: "Mağara oteller, butik konaklamalar, fiyat-performans." },
  { slug: "kapadokya-aktiviteler", title: "Kapadokya'da Yapılacak 25 Aktivite", desc: "ATV, at binme, tur seçenekleri ve fiyatları." },
  { slug: "kapadokya-fotograf-noktalari", title: "Kapadokya Fotoğraf Noktaları", desc: "En iyi Instagram spotları ve çekim saatleri." },
];
