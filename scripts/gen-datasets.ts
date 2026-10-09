// Generates public/data/<slug>.json (machine-readable edition of each sourced
// fact dataset in src/data/datasets/*.json). Fails (exit 1) when any datapoint
// lacks an https source url, a literal quote or a read date.
//
// Run: npx tsx scripts/gen-datasets.ts   (wired into `prebuild`)

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildPublishedDataset, validateDataset, type DatasetSource } from "../src/lib/datasets";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCES = ["cappadocia-balloon-facts.json"];

let failed = false;
for (const file of SOURCES) {
  const raw = JSON.parse(readFileSync(path.join(ROOT, "src", "data", "datasets", file), "utf8"));
  const errors = validateDataset(raw);
  if (errors.length > 0) {
    failed = true;
    console.error(`gen-datasets: ${file} invalid\n  - ${errors.join("\n  - ")}`);
    continue;
  }
  const ds = raw as DatasetSource;
  const outDir = path.join(ROOT, "public", "data");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, `${ds.slug}.json`), `${JSON.stringify(buildPublishedDataset(ds), null, 2)}\n`, "utf8");
  console.log(`gen-datasets: ${ds.slug}.json written — ${ds.datapoints.length} datapoints.`);
}
if (failed) process.exit(1);
