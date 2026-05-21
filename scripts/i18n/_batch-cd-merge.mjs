#!/usr/bin/env node
// One-off: inject Batch C/D page keys into key-map.json (tr) +
// translations/<loc>.json (8 targets) so merge-dictionaries.mjs can fold them
// into dictionaries.ts. Source: _batch-cd.json + _batch-cd-translations.json.
// Usage: node scripts/i18n/_batch-cd-merge.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TARGETS = ["en", "de", "fr", "es", "nl", "zh", "hi", "ur"];

const src = JSON.parse(
  fs.readFileSync(path.join(__dirname, "_batch-cd.json"), "utf-8")
);
const trans = JSON.parse(
  fs.readFileSync(path.join(__dirname, "_batch-cd-translations.json"), "utf-8")
);

// 1. key-map.json — add tr source.
const kmPath = path.join(__dirname, "key-map.json");
const km = JSON.parse(fs.readFileSync(kmPath, "utf-8"));
let kmAdded = 0;
let kmSkipped = 0;
for (const [ns, keys] of Object.entries(src)) {
  if (!km[ns]) km[ns] = {};
  for (const [k, tr] of Object.entries(keys)) {
    if (km[ns][k]) {
      kmSkipped++;
      continue;
    }
    km[ns][k] = { tr, context: "batch-cd", type: "manual" };
    kmAdded++;
  }
}
fs.writeFileSync(kmPath, JSON.stringify(km, null, 2) + "\n", "utf-8");
console.log(`key-map.json: +${kmAdded} tr keys (${kmSkipped} already existed)`);

// 2. translations/<loc>.json — add 8 target langs.
for (const loc of TARGETS) {
  const tp = path.join(__dirname, "translations", `${loc}.json`);
  const td = JSON.parse(fs.readFileSync(tp, "utf-8"));
  let added = 0;
  for (const [ns, keys] of Object.entries(src)) {
    if (!td[ns]) td[ns] = {};
    for (const k of Object.keys(keys)) {
      const val = trans?.[ns]?.[k]?.[loc];
      if (typeof val !== "string" || val.length === 0) {
        throw new Error(`MISSING translation: ${loc} / ${ns}.${k}`);
      }
      td[ns][k] = val;
      added++;
    }
  }
  fs.writeFileSync(tp, JSON.stringify(td, null, 2) + "\n", "utf-8");
  console.log(`translations/${loc}.json: +${added}`);
}
console.log("Done — run merge-dictionaries.mjs next.");
