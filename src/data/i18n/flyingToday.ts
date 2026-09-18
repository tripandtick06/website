// "Bugün balonlar uçuyor mu?" page copy — 7 indexable locales, EN fallback.
// Kept out of the big dictionaries on purpose (single page, single owner).
// Every sentence is either a weather-reading of the live forecast, a site
// policy that exists elsewhere on the site (100 % refund on weather
// cancellation), or general, non-numeric guidance. No cancellation statistics
// are claimed anywhere — there is no public dataset for them.

export interface FlyingTodayCopy {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  /** Loud, always-visible disclaimer. */
  disclaimer: string;
  updated: string;
  today: string;
  sunrise: string;
  wind: string;
  gusts: string;
  visibility: string;
  rain: string;
  outlook: Record<"likely" | "marginal" | "unlikely" | "unknown", string>;
  outlookNote: Record<"likely" | "marginal" | "unlikely" | "unknown", string>;
  nextDays: string;
  unavailable: string;
  whyTitle: string;
  why: string[];
  bookingTitle: string;
  booking: string[];
  tipsTitle: string;
  tips: string[];
  faqTitle: string;
  faq: { q: string; a: string }[];
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  operatorsLink: string;
  source: string;
}

const tr: FlyingTodayCopy = {
  metaTitle: "Bugün Kapadokya'da Balonlar Uçuyor mu? Rüzgâr Tahmini",
  metaDescription:
    "Kapadokya balon uçuşları bugün ve önümüzdeki 3 gün için gün doğumu rüzgâr, hamle ve görüş tahmini. Resmi karar her sabah verilir; iptalde %100 iade.",
  h1: "Bugün Kapadokya'da balonlar uçuyor mu?",
  intro:
    "Balonlar yalnızca gün doğumunda, sakin rüzgârda uçar. Aşağıda Göreme için gün doğumu saatindeki rüzgâr, hamle, görüş ve yağış olasılığı tahmini var; buna göre uçuşun ne kadar olası göründüğünü işaretliyoruz.",
  disclaimer:
    "Bu bir hava tahmini yorumudur, resmi uçuş kararı değildir. Kesin karar her sabah kalkıştan kısa süre önce Türk sivil havacılık otoritesi tarafından verilir ve tahminden farklı olabilir. Rezervasyonunuz varsa operatörünüz sizi arar.",
  updated: "Tahmin güncellendi",
  today: "Bugün",
  sunrise: "Gün doğumu",
  wind: "Rüzgâr",
  gusts: "Hamle",
  visibility: "Görüş",
  rain: "Yağış olasılığı",
  outlook: {
    likely: "Uçuşa elverişli görünüyor",
    marginal: "Sınırda — karar sabah netleşir",
    unlikely: "İptal olasılığı yüksek",
    unknown: "Tahmin verisi alınamadı",
  },
  outlookNote: {
    likely: "Rüzgâr ve görüş balon uçuşu için tipik sınırların içinde.",
    marginal: "Rüzgâr ya da hamle sınıra yakın; otorite sabah ölçümüne göre karar verir.",
    unlikely: "Rüzgâr, hamle, yağış veya görüş balon uçuşu için genellikle fazla.",
    unknown: "Tahmin servisine ulaşılamadı; sayfayı biraz sonra yenileyin.",
  },
  nextDays: "Önümüzdeki günler",
  unavailable: "Tahmin şu anda alınamıyor.",
  whyTitle: "Balon uçuşları neden iptal edilir?",
  why: [
    "Rüzgâr: Balon yönlendirilemez, rüzgârla gider. Yer rüzgârı belirli bir hızı aştığında kalkış ve özellikle iniş güvenli olmaktan çıkar.",
    "Hamle (ani rüzgâr): Ortalama rüzgâr düşük olsa bile sert hamleler iniş sırasında sepeti sürükleyebilir.",
    "Yağış ve sis: Yağmur balon kumaşını ağırlaştırır, sis görüşü keser; her ikisi de uçuşu durdurur.",
    "Karar tek elden verilir: Kapadokya'daki tüm operatörler için uçuş izni her sabah aynı anda, sivil havacılık otoritesinin ölçümüne göre çıkar. Bir operatör uçuyorsa hepsi uçar; iptal varsa herkes iptal eder.",
  ],
  bookingTitle: "Uçuş iptal olursa rezervasyonum ne olur?",
  booking: [
    "Operatör hava nedeniyle iptal ederse ödemenizin tamamı iade edilir veya uçuş konaklamanızdaki başka bir güne alınır — siz seçersiniz.",
    "İptal kararı çoğunlukla otelden alınmadan önce, bazen de kalkış alanında verilir. Her iki durumda da hakkınız aynıdır.",
    "Trip and Tick üzerinden yapılan rezervasyonlarda iade veya tarih değişikliğini WhatsApp üzerinden anında talep edebilirsiniz.",
  ],
  tipsTitle: "İptal riskine karşı pratik öneriler",
  tips: [
    "Balon uçuşunu Kapadokya'daki ilk sabahınıza alın; iptal olursa sonraki sabahlar yedek olur.",
    "Kapadokya'da en az iki, tercihen üç gece kalın.",
    "Uçuş sabahı telefonunuzu açık tutun; operatör iptal veya saat değişikliğini telefonla bildirir.",
    "Tahmin 'sınırda' görünüyorsa hemen vazgeçmeyin; sabah ölçümü çoğu zaman tahminden daha sakin çıkar.",
  ],
  faqTitle: "Sık sorulan sorular",
  faq: [
    {
      q: "Kapadokya'da balonlar hangi saatte uçar?",
      a: "Yalnızca gün doğumu civarında, çünkü gün içinde ısınan hava termik ve rüzgâr üretir. Otelden alış gün doğumundan yaklaşık bir saat önce olur; kesin saat bir gün önceden bildirilir.",
    },
    {
      q: "Uçuş kararını kim verir?",
      a: "Türk sivil havacılık otoritesi, her sabah Kapadokya için tek bir karar verir; operatörler bu karara uyar. Bu sayfadaki tahmin o kararın yerine geçmez.",
    },
    {
      q: "Balonlar kışın uçar mı?",
      a: "Evet, Kapadokya'da balonlar yıl boyunca uçar. Kışın soğuk hava kaldırma gücünü artırır ama rüzgâr, kar ve sis nedeniyle iptal ihtimali yaz aylarına göre daha yüksektir.",
    },
    {
      q: "İptal olursa paramı geri alır mıyım?",
      a: "Evet. Operatörün hava nedeniyle iptal ettiği uçuşlarda ödemenin tamamı iade edilir veya uçuş başka bir güne taşınır.",
    },
    {
      q: "Balon uçuşu için rüzgâr sınırı kaç km/h?",
      a: "Kesin bir kamuya açık eşik yoktur; uygulamada yer rüzgârı yaklaşık 18 km/h'yi (10 knot) aştığında, sert hamlelerde, yağışta veya düşük görüşte uçuş yapılmaz. Bu sayfa daha temkinli bantlar kullanır.",
    },
  ],
  ctaTitle: "Uçuşunuzu planlayın",
  ctaText: "Standart balon uçuşunda 100 €'dan başlayan güncel fiyatı görün, hava iptalinde %100 iade güvencesiyle rezervasyon yapın.",
  ctaButton: "Balon turlarını gör",
  operatorsLink: "Anlaşmalı balon operatörleri",
  source: "Tahmin kaynağı: Open-Meteo (Göreme, 10 m rüzgâr). Sayfa her 30 dakikada güncellenir.",
};

const en: FlyingTodayCopy = {
  metaTitle: "Are Balloons Flying in Cappadocia Today? Wind Forecast",
  metaDescription:
    "Cappadocia hot air balloon outlook for today and the next 3 days: sunrise wind, gusts, visibility and rain. The official decision is made each morning; 100% refund if cancelled.",
  h1: "Are the balloons flying in Cappadocia today?",
  intro:
    "Balloons only fly at sunrise in calm wind. Below is the Göreme forecast for the sunrise hour — wind, gusts, visibility and rain probability — and how likely a flight looks based on it.",
  disclaimer:
    "This is a reading of the weather forecast, not the official flight decision. The go/no-go is issued each morning shortly before take-off by the Turkish civil aviation authority and can differ from any forecast. If you have a booking, your operator will call you.",
  updated: "Forecast updated",
  today: "Today",
  sunrise: "Sunrise",
  wind: "Wind",
  gusts: "Gusts",
  visibility: "Visibility",
  rain: "Rain probability",
  outlook: {
    likely: "Looks flyable",
    marginal: "Marginal — decided in the morning",
    unlikely: "Cancellation likely",
    unknown: "Forecast unavailable",
  },
  outlookNote: {
    likely: "Wind and visibility are inside the usual limits for balloon flights.",
    marginal: "Wind or gusts are close to the limit; the authority decides on the morning measurement.",
    unlikely: "Wind, gusts, rain or visibility are usually too much for a balloon flight.",
    unknown: "The forecast service could not be reached; refresh in a moment.",
  },
  nextDays: "Next days",
  unavailable: "The forecast is not available right now.",
  whyTitle: "Why do balloon flights get cancelled?",
  why: [
    "Wind: a balloon cannot be steered, it goes with the wind. Above a certain surface wind speed take-off and especially landing stop being safe.",
    "Gusts: even with a low average wind, strong gusts can drag the basket on landing.",
    "Rain and fog: rain makes the envelope heavy, fog removes visibility; both ground the flight.",
    "One decision for everyone: flight clearance for all Cappadocia operators is issued at the same time each morning, based on the civil aviation authority's measurement. If one operator flies, all fly; if it is cancelled, it is cancelled for everyone.",
  ],
  bookingTitle: "What happens to my booking if the flight is cancelled?",
  booking: [
    "If the operator cancels for weather you get a full refund or the flight is moved to another morning of your stay — your choice.",
    "The decision is usually made before hotel pickup, sometimes at the launch site. Your rights are the same either way.",
    "For bookings made through Trip and Tick you can request the refund or new date instantly on WhatsApp.",
  ],
  tipsTitle: "Practical tips against the cancellation risk",
  tips: [
    "Book the balloon for your first morning in Cappadocia; if it is cancelled, the following mornings are your backup.",
    "Stay at least two, ideally three nights in Cappadocia.",
    "Keep your phone on the morning of the flight; the operator calls about cancellations or time changes.",
    "If the forecast says 'marginal', do not give up yet: the morning measurement is often calmer than the forecast.",
  ],
  faqTitle: "Frequently asked questions",
  faq: [
    {
      q: "What time do the balloons fly in Cappadocia?",
      a: "Only around sunrise, because the air warming during the day creates thermals and wind. Hotel pickup is about an hour before sunrise; the exact time is confirmed the day before.",
    },
    {
      q: "Who decides whether the balloons fly?",
      a: "The Turkish civil aviation authority issues one decision for Cappadocia each morning; operators follow it. The outlook on this page does not replace that decision.",
    },
    {
      q: "Do the balloons fly in winter?",
      a: "Yes, balloons fly in Cappadocia all year. Cold winter air even improves lift, but wind, snow and fog make cancellations more frequent than in summer.",
    },
    {
      q: "Do I get my money back if it is cancelled?",
      a: "Yes. For flights the operator cancels because of weather, the full payment is refunded or the flight is moved to another day.",
    },
    {
      q: "What is the wind limit for a balloon flight?",
      a: "There is no single published threshold; in practice flights do not go when surface wind exceeds roughly 18 km/h (10 knots), with strong gusts, rain or low visibility. This page uses more conservative bands.",
    },
  ],
  ctaTitle: "Plan your flight",
  ctaText: "See the current price of the Standard balloon flight, from €100, and book with a 100% refund guarantee on weather cancellation.",
  ctaButton: "See balloon tours",
  operatorsLink: "Partner balloon operators",
  source: "Forecast source: Open-Meteo (Göreme, 10 m wind). Page refreshes every 30 minutes.",
};

const de: FlyingTodayCopy = {
  ...en,
  metaTitle: "Fliegen die Ballons in Kappadokien heute? Windprognose",
  metaDescription:
    "Ballonfahrt Kappadokien: Prognose für heute und die nächsten 3 Tage — Wind, Böen, Sicht und Regen zum Sonnenaufgang. Die offizielle Entscheidung fällt jeden Morgen; 100 % Erstattung bei Absage.",
  h1: "Fliegen die Ballons in Kappadokien heute?",
  intro:
    "Ballons fahren nur bei Sonnenaufgang und ruhigem Wind. Unten steht die Göreme-Prognose für die Sonnenaufgangsstunde — Wind, Böen, Sicht, Regenwahrscheinlichkeit — und wie wahrscheinlich eine Fahrt danach aussieht.",
  disclaimer:
    "Das ist eine Deutung der Wetterprognose, nicht die offizielle Flugentscheidung. Die Freigabe erteilt jeden Morgen kurz vor dem Start die türkische Zivilluftfahrtbehörde; sie kann von jeder Prognose abweichen. Bei einer Buchung ruft Sie Ihr Veranstalter an.",
  updated: "Prognose aktualisiert",
  today: "Heute",
  sunrise: "Sonnenaufgang",
  wind: "Wind",
  gusts: "Böen",
  visibility: "Sicht",
  rain: "Regenwahrscheinlichkeit",
  outlook: {
    likely: "Sieht fahrbar aus",
    marginal: "Grenzwertig — Entscheidung am Morgen",
    unlikely: "Absage wahrscheinlich",
    unknown: "Prognose nicht verfügbar",
  },
  outlookNote: {
    likely: "Wind und Sicht liegen innerhalb der üblichen Grenzen für Ballonfahrten.",
    marginal: "Wind oder Böen liegen nahe der Grenze; die Behörde entscheidet nach der Morgenmessung.",
    unlikely: "Wind, Böen, Regen oder Sicht sind für eine Ballonfahrt meist zu viel.",
    unknown: "Der Prognosedienst war nicht erreichbar; bitte gleich neu laden.",
  },
  nextDays: "Nächste Tage",
  unavailable: "Die Prognose ist gerade nicht verfügbar.",
  whyTitle: "Warum werden Ballonfahrten abgesagt?",
  why: [
    "Wind: Ein Ballon lässt sich nicht steuern, er fährt mit dem Wind. Ab einer bestimmten Bodenwindstärke sind Start und vor allem Landung nicht mehr sicher.",
    "Böen: Auch bei niedrigem Mittelwind können starke Böen den Korb bei der Landung schleifen.",
    "Regen und Nebel: Regen macht die Hülle schwer, Nebel nimmt die Sicht; beides stoppt die Fahrt.",
    "Eine Entscheidung für alle: Die Freigabe für alle Veranstalter in Kappadokien wird jeden Morgen gleichzeitig nach der Messung der Zivilluftfahrtbehörde erteilt. Fährt einer, fahren alle; wird abgesagt, gilt das für alle.",
  ],
  bookingTitle: "Was passiert mit meiner Buchung bei Absage?",
  booking: [
    "Sagt der Veranstalter wetterbedingt ab, erhalten Sie den vollen Betrag zurück oder die Fahrt wird auf einen anderen Morgen Ihres Aufenthalts verschoben — Sie wählen.",
    "Die Entscheidung fällt meist vor der Hotelabholung, manchmal am Startplatz. Ihre Rechte sind in beiden Fällen gleich.",
    "Bei Buchungen über Trip and Tick können Sie Erstattung oder neuen Termin sofort per WhatsApp anfordern.",
  ],
  tipsTitle: "Praktische Tipps gegen das Absagerisiko",
  tips: [
    "Buchen Sie die Ballonfahrt für Ihren ersten Morgen in Kappadokien; bei Absage sind die folgenden Morgen Ihre Reserve.",
    "Bleiben Sie mindestens zwei, besser drei Nächte in Kappadokien.",
    "Halten Sie das Telefon am Morgen der Fahrt an; der Veranstalter meldet Absagen oder Zeitänderungen telefonisch.",
    "Zeigt die Prognose „grenzwertig“, geben Sie nicht auf: Die Morgenmessung fällt oft ruhiger aus als die Prognose.",
  ],
  faqTitle: "Häufige Fragen",
  faq: [
    { q: "Um wie viel Uhr fahren die Ballons in Kappadokien?", a: "Nur um den Sonnenaufgang, weil die tagsüber erwärmte Luft Thermik und Wind erzeugt. Die Hotelabholung ist etwa eine Stunde vor Sonnenaufgang; die genaue Zeit wird am Vortag bestätigt." },
    { q: "Wer entscheidet, ob die Ballons fahren?", a: "Die türkische Zivilluftfahrtbehörde trifft jeden Morgen eine Entscheidung für ganz Kappadokien; die Veranstalter folgen ihr. Die Prognose auf dieser Seite ersetzt diese Entscheidung nicht." },
    { q: "Fahren die Ballons im Winter?", a: "Ja, in Kappadokien fahren Ballons das ganze Jahr. Kalte Winterluft verbessert sogar den Auftrieb, aber Wind, Schnee und Nebel machen Absagen häufiger als im Sommer." },
    { q: "Bekomme ich bei Absage mein Geld zurück?", a: "Ja. Bei wetterbedingter Absage durch den Veranstalter wird der volle Betrag erstattet oder die Fahrt auf einen anderen Tag verlegt." },
    { q: "Wie hoch ist die Windgrenze für eine Ballonfahrt?", a: "Es gibt keinen einzelnen veröffentlichten Grenzwert; in der Praxis wird bei Bodenwind über etwa 18 km/h (10 Knoten), starken Böen, Regen oder schlechter Sicht nicht gefahren. Diese Seite nutzt konservativere Bänder." },
  ],
  ctaTitle: "Planen Sie Ihre Fahrt",
  ctaText: "Aktuellen Preis der Standard-Ballonfahrt ab €100 ansehen und mit 100 % Erstattung bei wetterbedingter Absage buchen.",
  ctaButton: "Ballonfahrten ansehen",
  operatorsLink: "Partner-Ballonveranstalter",
  source: "Prognosequelle: Open-Meteo (Göreme, Wind in 10 m). Seite wird alle 30 Minuten aktualisiert.",
};

const fr: FlyingTodayCopy = {
  ...en,
  metaTitle: "Les montgolfières volent-elles en Cappadoce aujourd'hui ? Prévision vent",
  metaDescription:
    "Montgolfière Cappadoce : prévision pour aujourd'hui et les 3 prochains jours — vent, rafales, visibilité et pluie au lever du soleil. Décision officielle chaque matin ; remboursement à 100 % en cas d'annulation.",
  h1: "Les montgolfières volent-elles en Cappadoce aujourd'hui ?",
  intro:
    "Les montgolfières ne volent qu'au lever du soleil, par vent calme. Ci-dessous, la prévision de Göreme pour l'heure du lever — vent, rafales, visibilité, probabilité de pluie — et la probabilité de vol qu'elle suggère.",
  disclaimer:
    "Ceci est une lecture de la prévision météo, pas la décision officielle de vol. L'autorisation est donnée chaque matin, peu avant le décollage, par l'autorité turque de l'aviation civile et peut différer de toute prévision. Si vous avez une réservation, votre opérateur vous appellera.",
  updated: "Prévision mise à jour",
  today: "Aujourd'hui",
  sunrise: "Lever du soleil",
  wind: "Vent",
  gusts: "Rafales",
  visibility: "Visibilité",
  rain: "Probabilité de pluie",
  outlook: {
    likely: "Vol probable",
    marginal: "Limite — décision le matin",
    unlikely: "Annulation probable",
    unknown: "Prévision indisponible",
  },
  outlookNote: {
    likely: "Vent et visibilité sont dans les limites habituelles d'un vol en montgolfière.",
    marginal: "Le vent ou les rafales sont proches de la limite ; l'autorité tranche sur la mesure du matin.",
    unlikely: "Vent, rafales, pluie ou visibilité sont généralement trop défavorables pour voler.",
    unknown: "Le service de prévision est injoignable ; réessayez dans un instant.",
  },
  nextDays: "Prochains jours",
  unavailable: "La prévision n'est pas disponible pour le moment.",
  whyTitle: "Pourquoi les vols sont-ils annulés ?",
  why: [
    "Le vent : une montgolfière ne se dirige pas, elle suit le vent. Au-delà d'une certaine vitesse au sol, le décollage et surtout l'atterrissage ne sont plus sûrs.",
    "Les rafales : même avec un vent moyen faible, de fortes rafales peuvent traîner la nacelle à l'atterrissage.",
    "Pluie et brouillard : la pluie alourdit l'enveloppe, le brouillard supprime la visibilité ; les deux clouent le ballon au sol.",
    "Une décision pour tous : l'autorisation pour tous les opérateurs de Cappadoce est donnée au même moment chaque matin, d'après la mesure de l'autorité de l'aviation civile. Si un opérateur vole, tous volent ; si c'est annulé, c'est annulé pour tous.",
  ],
  bookingTitle: "Que devient ma réservation en cas d'annulation ?",
  booking: [
    "Si l'opérateur annule pour cause de météo, vous êtes intégralement remboursé ou le vol est reporté à un autre matin de votre séjour — à votre choix.",
    "La décision est prise le plus souvent avant la prise en charge à l'hôtel, parfois sur le site de décollage. Vos droits sont les mêmes dans les deux cas.",
    "Pour les réservations faites via Trip and Tick, demandez le remboursement ou la nouvelle date immédiatement sur WhatsApp.",
  ],
  tipsTitle: "Conseils pratiques face au risque d'annulation",
  tips: [
    "Réservez le vol pour votre premier matin en Cappadoce ; en cas d'annulation, les matins suivants servent de secours.",
    "Restez au moins deux nuits, idéalement trois, en Cappadoce.",
    "Gardez votre téléphone allumé le matin du vol ; l'opérateur prévient par téléphone en cas d'annulation ou de changement d'horaire.",
    "Si la prévision indique « limite », n'abandonnez pas : la mesure du matin est souvent plus calme que la prévision.",
  ],
  faqTitle: "Questions fréquentes",
  faq: [
    { q: "À quelle heure volent les montgolfières en Cappadoce ?", a: "Uniquement autour du lever du soleil, car l'air qui se réchauffe dans la journée crée thermiques et vent. La prise en charge à l'hôtel a lieu environ une heure avant le lever ; l'heure exacte est confirmée la veille." },
    { q: "Qui décide si les montgolfières volent ?", a: "L'autorité turque de l'aviation civile prend une seule décision pour la Cappadoce chaque matin ; les opérateurs s'y conforment. La prévision de cette page ne remplace pas cette décision." },
    { q: "Les montgolfières volent-elles en hiver ?", a: "Oui, elles volent toute l'année en Cappadoce. L'air froid améliore même la portance, mais vent, neige et brouillard rendent les annulations plus fréquentes qu'en été." },
    { q: "Suis-je remboursé en cas d'annulation ?", a: "Oui. Pour les vols annulés par l'opérateur à cause de la météo, le paiement est intégralement remboursé ou le vol est reporté à un autre jour." },
    { q: "Quelle est la limite de vent pour voler ?", a: "Il n'existe pas de seuil unique publié ; en pratique on ne vole pas quand le vent au sol dépasse environ 18 km/h (10 nœuds), avec de fortes rafales, de la pluie ou une faible visibilité. Cette page utilise des bandes plus prudentes." },
  ],
  ctaTitle: "Planifiez votre vol",
  ctaText: "Consultez le prix actuel du vol Standard à partir de €100 et réservez avec remboursement à 100 % en cas d'annulation météo.",
  ctaButton: "Voir les vols en montgolfière",
  operatorsLink: "Opérateurs partenaires",
  source: "Source de la prévision : Open-Meteo (Göreme, vent à 10 m). Page actualisée toutes les 30 minutes.",
};

const ptBR: FlyingTodayCopy = {
  ...en,
  metaTitle: "Os balões vão voar na Capadócia hoje? Previsão de vento",
  metaDescription:
    "Balão na Capadócia: previsão para hoje e os próximos 3 dias — vento, rajadas, visibilidade e chuva ao nascer do sol. A decisão oficial sai toda manhã; reembolso de 100% se cancelar.",
  h1: "Os balões vão voar na Capadócia hoje?",
  intro:
    "Os balões só voam ao nascer do sol, com vento calmo. Abaixo está a previsão de Göreme para a hora do nascer do sol — vento, rajadas, visibilidade e probabilidade de chuva — e o quanto o voo parece provável com base nela.",
  disclaimer:
    "Isto é uma leitura da previsão do tempo, não a decisão oficial de voo. A liberação é dada toda manhã, pouco antes da decolagem, pela autoridade de aviação civil da Turquia e pode ser diferente de qualquer previsão. Se você tem reserva, o operador vai ligar para você.",
  updated: "Previsão atualizada",
  today: "Hoje",
  sunrise: "Nascer do sol",
  wind: "Vento",
  gusts: "Rajadas",
  visibility: "Visibilidade",
  rain: "Probabilidade de chuva",
  outlook: {
    likely: "Parece que voa",
    marginal: "No limite — decisão de manhã",
    unlikely: "Cancelamento provável",
    unknown: "Previsão indisponível",
  },
  outlookNote: {
    likely: "Vento e visibilidade estão dentro dos limites habituais para o voo de balão.",
    marginal: "Vento ou rajadas perto do limite; a autoridade decide pela medição da manhã.",
    unlikely: "Vento, rajadas, chuva ou visibilidade costumam ser demais para o voo.",
    unknown: "O serviço de previsão não respondeu; atualize a página em instantes.",
  },
  nextDays: "Próximos dias",
  unavailable: "A previsão não está disponível agora.",
  whyTitle: "Por que os voos de balão são cancelados?",
  why: [
    "Vento: o balão não tem direção, ele vai com o vento. Acima de certa velocidade no solo a decolagem e principalmente o pouso deixam de ser seguros.",
    "Rajadas: mesmo com vento médio baixo, rajadas fortes podem arrastar o cesto no pouso.",
    "Chuva e neblina: a chuva deixa o envelope pesado, a neblina tira a visibilidade; as duas impedem o voo.",
    "Uma decisão para todos: a liberação para todos os operadores da Capadócia sai ao mesmo tempo toda manhã, com base na medição da autoridade de aviação civil. Se um operador voa, todos voam; se cancela, cancela para todos.",
  ],
  bookingTitle: "O que acontece com minha reserva se o voo for cancelado?",
  booking: [
    "Se o operador cancelar por causa do tempo, você recebe reembolso total ou o voo é remarcado para outra manhã da sua estadia — você escolhe.",
    "A decisão normalmente sai antes da busca no hotel, às vezes no local de decolagem. Seus direitos são os mesmos nos dois casos.",
    "Nas reservas feitas pela Trip and Tick, peça o reembolso ou a nova data na hora pelo WhatsApp.",
  ],
  tipsTitle: "Dicas práticas contra o risco de cancelamento",
  tips: [
    "Reserve o balão para a sua primeira manhã na Capadócia; se cancelar, as manhãs seguintes são o seu plano B.",
    "Fique pelo menos duas noites, de preferência três, na Capadócia.",
    "Deixe o celular ligado na manhã do voo; o operador avisa cancelamento ou mudança de horário por telefone.",
    "Se a previsão diz 'no limite', não desista ainda: a medição da manhã costuma ser mais calma que a previsão.",
  ],
  faqTitle: "Perguntas frequentes",
  faq: [
    { q: "A que horas os balões voam na Capadócia?", a: "Só perto do nascer do sol, porque o ar que esquenta durante o dia cria térmicas e vento. A busca no hotel é cerca de uma hora antes do nascer do sol; o horário exato é confirmado no dia anterior." },
    { q: "Quem decide se os balões voam?", a: "A autoridade de aviação civil da Turquia toma uma única decisão para a Capadócia toda manhã; os operadores seguem essa decisão. A previsão desta página não substitui essa decisão." },
    { q: "Os balões voam no inverno?", a: "Sim, na Capadócia os balões voam o ano inteiro. O ar frio do inverno até melhora a sustentação, mas vento, neve e neblina tornam os cancelamentos mais frequentes do que no verão." },
    { q: "Recebo meu dinheiro de volta se cancelar?", a: "Sim. Nos voos que o operador cancela por causa do tempo, o pagamento é totalmente reembolsado ou o voo é remarcado para outro dia." },
    { q: "Qual é o limite de vento para o voo de balão?", a: "Não existe um único limite publicado; na prática não se voa quando o vento no solo passa de cerca de 18 km/h (10 nós), com rajadas fortes, chuva ou pouca visibilidade. Esta página usa faixas mais conservadoras." },
  ],
  ctaTitle: "Planeje seu voo",
  ctaText: "Veja o preço atual do voo Standard a partir de €100 e reserve com garantia de reembolso de 100% em cancelamento por tempo.",
  ctaButton: "Ver passeios de balão",
  operatorsLink: "Operadores de balão parceiros",
  source: "Fonte da previsão: Open-Meteo (Göreme, vento a 10 m). A página atualiza a cada 30 minutos.",
};

const ja: FlyingTodayCopy = {
  ...en,
  metaTitle: "カッパドキアの気球は今日飛ぶ？風の予報",
  metaDescription:
    "カッパドキア気球ツアー：今日と今後3日間の日の出時刻の風速・突風・視程・降水確率の予報。正式な運航判断は毎朝当局が行います。欠航時は全額返金。",
  h1: "カッパドキアの気球は今日飛びますか？",
  intro:
    "気球は日の出の時間帯、風が穏やかなときだけ飛びます。以下はギョレメの日の出時刻の予報（風速・突風・視程・降水確率）と、それに基づく運航の見通しです。",
  disclaimer:
    "これは天気予報の読み取りであり、正式な運航判断ではありません。運航の可否は毎朝離陸直前にトルコ民間航空当局が決定し、予報と異なることがあります。予約がある方にはオペレーターから電話連絡があります。",
  updated: "予報更新",
  today: "今日",
  sunrise: "日の出",
  wind: "風速",
  gusts: "突風",
  visibility: "視程",
  rain: "降水確率",
  outlook: {
    likely: "飛べそう",
    marginal: "微妙 — 当日朝に決定",
    unlikely: "欠航の可能性が高い",
    unknown: "予報を取得できません",
  },
  outlookNote: {
    likely: "風速と視程は気球飛行の通常の範囲内です。",
    marginal: "風速または突風が限界に近く、当局が朝の実測で判断します。",
    unlikely: "風・突風・雨・視程のいずれかが気球飛行には厳しい状態です。",
    unknown: "予報サービスに接続できませんでした。しばらくして再読み込みしてください。",
  },
  nextDays: "今後の日程",
  unavailable: "現在、予報を取得できません。",
  whyTitle: "気球が欠航になる理由",
  why: [
    "風：気球は操縦できず風に流されます。地上風が一定以上になると離陸、特に着陸が安全ではなくなります。",
    "突風：平均風速が低くても、強い突風は着陸時にゴンドラを引きずることがあります。",
    "雨と霧：雨は球皮を重くし、霧は視程を奪います。どちらも飛行を止めます。",
    "判断は一括：カッパドキアの全オペレーターの運航許可は、民間航空当局の計測に基づき毎朝同時に出ます。1社が飛べば全社飛び、欠航なら全社欠航です。",
  ],
  bookingTitle: "欠航になったら予約はどうなる？",
  booking: [
    "オペレーターが天候を理由に欠航した場合、全額返金か滞在中の別の朝への振替を選べます。",
    "判断はホテル送迎の前に出ることが多く、離陸地点で出ることもあります。どちらでも権利は同じです。",
    "Trip and Tick経由の予約は、WhatsAppですぐに返金または日程変更を依頼できます。",
  ],
  tipsTitle: "欠航リスクへの実用的な対策",
  tips: [
    "気球はカッパドキア滞在の初日の朝に予約しましょう。欠航なら翌朝以降が予備日になります。",
    "カッパドキアには最低2泊、できれば3泊してください。",
    "飛行当日の朝は携帯を必ずオンに。欠航や時間変更はオペレーターから電話で連絡されます。",
    "予報が「微妙」でもすぐ諦めないでください。朝の実測は予報より穏やかなことがよくあります。",
  ],
  faqTitle: "よくある質問",
  faq: [
    { q: "カッパドキアの気球は何時に飛びますか？", a: "日の出前後のみです。日中は暖まった空気が上昇気流と風を生むためです。ホテル送迎は日の出の約1時間前で、正確な時刻は前日に確認されます。" },
    { q: "飛ぶかどうかは誰が決めますか？", a: "トルコ民間航空当局が毎朝カッパドキア全体で1つの判断を出し、各オペレーターはそれに従います。このページの見通しはその判断の代わりにはなりません。" },
    { q: "冬も気球は飛びますか？", a: "はい、カッパドキアでは一年中飛びます。冬の冷たい空気はむしろ浮力を高めますが、風・雪・霧のため欠航は夏より多くなります。" },
    { q: "欠航の場合、返金されますか？", a: "はい。オペレーターが天候を理由に欠航した便は全額返金されるか、別の日に振り替えられます。" },
    { q: "気球飛行の風速の上限は？", a: "公表された単一の基準はありませんが、実務上は地上風が約18 km/h（10ノット）を超える場合、強い突風、雨、視程不良のときは飛びません。このページはさらに慎重な基準を使っています。" },
  ],
  ctaTitle: "フライトを計画する",
  ctaText: "スタンダード気球フライトの最新料金（€100から）を確認し、天候欠航時100%返金保証で予約。",
  ctaButton: "気球ツアーを見る",
  operatorsLink: "提携気球オペレーター",
  source: "予報の出典：Open-Meteo（ギョレメ、高度10 mの風）。ページは30分ごとに更新されます。",
};

const ko: FlyingTodayCopy = {
  ...en,
  metaTitle: "오늘 카파도키아 열기구 뜨나요? 바람 예보",
  metaDescription:
    "카파도키아 열기구: 오늘과 앞으로 3일 일출 시각의 풍속·돌풍·시정·강수 확률 예보. 공식 운항 결정은 매일 아침 당국이 내립니다. 취소 시 100% 환불.",
  h1: "오늘 카파도키아에서 열기구가 뜨나요?",
  intro:
    "열기구는 일출 무렵, 바람이 잔잔할 때만 뜹니다. 아래는 괴레메의 일출 시각 예보(풍속·돌풍·시정·강수 확률)와 그에 따른 운항 가능성입니다.",
  disclaimer:
    "이것은 기상 예보를 해석한 것이지 공식 운항 결정이 아닙니다. 운항 여부는 매일 아침 이륙 직전 튀르키예 민간항공 당국이 결정하며 예보와 다를 수 있습니다. 예약이 있으면 운영사가 전화로 알려 드립니다.",
  updated: "예보 업데이트",
  today: "오늘",
  sunrise: "일출",
  wind: "풍속",
  gusts: "돌풍",
  visibility: "시정",
  rain: "강수 확률",
  outlook: {
    likely: "운항 가능해 보임",
    marginal: "경계 — 아침에 결정",
    unlikely: "취소 가능성 높음",
    unknown: "예보를 불러올 수 없음",
  },
  outlookNote: {
    likely: "풍속과 시정이 열기구 운항의 일반적인 범위 안에 있습니다.",
    marginal: "풍속 또는 돌풍이 한계에 가까워 당국이 아침 실측으로 결정합니다.",
    unlikely: "바람·돌풍·비·시정 중 하나가 열기구 운항에 보통 무리입니다.",
    unknown: "예보 서비스에 연결할 수 없습니다. 잠시 후 새로고침하세요.",
  },
  nextDays: "다음 날들",
  unavailable: "지금은 예보를 볼 수 없습니다.",
  whyTitle: "열기구 운항이 취소되는 이유",
  why: [
    "바람: 열기구는 조종할 수 없고 바람을 따라갑니다. 지상풍이 일정 속도를 넘으면 이륙, 특히 착륙이 안전하지 않습니다.",
    "돌풍: 평균 풍속이 낮아도 강한 돌풍은 착륙 시 바스켓을 끌고 갈 수 있습니다.",
    "비와 안개: 비는 기구 천을 무겁게 하고 안개는 시정을 없앱니다. 둘 다 운항을 막습니다.",
    "결정은 한 번에: 카파도키아 모든 운영사의 운항 허가는 민간항공 당국의 측정에 따라 매일 아침 동시에 나옵니다. 한 곳이 뜨면 모두 뜨고, 취소되면 모두 취소됩니다.",
  ],
  bookingTitle: "취소되면 내 예약은 어떻게 되나요?",
  booking: [
    "운영사가 날씨 때문에 취소하면 전액 환불받거나 체류 중 다른 아침으로 옮길 수 있습니다. 선택은 고객의 몫입니다.",
    "결정은 대개 호텔 픽업 전에, 때로는 이륙 장소에서 나옵니다. 어느 쪽이든 권리는 같습니다.",
    "Trip and Tick으로 예약했다면 WhatsApp으로 즉시 환불이나 새 날짜를 요청할 수 있습니다.",
  ],
  tipsTitle: "취소 위험에 대비하는 실용 팁",
  tips: [
    "열기구는 카파도키아 첫날 아침으로 예약하세요. 취소되면 다음 아침들이 예비일이 됩니다.",
    "카파도키아에 최소 2박, 가능하면 3박 머무세요.",
    "비행 당일 아침에는 휴대폰을 켜 두세요. 취소나 시간 변경은 운영사가 전화로 알립니다.",
    "예보가 '경계'라도 바로 포기하지 마세요. 아침 실측은 예보보다 잔잔한 경우가 많습니다.",
  ],
  faqTitle: "자주 묻는 질문",
  faq: [
    { q: "카파도키아 열기구는 몇 시에 뜨나요?", a: "일출 전후에만 뜹니다. 낮에는 데워진 공기가 상승기류와 바람을 만들기 때문입니다. 호텔 픽업은 일출 약 1시간 전이며 정확한 시간은 전날 확정됩니다." },
    { q: "운항 여부는 누가 결정하나요?", a: "튀르키예 민간항공 당국이 매일 아침 카파도키아 전체에 대해 하나의 결정을 내리고 운영사들은 이를 따릅니다. 이 페이지의 전망은 그 결정을 대신하지 않습니다." },
    { q: "겨울에도 열기구가 뜨나요?", a: "네, 카파도키아 열기구는 연중 운항합니다. 겨울의 찬 공기는 오히려 부력을 높이지만 바람·눈·안개 때문에 여름보다 취소가 잦습니다." },
    { q: "취소되면 환불받을 수 있나요?", a: "네. 운영사가 날씨 때문에 취소한 비행은 전액 환불되거나 다른 날로 옮겨집니다." },
    { q: "열기구 운항 풍속 한계는 얼마인가요?", a: "공개된 단일 기준은 없지만 실제로는 지상풍이 약 18 km/h(10노트)를 넘거나 강한 돌풍, 비, 낮은 시정일 때 운항하지 않습니다. 이 페이지는 더 보수적인 기준을 사용합니다." },
  ],
  ctaTitle: "비행 계획하기",
  ctaText: "스탠다드 열기구 비행의 실시간 가격(€100부터)을 확인하고 날씨 취소 시 100% 환불 보장으로 예약하세요.",
  ctaButton: "열기구 투어 보기",
  operatorsLink: "제휴 열기구 운영사",
  source: "예보 출처: Open-Meteo(괴레메, 10 m 풍속). 페이지는 30분마다 갱신됩니다.",
};

const COPY: Record<string, FlyingTodayCopy> = { tr, en, de, fr, "pt-BR": ptBR, ja, ko };

export function flyingTodayCopy(locale: string): FlyingTodayCopy {
  return COPY[locale] ?? en;
}
