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
    if (trKeys.length === 0) continue; // empty namespace — nothing to merge
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

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Find direct child `key` within block [start,end) at the given indent.
// Returns { kind:"object", open, close } | { kind:"leaf", line } | null.
// Brace counting assumes any `{`/`}` inside string values is balanced on its
// own line (true for `{count}`-style placeholders) — same assumption as
// findLocaleBlocks.
function findKeyBlock(lines, start, end, indent, key) {
  const pad = " ".repeat(indent);
  const keyPat = `(?:${escRe(key)}|"${escRe(key)}")`;
  const objRe = new RegExp(`^${pad}${keyPat}:\\s*\\{\\s*$`);
  const leafRe = new RegExp(`^${pad}${keyPat}:\\s`);
  for (let i = start; i < end && i < lines.length; i++) {
    if (objRe.test(lines[i])) {
      let depth = 1;
      let j = i + 1;
      while (j < lines.length) {
        depth +=
          (lines[j].match(/\{/g) || []).length -
          (lines[j].match(/\}/g) || []).length;
        if (depth === 0) break;
        j++;
      }
      return { kind: "object", open: i, close: j };
    }
    if (leafRe.test(lines[i])) return { kind: "leaf", line: i };
  }
  return null;
}

function countLeaves(v) {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return Object.values(v).reduce((a, x) => a + countLeaves(x), 0);
  }
  return 1;
}

// Recursively merge `tree` into the object block [blockStart,blockEnd) whose
// direct children sit at `indent` spaces. Mutates `lines` via splice.
// Existing keys are preserved untouched; only missing sub-namespaces and
// leaves are inserted (at the end of the relevant block). Returns lines added.
function deepMerge(lines, blockStart, blockEnd, indent, tree, stats) {
  let delta = 0;
  const pad = " ".repeat(indent);
  for (const key of Object.keys(tree)) {
    const val = tree[key];
    const isObj = val && typeof val === "object" && !Array.isArray(val);
    const found = findKeyBlock(lines, blockStart, blockEnd + delta, indent, key);
    if (!found) {
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
      const serialized = isObj
        ? `${pad}${safeKey}: ${serializeTree(val, indent)},`
        : `${pad}${safeKey}: "${escapeStr(String(val))}",`;
      const newLines = serialized.split("\n");
      lines.splice(blockEnd + delta, 0, ...newLines);
      delta += newLines.length;
      stats.added += countLeaves(val);
    } else if (found.kind === "object" && isObj) {
      delta += deepMerge(lines, found.open + 1, found.close, indent + 2, val, stats);
    } else {
      stats.conflicts.push(key);
    }
  }
  return delta;
}

function mergeForLocale(srcText, loc, perLocaleFlat, stats) {
  const blocks = findLocaleBlocks(srcText);
  const block = blocks[loc];
  if (!block) throw new Error(`Locale block not found for ${loc}`);
  const lines = srcText.split("\n");
  const fullTree = buildNestedTree(perLocaleFlat);
  // Top-level keys inside a locale block are indented 4 spaces.
  deepMerge(lines, block.startLine + 1, block.endLine, 4, fullTree, stats);
  return lines.join("\n");
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
  let totalAdded = 0;
  for (const loc of LOCALES) {
    if (Object.keys(filtered[loc]).length === 0) continue;
    const stats = { added: 0, conflicts: [] };
    src = mergeForLocale(src, loc, filtered[loc], stats);
    totalAdded += stats.added;
    const uniqConflicts = [...new Set(stats.conflicts)];
    console.log(
      `[${loc}] +${stats.added} leaf` +
        (uniqConflicts.length
          ? ` (conflict skipped — existing leaf: ${uniqConflicts.join(", ")})`
          : "")
    );
  }
  console.log(`Total leaves added across locales: ${totalAdded}`);

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
