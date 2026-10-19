// Original Turkish editorial block for /balonlar (TR only) — the Cappadocia balloon
// pillar. 2026-10-18: /balonlar is the single page that targets "kapadokya balon turu";
// product pages (/balonlar/[slug]) stay the booking pages and the price-detail article
// (/blog/kapadokya-balon-turu-fiyat-2026) stays the price explainer — this block links to
// both instead of repeating them. Every fact below comes from data already in the repo
// (BALLOON_PACKAGES, FAQ_ITEMS, nlBalloonGuide); nothing new is claimed.
// Pricing rule: only "başlangıç / ...'den başlayan" prices — guard tests/lib/from-pricing.test.ts.

export interface TrGuideSection {
  id: string;
  heading: string;
  paragraphs: string[];
}

export const TR_GUIDE_TITLE = "Kapadokya balon turu: başlamadan önce bilmeniz gerekenler";

export const TR_GUIDE_INTRO =
  "Gün doğumunda Göreme, Uçhisar ve Ürgüp üzerinde yaklaşık bir saat süren balon uçuşu, Kapadokya'ya gelenlerin çoğunun ilk sıraya koyduğu deneyimdir. Bu sayfada balon turunun nasıl işlediğini, hangi mevsimde uçmanın daha güvenli olduğunu, kalkış bölgelerini, hava nedeniyle iptalde ne olduğunu ve fiyatın nasıl okunacağını anlatıyoruz. Trip and Tick, Nevşehir merkezli bir seyahat acentesidir ve birden fazla operatörün balon uçuşlarını satar.";

export const TR_GUIDE_SECTIONS: TrGuideSection[] = [
  {
    id: "neleri-icerir",
    heading: "Balon turu neleri içerir?",
    paragraphs: [
      "Standart Balon Uçuşu paketinde otelden alış ve otele dönüş transferi, kalkış alanında hafif kahvaltı, yaklaşık 60 dakikalık uçuş, iniş sonrası şampanyalı kutlama, uçuş sertifikası ve madalya ile 40 milyon Euro yolcu sigortası bulunur. Uçuş, 16-20 kişilik geniş bir sepette profesyonel pilot eşliğinde yapılır.",
      "Yalnızca kendinize ya da bir çifte ayrılmış sepet istiyorsanız Romantik Özel Balon paketine bakın: iki kişilik özel sepet ya da en fazla 8 kişilik küçük grup seçilebilir, uçuş 60-90 dakika sürer ve fiyat kişiye özel teklifle verilir. Fotoğraf paketi gibi eklentiler isteğe bağlıdır ve pakete dahil değildir.",
    ],
  },
  {
    id: "sezon-saat",
    heading: "Sezon ve saat: balon ne zaman uçar?",
    paragraphs: [
      "Balonlar yıl boyunca uçar; en dengeli dönem Nisan-Haziran ve Eylül-Ekim aylarıdır: sabahlar sakin, hava ılıktır. Kışın karlı peri bacaları çok etkileyicidir, ancak rüzgâr ve sis nedeniyle iptal ihtimali yaz aylarına göre daha yüksektir. Kasım-Mart arasında geliyorsanız uçuşu konaklamanızın son gününe koymayın; bir yedek gün bırakın.",
      "Uçuş her zaman gün doğumunda yapılır, çünkü rüzgâr sabahın erken saatinde en zayıftır. Otelden alış, gün doğumundan yaklaşık 1-1,5 saat önce başlar; mevsime göre sabah 04:00-05:30 arasına denk gelir. Kesin saat bir gün önceden bildirilir. Alıştan otele dönüşe kadar toplam süre genellikle üç ila dört saati bulur.",
    ],
  },
  {
    id: "kalkis-bolgeleri",
    heading: "Kalkış bölgeleri ve otel transferi",
    paragraphs: [
      "Alış, Göreme, Uçhisar, Ürgüp ve çevresindeki otellerden yapılır. Kalkış alanı ve rota o sabahın rüzgâr yönüne göre belirlenir; bu yüzden aynı otelden alınan iki misafirin kalkış noktası farklı günlerde farklı olabilir. Bu normaldir ve uçuşun kalitesini değiştirmez.",
      "Standart uçuşu Kaya Balon, İstanbul Balon, Butterfly Balloons, Asiana Balon ve Türkiye Balon ile yapıyoruz; hangi operatörün uçuracağı uçuş gününe ve doluluğa göre atanır. Romantik Özel Balon paketi Royal Balloon ve Butterfly Balloons ile düzenlenir. Operatörleri tek tek tanımak için operatörler sayfasına bakabilirsiniz.",
    ],
  },
  {
    id: "iptal-hava",
    heading: "Hava durumu ve iptal",
    paragraphs: [
      "Uçuşun yapılıp yapılmayacağına her sabah pilot ve sivil havacılık otoritesi karar verir. Rüzgâr 25 km/sa üzerine çıktığında, görüş azaldığında ya da yağış olduğunda balonlar yerde kalır; şüphe varsa uçulmaz. Karar, kalkış alanında sabah verilir; önceden kesin söylemek mümkün değildir.",
      "Hava nedeniyle iptalde ödemenin tamamı iade edilir ya da uçuşunuz konaklamanızdaki başka bir güne alınır. Güncel rüzgâr tahmini için 'Bugün balonlar uçuyor mu?' sayfasına bakabilirsiniz; bu bir tahmindir, kesin karar değildir.",
    ],
  },
  {
    id: "fiyat-nasil",
    heading: "Fiyat nasıl okunur?",
    paragraphs: [
      "Standart Balon Uçuşu kişi başı 100 €'dan başlar. 'Başlayan' sözü bilinçli seçildi: tarihe, sezona ve doluluğa göre güncel fiyat değişebilir, Romantik Özel Balon ise talebe göre fiyatlandırılır. Ödemeden önce tarihiniz için güncel fiyatı WhatsApp'tan öğrenin.",
      "Fiyatları karşılaştırırken yalnızca rakama değil, neyin dahil olduğuna (transfer, kahvaltı, sigorta, sertifika) ve sepette kaç kişi uçtuğuna bakın. Fiyat kalemlerinin ayrıntısı için fiyat rehberi yazımıza bakabilirsiniz.",
    ],
  },
  {
    id: "kimler-ucabilir",
    heading: "Kimler uçabilir, ne giymeli?",
    paragraphs: [
      "6 yaş ve üzeri çocuklar uçabilir; 7-12 yaş arası çocuklar için %80 oranında çocuk fiyatı uygulanır. Hamileler ve ciddi kalp ya da tansiyon sorunu olanlar güvenlik nedeniyle binemez.",
      "Sabahlar serin olur: katmanlı giyinin, kapalı ve rahat ayakkabı giyin, kışın eldiven ve şapka alın. Sepete girip çıkarken hareketinizi kısıtlamayan kıyafetler tercih edin.",
    ],
  },
];

// Extra FAQ shown only in this block (TR only, not in FAQ_ITEMS so the index-keyed
// locale files stay untouched). Questions do not repeat the ones already in FAQ_ITEMS.
export const TR_BALLOON_GUIDE_FAQ: { question: string; answer: string }[] = [
  {
    question: "Balon turunda otel transferi hangi bölgelerden yapılır?",
    answer:
      "Göreme, Uçhisar, Ürgüp ve çevresindeki otellerden otel alışı ve dönüşü paket fiyatına dahildir. Alış saati bir gün önceden bildirilir.",
  },
  {
    question: "Balon uçuşunu hangi operatörler yapıyor?",
    answer:
      "Standart Balon Uçuşu Kaya Balon, İstanbul Balon, Butterfly Balloons, Asiana Balon ve Türkiye Balon ile uçurulur; operatör uçuş gününe ve doluluğa göre atanır. Romantik Özel Balon Royal Balloon ve Butterfly Balloons ile düzenlenir.",
  },
  {
    question: "Hava nedeniyle uçuş iptal olursa param ne olur?",
    answer:
      "Hava nedeniyle iptalde ödemenin tamamı iade edilir ya da uçuşunuz konaklamanızdaki başka bir güne alınır. Kışın iptal ihtimali daha yüksek olduğundan son güne yedek gün bırakmanızı öneririz.",
  },
];

// Verifiable regulatory facts for /balonlar (TR). Quotes are verbatim from the SHGM
// (Sivil Havacılık Genel Müdürlüğü) documents, re-read 2026-10-19. The 105-balloon
// limit is the 2019 circular figure; later slot rules may differ - the text says so.
export interface TrGuideFact {
  id: string;
  text: string;
  quote: string;
  sourceLabel: string;
  sourceUrl: string;
}

export const TR_GUIDE_FACTS_HEADING = "Rakamlarla Kapadokya balon uçuşu: resmî kurallar";

export const TR_GUIDE_FACTS: TrGuideFact[] = [
  {
    id: "ucus-penceresi",
    text: "Sabah uçuş dönemi (ilk periyot), gün doğumundan 30 dakika önce başlar ve yerel saatle 11.00'de biter.",
    quote: "Gün doğumundan 30 dakika öncesiyle yerel 11.00 saatleri arasını",
    sourceLabel: "SHGM, SHT-BALON SLOT Rev.04",
    sourceUrl: "https://web.shgm.gov.tr/documents/sivilhavacilik/files/mevzuat/sektorel/talimatlar/2020/SHT-BALON_SLOT_Rev04.pdf",
  },
  {
    id: "bayrak",
    text: "Kırmızı ya da sarı bayrak ilan edildiğinde balon işletmelerine kalkış uygunluğu verilmez; yani şüpheli havada uçuş yapılmaz.",
    quote: "Kırmızı veya sarı bayrak ilan edilmesi durumunda balon işletmelerine kalkış uygunluğu verilmez.",
    sourceLabel: "SHGM, SHT-BALON SLOT Rev.04",
    sourceUrl: "https://web.shgm.gov.tr/documents/sivilhavacilik/files/mevzuat/sektorel/talimatlar/2020/SHT-BALON_SLOT_Rev04.pdf",
  },
  {
    id: "en-fazla-105",
    text: "SHGM'nin 27 Haziran 2019 tarihli genelgesi (UOD-2014/5), Kapadokya'da ilk periyotta aynı anda en fazla 105 balonun uçmasına izin verir. Bu, o genelgedeki rakamdır; sonraki slot kuralları farklı olabilir.",
    quote: "ilk periyodu gün doğumundan 30 dakika öncesi ile yerel 11.00 saatleri arasında ve aynı anda en fazla 105 balonun uçuşuna izin verilecektir",
    sourceLabel: "SHGM, Kapadokya Bölgesi Balonla Uçuş Tedbirleri Genelgesi (UOD-2014/5)",
    sourceUrl: "https://web.shgm.gov.tr/documents/sivilhavacilik/files/mevzuat/sektorel/genelgeler/2019/UOD-2014-5.pdf",
  },
];

export const TR_GUIDE_LAST_UPDATED = "2026-10-19";
