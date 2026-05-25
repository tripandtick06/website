#!/usr/bin/env node
/**
 * gen-sitemap-image.cjs — TripAndTick.com image sitemap generator.
 *
 * Image SEO icin Google Image Search'e sayfa->image eslesmesi verir.
 * Output: public/sitemap-image.xml (Google sitemaps.org/schemas/sitemap-image/1.1)
 *
 * Kaynaklar:
 *   - src/data/services/balloons.ts  (BALLOON_PACKAGES[].images[])
 *   - src/data/services/catalog.ts   (HOTELS[].photoUrl, ACTIVITIES/TOURS isim->slug)
 *   - src/data/blog/*.json           (slug + title -> default OG image)
 *   - public/images/                 (filesystem scan, fallback)
 *
 * Kullanim:
 *   node scripts/gen-sitemap-image.cjs
 *
 * Postbuild hook onerisi (package.json):
 *   "postbuild": "node scripts/indexnow-postbuild.cjs && node scripts/gen-sitemap-image.cjs"
 *
 * Ortam:
 *   NEXT_PUBLIC_SITE_URL   default: https://www.tripandtick.com
 *
 * NOT: balloons.ts iceriksel olarak '/images/balloons/standart-1.jpg' vb.
 *      gosterir ama filesystem'de sadece '/images/balloons/{slug}.svg' var.
 *      Bu script icin balon paket image-URL'ini su sirayla cozer:
 *        1) data string'i (eger filesystem'de mevcutsa)
 *        2) /images/balloons/{baseSlug}.svg fallback (slug'tan -ucusu vb. cikar)
 *        3) /images/og-default.svg fallback
 */

"use strict";

const fs = require("fs");
const path = require("path");

// ---------------- Config ----------------

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.tripandtick.com").replace(/\/+$/, "");
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const OUT_FILE = path.join(PUBLIC_DIR, "sitemap-image.xml");

const DEFAULT_LICENSE = `${SITE_URL}/kullanim-sartlari`;

// ---------------- Helpers ----------------

/**
 * SVG/png/jpg/webp/avif dosyasi filesystem'de varsa public-relative path doner,
 * yoksa null.
 */
function existsInPublic(rel) {
  if (!rel) return null;
  const norm = rel.startsWith("/") ? rel : "/" + rel;
  const abs = path.join(PUBLIC_DIR, norm.replace(/^\//, ""));
  return fs.existsSync(abs) ? norm : null;
}

/** Balon paket slug -> base slug (standart-balon-ucusu -> standart). */
function balloonBaseSlug(slug) {
  return slug
    .replace(/-balon-ucusu$/, "")
    .replace(/-ozel-balon$/, "")
    .replace(/-balon$/, "")
    .replace(/-ucusu$/, "")
    .replace(/^romantik-/, "romantic-")
    .replace(/^romantik$/, "romantic")
    .replace(/^konfor-/, "konfor-");
}

/** Filesystem'de paket icin gercek SVG/raster dosyasi var mi kontrol et. */
function resolveBalloonImage(packSlug, declaredImage) {
  const direct = existsInPublic(declaredImage);
  if (direct) return direct;
  const base = balloonBaseSlug(packSlug);
  const candidates = [
    `/images/balloons/${base}.svg`,
    `/images/balloons/${base}.png`,
    `/images/balloons/${base}.jpg`,
    `/images/balloons/${base}.webp`,
    `/images/balloons/${base}.avif`,
  ];
  for (const c of candidates) {
    const found = existsInPublic(c);
    if (found) return found;
  }
  return existsInPublic("/images/og-default.svg") || existsInPublic("/images/og-default.jpg") || null;
}

/** TS source'tan basit array-of-objects okuyucu — eval YOK, regex. */
function loadBalloonPackages() {
  const file = path.join(ROOT, "src/data/services/balloons.ts");
  const src = fs.readFileSync(file, "utf8");
  const out = [];
  const re =
    /{\s*slug:\s*"([^"]+)",[\s\S]*?name:\s*"([^"]+)",[\s\S]*?shortDescription:\s*"([^"]+)"[\s\S]*?images:\s*\[([^\]]*)\][\s\S]*?},/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const slug = m[1];
    const name = m[2];
    const shortDesc = m[3];
    const imagesRaw = m[4]
      .split(",")
      .map((s) => s.trim().replace(/^"|"$/g, ""))
      .filter(Boolean);
    out.push({ slug, name, shortDescription: shortDesc, images: imagesRaw });
  }
  return out;
}

/** TS source'tan HOTELS (category:"hotel") satirlarini okur. */
function loadHotels() {
  const file = path.join(ROOT, "src/data/services/catalog.ts");
  const src = fs.readFileSync(file, "utf8");
  const out = [];
  // Tek-satir hotel literali yakala: slug, category:"hotel", name, shortDescription, opsiyonel photoUrl + region.
  const re =
    /{\s*slug:\s*"([^"]+)",\s*category:\s*"hotel",\s*name:\s*"([^"]+)",\s*shortDescription:\s*"([^"]+)"[^}]*?(?:photoUrl:\s*"([^"]*)")?[^}]*?(?:region:\s*"([^"]*)")?[^}]*?}/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    out.push({
      slug: m[1],
      name: m[2],
      shortDescription: m[3],
      photoUrl: m[4] || null,
      region: m[5] || null,
    });
  }
  return out;
}

/** TS source'tan ACTIVITIES + TOURS + PACKAGES + TRANSFERS okur. */
function loadCatalogItems(exportName) {
  const file = path.join(ROOT, "src/data/services/catalog.ts");
  const src = fs.readFileSync(file, "utf8");
  const blockRe = new RegExp(`export const ${exportName}: ServiceItem\\[\\] = \\[([\\s\\S]*?)\\];`, "m");
  const block = src.match(blockRe);
  if (!block) return [];
  const out = [];
  const re =
    /{\s*slug:\s*"([^"]+)",[\s\S]*?name:\s*"([^"]+)",\s*shortDescription:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(block[1])) !== null) {
    out.push({ slug: m[1], name: m[2], shortDescription: m[3] });
  }
  return out;
}

/** OPERATORS — id + name + tagline. */
function loadOperators() {
  const file = path.join(ROOT, "src/data/services/operators.ts");
  const src = fs.readFileSync(file, "utf8");
  const out = [];
  const re = /{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",[\s\S]*?(?:tagline:\s*"([^"]*)")?/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    out.push({ id: m[1], name: m[2], tagline: m[3] || "" });
  }
  return out;
}

/** Tum blog JSON dosyalarini yukler. */
function loadBlogArticles() {
  const dir = path.join(ROOT, "src/data/blog");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}

/** Page URL builder — TR canonical (sitemap.ts ile uyumlu). */
function pageUrl(p) {
  return `${SITE_URL}/tr${p === "/" ? "" : p}`;
}

/** Image URL builder — public-relative path. */
function imgUrl(p) {
  if (!p) return null;
  if (p.startsWith("http")) return p;
  return `${SITE_URL}${p.startsWith("/") ? p : "/" + p}`;
}

/** XML escape. */
function xmlEsc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Mevcut adaylardan ilk filesystem-hit'i bulur. */
function firstExisting(candidates) {
  for (const c of candidates) {
    const found = existsInPublic(c);
    if (found) return found;
  }
  return null;
}

// ---------------- Build mappings ----------------

function buildPageImageMap() {
  const map = new Map();

  function add(pageHref, image) {
    if (!image || !image.url) return;
    const k = pageUrl(pageHref);
    if (!map.has(k)) map.set(k, []);
    const arr = map.get(k);
    if (!arr.some((x) => x.url === image.url)) arr.push(image);
  }

  // ---- Balon paketleri ----
  const balloons = loadBalloonPackages();
  for (const pkg of balloons) {
    let used = false;
    for (const declared of pkg.images) {
      const resolved = resolveBalloonImage(pkg.slug, declared);
      if (resolved) {
        add(`/balonlar/${pkg.slug}`, {
          url: imgUrl(resolved),
          caption: `${pkg.name} - Kapadokya sicak hava balon turu - ${pkg.shortDescription}`,
          title: `${pkg.name} | Kapadokya balon turu`,
        });
        used = true;
      }
    }
    if (!used) {
      const fallback = resolveBalloonImage(pkg.slug, null);
      if (fallback) {
        add(`/balonlar/${pkg.slug}`, {
          url: imgUrl(fallback),
          caption: `${pkg.name} - Kapadokya sicak hava balon turu - ${pkg.shortDescription}`,
          title: `${pkg.name} | Kapadokya balon turu`,
        });
      }
    }
    // /balonlar listing
    const listingImg = resolveBalloonImage(pkg.slug, null);
    if (listingImg) {
      add("/balonlar", {
        url: imgUrl(listingImg),
        caption: `${pkg.name} - Kapadokya balon paketi`,
        title: pkg.name,
      });
    }
  }

  // ---- Hotels ----
  const hotels = loadHotels();
  for (const h of hotels) {
    const photo = firstExisting([
      h.photoUrl,
      `/images/hotels/${h.slug}.jpg`,
      `/images/hotels/${h.slug}.webp`,
      `/images/hotels/${h.slug}.png`,
      "/images/og-default.svg",
    ]);
    if (!photo) continue;
    add(`/oteller/${h.slug}`, {
      url: imgUrl(photo),
      caption: `${h.name}${h.region ? ` - ${h.region}` : ""} - ${h.shortDescription}`,
      title: `${h.name} | Kapadokya konaklama`,
    });
    add("/oteller", {
      url: imgUrl(photo),
      caption: `${h.name} - Kapadokya ${h.region || "konaklama"}`,
      title: h.name,
    });
  }

  // ---- Activities / Tours / Packages / Transfers ----
  const sections = [
    { exportName: "ACTIVITIES", baseHref: "/aktiviteler", folder: "activities", suffix: "Kapadokya aktivite" },
    { exportName: "TOURS", baseHref: "/turlar", folder: "tours", suffix: "Kapadokya gezi turu" },
    { exportName: "PACKAGES", baseHref: "/paketler", folder: "packages", suffix: "Kapadokya paketi" },
    { exportName: "TRANSFERS", baseHref: "/transferler", folder: "services", suffix: "Kapadokya transfer" },
  ];
  for (const { exportName, baseHref, folder, suffix } of sections) {
    const items = loadCatalogItems(exportName);
    for (const item of items) {
      const finalImg = firstExisting([
        `/images/${folder}/${item.slug}.jpg`,
        `/images/${folder}/${item.slug}.webp`,
        `/images/${folder}/${item.slug}.svg`,
        `/images/${folder}/${item.slug}.png`,
        "/images/og-default.svg",
      ]);
      if (!finalImg) continue;
      add(`${baseHref}/${item.slug}`, {
        url: imgUrl(finalImg),
        caption: `${item.name} - ${item.shortDescription}`,
        title: `${item.name} | ${suffix}`,
      });
      add(baseHref, {
        url: imgUrl(finalImg),
        caption: `${item.name} - Kapadokya`,
        title: item.name,
      });
    }
  }

  // ---- Operators ----
  const operators = loadOperators();
  for (const op of operators) {
    const finalImg = firstExisting([
      `/images/operators/${op.id}.jpg`,
      `/images/operators/${op.id}.webp`,
      `/images/operators/${op.id}.png`,
      "/images/og-default.svg",
    ]);
    if (!finalImg) continue;
    add(`/operatorler/${op.id}`, {
      url: imgUrl(finalImg),
      caption: `${op.name} - ${op.tagline || "Kapadokya balon operatoru"}`,
      title: `${op.name} | Kapadokya balon operatoru`,
    });
  }

  // ---- Blog ----
  const articles = loadBlogArticles();
  for (const art of articles) {
    const slug = art.slug;
    const finalImg = firstExisting([
      `/images/blog/${slug}.jpg`,
      `/images/blog/${slug}.webp`,
      `/images/blog/${slug}.svg`,
      `/images/og-${slug}.jpg`,
      "/images/og-default.svg",
    ]);
    if (!finalImg) continue;
    add(`/blog/${slug}`, {
      url: imgUrl(finalImg),
      caption: art.excerpt || art.metaDescription || art.title,
      title: art.title,
    });
  }

  // ---- Homepage ----
  const og = firstExisting(["/images/og-default.svg", "/og-default.svg"]);
  if (og) {
    add("/", {
      url: imgUrl(og),
      caption: "Trip and Tick - Kapadokya balon turu, otel, transfer ve gezi rezervasyonu",
      title: "Trip and Tick - Kapadokya online seyahat acentasi",
    });
  }

  return map;
}

// ---------------- XML render ----------------

function renderSitemapXml(pageImageMap) {
  const urls = [];
  for (const [pageUrlStr, images] of pageImageMap.entries()) {
    if (!images.length) continue;
    const imageNodes = images
      .map(
        (img) => `
    <image:image>
      <image:loc>${xmlEsc(img.url)}</image:loc>
      <image:caption>${xmlEsc(img.caption)}</image:caption>
      <image:title>${xmlEsc(img.title)}</image:title>
      <image:license>${xmlEsc(DEFAULT_LICENSE)}</image:license>
    </image:image>`
      )
      .join("");
    urls.push(`  <url>
    <loc>${xmlEsc(pageUrlStr)}</loc>${imageNodes}
  </url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join("\n")}
</urlset>
`;
}

// ---------------- Main ----------------

function main() {
  try {
    const map = buildPageImageMap();
    const xml = renderSitemapXml(map);
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, xml, "utf8");
    const totalImages = Array.from(map.values()).reduce((n, arr) => n + arr.length, 0);
    console.log(`[gen-sitemap-image] wrote ${OUT_FILE}`);
    console.log(`[gen-sitemap-image] ${map.size} pages, ${totalImages} image entries`);
  } catch (err) {
    console.error("[gen-sitemap-image] ERROR:", err.message);
    process.exit(1);
  }
}

if (require.main === module) main();

module.exports = { buildPageImageMap, renderSitemapXml };
