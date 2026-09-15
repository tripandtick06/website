// Pure FAQ builder for operator detail pages.
//
// Importers: operatorler/[id]/page.tsx (server, for faqPageSchema),
//   OperatorDetayContent.tsx (client, for the visible FAQ list — same
//   output so schema and visible content match).
// Rule: every answer is derived ONLY from the packages array passed in
// and the flight facts that hold for every Cappadocia balloon flight
// (60 min standard flight, 16-20 seat basket, sunrise slot, daily
// civil-aviation weather approval, hotel pickup, 100% refund on weather
// cancellation). No operator-specific numeric claim (fleet, founding
// year, pilots, phone, licence, rating) is introduced here — see
// src/data/services/operators.ts header for why those were removed.

import type { Operator } from "@/data/services/operators";
import type { BalloonPackage } from "@/data/services/balloons";
import { formatPrice } from "@/lib/utils";

export interface OperatorFaqItem {
  question: string;
  answer: string;
}

function cheapestPackage(packages: BalloonPackage[]): BalloonPackage | null {
  if (packages.length === 0) return null;
  return packages.reduce((min, p) => (p.adultPrice < min.adultPrice ? p : min), packages[0]);
}

export function operatorFaqs(
  op: Operator,
  packages: BalloonPackage[],
  locale: string
): OperatorFaqItem[] {
  const isTr = locale === "tr";
  const name = isTr ? op.name : op.aliases[0] ?? op.name;
  const cheapest = cheapestPackage(packages);

  if (isTr) {
    return [
      {
        question: `${name} ile balon turu ne kadar sürer?`,
        answer:
          `${name} ile uçuşlar da Kapadokya'daki her balon turu gibi gün doğumu ` +
          `saatinde yapılır: Standart Balon Uçuşu yaklaşık 60 dakika havada, 16-20 ` +
          `kişilik bir sepette geçer. Deluxe paketlerde uçuş süresi daha uzundur. ` +
          `Kesin kalkış ve iniş saati günün rüzgâr ve görüş koşullarına göre değişebilir.`,
      },
      {
        question: `${name} balon turu fiyatı ne kadar?`,
        answer: cheapest
          ? `${name} ile Trip and Tick üzerinden satılan paketler ${formatPrice(
              cheapest.adultPrice,
              cheapest.currency
            )}'den başlayan fiyatlarla rezerve edilir; güncel fiyat aşağıdaki paket ` +
            `kartında görünür ve 7 gün içindeki tarihlerde hava ve doluluğa göre günlük değişebilir.`
          : `Trip and Tick şu anda ${name} ile satışta olan bir paket sunmuyor; güncel ` +
            `balon turu paketlerini /balonlar sayfasında görebilirsiniz.`,
      },
      {
        question: `${name} uçuşu saat kaçta kalkar?`,
        answer:
          `Kalkış gün doğumu civarındadır; otelden alış genellikle kalkıştan yaklaşık bir ` +
          `saat önce yapılır. Kesin saat, ertesi günün hava değerlendirmesine göre bir ` +
          `önceki akşam teyit edilir.`,
      },
      {
        question: `Hava kötüyse ne olur?`,
        answer:
          `Kalkış kararı her sabah Sivil Havacılık Genel Müdürlüğü'nün rüzgâr ve görüş ` +
          `değerlendirmesine bağlıdır. Operatör hava nedeniyle iptal ederse ödemenizin ` +
          `tamamı iade edilir veya uçuş başka bir güne alınır.`,
      },
      {
        question: `${name} ile nasıl rezervasyon yapılır?`,
        answer:
          `Aşağıdaki paket kartlarından birini seçip doğrudan rezervasyon ` +
          `yapabilir, ya da sorularınız için Trip and Tick'e WhatsApp üzerinden ` +
          `yazabilirsiniz.`,
      },
    ];
  }

  return [
    {
      question: `How long is a ${name} balloon flight?`,
      answer:
        `Like every balloon flight in Cappadocia, ${name} flights take off around ` +
        `sunrise: the Standard Balloon Flight is about 60 minutes in the air in a ` +
        `16-20 passenger basket. Deluxe packages fly longer. The exact take-off and ` +
        `landing time depends on the day's wind and visibility.`,
    },
    {
      question: `How much does a ${name} balloon flight cost?`,
      answer: cheapest
        ? `Packages sold with ${name} through Trip and Tick start from ${formatPrice(
            cheapest.adultPrice,
            cheapest.currency
          )}; the live price is shown on the package card below and can change daily ` +
          `with weather and demand for dates within 7 days.`
        : `Trip and Tick does not currently sell a package with ${name}; you can see the ` +
          `current balloon flight packages on the /balonlar page.`,
    },
    {
      question: `What time does the ${name} flight take off?`,
      answer:
        `Take-off is around sunrise; hotel pickup is usually about an hour before that. ` +
        `The exact time is confirmed the evening before, once the next day's weather is assessed.`,
    },
    {
      question: `What happens if the weather is bad?`,
      answer:
        `The go/no-go decision is made every morning by the Turkish civil aviation ` +
        `authority based on wind and visibility. If the operator cancels for weather you ` +
        `get a full refund or a new date.`,
    },
    {
      question: `How do I book with ${name}?`,
      answer:
        `Choose one of the package cards below to book directly, or write to Trip and ` +
        `Tick on WhatsApp with any questions.`,
    },
  ];
}
