// Localized FAQ data for JSON-LD FAQPage schema (4 pages x 9 locales).
// Server-safe: no "use client", no hooks. Strictly typed via Record<Locale, ...>.
// Source = tr (verbatim). Prices/emails/phone/proper nouns kept untranslated.
// "Türk hamamı"/"Türk Hamamı" -> "Turkish Hammam"/"Hammam" (not "Turkish bath").

import type { Locale } from "@/lib/i18n/dictionaries";

type Faq = { question: string; answer: string };

type PageKey = "activities" | "packages" | "transfers" | "tours";

// Partial: yeni diller (pt/pt-BR/ja/ko/it/ru/uk/az) eksik olabilir; getPageFaqs tr'ye fallback yapar.
const PAGE_FAQS: Partial<Record<Locale, Record<PageKey, Faq[]>>> = {
  tr: {
    activities: [
      {
        question: "Kapadokya'da hangi aktiviteler var?",
        answer:
          "ATV safari, Jeep safari, at binme, Türk hamamı, Türk gecesi folklor şovu ve microlight uçuşu dahil 7+ kategori, toplam 16 farklı aktivite paketi sunuyoruz. Hepsi otel transferi dahil €29'dan başlıyor.",
      },
      {
        question: "ATV ve jeep safarinin yaş limiti nedir?",
        answer:
          "ATV ehliyeti gereksizdir; 16+ yaş tek sürücü olabilir, 6-15 yaş yetişkin arkasında yolcu. Jeep safaride yaş sınırı yoktur, çocuk koltuğu mevcuttur.",
      },
      {
        question: "Aktiviteler hangi mevsimde yapılabilir?",
        answer:
          "ATV, jeep, at binme yıl-içi tüm sezonlar açıktır. Hamam ve Türk gecesi yıl-içi kapalı mekân. Microlight uçuşu rüzgâr durumuna bağlı (genelde Mart-Kasım optimal).",
      },
      {
        question: "Türk Gecesi şovunda ne dahil?",
        answer:
          "Yemekli paket €55: semah + folklor + oryantal + Kafkas dansı + 3 çeşit yemek + sınırsız alkollü/alkolsüz içecek + otel transferi (3 saat). Yemeksiz paket €35: sadece şov + hoşgeldin içeceği + transfer.",
      },
      {
        question: "Hamam paketi ne kadar sürer?",
        answer:
          "Standart Türk Hamamı 90 dakika (€50): kese + köpük masajı + sauna + jakuzi. Deluxe paket 2 saat (€75): hamam + 30 dakika İsveç yağ masajı + tam vücut mask. Her ikisi de otel transferi dahil.",
      },
    ],
    packages: [
      {
        question: "Paket fiyatları kişi başı mı yoksa toplam mı?",
        answer:
          "Belirtilen fiyatlar kişi başıdır (çift-kişilik konaklamada). Balayı paketi €1495 çift için toplam, evlilik teklifi paketi €1295 organize edilen kişi başınadır. Aile paketi 2 yetişkin + 2 çocuk toplam fiyatıdır.",
      },
      {
        question: "Paketler içinde balon turu hangi seviyede?",
        answer:
          "Tam Gün Premium ve Macera paketleri Standart balon (€165); Aile paketi Standart balon (çocuk %80); Balayı ve Evlilik Teklifi paketleri VIP Romantik özel balon (sepette sadece siz veya 2 çift).",
      },
      {
        question: "Paket rezervasyonunu ne kadar önce yapmalıyım?",
        answer:
          "Yüksek sezon (Mayıs/Eylül-Ekim) paket rezervasyonu en az 4-6 hafta önce önerilir; düşük sezon 7-10 gün yeterli. Balayı ve Evlilik Teklifi paketleri sürpriz organizasyon için min 14 gün önce.",
      },
      {
        question: "Otel paketleri içinde hangi tip otel dahil?",
        answer:
          "Tam Gün Premium: mağara otel orta segment (€120-165 gece-değeri). Balayı: VIP Honeymoon Mağara (€285 gece-değeri). Aile: Aile Resort havuzlu (€145 gece-değeri). Tüm paketlerde otel açık büfe kahvaltı dahildir.",
      },
      {
        question: "Kurumsal paket nasıl çalışır?",
        answer:
          "Minimum 10 kişi grup; kişi başı €295. Grup balonu (15+ kişilik sepet), rehberli tur, gala akşam yemeği ve kurumsal organizatör dahildir. Faturalı ödeme ve özel branding seçeneği mevcut. info@tripandtick.com'a yazarak özel teklif alabilirsiniz.",
      },
    ],
    transfers: [
      {
        question: "Hangi havalimanlarından transfer yapıyorsunuz?",
        answer:
          "Nevşehir Havalimanı (NAV, 30-45 dk, €35) ve Kayseri Havalimanı (ASR, 60-75 dk, €55). İki havalimanı da Göreme/Ürgüp/Uçhisar otellerine direkt servis sunar.",
      },
      {
        question: "Transfer fiyatı kişi başı mı?",
        answer:
          "Hayır, fiyat araç başınadır (1-4 kişi). 5+ kişi için minibüs (€65-95) veya VIP araç (€85-120) seçeneği vardır. Bagaj limiti yoktur; özel ekipman (bisiklet, snowboard) için önceden bildirim.",
      },
      {
        question: "Şoför otelden alacak mı?",
        answer:
          "Geliş: havalimanı arrivals çıkışında isim levhalı şoför sizi bekliyor. Dönüş: belirtilen tarih+saatte otel girişinden alır. WhatsApp +90 537 464 78 61 üzerinden anlık iletişim mevcut.",
      },
      {
        question: "Uçuş gecikirse ek ücret var mı?",
        answer:
          "Hayır, uçuşunuzu izliyoruz. 90 dakikaya kadar gecikme ücretsiz. 90+ dakika veya yeni gün geçişi durumunda €15-25 bekleme ücreti uygulanabilir. İptal: 4+ saat öncesinden %100 iade.",
      },
    ],
    tours: [
      {
        question: "Kapadokya turları kaç saat sürer?",
        answer:
          "Kırmızı, Yeşil ve Mix turlar tam gün (8-10 saat), Sarı tur 7-8 saat, Yeraltı Şehirleri turu yarım gün (5-6 saat), Gün Batımı turu 3 saat ve Instagram/Foto turu yarım gündür.",
      },
      {
        question: "Otelimden alınıp bırakılacak mıyım?",
        answer:
          "Evet, tüm tur paketlerinde Göreme, Ürgüp, Uçhisar ve Avanos bölgelerindeki otellerden ücretsiz transfer dahildir. Diğer bölgelerden ek ücret olabilir.",
      },
      {
        question: "Tur fiyatları neyi içeriyor?",
        answer:
          "Profesyonel TR/EN/RU rehber, otel transferi, müze giriş biletleri, öğle yemeği (Kırmızı/Yeşil/Mix turlar) ve tüm vergiler dahildir. Sadece bahşiş ve kişisel harcamalar dahil değildir.",
      },
      {
        question: "Hangi tur en popüler?",
        answer:
          "Kırmızı Tur (Red Tour) en çok tercih edileni — Göreme Açık Hava Müzesi, Uçhisar Kalesi, Paşabağ ve Avanos çömlek atölyesini içerir. €45'ten başlar.",
      },
      {
        question: "Birden fazla turu aynı günde yapabilir miyim?",
        answer:
          "Hayır, tam gün turlar (Kırmızı/Yeşil/Mix/Sarı) ayrı günlerde planlanmalı. Ancak yarım gün turlar (Yeraltı Şehirleri + Gün Batımı veya Instagram + Gün Batımı) aynı günde kombine edilebilir.",
      },
    ],
  },
  en: {
    activities: [
      {
        question: "What activities are available in Cappadocia?",
        answer:
          "We offer 7+ categories and 16 different activity packages in total, including ATV safari, Jeep safari, horseback riding, Turkish Hammam, Turkish Night folklore show and microlight flight. All include hotel transfer and start from €29.",
      },
      {
        question: "What is the age limit for the ATV and jeep safari?",
        answer:
          "No ATV license is required; ages 16+ can drive alone, ages 6-15 ride as a passenger behind an adult. There is no age limit on the jeep safari, and a child seat is available.",
      },
      {
        question: "In which season can the activities be done?",
        answer:
          "ATV, jeep and horseback riding are open all seasons year-round. The Hammam and Turkish Night are indoor and available year-round. The microlight flight depends on wind conditions (generally March-November is optimal).",
      },
      {
        question: "What is included in the Turkish Night show?",
        answer:
          "Dinner package €55: semah + folklore + oriental + Caucasian dance + 3 courses of food + unlimited alcoholic/non-alcoholic drinks + hotel transfer (3 hours). Without dinner €35: show only + welcome drink + transfer.",
      },
      {
        question: "How long does the Hammam package take?",
        answer:
          "Standard Turkish Hammam 90 minutes (€50): body scrub + foam massage + sauna + jacuzzi. Deluxe package 2 hours (€75): Hammam + 30 minutes of Swedish oil massage + full body mask. Both include hotel transfer.",
      },
    ],
    packages: [
      {
        question: "Are package prices per person or total?",
        answer:
          "The stated prices are per person (in double occupancy). The Honeymoon package €1495 is the total for the couple, the marriage proposal package €1295 is per person organized for. The Family package is the total price for 2 adults + 2 children.",
      },
      {
        question: "What level is the balloon ride in the packages?",
        answer:
          "Full Day Premium and Adventure packages: Standard balloon (€165); Family package: Standard balloon (children 80%); Honeymoon and Marriage Proposal packages: VIP Romantic private balloon (only you or 2 couples in the basket).",
      },
      {
        question: "How far in advance should I book a package?",
        answer:
          "For high season (May/September-October) we recommend booking the package at least 4-6 weeks in advance; for low season 7-10 days is enough. Honeymoon and Marriage Proposal packages need at least 14 days in advance for the surprise organization.",
      },
      {
        question: "Which type of hotel is included in the hotel packages?",
        answer:
          "Full Day Premium: mid-segment cave hotel (€120-165 nightly value). Honeymoon: VIP Honeymoon Cave (€285 nightly value). Family: Family Resort with pool (€145 nightly value). All packages include open buffet hotel breakfast.",
      },
      {
        question: "How does the corporate package work?",
        answer:
          "Minimum group of 10 people; €295 per person. It includes a group balloon (15+ person basket), guided tour, gala dinner and a corporate organizer. Invoiced payment and a custom branding option are available. You can request a custom offer by writing to info@tripandtick.com.",
      },
    ],
    transfers: [
      {
        question: "Which airports do you provide transfers from?",
        answer:
          "Nevşehir Airport (NAV, 30-45 min, €35) and Kayseri Airport (ASR, 60-75 min, €55). Both airports offer direct service to hotels in Göreme/Ürgüp/Uçhisar.",
      },
      {
        question: "Is the transfer price per person?",
        answer:
          "No, the price is per vehicle (1-4 people). For 5+ people there is a minibus (€65-95) or VIP vehicle (€85-120) option. There is no luggage limit; please notify us in advance for special equipment (bicycle, snowboard).",
      },
      {
        question: "Will the driver pick me up from the hotel?",
        answer:
          "Arrival: a driver with a name sign waits for you at the airport arrivals exit. Return: picks you up from the hotel entrance on the stated date and time. Live communication is available via WhatsApp +90 537 464 78 61.",
      },
      {
        question: "Is there an extra fee if my flight is delayed?",
        answer:
          "No, we track your flight. Delays of up to 90 minutes are free. For 90+ minutes or a roll-over to a new day, a €15-25 waiting fee may apply. Cancellation: 100% refund from 4+ hours in advance.",
      },
    ],
    tours: [
      {
        question: "How many hours do the Cappadocia tours last?",
        answer:
          "The Red, Green and Mix tours are full day (8-10 hours), the Yellow tour 7-8 hours, the Underground Cities tour is half day (5-6 hours), the Sunset tour is 3 hours and the Instagram/Photo tour is half day.",
      },
      {
        question: "Will I be picked up and dropped off from my hotel?",
        answer:
          "Yes, all tour packages include free transfer from hotels in the Göreme, Ürgüp, Uçhisar and Avanos areas. There may be an extra fee from other areas.",
      },
      {
        question: "What do the tour prices include?",
        answer:
          "A professional TR/EN/RU guide, hotel transfer, museum entrance tickets, lunch (Red/Green/Mix tours) and all taxes are included. Only tips and personal expenses are not included.",
      },
      {
        question: "Which tour is the most popular?",
        answer:
          "The Red Tour is the most preferred — it includes the Göreme Open Air Museum, Uçhisar Castle, Paşabağ and the Avanos pottery workshop. Starts from €45.",
      },
      {
        question: "Can I do more than one tour on the same day?",
        answer:
          "No, the full-day tours (Red/Green/Mix/Yellow) must be planned on separate days. However, the half-day tours (Underground Cities + Sunset or Instagram + Sunset) can be combined on the same day.",
      },
    ],
  },
  de: {
    activities: [
      {
        question: "Welche Aktivitäten gibt es in Kappadokien?",
        answer:
          "Wir bieten über 7 Kategorien und insgesamt 16 verschiedene Aktivitätspakete an, darunter ATV-Safari, Jeep-Safari, Reiten, Hammam, Türkische-Nacht-Folkloreshow und Microlight-Flug. Alle inklusive Hoteltransfer, ab €29.",
      },
      {
        question: "Wie ist die Altersgrenze für die ATV- und Jeep-Safari?",
        answer:
          "Ein ATV-Führerschein ist nicht erforderlich; ab 16 Jahren darf man allein fahren, 6-15 Jahre als Beifahrer hinter einem Erwachsenen. Bei der Jeep-Safari gibt es keine Altersgrenze, ein Kindersitz ist vorhanden.",
      },
      {
        question: "In welcher Jahreszeit können die Aktivitäten gemacht werden?",
        answer:
          "ATV, Jeep und Reiten sind das ganze Jahr über in allen Saisons möglich. Hammam und Türkische Nacht finden ganzjährig in Innenräumen statt. Der Microlight-Flug hängt von den Windverhältnissen ab (in der Regel ist März-November optimal).",
      },
      {
        question: "Was ist in der Türkische-Nacht-Show enthalten?",
        answer:
          "Paket mit Abendessen €55: Semah + Folklore + Orientalisch + kaukasischer Tanz + 3-Gänge-Essen + unbegrenzte alkoholische/alkoholfreie Getränke + Hoteltransfer (3 Stunden). Ohne Abendessen €35: nur Show + Willkommensgetränk + Transfer.",
      },
      {
        question: "Wie lange dauert das Hammam-Paket?",
        answer:
          "Standard-Hammam 90 Minuten (€50): Peeling + Schaummassage + Sauna + Whirlpool. Deluxe-Paket 2 Stunden (€75): Hammam + 30 Minuten schwedische Ölmassage + Ganzkörpermaske. Beide inklusive Hoteltransfer.",
      },
    ],
    packages: [
      {
        question: "Sind die Paketpreise pro Person oder gesamt?",
        answer:
          "Die angegebenen Preise gelten pro Person (bei Doppelbelegung). Das Flitterwochen-Paket €1495 ist der Gesamtpreis für das Paar, das Heiratsantrags-Paket €1295 gilt pro organisierter Person. Das Familienpaket ist der Gesamtpreis für 2 Erwachsene + 2 Kinder.",
      },
      {
        question: "Auf welchem Niveau ist die Ballonfahrt in den Paketen?",
        answer:
          "Pakete Ganztags-Premium und Abenteuer: Standardballon (€165); Familienpaket: Standardballon (Kinder 80%); Pakete Flitterwochen und Heiratsantrag: VIP Romantic Privatballon (nur Sie oder 2 Paare im Korb).",
      },
      {
        question: "Wie lange im Voraus sollte ich ein Paket buchen?",
        answer:
          "Für die Hochsaison (Mai/September-Oktober) empfehlen wir, das Paket mindestens 4-6 Wochen im Voraus zu buchen; für die Nebensaison reichen 7-10 Tage. Flitterwochen- und Heiratsantrags-Pakete benötigen mindestens 14 Tage Vorlauf für die Überraschungsorganisation.",
      },
      {
        question: "Welcher Hoteltyp ist in den Hotelpaketen enthalten?",
        answer:
          "Ganztags-Premium: Höhlenhotel mittleres Segment (€120-165 Übernachtungswert). Flitterwochen: VIP Honeymoon Höhle (€285 Übernachtungswert). Familie: Familienresort mit Pool (€145 Übernachtungswert). Alle Pakete beinhalten ein Hotel-Frühstücksbuffet.",
      },
      {
        question: "Wie funktioniert das Firmenpaket?",
        answer:
          "Mindestens 10 Personen pro Gruppe; €295 pro Person. Enthalten sind ein Gruppenballon (Korb für 15+ Personen), geführte Tour, Gala-Abendessen und ein Firmenorganisator. Zahlung auf Rechnung und eine individuelle Branding-Option sind verfügbar. Sie können ein individuelles Angebot anfordern, indem Sie an info@tripandtick.com schreiben.",
      },
    ],
    transfers: [
      {
        question: "Von welchen Flughäfen bieten Sie Transfers an?",
        answer:
          "Flughafen Nevşehir (NAV, 30-45 Min., €35) und Flughafen Kayseri (ASR, 60-75 Min., €55). Beide Flughäfen bieten Direktservice zu Hotels in Göreme/Ürgüp/Uçhisar.",
      },
      {
        question: "Ist der Transferpreis pro Person?",
        answer:
          "Nein, der Preis gilt pro Fahrzeug (1-4 Personen). Für 5+ Personen gibt es einen Minibus (€65-95) oder ein VIP-Fahrzeug (€85-120). Es gibt kein Gepäcklimit; für Spezialausrüstung (Fahrrad, Snowboard) bitte vorher Bescheid geben.",
      },
      {
        question: "Holt mich der Fahrer vom Hotel ab?",
        answer:
          "Ankunft: Ein Fahrer mit Namensschild erwartet Sie am Ausgang der Flughafenankunft. Rückfahrt: Abholung am Hoteleingang zum angegebenen Datum und Uhrzeit. Sofortige Kommunikation über WhatsApp +90 537 464 78 61 möglich.",
      },
      {
        question: "Fällt eine Zusatzgebühr an, wenn mein Flug Verspätung hat?",
        answer:
          "Nein, wir verfolgen Ihren Flug. Verspätungen bis zu 90 Minuten sind kostenlos. Bei 90+ Minuten oder Übergang in einen neuen Tag kann eine Wartegebühr von €15-25 anfallen. Stornierung: 100% Rückerstattung ab 4+ Stunden im Voraus.",
      },
    ],
    tours: [
      {
        question: "Wie viele Stunden dauern die Kappadokien-Touren?",
        answer:
          "Die Rote, Grüne und Mix-Tour sind ganztägig (8-10 Stunden), die Gelbe Tour 7-8 Stunden, die Tour zu den unterirdischen Städten ist halbtägig (5-6 Stunden), die Sonnenuntergangstour dauert 3 Stunden und die Instagram-/Foto-Tour ist halbtägig.",
      },
      {
        question: "Werde ich von meinem Hotel abgeholt und zurückgebracht?",
        answer:
          "Ja, alle Tourpakete beinhalten kostenlosen Transfer von Hotels in den Gebieten Göreme, Ürgüp, Uçhisar und Avanos. Aus anderen Gebieten kann eine Zusatzgebühr anfallen.",
      },
      {
        question: "Was beinhalten die Tourpreise?",
        answer:
          "Ein professioneller TR/EN/RU-Guide, Hoteltransfer, Museumseintrittskarten, Mittagessen (Rote/Grüne/Mix-Touren) und alle Steuern sind inbegriffen. Nur Trinkgeld und persönliche Ausgaben sind nicht enthalten.",
      },
      {
        question: "Welche Tour ist am beliebtesten?",
        answer:
          "Die Rote Tour (Red Tour) ist die beliebteste — sie umfasst das Freilichtmuseum Göreme, die Burg Uçhisar, Paşabağ und die Töpferwerkstatt von Avanos. Ab €45.",
      },
      {
        question: "Kann ich mehrere Touren am selben Tag machen?",
        answer:
          "Nein, die Ganztagestouren (Rot/Grün/Mix/Gelb) müssen an getrennten Tagen geplant werden. Die Halbtagestouren (Unterirdische Städte + Sonnenuntergang oder Instagram + Sonnenuntergang) können jedoch am selben Tag kombiniert werden.",
      },
    ],
  },
  fr: {
    activities: [
      {
        question: "Quelles activités y a-t-il en Cappadoce ?",
        answer:
          "Nous proposons plus de 7 catégories et 16 forfaits d'activités différents au total, dont safari en quad, safari en jeep, équitation, Hammam, spectacle folklorique de la Nuit turque et vol en ULM. Tous incluent le transfert depuis l'hôtel et débutent à €29.",
      },
      {
        question: "Quelle est la limite d'âge pour le safari en quad et en jeep ?",
        answer:
          "Aucun permis de quad n'est requis ; à partir de 16 ans on peut conduire seul, de 6 à 15 ans en tant que passager derrière un adulte. Il n'y a pas de limite d'âge pour le safari en jeep, et un siège enfant est disponible.",
      },
      {
        question: "À quelle saison les activités peuvent-elles être pratiquées ?",
        answer:
          "Le quad, la jeep et l'équitation sont ouverts toute l'année, en toutes saisons. Le Hammam et la Nuit turque se déroulent en intérieur toute l'année. Le vol en ULM dépend des conditions de vent (généralement mars-novembre est optimal).",
      },
      {
        question: "Qu'est-ce qui est inclus dans le spectacle de la Nuit turque ?",
        answer:
          "Forfait avec dîner €55 : semah + folklore + oriental + danse caucasienne + repas 3 plats + boissons alcoolisées/non alcoolisées illimitées + transfert depuis l'hôtel (3 heures). Sans dîner €35 : spectacle uniquement + boisson de bienvenue + transfert.",
      },
      {
        question: "Combien de temps dure le forfait Hammam ?",
        answer:
          "Hammam standard 90 minutes (€50) : gommage + massage à la mousse + sauna + jacuzzi. Forfait Deluxe 2 heures (€75) : Hammam + 30 minutes de massage à l'huile suédois + masque corporel complet. Les deux incluent le transfert depuis l'hôtel.",
      },
    ],
    packages: [
      {
        question: "Les prix des forfaits sont-ils par personne ou au total ?",
        answer:
          "Les prix indiqués sont par personne (en occupation double). Le forfait Lune de miel €1495 est le total pour le couple, le forfait demande en mariage €1295 est par personne organisée. Le forfait Famille est le prix total pour 2 adultes + 2 enfants.",
      },
      {
        question: "À quel niveau se situe le vol en montgolfière dans les forfaits ?",
        answer:
          "Forfaits Journée complète Premium et Aventure : montgolfière Standard (€165) ; forfait Famille : montgolfière Standard (enfants 80%) ; forfaits Lune de miel et Demande en mariage : montgolfière privée VIP Romantique (uniquement vous ou 2 couples dans la nacelle).",
      },
      {
        question: "Combien de temps à l'avance dois-je réserver un forfait ?",
        answer:
          "Pour la haute saison (mai/septembre-octobre), nous recommandons de réserver le forfait au moins 4-6 semaines à l'avance ; pour la basse saison, 7-10 jours suffisent. Les forfaits Lune de miel et Demande en mariage nécessitent au moins 14 jours à l'avance pour l'organisation de la surprise.",
      },
      {
        question: "Quel type d'hôtel est inclus dans les forfaits hôtel ?",
        answer:
          "Journée complète Premium : hôtel troglodyte de gamme moyenne (valeur de €120-165 la nuit). Lune de miel : VIP Honeymoon Cave (valeur de €285 la nuit). Famille : Family Resort avec piscine (valeur de €145 la nuit). Tous les forfaits incluent le petit-déjeuner buffet de l'hôtel.",
      },
      {
        question: "Comment fonctionne le forfait entreprise ?",
        answer:
          "Groupe de 10 personnes minimum ; €295 par personne. Il comprend une montgolfière de groupe (nacelle de 15+ personnes), une visite guidée, un dîner de gala et un organisateur d'entreprise. Le paiement sur facture et une option de branding personnalisé sont disponibles. Vous pouvez demander une offre personnalisée en écrivant à info@tripandtick.com.",
      },
    ],
    transfers: [
      {
        question: "De quels aéroports assurez-vous les transferts ?",
        answer:
          "Aéroport de Nevşehir (NAV, 30-45 min, €35) et aéroport de Kayseri (ASR, 60-75 min, €55). Les deux aéroports offrent un service direct vers les hôtels de Göreme/Ürgüp/Uçhisar.",
      },
      {
        question: "Le prix du transfert est-il par personne ?",
        answer:
          "Non, le prix est par véhicule (1-4 personnes). Pour 5+ personnes, il y a une option minibus (€65-95) ou véhicule VIP (€85-120). Il n'y a pas de limite de bagages ; merci de nous prévenir à l'avance pour un équipement spécial (vélo, snowboard).",
      },
      {
        question: "Le chauffeur viendra-t-il me chercher à l'hôtel ?",
        answer:
          "Arrivée : un chauffeur avec une pancarte à votre nom vous attend à la sortie des arrivées de l'aéroport. Retour : il vient vous chercher à l'entrée de l'hôtel à la date et l'heure indiquées. Communication instantanée disponible via WhatsApp +90 537 464 78 61.",
      },
      {
        question: "Y a-t-il des frais supplémentaires si mon vol est retardé ?",
        answer:
          "Non, nous suivons votre vol. Les retards jusqu'à 90 minutes sont gratuits. Pour 90+ minutes ou un passage à un nouveau jour, des frais d'attente de €15-25 peuvent s'appliquer. Annulation : remboursement à 100% à partir de 4+ heures à l'avance.",
      },
    ],
    tours: [
      {
        question: "Combien d'heures durent les circuits en Cappadoce ?",
        answer:
          "Les circuits Rouge, Vert et Mix durent une journée complète (8-10 heures), le circuit Jaune 7-8 heures, le circuit des Villes souterraines est d'une demi-journée (5-6 heures), le circuit Coucher de soleil dure 3 heures et le circuit Instagram/Photo est d'une demi-journée.",
      },
      {
        question: "Serai-je pris en charge et déposé à mon hôtel ?",
        answer:
          "Oui, tous les forfaits de circuit incluent le transfert gratuit depuis les hôtels des régions de Göreme, Ürgüp, Uçhisar et Avanos. Des frais supplémentaires peuvent s'appliquer depuis d'autres régions.",
      },
      {
        question: "Que comprennent les prix des circuits ?",
        answer:
          "Un guide professionnel TR/EN/RU, le transfert depuis l'hôtel, les billets d'entrée des musées, le déjeuner (circuits Rouge/Vert/Mix) et toutes les taxes sont inclus. Seuls les pourboires et les dépenses personnelles ne sont pas inclus.",
      },
      {
        question: "Quel circuit est le plus populaire ?",
        answer:
          "Le circuit Rouge (Red Tour) est le plus prisé — il comprend le Musée en plein air de Göreme, le château d'Uçhisar, Paşabağ et l'atelier de poterie d'Avanos. À partir de €45.",
      },
      {
        question: "Puis-je faire plusieurs circuits le même jour ?",
        answer:
          "Non, les circuits d'une journée complète (Rouge/Vert/Mix/Jaune) doivent être planifiés sur des jours différents. Cependant, les circuits d'une demi-journée (Villes souterraines + Coucher de soleil ou Instagram + Coucher de soleil) peuvent être combinés le même jour.",
      },
    ],
  },
  es: {
    activities: [
      {
        question: "¿Qué actividades hay en Capadocia?",
        answer:
          "Ofrecemos más de 7 categorías y 16 paquetes de actividades diferentes en total, incluyendo safari en quad, safari en jeep, equitación, Hammam, espectáculo folclórico de la Noche Turca y vuelo en ultraligero. Todos incluyen traslado desde el hotel y empiezan desde €29.",
      },
      {
        question: "¿Cuál es el límite de edad para el safari en quad y en jeep?",
        answer:
          "No se requiere licencia de quad; a partir de 16 años se puede conducir solo, de 6 a 15 años como pasajero detrás de un adulto. En el safari en jeep no hay límite de edad y hay silla para niños disponible.",
      },
      {
        question: "¿En qué temporada se pueden hacer las actividades?",
        answer:
          "Quad, jeep y equitación están disponibles todo el año, en todas las temporadas. El Hammam y la Noche Turca son en interior todo el año. El vuelo en ultraligero depende de las condiciones del viento (generalmente de marzo a noviembre es óptimo).",
      },
      {
        question: "¿Qué incluye el espectáculo de la Noche Turca?",
        answer:
          "Paquete con cena €55: semah + folclore + oriental + danza caucásica + comida de 3 platos + bebidas alcohólicas/sin alcohol ilimitadas + traslado desde el hotel (3 horas). Sin cena €35: solo espectáculo + bebida de bienvenida + traslado.",
      },
      {
        question: "¿Cuánto dura el paquete de Hammam?",
        answer:
          "Hammam estándar 90 minutos (€50): exfoliación + masaje de espuma + sauna + jacuzzi. Paquete Deluxe 2 horas (€75): Hammam + 30 minutos de masaje sueco con aceite + mascarilla corporal completa. Ambos incluyen traslado desde el hotel.",
      },
    ],
    packages: [
      {
        question: "¿Los precios de los paquetes son por persona o en total?",
        answer:
          "Los precios indicados son por persona (en ocupación doble). El paquete Luna de miel €1495 es el total para la pareja, el paquete de propuesta de matrimonio €1295 es por persona organizada. El paquete Familiar es el precio total para 2 adultos + 2 niños.",
      },
      {
        question: "¿En qué nivel está el vuelo en globo dentro de los paquetes?",
        answer:
          "Paquetes Día Completo Premium y Aventura: globo Estándar (€165); paquete Familiar: globo Estándar (niños 80%); paquetes Luna de miel y Propuesta de matrimonio: globo privado VIP Romántico (solo usted o 2 parejas en la cesta).",
      },
      {
        question: "¿Con cuánta antelación debo reservar un paquete?",
        answer:
          "Para temporada alta (mayo/septiembre-octubre) recomendamos reservar el paquete con al menos 4-6 semanas de antelación; para temporada baja 7-10 días son suficientes. Los paquetes Luna de miel y Propuesta de matrimonio requieren un mínimo de 14 días de antelación para la organización de la sorpresa.",
      },
      {
        question: "¿Qué tipo de hotel se incluye en los paquetes de hotel?",
        answer:
          "Día Completo Premium: hotel cueva de segmento medio (valor de €120-165 por noche). Luna de miel: VIP Honeymoon Cave (valor de €285 por noche). Familiar: Family Resort con piscina (valor de €145 por noche). Todos los paquetes incluyen desayuno bufé del hotel.",
      },
      {
        question: "¿Cómo funciona el paquete corporativo?",
        answer:
          "Grupo mínimo de 10 personas; €295 por persona. Incluye un globo de grupo (cesta de 15+ personas), tour guiado, cena de gala y un organizador corporativo. Hay pago con factura y opción de branding personalizado disponibles. Puede solicitar una oferta personalizada escribiendo a info@tripandtick.com.",
      },
    ],
    transfers: [
      {
        question: "¿Desde qué aeropuertos realizan traslados?",
        answer:
          "Aeropuerto de Nevşehir (NAV, 30-45 min, €35) y aeropuerto de Kayseri (ASR, 60-75 min, €55). Ambos aeropuertos ofrecen servicio directo a hoteles en Göreme/Ürgüp/Uçhisar.",
      },
      {
        question: "¿El precio del traslado es por persona?",
        answer:
          "No, el precio es por vehículo (1-4 personas). Para 5+ personas hay opción de minibús (€65-95) o vehículo VIP (€85-120). No hay límite de equipaje; avísenos con antelación para equipo especial (bicicleta, snowboard).",
      },
      {
        question: "¿El conductor me recogerá del hotel?",
        answer:
          "Llegada: un conductor con un cartel con su nombre le espera en la salida de llegadas del aeropuerto. Regreso: le recoge en la entrada del hotel en la fecha y hora indicadas. Comunicación instantánea disponible vía WhatsApp +90 537 464 78 61.",
      },
      {
        question: "¿Hay un cargo extra si mi vuelo se retrasa?",
        answer:
          "No, hacemos seguimiento de su vuelo. Los retrasos de hasta 90 minutos son gratuitos. Para 90+ minutos o paso a un nuevo día, puede aplicarse un cargo de espera de €15-25. Cancelación: reembolso del 100% desde 4+ horas de antelación.",
      },
    ],
    tours: [
      {
        question: "¿Cuántas horas duran los tours por Capadocia?",
        answer:
          "Los tours Rojo, Verde y Mix son de día completo (8-10 horas), el tour Amarillo 7-8 horas, el tour de las Ciudades Subterráneas es de medio día (5-6 horas), el tour de la Puesta de Sol dura 3 horas y el tour de Instagram/Foto es de medio día.",
      },
      {
        question: "¿Me recogerán y dejarán en mi hotel?",
        answer:
          "Sí, todos los paquetes de tour incluyen traslado gratuito desde los hoteles de las zonas de Göreme, Ürgüp, Uçhisar y Avanos. Desde otras zonas puede haber un cargo extra.",
      },
      {
        question: "¿Qué incluyen los precios de los tours?",
        answer:
          "Se incluye un guía profesional TR/EN/RU, traslado desde el hotel, entradas a los museos, almuerzo (tours Rojo/Verde/Mix) y todos los impuestos. Solo las propinas y los gastos personales no están incluidos.",
      },
      {
        question: "¿Cuál es el tour más popular?",
        answer:
          "El Tour Rojo (Red Tour) es el más solicitado — incluye el Museo al Aire Libre de Göreme, el Castillo de Uçhisar, Paşabağ y el taller de cerámica de Avanos. Desde €45.",
      },
      {
        question: "¿Puedo hacer más de un tour el mismo día?",
        answer:
          "No, los tours de día completo (Rojo/Verde/Mix/Amarillo) deben planificarse en días separados. Sin embargo, los tours de medio día (Ciudades Subterráneas + Puesta de Sol o Instagram + Puesta de Sol) pueden combinarse el mismo día.",
      },
    ],
  },
  nl: {
    activities: [
      {
        question: "Welke activiteiten zijn er in Cappadocië?",
        answer:
          "We bieden 7+ categorieën en in totaal 16 verschillende activiteitenpakketten aan, waaronder quad-safari, jeep-safari, paardrijden, Hammam, folkloreshow van de Turkse Nacht en microlight-vlucht. Allemaal inclusief hoteltransfer en vanaf €29.",
      },
      {
        question: "Wat is de leeftijdsgrens voor de quad- en jeep-safari?",
        answer:
          "Een quadrijbewijs is niet nodig; vanaf 16 jaar mag je alleen rijden, 6-15 jaar als passagier achter een volwassene. Bij de jeep-safari is er geen leeftijdsgrens en is een kinderzitje beschikbaar.",
      },
      {
        question: "In welk seizoen kunnen de activiteiten worden gedaan?",
        answer:
          "Quad, jeep en paardrijden zijn het hele jaar door in alle seizoenen mogelijk. De Hammam en Turkse Nacht zijn het hele jaar door binnen. De microlight-vlucht is afhankelijk van de windomstandigheden (meestal is maart-november optimaal).",
      },
      {
        question: "Wat is inbegrepen bij de show van de Turkse Nacht?",
        answer:
          "Pakket met diner €55: semah + folklore + oriëntaals + Kaukasische dans + 3-gangenmaaltijd + onbeperkt alcoholische/non-alcoholische drankjes + hoteltransfer (3 uur). Zonder diner €35: alleen show + welkomstdrankje + transfer.",
      },
      {
        question: "Hoe lang duurt het Hammam-pakket?",
        answer:
          "Standaard Hammam 90 minuten (€50): scrub + schuimmassage + sauna + jacuzzi. Deluxe-pakket 2 uur (€75): Hammam + 30 minuten Zweedse oliemassage + volledig lichaamsmasker. Beide inclusief hoteltransfer.",
      },
    ],
    packages: [
      {
        question: "Zijn de pakketprijzen per persoon of totaal?",
        answer:
          "De vermelde prijzen zijn per persoon (bij tweepersoonsbezetting). Het Huwelijksreis-pakket €1495 is het totaal voor het paar, het huwelijksaanzoek-pakket €1295 is per georganiseerde persoon. Het Gezinspakket is de totaalprijs voor 2 volwassenen + 2 kinderen.",
      },
      {
        question: "Op welk niveau is de ballonvaart in de pakketten?",
        answer:
          "Pakketten Hele Dag Premium en Avontuur: Standaardballon (€165); Gezinspakket: Standaardballon (kinderen 80%); pakketten Huwelijksreis en Huwelijksaanzoek: VIP Romantische privéballon (alleen u of 2 paren in de mand).",
      },
      {
        question: "Hoe ver van tevoren moet ik een pakket boeken?",
        answer:
          "Voor het hoogseizoen (mei/september-oktober) raden we aan het pakket minstens 4-6 weken van tevoren te boeken; voor het laagseizoen is 7-10 dagen voldoende. Huwelijksreis- en Huwelijksaanzoek-pakketten hebben minstens 14 dagen van tevoren nodig voor de verrassingsorganisatie.",
      },
      {
        question: "Welk type hotel is inbegrepen in de hotelpakketten?",
        answer:
          "Hele Dag Premium: grotelhotel middensegment (€120-165 overnachtingswaarde). Huwelijksreis: VIP Honeymoon Cave (€285 overnachtingswaarde). Gezin: Family Resort met zwembad (€145 overnachtingswaarde). Alle pakketten zijn inclusief een hotel-ontbijtbuffet.",
      },
      {
        question: "Hoe werkt het zakelijke pakket?",
        answer:
          "Groep van minimaal 10 personen; €295 per persoon. Inbegrepen zijn een groepsballon (mand voor 15+ personen), begeleide tour, galadiner en een zakelijke organisator. Betaling op factuur en een optie voor aangepaste branding zijn beschikbaar. U kunt een offerte op maat aanvragen door te schrijven naar info@tripandtick.com.",
      },
    ],
    transfers: [
      {
        question: "Vanaf welke luchthavens verzorgt u transfers?",
        answer:
          "Luchthaven Nevşehir (NAV, 30-45 min, €35) en luchthaven Kayseri (ASR, 60-75 min, €55). Beide luchthavens bieden directe service naar hotels in Göreme/Ürgüp/Uçhisar.",
      },
      {
        question: "Is de transferprijs per persoon?",
        answer:
          "Nee, de prijs is per voertuig (1-4 personen). Voor 5+ personen is er een minibus (€65-95) of VIP-voertuig (€85-120). Er is geen bagagelimiet; meld speciale uitrusting (fiets, snowboard) vooraf aan.",
      },
      {
        question: "Haalt de chauffeur me op bij het hotel?",
        answer:
          "Aankomst: een chauffeur met een naambordje wacht op u bij de aankomsthal van de luchthaven. Terugreis: hij haalt u op bij de hotelingang op de aangegeven datum en tijd. Directe communicatie beschikbaar via WhatsApp +90 537 464 78 61.",
      },
      {
        question: "Zijn er extra kosten als mijn vlucht vertraging heeft?",
        answer:
          "Nee, we volgen uw vlucht. Vertragingen tot 90 minuten zijn gratis. Bij 90+ minuten of overgang naar een nieuwe dag kan een wachttarief van €15-25 gelden. Annulering: 100% terugbetaling vanaf 4+ uur van tevoren.",
      },
    ],
    tours: [
      {
        question: "Hoeveel uur duren de Cappadocië-tours?",
        answer:
          "De Rode, Groene en Mix-tour duren een hele dag (8-10 uur), de Gele tour 7-8 uur, de tour naar de Ondergrondse Steden is een halve dag (5-6 uur), de Zonsondergang-tour duurt 3 uur en de Instagram-/Foto-tour is een halve dag.",
      },
      {
        question: "Word ik opgehaald en afgezet bij mijn hotel?",
        answer:
          "Ja, alle tourpakketten zijn inclusief gratis transfer vanaf hotels in de gebieden Göreme, Ürgüp, Uçhisar en Avanos. Vanuit andere gebieden kunnen extra kosten gelden.",
      },
      {
        question: "Wat is inbegrepen in de tourprijzen?",
        answer:
          "Een professionele TR/EN/RU-gids, hoteltransfer, toegangstickets voor musea, lunch (Rode/Groene/Mix-tours) en alle belastingen zijn inbegrepen. Alleen fooien en persoonlijke uitgaven zijn niet inbegrepen.",
      },
      {
        question: "Welke tour is het populairst?",
        answer:
          "De Rode Tour (Red Tour) is de meest gekozene — deze omvat het Openluchtmuseum van Göreme, het kasteel van Uçhisar, Paşabağ en het pottenbakkersatelier van Avanos. Vanaf €45.",
      },
      {
        question: "Kan ik meerdere tours op dezelfde dag doen?",
        answer:
          "Nee, de hele dag durende tours (Rood/Groen/Mix/Geel) moeten op aparte dagen worden gepland. De halve dag durende tours (Ondergrondse Steden + Zonsondergang of Instagram + Zonsondergang) kunnen echter op dezelfde dag worden gecombineerd.",
      },
    ],
  },
  zh: {
    activities: [
      {
        question: "卡帕多西亚有哪些活动？",
        answer:
          "我们提供 7 个以上类别、共 16 种不同的活动套餐，包括 ATV 越野、吉普车越野、骑马、Hammam、土耳其之夜民俗表演和微型飞机飞行。全部含酒店接送，€29 起。",
      },
      {
        question: "ATV 和吉普车越野的年龄限制是多少？",
        answer:
          "无需 ATV 驾照；16 岁以上可单独驾驶，6-15 岁须坐在成人后方作为乘客。吉普车越野无年龄限制，并提供儿童座椅。",
      },
      {
        question: "这些活动在哪个季节可以进行？",
        answer:
          "ATV、吉普车和骑马全年各季节均开放。Hammam 和土耳其之夜全年在室内进行。微型飞机飞行视风力情况而定（一般 3 月至 11 月最佳）。",
      },
      {
        question: "土耳其之夜表演包含什么？",
        answer:
          "含晚餐套餐 €55：semah + 民俗 + 东方舞 + 高加索舞 + 3 道菜 + 无限量含酒精/不含酒精饮料 + 酒店接送（3 小时）。不含晚餐套餐 €35：仅表演 + 迎宾饮料 + 接送。",
      },
      {
        question: "Hammam 套餐需要多长时间？",
        answer:
          "标准 Hammam 90 分钟（€50）：去角质 + 泡沫按摩 + 桑拿 + 按摩浴缸。豪华套餐 2 小时（€75）：Hammam + 30 分钟瑞典精油按摩 + 全身面膜。两者均含酒店接送。",
      },
    ],
    packages: [
      {
        question: "套餐价格是按人计还是总价？",
        answer:
          "所标价格为每人价格（双人入住）。蜜月套餐 €1495 为情侣总价，求婚套餐 €1295 为所组织的每人价格。家庭套餐为 2 名成人 + 2 名儿童的总价。",
      },
      {
        question: "套餐中的热气球之旅是什么级别？",
        answer:
          "全日豪华和探险套餐：标准热气球（€165）；家庭套餐：标准热气球（儿童 80%）；蜜月和求婚套餐：VIP 浪漫私人热气球（吊篮中仅有您或 2 对情侣）。",
      },
      {
        question: "我应提前多久预订套餐？",
        answer:
          "旺季（5 月/9 月至 10 月）建议至少提前 4-6 周预订套餐；淡季 7-10 天即可。蜜月和求婚套餐为惊喜安排需至少提前 14 天。",
      },
      {
        question: "酒店套餐中包含哪种类型的酒店？",
        answer:
          "全日豪华：中档洞穴酒店（每晚价值 €120-165）。蜜月：VIP Honeymoon Cave（每晚价值 €285）。家庭：带泳池的 Family Resort（每晚价值 €145）。所有套餐均含酒店自助早餐。",
      },
      {
        question: "企业套餐如何运作？",
        answer:
          "团体最少 10 人；每人 €295。包含团体热气球（15 人以上吊篮）、导游游览、晚宴和企业组织者。提供开具发票付款和专属品牌定制选项。您可写信至 info@tripandtick.com 获取专属报价。",
      },
    ],
    transfers: [
      {
        question: "你们从哪些机场提供接送服务？",
        answer:
          "Nevşehir 机场（NAV，30-45 分钟，€35）和 Kayseri 机场（ASR，60-75 分钟，€55）。两个机场均提供直达 Göreme/Ürgüp/Uçhisar 酒店的服务。",
      },
      {
        question: "接送价格是按人计吗？",
        answer:
          "不是，价格按车计（1-4 人）。5 人以上有小巴（€65-95）或 VIP 车辆（€85-120）选项。无行李限制；特殊装备（自行车、滑雪板）请提前告知。",
      },
      {
        question: "司机会到酒店接我吗？",
        answer:
          "抵达：司机会在机场到达出口举着写有您姓名的牌子等候。返程：在指定日期和时间到酒店门口接您。可通过 WhatsApp +90 537 464 78 61 即时联系。",
      },
      {
        question: "如果我的航班延误是否会额外收费？",
        answer:
          "不会，我们会追踪您的航班。90 分钟以内的延误免费。超过 90 分钟或跨入新的一天可能收取 €15-25 的等候费。取消：提前 4 小时以上可 100% 退款。",
      },
    ],
    tours: [
      {
        question: "卡帕多西亚的旅游团需要多少小时？",
        answer:
          "红线、绿线和混合线为全日游（8-10 小时），黄线 7-8 小时，地下城之旅为半日游（5-6 小时），日落之旅 3 小时，Instagram/摄影之旅为半日游。",
      },
      {
        question: "我会从酒店接送吗？",
        answer:
          "是的，所有旅游套餐均含从 Göreme、Ürgüp、Uçhisar 和 Avanos 地区酒店的免费接送。其他地区可能额外收费。",
      },
      {
        question: "旅游价格包含什么？",
        answer:
          "含专业 TR/EN/RU 导游、酒店接送、博物馆门票、午餐（红线/绿线/混合线）以及所有税费。仅小费和个人消费不包含在内。",
      },
      {
        question: "哪条线路最受欢迎？",
        answer:
          "红线（Red Tour）最受青睐——包括 Göreme 露天博物馆、Uçhisar 城堡、Paşabağ 和 Avanos 陶艺作坊。€45 起。",
      },
      {
        question: "我可以在同一天参加多条线路吗？",
        answer:
          "不可以，全日游线路（红线/绿线/混合线/黄线）须安排在不同日子。但半日游线路（地下城 + 日落 或 Instagram + 日落）可在同一天组合。",
      },
    ],
  },
  hi: {
    activities: [
      {
        question: "कप्पादोसिया में कौन-कौन सी गतिविधियाँ हैं?",
        answer:
          "हम ATV सफारी, जीप सफारी, घुड़सवारी, Hammam, टर्किश नाइट लोकनृत्य शो और माइक्रोलाइट उड़ान सहित 7+ श्रेणियों में कुल 16 अलग-अलग गतिविधि पैकेज प्रदान करते हैं। सभी में होटल ट्रांसफर शामिल है और €29 से शुरू होते हैं।",
      },
      {
        question: "ATV और जीप सफारी के लिए आयु सीमा क्या है?",
        answer:
          "ATV लाइसेंस आवश्यक नहीं है; 16+ आयु अकेले चला सकते हैं, 6-15 आयु एक वयस्क के पीछे यात्री के रूप में। जीप सफारी में कोई आयु सीमा नहीं है, और बच्चों की सीट उपलब्ध है।",
      },
      {
        question: "गतिविधियाँ किस मौसम में की जा सकती हैं?",
        answer:
          "ATV, जीप और घुड़सवारी पूरे वर्ष सभी मौसमों में खुली रहती हैं। Hammam और टर्किश नाइट पूरे वर्ष इनडोर हैं। माइक्रोलाइट उड़ान हवा की स्थिति पर निर्भर करती है (आमतौर पर मार्च-नवंबर सर्वोत्तम)।",
      },
      {
        question: "टर्किश नाइट शो में क्या शामिल है?",
        answer:
          "रात्रिभोज पैकेज €55: semah + लोकनृत्य + ओरिएंटल + काकेशियन नृत्य + 3 व्यंजन + असीमित अल्कोहलिक/नॉन-अल्कोहलिक पेय + होटल ट्रांसफर (3 घंटे)। बिना रात्रिभोज €35: केवल शो + स्वागत पेय + ट्रांसफर।",
      },
      {
        question: "Hammam पैकेज कितने समय का होता है?",
        answer:
          "स्टैंडर्ड Hammam 90 मिनट (€50): स्क्रब + फोम मसाज + सॉना + जकूज़ी। डीलक्स पैकेज 2 घंटे (€75): Hammam + 30 मिनट स्वीडिश तेल मसाज + पूर्ण शरीर मास्क। दोनों में होटल ट्रांसफर शामिल है।",
      },
    ],
    packages: [
      {
        question: "पैकेज की कीमतें प्रति व्यक्ति हैं या कुल?",
        answer:
          "बताई गई कीमतें प्रति व्यक्ति हैं (डबल ऑक्यूपेंसी में)। हनीमून पैकेज €1495 जोड़े के लिए कुल है, विवाह प्रस्ताव पैकेज €1295 आयोजित प्रति व्यक्ति है। फैमिली पैकेज 2 वयस्क + 2 बच्चों की कुल कीमत है।",
      },
      {
        question: "पैकेज में बैलून राइड किस स्तर की है?",
        answer:
          "फुल डे प्रीमियम और एडवेंचर पैकेज: स्टैंडर्ड बैलून (€165); फैमिली पैकेज: स्टैंडर्ड बैलून (बच्चे 80%); हनीमून और विवाह प्रस्ताव पैकेज: VIP रोमांटिक निजी बैलून (टोकरी में केवल आप या 2 जोड़े)।",
      },
      {
        question: "मुझे पैकेज कितने पहले बुक करना चाहिए?",
        answer:
          "उच्च सीज़न (मई/सितंबर-अक्टूबर) के लिए हम पैकेज कम से कम 4-6 सप्ताह पहले बुक करने की सलाह देते हैं; कम सीज़न के लिए 7-10 दिन पर्याप्त हैं। हनीमून और विवाह प्रस्ताव पैकेज के लिए सरप्राइज़ आयोजन हेतु कम से कम 14 दिन पहले।",
      },
      {
        question: "होटल पैकेज में किस प्रकार का होटल शामिल है?",
        answer:
          "फुल डे प्रीमियम: मध्यम-श्रेणी का केव होटल (€120-165 प्रति रात मूल्य)। हनीमून: VIP Honeymoon Cave (€285 प्रति रात मूल्य)। फैमिली: पूल वाला Family Resort (€145 प्रति रात मूल्य)। सभी पैकेज में होटल का ओपन बुफे नाश्ता शामिल है।",
      },
      {
        question: "कॉर्पोरेट पैकेज कैसे काम करता है?",
        answer:
          "न्यूनतम 10 लोगों का समूह; प्रति व्यक्ति €295। इसमें ग्रुप बैलून (15+ व्यक्ति की टोकरी), गाइडेड टूर, गाला डिनर और कॉर्पोरेट आयोजक शामिल हैं। चालान भुगतान और कस्टम ब्रांडिंग विकल्प उपलब्ध है। आप info@tripandtick.com पर लिखकर विशेष ऑफ़र प्राप्त कर सकते हैं।",
      },
    ],
    transfers: [
      {
        question: "आप किन हवाई अड्डों से ट्रांसफर प्रदान करते हैं?",
        answer:
          "Nevşehir हवाई अड्डा (NAV, 30-45 मिनट, €35) और Kayseri हवाई अड्डा (ASR, 60-75 मिनट, €55)। दोनों हवाई अड्डे Göreme/Ürgüp/Uçhisar के होटलों तक सीधी सेवा प्रदान करते हैं।",
      },
      {
        question: "क्या ट्रांसफर की कीमत प्रति व्यक्ति है?",
        answer:
          "नहीं, कीमत प्रति वाहन है (1-4 लोग)। 5+ लोगों के लिए मिनीबस (€65-95) या VIP वाहन (€85-120) विकल्प है। कोई सामान सीमा नहीं है; विशेष उपकरण (साइकिल, स्नोबोर्ड) के लिए पहले से सूचित करें।",
      },
      {
        question: "क्या ड्राइवर मुझे होटल से लेगा?",
        answer:
          "आगमन: हवाई अड्डे के आगमन निकास पर नाम की तख्ती लिए एक ड्राइवर आपका इंतज़ार करता है। वापसी: निर्दिष्ट तिथि और समय पर होटल प्रवेश से ले जाता है। WhatsApp +90 537 464 78 61 के माध्यम से त्वरित संपर्क उपलब्ध है।",
      },
      {
        question: "यदि मेरी उड़ान में देरी हो तो क्या अतिरिक्त शुल्क है?",
        answer:
          "नहीं, हम आपकी उड़ान को ट्रैक करते हैं। 90 मिनट तक की देरी निःशुल्क है। 90+ मिनट या नए दिन में जाने पर €15-25 प्रतीक्षा शुल्क लागू हो सकता है। रद्दीकरण: 4+ घंटे पहले से 100% रिफंड।",
      },
    ],
    tours: [
      {
        question: "कप्पादोसिया के टूर कितने घंटे चलते हैं?",
        answer:
          "रेड, ग्रीन और मिक्स टूर पूरे दिन के (8-10 घंटे), येलो टूर 7-8 घंटे, अंडरग्राउंड सिटीज़ टूर आधे दिन का (5-6 घंटे), सनसेट टूर 3 घंटे और Instagram/फोटो टूर आधे दिन का है।",
      },
      {
        question: "क्या मुझे मेरे होटल से लिया और छोड़ा जाएगा?",
        answer:
          "हाँ, सभी टूर पैकेज में Göreme, Ürgüp, Uçhisar और Avanos क्षेत्रों के होटलों से निःशुल्क ट्रांसफर शामिल है। अन्य क्षेत्रों से अतिरिक्त शुल्क हो सकता है।",
      },
      {
        question: "टूर की कीमतों में क्या शामिल है?",
        answer:
          "पेशेवर TR/EN/RU गाइड, होटल ट्रांसफर, संग्रहालय प्रवेश टिकट, दोपहर का भोजन (रेड/ग्रीन/मिक्स टूर) और सभी कर शामिल हैं। केवल टिप और व्यक्तिगत खर्चे शामिल नहीं हैं।",
      },
      {
        question: "कौन सा टूर सबसे लोकप्रिय है?",
        answer:
          "रेड टूर (Red Tour) सबसे पसंदीदा है — इसमें Göreme ओपन एयर म्यूज़ियम, Uçhisar किला, Paşabağ और Avanos मिट्टी के बर्तन कार्यशाला शामिल हैं। €45 से शुरू।",
      },
      {
        question: "क्या मैं एक ही दिन में एक से अधिक टूर कर सकता हूँ?",
        answer:
          "नहीं, पूरे दिन के टूर (रेड/ग्रीन/मिक्स/येलो) अलग-अलग दिनों में योजना बनानी चाहिए। हालांकि, आधे दिन के टूर (अंडरग्राउंड सिटीज़ + सनसेट या Instagram + सनसेट) एक ही दिन में संयोजित किए जा सकते हैं।",
      },
    ],
  },
  ur: {
    activities: [
      {
        question: "کاپاڈوکیا میں کون کون سی سرگرمیاں ہیں؟",
        answer:
          "ہم ATV سفاری، جیپ سفاری، گھڑ سواری، Hammam، ترکش نائٹ لوک رقص شو اور مائیکرولائٹ پرواز سمیت 7+ زمروں میں کل 16 مختلف سرگرمی پیکجز پیش کرتے ہیں۔ سب میں ہوٹل ٹرانسفر شامل ہے اور €29 سے شروع ہوتے ہیں۔",
      },
      {
        question: "ATV اور جیپ سفاری کے لیے عمر کی حد کیا ہے؟",
        answer:
          "ATV لائسنس درکار نہیں؛ 16+ سال اکیلے چلا سکتے ہیں، 6-15 سال ایک بالغ کے پیچھے مسافر کے طور پر۔ جیپ سفاری میں عمر کی کوئی حد نہیں، اور بچوں کی سیٹ دستیاب ہے۔",
      },
      {
        question: "سرگرمیاں کس موسم میں کی جا سکتی ہیں؟",
        answer:
          "ATV، جیپ اور گھڑ سواری سال بھر تمام موسموں میں کھلی رہتی ہیں۔ Hammam اور ترکش نائٹ سال بھر اندرونی ہیں۔ مائیکرولائٹ پرواز ہوا کی صورتحال پر منحصر ہے (عموماً مارچ-نومبر بہترین ہے)۔",
      },
      {
        question: "ترکش نائٹ شو میں کیا شامل ہے؟",
        answer:
          "کھانے کے ساتھ پیکج €55: semah + لوک رقص + اورینٹل + کاکیشین رقص + 3 اقسام کا کھانا + لامحدود الکوحلک/غیر الکوحلک مشروبات + ہوٹل ٹرانسفر (3 گھنٹے)۔ کھانے کے بغیر €35: صرف شو + خوش آمدید مشروب + ٹرانسفر۔",
      },
      {
        question: "Hammam پیکج کتنا وقت لیتا ہے؟",
        answer:
          "اسٹینڈرڈ Hammam 90 منٹ (€50): اسکرب + فوم مساج + ساؤنا + جکوزی۔ ڈی لکس پیکج 2 گھنٹے (€75): Hammam + 30 منٹ سویڈش آئل مساج + مکمل جسمانی ماسک۔ دونوں میں ہوٹل ٹرانسفر شامل ہے۔",
      },
    ],
    packages: [
      {
        question: "پیکج کی قیمتیں فی شخص ہیں یا کل؟",
        answer:
          "بتائی گئی قیمتیں فی شخص ہیں (ڈبل آکیوپینسی میں)۔ ہنی مون پیکج €1495 جوڑے کے لیے کل ہے، شادی کی تجویز کا پیکج €1295 منظم کیے گئے فی شخص ہے۔ فیملی پیکج 2 بالغ + 2 بچوں کی کل قیمت ہے۔",
      },
      {
        question: "پیکجز میں بیلون رائیڈ کس درجے کی ہے؟",
        answer:
          "فل ڈے پریمیم اور ایڈونچر پیکجز: اسٹینڈرڈ بیلون (€165)؛ فیملی پیکج: اسٹینڈرڈ بیلون (بچے 80%)؛ ہنی مون اور شادی کی تجویز پیکجز: VIP رومانٹک نجی بیلون (ٹوکری میں صرف آپ یا 2 جوڑے)۔",
      },
      {
        question: "مجھے پیکج کتنا پہلے بک کرنا چاہیے؟",
        answer:
          "ہائی سیزن (مئی/ستمبر-اکتوبر) کے لیے ہم پیکج کم از کم 4-6 ہفتے پہلے بک کرنے کی سفارش کرتے ہیں؛ کم سیزن کے لیے 7-10 دن کافی ہیں۔ ہنی مون اور شادی کی تجویز پیکجز کے لیے سرپرائز انتظام کی خاطر کم از کم 14 دن پہلے۔",
      },
      {
        question: "ہوٹل پیکجز میں کس قسم کا ہوٹل شامل ہے؟",
        answer:
          "فل ڈے پریمیم: درمیانے درجے کا کیو ہوٹل (€120-165 فی رات قدر)۔ ہنی مون: VIP Honeymoon Cave (€285 فی رات قدر)۔ فیملی: پول والا Family Resort (€145 فی رات قدر)۔ تمام پیکجز میں ہوٹل کا اوپن بوفے ناشتہ شامل ہے۔",
      },
      {
        question: "کارپوریٹ پیکج کیسے کام کرتا ہے؟",
        answer:
          "کم از کم 10 افراد کا گروپ؛ فی شخص €295۔ اس میں گروپ بیلون (15+ افراد کی ٹوکری)، گائیڈڈ ٹور، گالا ڈنر اور کارپوریٹ منتظم شامل ہیں۔ انوائس ادائیگی اور کسٹم برانڈنگ کا اختیار دستیاب ہے۔ آپ info@tripandtick.com پر لکھ کر خصوصی پیشکش حاصل کر سکتے ہیں۔",
      },
    ],
    transfers: [
      {
        question: "آپ کن ہوائی اڈوں سے ٹرانسفر فراہم کرتے ہیں؟",
        answer:
          "Nevşehir ہوائی اڈہ (NAV، 30-45 منٹ، €35) اور Kayseri ہوائی اڈہ (ASR، 60-75 منٹ، €55)۔ دونوں ہوائی اڈے Göreme/Ürgüp/Uçhisar کے ہوٹلوں تک براہ راست سروس فراہم کرتے ہیں۔",
      },
      {
        question: "کیا ٹرانسفر کی قیمت فی شخص ہے؟",
        answer:
          "نہیں، قیمت فی گاڑی ہے (1-4 افراد)۔ 5+ افراد کے لیے منی بس (€65-95) یا VIP گاڑی (€85-120) کا اختیار ہے۔ سامان کی کوئی حد نہیں؛ خصوصی سامان (سائیکل، سنو بورڈ) کے لیے پہلے سے اطلاع دیں۔",
      },
      {
        question: "کیا ڈرائیور مجھے ہوٹل سے لے گا؟",
        answer:
          "آمد: ہوائی اڈے کے آمد خروج پر نام کی تختی لیے ڈرائیور آپ کا انتظار کرتا ہے۔ واپسی: مقررہ تاریخ اور وقت پر ہوٹل کے داخلی دروازے سے لے جاتا ہے۔ WhatsApp +90 537 464 78 61 کے ذریعے فوری رابطہ دستیاب ہے۔",
      },
      {
        question: "اگر میری پرواز میں تاخیر ہو تو کیا اضافی فیس ہے؟",
        answer:
          "نہیں، ہم آپ کی پرواز کو ٹریک کرتے ہیں۔ 90 منٹ تک کی تاخیر مفت ہے۔ 90+ منٹ یا نئے دن میں منتقلی کی صورت میں €15-25 انتظار فیس لاگو ہو سکتی ہے۔ منسوخی: 4+ گھنٹے پہلے سے 100% رقم کی واپسی۔",
      },
    ],
    tours: [
      {
        question: "کاپاڈوکیا کے ٹور کتنے گھنٹے چلتے ہیں؟",
        answer:
          "ریڈ، گرین اور مکس ٹور پورے دن کے (8-10 گھنٹے)، یلو ٹور 7-8 گھنٹے، انڈرگراؤنڈ سٹیز ٹور آدھے دن کا (5-6 گھنٹے)، سن سیٹ ٹور 3 گھنٹے اور Instagram/فوٹو ٹور آدھے دن کا ہے۔",
      },
      {
        question: "کیا مجھے میرے ہوٹل سے لیا اور چھوڑا جائے گا؟",
        answer:
          "جی ہاں، تمام ٹور پیکجز میں Göreme، Ürgüp، Uçhisar اور Avanos علاقوں کے ہوٹلوں سے مفت ٹرانسفر شامل ہے۔ دیگر علاقوں سے اضافی فیس ہو سکتی ہے۔",
      },
      {
        question: "ٹور کی قیمتوں میں کیا شامل ہے؟",
        answer:
          "پیشہ ور TR/EN/RU گائیڈ، ہوٹل ٹرانسفر، میوزیم داخلے کے ٹکٹ، دوپہر کا کھانا (ریڈ/گرین/مکس ٹور) اور تمام ٹیکس شامل ہیں۔ صرف ٹپ اور ذاتی اخراجات شامل نہیں ہیں۔",
      },
      {
        question: "کون سا ٹور سب سے مقبول ہے؟",
        answer:
          "ریڈ ٹور (Red Tour) سب سے زیادہ پسند کیا جاتا ہے — اس میں Göreme اوپن ایئر میوزیم، Uçhisar قلعہ، Paşabağ اور Avanos مٹی کے برتنوں کی ورکشاپ شامل ہیں۔ €45 سے شروع۔",
      },
      {
        question: "کیا میں ایک ہی دن میں ایک سے زائد ٹور کر سکتا ہوں؟",
        answer:
          "نہیں، پورے دن کے ٹور (ریڈ/گرین/مکس/یلو) الگ الگ دنوں میں منصوبہ بندی کرنی چاہیے۔ تاہم، آدھے دن کے ٹور (انڈرگراؤنڈ سٹیز + سن سیٹ یا Instagram + سن سیٹ) ایک ہی دن میں جمع کیے جا سکتے ہیں۔",
      },
    ],
  },
};

export function getPageFaqs(key: PageKey, locale: Locale): Faq[] {
  return (PAGE_FAQS[locale] ?? PAGE_FAQS.tr!)[key];
}
