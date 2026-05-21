#!/usr/bin/env node
// One-off: inject Wave-2 form/component keys + impressum keys into key-map.json
// (tr) + translations/<loc>.json (8 targets), so merge-dictionaries.mjs can fold
// them into dictionaries.ts.
// Sources: _batch-wave2.json (tr) + _w2t-{a,b,c,d}.json (8-lang chunks)
//          + _batch-impressum.json (German legal — same value for all 9 locales).
// Usage: node scripts/i18n/_batch-wave2-merge.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TARGETS = ["en", "de", "fr", "es", "nl", "zh", "hi", "ur"];
const rd = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, f), "utf-8"));
const wr = (f, o) =>
  fs.writeFileSync(path.join(__dirname, f), JSON.stringify(o, null, 2) + "\n", "utf-8");

const wave2 = rd("_batch-wave2.json");
const impressum = rd("_batch-impressum.json");

// Combine the 4 translation chunks.
const trans = {};
for (const f of ["_w2t-a.json", "_w2t-b.json", "_w2t-c.json", "_w2t-d.json"]) {
  const part = rd(f);
  for (const [ns, keys] of Object.entries(part)) {
    trans[ns] = { ...(trans[ns] || {}), ...keys };
  }
}

// 1. key-map.json — tr source (wave2 + impressum).
const km = rd("key-map.json");
let kmAdded = 0;
let kmSkipped = 0;
for (const part of [wave2, impressum]) {
  for (const [ns, keys] of Object.entries(part)) {
    if (!km[ns]) km[ns] = {};
    for (const [k, tr] of Object.entries(keys)) {
      if (km[ns][k]) {
        kmSkipped++;
        continue;
      }
      km[ns][k] = { tr, context: "batch-wave2", type: "manual" };
      kmAdded++;
    }
  }
}
wr("key-map.json", km);
console.log(`key-map.json: +${kmAdded} tr keys (${kmSkipped} already existed)`);

// 2. translations/<loc>.json — wave2 translated, impressum verbatim (German).
for (const loc of TARGETS) {
  const td = rd(`translations/${loc}.json`);
  let added = 0;
  for (const [ns, keys] of Object.entries(wave2)) {
    if (!td[ns]) td[ns] = {};
    for (const k of Object.keys(keys)) {
      const v = trans?.[ns]?.[k]?.[loc];
      if (typeof v !== "string" || v.length === 0) {
        throw new Error(`MISSING translation: ${loc} / ${ns}.${k}`);
      }
      td[ns][k] = v;
      added++;
    }
  }
  for (const [ns, keys] of Object.entries(impressum)) {
    if (!td[ns]) td[ns] = {};
    for (const [k, src] of Object.entries(keys)) {
      td[ns][k] = src; // German legal text — identical for every locale.
      added++;
    }
  }
  wr(`translations/${loc}.json`, td);
  console.log(`translations/${loc}.json: +${added}`);
}
console.log("Done — run merge-dictionaries.mjs next.");
