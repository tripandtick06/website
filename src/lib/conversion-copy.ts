// Konversiyon metinleri (2026-10-16): /turlar + /transferler hero fiyat alt-satiri ve
// dil banner'i. 17 dilin hepsi zorunlu (Record<Locale,...> eksigi derleme hatasi yapar).
// Fiyat HER ZAMAN "baslayan/from" kalibinda — net fiyat YOK (tests/lib/from-pricing.test.ts).
// Fiyatlar katalogdan gelir (en dusuk adultPrice); burada sabit rakam yok.

import type { Locale } from "@/lib/i18n/dictionaries";
import { formatPrice } from "@/lib/utils";

// Turkce ek: "12'den", "30'dan", "50'den" — son okunan sayiya gore (unlu uyumu).
function trFromSuffix(n: number): string {
  const v = Math.round(n);
  const ones = v % 10;
  if (ones !== 0) return [ "", "den", "den", "ten", "ten", "ten", "dan", "den", "den", "dan"][ones];
  const tens = Math.floor((v % 100) / 10);
  if (tens !== 0) return ["", "dan", "den", "dan", "tan", "den", "tan", "ten", "den", "dan"][tens];
  return v === 0 ? "dan" : "den"; // yuz, bin...
}

/** "{price}'den başlayan" benzeri kisa from-ifadesi (17 dil). */
const FROM: Record<Locale, string> = {
  tr: "{price}'{sfx} başlayan",
  en: "from {price}",
  de: "ab {price}",
  fr: "dès {price}",
  es: "desde {price}",
  nl: "vanaf {price}",
  zh: "{price} 起",
  hi: "{price} से शुरू",
  ur: "{price} سے شروع",
  pt: "desde {price}",
  "pt-BR": "a partir de {price}",
  ja: "{price}〜",
  ko: "{price}부터",
  it: "da {price}",
  ru: "от {price}",
  uk: "від {price}",
  az: "{price}-dan başlayan",
};

const TOURS_LINE: Record<Locale, string> = {
  tr: "{price}'{sfx} başlayan fiyatlar",
  en: "Prices from {price}",
  de: "Preise ab {price}",
  fr: "Prix dès {price}",
  es: "Precios desde {price}",
  nl: "Prijzen vanaf {price}",
  zh: "价格 {price} 起",
  hi: "कीमतें {price} से शुरू",
  ur: "قیمتیں {price} سے شروع",
  pt: "Preços desde {price}",
  "pt-BR": "Preços a partir de {price}",
  ja: "{price}〜の料金",
  ko: "{price}부터 시작하는 가격",
  it: "Prezzi da {price}",
  ru: "Цены от {price}",
  uk: "Ціни від {price}",
  az: "{price}-dan başlayan qiymətlər",
};

const TRANSFERS_LABEL: Record<Locale, string> = {
  tr: "Nevşehir / Kayseri havalimanı transfer · sabit fiyat",
  en: "Nevşehir / Kayseri airport transfers · fixed price",
  de: "Flughafentransfer Nevşehir / Kayseri · Festpreis",
  fr: "Transferts aéroport Nevşehir / Kayseri · prix fixe",
  es: "Traslados aeropuerto Nevşehir / Kayseri · precio fijo",
  nl: "Luchthaventransfers Nevşehir / Kayseri · vaste prijs",
  zh: "内夫谢希尔 / 开塞利机场接送 · 固定价格",
  hi: "नेवशेहिर / कायसेरी हवाई अड्डा ट्रांसफ़र · तय कीमत",
  ur: "نوشہیر / قیصری ایئرپورٹ ٹرانسفر · مقررہ قیمت",
  pt: "Transfers aeroporto Nevşehir / Kayseri · preço fixo",
  "pt-BR": "Transfers aeroporto Nevşehir / Kayseri · preço fixo",
  ja: "ネヴシェヒル / カイセリ空港送迎 · 固定料金",
  ko: "네브셰히르 / 카이세리 공항 트랜스퍼 · 고정 요금",
  it: "Transfer aeroporto Nevşehir / Kayseri · prezzo fisso",
  ru: "Трансфер из аэропортов Невшехир / Кайсери · фиксированная цена",
  uk: "Трансфер з аеропортів Невшехір / Кайсері · фіксована ціна",
  az: "Nevşehir / Kayseri hava limanı transferi · sabit qiymət",
};

function fill(tpl: string, price: number, currency: string): string {
  return tpl.replace("{price}", formatPrice(price, currency)).replace("{sfx}", trFromSuffix(price));
}

export function lowestPrice(items: { adultPrice: number; currency: string }[]): { price: number; currency: string } {
  const min = items.reduce((a, b) => (b.adultPrice < a.adultPrice ? b : a));
  return { price: min.adultPrice, currency: min.currency };
}

export function toursSubline(locale: Locale, price: number, currency = "EUR"): string {
  return fill(TOURS_LINE[locale] ?? TOURS_LINE.en, price, currency);
}

export function transfersSubline(locale: Locale, price: number, currency = "EUR"): string {
  return `${TRANSFERS_LABEL[locale] ?? TRANSFERS_LABEL.en} · ${fill(FROM[locale] ?? FROM.en, price, currency)}`;
}

/** Dil banner'i: hedef dilin kendi dilinde "Continue in X →". */
export const LANG_BANNER: Record<Locale, string> = {
  tr: "Türkçe devam et →",
  en: "Continue in English →",
  de: "Auf Deutsch weiter →",
  fr: "Continuer en français →",
  es: "Continuar en español →",
  nl: "Verder in het Nederlands →",
  zh: "继续使用中文 →",
  hi: "हिन्दी में जारी रखें →",
  ur: "اردو میں جاری رکھیں →",
  pt: "Continuar em português →",
  "pt-BR": "Continuar em português →",
  ja: "日本語で続ける →",
  ko: "한국어로 계속 →",
  it: "Continua in italiano →",
  ru: "Продолжить на русском →",
  uk: "Продовжити українською →",
  az: "Azərbaycan dilində davam et →",
};
