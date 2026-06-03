/**
 * Blog cevirisi — EN makaleleri (public/blog/en-*.json) yeni dillere cevirir.
 * Cikti: public/blog/<locale>-<base>.json (slug = <base>-<locale>).
 * Calistir: npx tsx scripts/i18n/translate-blog.ts [locale...]
 *   (locale verilmezse: pt pt-BR ja ko it ru uk az)
 * Cevrilir: title/metaTitle/metaDescription/excerpt/content(markdown)/faq.
 * Korunur: category/tags/targetKeyword/coverImage/publishedAt/seoScore.
 * OpenAI (../github key.txt).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { translateJson } from "./_openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG = path.resolve(__dirname, "../../public/blog");

const ALL = ["pt", "pt-BR", "ja", "ko", "it", "ru", "uk", "az"] as const;
const LOCALE_NAME: Record<string, string> = {
  pt: "European Portuguese", "pt-BR": "Brazilian Portuguese", ja: "Japanese",
  ko: "Korean", it: "Italian", ru: "Russian", uk: "Ukrainian", az: "Azerbaijani",
};

function system(lang: string): string {
  return `You are a professional travel blog localizer for "Trip and Tick", a Cappadocia (Turkey) travel agency.
Translate the JSON values under key "_" from English into ${lang}. STRICT:
- Return ONLY valid JSON, same keys/structure, wrapper key "_" kept.
- Translate naturally for ${lang} readers (SEO-friendly, engaging, trustworthy).
- PRESERVE Markdown formatting EXACTLY in "content": headings (##, ###), bold (**), lists (-), links [text](url) — translate visible text, keep URLs/syntax.
- faq is an array of {question, answer} — translate both, keep array length/order.
- Do NOT translate: brand "Trip and Tick", proper nouns (Cappadocia, Goreme, Nevsehir, Uchisar, Urgup, Istanbul, TURSAB), prices, currency (€, EUR, $), numbers, URLs, email.
- No prose/markdown fences around the JSON — JSON only.`;
}

async function run() {
  const args = process.argv.slice(2);
  const targets = args.length ? args : [...ALL];

  const enFiles = fs.readdirSync(BLOG).filter((f) => f.startsWith("en-") && f.endsWith(".json"));
  console.log(`EN kaynak makale: ${enFiles.length}`);

  for (const loc of targets) {
    const lang = LOCALE_NAME[loc] ?? loc;
    console.log(`\n=== ${loc} (${lang}) ===`);
    for (const file of enFiles) {
      const base = file.replace(/^en-/, "").replace(/\.json$/, "");
      const outFile = `${loc}-${base}.json`;
      if (fs.existsSync(path.join(BLOG, outFile))) {
        console.log(`  skip ${outFile} (var)`);
        continue;
      }
      const src = JSON.parse(fs.readFileSync(path.join(BLOG, file), "utf8"));
      const toTranslate = {
        title: src.title,
        metaTitle: src.metaTitle ?? src.title,
        metaDescription: src.metaDescription ?? "",
        excerpt: src.excerpt ?? "",
        content: src.content ?? "",
        faq: src.faq ?? [],
      };
      const tr = (await translateJson(toTranslate, system(lang), lang)) as typeof toTranslate;
      const enSlug = (src.slug as string).replace(/-en$/, "");
      const out = {
        ...src,
        ...tr,
        slug: `${enSlug}-${loc}`,
        locale: loc,
        isAiGenerated: true,
      };
      fs.writeFileSync(path.join(BLOG, outFile), JSON.stringify(out, null, 2), "utf8");
      console.log(`  OK ${outFile}`);
    }
  }
  console.log("\nDONE");
}

run().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
