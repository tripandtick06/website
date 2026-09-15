export interface FAQItem {
  question: string;
  answer: string;
  category: "balon" | "rezervasyon" | "odeme" | "iptal" | "genel";
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    category: "balon",
    question: "Kapadokya balon turu kaç para?",
    answer: "Trip and Tick'te Kapadokya balon turu fiyatları kişi başı €165'ten başlar. Standart €165, Deluxe €295; Romantik özel sepet teklife göre fiyatlandırılır. Tüm fiyatlara otel transferi, kahvaltı, 40 milyon Euro sigorta, sertifika ve şampanya servisi dahildir.",
  },
  {
    category: "balon",
    question: "Kapadokya balona kaç yaşından itibaren binilir?",
    answer: "6 yaş ve üzeri çocuklar Kapadokya balon uçuşlarına katılabilir. 6 yaş altı çocuklar güvenlik nedeniyle binemez. 7-12 yaş arası çocuklar için %80 indirimli çocuk fiyatı uygulanır.",
  },
  {
    category: "balon",
    question: "Hamileler balona binebilir mi?",
    answer: "Hayır. Hamileler güvenlik nedeniyle balon uçuşlarına katılamaz. Ciddi kalp veya tansiyon sorunu olanlar da binmemelidir.",
  },
  {
    category: "iptal",
    question: "Kapadokya balon turu ne zaman iptal olur?",
    answer: "Hava koşulları nedeniyle iptal edilebilir: rüzgar 25 km/sa üzerinde, görüş azalması veya yağış. Operatör iptalinde %100 iade veya alternatif tarih.",
  },
  {
    category: "rezervasyon",
    question: "Kapadokya balon rezervasyonu nasıl yapılır?",
    answer: "5 dakikada: 1) Paket seçin, 2) Tarih ve kişi sayısını belirleyin, 3) Yolcu bilgilerini girin, 4) Güvenli ödeme yapın, 5) PDF biletiniz anında e-postanıza gelir. TR/EN destek.",
  },
  {
    category: "odeme",
    question: "Hangi ödeme yöntemleri kabul ediliyor?",
    answer: "Visa, Mastercard, American Express ve UnionPay. EUR, TRY, USD. 3D Secure desteği var. Amex ve UnionPay sadece TRY için.",
  },
  {
    category: "iptal",
    question: "İptal politikası nedir?",
    answer: "72+ saat öncesinde: %100 iade. 24-72 saat: %50 iade. 24 saatten az: iade yok. Operatör iptali (hava dahil): her zaman %100 iade veya alternatif tarih.",
  },
  {
    category: "balon",
    question: "Balon turu saat kaçta?",
    answer: "Balon uçuşları gün doğumunda yapılır. Otel transferi uçuştan 1-1,5 saat önce başlar — sabah 04:00-05:30 arası. Tam saat operatör programına ve mevsime göre değişir.",
  },
  {
    category: "balon",
    question: "Balon turu sırasında ne giyilir?",
    answer: "Katmanlı giyim (sabahlar serin). Kapalı, rahat ayakkabı şarttır. Şapka, eldiven (kış), güneş gözlüğü faydalı. Sepetten içeri-dışarı hareketinizi kısıtlamayan kıyafetler.",
  },
  {
    category: "genel",
    question: "Trip and Tick neden diğer sitelerden daha ucuz?",
    answer: "9+ operatörle doğrudan acentelik sözleşmemiz var; aracı komisyonu yok. En düşük fiyat garantimiz: daha ucuz teklif bulursanız o fiyatın %5 altında rezervasyon (aynı tarih + paket + kanıt).",
  },
  // 2026-09-16: intent FAQs from Google Autocomplete (kişi başı / TL, kaç dk,
  // saat kaçta, kaç kişi / 2 kişilik, en iyi ay). Index-keyed translations live in
  // src/data/i18n/data.<locale>.json under faq.f10..f13.
  {
    category: "balon",
    question: "Balon turu kişi başı ne kadar, TL ile ödenebilir mi?",
    answer: "Standart uçuş kişi başı €165, Deluxe €295; Romantik özel sepet teklife göre fiyatlandırılır. Fiyatlar Euro bazlıdır; TL ve USD karşılığını sitedeki para birimi seçiciyle o günkü kurdan görebilirsiniz. 7 gün içindeki tarihlerde fiyat hava ve doluluğa göre günlük değişebilir.",
  },
  {
    category: "balon",
    question: "Balon turu kaç dakika sürer, saat kaçta başlar?",
    answer: "Uçuş yaklaşık 60 dakika sürer (Romantik özel 60-90 dakika). Balonlar yalnızca gün doğumunda uçar; otelden alış gün doğumundan yaklaşık bir saat önce olur ve kesin saat bir gün önceden bildirilir. Bugünkü rüzgâr tahmini için 'Bugün balonlar uçuyor mu?' sayfasına bakın.",
  },
  {
    category: "balon",
    question: "Balona kaç kişi biner, 2 kişilik özel balon var mı?",
    answer: "Standart sepet 16-20, Deluxe sepet en fazla 16 yolcu alır. Yalnızca iki kişilik özel sepet Romantik Özel Balon paketiyle mümkündür; evlilik teklifi ve yıl dönümü için tercih edilir.",
  },
  {
    category: "balon",
    question: "Kapadokya balon turu için en iyi ay hangisi?",
    answer: "Balonlar yıl boyunca uçar. Nisan-Haziran ve Eylül-Ekim en dengeli dönemdir: sabahlar sakin, hava ılık. Kışın karlı peri bacaları etkileyicidir ama rüzgâr ve sis nedeniyle iptal ihtimali yaz aylarına göre daha yüksektir.",
  },
];
