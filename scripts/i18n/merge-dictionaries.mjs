#!/usr/bin/env node
// Phase 1.4 — merge new namespaces from translations/<locale>.json into
// src/lib/i18n/dictionaries.ts (in-place, preserves existing keys + format).
//
// Strategy:
//   - Build a nested object per locale from flat dotted namespaces in key-map.json (tr)
//     and translations/<locale>.json (8 targets).
//   - For each locale block in dictionaries.ts, inject new top-level keys at the end.
//   - Require strict 9-locale parity (else skip + warn).
//
// Usage:
//   node scripts/i18n/merge-dictionaries.mjs
//   node scripts/i18n/merge-dictionaries.mjs --dry        (preview, no write)
//   node scripts/i18n/merge-dictionaries.mjs --ns page.balonlar

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO = path.resolve(__dirname, "..", "..");
const KEYMAP = path.join(__dirname, "key-map.json");
const TRANSL_DIR = path.join(__dirname, "translations");
const DICT_FILE = path.join(REPO, "src", "lib", "i18n", "dictionaries.ts");

const LOCALES = ["tr", "en", "de", "fr", "es", "nl", "zh", "hi", "ur"];

function parseArgs(argv) {
  const out = { dry: false, nsFilter: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry") out.dry = true;
    else if (a === "--ns") out.nsFilter = argv[++i];
    else if (a.startsWith("--ns=")) out.nsFilter = a.slice(5);
  }
  return out;
}

function loadLocaleData(args) {
  const data = {};
  for (const loc of LOCALES) {
    if (loc === "tr") {
      if (!fs.existsSync(KEYMAP)) throw new Error(`Missing key-map.json`);
      const km = JSON.parse(fs.readFileSync(KEYMAP, "utf-8"));
      const flat = {};
      for (const [ns, keys] of Object.entries(km)) {
        if (args.nsFilter && ns !== args.nsFilter) continue;
        flat[ns] = {};
        for (const [k, v] of Object.entries(keys)) {
          flat[ns][k] = v.tr;
        }
      }
      data[loc] = flat;
    } else {
      const tf = path.join(TRANSL_DIR, `${loc}.json`);
      if (!fs.existsSync(tf)) {
        console.warn(`MISSING translations/${loc}.json — locale will be skipped`);
        data[loc] = null;
        continue;
      }
      const ld = JSON.parse(fs.readFileSync(tf, "utf-8"));
      if (args.nsFilter) {
        data[loc] = args.nsFilter in ld ? { [args.nsFilter]: ld[args.nsFilter] } : {};
      } else {
        data[loc] = ld;
      }
    }
  }
  return data;
}

function assertParity(data) {
  const trNs = Object.keys(data.tr);
  const ok = [];
  const skipped = [];
  for (const ns of trNs) {
    const trKeys = Object.keys(data.tr[ns]);
    let parityOk = true;
    for (const loc of LOCALES) {
      if (loc === "tr") continue;
      const locData = data[loc];
      if (!locData || !locData[ns]) {
        parityOk = false;
        break;
      }
      for (const k of trKeys) {
        const v = locData[ns][k];
        if (typeof v !== "string" || v.length === 0) {
          parityOk = false;
          break;
        }
      }
      if (!parityOk) break;
    }
    if (parityOk) ok.push(ns);
    else skipped.push(ns);
  }
  return { ok, skipped };
}

function buildNestedTree(flatNs) {
  const tree = {};
  for (const dotted of Object.keys(flatNs).sort()) {
    const keys = flatNs[dotted];
    const segs = dotted.split(".");
    let node = tree;
    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i];
      if (i === segs.length - 1) {
        if (node[seg]) Object.assign(node[seg], keys);
        else node[seg] = { ...keys };
      } else {
        if (!node[seg]) node[seg] = {};
        node = node[seg];
      }
    }
  }
  return tree;
}

function escapeStr(s) {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

function serializeTree(tree, indentSpaces) {
  const indent = " ".repeat(indentSpaces);
  const childIndent = " ".repeat(indentSpaces + 2);
  const lines = ["{"];
  const keys = Object.keys(tree);
  for (const k of keys) {
    const v = tree[k];
    const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      lines.push(`${childIndent}${safeKey}: ${serializeTree(v, indentSpaces + 2)},`);
    } else {
      lines.push(`${childIndent}${safeKey}: "${escapeStr(String(v))}",`);
    }
  }
  lines.push(`${indent}}`);
  return lines.join("\n");
}

function findLocaleBlocks(srcText) {
  const lines = srcText.split("\n");
  const blocks = {};
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(/^  ([a-z]{2}): \{$/);
    if (m && LOCALES.includes(m[1])) {
      const loc = m[1];
      let depth = 1;
      let j = i + 1;
      while (j < lines.length && depth > 0) {
        const opens = (lines[j].match(/\{/g) || []).length;
        const closes = (lines[j].match(/\}/g) || []).length;
        depth += opens - closes;
        if (depth === 0) break;
        j++;
      }
      blocks[loc] = { startLine: i, endLine: j };
      i = j + 1;
    } else {
      i++;
    }
  }
  return blocks;
}

function existingTopLevelKeys(srcText, block) {
  const lines = srcText.split("\n");
  const inner = lines.slice(block.startLine + 1, block.endLine);
  const keys = new Set();
  let depth = 0;
  for (const line of inner) {
    if (depth === 0) {
      const m = line.match(/^    ([a-zA-Z_$][a-zA-Z0-9_$]*|"[^"]+")\s*:/);
      if (m) keys.add(m[1].replace(/"/g, ""));
    }
    depth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
    if (depth < 0) depth = 0;
  }
  return keys;
}

function insertIntoBlock(srcText, block, newKeys) {
  const lines = srcText.split("\n");
  const insertions = [];
  for (const [topKey, treeForTopKey] of Object.entries(newKeys)) {
    const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(topKey) ? topKey : `"${topKey}"`;
    const inner = serializeTree(treeForTopKey, 4);
    insertions.push(`    ${safeKey}: ${inner},`);
  }
  const before = lines.slice(0, block.endLine);
  const after = lines.slice(block.endLine);
  return [...before, ...insertions, ...after].join("\n");
}

function mergeForLocale(srcText, loc, perLocaleFlat) {
  const blocks = findLocaleBlocks(srcText);
  const block = blocks[loc];
  if (!block) throw new Error(`Locale block not found for ${loc}`);
  const existing = existingTopLevelKeys(srcText, block);

  const fullTree = buildNestedTree(perLocaleFlat);
  const newTopLevel = {};
  const conflicts = [];
  for (const k of Object.keys(fullTree)) {
    if (existing.has(k)) {
      conflicts.push(k);
      continue;
    }
    newTopLevel[k] = fullTree[k];
  }
  if (Object.keys(newTopLevel).length === 0 && conflicts.length === 0) return srcText;
  if (Object.keys(newTopLevel).length === 0) {
    console.warn(`[${loc}] no new top-level keys (all conflict): ${conflicts.join(", ")}`);
    return srcText;
  }
  if (conflicts.length > 0) {
    console.warn(`[${loc}] conflict top-level keys (skipped, manual review): ${conflicts.join(", ")}`);
  }
  return insertIntoBlock(srcText, block, newTopLevel);
}

function main() {
  const args = parseArgs(process.argv);
  if (!fs.existsSync(DICT_FILE)) {
    console.error(`Missing ${DICT_FILE}`);
    process.exit(2);
  }

  const data = loadLocaleData(args);
  const { ok, skipped } = assertParity(data);
  console.log(`Parity OK namespaces: ${ok.length} [${ok.join(", ")}]`);
  if (skipped.length) console.warn(`Parity FAIL namespaces (skipped): ${skipped.join(", ")}`);
  if (ok.length === 0) {
    console.log("Nothing to merge.");
    return;
  }

  const filtered = {};
  for (const loc of LOCALES) {
    filtered[loc] = {};
    for (const ns of ok) {
      if (data[loc] && data[loc][ns]) filtered[loc][ns] = data[loc][ns];
    }
  }

  let src = fs.readFileSync(DICT_FILE, "utf-8");
  for (const loc of LOCALES) {
    if (Object.keys(filtered[loc]).length === 0) continue;
    src = mergeForLocale(src, loc, filtered[loc]);
  }

  if (args.dry) {
    const tmp = path.join(__dirname, "dictionaries.preview.ts");
    fs.writeFileSync(tmp, src, "utf-8");
    console.log(`DRY: wrote preview to ${path.relative(process.cwd(), tmp)}`);
  } else {
    fs.writeFileSync(DICT_FILE, src, "utf-8");
    console.log(`Updated ${path.relative(process.cwd(), DICT_FILE)}`);
  }
}

main();
