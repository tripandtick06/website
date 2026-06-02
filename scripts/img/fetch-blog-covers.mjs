/**
 * Her blog konusuna Pexels kapak fotosu ceker (public/images/blog/<topic>.jpg)
 * ve o konunun TUM dil versiyonlarinin coverImage'ini ayarlar.
 * Calistir: PEXELS_API_KEY=... node scripts/img/fetch-blog-covers.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const BLOG = path.join(REPO, "public/blog");
const IMGDIR = path.join(REPO, "public/images/blog");
const LOCALES = ["tr", "en", "de", "fr", "es", "nl", "zh", "hi", "ur"];

function loadKey() {
  if (process.env.PEXELS_API_KEY) return process.env.PEXELS_API_KEY.trim();
  for (const p of [path.join(REPO, ".env.local"), path.resolve(REPO, "..", "github key.txt")]) {
    if (fs.existsSync(p)) {
      const m = fs.readFileSync(p, "utf8").match(/PEXELS_API_KEY\s*[=:]\s*(\S+)/);
      if (m) return m[1].trim();
    }
  }
  throw new Error("PEXELS_API_KEY not found");
}

function topicOf(slug) {
  return slug.replace(new RegExp(`-(${LOCALES.join("|")})$`), "");
}

function queryFor(topic) {
  const t = topic.toLowerCase();
  const base = "Cappadocia Turkey";
  if (t.includes("dugun") || t.includes("wedding")) return `${base} wedding couple balloons`;
  if (t.includes("fiyat") || t.includes("preise") || t.includes("price")) return `hot air balloon ${base} sunrise`;
  if (t.includes("aktivite") || t.includes("activit")) return `${base} ATV valley adventure`;
  if (t.includes("fotograf") || t.includes("photo")) return `${base} balloons sunrise viewpoint photography`;
  if (t.includes("istanbul") || t.includes("nasil-gidilir")) return `${base} road landscape travel`;
  if (t.includes("ne-zaman") || t.includes("best-time")) return `${base} balloons sunrise seasons`;
  if (t.includes("otel") || t.includes("hotel")) return `${base} cave hotel`;
  if (t.includes("winter") || t.includes("kis")) return `${base} winter snow fairy chimneys`;
  return `${base} balloons fairy chimneys`;
}

const queryCache = new Map();
const queryCount = new Map();
async function pickPhoto(query, key) {
  let urls = queryCache.get(query);
  if (!urls) {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=15`;
    const res = await fetch(url, { headers: { Authorization: key } });
    if (!res.ok) throw new Error(`Pexels ${res.status}`);
    const d = await res.json();
    urls = (d.photos ?? []).map((p) => p.src.large2x || p.src.large);
    queryCache.set(query, urls);
  }
  if (!urls.length) return null;
  const i = queryCount.get(query) ?? 0;
  queryCount.set(query, i + 1);
  return urls[i % urls.length];
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`dl ${res.status}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  const key = loadKey();
  const files = fs.readdirSync(BLOG).filter((f) => f.endsWith(".json"));
  const topics = [...new Set(files.map((f) => topicOf(JSON.parse(fs.readFileSync(path.join(BLOG, f), "utf8")).slug)))];

  const coverByTopic = {};
  for (const topic of topics) {
    const dest = path.join(IMGDIR, `${topic}.jpg`);
    const rel = `/images/blog/${topic}.jpg`;
    coverByTopic[topic] = rel;
    if (fs.existsSync(dest)) { console.log(`  exists: ${topic}.jpg`); continue; }
    try {
      const url = await pickPhoto(queryFor(topic), key);
      if (!url) { console.log(`  no result: ${topic}`); continue; }
      await download(url, dest);
      console.log(`  saved: blog/${topic}.jpg`);
      await new Promise((r) => setTimeout(r, 350));
    } catch (e) { console.log(`  FAIL ${topic}: ${e.message}`); }
  }

  let patched = 0;
  for (const f of files) {
    const p = path.join(BLOG, f);
    const a = JSON.parse(fs.readFileSync(p, "utf8"));
    const topic = topicOf(a.slug);
    const rel = coverByTopic[topic];
    if (rel && fs.existsSync(path.join(IMGDIR, `${topic}.jpg`)) && a.coverImage !== rel) {
      a.coverImage = rel;
      fs.writeFileSync(p, JSON.stringify(a, null, 2), "utf8");
      patched++;
    }
  }
  console.log(`\nDONE: ${topics.length} topics, coverImage set on ${patched} files`);
}

main().catch((e) => { console.error("FAILED:", e); process.exit(1); });
