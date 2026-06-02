/**
 * Cevrilebilir veri alanlarini tek kanonik kaynak JSON'a cikarir (API YOK).
 * Cikti: src/data/i18n/_source.tr.json — ceviri ajanlari bunu okuyup
 *        data.<locale>.json (ayni anahtarlar, cevrili degerler) uretir.
 * Calistir: npx tsx scripts/i18n/extract-data-source.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BALLOON_PACKAGES } from "../../src/data/services/balloons";
import { ACTIVITIES, TOURS, HOTELS, PACKAGES, TRANSFERS } from "../../src/data/services/catalog";
import { FAQ_ITEMS } from "../../src/data/faq";
import { REVIEWS } from "../../src/data/reviews";

const SERVICES = [...ACTIVITIES, ...TOURS, ...HOTELS, ...PACKAGES, ...TRANSFERS];
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../../src/data/i18n");

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
FAQ_ITEMS.forEach((f, i) => { faq[`f${i}`] = { question: f.question, answer: f.answer }; });
const reviews: Record<string, unknown> = {};
for (const r of REVIEWS) reviews[r.id] = { text: r.text, service: r.service };

fs.mkdirSync(OUT_DIR, { recursive: true });
const out = path.join(OUT_DIR, "_source.tr.json");
fs.writeFileSync(out, JSON.stringify({ balloons, services, faq, reviews }, null, 2), "utf8");
console.log(`wrote ${out}: balloons=${Object.keys(balloons).length} services=${Object.keys(services).length} faq=${Object.keys(faq).length} reviews=${Object.keys(reviews).length}`);
