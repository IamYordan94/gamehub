// scripts/sustain/keepers/export-dailybrain.mjs
//
// public/data/dailybrain-puzzles.json feeds the ORDERLE and FERMI calendars.
// It was exported by hand once and has been drifting ever since: the live games
// import the TypeScript banks (40 FERMI / 60 ORDERLE) while this file still
// serves 19 of each, so the calendars show a different rotation than the games.
//
// This keeper re-exports the JSON from the TS banks. Nothing is authored here —
// it is a pure projection, safe to run any time.

import { p, readText, writeIfChanged, log, arg } from '../lib.mjs';
import { readBank } from '../tsbank.mjs';

export const game = 'ORDERLE + FERMI calendar export';

export function exportDailybrain({ dryRun = true } = {}) {
  const file = p('src', 'utils', 'puzzleGenerator.ts');
  const orderle = readBank(file, 'ORDERLE_BANK').objects;
  const fermi = readBank(file, 'FERMI_BANK').objects;

  if (!orderle.length || !fermi.length) {
    return { ok: false, note: `refusing to write: parsed orderle=${orderle.length} fermi=${fermi.length}` };
  }

  const out = p('public', 'data', 'dailybrain-puzzles.json');
  const before = readText(out);
  const parsedBefore = JSON.parse(before);
  const payload = JSON.stringify({ orderle, fermi }, null, 2);
  const changed = JSON.stringify(parsedBefore.orderle) !== JSON.stringify(orderle)
    || JSON.stringify(parsedBefore.fermi) !== JSON.stringify(fermi);

  if (!dryRun && changed) writeIfChanged(out, payload);

  return {
    ok: true,
    changed,
    note: `orderle ${parsedBefore.orderle?.length ?? 0} → ${orderle.length}, `
      + `fermi ${parsedBefore.fermi?.length ?? 0} → ${fermi.length}`,
  };
}

if (process.argv[1]?.endsWith('export-dailybrain.mjs')) {
  const dryRun = !arg('apply');
  const res = exportDailybrain({ dryRun });
  log(`${dryRun ? '[dry-run] ' : ''}export-dailybrain: ${res.ok ? 'ok' : 'FAILED'} — ${res.note}`);
  if (!res.ok) process.exit(1);
}
