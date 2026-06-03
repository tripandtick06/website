// Yeni dil dict'lerinden SADECE meta_* alanlarini ayiklar (yapiyi koruyarak).
// Cikti: src/data/i18n/meta.<locale>.json (~8KB/dil) — Worker'a bundle edilir.
// serverDict bunlari EN-alias'a merge eder -> edge'de cevrili metadata (fs YOK, paid YOK).
// Calistir: node scripts/i18n/gen-meta-overrides.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(__dirname, "../../public/i18n");
const OUT = path.resolve(__dirname, "../../src/data/i18n");
const LOCALES = ["pt", "pt-BR", "ja", "ko", "it", "ru", "uk", "az"];

// Sadece "meta" ile baslayan key'leri tutan, yapiyi koruyan filtre.
function pick(obj) {
  if (Array.isArray(obj)) return undefined;
  if (!obj || typeof obj !== "object") return undefined;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string" || typeof v === "number") {
      if (k.startsWith("meta")) out[k] = v;
    } else if (v && typeof v === "object") {
      const sub = pick(v);
      if (sub && Object.keys(sub).length) out[k] = sub;
    }
  }
  return out;
}

for (const loc of LOCALES) {
  const src = JSON.parse(fs.readFileSync(path.join(PUBLIC, `dict.${loc}.json`), "utf8"));
  const meta = pick(src) ?? {};
  const file = path.join(OUT, `meta.${loc}.json`);
  fs.writeFileSync(file, JSON.stringify(meta, null, 2), "utf8");
  const kb = Math.round(fs.statSync(file).size / 1024);
  console.log(`meta.${loc}.json ~${kb}KB`);
}
console.log("DONE");
