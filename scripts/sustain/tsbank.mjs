// scripts/sustain/tsbank.mjs
//
// ORDERLE and FERMI keep their banks inside src/utils/puzzleGenerator.ts as
// TypeScript object literals. The keepers have to add entries there without
// reformatting the file (a rewrite would produce a huge, unreviewable diff and
// could break the style), so this module does surgical text work:
//
//   * locate `const <NAME> ... = [ ... ];`
//   * read every top-level `{ ... }` entry in it
//   * convert those literals to JSON so they can be validated and diffed
//   * append new entries just before the closing `];`
//
// Everything here is text-level on purpose: no TypeScript compiler is involved,
// because the keepers must run in plain Node on a GitHub runner.

import fs from 'node:fs';
import { norm, jaccard } from './lib.mjs';

/** Split a bank literal block into its top-level `{...}` object sources. */
function splitObjects(block) {
  const out = [];
  let depth = 0;
  let start = -1;
  let inStr = false;
  let quote = '';
  for (let i = 0; i < block.length; i++) {
    const ch = block[i];
    const prev = block[i - 1];
    if (inStr) {
      if (ch === quote && prev !== '\\') inStr = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; quote = ch; continue; }
    if (ch === '{') { if (depth === 0) start = i; depth++; continue; }
    if (ch === '}') {
      depth--;
      if (depth === 0 && start >= 0) { out.push(block.slice(start, i + 1)); start = -1; }
    }
  }
  return out;
}

/** Locate the bank block and its insertion point (index just before the `];`). */
export function locateBank(src, bankName) {
  const decl = src.indexOf(`const ${bankName}`);
  if (decl === -1) throw new Error(`bank ${bankName} not found in source`);
  // The declaration carries a TYPE annotation with its own brackets
  // (`const FERMI_BANK: FermiPuzzle[] = [`), so the array literal starts at the
  // first `[` AFTER the assignment — never at the first `[` after the name.
  const eq = src.indexOf('=', decl);
  if (eq === -1) throw new Error(`assignment for ${bankName} not found`);
  const open = src.indexOf('[', eq);
  if (open === -1) throw new Error(`array opener for ${bankName} not found`);
  let depth = 0;
  let inStr = false;
  let quote = '';
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    const prev = src[i - 1];
    if (inStr) { if (ch === quote && prev !== '\\') inStr = false; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; quote = ch; continue; }
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) return { open, close: i, block: src.slice(open + 1, i) };
    }
  }
  throw new Error(`unbalanced array for ${bankName}`);
}

/** Turn the TS object literals into real JS objects (keys quoted, then parsed). */
export function readBank(file, bankName) {
  const src = fs.readFileSync(file, 'utf8');
  const { block, close, open } = locateBank(src, bankName);
  const objects = splitObjects(block).map((lit) => {
    const jsonish = lit.replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '$1"$2":');
    try {
      return JSON.parse(jsonish);
    } catch (e) {
      throw new Error(`could not parse ${bankName} entry: ${e.message}\n${lit.slice(0, 200)}`);
    }
  });
  return { src, open, close, objects };
}

const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');

/** Serialise one entry in the repo's style: `{ key:"value", n:1 }`. */
export function serializeEntry(entry, fieldOrder) {
  const keys = fieldOrder ?? Object.keys(entry);
  const parts = keys
    .filter((k) => entry[k] !== undefined)
    .map((k) => {
      const v = entry[k];
      if (Array.isArray(v)) return `${k}:[${v.map((x) => `"${esc(x)}"`).join(',')}]`;
      if (typeof v === 'number') return `${k}:${v}`;
      if (typeof v === 'boolean') return `${k}:${v}`;
      return `${k}:"${esc(v)}"`;
    });
  return `  { ${parts.join(', ')} }`;
}

/**
 * Append entries to a bank. Returns { added, rejected } and — unless dryRun —
 * rewrites the file with the new lines just before the closing `];`.
 * Rejects an entry that duplicates an existing one (exact text, or a paraphrase
 * above the Jaccard guard) or that fails `validate`.
 */
export function appendToBank(file, bankName, entries, { fieldOrder, keyOf, validate, dryRun = true, jaccardLimit = 0.75 }) {
  const { src, close, objects } = readBank(file, bankName);
  const added = [];
  const rejected = [];

  for (const entry of entries) {
    const errors = validate ? validate(entry) : [];
    if (errors.length) { rejected.push({ entry, reason: errors.join('; ') }); continue; }
    const key = keyOf(entry);
    const clash = objects.some((o) => {
      const other = keyOf(o);
      return norm(other) === norm(key) || jaccard(other, key) >= jaccardLimit;
    });
    if (clash) { rejected.push({ entry, reason: `duplicate of an existing entry: ${key}` }); continue; }
    objects.push(entry);
    added.push(entry);
  }

  if (added.length && !dryRun) {
    const lines = added.map((e) => serializeEntry(e, fieldOrder)).join(',\n');
    // The last existing entry already ends with a comma, so the new lines go in
    // as-is and keep the array literal style identical to its neighbours.
    const before = src.slice(0, close).replace(/\s*$/, '\n');
    const after = src.slice(close);
    fs.writeFileSync(file, `${before}${lines},\n${after}`, 'utf8');
  }

  return { added, rejected };
}
