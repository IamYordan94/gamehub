// scripts/sustain/keepers/lettermix.mjs
//
// Clear the String (game 1) is the only CALENDAR game: LetterMixPage matches a
// puzzle by exact date + level, so there is no rotation to fall back on. When
// the last dated puzzle passes, the game serves nothing at all.
// Current cliff: 2026-12-31 (three puzzles per day, one per level).
//
// This keeper extends the calendar by running the repo's own deterministic
// generator with a later --to date. Because generation is seeded per
// (date, level), regenerating the whole range rewrites the earlier dates
// byte-identically — the keeper verifies that before it keeps the result, and
// restores the file if any previously published puzzle changed.
//
// Usage: node scripts/sustain/keepers/lettermix.mjs [--apply] [--months=24]

import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { p, readJson, log, arg, todayUtcStr } from '../lib.mjs';

export const game = 'Clear the String';
const FILE = () => p('public', 'data', 'lettermix-puzzles.json');
const LEVELS_PER_DAY = 3;

function plan(months) {
  const file = FILE();
  const arr = JSON.parse(fs.readFileSync(file, 'utf8'));
  const dates = arr.map((x) => x.date).filter(Boolean).sort();
  const last = dates[dates.length - 1];
  const target = new Date(Date.now() + months * 30.44 * 86400000).toISOString().slice(0, 10);
  return { arr, last, target, needs: last < target };
}

export function topUp({ dryRun = true, months = Number(arg('months', 24)) } = {}) {
  const { arr, last, target, needs } = plan(months);
  if (!needs) {
    return { ok: true, added: 0, note: `calendar already runs to ${last} (target ${target}) — nothing to do` };
  }
  if (dryRun) {
    return { ok: true, added: 0, note: `would extend the calendar from ${last} to ${target} (generator is deterministic and additive)` };
  }

  const file = FILE();
  const backup = fs.readFileSync(file, 'utf8');

  const res = spawnSync(process.execPath,
    [p('scripts', 'generateLetterMixPuzzles.js'), `--to=${target}`, '--append'],
    { cwd: p(), encoding: 'utf8', timeout: 600000 });
  if (res.status !== 0) {
    fs.writeFileSync(file, backup, 'utf8');
    return { ok: false, added: 0, note: `generator failed (exit ${res.status}): ${(res.stderr || res.stdout || '').trim().slice(-300)}` };
  }

  const after = JSON.parse(fs.readFileSync(file, 'utf8'));
  const afterDates = after.map((x) => x.date).filter(Boolean).sort();
  const newLast = afterDates[afterDates.length - 1];

  // Every previously published puzzle must come back byte-identical, or the
  // calendar's history would silently change under players who already played
  // those days. Comparing the whole published prefix (not a per-key map) also
  // handles the two legacy dates that carry 6 entries instead of 3.
  const keptExact = JSON.stringify(after.slice(0, arr.length)) === JSON.stringify(arr);
  if (!keptExact) {
    fs.writeFileSync(file, backup, 'utf8');
    return { ok: false, added: 0, note: 'the published puzzles were not preserved exactly — restored the file; the generator must only append' };
  }

  // Gaps would mean a day with fewer than 3 levels (a dead day for players).
  const byDate = new Map();
  for (const x of after) byDate.set(x.date, (byDate.get(x.date) ?? 0) + 1);
  const gaps = [...byDate.entries()].filter(([, n]) => n < LEVELS_PER_DAY).map(([d]) => d);

  return {
    ok: gaps.length === 0,
    added: after.length - arr.length,
    note: `${last} → ${newLast} (+${after.length - arr.length} puzzles, ${byDate.size} days)`
      + (gaps.length ? ` BUT ${gaps.length} day(s) have fewer than ${LEVELS_PER_DAY} levels: ${gaps.slice(0, 5).join(', ')}` : '')
      + ` — ${afterDates[0]} start, today ${todayUtcStr()}`,
  };
}

if (process.argv[1]?.endsWith('lettermix.mjs')) {
  const dryRun = !arg('apply');
  const res = topUp({ dryRun });
  log(`${dryRun ? '[dry-run] ' : ''}lettermix: ${res.ok ? 'ok' : 'FAILED'} — ${res.note}`);
  if (!res.ok) process.exit(1);
}
