// scripts/sustain/keepers/orderle.mjs
//
// ORDERLE (game 4) serves ORDERLE_BANK from src/utils/puzzleGenerator.ts on a
// `days % bank.length` rotation — 60 puzzles today, so a repeat every 60 days.
//
// The bank is also tagged by category (cooking / science / history / grammar /
// everyday / mixed / biology). generateOrderleForDate() — currently unused by the
// pages, but still exported and therefore easy to wire up later — picks a pool by
// weekday, and `mixed` holds a single puzzle, which would repeat every Saturday
// if that path were ever used. Keeping every category's pool deep removes that
// latent trap for free.
//
// Usage: node scripts/sustain/keepers/orderle.mjs [--apply]

import { p, readJson, log, arg, jaccard, FACTS, normalizeDifficulty } from '../lib.mjs';
import { appendToBank, readBank } from '../tsbank.mjs';

export const game = 'ORDERLE';
export const BANK_FILE = () => p('src', 'utils', 'puzzleGenerator.ts');
export const FIELD_ORDER = ['category', 'rule', 'items', 'reveal', 'citation', 'difficulty', 'reverse'];
const CATEGORIES = ['cooking', 'science', 'history', 'grammar', 'everyday', 'mixed', 'biology'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

/** Mirrors validateOrderlePuzzle() in the game itself. */
export function validateOrderle(item) {
  const errs = [];
  if (!item || typeof item !== 'object') return ['not an object'];
  if (!Array.isArray(item.items) || item.items.length < 3) errs.push('needs at least 3 items');
  else if (new Set(item.items.map((s) => s.trim().toLowerCase())).size !== item.items.length) errs.push('duplicate items');
  if (!item.rule) errs.push('missing rule');
  if (!item.reveal || item.reveal.length < 20) errs.push('reveal too short (min 20 chars)');
  if (!item.citation || !/^https?:\/\//.test(item.citation)) errs.push('missing/invalid citation URL');
  if (!CATEGORIES.includes(item.category)) errs.push(`unknown category "${item.category}"`);
  if (!DIFFICULTIES.includes(item.difficulty)) errs.push('difficulty must be easy/medium/hard (OrderlePuzzle types it as string)');
  return errs;
}

export function topUp({ dryRun = true } = {}) {
  const factsFile = p('scripts', 'sustain', 'facts', 'orderle-facts.json');
  const facts = readJson(factsFile).map((f) => ({ ...f, difficulty: normalizeDifficulty(f.difficulty) }));
  const { objects } = readBank(BANK_FILE(), 'ORDERLE_BANK');
  const before = objects.length;
  const res = appendToBank(BANK_FILE(), 'ORDERLE_BANK', facts, {
    fieldOrder: FIELD_ORDER,
    keyOf: (e) => e.rule,
    validate: validateOrderle,
    dryRun,
  });
  const byCat = {};
  for (const o of objects) byCat[o.category] = (byCat[o.category] ?? 0) + 1;
  const thinnest = Object.entries(byCat).sort((a, b) => a[1] - b[1])[0];
  return {
    ok: true,
    added: res.added.length,
    rejected: res.rejected.map((r) => `${r.entry?.rule ?? '?'}: ${r.reason}`),
    note: `${before} → ${before + res.added.length} puzzles (runway ${before} → ${before + res.added.length} days); thinnest category "${thinnest?.[0]}" = ${thinnest?.[1]}`,
  };
}

if (process.argv[1]?.endsWith('orderle.mjs')) {
  const dryRun = !arg('apply');
  try {
    const res = topUp({ dryRun });
    log(`${dryRun ? '[dry-run] ' : ''}orderle: ${res.ok ? 'ok' : 'FAILED'} — ${res.note}`);
    for (const r of res.rejected) log(`  rejected: ${r}`);
  } catch (e) {
    log(`orderle: FAILED — ${e.message}`);
    process.exit(1);
  }
}
