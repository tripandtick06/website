#!/usr/bin/env node
// Throwaway: split key-map.json into N balanced TR-only chunks for translation subagents.
// Output: scripts/i18n/_chunks/group-<N>.json  shape { "<ns>": { "<key>": "<tr>" } }
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KEYMAP = path.join(__dirname, "key-map.json");
const OUT = path.join(__dirname, "_chunks");

const N = Number(process.argv[2] || 8);
const km = JSON.parse(fs.readFileSync(KEYMAP, "utf-8"));

// namespaces with >=1 key, sorted by key count desc for greedy bin-packing
const namespaces = Object.entries(km)
  .map(([ns, keys]) => ({ ns, count: Object.keys(keys).length }))
  .filter((x) => x.count > 0)
  .sort((a, b) => b.count - a.count);

const groups = Array.from({ length: N }, () => ({ total: 0, ns: [] }));
for (const { ns, count } of namespaces) {
  const g = groups.reduce((min, g) => (g.total < min.total ? g : min), groups[0]);
  g.ns.push(ns);
  g.total += count;
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

groups.forEach((g, i) => {
  const chunk = {};
  for (const ns of g.ns.sort()) {
    chunk[ns] = {};
    for (const [k, v] of Object.entries(km[ns])) chunk[ns][k] = v.tr;
  }
  const f = path.join(OUT, `group-${i + 1}.json`);
  fs.writeFileSync(f, JSON.stringify(chunk, null, 2), "utf-8");
  console.log(`group-${i + 1}.json  ${g.ns.length} ns  ${g.total} keys`);
});
console.log(`Total: ${namespaces.reduce((a, x) => a + x.count, 0)} keys across ${N} groups`);
