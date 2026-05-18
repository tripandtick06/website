#!/usr/bin/env node
// Phase 1.2 — deterministic namespace+leaf key proposer.
// Input: scripts/i18n/extracted/*.json
// Output:
//   scripts/i18n/key-map.json       — { ns: { key: { tr, context, occurrences[] } } }
//   scripts/i18n/key-map.review.csv — namespace,key,context,tr for manual review
//
// Usage:
//   node scripts/i18n/propose-keys.mjs               (process all extracted)
//   node scripts/i18n/propose-keys.mjs --slug app__[locale]__balonlar__page

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXTRACTED_DIR = path.join(__dirname, "extracted");
const OUT_JSON = path.join(__dirname, "key-map.json");
const OUT_CSV = path.join(__dirname, "key-map.review.csv");

const TR_MAP = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
  â: "a",
  î: "i",
  û: "u",
};
const STOPWORDS = new Set([
  "ve",
  "ile",
  "icin",
  "için",
  "bir",
  "bu",
  "su",
  "de",
  "da",
  "mi",
  "mu",
  "ne",
  "ya",
  "veya",
  "ki",
  "dan",
  "den",
  "in",
  "the",
  "a",
  "and",
  "or",
  "of",
  "to",
  "for",
  "with",
  "on",
  "at",
  "by",
  "from",
]);

function transliterate(s) {
  return s
    .split("")
    .map((ch) => TR_MAP[ch] ?? ch)
    .join("");
}

function slugWords(s) {
  return transliterate(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w && w.length > 1 && !STOPWORDS.has(w));
}

function leafFromContent(tr, maxWords = 4, maxLen = 30) {
  const words = slugWords(tr).slice(0, maxWords);
  let s = words.join("_");
  if (s.length > maxLen) s = s.slice(0, maxLen).replace(/_[^_]*$/, "");
  if (!s) s = "x";
  return s;
}

function pathToNamespace(filepath) {
  const p = filepath.replace(/\\/g, "/");
  if (p.startsWith("src/app/[locale]/")) {
    const rest = p
      .replace("src/app/[locale]/", "")
      .replace(/\/page\.tsx$/, "")
      .replace(/\.tsx$/, "");
    if (rest === "" || rest === "page") return "page.home";
    const segs = rest
      .split("/")
      .filter((s) => s && s !== "page")
      .map((s) => s.replace(/\[(.+?)\]/g, "$1"))
      .map((s) => slugWords(s).join("_") || s.toLowerCase().replace(/[^a-z0-9]+/g, "_"));
    return ["page", ...segs].join(".");
  }
  if (p.startsWith("src/components/")) {
    const rest = p.replace("src/components/", "").replace(/\.tsx$/, "");
    const segs = rest.split("/").map((s, i, arr) => {
      if (i === arr.length - 1) {
        return s
          .replace(/([A-Z])/g, "_$1")
          .toLowerCase()
          .replace(/^_/, "")
          .replace(/_section$/, "")
          .replace(/_widget$/, "");
      }
      return s.toLowerCase();
    });
    return ["component", ...segs].join(".");
  }
  return p
    .replace(/^src\//, "")
    .replace(/\.tsx?$/, "")
    .replace(/[\\/]/g, ".")
    .replace(/\[(.+?)\]/g, "$1")
    .toLowerCase();
}

function keyForString(s) {
  if (s.type === "metadata.title") return "meta_title";
  if (s.type === "metadata.description") return "meta_desc";
  if (s.type === "metadata.alt") return "meta_og_alt";
  if (s.type === "metadata.siteName") return "meta_site_name";
  if (s.type?.startsWith("jsxAttr:") || s.type?.startsWith("jsxAttrExpr:")) {
    const attr = s.type.split(":")[1];
    const ctxComp = (s.context || "").split("@")[0];
    const compSlug = ctxComp ? slugWords(ctxComp).join("_") : "";
    const attrSlug = slugWords(attr).join("_");
    const contentHint = leafFromContent(s.tr, 2, 16);
    return [compSlug, attrSlug, contentHint].filter(Boolean).join("_").slice(0, 40);
  }
  return leafFromContent(s.tr, 5, 32);
}

function uniqKey(base, used) {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  let i = 2;
  while (used.has(`${base}_${i}`)) i++;
  const next = `${base}_${i}`;
  used.add(next);
  return next;
}

function csvEscape(s) {
  if (typeof s !== "string") return "";
  if (s.includes(",") || s.includes('"') || s.includes("\n"))
    return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

const args = process.argv.slice(2);
const slugFilter = args.includes("--slug") ? args[args.indexOf("--slug") + 1] : null;

if (!fs.existsSync(EXTRACTED_DIR)) {
  console.error(`No extracted dir: ${EXTRACTED_DIR}`);
  process.exit(2);
}

const files = fs
  .readdirSync(EXTRACTED_DIR)
  .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
  .filter((f) => !slugFilter || f.startsWith(slugFilter));

const keyMap = {};

for (const f of files) {
  const filepath = path.join(EXTRACTED_DIR, f);
  const data = JSON.parse(fs.readFileSync(filepath, "utf-8"));
  const ns = pathToNamespace(data.file);
  if (!keyMap[ns]) keyMap[ns] = {};
  const usedKeys = new Set(Object.keys(keyMap[ns]));
  const trToKey = new Map();
  for (const [k, v] of Object.entries(keyMap[ns])) trToKey.set(v.tr, k);

  for (let i = 0; i < data.strings.length; i++) {
    const s = data.strings[i];
    let key = trToKey.get(s.tr);
    if (!key) {
      const baseKey = keyForString(s) || `s${i + 1}`;
      key = uniqKey(baseKey, usedKeys);
      trToKey.set(s.tr, key);
      keyMap[ns][key] = {
        tr: s.tr,
        context: s.context,
        type: s.type,
        occurrences: [],
      };
    }
    keyMap[ns][key].occurrences.push({
      slug: f.replace(/\.json$/, ""),
      index: i,
      type: s.type,
      line: s.line,
      col: s.col,
    });
  }
}

const sortedKeyMap = {};
const csvLines = ["namespace,key,context,tr"];
for (const ns of Object.keys(keyMap).sort()) {
  sortedKeyMap[ns] = {};
  for (const k of Object.keys(keyMap[ns]).sort()) {
    sortedKeyMap[ns][k] = keyMap[ns][k];
    csvLines.push(
      [
        csvEscape(ns),
        csvEscape(k),
        csvEscape(keyMap[ns][k].context),
        csvEscape(keyMap[ns][k].tr),
      ].join(",")
    );
  }
}

fs.writeFileSync(OUT_JSON, JSON.stringify(sortedKeyMap, null, 2), "utf-8");
fs.writeFileSync(OUT_CSV, csvLines.join("\n"), "utf-8");

const totalKeys = Object.values(sortedKeyMap).reduce(
  (a, b) => a + Object.keys(b).length,
  0
);
const totalOccurrences = Object.values(sortedKeyMap)
  .flatMap((nsObj) => Object.values(nsObj))
  .reduce((a, b) => a + b.occurrences.length, 0);

console.log(`Namespaces: ${Object.keys(sortedKeyMap).length}`);
console.log(`Unique keys: ${totalKeys}`);
console.log(
  `Occurrences (dedupe ratio): ${totalOccurrences} -> ${totalKeys} (${((totalKeys / totalOccurrences) * 100).toFixed(0)}%)`
);
console.log(`Output: ${path.relative(process.cwd(), OUT_JSON)}`);
console.log(`Review CSV: ${path.relative(process.cwd(), OUT_CSV)}`);
