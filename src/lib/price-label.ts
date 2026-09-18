// Baslangic-fiyat etiketi (server-safe, meta/OG title icin KISA form).
// Site net fiyat vermez: "€100'dan" / "from €100". UI'daki uzun sablon
// uiText.serviceCard.fromPrice ("… başlayan fiyatlarla"); title ≤60 karakter
// kaldigi icin burada kisa sozluk. "{price}" formatPrice ciktisiyla dolar.
//
// Importers: src/lib/service-detail-page.tsx, src/app/[locale]/balonlar/[slug]/page.tsx

import type { Locale } from "@/lib/i18n/dictionaries";
import { formatPrice } from "@/lib/utils";

const SHORT: Record<Locale, string> = {
  tr: "{price}'dan",
  en: "from {price}",
  de: "ab {price}",
  fr: "dès {price}",
  es: "desde {price}",
  nl: "vanaf {price}",
  zh: "{price} 起",
  hi: "{price} से",
  ur: "{price} سے",
  pt: "desde {price}",
  "pt-BR": "a partir de {price}",
  ja: "{price}〜",
  ko: "{price}부터",
  it: "da {price}",
  ru: "от {price}",
  uk: "від {price}",
  az: "{price}-dan",
};

export function fromPriceShort(locale: Locale, price: number, currency = "EUR"): string {
  return (SHORT[locale] ?? SHORT.en).replace("{price}", formatPrice(price, currency));
}
