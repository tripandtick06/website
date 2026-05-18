#!/usr/bin/env node
// Q2 translation gap audit — TR baseline, 8 locale missing/extra keys.
// Usage: node scripts/audit-i18n.cjs

const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "src", "lib", "i18n", "dictionaries.ts");
const txt = fs.readFileSync(file, "utf-8");

const LOCALES = ["tr", "en", "de", "fr", "es", "nl", "zh", "hi", "ur"];

function extractBlock(loc) {
  const start = txt.search(new RegExp(`^  ${loc}: \\{`, "m"));
  if (start < 0) return null;
  let i = start;
  while (txt[i] !== "{") i++;
  let depth = 0;
  let body = "";
  while (i < txt.length) {
    const ch = txt[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return body;
    }
    if (depth > 0) body += ch;
    i++;
  }
  return null;
}

function collectKeys(body) {
  const keys = new Set();
  const lines = body.split("\n");
  const stack = [];
  for (const line of lines) {
    const content = line.trim();
    if (!content || content.startsWith("//")) continue;
    const indent = line.length - line.trimStart().length;
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) stack.pop();

    const groupOpen = content.match(/^([a-zA-Z0-9_$]+):\s*\{$/);
    if (groupOpen) {
      stack.push({ key: groupOpen[1], indent });
      continue;
    }
    const leaf = content.match(/^([a-zA-Z0-9_$]+):\s*[^{]/);
    if (leaf) {
      const p = [...stack.map((s) => s.key), leaf[1]].join(".");
      keys.add(p);
    }
  }
  return keys;
}

const keysByLocale = {};
for (const loc of LOCALES) {
  const b = extractBlock(loc);
  if (b) keysByLocale[loc] = collectKeys(b);
}

console.log("\n=== Q2 Translation Gap Audit ===\n");
const baseKeys = keysByLocale.tr;
if (!baseKeys) {
  console.error("TR baseline block bulunamadi.");
  process.exit(1);
}
console.log(`TR baseline: ${baseKeys.size} leaf key`);

let totalMissing = 0;
let totalExtra = 0;
const lines = [];

for (const loc of LOCALES) {
  if (loc === "tr") continue;
  const keys = keysByLocale[loc];
  if (!keys) {
    lines.push(`${loc.toUpperCase()}: BLOCK BULUNAMADI`);
    continue;
  }
  const missing = [...baseKeys].filter((k) => !keys.has(k)).sort();
  const extra = [...keys].filter((k) => !baseKeys.has(k)).sort();
  totalMissing += missing.length;
  totalExtra += extra.length;
  lines.push(
    `${loc.toUpperCase()}: ${keys.size} key (missing=${missing.length}, extra=${extra.length})` +
      (missing.length ? `\n  -missing: ${missing.slice(0, 20).join(", ")}${missing.length > 20 ? " ..." : ""}` : "") +
      (extra.length ? `\n  +extra:   ${extra.slice(0, 20).join(", ")}${extra.length > 20 ? " ..." : ""}` : "")
  );
}

lines.forEach((r) => console.log(r));
console.log(`\n=== Toplam: ${totalMissing} missing / ${totalExtra} extra (8 locale x ${baseKeys.size} baseline) ===`);
const filled = 8 * baseKeys.size - totalMissing;
const pct = ((filled / (8 * baseKeys.size)) * 100).toFixed(1);
console.log(`Filled: ${filled} / ${8 * baseKeys.size} (${pct}%)`);

// ----------------------------------------------------------------------
// Coverage scan — find hardcoded TR strings in pages/components.
// Lightweight heuristic, no Babel dep. Diacritic-based detection.
// ----------------------------------------------------------------------

const TR_DIACRITICS = /[ğüşıöçĞÜŞİÖÇ]/;
const SCAN_ROOTS = [
  path.join(__dirname, "..", "src", "app", "[locale]"),
  path.join(__dirname, "..", "src", "components"),
];

function walk(dir, out) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.isFile() && (e.name.endsWith(".tsx") || e.name.endsWith(".ts"))) out.push(full);
  }
  return out;
}

function scanFile(filepath) {
  const src = fs.readFileSync(filepath, "utf-8");
  let scanText = src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*import[^;]+;\s*$/gm, "")
    .replace(/^\s*\/\/.*$/gm, "");

  let jsxTextHits = 0;
  const jsxTextRe = />([^<{}>]+)</g;
  let m;
  while ((m = jsxTextRe.exec(scanText))) {
    if (TR_DIACRITICS.test(m[1])) jsxTextHits++;
  }

  let attrHits = 0;
  const attrRe = /\s([a-zA-Z][\w-]*)\s*=\s*"([^"]*)"/g;
  while ((m = attrRe.exec(scanText))) {
    const name = m[1];
    if (/^(className|href|src|id|key|ref|htmlFor|role|type|pattern|autoComplete|dir|lang|rel|target|method|action|encType|style|as|size|variant|color|value|defaultValue|min|max|step|loading|decoding|fetchPriority|crossOrigin|referrerPolicy|sizes|srcSet|data-track|data-event|data-testid|data-key)$/.test(name)) continue;
    if (TR_DIACRITICS.test(m[2])) attrHits++;
  }

  let literalHits = 0;
  const literalRe = /"([^"\\]{4,}[ğüşıöçĞÜŞİÖÇ][^"\\]*)"/g;
  while ((m = literalRe.exec(scanText))) {
    literalHits++;
  }

  const usesNextIntl = /\b(useTranslations|getTranslations)\s*\(/.test(src);
  const usesCustomI18n = /\buseT\s*\(/.test(src);

  return { jsxTextHits, attrHits, literalHits, usesNextIntl, usesCustomI18n };
}

console.log(`\n=== i18n Coverage Scan (hardcoded TR detection) ===\n`);
const allFiles = SCAN_ROOTS.flatMap((root) => walk(root, []));
const rows = [];
let totalHits = 0;
let convertedFiles = 0;
for (const f of allFiles) {
  const r = scanFile(f);
  const totalFileHits = r.jsxTextHits + r.attrHits;
  if (totalFileHits === 0 && !r.usesNextIntl && !r.usesCustomI18n) continue;
  if (r.usesNextIntl) convertedFiles++;
  rows.push({
    file: path.relative(path.join(__dirname, ".."), f).replace(/\\/g, "/"),
    jsxText: r.jsxTextHits,
    attr: r.attrHits,
    literal: r.literalHits,
    intl: r.usesNextIntl ? "next-intl" : r.usesCustomI18n ? "custom" : "-",
  });
  totalHits += totalFileHits;
}

rows.sort((a, b) => b.jsxText + b.attr - (a.jsxText + a.attr));
const topN = rows.filter((r) => r.intl !== "next-intl").slice(0, 30);
console.log(`Files scanned: ${allFiles.length}`);
console.log(`Files using next-intl: ${convertedFiles}`);
console.log(`Files with hardcoded TR (top 30):`);
console.log(`  jsxText  attr  literal  intl       file`);
for (const r of topN) {
  console.log(
    `  ${String(r.jsxText).padStart(7)}  ${String(r.attr).padStart(4)}  ${String(r.literal).padStart(7)}  ${r.intl.padEnd(10)} ${r.file}`
  );
}
console.log(`\nTotal hardcoded TR hits (jsxText + attr): ${totalHits}`);
const remaining = rows.filter((r) => r.intl !== "next-intl");
const totalRemainingHits = remaining.reduce((a, b) => a + b.jsxText + b.attr, 0);
console.log(`Files NOT yet on next-intl: ${remaining.length} (${totalRemainingHits} hits)`);
