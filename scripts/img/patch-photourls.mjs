/**
 * catalog.ts'teki ServiceItem'lara, public/images/<cat>/<slug>.jpg mevcutsa ve
 * photoUrl yoksa photoUrl ekler. Tek-satir obje guvenli ([^{}] ile obje icinde kalir).
 * Calistir: node scripts/img/patch-photourls.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const CATALOG = path.join(REPO, "src/data/services/catalog.ts");
const IMG = path.join(REPO, "public/images");

const CAT_DIR = {
  activity: "activities", tour: "tours", hotel: "hotels",
  package: "packages", transfer: "transfers",
};

let txt = fs.readFileSync(CATALOG, "utf8");
let added = 0;

txt = txt.replace(/\{[^{}]*?\}/g, (obj) => {
  const slugM = obj.match(/slug:\s*"([^"]+)"/);
  const catM = obj.match(/category:\s*"([^"]+)"/);
  if (!slugM || !catM) return obj;
  if (obj.includes("photoUrl")) return obj;
  const dir = CAT_DIR[catM[1]];
  if (!dir) return obj;
  const file = path.join(IMG, dir, `${slugM[1]}.jpg`);
  if (!fs.existsSync(file)) return obj;
  added++;
  return obj.replace(/\s*\}$/, `, photoUrl: "/images/${dir}/${slugM[1]}.jpg" }`);
});

fs.writeFileSync(CATALOG, txt, "utf8");
console.log(`patched photoUrl on ${added} catalog items`);
