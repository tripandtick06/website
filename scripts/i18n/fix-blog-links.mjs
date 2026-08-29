/**
 * Blog internal-link locale fixer.
 *
 * Problem: public/blog/<locale>-*.json article content contains internal
 * markdown links written with TR/default paths and no locale prefix
 * (e.g. `/aktiviteler`, `/paketler`, `/balonlar/standart-balon-ucusu`).
 * For a reader on /<locale>/blog/... these either 404 or silently land on
 * the TR site — wrong locale for that reader.
 *
 * Fix: for every public/blog/<locale>-*.json where locale != "tr", rewrite
 * root-relative markdown-link hrefs in `content` to the correct localized
 * form: `/<locale>` + translated top segment (per SEGMENT_MAP below) +
 * untouched remainder (dynamic slug — tour/activity/balloon-package slugs
 * are NOT localized, verified against the already-correct reference files
 * en-kapadokya-balon-turu-guvenli-mi.json / en-3-gunluk-kapadokya-gezi-plani.json).
 *
 * `/blog/<slug>` links are special-cased: only a locale prefix is added,
 * the slug itself is left untouched. Blog slugs ARE per-locale (each
 * locale's article carries its own "slug" field), so a /blog/<slug> link
 * embedded in locale X content should in principle point at locale X's own
 * slug for that target article — but resolving "which locale-X article is
 * this TR slug the same article as" is a separate, higher-risk content-
 * mapping problem, not a link-locale bug. Rewriting only the prefix here is
 * deliberately conservative: it turns a 404/wrong-site link into a same-locale
 * link that at minimum keeps the reader in their own locale.
 *
 * TOP_SEGMENT_MAP mirrors the object-valued (translated) entries of
 * `pathnames` in src/i18n/routing.ts (also consumed by src/lib/hreflang.ts
 * SEGMENT_MAP). If routing.ts adds/changes a localized top segment, update
 * this map too — it is a static mirror, not a live import (routing.ts is
 * TypeScript with next-intl types; keeping this as plain data avoids a
 * TS-transpile dependency for a one-off content-fixer script).
 *
 * SHARED_SEGMENTS lists routes that are NOT translated (identical path
 * across all locales in routing.ts, declared as plain strings) but still
 * need a locale prefix for non-tr locales under localePrefix: "as-needed".
 *
 * Any first segment not in either map (e.g. /images/..., /_next/...) is
 * left completely untouched — it isn't a locale-aware app route.
 *
 * Usage: node scripts/i18n/fix-blog-links.mjs [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_BLOG = path.resolve(__dirname, "../../public/blog");
const DRY_RUN = process.argv.includes("--dry-run");

// Mirrors src/i18n/routing.ts `pathnames` object-valued (translated) entries.
const TOP_SEGMENT_MAP = {
  "/balonlar": {
    en: "/balloon-tours", de: "/heissluftballonfahrten", fr: "/vols-montgolfiere",
    es: "/vuelos-en-globo", nl: "/ballonvaarten", zh: "/balloon-tours", hi: "/balloon-tours",
    ur: "/balloon-tours", pt: "/balloon-tours", "pt-BR": "/balloon-tours", ja: "/balloon-tours",
    ko: "/balloon-tours", it: "/balloon-tours", ru: "/balloon-tours", uk: "/balloon-tours", az: "/balloon-tours",
  },
  "/oteller": {
    en: "/hotels", de: "/hotels", fr: "/hotels", es: "/hoteles", nl: "/hotels", zh: "/hotels",
    hi: "/hotels", ur: "/hotels", pt: "/hotels", "pt-BR": "/hotels", ja: "/hotels", ko: "/hotels",
    it: "/hotels", ru: "/hotels", uk: "/hotels", az: "/hotels",
  },
  "/aktiviteler": {
    en: "/activities", de: "/aktivitaeten", fr: "/activites", es: "/actividades", nl: "/activiteiten",
    zh: "/activities", hi: "/activities", ur: "/activities", pt: "/activities", "pt-BR": "/activities",
    ja: "/activities", ko: "/activities", it: "/activities", ru: "/activities", uk: "/activities", az: "/activities",
  },
  "/turlar": {
    en: "/tours", de: "/touren", fr: "/circuits", es: "/tours", nl: "/excursies", zh: "/tours",
    hi: "/tours", ur: "/tours", pt: "/tours", "pt-BR": "/tours", ja: "/tours", ko: "/tours",
    it: "/tours", ru: "/tours", uk: "/tours", az: "/tours",
  },
  "/paketler": {
    en: "/packages", de: "/pakete", fr: "/forfaits", es: "/paquetes", nl: "/pakketten", zh: "/packages",
    hi: "/packages", ur: "/packages", pt: "/packages", "pt-BR": "/packages", ja: "/packages",
    ko: "/packages", it: "/packages", ru: "/packages", uk: "/packages", az: "/packages",
  },
  "/transferler": {
    en: "/transfers", de: "/transfers", fr: "/transferts", es: "/traslados", nl: "/transfers",
    zh: "/transfers", hi: "/transfers", ur: "/transfers", pt: "/transfers", "pt-BR": "/transfers",
    ja: "/transfers", ko: "/transfers", it: "/transfers", ru: "/transfers", uk: "/transfers", az: "/transfers",
  },
  "/kapadokya": {
    en: "/cappadocia", de: "/kappadokien", fr: "/cappadoce", es: "/capadocia", nl: "/cappadocie",
    zh: "/cappadocia", hi: "/cappadocia", ur: "/cappadocia", pt: "/cappadocia", "pt-BR": "/cappadocia",
    ja: "/cappadocia", ko: "/cappadocia", it: "/cappadocia", ru: "/cappadocia", uk: "/cappadocia", az: "/cappadocia",
  },
  "/operatorler": {
    en: "/operators", de: "/betreiber", fr: "/operateurs", es: "/operadores", nl: "/operators",
    zh: "/operators", hi: "/operators", ur: "/operators", pt: "/operators", "pt-BR": "/operators",
    ja: "/operators", ko: "/operators", it: "/operators", ru: "/operators", uk: "/operators", az: "/operators",
  },
  "/hakkimizda": {
    en: "/about", de: "/ueber-uns", fr: "/a-propos", es: "/sobre-nosotros", nl: "/over-ons", zh: "/about",
    hi: "/about", ur: "/about", pt: "/about", "pt-BR": "/about", ja: "/about", ko: "/about",
    it: "/about", ru: "/about", uk: "/about", az: "/about",
  },
  "/iletisim": {
    en: "/contact", de: "/kontakt", fr: "/contact", es: "/contacto", nl: "/contact", zh: "/contact",
    hi: "/contact", ur: "/contact", pt: "/contact", "pt-BR": "/contact", ja: "/contact", ko: "/contact",
    it: "/contact", ru: "/contact", uk: "/contact", az: "/contact",
  },
  "/sss": {
    en: "/faq", de: "/faq", fr: "/faq", es: "/faq", nl: "/faq", zh: "/faq", hi: "/faq", ur: "/faq",
    pt: "/faq", "pt-BR": "/faq", ja: "/faq", ko: "/faq", it: "/faq", ru: "/faq", uk: "/faq", az: "/faq",
  },
  "/yorum": {
    en: "/reviews", de: "/bewertungen", fr: "/avis", es: "/opiniones", nl: "/beoordelingen", zh: "/reviews",
    hi: "/reviews", ur: "/reviews", pt: "/reviews", "pt-BR": "/reviews", ja: "/reviews", ko: "/reviews",
    it: "/reviews", ru: "/reviews", uk: "/reviews", az: "/reviews",
  },
};

// Shared (untranslated) routes from routing.ts — plain-string pathnames.
// These stay the same segment name across locales but still need the
// `/<locale>` prefix for non-tr locales.
const SHARED_SEGMENTS = new Set([
  "/ara", "/hesabim", "/b2b", "/rezervasyon", "/davet",
  "/cerez-politikasi", "/gizlilik-politikasi", "/gdpr", "/iptal-iade-politikasi",
  "/kullanim-sartlari", "/kvkk", "/impressum", "/yasal", "/offline",
]);

const KNOWN_LOCALES = new Set([
  "tr", "en", "de", "fr", "es", "nl", "zh", "hi", "ur", "pt", "pt-BR", "ja", "ko", "it", "ru", "uk", "az",
]);

const MD_LINK_RE = /\[([^\]]*)\]\((\/[^)\s]+)\)/g;

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Decide the fixed href for one internal link, given the locale of the
 * article it lives in. Returns { href, changed, reason }.
 */
function rewriteHref(href, locale) {
  // Already prefixed with a known locale (correct one or a stray mismatch)
  // — leave untouched either way. Fixing a locale MISMATCH would require
  // knowing the intended target, which is out of scope here; we only flag it.
  for (const loc of KNOWN_LOCALES) {
    const re = new RegExp(`^/${escapeRegex(loc)}(?:/|$)`);
    if (re.test(href)) {
      return { href, changed: false, mismatch: loc !== locale ? loc : null };
    }
  }

  if (href === "/") {
    return { href: `/${locale}`, changed: true };
  }

  if (href === "/blog" || href.startsWith("/blog/")) {
    return { href: `/${locale}${href}`, changed: true };
  }

  const firstSlash = href.indexOf("/", 1);
  const firstSeg = firstSlash === -1 ? href : href.slice(0, firstSlash);
  const rest = firstSlash === -1 ? "" : href.slice(firstSlash);

  if (TOP_SEGMENT_MAP[firstSeg]) {
    const translated = TOP_SEGMENT_MAP[firstSeg][locale] ?? firstSeg;
    return { href: `/${locale}${translated}${rest}`, changed: true };
  }

  if (SHARED_SEGMENTS.has(firstSeg)) {
    return { href: `/${locale}${firstSeg}${rest}`, changed: true };
  }

  // Unknown first segment (static asset, unrelated path, etc.) — don't touch.
  return { href, changed: false, unknown: firstSeg };
}

function processFile(filePath, locale) {
  const raw = fs.readFileSync(filePath, "utf8");
  let article;
  try {
    article = JSON.parse(raw);
  } catch (e) {
    return { error: `JSON parse failed: ${e.message}` };
  }

  if (typeof article.content !== "string") {
    return { rewrites: 0, examples: [], mismatches: [], unknowns: [] };
  }

  let rewrites = 0;
  const examples = [];
  const mismatches = [];
  const unknowns = [];

  const newContent = article.content.replace(MD_LINK_RE, (full, text, href) => {
    const result = rewriteHref(href, locale);
    if (result.mismatch) mismatches.push({ href, mismatch: result.mismatch });
    if (result.unknown) unknowns.push(result.unknown);
    if (!result.changed) return full;
    rewrites++;
    if (examples.length < 3) examples.push({ before: href, after: result.href });
    return `[${text}](${result.href})`;
  });

  if (rewrites > 0 && !DRY_RUN) {
    article.content = newContent;
    fs.writeFileSync(filePath, JSON.stringify(article, null, 2) + "\n", "utf8");
  }

  return { rewrites, examples, mismatches, unknowns };
}

function main() {
  const files = fs
    .readdirSync(PUBLIC_BLOG)
    .filter((f) => f.endsWith(".json"))
    .sort();

  const perLocale = {};
  let totalRewrites = 0;
  let filesChanged = 0;
  const allMismatches = [];
  const allUnknowns = new Set();
  const parseErrors = [];

  for (const file of files) {
    const m = file.match(/^([a-z]{2}(?:-[A-Z]{2})?)-/);
    if (!m) continue;
    const locale = m[1];
    if (locale === "tr") continue; // TR is the default/source locale — untouched

    const filePath = path.join(PUBLIC_BLOG, file);
    const result = processFile(filePath, locale);

    if (result.error) {
      parseErrors.push({ file, error: result.error });
      continue;
    }

    if (result.rewrites > 0) {
      filesChanged++;
      totalRewrites += result.rewrites;
      perLocale[locale] = (perLocale[locale] || 0) + result.rewrites;
      console.log(
        `${DRY_RUN ? "[dry-run] " : ""}${file}: ${result.rewrites} link(s) fixed` +
          (result.examples.length
            ? "\n  " + result.examples.map((e) => `${e.before} -> ${e.after}`).join("\n  ")
            : "")
      );
    }
    for (const m of result.mismatches) allMismatches.push({ file, ...m });
    for (const u of result.unknowns) allUnknowns.add(u);
  }

  console.log("\n=== Summary ===");
  console.log(`Files changed: ${filesChanged}`);
  console.log(`Total link rewrites: ${totalRewrites}`);
  console.log("Rewrites per locale:");
  for (const [loc, count] of Object.entries(perLocale).sort()) {
    console.log(`  ${loc}: ${count}`);
  }
  if (allMismatches.length) {
    console.log(`\nLocale-MISMATCH links found (already prefixed with a DIFFERENT locale — left untouched, needs manual review):`);
    for (const m of allMismatches) console.log(`  ${m.file}: ${m.href} (prefixed /${m.mismatch})`);
  }
  if (allUnknowns.size) {
    console.log(`\nUnrecognized first segments (left untouched, not app routes): ${[...allUnknowns].join(", ")}`);
  }
  if (parseErrors.length) {
    console.log(`\nJSON PARSE ERRORS:`);
    for (const e of parseErrors) console.log(`  ${e.file}: ${e.error}`);
    process.exitCode = 1;
  }
}

main();
