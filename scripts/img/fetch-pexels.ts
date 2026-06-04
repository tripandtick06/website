/**
 * Eksik urun fotograflarini Pexels'ten (ucretsiz, ticari serbest, atif gerekmez)
 * ceker, public/images/<cat>/<slug>.jpg olarak kaydeder ve data dosyalarina
 * photoUrl ekler.
 * Calistir: PEXELS_API_KEY=... npx tsx scripts/img/fetch-pexels.ts [--force a,b]
 * Key yoksa github key.txt / .env.local'den PEXELS_API_KEY okunur.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BALLOON_PACKAGES } from "../../src/data/services/balloons";
import { ACTIVITIES, TOURS, HOTELS, PACKAGES, TRANSFERS } from "../../src/data/services/catalog";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const IMG = path.join(REPO, "public", "images");

function loadKey(): string {
  if (process.env.PEXELS_API_KEY) return process.env.PEXELS_API_KEY.trim();
  for (const p of [path.join(REPO, ".env.local"), path.resolve(REPO, "..", "github key.txt")]) {
    if (fs.existsSync(p)) {
      const m = fs.readFileSync(p, "utf8").match(/PEXELS_API_KEY\s*[=:]\s*(\S+)/);
      if (m) return m[1].trim();
    }
  }
  throw new Error("PEXELS_API_KEY not found (env / .env.local / ../github key.txt)");
}

function queryFor(slug: string, category: string): string {
  const s = slug.toLowerCase();
  const base = "Cappadocia Turkey";
  if (category === "hotel") {
    if (s.includes("magara")) return `${base} cave hotel room interior`;
    if (s.includes("butik")) return `${base} boutique hotel terrace`;
    if (s.includes("resort") || s.includes("aile")) return `${base} resort hotel pool`;
    if (s.includes("glamping") || s.includes("yurt")) return `${base} glamping tent valley`;
    return `${base} cave hotel`;
  }
  if (category === "balloon") return `hot air balloon ${base} sunrise`;
  if (category === "transfer") {
    // Her transfer tipine ALAKALI + FARKLI arac (ayni arac degil).
    if (s.includes("minibus")) return "Mercedes Sprinter passenger minibus group travel";
    if (s.includes("vip") || s.includes("arac")) return "luxury black car chauffeur service interior";
    if (s.includes("kayseri")) return "black minivan highway road travel";
    if (s.includes("nev") || s.includes("otel")) return "black luxury sedan airport pickup service";
    return "private car airport transfer service";
  }
  if (category === "tour") {
    if (s.includes("kirmizi")) return `${base} Goreme open air museum rock church`;
    if (s.includes("yesil")) return `${base} Ihlara valley green canyon`;
    if (s.includes("yeralti")) return "Derinkuyu underground city tunnel Cappadocia";
    if (s.includes("gun-batimi")) return `${base} red valley sunset`;
    if (s.includes("instagram") || s.includes("foto")) return `${base} balloons sunrise viewpoint`;
    return `${base} fairy chimneys valley`;
  }
  if (category === "activity") {
    if (s.includes("atv")) return `ATV quad bike desert ${base}`;
    if (s.includes("at-") || s.includes("horse")) return `horse riding ${base} valley`;
    if (s.includes("jeep")) return `jeep safari ${base} valley`;
    if (s.includes("hamam")) return "turkish hammam bath marble interior";
    if (s.includes("microlight")) return `microlight ultralight aircraft flying ${base}`;
    if (s.includes("turk-gecesi") || s.includes("gece")) return "turkish folk dance show cave restaurant";
    return `${base} adventure activity`;
  }
  if (category === "package") {
    if (s.includes("balayi") || s.includes("evlilik")) return `${base} honeymoon couple balloons sunrise`;
    if (s.includes("aile")) return `family travel ${base} balloons`;
    return `${base} balloons fairy chimneys panorama`;
  }
  return `${base} travel`;
}

const CAT_DIR: Record<string, string> = {
  balloon: "balloons", activity: "activities", tour: "tours",
  hotel: "hotels", package: "packages", transfer: "transfers",
};

// Sorgu sonuclarini cache'le; ayni sorguyu paylasan urunler FARKLI sonuc alir
// (rotasyon) -> duplikat foto olmaz.
const queryCache = new Map<string, string[]>();
const queryCount = new Map<string, number>();

async function fetchPexels(query: string, key: string): Promise<string | null> {
  let urls = queryCache.get(query);
  if (!urls) {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=15`;
    const res = await fetch(url, { headers: { Authorization: key } });
    if (!res.ok) throw new Error(`Pexels ${res.status} for "${query}"`);
    const data = (await res.json()) as { photos?: { src: { large2x: string; large: string } }[] };
    urls = (data.photos ?? []).map((p) => p.src.large2x || p.src.large);
    queryCache.set(query, urls);
  }
  if (!urls.length) return null;
  const i = queryCount.get(query) ?? 0;
  queryCount.set(query, i + 1);
  return urls[i % urls.length];
}

async function download(url: string, dest: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
}

async function main() {
  const key = loadKey();
  const forceIdx = process.argv.indexOf("--force");
  const force = new Set(
    (forceIdx >= 0 ? (process.argv[forceIdx + 1] || "") : "").split(",").map((x) => x.trim()).filter(Boolean)
  );

  type Item = { slug: string; category: string };
  const items: Item[] = [
    ...BALLOON_PACKAGES.map((p) => ({ slug: p.slug, category: "balloon" })),
    ...ACTIVITIES.map((s) => ({ slug: s.slug, category: s.category })),
    ...TOURS.map((s) => ({ slug: s.slug, category: s.category })),
    ...HOTELS.map((s) => ({ slug: s.slug, category: s.category })),
    ...PACKAGES.map((s) => ({ slug: s.slug, category: s.category })),
    ...TRANSFERS.map((s) => ({ slug: s.slug, category: s.category })),
  ];

  const updated: { slug: string; path: string }[] = [];
  for (const it of items) {
    const dir = CAT_DIR[it.category];
    const dest = path.join(IMG, dir, `${it.slug}.jpg`);
    if (fs.existsSync(dest) && !force.has(it.slug)) continue;
    const q = queryFor(it.slug, it.category);
    try {
      const url = await fetchPexels(q, key);
      if (!url) { console.log(`  no result: ${it.slug} ("${q}")`); continue; }
      await download(url, dest);
      updated.push({ slug: it.slug, path: `/images/${dir}/${it.slug}.jpg` });
      console.log(`  saved: ${dir}/${it.slug}.jpg`);
      await new Promise((r) => setTimeout(r, 400));
    } catch (e) {
      console.log(`  FAIL ${it.slug}: ${(e as Error).message}`);
    }
  }

  patchPhotoUrls(updated);
  console.log(`\nDONE: ${updated.length} images fetched + photoUrl patched.`);
}

function patchPhotoUrls(updated: { slug: string; path: string }[]) {
  const files = [
    path.join(REPO, "src/data/services/balloons.ts"),
    path.join(REPO, "src/data/services/catalog.ts"),
  ];
  for (const file of files) {
    let txt = fs.readFileSync(file, "utf8");
    for (const u of updated) {
      const slugRe = new RegExp(`(slug:\\s*"${u.slug}"[^}]*?)(\\n\\s*\\})`, "s");
      const m = txt.match(slugRe);
      if (m && !m[0].includes("photoUrl")) {
        txt = txt.replace(slugRe, `$1, photoUrl: "${u.path}"$2`);
      }
    }
    fs.writeFileSync(file, txt, "utf8");
  }
}

main().catch((e) => { console.error("FAILED:", e); process.exit(1); });
