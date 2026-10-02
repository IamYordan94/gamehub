// scripts/sustain/keepers/fermi.mjs
//
// FERMI (game 5) serves FERMI_BANK from src/utils/puzzleGenerator.ts on a
// `days % bank.length` rotation, so the bank size IS the runway in days: 40
// puzzles means a player meets a repeat every 40 days.
//
// This keeper appends new estimation items from
// scripts/sustain/facts/fermi-facts.json and refuses duplicates. Every item must
// carry a citation — the game's own validator rejects one without, and the build
// gate (validateAll in vite.config.ts) fails the site if bad data lands.
//
// Usage: node scripts/sustain/keepers/fermi.mjs [--apply]

import { p, readJson, log, arg, FACTS, jaccard, norm, normalizeDifficulty } from '../lib.mjs';
import { appendToBank, readBank } from '../tsbank.mjs';

export const game = 'FERMI';
export const BANK_FILE = () => p('src', 'utils', 'puzzleGenerator.ts');
export const FIELD_ORDER = ['category', 'units', 'prompt', 'answer', 'reveal', 'citation', 'difficulty'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

/** Mirrors validateFermiPuzzle() in the game itself. */
export function validateFermi(item) {
  const errs = [];
  if (!item || typeof item !== 'object') return ['not an object'];
  if (!item.prompt) errs.push('missing prompt');
  if (!Number.isFinite(item.answer) || item.answer <= 0) errs.push('answer must be a positive number');
  if (!item.reveal || item.reveal.length < 20) errs.push('reveal too short (min 20 chars)');
  if (!item.citation || !/^https?:\/\//.test(item.citation)) errs.push('missing/invalid citation URL');
  if (!item.units) errs.push('missing units');
  if (!item.category) errs.push('missing category');
  if (!DIFFICULTIES.includes(item.difficulty)) errs.push('difficulty must be easy/medium/hard (FermiPuzzle types it as string)');
  return errs;
}

export function topUp({ dryRun = true, factsFile = p('scripts', 'sustain', 'facts', 'fermi-facts.json') } = {}) {
  // Facts may express difficulty as 1/2/3 (the quiz bank's convention) but this
  // bank stores words — normalise before validating or appending.
  const facts = readJson(factsFile).map((f) => ({ ...f, difficulty: normalizeDifficulty(f.difficulty) }));
  const before = readBank(BANK_FILE(), 'FERMI_BANK').objects.length;
  const res = appendToBank(BANK_FILE(), 'FERMI_BANK', facts, {
    fieldOrder: FIELD_ORDER,
    keyOf: (e) => e.prompt,
    validate: validateFermi,
    dryRun,
  });
  return {
    ok: true,
    added: res.added.length,
    rejected: res.rejected.map((r) => `${r.entry?.prompt?.slice(0, 60) ?? '?'}: ${r.reason}`),
    note: `${before} → ${before + res.added.length} puzzles (runway ${before} → ${before + res.added.length} days)`,
  };
}

if (process.argv[1]?.endsWith('fermi.mjs')) {
  const dryRun = !arg('apply');
  try {
    const res = topUp({ dryRun });
    log(`${dryRun ? '[dry-run] ' : ''}fermi: ${res.ok ? 'ok' : 'FAILED'} — ${res.note}`);
    for (const r of res.rejected) log(`  rejected: ${r}`);
  } catch (e) {
    log(`fermi: FAILED — ${e.message}`);
    process.exit(1);
  }
}
