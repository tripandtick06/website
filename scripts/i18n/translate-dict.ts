/**
 * UI sozluk cevirisi — DICTIONARIES.en + UI_TEXT.en'i yeni dillere cevirir.
 * Cikti: src/data/i18n/dict.<locale>.json + uitext.<locale>.json
 * Calistir: npx tsx scripts/i18n/translate-dict.ts [locale...]
 *   (locale verilmezse 8 yeni dil: pt pt-BR ja ko it ru uk az)
 * Kaynak = EN (tam blok). Recursive chunked: buyuk gruplar alt-anahtarlara bolunur.
 * ANTHROPIC_API_KEY env'den.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { translateJson } from "./_openai";
import { DICTIONARIES } from "../../src/lib/i18n/dictionaries";
import { UI_TEXT } from "../../src/lib/i18n/uiText";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../../src/data/i18n");

const ALL = ["pt", "pt-BR", "ja", "ko", "it", "ru", "uk", "az"] as const;
const LOCALE_NAME: Record<string, string> = {
  pt: "European Portuguese", "pt-BR": "Brazilian Portuguese", ja: "Japanese",
  ko: "Korean", it: "Italian", ru: "Russian", uk: "Ukrainian", az: "Azerbaijani",
};

const CHUNK_LIMIT = 5000; // JSON char esigi — bundan buyuk grup alt-anahtarlara bolunur.

function system(lang: string): string {
  return `You are a professional tourism/travel UI localizer for "Trip and Tick", a Cappadocia (Turkey) travel agency (hot-air balloon tours, hotels, activities, tours, transfers, packages).
Translate JSON VALUES from English into ${lang}. STRICT rules:
- Return ONLY valid JSON. EXACT same keys, structure, nesting, array order/length. Never add/remove/reorder keys.
- Translate every string value naturally for ${lang} travel customers (booking.com tone: trustworthy, concise).
- NEVER translate or alter text inside curly braces: {name}, {count}, {status}, {price}, {date} etc. — keep tokens verbatim.
- Do NOT translate: brand "Trip and Tick", proper nouns (Cappadocia, Goreme, Nevsehir, Uchisar, Urgup, TURSAB, KVKK, GDPR), prices, currency (€, EUR, $), numbers, units, email/URLs, ISO codes.
- Keep HTML-ish entities, %s, and placeholders intact. No markdown, no comments, no prose — JSON only.`;
}

// Recursive: kucuk dugum direkt cevrilir; buyuk obje alt-anahtarlara bolunur.
async function translateNode(node: unknown, lang: string): Promise<unknown> {
  if (node === null || typeof node !== "object") return node;
  const json = JSON.stringify(node);
  if (json.length <= CHUNK_LIMIT) {
    return await translateJson(node, system(LOCALE_NAME[lang] ?? lang), LOCALE_NAME[lang] ?? lang);
  }
  if (Array.isArray(node)) {
    const out: unknown[] = [];
    for (const item of node) out.push(await translateNode(item, lang));
    return out;
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    out[k] = await translateNode(v, lang);
  }
  return out;
}

async function run() {
  const args = process.argv.slice(2);
  const targets = args.length ? args : [...ALL];
  const enDict = (DICTIONARIES as Record<string, unknown>).en;
  const enUi = (UI_TEXT as Record<string, unknown>).en;

  for (const loc of targets) {
    console.log(`\n=== ${loc} (${LOCALE_NAME[loc] ?? loc}) ===`);
    console.log("  dict...");
    const dict = await translateNode(enDict, loc);
    fs.writeFileSync(path.join(OUT_DIR, `dict.${loc}.json`), JSON.stringify(dict, null, 2), "utf8");
    console.log("  uitext...");
    const ui = await translateNode(enUi, loc);
    fs.writeFileSync(path.join(OUT_DIR, `uitext.${loc}.json`), JSON.stringify(ui, null, 2), "utf8");
    console.log(`  OK -> dict.${loc}.json + uitext.${loc}.json`);
  }
  console.log("\nDONE");
}

run().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
