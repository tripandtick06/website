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
