export interface FAQItem {
  question: string;
  answer: string;
  category: "balon" | "rezervasyon" | "odeme" | "iptal" | "genel";
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    category: "balon",
    question: "Kapadokya balon turu kaç para?",
    answer: "Trip and Tick'te Kapadokya balon turu fiyatları kişi başı €165'ten başlar. Standart €165, Konfor €215, Deluxe €295, Romantik özel €580. Tüm fiyatlara otel transferi, kahvaltı, 40 milyon Euro sigorta, sertifika ve şampanya servisi dahildir.",
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
];
