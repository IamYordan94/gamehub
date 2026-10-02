// scripts/sustain/keepers/wordpool.mjs
//
// Word Pool (game 3) picks a category per day with a date-seeded random index
// (getDailyPuzzleIndex), so with 35 categories a player meets the same category
// roughly every 35 days — the shortest rotation in the hub after FERMI. The
// runway is therefore the number of categories.
//
// This keeper appends new themed categories (6 levels each) from
// scripts/sustain/facts/wordpool-facts.json. A category is rejected if its name
// collides with an existing one or if a level is too thin to be a real puzzle.
//
// Usage: node scripts/sustain/keepers/wordpool.mjs [--apply]

import fs from 'node:fs';
import { p, readJson, writeIfChanged, log, arg, norm } from '../lib.mjs';

export const game = 'Word Pool';
const FILE = () => p('public', 'data', 'wordpool-categories.json');
const MIN_WORDS = 20;
const MIN_LEVELS = 6;

export function validateCategory(cat, existing) {
  const errs = [];
  if (!cat || typeof cat !== 'object') return ['not an object'];
  if (!cat.id || !/^[a-z0-9-]+$/.test(cat.id)) errs.push('id must be lowercase-with-dashes');
  if (!cat.name || cat.name.length < 3) errs.push('missing name');
  if (existing.some((c) => norm(c.name) === norm(cat.name) || c.id === cat.id)) errs.push(`name/id collides with an existing category ("${cat.name}")`);
  if (!Array.isArray(cat.levels) || cat.levels.length < MIN_LEVELS) errs.push(`needs ${MIN_LEVELS} levels`);
  else {
    const seen = new Set();
    for (const lvl of cat.levels) {
      if (!Number.isInteger(lvl.level)) errs.push('level must be an integer');
      if (!Array.isArray(lvl.words) || lvl.words.length < MIN_WORDS) errs.push(`level ${lvl.level} needs ${MIN_WORDS}+ words`);
      else {
        for (const w of lvl.words) {
          if (typeof w !== 'string' || w !== w.toLowerCase().trim()) errs.push(`level ${lvl.level}: "${w}" is not a clean lowercase word`);
          if (seen.has(w)) errs.push(`"${w}" appears twice inside this category`);
          seen.add(w);
        }
      }
    }
  }
  return errs;
}

export function topUp({ dryRun = true } = {}) {
  const factsFile = p('scripts', 'sustain', 'facts', 'wordpool-facts.json');
  if (!fs.existsSync(factsFile)) return { ok: false, added: 0, note: `no facts file at ${factsFile}` };
  const facts = readJson(factsFile);

  const file = FILE();
  const data = readJson(file);
  const existing = data.categories ?? [];
  const before = existing.length;
  const added = [];
  const rejected = [];

  for (const cat of facts) {
    const errs = validateCategory(cat, existing);
    if (errs.length) { rejected.push(`${cat?.name ?? '?'}: ${errs.slice(0, 3).join('; ')}`); continue; }
    existing.push(cat);
    added.push(cat);
  }

  if (!added.length || dryRun) {
    return {
      ok: true, added: added.length, rejected,
      note: added.length
        ? `would add ${added.length} categories (${before} → ${before + added.length}, runway ${before} → ${before + added.length} days)`
        : `nothing to add (${rejected.length} rejected)`,
    };
  }

  data.categories = existing;
  const changed = writeIfChanged(file, JSON.stringify(data, null, 2) + '\n');
  return {
    ok: true, added: added.length, rejected,
    note: changed
      ? `${before} → ${existing.length} categories (runway ${before} → ${existing.length} days)`
      : 'file already up to date',
  };
}

if (process.argv[1]?.endsWith('wordpool.mjs')) {
  const dryRun = !arg('apply');
  const res = topUp({ dryRun });
  log(`${dryRun ? '[dry-run] ' : ''}wordpool: ${res.ok ? 'ok' : 'FAILED'} — ${res.note}`);
  for (const r of res.rejected ?? []) log(`  rejected: ${r}`);
  if (!res.ok) process.exit(1);
}
