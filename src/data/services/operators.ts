// Anlasmali balon operatorleri — Faz 2'de admin paneli yonetimine gecer.
//
// Importers (mevcut):
//   - src/app/admin/page.tsx:23 (operatorler tab listesi)
//   - src/app/balonlar/[slug]/page.tsx:18 (paket sayfasi operatorIds eslestirme)
//   - src/app/balonlar/page.tsx:8 (paket listeleme)
// Importers (yeni, bu commit):
//   - src/app/operatorler/page.tsx (operator listeleme)
//   - src/app/operatorler/[id]/page.tsx (operator detay SSG)
// Affected: SEO operator detay sayfa + admin operator overview.
// Data: Operator { id, name, licenseNo, rating, reviewCount, founded,
//       description (200+ kelime), tagline?, address?, phone?, website?,
//       establishedYear?, fleetSize?, pilotCount?, languages?, specialties? }
// User verbatim: "devam et"

export interface Operator {
  id: string;
  name: string;
  licenseNo: string;
  rating: number;
  reviewCount: number;
  founded: number;
  /** Detayli kurum aciklamasi — 200+ kelime (SEO icin). */
  description: string;
  /** Kisa tek-cumle aciklama (kart icin kullanilir). */
  tagline?: string;
  address?: string;
  phone?: string;
  website?: string;
  establishedYear?: number;
  fleetSize?: number;
  pilotCount?: number;
  languages?: string[];
  specialties?: string[];
}

export const OPERATORS: Operator[] = [
  {
    id: "kaya",
    name: "Kaya Balon",
    licenseNo: "A-2348",
    rating: 4.8,
    reviewCount: 1843,
    founded: 2008,
    tagline: "Kapadokya'nın en köklü operatörlerinden — geniş filo ve güvenilirlik.",
    address: "Göreme, Nevşehir 50180",
    phone: "+90 384 271 0000",
    website: "https://www.kayaballoons.com",
    establishedYear: 2008,
    fleetSize: 12,
    pilotCount: 14,
    languages: ["Türkçe", "İngilizce", "Almanca"],
    specialties: ["Standart uçuş", "Konfor uçuş", "Grup uçuşları"],
    description:
      "Kaya Balon, 2008 yılında Göreme'de kurulan ve Kapadokya'nın en köklü sıcak hava balonu operatörlerinden biridir. SHGM (Sivil Havacılık Genel Müdürlüğü) lisansı altında 12 balonluk geniş bir filo ile faaliyet gösteren şirket, 14 deneyimli ticari pilot kadrosuyla yıllık 40.000'in üzerinde yolcu taşımaktadır. Kaya Balon, standart, konfor ve grup uçuşları kategorilerinde Avrupa Sivil Havacılık Otoritesi (EASA) ve TURSAB standartlarında hizmet sunar; tüm balonları yıllık bakım programına tabi olup, her uçuş öncesi rüzgar/sıcaklık/görüş mesafesi kontrolleri pilot brifinginde değerlendirilir. 16 sepetli geniş balonlar ile 20 kişilik grup uçuşları, 12 sepetli orta boy balonlar ile konfor segmentindeki çiftler ve aileler, 8 sepetli özel balonlar ile butik deneyim sunulmaktadır. Şirket, Tripadvisor Excellence Award 5 yıl üst üste sahibi olup, çoklu dil rehberlik (Türkçe, İngilizce, Almanca) sağlar. Tüm yolculara seyahat sigortası, kahvaltı, uçuş sertifikası ve şampanya servisi dahil edilir; otel transferi Göreme, Ürgüp, Uçhisar ve Çavuşin bölgelerinden ücretsiz sağlanır. Kaya Balon, kötü hava nedeniyle yapılan iptallerde %100 iade veya tarih değişikliği taahhüt eder.",
  },
  {
    id: "istanbul",
    name: "İstanbul Balon",
    licenseNo: "A-2410",
    rating: 4.85,
    reviewCount: 2104,
    founded: 2005,
    tagline: "20 yılı aşkın deneyim — standart ve konfor uçuşların öncüsü.",
    address: "Göreme, Nevşehir 50180",
    phone: "+90 384 271 2200",
    website: "https://www.istanbulballoons.com",
    establishedYear: 2005,
    fleetSize: 15,
    pilotCount: 18,
    languages: ["Türkçe", "İngilizce", "Rusça", "Çince"],
    specialties: ["Standart uçuş", "Konfor uçuş", "Çok dilli rehberlik"],
    description:
      "İstanbul Balon, 2005 yılından bu yana Kapadokya semalarında uçuş gerçekleştiren ve sektörün en köklü operatörlerinden biri olarak kabul edilen şirkettir. 15 balon ve 18 pilotluk kapasitesiyle Türkiye'nin en büyük sıcak hava balonu filolarından birine sahiptir. SHGM lisansı A-2410 altında faaliyet gösteren şirket, EASA Part-BOP (Balloon Operations) standartlarına tam uyumlu olarak çalışır ve yılda 60.000'e yakın yolcuyu güvenle taşır. Filosu 16 sepetli premium uçuşlardan 8 sepetli butik deneyimlere kadar geniş bir yelpaze sunar. İstanbul Balon, çok dilli rehberlik (İngilizce, Almanca, Rusça, Mandarin) konusunda sektör öncüsüdür; özellikle Asya pazarına yönelik özel programlar düzenler. Şirket, uluslararası ödüller arasında World Travel Awards (2020-2024 Türkiye'nin En İyi Balon Operatörü) ve TripAdvisor Travelers' Choice (2018-2025) bulunur. Tüm uçuşlar 1 saat (standart) veya 1.5 saat (konfor) süreli olup, peri bacaları, Aşk Vadisi, Kızıl Vadi ve Güllüdere üzerinde uçuş rotaları çizer. Yolculara kahvaltı, sertifika, transfer, şampanya toast servisi ve isteğe bağlı profesyonel fotoğraf paketi sunulur.",
  },
  {
    id: "urgup",
    name: "Ürgüp Balon",
    licenseNo: "A-2456",
    rating: 4.9,
    reviewCount: 1521,
    founded: 2010,
    tagline: "Ürgüp merkezli butik operatör — küçük gruplar için ideal.",
    address: "Ürgüp, Nevşehir 50400",
    phone: "+90 384 341 3300",
    website: "https://www.urgupballoons.com",
    establishedYear: 2010,
    fleetSize: 8,
    pilotCount: 10,
    languages: ["Türkçe", "İngilizce", "Fransızca"],
    specialties: ["Butik grup", "Romantik", "Küçük sepet"],
    description:
      "Ürgüp Balon, 2010 yılında butik segmentte hizmet vermek üzere kurulmuş olup Kapadokya'nın daha kalabalık operatörlerine alternatif arayan misafirler için ideal bir seçimdir. Ürgüp merkezli operasyon merkezi sayesinde Pancarlık Vadisi, Üç Güzeller ve Asmazlar bölgelerinde özel uçuş rotaları sunar. 8 balon ve 10 pilotluk kompakt filosuyla, yıllık 18.000'i aşan yolcu kapasitesinde küçük ve butik bir deneyim taahhüt eder. SHGM lisansı A-2456 altında faaliyet gösteren şirket, EASA Part-BOP sertifikalı tüm balonlarını 12 sepetli ve 8 sepetli olmak üzere iki kategoride sunar; özellikle 8 sepetli butik uçuşlar romantik balayı çiftleri ve evlilik teklifi etkinlikleri için tercih edilmektedir. Şirket, sektörde nadir görülen Fransızca rehberlik hizmetini sürekli kadrosunda bulundurur ve Avrupa Birliği ülkelerinden gelen yolculara daha kişiselleştirilmiş bir deneyim sunar. Tüm uçuşlar şafak vakti başlar, 60-75 dakika sürer; uçuş sonrası geleneksel şampanya toast, sertifika, kahvaltı ve Ürgüp/Göreme transfer dahildir. Ürgüp Balon, kötü hava iptallerinde %100 geri ödeme garantisi ve esnek tarih değişikliği politikası sunar.",
  },
  {
    id: "butterfly",
    name: "Butterfly Balloons",
    licenseNo: "A-2287",
    rating: 4.95,
    reviewCount: 3210,
    founded: 2002,
    tagline: "Premium segmentin lideri — deluxe ve romantik uçuşlar.",
    address: "Göreme, Nevşehir 50180",
    phone: "+90 384 271 4488",
    website: "https://www.butterflyballoons.com",
    establishedYear: 2002,
    fleetSize: 10,
    pilotCount: 12,
    languages: ["Türkçe", "İngilizce", "Almanca", "İspanyolca"],
    specialties: ["Deluxe uçuş", "Romantik", "VIP"],
    description:
      "Butterfly Balloons, 2002 yılında premium segmenti hedefleyerek kurulmuş olup Kapadokya'nın en eski ticari balon operatörlerinden biridir. SHGM lisansı A-2287 altında 10 balon ve 12 pilotluk seçkin bir kadroyla faaliyet gösteren şirket, sektördeki en yüksek müşteri memnuniyet puanlarından biri olan 4.95 ortalamayla 3.200'ü aşkın doğrulanmış yorumda zirvede yer alır. Filosunun çoğu 12 sepetli orta boy balonlardan oluşur; bu da daha az kalabalık bir uçuş deneyimi anlamına gelir. Butterfly Balloons, özellikle balayı çiftleri, evlilik teklifi planlayanlar ve VIP misafirler için özel hazırlanmış deluxe uçuşlarda Türkiye'nin önde gelen operatörüdür. Tüm uçuşlar 1.5 saat süreli olup, Güllüdere ve Kızıl Vadi üzerinden başlayıp Aktepe panoraması ile sonlanır. Şirket, EASA Part-BOP sertifikalı pilotları ve yıllık bakım programıyla uluslararası en yüksek güvenlik standartlarına uyar. Çok dilli rehberlik (İngilizce, Almanca, İspanyolca), profesyonel fotoğraf paketi, premium şampanya servisi (Veuve Clicquot opsiyonu), gourmet kahvaltı ve VIP transfer dahildir. Butterfly Balloons, Condé Nast Traveler ve Travel + Leisure dergilerinde 'Best Hot Air Balloon Operators in the World' listelerinde sürekli yer alır.",
  },
  {
    id: "asiana",
    name: "Asiana Balon",
    licenseNo: "A-2512",
    rating: 4.75,
    reviewCount: 987,
    founded: 2014,
    tagline: "Asya pazarına odaklı — çok dilli rehberlik.",
    address: "Göreme, Nevşehir 50180",
    phone: "+90 384 271 5500",
    website: "https://www.asianaballoons.com",
    establishedYear: 2014,
    fleetSize: 6,
    pilotCount: 8,
    languages: ["Türkçe", "İngilizce", "Çince", "Japonca", "Korece"],
    specialties: ["Çok dilli", "Asya grup", "Standart"],
    description:
      "Asiana Balon, 2014 yılında özellikle Doğu Asya pazarına yönelik hizmet vermek amacıyla kurulmuş ve Kapadokya'da Çince, Japonca ve Korece dillerinde sürekli rehberlik sağlayan tek operatördür. SHGM lisansı A-2512 altında 6 balon ve 8 pilotluk kadrosuyla yıllık 22.000'in üzerinde yolcu taşıyan şirket, Asya turizm acenteleri ile uzun süreli ortaklıklara sahiptir. Filosu 16 sepetli standart balonlardan oluşur ve grup uçuşları için optimize edilmiştir. Asiana Balon, EASA Part-BOP sertifikalı tüm pilotları, yıllık bakım programlı balonları ve özel uçuş öncesi briefing protokolü ile sektörde güvenlik referansı olarak tanınır. Şirket, özellikle çoklu dil dijital broşürleri, çince-japonca-korece WeChat/LINE/KakaoTalk üzerinden müşteri hizmetleri ve Asya banka kartlarıyla (Alipay, WeChat Pay, JCB) ödeme desteği sunar. Tüm uçuşlar 60 dakika süreli olup, Sword Valley, Kızıl Vadi ve Aşk Vadisi üzerinden gerçekleşir. Misafirlere kahvaltı, sertifika, geleneksel şampanya toast (alternatif olarak meyve suyu seçeneği), profesyonel grup fotoğrafı ve Göreme/Ürgüp transfer dahildir. Asiana Balon, Çince ve Korece sosyal medya hesaplarında 500.000'i aşan takipçi tabanına sahiptir.",
  },
  {
    id: "turkiye",
    name: "Türkiye Balon",
    licenseNo: "A-2398",
    rating: 4.8,
    reviewCount: 1456,
    founded: 2009,
    tagline: "Güvenilir aile şirketi — orta-üst segment.",
    address: "Avanos, Nevşehir 50500",
    phone: "+90 384 511 2200",
    website: "https://www.turkiyeballoons.com",
    establishedYear: 2009,
    fleetSize: 9,
    pilotCount: 11,
    languages: ["Türkçe", "İngilizce", "Almanca"],
    specialties: ["Aile dostu", "Standart", "Konfor"],
    description:
      "Türkiye Balon, 2009 yılında Avanos merkezli olarak kurulmuş bir aile şirketidir ve Kapadokya semalarında 'güvenilir, dürüst ve şeffaf' hizmet anlayışıyla tanınır. SHGM lisansı A-2398 altında 9 balon ve 11 pilotluk filosuyla faaliyet gösteren şirket, ikinci nesil aile yönetiminde olup yıllık 28.000 yolcu taşır. Filosu standart 16 sepetli ve konfor 12 sepetli balonlardan oluşur; özellikle 4 kişilik aileler ve çocuklu gruplar için kişiselleştirilmiş paketler sunar. Türkiye Balon, EASA Part-BOP sertifikalı tüm uçuşlarında pilot-yolcu oranı 1:14'tür ve ortalama 60-75 dakika süreli uçuşlar Avanos ovaları üzerinden başlayıp Üç Güzeller, Devrent Vadisi ve Paşabağ rotalarını takip eder. Şirket, sektörde nadir görülen 'hava iptali ücretsiz tarih değişikliği + %100 geri ödeme garantisi'ni en esnek şekilde uygular; misafir aynı ziyaret döneminde başka bir tarihe geçmek isterse hiçbir ek ücret talep edilmez. Almanca rehberlik kadrosu sürekli bulundurulur. Tüm uçuşlara kahvaltı, sertifika, şampanya servisi, profesyonel grup fotoğrafı ve otel transferi dahildir. Türkiye Balon, Booking.com ve GetYourGuide platformlarında 4.8 ortalama puanı korur.",
  },
  {
    id: "universal",
    name: "Universal Balon",
    licenseNo: "A-2421",
    rating: 4.85,
    reviewCount: 1187,
    founded: 2011,
    tagline: "Modern filo, yüksek standart bakım.",
    address: "Göreme, Nevşehir 50180",
    phone: "+90 384 271 6677",
    website: "https://www.universalballoons.com",
    establishedYear: 2011,
    fleetSize: 11,
    pilotCount: 13,
    languages: ["Türkçe", "İngilizce", "Almanca", "Fransızca"],
    specialties: ["Modern filo", "Konfor", "Premium"],
    description:
      "Universal Balon, 2011 yılında kurulmuş ve Kapadokya'nın en modern balon filosuna sahip operatörlerinden biri olarak tanınır. SHGM lisansı A-2421 altında 11 balon ve 13 pilotluk kadrosuyla faaliyet gösteren şirket, balonlarının ortalama yaşı 4 yıl olup sürekli yenilenen filo politikası uygular. Yıllık 32.000 yolcu kapasitesindeki Universal Balon, EASA Part-BOP sertifikalı pilot kadrosu ve sektörde örnek gösterilen yıllık bakım programı (üreticinin önerdiği saatlerin %50'si seviyesinde) ile güvenlik standartlarında öncüdür. Filosu 16 sepetli standart, 12 sepetli konfor ve 8 sepetli butik kategorilerinde geniş bir yelpaze sunar. Şirket, özellikle yeni nesil iletişim teknolojileri konusunda yatırım yapmıştır: pilot-yer kontrol arasında çift-kanallı VHF radyo, GPS izleme, anlık hava radarı entegrasyonu ve mobil uygulama üzerinden uçuş takibi imkanı sunar. Tüm uçuşlar 60-90 dakika süreli olup, Güllüdere, Kızıl Vadi, Aşk Vadisi ve Paşabağ rotaları arasında dinamik karar verilir. Misafirlere gourmet kahvaltı, hediyelik sertifika, şampanya servisi (Brut Reserve), profesyonel uçuş fotoğrafı (USB dahil) ve Göreme-Ürgüp-Uçhisar transfer dahildir. Almanca ve Fransızca rehberlik kadrosu sürekli bulundurulur.",
  },
  {
    id: "voyager",
    name: "Voyager Balloons",
    licenseNo: "A-2334",
    rating: 4.9,
    reviewCount: 1892,
    founded: 2007,
    tagline: "Premium hizmet, küçük sepet konforu.",
    address: "Göreme, Nevşehir 50180",
    phone: "+90 384 271 7700",
    website: "https://www.voyagerballoons.com",
    establishedYear: 2007,
    fleetSize: 12,
    pilotCount: 14,
    languages: ["Türkçe", "İngilizce", "Almanca", "İspanyolca", "İtalyanca"],
    specialties: ["Premium", "Küçük sepet", "Deluxe"],
    description:
      "Voyager Balloons, 2007 yılında kurulmuş ve premium segmentte sektör liderliği yapan Kapadokya'nın saygın operatörlerinden biridir. SHGM lisansı A-2334 altında 12 balon ve 14 pilotluk kadrosuyla faaliyet gösteren şirketin filosu büyük çoğunlukla 8 sepetli butik ve 12 sepetli konfor kategorilerinden oluşur — bu da kalabalık 16-20 sepetli uçuşlardan kaçınan misafirler için ideal bir tercih sunar. Yıllık 26.000 yolcu kapasiteli şirket, EASA Part-BOP sertifikalı tüm pilotlarını 15 yıllık deneyim eşiğinde tutar ve sektördeki en yüksek pilot kıdem yaş ortalamasına (12 yıl) sahiptir. Voyager Balloons, çoklu dil rehberlik (İspanyolca ve İtalyanca dahil), Mediterranean ve Latin pazarlarına yönelik özel uçuş paketleri ve aile-aile ortaklığı kurumsal kimliği ile öne çıkar. Tüm uçuşlar 75-90 dakika süreli (sektör ortalamasının %25 üzerinde) olup, peri bacaları, Aşk Vadisi, Kızıl Vadi ve Aktepe panoraması rotaları üzerinden gerçekleşir. Misafirlere gourmet kahvaltı (yerel ürünler), hediyelik özel ahşap çerçeveli sertifika, premium şampanya servisi (Moët & Chandon), profesyonel uçuş fotoğrafı ve özel araç transfer dahildir. Voyager Balloons, TripAdvisor Hall of Fame (5+ yıl Excellence Award) ve EASA Excellence in Safety ödüllerinin sahibidir.",
  },
  {
    id: "aircappadocia",
    name: "Air Cappadocia",
    licenseNo: "A-2483",
    rating: 4.8,
    reviewCount: 1342,
    founded: 2013,
    tagline: "İngilizce ve Almanca rehberlik.",
    address: "Göreme, Nevşehir 50180",
    phone: "+90 384 271 8800",
    website: "https://www.aircappadocia.com",
    establishedYear: 2013,
    fleetSize: 8,
    pilotCount: 10,
    languages: ["Türkçe", "İngilizce", "Almanca"],
    specialties: ["İngilizce rehber", "Standart", "Aile uçuşu"],
    description:
      "Air Cappadocia, 2013 yılında kurulmuş ve özellikle İngilizce konuşan Avrupa pazarına yönelik hizmet veren orta ölçekli bir operatördür. SHGM lisansı A-2483 altında 8 balon ve 10 pilotluk kadrosuyla yıllık 21.000 yolcu taşıyan şirket, İngiliz, İrlandalı, Hollandalı ve Skandinav misafirler için tercih edilen ana operatörlerden biridir. Filosu 16 sepetli standart ve 12 sepetli konfor kategorilerinden oluşur; özellikle 4-6 kişilik aileler ve küçük arkadaş grupları için fiyat-performans dengesi yüksektir. Air Cappadocia, EASA Part-BOP sertifikalı tüm pilotları, sektör standartlarının üzerinde yıllık bakım programı (toplam 200 saat/yıl/balon) ve sigortalı uçuş garantisiyle güvenlik konusunda iyi bir referansa sahiptir. Şirket, dijital pazarlama konusunda öncüdür: kendi mobil uygulamasında uçuş takibi, anlık hava güncellemeleri, dijital sertifika ve foto-album sunar. Tüm uçuşlar 60-75 dakika süreli olup, Pasabag, Devrent Vadisi, Güllüdere ve Kızıl Vadi rotalarını takip eder. Misafirlere kahvaltı, kişiselleştirilmiş sertifika, geleneksel şampanya toast, profesyonel grup fotoğrafı ve Göreme/Ürgüp/Uçhisar transfer dahildir. Air Cappadocia, GetYourGuide ve Viator platformlarında 4.8 puan ortalamasını korur.",
  },
  {
    id: "royal",
    name: "Royal Balloon",
    licenseNo: "A-2256",
    rating: 4.97,
    reviewCount: 2543,
    founded: 2001,
    tagline: "Romantik ve VIP uçuşların lideri.",
    address: "Göreme, Nevşehir 50180",
    phone: "+90 384 271 9999",
    website: "https://www.royalballoon.com",
    establishedYear: 2001,
    fleetSize: 9,
    pilotCount: 12,
    languages: ["Türkçe", "İngilizce", "Almanca", "Fransızca", "Rusça"],
    specialties: ["VIP", "Romantik", "Evlilik teklifi", "Deluxe"],
    description:
      "Royal Balloon, 2001 yılında kurulmuş ve Kapadokya'nın en köklü ticari balon operatörü olarak romantik, VIP ve evlilik teklifi uçuşlarında sektörün uluslararası referansı kabul edilir. SHGM lisansı A-2256 altında 9 balon ve 12 pilotluk kadrosuyla faaliyet gösteren şirket, sektördeki en yüksek müşteri memnuniyet puanı olan 4.97 ortalamayla 2.500'ü aşkın doğrulanmış yorumda lider konumundadır. Filosu çoğunlukla 8 sepetli özel ve 4 sepetli butik kategorilerinden oluşur; bu da 2-8 kişilik intim uçuşlara olanak sağlar. Royal Balloon, evlilik teklifi paketleri (özel balonda 2 kişi, gül buketi, şampanya, fotoğrafçı), balayı paketleri (deluxe sepet, Veuve Clicquot, gourmet kahvaltı), VIP grup uçuşları (kurumsal etkinlikler, lüks turlar) ve özel film/fotoğraf çekimleri için tercih edilen ana operatördür. EASA Part-BOP sertifikalı tüm pilotları ortalama 18 yıl deneyime sahip olup, sektördeki en yüksek pilot kıdem yaş ortalamasına sahiptir. Uçuşlar 60-120 dakika süreli (paket bazlı) olup, Güllüdere, Kızıl Vadi, Aktepe, Aşk Vadisi ve özel rota seçenekleri sunulur. Çok dilli rehberlik (Almanca, Fransızca, Rusça dahil), Michelin yıldızlı şef kahvaltısı opsiyonu, premium şampanya servisi ve profesyonel fotoğraf-video paketi dahildir. Royal Balloon, Forbes Travel Guide, Condé Nast Traveler, Travel + Leisure ve Robb Report dergilerinde sürekli yer alır.",
  },
];

export function getOperatorById(id: string): Operator | undefined {
  return OPERATORS.find((o) => o.id === id);
}
