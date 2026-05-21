#!/usr/bin/env node
// Throwaway: assemble subagent _part-<N>.json files into per-locale
// translations/<loc>.json consumed by merge-dictionaries.mjs.
//
// Input  _part-<N>.json shape: { "<loc>": { "<ns>": { "<key>": "<str>" } } }
// Output translations/<loc>.json shape: { "<ns>": { "<key>": "<str>" } } (sorted)
//
// Validates against key-map.json: every (ns,key) must exist in all 8 locales.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, "translations");
const KEYMAP = path.join(__dirname, "key-map.json");
const LOCALES = ["en", "de", "fr", "es", "nl", "zh", "hi", "ur"];

const parts = fs
  .readdirSync(DIR)
  .filter((f) => /^_part-\d+\.json$/.test(f))
  .sort();
if (parts.length === 0) {
  console.error("No _part-*.json files found in translations/");
  process.exit(2);
}

const merged = {};
for (const loc of LOCALES) merged[loc] = {};

for (const file of parts) {
  const data = JSON.parse(fs.readFileSync(path.join(DIR, file), "utf-8"));
  for (const loc of LOCALES) {
    if (!data[loc]) {
      console.warn(`${file}: missing locale ${loc}`);
      continue;
    }
    for (const [ns, keys] of Object.entries(data[loc])) {
      merged[loc][ns] = { ...(merged[loc][ns] || {}), ...keys };
    }
  }
}

// validate against key-map.json
const km = JSON.parse(fs.readFileSync(KEYMAP, "utf-8"));
let errors = 0;
for (const [ns, keys] of Object.entries(km)) {
  const trKeys = Object.keys(keys);
  if (trKeys.length === 0) continue;
  for (const loc of LOCALES) {
    const locNs = merged[loc][ns];
    if (!locNs) {
      console.error(`MISSING ns "${ns}" in ${loc}`);
      errors++;
      continue;
    }
    for (const k of trKeys) {
      if (typeof locNs[k] !== "string" || locNs[k].length === 0) {
        console.error(`MISSING/EMPTY "${ns}.${k}" in ${loc}`);
        errors++;
      }
    }
  }
}

// write sorted per-locale files
for (const loc of LOCALES) {
  const sorted = {};
  for (const ns of Object.keys(merged[loc]).sort()) {
    sorted[ns] = {};
    for (const k of Object.keys(merged[loc][ns]).sort()) {
      sorted[ns][k] = merged[loc][ns][k];
    }
  }
  const out = path.join(DIR, `${loc}.json`);
  fs.writeFileSync(out, JSON.stringify(sorted, null, 2), "utf-8");
  const count = Object.values(sorted).reduce(
    (a, b) => a + Object.keys(b).length,
    0
  );
  console.log(`${loc}.json  ${Object.keys(sorted).length} ns  ${count} keys`);
}

if (errors > 0) {
  console.error(`\n${errors} validation error(s) — fix before merge.`);
  process.exit(1);
}
console.log("\nAll 8 locales complete, parity OK.");
