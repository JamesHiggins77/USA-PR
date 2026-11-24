// Compares pure-PR House outcomes under different thresholds.
// Usage: node tools/threshold_runs.js [seed]
const U = require('../tests/load.js');
const seed = +(process.argv[2] || 3);
const Q = U.Game.newGame(seed);
const configs = [
  ['No threshold', {}],
  ['2% national', { nationalThreshold: 0.02 }],
  ['5% national', { nationalThreshold: 0.05 }],
  ['8% national', { nationalThreshold: 0.08 }],
  ['2% state', { stateThreshold: 0.02 }],
  ['5% state', { stateThreshold: 0.05 }],
  ['10% state', { stateThreshold: 0.10 }]
];
const opening = { ldp: 3, sdlp: 2, cdp: 0.5, grn: -6, cc: -1, reform: 1 }; // the electorate that elected the 1997 parliament
function run(label, mods) {
  const saved = U.clone(Q.mods);
  for (const p in mods) Q.mods[p] = U.Votes.all(mods[p]);
  const nat = U.Votes.national(Q);
  const rows = configs.map(([name, opt]) => {
    const h = U.Elections.housePure(Q, opt).house, tot = Object.values(h).reduce((a, b) => a + b, 0);
    const parties = Object.keys(h).filter(p => h[p]).length;
    const enp = 1 / Object.values(h).reduce((a, s) => a + (s / tot) ** 2, 0);
    const lsq = Math.sqrt(0.5 * Object.keys(nat).reduce((a, p) => a + (nat[p] - (h[p] || 0) / tot * 100) ** 2, 0));
    const wasted = Object.keys(nat).filter(p => !h[p]).reduce((a, p) => a + nat[p], 0);
    return { name, h, tot, parties, enp, lsq, wasted };
  });
  Q.mods = saved;
  const order = Object.keys(nat).sort((a, b) => nat[b] - nat[a]).filter(p => rows.some(r => r.h[p]) || nat[p] >= 0.4);
  const maj = U.majority();
  console.log('\n## ' + label + ' (majority ' + maj + ')\n');
  console.log('| Party | Vote | ' + rows.map(r => r.name).join(' | ') + ' |');
  console.log('|---|---:|' + rows.map(() => '---:').join('|') + '|');
  order.forEach(p => console.log('| ' + U.PARTIES[p].short + ' | ' + nat[p].toFixed(1) + '% | ' + rows.map(r => r.h[p] || '–').join(' | ') + ' |'));
  console.log('| **LDP+SDLP** | ' + ((nat.ldp || 0) + (nat.sdlp || 0)).toFixed(1) + '% | ' + rows.map(r => '**' + ((r.h.ldp || 0) + (r.h.sdlp || 0)) + '**').join(' | ') + ' |');
  console.log('| LDP+SDLP+REF | | ' + rows.map(r => (r.h.ldp || 0) + (r.h.sdlp || 0) + (r.h.reform || 0)).join(' | ') + ' |');
  console.log('| Parties seated | | ' + rows.map(r => r.parties).join(' | ') + ' |');
  console.log('| Effective no. of parties | | ' + rows.map(r => r.enp.toFixed(1)).join(' | ') + ' |');
  console.log('| Disproportionality (Gallagher) | | ' + rows.map(r => r.lsq.toFixed(1)).join(' | ') + ' |');
  console.log('| Vote for unseated parties | | ' + rows.map(r => r.wasted.toFixed(1) + '%').join(' | ') + ' |');
}
run('Opening parliament (1996 electorate)', opening);
run('January 1997 polling', {});
