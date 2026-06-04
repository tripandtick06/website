// Detay (landing) sayfalari icin benzersiz UZUN aciklama metinleri — SEO icerik
// derinligi. catalog.ts shortDescription (1 cumle) yerine 50-90 kelime ozgun metin.
// Su an tr + en dolu; diger 15 locale ceviri pipeline'i ile doldurulur. Exact-locale
// gosterilir (karisik dil olmaz) — locale yoksa detay sayfasi shortDescription'a duser.

import type { Locale } from "@/lib/i18n/dictionaries";
// tr+en asagida inline (source of truth). Diger 15 locale ceviri pipeline ciktisi
// (scripts/i18n/translate-descriptions.ts -> descriptions.<locale>.json). data.*.json
// gibi server-side static import; kucuk (~20KB/dil) — Worker 3 MiB limiti asilmaz.
import deDesc from "@/data/i18n/descriptions.de.json";
import frDesc from "@/data/i18n/descriptions.fr.json";
import esDesc from "@/data/i18n/descriptions.es.json";
import nlDesc from "@/data/i18n/descriptions.nl.json";
import zhDesc from "@/data/i18n/descriptions.zh.json";
import hiDesc from "@/data/i18n/descriptions.hi.json";
import urDesc from "@/data/i18n/descriptions.ur.json";
import ptDesc from "@/data/i18n/descriptions.pt.json";
import ptBRDesc from "@/data/i18n/descriptions.pt-BR.json";
import jaDesc from "@/data/i18n/descriptions.ja.json";
import koDesc from "@/data/i18n/descriptions.ko.json";
import itDesc from "@/data/i18n/descriptions.it.json";
import ruDesc from "@/data/i18n/descriptions.ru.json";
import ukDesc from "@/data/i18n/descriptions.uk.json";
import azDesc from "@/data/i18n/descriptions.az.json";

type LocalizedText = Partial<Record<Locale, string>>;

// slug -> metin (her dosya). Inline tr/en'de olmayan locale'ler buradan gelir.
const EXTERNAL: Partial<Record<Locale, Record<string, string>>> = {
  de: deDesc, fr: frDesc, es: esDesc, nl: nlDesc, zh: zhDesc, hi: hiDesc, ur: urDesc,
  pt: ptDesc, "pt-BR": ptBRDesc, ja: jaDesc, ko: koDesc, it: itDesc,
  ru: ruDesc, uk: ukDesc, az: azDesc,
};

export const SERVICE_DESCRIPTIONS: Record<string, LocalizedText> = {
  // ---------- ACTIVITIES — ATV ----------
  "atv-standart": {
    tr: "Kapadokya ATV turu ile Göreme'nin en ünlü vadilerini kendi gazınızda keşfedin. 1-2 saatlik bu standart rota Sword Valley, Red & Rose Valley, Çavuşin ve Aşk Vadisi'ni kapsar; güvenlik ekipmanı, rehber eşliği ve otel transferi fiyata dahildir. Gün içinde dilediğiniz saatte kalkabilir, peribacaları arasında toz dumana karışan eğlenceli bir macera yaşarsınız. Ehliyet gerekmez — kısa eğitim sonrası herkes sürebilir.",
    en: "Discover Göreme's most famous valleys at your own throttle on this Cappadocia ATV tour. The 1–2 hour standard route covers Sword Valley, Red & Rose Valley, Çavuşin and Love Valley, with safety gear, a guide and hotel transfer all included. Depart any time of day and ride through the fairy chimneys on a dusty, exhilarating adventure. No licence required — a short briefing and you're ready to go.",
  },
  "atv-sunrise": {
    tr: "Gün doğumu ATV turu, sabahın ilk ışığında Kapadokya vadilerini en sihirli haliyle yaşamak isteyenler için. 2 saatlik bu rota balon turuyla mükemmel uyumludur; gökyüzü balonlarla dolarken siz aşağıda vadilerde toz koparırsınız. Güvenlik ekipmanı, rehber ve otel transferi dahildir. Serin sabah havası, yumuşak ışık ve sakin patikalar gün içi turlardan çok daha atmosferik bir deneyim sunar.",
    en: "The sunrise ATV tour is for those who want Cappadocia's valleys at their most magical, in the first light of day. This 2-hour route pairs perfectly with a balloon flight — as the sky fills with balloons, you kick up dust through the valleys below. Safety gear, a guide and hotel transfer are included. Cool morning air, soft light and quiet trails make it far more atmospheric than a daytime ride.",
  },
  "atv-sunset": {
    tr: "Gün batımı ATV turu, Kapadokya'da en çok tercih edilen seçenektir. 2 saat boyunca vadilerde sürerken günbatımının altın ışığı peribacalarını turuncuya boyar; panoramik duraklarda fotoğraf molası verirsiniz. Güvenlik ekipmanı, rehber eşliği ve otel transferi dahildir. Gündüz sıcağının geçtiği, ışığın yumuşadığı bu saat hem sürüş keyfi hem fotoğraf için idealdir.",
    en: "The sunset ATV tour is Cappadocia's most popular choice. Over 2 hours you ride through the valleys as the golden hour paints the fairy chimneys orange, with photo stops at panoramic viewpoints. Safety gear, a guide and hotel transfer are included. With the daytime heat gone and the light turned soft, this is the ideal hour for both the ride and the photos.",
  },
  // ---------- ACTIVITIES — Jeep ----------
  "jeep-standart": {
    tr: "Jeep Safari Standart turu, ATV sürmek istemeyen ya da daha rahat bir keşif arayanlar için ideal. 3-4 saat boyunca 4x4 araçla Göreme vadilerini dolaşır, panoramik noktalarda durur, rehberinizden bölgenin jeolojisi ve tarihi hakkında bilgi alırsınız. Otel transferi ve rehber dahildir. Gün içinde esnek kalkış saatleriyle, aileler ve her yaştan misafir için konforlu bir vadi turu sunar.",
    en: "The standard Jeep Safari is ideal for those who'd rather not drive an ATV or want a more relaxed way to explore. Over 3–4 hours a 4x4 takes you through Göreme's valleys, stopping at panoramic spots while your guide explains the region's geology and history. Hotel transfer and guide are included. With flexible daytime departures, it's a comfortable valley tour for families and guests of every age.",
  },
  "jeep-sunrise": {
    tr: "Sunrise Jeep Safari, sabahın serinliğinde Göreme vadilerini ve gökyüzünü süsleyen balonları aynı kareye sığdırmak isteyenler için. 3-4 saatlik bu rotada 4x4 araçla en iyi balon manzara noktalarına çıkar, ardından vadilerde gezinirsiniz. Rehber ve otel transferi dahildir. Fotoğrafçılar ve erken kalkmaya değer diyenler için günün en etkileyici turu.",
    en: "The sunrise Jeep Safari is for those who want Göreme's valleys and the balloon-filled sky in a single frame, in the cool of the morning. Over 3–4 hours the 4x4 climbs to the best balloon-viewing points before winding through the valleys. Guide and hotel transfer are included. It's the day's most striking tour for photographers and early risers alike.",
  },
  "jeep-sunset": {
    tr: "Sunset Jeep Safari, günbatımının altın ışığında Göreme vadilerini panoramik biçimde keşfetmenizi sağlar. 3-4 saat boyunca 4x4 araçla vadileri dolaşır, en iyi gün batımı noktalarında durup fotoğraf çekersiniz. Rehber ve otel transferi dahildir. Gündüz sıcağından kaçıp manzaranın en güzel haline tanık olmak isteyenler için tercih edilen bir seçenektir.",
    en: "The sunset Jeep Safari lets you explore Göreme's valleys panoramically in the golden light of dusk. Over 3–4 hours the 4x4 tours the valleys, pausing at the best sunset points for photos. Guide and hotel transfer are included. It's the preferred choice for those who want to escape the daytime heat and catch the scenery at its finest.",
  },
  // ---------- ACTIVITIES — At binme ----------
  "at-standart": {
    tr: "Kapadokya'nın adı \"güzel atlar ülkesi\" anlamına gelir; at binme turu bu mirası en otantik şekilde yaşatır. 1-2 saatlik bu standart turda deneyimli rehber eşliğinde Ürgüp vadilerinde yürür, peribacaları arasında sakin bir tempoda ilerlersiniz. At, kask ve otel transferi dahildir. Gün içinde esnek saatlerle, daha önce hiç ata binmemiş misafirler için bile uygundur.",
    en: "Cappadocia's name means \"land of beautiful horses,\" and a horse-riding tour brings that heritage to life in the most authentic way. On this 1–2 hour standard ride you walk through the Ürgüp valleys with an experienced guide, moving at a calm pace among the fairy chimneys. Horse, helmet and hotel transfer are included. With flexible daytime times, it suits even guests who have never ridden before.",
  },
  "at-sunrise": {
    tr: "Gün doğumu at binme turu, sabahın sessizliğinde Ürgüp vadilerini at sırtında keşfetmenin huzurunu sunar. 1 saatlik bu turda rehber eşliğinde, gökyüzü balonlarla dolarken vadilerde yumuşak ışık altında ilerlersiniz. At, kask ve otel transferi dahildir. Romantik ve sakin bir başlangıç arayan çiftler ile doğa tutkunları için ideal bir sabah aktivitesidir.",
    en: "The sunrise horse-riding tour offers the serenity of exploring the Ürgüp valleys on horseback in the morning quiet. On this 1-hour ride you move through the valleys in soft light with a guide, as the sky fills with balloons. Horse, helmet and hotel transfer are included. It's an ideal morning activity for couples seeking a romantic, calm start and for nature lovers.",
  },
  "at-sunset": {
    tr: "Gün batımı at binme turu, 1,5 saat boyunca Ürgüp vadilerinde at sırtında panoramik manzaralar eşliğinde ilerlemenizi sağlar. Günbatımının altın ışığı peribacalarını sararken rehberiniz size eşlik eder; at, kask ve otel transferi dahildir. Günün en romantik ve fotojenik saatinde, sakin tempolu ve unutulmaz bir doğa deneyimi sunar.",
    en: "The sunset horse-riding tour takes you through the Ürgüp valleys on horseback for 1.5 hours amid panoramic views. As the golden light of dusk wraps the fairy chimneys, your guide rides alongside; horse, helmet and hotel transfer are included. At the day's most romantic and photogenic hour, it delivers a calm-paced, unforgettable encounter with nature.",
  },
  // ---------- ACTIVITIES — Hamam ----------
  "hamam-standart": {
    tr: "Geleneksel Türk hamamı, yüzyıllardır süregelen bir arınma ve dinlenme ritüelidir. 90 dakikalık bu standart pakette sıcaklık bölümünde terler, ardından kese (loofah) ve köpük masajıyla yenilenirsiniz; sauna, buhar odası ve jakuzi de dahildir. Türk çayı veya kahve ikramı ve otel transferi fiyata dahildir. Yoğun bir balon turu veya vadi yürüyüşü sonrası kasları gevşetmek için ideal bir mola.",
    en: "The traditional Turkish bath is a centuries-old ritual of cleansing and rest. In this 90-minute standard package you sweat in the hot room, then renew with a kese (loofah) scrub and foam massage; sauna, steam room and jacuzzi are also included. Turkish tea or coffee and hotel transfer come with the price. It's the ideal break to relax your muscles after a busy balloon flight or valley hike.",
  },
  "hamam-deluxe": {
    tr: "Türk Hamamı Deluxe, klasik hamam ritüelini premium bir spa deneyimine dönüştürür. 2 saat boyunca tam hamam paketinin (kese + köpük) ardından 30 dakikalık İsveç yağ masajı ve tam vücut yosun/çamur maskesi uygulanır; sauna, jakuzi ve içecek servisi dahildir. VIP transfer fiyata dahildir. Derin rahatlama ve cilt yenileme arayan misafirler için Kapadokya'nın en kapsamlı dinlenme seçeneğidir.",
    en: "The Deluxe Turkish Bath turns the classic hammam ritual into a premium spa experience. Over 2 hours, the full bath package (scrub + foam) is followed by a 30-minute Swedish oil massage and a full-body algae/mud mask; sauna, jacuzzi and drink service are included. VIP transfer comes with the price. For guests seeking deep relaxation and skin renewal, it's Cappadocia's most complete way to unwind.",
  },
  // ---------- ACTIVITIES — Türk Gecesi ----------
  "turk-gecesi-yemekli": {
    tr: "Türk Gecesi, bir mağara restoranda Anadolu kültürünü tek gecede yaşatan rengarenk bir şovdur. 3 saat boyunca semah, yöresel folklor, oryantal dans ve Kafkas dans gösterilerini izler; 3 çeşit yemek ve sınırsız alkollü/alkolsüz içecek eşliğinde keyifli bir akşam geçirirsiniz. Otel transferi dahildir. Kapadokya'nın geleneksel mutfağını ve müziğini bir arada deneyimlemek isteyenler için en popüler akşam programıdır.",
    en: "Turkish Night is a colourful show that brings Anatolian culture to life in a single evening at a cave restaurant. Over 3 hours you watch semah, regional folk dances, belly dancing and Caucasian dance performances, enjoying a 3-course dinner with unlimited alcoholic and soft drinks. Hotel transfer is included. It's the most popular evening programme for those who want to experience Cappadocia's traditional cuisine and music together.",
  },
  "turk-gecesi-yemeksiz": {
    tr: "Türk Gecesi (Yemeksiz), aynı muhteşem folklor şovunu daha uygun bir bütçeyle sunar. Semah, yöresel folklor, oryantal ve Kafkas dans gösterilerini izler, hoş geldin içeceğinizle eşsiz bir kültür gecesi yaşarsınız. Yemek ve alkol dahil değildir; sadece şov ve otel transferi fiyata dahildir. Akşam yemeğini başka yerde planlayan ama Anadolu'nun dans ve müzik geleneğini kaçırmak istemeyen misafirler için idealdir.",
    en: "Turkish Night (show only) offers the same spectacular folk show at a friendlier price. You watch semah, regional folk, belly and Caucasian dance performances and enjoy a memorable cultural evening with a welcome drink. Food and alcohol are not included — only the show and hotel transfer come with the price. It's ideal for guests who plan dinner elsewhere but don't want to miss Anatolia's dance and music tradition.",
  },
  // ---------- ACTIVITIES — Microlight ----------
  "microlight-standart": {
    tr: "Microlight uçuşu, balon dışında Kapadokya'yı gökyüzünden görmenin en heyecanlı yoludur. 15-18 dakikalık bu standart uçuşta profesyonel bir pilotla motorlu hafif uçağa biner, peribacaları ve vadiler üzerinde alçak irtifada süzülürsünüz. Uçuş sertifikası, ekipman, özel transfer ve fotoğraf çekimi dahildir. Balon turundan daha hızlı, daha kişisel ve adrenalin dolu bir alternatif arayanlar için birebirdir.",
    en: "A microlight flight is the most thrilling way — beyond a balloon — to see Cappadocia from the sky. On this 15–18 minute standard flight you board a powered light aircraft with a professional pilot and glide at low altitude over the fairy chimneys and valleys. Flight certificate, equipment, private transfer and photos are included. It's perfect for anyone wanting a faster, more personal and adrenaline-filled alternative to a balloon ride.",
  },
  "microlight-deluxe": {
    tr: "Microlight Deluxe uçuşu, tüm Kapadokya'yı gökyüzünden en kapsamlı şekilde keşfetmenizi sağlar. 30-35 dakikalık uzun rota boyunca profesyonel pilot eşliğinde daha fazla vadi, peribaca ve kaya oluşumu üzerinde uçar; premium fotoğraf paketiyle anlarınızı ölümsüzleştirirsiniz. Uçuş sertifikası, VIP transfer ve ekipman dahildir. Sıra dışı, premium bir hava deneyimi isteyen misafirler için tasarlanmıştır.",
    en: "The Deluxe microlight flight lets you explore all of Cappadocia from the sky in the most comprehensive way. Over a 30–35 minute extended route with a professional pilot, you fly over more valleys, fairy chimneys and rock formations, immortalising your moments with a premium photo package. Flight certificate, VIP transfer and equipment are included. It's designed for guests who want an extraordinary, premium aerial experience.",
  },
  // ---------- TOURS ----------
  "kirmizi-tur": {
    tr: "Kapadokya Kırmızı Tur (Red Tour), bölgenin kuzey kültür rotasını tek günde gezdiren en popüler klasik turdur. Göreme Açık Hava Müzesi, Uçhisar Kalesi, Zelve, Paşabağ (Keşişler Vadisi), Devrent Hayal Vadisi, Avanos çömlek atölyesi ve Aşk Vadisi gibi 10'dan fazla durağı kapsar. Profesyonel rehber, otel transferi, müze giriş biletleri ve öğle yemeği fiyata dahildir. UNESCO mirası bölgeyi ilk kez görenler için ideal başlangıç turudur.",
    en: "The Cappadocia Red Tour is the most popular classic tour, covering the region's northern cultural route in a single day. It includes more than 10 stops such as the Göreme Open-Air Museum, Uçhisar Castle, Zelve, Paşabağ (Monks Valley), Devrent (Imagination) Valley, the Avanos pottery workshop and Love Valley. Professional guide, hotel transfer, museum entry tickets and lunch are included. It's the ideal first tour for anyone seeing this UNESCO-listed region for the first time.",
  },
  "yesil-tur": {
    tr: "Kapadokya Yeşil Tur (Green Tour), bölgenin güney doğa rotasını keşfettiren tam günlük bir maceradır. Derinkuyu Yeraltı Şehri, Ihlara Vadisi (panoramik cam teras ve yürüyüş), Belisırma köyünde nehir kenarı öğle yemeği, Selime Katedrali ve Güvercinlik Vadisi gibi durakları içerir. Profesyonel rehber, otel transferi, yeraltı şehri ve müze biletleri ile Belisırma öğle yemeği dahildir. Doğa, yürüyüş ve tarihi bir arada sevenler için en iyi seçimdir.",
    en: "The Cappadocia Green Tour is a full-day adventure through the region's southern nature route. It takes in the Derinkuyu Underground City, the Ihlara Valley (panoramic glass terrace and walk), a riverside lunch in Belisırma village, Selime Cathedral and Pigeon Valley. Professional guide, hotel transfer, underground city and museum tickets and the Belisırma lunch are included. It's the best choice for those who love nature, walking and history combined.",
  },
  "mix-tur": {
    tr: "Kapadokya Mix Tur (Best of), Kırmızı ve Yeşil turların en iyi duraklarını tek güne sığdıran en kapsamlı seçenektir. Göreme Açık Hava Müzesi, Uçhisar Kalesi, Zelve, Paşabağ, Devrent, Avanos çömlek atölyesi ve bir yeraltı şehri (Özkonak veya Kaymaklı) dahil 12'den fazla durağı 9-10 saatte gezersiniz. Profesyonel rehber, otel transferi, tüm müze ve yeraltı biletleri ile öğle yemeği fiyata dahildir. Tek günde mümkün olduğunca çok şey görmek isteyenler için idealdir.",
    en: "The Cappadocia Mix Tour (Best of) is the most comprehensive option, fitting the best stops of the Red and Green tours into a single day. In 9–10 hours you visit more than 12 stops, including the Göreme Open-Air Museum, Uçhisar Castle, Zelve, Paşabağ, Devrent, the Avanos pottery workshop and an underground city (Özkonak or Kaymaklı). Professional guide, hotel transfer, all museum and underground tickets and lunch are included. Ideal for those who want to see as much as possible in one day.",
  },
  "sari-tur": {
    tr: "Kapadokya Sarı Tur (Yellow Tour), kalabalıktan uzak, daha sakin ve derin bir rota arayanlar için tasarlanmıştır. Soğanlı kaya kiliseleri, Sobesos antik kenti, Mustafapaşa Rum köyü, Kızılçukur Vadisi'nde yaklaşık 2 km yürüyüş, Çavuşin Bizans kilisesi ve Lavanta Bahçesi duraklarını içerir. Profesyonel rehber, transfer, müze biletleri ve öğle yemeği dahildir. Klasik turları daha önce yapmış ya da otantik bir deneyim isteyen gezginler için mükemmeldir.",
    en: "The Cappadocia Yellow Tour is designed for those seeking a calmer, deeper route away from the crowds. It includes the Soğanlı rock churches, the ancient city of Sobesos, the Greek village of Mustafapaşa, a roughly 2 km walk in the Kızılçukur (Red) Valley, the Çavuşin Byzantine church and a lavender garden. Professional guide, transfer, museum tickets and lunch are included. Perfect for travellers who have already done the classic tours or want an authentic experience.",
  },
  "yeralti-turu": {
    tr: "Yeraltı Şehirleri Turu, Kapadokya'nın yer altına oyulmuş şaşırtıcı dünyasını yarım günde keşfettirir. Derinkuyu ve Kaymaklı yeraltı şehirlerini, ardından Çavuşin Bizans kilisesi ve Güvercinlik Vadisi'ni profesyonel rehber eşliğinde gezersiniz. Otel transferi ve iki yeraltı şehrinin giriş biletleri dahildir. Tam günlük tura vakti olmayan ama bölgenin erken Hristiyanlık tarihini ve mühendislik harikası tünellerini görmek isteyenler için idealdir.",
    en: "The Underground Cities Tour reveals Cappadocia's astonishing subterranean world in half a day. With a professional guide you explore the Derinkuyu and Kaymaklı underground cities, then the Çavuşin Byzantine church and Pigeon Valley. Hotel transfer and entry tickets to both underground cities are included. It's ideal for those without time for a full-day tour who still want to see the region's early-Christian history and its marvel of engineered tunnels.",
  },
  "gun-batimi-turu": {
    tr: "Gün Batımı Panorama Turu, Kapadokya'nın en güzel manzaralarını günün en büyülü saatinde yaşatan 3 saatlik kısa bir kaçamaktır. Aktepe, Göreme panorama noktası ve Kızılçukur Vadisi'nde durarak günbatımını izler, bu sırada şarap ikramının tadını çıkarırsınız. Rehber ve otel transferi dahildir. Tam günlük tur istemeyen, ama Kapadokya'nın altın saatini romantik bir atmosferde geçirmek isteyen çiftler ve gezginler için idealdir.",
    en: "The Sunset Panorama Tour is a short, 3-hour escape that captures Cappadocia's finest views at the day's most magical hour. Stopping at Aktepe, the Göreme panorama point and the Kızılçukur (Red) Valley, you watch the sunset while enjoying a glass of wine. Guide and hotel transfer are included. Ideal for couples and travellers who don't want a full-day tour but wish to spend Cappadocia's golden hour in a romantic atmosphere.",
  },
  "instagram-turu": {
    tr: "Fotoğraf & Instagram Turu, Kapadokya'nın en gözde çekim noktalarını profesyonel bir fotoğrafçı eşliğinde gezdiren yarım günlük özel bir deneyimdir. Balon manzaralı teraslar, halı süslemeli setler ve vadilerdeki ikonik karelerde profesyonelce poz verir, editlenmiş fotoğraflarınızı teslim alırsınız. Otel transferi dahildir. Sosyal medya için mükemmel kareler isteyen, balayı veya özel gün çekimi planlayan misafirler için birebirdir.",
    en: "The Photo & Instagram Tour is a half-day private experience that takes you to Cappadocia's most coveted shooting spots with a professional photographer. You pose at balloon-view terraces, carpet-styled sets and iconic valley backdrops, then receive your edited photos. Hotel transfer is included. It's perfect for guests who want flawless shots for social media or are planning a honeymoon or special-occasion shoot.",
  },
  // ---------- PACKAGES ----------
  "tam-gun-paket": {
    tr: "Kapadokya Tam Gün Premium paketi, bölgenin başlıca deneyimlerini tek rezervasyonda toplayan avantajlı bir 2 gün 1 gece programıdır. Standart sıcak hava balonu uçuşu, rehberli Kırmızı Tur, bir gece mağara otel konaklaması, akşam yemeği ve tüm transferleri içerir. Ayrı ayrı satın almaya kıyasla ciddi tasarruf sağlar. İlk kez gelen bireysel gezginler ve çiftler için Kapadokya'yı eksiksiz yaşamanın en pratik yoludur.",
    en: "The Cappadocia Full-Day Premium package bundles the region's headline experiences into one great-value 2-day, 1-night programme. It includes a standard hot-air balloon flight, a guided Red Tour, one night in a cave hotel, dinner and all transfers. Compared with buying each separately, it offers significant savings. For first-time solo travellers and couples, it's the most practical way to experience Cappadocia in full.",
  },
  "balayi-paketi": {
    tr: "Balayı Lüks Paketi, yeni evli çiftler için tasarlanmış 3 gün 2 gece romantik bir kaçamaktır. VIP sepetli romantik balon uçuşu, iki gece VIP mağara otel konaklaması, welcome şampanya, VIP transfer, sürpriz oda dekoru ve romantik akşam yemeğini içerir. Fiyat çift başınadır. Kapadokya'nın masalsı atmosferinde unutulmaz bir balayı geçirmek isteyen çiftler için baştan sona özenle hazırlanmış premium bir deneyim sunar.",
    en: "The Honeymoon Luxury Package is a romantic 3-day, 2-night escape designed for newlyweds. It includes a romantic balloon flight with a VIP basket, two nights in a VIP cave hotel, welcome champagne, VIP transfers, surprise room décor and a romantic dinner. The price is per couple. For couples wanting an unforgettable honeymoon in Cappadocia's fairy-tale setting, it's a premium experience crafted with care from start to finish.",
  },
  "macera-paketi": {
    tr: "Macera Paketi, adrenalin seven genç ve aktif misafirler için yoğun bir 2 gün 1 gece programıdır. Sıcak hava balonu uçuşu, ATV Full Experience (4 saat), 1,5 saatlik at binme, yarım günlük Jeep Safari ve bir gece butik otel konaklamasını bir araya getirir; tüm transferler dahildir. Kapadokya'yı hem gökyüzünden hem vadilerden, dört farklı aktiviteyle dolu dolu yaşamak isteyenler için tasarlanmıştır.",
    en: "The Adventure Package is an action-packed 2-day, 1-night programme for young, active, adrenaline-loving guests. It combines a hot-air balloon flight, an ATV Full Experience (4 hours), 1.5 hours of horse riding, a half-day Jeep Safari and one night in a boutique hotel, with all transfers included. It's built for those who want to experience Cappadocia to the full — from the sky and the valleys — across four different activities.",
  },
  "aile-paketi": {
    tr: "Aile Tam Paketi, 2 yetişkin ve 2 çocuk için tasarlanmış 3 gün 2 gece çocuk dostu bir tatil programıdır. İki yetişkin için balon uçuşu, çocuklara uygun Yeşil Tur, havuz ve animasyonlu aile resortunda iki gece konaklama, açık büfe kahvaltı ve tüm transferleri içerir. Tek fiyatta tüm aile için planlanmıştır. Çocuklarıyla güvenli, konforlu ve eğlenceli bir Kapadokya tatili isteyen aileler için idealdir.",
    en: "The Family Complete Package is a child-friendly 3-day, 2-night holiday programme designed for 2 adults and 2 children. It includes a balloon flight for two adults, a child-friendly Green Tour, two nights at a family resort with pool and entertainment, open-buffet breakfast and all transfers. It's planned for the whole family at one price. Ideal for families wanting a safe, comfortable and fun Cappadocia holiday with their children.",
  },
  "evlilik-teklifi": {
    tr: "Evlilik Teklifi Lüks Paketi, hayatınızın en özel anını Kapadokya semalarında unutulmaz kılmak için hazırlanmıştır. Sadece size ait özel çift-balon uçuşu, premium şampanya, lüks çiçek buketi, 2 saatlik profesyonel fotoğrafçı, drone video kaydı, çerçeveli hediye ve sürpriz romantik dekoru içerir. Fiyat çift başınadır. Teklifinizi gün doğumunda yüzlerce balonun arasında yapmak isteyenler için kusursuz, baştan sona organize edilmiş bir deneyimdir.",
    en: "The Marriage Proposal Luxury Package is crafted to make the most special moment of your life unforgettable in Cappadocia's skies. It includes a private balloon flight just for the two of you, premium champagne, a luxury flower bouquet, a 2-hour professional photographer, drone video, a framed gift and surprise romantic décor. The price is per couple. For those who want to propose at sunrise among hundreds of balloons, it's a flawless, fully organised experience.",
  },
  "kurumsal-paket": {
    tr: "Kurumsal Etkinlik Paketi, şirketler ve gruplar (minimum 10 kişi) için Kapadokya'da profesyonelce organize edilen bir deneyimdir. Geniş sepetli grup balonu, rehberli grup turu, gala akşam yemeği ve özel bir kurumsal organizatörü içerir; faturalı ödeme ve özel branding seçeneği sunulur. Fiyat kişi başınadır ve program 1-3 gün arasında özelleştirilebilir. Takım etkinlikleri, teşvik gezileri ve şirket kutlamaları için ideal, esnek bir çözümdür.",
    en: "The Corporate Event Package is a professionally organised Cappadocia experience for companies and groups (minimum 10 people). It includes a large-basket group balloon, a guided group tour, a gala dinner and a dedicated corporate organiser, with invoiced payment and an optional custom-branding option. The price is per person and the programme can be tailored over 1–3 days. A flexible solution ideal for team events, incentive trips and company celebrations.",
  },
  // ---------- TRANSFERS ----------
  "nev-otel": {
    tr: "Nevşehir Kapadokya Havalimanı (NAV) ile otelinizi arasında özel transfer hizmeti. 1-4 kişilik özel araçla, şoför karşılaması ve bagaj desteği eşliğinde 30-45 dakikada konforlu bir yolculuk yaparsınız; VIP araç seçeneği mevcuttur. Uçuş saatinize göre planlanır, otelinizin kapısına kadar bırakır. Toplu servis beklemeden, doğrudan ve güvenli bir varış isteyen misafirler için en pratik seçenektir.",
    en: "A private transfer service between Nevşehir Cappadocia Airport (NAV) and your hotel. In a private vehicle for 1–4 people, with driver meet-and-greet and luggage assistance, you enjoy a comfortable 30–45 minute ride, with a VIP vehicle option available. It's scheduled around your flight and drops you right at your hotel door. The most practical choice for guests wanting a direct, safe arrival without waiting for a shuttle.",
  },
  "kayseri-otel": {
    tr: "Kayseri Havalimanı (ASR) ile Kapadokya otelleri arasında özel transfer hizmeti. 1-4 kişilik özel araçla, şoför ve bagaj desteği eşliğinde 60-75 dakikalık daha uzun mesafeyi konforla kat edersiniz. Kayseri'ye inen ve doğrudan Göreme, Ürgüp veya Uçhisar'daki otellerine geçmek isteyen misafirler için idealdir. Uçuşunuza göre planlanır; bekleme, aktarma ve yön bulma derdi olmadan kapıdan kapıya ulaşım sağlar.",
    en: "A private transfer service between Kayseri Airport (ASR) and Cappadocia hotels. In a private vehicle for 1–4 people, with driver and luggage assistance, you cover the longer 60–75 minute distance in comfort. It's ideal for guests landing in Kayseri who want to go straight to their hotel in Göreme, Ürgüp or Uçhisar. Scheduled around your flight, it offers door-to-door transport with no waiting, transfers or navigation worries.",
  },
  "minibus-grup": {
    tr: "Grup Minibüs Transferi, 5-12 kişilik gruplar için Nevşehir veya Kayseri havalimanından otelinize ekonomik bir ulaşım çözümüdür. Şoför ve bagaj desteğiyle, kişi başı uygun fiyatla konforlu bir yolculuk sunar. Aileler, arkadaş grupları ve küçük turlar için idealdir; herkes aynı araçta birlikte seyahat eder. Uçuş saatine göre planlanır ve doğrudan otelinize ulaştırır.",
    en: "The Group Minibus Transfer is an economical transport solution for groups of 5–12 people from Nevşehir or Kayseri airport to your hotel. With driver and luggage assistance, it offers a comfortable ride at a low per-person price. Ideal for families, groups of friends and small tours, with everyone travelling together in one vehicle. It's scheduled around your flight time and takes you directly to your hotel.",
  },
  "vip-arac": {
    tr: "VIP Araç + Şoför hizmeti, Kapadokya'yı kendi programınıza göre keşfetmek isteyenler için saatlik kiralama sunar. Profesyonel şoför ve yakıt dahil VIP araçla, dilediğiniz noktalara dilediğiniz sırayla gidebilir, esnek bir gezi planlayabilirsiniz. Fotoğraf turları, çok duraklı geziler veya konforlu özel ulaşım isteyen misafirler için idealdir. Rotanızı siz belirler, biz sürüş ve lojistiği üstleniriz.",
    en: "The VIP Vehicle + Driver service offers hourly hire for those who want to explore Cappadocia on their own schedule. In a VIP vehicle with a professional driver and fuel included, you can go wherever you like in whatever order, planning a flexible itinerary. Ideal for photo tours, multi-stop trips or guests wanting comfortable private transport. You set the route; we handle the driving and logistics.",
  },
};

/**
 * Detay sayfasi icin locale'e ozel uzun aciklama. SADECE tam locale eslesmesi
 * dondurur (karisik dil olmaz). Yoksa undefined -> sayfa shortDescription'a duser.
 */
export function getLongDescription(
  slug: string,
  locale: Locale
): string | undefined {
  // Once inline (tr/en source of truth), yoksa per-locale ceviri JSON. Tam locale
  // eslesmesi yoksa undefined -> sayfa shortDescription'a duser (karisik dil olmaz).
  return SERVICE_DESCRIPTIONS[slug]?.[locale] ?? EXTERNAL[locale]?.[slug];
}
