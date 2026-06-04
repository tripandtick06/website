/**
 * Detay sayfasi UZUN aciklama cevirisi — SERVICE_DESCRIPTIONS'in TR metnini
 * 15 locale'e cevirir (de fr es nl zh hi ur pt pt-BR ja ko it ru uk az).
 * tr+en zaten inline (source of truth) — bu script onlari ELLEMEZ.
 * Cikti: src/data/i18n/descriptions.<locale>.json  ->  { "<slug>": "<cevrili metin>" }
 * Calistir: npx tsx scripts/i18n/translate-descriptions.ts [locale1 locale2 ...]
 *   (locale verilmezse 15'inin hepsi)
 * Key: OPENAI_API_KEY (.env.local zaten yuklu) — _openai.ts.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { translateJson } from "./_openai";
import { SERVICE_DESCRIPTIONS } from "../../src/data/services/descriptions";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../../src/data/i18n");

// tr+en haric, canli sitedeki diger 15 locale.
const TARGET_LOCALES = [
  "de", "fr", "es", "nl", "zh", "hi", "ur",
  "pt", "pt-BR", "ja", "ko", "it", "ru", "uk", "az",
] as const;
type Target = (typeof TARGET_LOCALES)[number];

const LOCALE_NAME: Record<Target, string> = {
  de: "German", fr: "French", es: "Spanish", nl: "Dutch",
  zh: "Simplified Chinese", hi: "Hindi", ur: "Urdu",
  pt: "European Portuguese", "pt-BR": "Brazilian Portuguese", ja: "Japanese",
  ko: "Korean", it: "Italian", ru: "Russian", uk: "Ukrainian", az: "Azerbaijani",
};

// Kaynak: her slug'in TR uzun aciklamasi (source of truth).
function buildSource(): Record<string, string> {
  const src: Record<string, string> = {};
  for (const [slug, texts] of Object.entries(SERVICE_DESCRIPTIONS)) {
    if (texts.tr) src[slug] = texts.tr;
  }
  return src;
}

const SYSTEM = `You are a professional tourism/travel copywriter and localizer for "Trip and Tick", a Cappadocia (Turkey) travel agency (hot-air balloon tours, hotels, activities, day tours, transfers, packages).
Translate each JSON string VALUE from Turkish into {LANG}. Rules:
- Return ONLY valid JSON with the EXACT same keys. Never add/remove/reorder keys.
- Each value is a 50-90 word marketing description for a service-detail page. Keep roughly the same length and full meaning; write natural, idiomatic, trustworthy booking.com-style prose for {LANG} travel customers.
- Do NOT translate: prices, currency (€, EUR), numbers/durations, the brand "Trip and Tick", and proper nouns / place names (Cappadocia, Goreme, Urgup, Nevsehir, Kayseri, Avanos, Uchisar, Zelve, Pasabag, Devrent, Ihlara, Derinkuyu, Kaymakli, Selime, Soganli, Sobesos, Mustafapasa, TURSAB, NAV, ASR).
- Plain prose only — no markdown, no line breaks, no comments, no extra text. JSON only.`;

function chunkObject(obj: Record<string, string>, size: number): Record<string, string>[] {
  const keys = Object.keys(obj);
  const out: Record<string, string>[] = [];
  for (let i = 0; i < keys.length; i += size) {
    const part: Record<string, string> = {};
    for (const k of keys.slice(i, i + size)) part[k] = obj[k];
    out.push(part);
  }
  return out;
}

async function translateLocale(src: Record<string, string>, lang: string): Promise<Record<string, string>> {
  const merged: Record<string, string> = {};
  const chunks = chunkObject(src, 6);
  for (const chunk of chunks) {
    const out = (await translateJson(chunk, SYSTEM.replace(/\{LANG\}/g, lang), lang)) as Record<string, string>;
    Object.assign(merged, out);
    process.stdout.write(".");
  }
  return merged;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const src = buildSource();
  const argv = process.argv.slice(2).filter((a) => (TARGET_LOCALES as readonly string[]).includes(a)) as Target[];
  const targets: Target[] = argv.length ? argv : [...TARGET_LOCALES];

  for (const loc of targets) {
    const lang = LOCALE_NAME[loc];
    process.stdout.write(`\n[${loc}] ${lang} `);
    const result = await translateLocale(src, lang);
    const file = path.join(OUT_DIR, `descriptions.${loc}.json`);
    fs.writeFileSync(file, JSON.stringify(result, null, 2), "utf8");
    process.stdout.write(` -> ${file} (${Object.keys(result).length} slug)`);
  }
  process.stdout.write("\nDONE\n");
}

main().catch((e) => {
  console.error("\nFAILED:", e);
  process.exit(1);
});
