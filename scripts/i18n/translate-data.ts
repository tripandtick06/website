/**
 * Veri katmani cevirisi — TR urun/FAQ/yorum verisini 8 dile cevirir.
 * Cikti: src/data/i18n/data.<locale>.json (slug/id -> cevrili alanlar).
 * Calistir: npx tsx scripts/i18n/translate-data.ts [locale1 locale2 ...]
 *   (locale verilmezse hepsi: en de fr es nl zh hi ur)
 *
 * Kaynak = TR data dosyalari (source of truth). Overlay localizeData.ts ile.
 * ANTHROPIC_API_KEY env'den (.env.local zaten yuklu).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { translateJson } from "./_openai";
import { BALLOON_PACKAGES } from "../../src/data/services/balloons";
import { ACTIVITIES, TOURS, HOTELS, PACKAGES, TRANSFERS } from "../../src/data/services/catalog";
import { FAQ_ITEMS } from "../../src/data/faq";
import { REVIEWS } from "../../src/data/reviews";

const SERVICES = [...ACTIVITIES, ...TOURS, ...HOTELS, ...PACKAGES, ...TRANSFERS];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../../src/data/i18n");

const ALL_LOCALES = [
  "en", "de", "fr", "es", "nl", "zh", "hi", "ur",
  "pt", "pt-BR", "ja", "ko", "it", "ru", "uk", "az",
] as const;
type Target = (typeof ALL_LOCALES)[number];

const LOCALE_NAME: Record<Target, string> = {
  en: "English", de: "German", fr: "French", es: "Spanish",
  nl: "Dutch", zh: "Simplified Chinese", hi: "Hindi", ur: "Urdu",
  pt: "European Portuguese", "pt-BR": "Brazilian Portuguese", ja: "Japanese",
  ko: "Korean", it: "Italian", ru: "Russian", uk: "Ukrainian", az: "Azerbaijani",
};


function buildSource() {
  const balloons: Record<string, unknown> = {};
  for (const p of BALLOON_PACKAGES) {
    balloons[p.slug] = {
      name: p.name, shortDescription: p.shortDescription, longDescription: p.longDescription,
      badge: p.badge, includes: p.includes, excludes: p.excludes,
      warnings: p.warnings, highlights: p.highlights,
    };
  }
  const services: Record<string, unknown> = {};
  for (const s of SERVICES) {
    services[s.slug] = {
      name: s.name, shortDescription: s.shortDescription,
      ...(s.badge ? { badge: s.badge } : {}),
      includes: s.includes, highlights: s.highlights,
      ...(s.amenities ? { amenities: s.amenities } : {}),
      ...(s.region ? { region: s.region } : {}),
    };
  }
  const faq: Record<string, unknown> = {};
  FAQ_ITEMS.forEach((f, i) => {
    faq[`f${i}`] = { question: f.question, answer: f.answer };
  });
  const reviews: Record<string, unknown> = {};
  for (const r of REVIEWS) {
    reviews[r.id] = { text: r.text, service: r.service };
  }
  return { balloons, services, faq, reviews };
}

const SYSTEM = `You are a professional tourism/travel localizer for a Cappadocia (Turkey) travel agency (hot-air balloon tours, hotels, activities, tours, transfers, packages).
Translate JSON VALUES from Turkish into {LANG}. Rules:
- Return ONLY valid JSON with the EXACT same keys and structure. Never add/remove/reorder keys.
- Translate every string value naturally and idiomatically for {LANG} travel customers. Keep arrays as arrays, same length.
- Do NOT translate: prices, currency symbols (€, EUR), numbers, brand "Trip and Tick", operator/place proper nouns (Cappadocia, Goreme, Nevsehir, TURSAB), units.
- Keep tone trustworthy and concise (booking.com style). No markdown, no comments, no extra text — JSON only.`;

async function translateChunk(obj: Record<string, unknown>, lang: string): Promise<Record<string, unknown>> {
  const out = await translateJson(obj, SYSTEM.replace(/\{LANG\}/g, lang), lang);
  return out as Record<string, unknown>;
}

function chunkObject(obj: Record<string, unknown>, size: number): Record<string, unknown>[] {
  const keys = Object.keys(obj);
  const out: Record<string, unknown>[] = [];
  for (let i = 0; i < keys.length; i += size) {
    const part: Record<string, unknown> = {};
    for (const k of keys.slice(i, i + size)) part[k] = obj[k];
    out.push(part);
  }
  return out;
}

async function translateDomain(obj: Record<string, unknown>, lang: string, chunkSize: number) {
  const merged: Record<string, unknown> = {};
  const chunks = chunkObject(obj, chunkSize);
  for (let i = 0; i < chunks.length; i++) {
    let attempt = 0;
    while (true) {
      try {
        const part = await translateChunk(chunks[i], lang);
        Object.assign(merged, part);
        break;
      } catch (err) {
        attempt++;
        if (attempt >= 3) throw err;
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
    process.stdout.write(".");
  }
  return merged;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const src = buildSource();
  const argv = process.argv.slice(2).filter((a) => (ALL_LOCALES as readonly string[]).includes(a)) as Target[];
  const targets: Target[] = argv.length ? argv : [...ALL_LOCALES];

  for (const loc of targets) {
    const lang = LOCALE_NAME[loc];
    process.stdout.write(`\n[${loc}] ${lang} `);
    const result = {
      balloons: await translateDomain(src.balloons as Record<string, unknown>, lang, 5),
      services: await translateDomain(src.services as Record<string, unknown>, lang, 8),
      faq: await translateDomain(src.faq as Record<string, unknown>, lang, 11),
      reviews: await translateDomain(src.reviews as Record<string, unknown>, lang, 13),
    };
    const file = path.join(OUT_DIR, `data.${loc}.json`);
    fs.writeFileSync(file, JSON.stringify(result, null, 2), "utf8");
    process.stdout.write(` -> ${file}`);
  }
  process.stdout.write("\nDONE\n");
}

main().catch((e) => {
  console.error("\nFAILED:", e);
  process.exit(1);
});
