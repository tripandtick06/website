// Server-side sozluk. Yeni diller (pt/pt-BR/ja/ko/it/ru/uk/az) icin Worker'a
// bundle edilen KUCUK meta override'i (sadece meta_* alanlar, ~10KB/dil) EN-alias
// uzerine MERGE eder. Saf JS — fs YOK, edge runtime'da calisir, Cloudflare 3 MiB
// limiti asilmaz (tam dict public/i18n'de kalir, body client-fetch ile cevrilir).
import { DICTIONARIES, type Dictionary, type Locale } from "./dictionaries";
import metaPt from "@/data/i18n/meta.pt.json";
import metaPtBR from "@/data/i18n/meta.pt-BR.json";
import metaJa from "@/data/i18n/meta.ja.json";
import metaKo from "@/data/i18n/meta.ko.json";
import metaIt from "@/data/i18n/meta.it.json";
import metaRu from "@/data/i18n/meta.ru.json";
import metaUk from "@/data/i18n/meta.uk.json";
import metaAz from "@/data/i18n/meta.az.json";

type Json = Record<string, unknown>;

const META: Partial<Record<Locale, Json>> = {
  pt: metaPt as Json,
  "pt-BR": metaPtBR as Json,
  ja: metaJa as Json,
  ko: metaKo as Json,
  it: metaIt as Json,
  ru: metaRu as Json,
  uk: metaUk as Json,
  az: metaAz as Json,
};

function deepMerge(base: Json, over: Json): Json {
  const out: Json = { ...base };
  for (const [k, v] of Object.entries(over)) {
    const b = out[k];
    if (v && typeof v === "object" && !Array.isArray(v) && b && typeof b === "object" && !Array.isArray(b)) {
      out[k] = deepMerge(b as Json, v as Json);
    } else {
      out[k] = v;
    }
  }
  return out;
}

const cache: Partial<Record<Locale, Dictionary>> = {};

export function serverDict(locale: Locale): Dictionary {
  const meta = META[locale];
  if (!meta) return DICTIONARIES[locale] as Dictionary;
  if (cache[locale]) return cache[locale] as Dictionary;
  // Yeni diller EN-alias; uzerine cevrili meta_* alanlari merge edilir.
  const merged = deepMerge(DICTIONARIES.en as unknown as Json, meta) as unknown as Dictionary;
  cache[locale] = merged;
  return merged;
}
