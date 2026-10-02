// scripts/sustain/keepers/quiz.mjs
//
// Quiz Master draws 10 questions a day from public/data/quiz-bank.json, which is
// built from the per-category sources in scripts/quiz-bank/*.json (the source of
// truth — never edit the built file by hand).
//
// 1,180 questions ≈ 118 days of play. This keeper appends new questions from
// scripts/sustain/facts/quiz-facts.json, refuses duplicates (exact text or a
// paraphrase above the similarity guard) and then runs the repo's own two
// validators. If either validator fails it RESTORES the files it touched, so a
// bad batch can never leave the bank broken.
//
// Usage: node scripts/sustain/keepers/quiz.mjs [--apply]

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { p, readJson, writeJson, norm, jaccard, log, arg, FACTS, readText } from '../lib.mjs';

export const game = 'Quiz Master';

const BANK_DIR = p('scripts', 'quiz-bank');
const VALIDATORS = ['scripts/merge-quiz-bank.mjs', 'scripts/test-quiz-logic.mjs'];

const CATEGORIES = ['general', 'sports', 'movies', 'geography', 'science', 'history',
  'music', 'technology', 'food', 'art', 'animals'];

function loadExisting() {
  const all = [];
  for (const cat of CATEGORIES) {
    const file = path.join(BANK_DIR, `${cat}.json`);
    if (!fs.existsSync(file)) continue;
    const arr = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const q of arr) all.push({ cat, q });
  }
  return all;
}

export function validateQuestion(q) {
  const errs = [];
  if (!q || typeof q !== 'object') return ['not an object'];
  if (!CATEGORIES.includes(q.category)) errs.push(`unknown category "${q.category}"`);
  if (typeof q.id !== 'string' || !/^[a-z]{3,4}-\d{3,4}$/.test(q.id)) errs.push(`bad id "${q.id}"`);
  if (typeof q.question !== 'string' || q.question.length < 10) errs.push('question too short');
  if (!Array.isArray(q.options) || q.options.length !== 4) errs.push('needs exactly 4 options');
  else if (new Set(q.options.map(norm)).size !== 4) errs.push('options are not unique');
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) errs.push('answer index out of range');
  if (![1, 2, 3].includes(q.difficulty)) errs.push('difficulty must be 1, 2 or 3');
  if (Array.isArray(q.options) && q.options.some((o) => typeof o !== 'string' || !o.trim())) errs.push('empty option');
  return errs;
}

export function topUp({ dryRun = true, factsFile = path.join(FACTS, 'quiz-facts.json'), jaccardLimit = 0.75 } = {}) {
  if (!fs.existsSync(factsFile)) return { ok: false, added: 0, note: `no facts file at ${factsFile}` };
  const facts = readJson(factsFile);
  const existing = loadExisting();
  const seen = new Set(existing.map(({ q }) => norm(q.question)));
  const added = [];
  const rejected = [];

  for (const q of facts) {
    const errs = validateQuestion(q);
    if (errs.length) { rejected.push(`${q?.id ?? '?'}: ${errs.join('; ')}`); continue; }
    if (seen.has(norm(q.question))) { rejected.push(`${q.id}: duplicate question text`); continue; }
    const near = existing.find(({ q: e }) => jaccard(e.question, q.question) >= jaccardLimit);
    if (near) { rejected.push(`${q.id}: paraphrase of ${near.q.id}`); continue; }
    if (existing.some(({ q: e }) => e.id === q.id)) { rejected.push(`${q.id}: id already in use`); continue; }
    seen.add(norm(q.question));
    existing.push({ cat: q.category, q });
    added.push(q);
  }

  if (!added.length || dryRun) {
    return {
      ok: true, added: added.length, rejected,
      note: added.length ? `would append ${added.length} questions (${rejected.length} rejected)` : `nothing to append (${rejected.length} rejected)`,
    };
  }

  // Snapshot for rollback, then append per category by splicing text so the git
  // diff stays additive-only (the repo's convention for this bank).
  const backups = new Map();
  for (const cat of [...new Set(added.map((q) => q.category))]) {
    const file = path.join(BANK_DIR, `${cat}.json`);
    backups.set(file, fs.readFileSync(file, 'utf8'));
    const items = added.filter((q) => q.category === cat);
    const text = backups.get(file);
    const closeIdx = text.lastIndexOf(']');
    const body = items.map((q) => JSON.stringify(q, null, 2).split('\n').map((l) => '  ' + l).join('\n')).join(',\n');
    const merged = `${text.slice(0, closeIdx).replace(/\s*$/, '')},\n${body}\n${text.slice(closeIdx)}`;
    JSON.parse(merged); // parse before writing — a broken splice must not land
    fs.writeFileSync(file, merged, 'utf8');
  }

  // The repo's validators are the acceptance test.
  const results = [];
  for (const script of VALIDATORS) {
    const res = runNode(script);
    results.push({ script, ...res });
  }
  const failed = results.filter((r) => r.code !== 0 || /FAIL|ERROR/i.test(r.out));
  if (failed.length) {
    for (const [file, text] of backups) fs.writeFileSync(file, text, 'utf8');
    return {
      ok: false, added: 0, rejected,
      note: `validators failed — rolled back. ${failed.map((f) => `${f.script}: ${f.out.trim().split('\n').slice(-3).join(' | ')}`).join(' || ')}`,
    };
  }

  return {
    ok: true, added: added.length, rejected,
    note: `appended ${added.length} questions across ${backups.size} categories; ${results.map((r) => `${path.basename(r.script)}: ${r.out.trim().split('\n').pop()}`).join('; ')}`,
  };
}

function runNode(relScript) {
  const res = spawnSync(process.execPath, [p(...relScript.split('/'))], { cwd: p(), encoding: 'utf8' });
  return { code: res.status, out: `${res.stdout ?? ''}${res.stderr ?? ''}` };
}

if (process.argv[1]?.endsWith('quiz.mjs')) {
  const dryRun = !arg('apply');
  const res = topUp({ dryRun });
  log(`${dryRun ? '[dry-run] ' : ''}quiz: ${res.ok ? 'ok' : 'FAILED'} — ${res.note}`);
  if (res.rejected?.length) for (const r of res.rejected.slice(0, 10)) log(`  rejected: ${r}`);
  if (!res.ok) process.exit(1);
}
