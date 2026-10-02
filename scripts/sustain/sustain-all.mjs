// scripts/sustain/sustain-all.mjs
//
// One entry point that runs every game's content keeper, then re-measures the
// runway so you can see what actually changed. This is what the weekly GitHub
// Actions workflow runs; it works the same locally.
//
//   node scripts/sustain/sustain-all.mjs              # dry run: report only
//   node scripts/sustain/sustain-all.mjs --apply      # write changes
//   node scripts/sustain/sustain-all.mjs --apply --only=quiz,fermi
//
// Exit code is 0 only when every game ends above its runway floor. A keeper that
// cannot refill a game is reported as a failure — silently "passing" a starving
// game is the one outcome this script must never produce.

import { measure, FLOOR_DAYS, CRIT_DAYS } from './runway.mjs';
import { table, log, arg, STATUS } from './lib.mjs';

async function loadKeepers() {
  const [lettermix, wordpool, orderle, fermi, seven, quiz, cbo, exportDailybrain] = await Promise.all([
    import('./keepers/lettermix.mjs'),
    import('./keepers/wordpool.mjs'),
    import('./keepers/orderle.mjs'),
    import('./keepers/fermi.mjs'),
    import('./keepers/seven.mjs'),
    import('./keepers/quiz.mjs'),
    import('./keepers/cbo.mjs'),
    import('./keepers/export-dailybrain.mjs'),
  ]);

  // Order matters: the generators that rewrite a whole file run before the
  // export that reads those files.
  return [
    { name: 'Clear the String', key: 'lettermix', module: lettermix, run: (o) => lettermix.topUp(o) },
    { name: 'Word Pool', key: 'wordpool', module: wordpool, run: (o) => wordpool.topUp(o) },
    { name: 'ORDERLE', key: 'orderle', module: orderle, run: (o) => orderle.topUp(o) },
    { name: 'FERMI', key: 'fermi', module: fermi, run: (o) => fermi.topUp(o) },
    { name: '7 Letters', key: 'seven', module: seven, run: (o) => seven.topUp(o) },
    { name: 'Quiz Master', key: 'quiz', module: quiz, run: (o) => quiz.topUp(o) },
    { name: 'Change by One', key: 'cbo', module: cbo, run: () => cbo.check() },
    { name: 'Calendar export', key: 'export', module: exportDailybrain, run: (o) => exportDailybrain.exportDailybrain(o) },
  ];
}

function indexByKey(games) {
  return new Map(games.map((g) => [g.key, g]));
}

async function main() {
  const apply = Boolean(arg('apply'));
  const only = arg('only');
  const wanted = only ? String(only).split(',').map((s) => s.trim()).filter(Boolean) : null;
  const dryRun = !apply;

  const before = measure();
  const beforeByKey = indexByKey(before);
  const keepers = await loadKeepers();

  log(`${apply ? 'APPLY' : 'DRY RUN'} — ${before.length} games · floor ${FLOOR_DAYS}d · critical ${CRIT_DAYS}d\n`);
  const results = [];

  for (const keeper of keepers) {
    if (wanted && !wanted.includes(keeper.key)) continue;
    let res;
    try {
      res = keeper.run({ dryRun });
    } catch (e) {
      res = { ok: false, added: 0, note: `threw ${e.message}` };
    }
    results.push({ keeper: keeper.name, key: keeper.key, ...res });
    log(`${res.ok ? ' ok ' : 'FAIL'} ${keeper.name.padEnd(16)} ${res.note}`);
    for (const r of res.rejected ?? []) log(`        rejected: ${r}`);
  }

  const after = measure();
  const afterByKey = indexByKey(after);

  log('\nRunway before → after');
  log(table(after.map((g) => {
    const b = beforeByKey.get(g.key);
    const bDays = b?.runway === Infinity ? 'generated' : `${b?.runway ?? '?'}d`;
    const aDays = g.runway === Infinity ? 'generated' : `${g.runway}d`;
    return {
      game: g.game,
      before: bDays,
      after: aDays,
      status: apply ? g.status : (b?.status ?? g.status),
    };
  })));

  const starving = after.filter((g) => g.runway !== Infinity && g.runway < FLOOR_DAYS);
  const failed = results.filter((r) => !r.ok);

  if (starving.length) {
    log(`\nStill below the ${FLOOR_DAYS}-day floor: ${starving.map((g) => `${g.game} (${g.runway}d)`).join(', ')}`);
    log('Add more material to scripts/sustain/facts/ (or raise the generator targets) and run again.');
  }
  if (failed.length) log(`\nKeepers that failed: ${failed.map((f) => f.keeper).join(', ')}`);
  if (!starving.length && !failed.length) {
    log(`\nAll games above the ${FLOOR_DAYS}-day floor.${apply ? ' Changes written — commit them to publish.' : ' (dry run: nothing written)'}`);
  }

  if (failed.length || (apply && starving.length)) process.exit(1);
}

main();
