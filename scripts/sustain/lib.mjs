// scripts/sustain/lib.mjs
// Shared helpers for the content sustainers ("keepers").
//
// The hub ships seven daily games. Each one draws its puzzle from a data source
// with a FIXED number of items, picked by a date-derived index. That means every
// game has a finite "runway": the number of days before a player sees a puzzle
// they have already played. The keepers measure that runway and top the source up
// before it runs short.
//
// Rule of this folder: nothing here talks to a model or the network unless a
// keeper explicitly opts in. Deterministic, offline, stdlib + repo data only, so
// the check keeps working when an API key, a provider or an AI cron job is broken.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(SCRIPT_DIR, '..', '..');
export const DATA = path.join(REPO, 'public', 'data');
export const FACTS = path.join(SCRIPT_DIR, 'facts');

export const p = (...parts) => path.join(REPO, ...parts);

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/** Write JSON keeping the repo's 2-space / trailing-newline style. */
export function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

export function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

/** Write only when the bytes actually change — keeps git diffs honest. */
export function writeIfChanged(file, content) {
  const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (before === content) return false;
  fs.writeFileSync(file, content, 'utf8');
  return true;
}

export const DAY_MS = 86400000;

/** UTC midnight of a YYYY-MM-DD string (matches the games' UTC day helper). */
export function utcDay(dateStr) {
  return Date.parse(dateStr + 'T00:00:00Z');
}

export function todayUtcStr(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function daysBetween(fromStr, toStr) {
  return Math.round((utcDay(toStr) - utcDay(fromStr)) / DAY_MS);
}

export function daysSince(dateStr, now = new Date()) {
  return Math.floor((utcDay(todayUtcStr(now)) - utcDay(dateStr)) / DAY_MS);
}

/** Normalise a string for duplicate detection (case/punctuation-insensitive). */
export function norm(s) {
  return String(s)
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^a-z0-9' -]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenSet(s) {
  return new Set(norm(s).split(' ').filter(Boolean));
}

/** Jaccard similarity — used as a paraphrase guard when appending content. */
export function jaccard(a, b) {
  const A = tokenSet(a);
  const B = tokenSet(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / (A.size + B.size - inter);
}

/** Days until a `days % count` rotation repeats. */
export function rotationRunway(count) {
  return count;
}

/**
 * Statistical runway for a date-seeded random pick (fires with p = 1/count each
 * day). Returns the expected gap before the same item comes up again, which is
 * what a player actually experiences as "I've seen this already".
 */
export function seededRandomRunway(count) {
  return count;
}

export const STATUS = { OK: 'OK', WARN: 'WARN', LOW: 'LOW', FAIL: 'FAIL' };

// The quiz bank stores difficulty as 1|2|3, but ORDERLE and FERMI store it as a
// word — the two content pipelines are deliberately different, so never pass a
// number into the ORDERLE/FERMI banks (TypeScript's difficulty: string catches it
// at build time, which is why the keepers normalise before appending).
export const DIFFICULTY_WORD = { 1: 'easy', 2: 'medium', 3: 'hard' };

export function normalizeDifficulty(value) {
  if (typeof value === 'number') return DIFFICULTY_WORD[value];
  return value;
}

/** Print an aligned table. */
export function table(rows, headers) {
  const cols = headers ?? Object.keys(rows[0] ?? {});
  const widths = cols.map((c) =>
    Math.max(String(c).length, ...rows.map((r) => String(r[c] ?? '').length)),
  );
  const line = (vals) => vals.map((v, i) => String(v).padEnd(widths[i])).join('  ');
  const out = [line(cols), widths.map((w) => '-'.repeat(w)).join('  ')];
  for (const r of rows) out.push(line(cols.map((c) => r[c] ?? '')));
  return out.join('\n');
}

export function arg(name, fallback = null) {
  const hit = process.argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return fallback;
  const eq = hit.indexOf('=');
  return eq === -1 ? true : hit.slice(eq + 1);
}

export function log(...a) {
  console.log(...a);
}
