"use client";

// Focused 9-language UI string dictionary for booking/travel components.
// Source language: TR. Translated naturally into en/de/fr/es/nl/zh/hi/ur.
// "{n}" placeholders preserved; "EUR"/"TRY" + brand names not translated.
// Server/non-hook use: import UI_TEXT directly. Client hook: useUiText().

import type { Locale } from "./dictionaries";
import { useLocale } from "@/lib/i18n/I18nProvider";

export interface UiText {
  nav: {
    myReservations: string;
  };
  hotelCard: {
    quoteCta: string;
    customPrice: string;
    expertTeam: string;
  };
  tier: {
    budget: string;
    mid: string;
    lux: string;
  };
  oteller: {
    bannerTitle: string;
    bannerBody: string;
  };
  steps: {
    s1t: string;
    s1d: string;
    s2t: string;
    s2d: string;
    s3t: string;
    s3d: string;
    s4t: string;
    s4d: string;
    s5t: string;
    s5d: string;
    hotelNote: string;
  };
  serviceCard: {
    infoForm: string;
    reserve: string;
    perCouple: string;
  };
  reviewScore: {
    excellent: string;
    veryGood: string;
    good: string;
    nice: string;
    reviews: string;
    ratingLabel: string;
  };
  availability: {
    lastSeats: string;
    limited: string;
    soldOut: string;
  };
  inquiry: {
    sending: string;
    submit: string;
    received: string;
    error: string;
  };
}

export const UI_TEXT: Record<Locale, UiText> = {
  tr: {
    nav: {
      myReservations: "Rezervasyonum",
    },
    hotelCard: {
      quoteCta: "Fiyat teklifi al",
      customPrice: "Size özel fiyat",
      expertTeam: "Uzman ekip teklif hazırlar",
    },
    tier: {
      budget: "Ekonomik",
      mid: "Orta segment",
      lux: "Lüks / Premium",
    },
    oteller: {
      bannerTitle: "Online rezervasyon yakında",
      bannerBody:
        'Şu an otelleri online rezerve edemiyorsunuz. Uzman ekibimiz size özel fiyat ve uygun müsaitlik hazırlıyor — kartlardan "Fiyat teklifi al" deyin, 24 saat içinde dönüş yapalım.',
    },
    steps: {
      s1t: "Hizmeti Seç",
      s1d: "Balon, tur, aktivite veya paket — ihtiyacınıza göre filtreleyin.",
      s2t: "Tarih & Kişi",
      s2d: "Tarihinizi seçin, anlık müsaitliği görün, kişi sayısını belirleyin.",
      s3t: "Bilgileri Girin",
      s3d: "Yolcu bilgilerini doldurun, seyahat sigortası ekleyin.",
      s4t: "Güvenli Öde",
      s4d: "Visa, Mastercard, 3D Secure ile EUR veya TRY ödeme.",
      s5t: "Bilet E-postanızda",
      s5d: "PDF biletiniz anında e-postanıza gelir. Hazırsınız!",
      hotelNote:
        'Oteller için online ödeme yerine uzman ekibimiz size özel fiyat ve müsaitlik hazırlar — otel kartından "Fiyat teklifi al" deyin, 24 saat içinde dönelim.',
    },
    serviceCard: {
      infoForm: "Bilgi & Form",
      reserve: "Rezervasyon",
      perCouple: "çift başı",
    },
    reviewScore: {
      excellent: "Mükemmel",
      veryGood: "Çok iyi",
      good: "İyi",
      nice: "Güzel",
      reviews: "yorum",
      ratingLabel: "Değerlendirme",
    },
    availability: {
      lastSeats: "Son {n} koltuk",
      limited: "Az kaldı",
      soldOut: "Dolu",
    },
    inquiry: {
      sending: "Gönderiliyor...",
      submit: "Bilgi & Fiyat Teklifi İste",
      received: "Talebiniz alındı.",
      error: "Bir hata oluştu",
    },
  },
  en: {
    nav: {
      myReservations: "My Reservations",
    },
    hotelCard: {
      quoteCta: "Get a price quote",
      customPrice: "Custom price for you",
      expertTeam: "Our expert team prepares your quote",
    },
    tier: {
      budget: "Budget",
      mid: "Mid-range",
      lux: "Luxury / Premium",
    },
    oteller: {
      bannerTitle: "Online booking coming soon",
      bannerBody:
        'You can’t book hotels online just yet. Our expert team is preparing a custom price and live availability for you — tap "Get a price quote" on any card and we’ll get back to you within 24 hours.',
    },
    steps: {
      s1t: "Choose a Service",
      s1d: "Balloon, tour, activity or package — filter by what you need.",
      s2t: "Date & Guests",
      s2d: "Pick your date, see live availability, set the number of guests.",
      s3t: "Enter Details",
      s3d: "Fill in traveller details and add travel insurance.",
      s4t: "Pay Securely",
      s4d: "Pay in EUR or TRY with Visa, Mastercard and 3D Secure.",
      s5t: "Ticket in Your Inbox",
      s5d: "Your PDF ticket arrives in your inbox instantly. You’re all set!",
      hotelNote:
        'For hotels, instead of paying online, our expert team prepares a custom price and availability for you — tap "Get a price quote" on the hotel card and we’ll get back within 24 hours.',
    },
    serviceCard: {
      infoForm: "Info & Form",
      reserve: "Book Now",
      perCouple: "per couple",
    },
    reviewScore: {
      excellent: "Excellent",
      veryGood: "Very good",
      good: "Good",
      nice: "Nice",
      reviews: "reviews",
      ratingLabel: "Rating",
    },
    availability: {
      lastSeats: "Last {n} seats",
      limited: "Almost gone",
      soldOut: "Sold out",
    },
    inquiry: {
      sending: "Sending...",
      submit: "Request Info & Price Quote",
      received: "Your request has been received.",
      error: "Something went wrong",
    },
  },
  de: {
    nav: {
      myReservations: "Meine Buchungen",
    },
    hotelCard: {
      quoteCta: "Preisangebot anfordern",
      customPrice: "Individueller Preis für Sie",
      expertTeam: "Unser Expertenteam erstellt Ihr Angebot",
    },
    tier: {
      budget: "Günstig",
      mid: "Mittelklasse",
      lux: "Luxus / Premium",
    },
    oteller: {
      bannerTitle: "Online-Buchung in Kürze",
      bannerBody:
        'Hotels können Sie derzeit noch nicht online buchen. Unser Expertenteam erstellt für Sie einen individuellen Preis mit aktueller Verfügbarkeit — tippen Sie auf einer Karte auf "Preisangebot anfordern" und wir melden uns innerhalb von 24 Stunden.',
    },
    steps: {
      s1t: "Leistung wählen",
      s1d: "Ballon, Tour, Aktivität oder Paket — filtern Sie nach Ihrem Bedarf.",
      s2t: "Datum & Personen",
      s2d: "Datum wählen, Live-Verfügbarkeit sehen, Personenzahl festlegen.",
      s3t: "Daten eingeben",
      s3d: "Reisendendaten ausfüllen und Reiseversicherung hinzufügen.",
      s4t: "Sicher bezahlen",
      s4d: "Zahlung in EUR oder TRY mit Visa, Mastercard und 3D Secure.",
      s5t: "Ticket in Ihrem Postfach",
      s5d: "Ihr PDF-Ticket landet sofort in Ihrem Postfach. Fertig!",
      hotelNote:
        'Für Hotels erstellt unser Expertenteam statt einer Online-Zahlung einen individuellen Preis mit Verfügbarkeit für Sie — tippen Sie auf der Hotelkarte auf "Preisangebot anfordern" und wir melden uns innerhalb von 24 Stunden.',
    },
    serviceCard: {
      infoForm: "Info & Formular",
      reserve: "Jetzt buchen",
      perCouple: "pro Paar",
    },
    reviewScore: {
      excellent: "Ausgezeichnet",
      veryGood: "Sehr gut",
      good: "Gut",
      nice: "Schön",
      reviews: "Bewertungen",
      ratingLabel: "Bewertung",
    },
    availability: {
      lastSeats: "Letzte {n} Plätze",
      limited: "Fast ausgebucht",
      soldOut: "Ausgebucht",
    },
    inquiry: {
      sending: "Wird gesendet...",
      submit: "Info & Preisangebot anfordern",
      received: "Ihre Anfrage ist eingegangen.",
      error: "Ein Fehler ist aufgetreten",
    },
  },
  fr: {
    nav: {
      myReservations: "Mes réservations",
    },
    hotelCard: {
      quoteCta: "Obtenir un devis",
      customPrice: "Prix personnalisé pour vous",
      expertTeam: "Notre équipe d’experts prépare votre devis",
    },
    tier: {
      budget: "Économique",
      mid: "Milieu de gamme",
      lux: "Luxe / Premium",
    },
    oteller: {
      bannerTitle: "Réservation en ligne bientôt disponible",
      bannerBody:
        'Vous ne pouvez pas encore réserver les hôtels en ligne. Notre équipe d’experts vous prépare un prix personnalisé et des disponibilités en temps réel — appuyez sur "Obtenir un devis" sur une carte et nous vous répondrons sous 24 heures.',
    },
    steps: {
      s1t: "Choisir un service",
      s1d: "Montgolfière, excursion, activité ou forfait — filtrez selon vos besoins.",
      s2t: "Date & Personnes",
      s2d: "Choisissez votre date, voyez les disponibilités en direct, indiquez le nombre de personnes.",
      s3t: "Saisir les informations",
      s3d: "Remplissez les informations des voyageurs et ajoutez une assurance voyage.",
      s4t: "Payer en toute sécurité",
      s4d: "Paiement en EUR ou TRY avec Visa, Mastercard et 3D Secure.",
      s5t: "Billet dans votre boîte mail",
      s5d: "Votre billet PDF arrive instantanément dans votre boîte mail. C’est prêt !",
      hotelNote:
        'Pour les hôtels, au lieu d’un paiement en ligne, notre équipe d’experts vous prépare un prix personnalisé et des disponibilités — appuyez sur "Obtenir un devis" sur la carte de l’hôtel et nous revenons vers vous sous 24 heures.',
    },
    serviceCard: {
      infoForm: "Infos & Formulaire",
      reserve: "Réserver",
      perCouple: "par couple",
    },
    reviewScore: {
      excellent: "Excellent",
      veryGood: "Très bien",
      good: "Bien",
      nice: "Agréable",
      reviews: "avis",
      ratingLabel: "Évaluation",
    },
    availability: {
      lastSeats: "Dernières {n} places",
      limited: "Bientôt complet",
      soldOut: "Complet",
    },
    inquiry: {
      sending: "Envoi en cours...",
      submit: "Demander infos & devis",
      received: "Votre demande a bien été reçue.",
      error: "Une erreur s’est produite",
    },
  },
  es: {
    nav: {
      myReservations: "Mis reservas",
    },
    hotelCard: {
      quoteCta: "Solicitar presupuesto",
      customPrice: "Precio personalizado para ti",
      expertTeam: "Nuestro equipo experto prepara tu presupuesto",
    },
    tier: {
      budget: "Económico",
      mid: "Gama media",
      lux: "Lujo / Premium",
    },
    oteller: {
      bannerTitle: "Reserva online próximamente",
      bannerBody:
        'Todavía no puedes reservar hoteles online. Nuestro equipo experto te prepara un precio personalizado y disponibilidad en tiempo real — pulsa "Solicitar presupuesto" en cualquier tarjeta y te responderemos en 24 horas.',
    },
    steps: {
      s1t: "Elige un servicio",
      s1d: "Globo, tour, actividad o paquete — filtra según lo que necesites.",
      s2t: "Fecha y personas",
      s2d: "Elige tu fecha, consulta la disponibilidad al instante y define el número de personas.",
      s3t: "Introduce los datos",
      s3d: "Rellena los datos de los viajeros y añade un seguro de viaje.",
      s4t: "Paga con seguridad",
      s4d: "Paga en EUR o TRY con Visa, Mastercard y 3D Secure.",
      s5t: "Billete en tu correo",
      s5d: "Tu billete en PDF llega al instante a tu correo. ¡Todo listo!",
      hotelNote:
        'Para los hoteles, en lugar del pago online, nuestro equipo experto te prepara un precio personalizado y disponibilidad — pulsa "Solicitar presupuesto" en la tarjeta del hotel y te respondemos en 24 horas.',
    },
    serviceCard: {
      infoForm: "Info y formulario",
      reserve: "Reservar",
      perCouple: "por pareja",
    },
    reviewScore: {
      excellent: "Excelente",
      veryGood: "Muy bueno",
      good: "Bueno",
      nice: "Agradable",
      reviews: "opiniones",
      ratingLabel: "Valoración",
    },
    availability: {
      lastSeats: "Últimas {n} plazas",
      limited: "Casi agotado",
      soldOut: "Agotado",
    },
    inquiry: {
      sending: "Enviando...",
      submit: "Solicitar info y presupuesto",
      received: "Hemos recibido tu solicitud.",
      error: "Se ha producido un error",
    },
  },
  nl: {
    nav: {
      myReservations: "Mijn reserveringen",
    },
    hotelCard: {
      quoteCta: "Vraag een prijsofferte aan",
      customPrice: "Speciale prijs voor jou",
      expertTeam: "Ons expertteam stelt je offerte op",
    },
    tier: {
      budget: "Voordelig",
      mid: "Middensegment",
      lux: "Luxe / Premium",
    },
    oteller: {
      bannerTitle: "Online boeken binnenkort",
      bannerBody:
        'Hotels kun je nog niet online boeken. Ons expertteam stelt voor jou een persoonlijke prijs en actuele beschikbaarheid op — tik op een kaart op "Vraag een prijsofferte aan" en we nemen binnen 24 uur contact op.',
    },
    steps: {
      s1t: "Kies een dienst",
      s1d: "Ballon, tour, activiteit of pakket — filter op wat je nodig hebt.",
      s2t: "Datum & personen",
      s2d: "Kies je datum, bekijk de actuele beschikbaarheid en stel het aantal personen in.",
      s3t: "Vul gegevens in",
      s3d: "Vul de reizigersgegevens in en voeg een reisverzekering toe.",
      s4t: "Veilig betalen",
      s4d: "Betaal in EUR of TRY met Visa, Mastercard en 3D Secure.",
      s5t: "Ticket in je inbox",
      s5d: "Je pdf-ticket komt direct in je inbox. Helemaal klaar!",
      hotelNote:
        'Voor hotels stelt ons expertteam in plaats van online betalen een persoonlijke prijs en beschikbaarheid voor je op — tik op de hotelkaart op "Vraag een prijsofferte aan" en we komen binnen 24 uur bij je terug.',
    },
    serviceCard: {
      infoForm: "Info & formulier",
      reserve: "Reserveren",
      perCouple: "per koppel",
    },
    reviewScore: {
      excellent: "Uitstekend",
      veryGood: "Heel goed",
      good: "Goed",
      nice: "Prima",
      reviews: "beoordelingen",
      ratingLabel: "Beoordeling",
    },
    availability: {
      lastSeats: "Laatste {n} plaatsen",
      limited: "Bijna vol",
      soldOut: "Uitverkocht",
    },
    inquiry: {
      sending: "Verzenden...",
      submit: "Vraag info & prijsofferte aan",
      received: "Je aanvraag is ontvangen.",
      error: "Er is iets misgegaan",
    },
  },
  zh: {
    nav: {
      myReservations: "我的预订",
    },
    hotelCard: {
      quoteCta: "获取报价",
      customPrice: "为您定制的价格",
      expertTeam: "专业团队为您准备报价",
    },
    tier: {
      budget: "经济型",
      mid: "中端",
      lux: "豪华 / 高端",
    },
    oteller: {
      bannerTitle: "在线预订即将上线",
      bannerBody:
        '目前暂时无法在线预订酒店。我们的专业团队正在为您准备专属价格和实时房态——在任意卡片上点击"获取报价"，我们将在 24 小时内回复您。',
    },
    steps: {
      s1t: "选择服务",
      s1d: "热气球、旅游、活动或套餐——按您的需求筛选。",
      s2t: "日期和人数",
      s2d: "选择日期，查看实时房态，确定人数。",
      s3t: "填写信息",
      s3d: "填写出行人信息，并添加旅行保险。",
      s4t: "安全支付",
      s4d: "使用 Visa、Mastercard 和 3D Secure 以 EUR 或 TRY 支付。",
      s5t: "票据发送至邮箱",
      s5d: "您的 PDF 票据将即时发送到您的邮箱。一切就绪！",
      hotelNote:
        '酒店方面，我们的专业团队会为您准备专属价格和房态，无需在线支付——在酒店卡片上点击"获取报价"，我们将在 24 小时内回复您。',
    },
    serviceCard: {
      infoForm: "信息与表单",
      reserve: "立即预订",
      perCouple: "每对",
    },
    reviewScore: {
      excellent: "极好",
      veryGood: "非常好",
      good: "好",
      nice: "不错",
      reviews: "条评价",
      ratingLabel: "评分",
    },
    availability: {
      lastSeats: "仅剩 {n} 个座位",
      limited: "所剩无几",
      soldOut: "已售罄",
    },
    inquiry: {
      sending: "发送中...",
      submit: "索取信息与报价",
      received: "已收到您的请求。",
      error: "发生错误",
    },
  },
  hi: {
    nav: {
      myReservations: "मेरी बुकिंग",
    },
    hotelCard: {
      quoteCta: "मूल्य कोटेशन प्राप्त करें",
      customPrice: "आपके लिए विशेष मूल्य",
      expertTeam: "हमारी विशेषज्ञ टीम आपका कोटेशन तैयार करती है",
    },
    tier: {
      budget: "किफायती",
      mid: "मध्यम श्रेणी",
      lux: "लक्ज़री / प्रीमियम",
    },
    oteller: {
      bannerTitle: "ऑनलाइन बुकिंग जल्द ही",
      bannerBody:
        'अभी आप होटल ऑनलाइन बुक नहीं कर सकते। हमारी विशेषज्ञ टीम आपके लिए विशेष मूल्य और मौजूदा उपलब्धता तैयार कर रही है — किसी भी कार्ड पर "मूल्य कोटेशन प्राप्त करें" दबाएँ, हम 24 घंटे के भीतर आपसे संपर्क करेंगे।',
    },
    steps: {
      s1t: "सेवा चुनें",
      s1d: "बैलून, टूर, गतिविधि या पैकेज — अपनी ज़रूरत के अनुसार फ़िल्टर करें।",
      s2t: "तारीख और व्यक्ति",
      s2d: "अपनी तारीख चुनें, तत्काल उपलब्धता देखें, व्यक्तियों की संख्या तय करें।",
      s3t: "जानकारी भरें",
      s3d: "यात्री की जानकारी भरें और यात्रा बीमा जोड़ें।",
      s4t: "सुरक्षित भुगतान करें",
      s4d: "Visa, Mastercard और 3D Secure के साथ EUR या TRY में भुगतान करें।",
      s5t: "टिकट आपके ईमेल में",
      s5d: "आपका PDF टिकट तुरंत आपके ईमेल में आ जाता है। आप तैयार हैं!",
      hotelNote:
        'होटलों के लिए ऑनलाइन भुगतान के बजाय हमारी विशेषज्ञ टीम आपके लिए विशेष मूल्य और उपलब्धता तैयार करती है — होटल कार्ड पर "मूल्य कोटेशन प्राप्त करें" दबाएँ, हम 24 घंटे के भीतर आपसे संपर्क करेंगे।',
    },
    serviceCard: {
      infoForm: "जानकारी और फ़ॉर्म",
      reserve: "बुक करें",
      perCouple: "प्रति जोड़ा",
    },
    reviewScore: {
      excellent: "उत्कृष्ट",
      veryGood: "बहुत अच्छा",
      good: "अच्छा",
      nice: "बढ़िया",
      reviews: "समीक्षाएँ",
      ratingLabel: "मूल्यांकन",
    },
    availability: {
      lastSeats: "आख़िरी {n} सीटें",
      limited: "बहुत कम बची हैं",
      soldOut: "भर गया",
    },
    inquiry: {
      sending: "भेजा जा रहा है...",
      submit: "जानकारी और मूल्य कोटेशन माँगें",
      received: "आपका अनुरोध प्राप्त हो गया है।",
      error: "एक त्रुटि हुई",
    },
  },
  ur: {
    nav: {
      myReservations: "میری بکنگ",
    },
    hotelCard: {
      quoteCta: "قیمت کا تخمینہ حاصل کریں",
      customPrice: "آپ کے لیے خصوصی قیمت",
      expertTeam: "ہماری ماہر ٹیم آپ کا تخمینہ تیار کرتی ہے",
    },
    tier: {
      budget: "کفایتی",
      mid: "درمیانی درجہ",
      lux: "لگژری / پریمیم",
    },
    oteller: {
      bannerTitle: "آن لائن بکنگ جلد آرہی ہے",
      bannerBody:
        'فی الحال آپ ہوٹل آن لائن بک نہیں کر سکتے۔ ہماری ماہر ٹیم آپ کے لیے خصوصی قیمت اور موجودہ دستیابی تیار کر رہی ہے — کسی بھی کارڈ پر "قیمت کا تخمینہ حاصل کریں" دبائیں، ہم 24 گھنٹوں کے اندر آپ سے رابطہ کریں گے۔',
    },
    steps: {
      s1t: "سروس منتخب کریں",
      s1d: "بیلون، ٹور، سرگرمی یا پیکیج — اپنی ضرورت کے مطابق فلٹر کریں۔",
      s2t: "تاریخ اور افراد",
      s2d: "اپنی تاریخ منتخب کریں، فوری دستیابی دیکھیں، افراد کی تعداد طے کریں۔",
      s3t: "معلومات درج کریں",
      s3d: "مسافروں کی معلومات بھریں اور سفری بیمہ شامل کریں۔",
      s4t: "محفوظ ادائیگی کریں",
      s4d: "Visa، Mastercard اور 3D Secure کے ساتھ EUR یا TRY میں ادائیگی کریں۔",
      s5t: "ٹکٹ آپ کی ای میل میں",
      s5d: "آپ کا PDF ٹکٹ فوراً آپ کی ای میل میں آجاتا ہے۔ آپ تیار ہیں!",
      hotelNote:
        'ہوٹلوں کے لیے آن لائن ادائیگی کے بجائے ہماری ماہر ٹیم آپ کے لیے خصوصی قیمت اور دستیابی تیار کرتی ہے — ہوٹل کارڈ پر "قیمت کا تخمینہ حاصل کریں" دبائیں، ہم 24 گھنٹوں کے اندر آپ سے رابطہ کریں گے۔',
    },
    serviceCard: {
      infoForm: "معلومات اور فارم",
      reserve: "بک کریں",
      perCouple: "فی جوڑا",
    },
    reviewScore: {
      excellent: "بہترین",
      veryGood: "بہت اچھا",
      good: "اچھا",
      nice: "عمدہ",
      reviews: "تبصرے",
      ratingLabel: "درجہ بندی",
    },
    availability: {
      lastSeats: "آخری {n} نشستیں",
      limited: "بہت کم باقی",
      soldOut: "فروخت ہو چکا",
    },
    inquiry: {
      sending: "بھیجا جا رہا ہے...",
      submit: "معلومات اور قیمت کا تخمینہ طلب کریں",
      received: "آپ کی درخواست موصول ہوگئی ہے۔",
      error: "ایک خرابی پیش آگئی",
    },
  },
};

/**
 * Client hook: returns the UI string set for the current locale,
 * falling back to Turkish if a locale is missing.
 */
export function useUiText(): UiText {
  const { locale } = useLocale();
  return UI_TEXT[locale] ?? UI_TEXT.tr;
}
