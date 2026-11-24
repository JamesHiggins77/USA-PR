// Two-tier House (300 national list + 300 state list seats): every
// combination of national threshold (national tier) and state threshold
// (state tier). Usage: node tools/two_tier_runs.js [seed]
const U = require('../tests/load.js');
U.RULES.house.system = 'two-tier'; U.RULES.house.total = 600; U.Elections.resetApportion();
const Q = U.Game.newGame(+(process.argv[2] || 3));
const NAT = [0, 0.02, 0.05, 0.08], ST = [0, 0.02, 0.05, 0.10];
const opening = { ldp: 3, sdlp: 2, cdp: 0.5, grn: -6, cc: -1, reform: 1 };
const pct = x => Math.round(x * 100) + '%';
function stats(h, nat) {
  const tot = Object.values(h).reduce((a, b) => a + b, 0);
  return { enp: 1 / Object.values(h).reduce((a, s) => a + (s / tot) ** 2, 0),
    lsq: Math.sqrt(0.5 * Object.keys(nat).reduce((a, p) => a + (nat[p] - (h[p] || 0) / tot * 100) ** 2, 0)),
    parties: Object.keys(h).filter(p => h[p]).length,
    wasted: Object.keys(nat).filter(p => !h[p]).reduce((a, p) => a + nat[p], 0) };
}
function run(label, mods) {
  const saved = U.clone(Q.mods);
  for (const p in mods) Q.mods[p] = U.Votes.all(mods[p]);
  const nat = U.Votes.national(Q), maj = U.majority();
  const grid = {};
  NAT.forEach(n => ST.forEach(s => { grid[n + '|' + s] = U.Elections.houseTwoTier(Q, { nationalThreshold: n, stateThreshold: s }); }));
  Q.mods = saved;
  console.log('\n## ' + label + ' (majority ' + maj + ')\n');
  console.log('### LDP + SDLP seats (with Reform in brackets)\n');
  console.log('| National \\ State threshold | ' + ST.map(pct).join(' | ') + ' |'); console.log('|---|' + ST.map(() => '---:').join('|') + '|');
  NAT.forEach(n => console.log('| ' + pct(n) + ' | ' + ST.map(s => { const h = grid[n + '|' + s].house, g = (h.ldp || 0) + (h.sdlp || 0); return (g >= maj ? '**' + g + '**' : g) + ' (' + (g + (h.reform || 0)) + ')'; }).join(' | ') + ' |'));
  console.log('\n### Parties seated / effective number of parties / disproportionality (Gallagher) / vote for unseated parties\n');
  console.log('| National \\ State threshold | ' + ST.map(pct).join(' | ') + ' |'); console.log('|---|' + ST.map(() => '---:').join('|') + '|');
  NAT.forEach(n => console.log('| ' + pct(n) + ' | ' + ST.map(s => { const x = stats(grid[n + '|' + s].house, nat); return x.parties + ' / ' + x.enp.toFixed(1) + ' / ' + x.lsq.toFixed(1) + ' / ' + x.wasted.toFixed(1) + '%'; }).join(' | ') + ' |'));
  // full seat tables for four representative combinations
  const picks = [[0, 0], [0.02, 0.05], [0.05, 0.05], [0.05, 0.10]];
  const order = Object.keys(nat).sort((a, b) => nat[b] - nat[a]).filter(p => picks.some(([n, s]) => grid[n + '|' + s].house[p]));
  console.log('\n### Seats by party (national tier + state tier)\n');
  console.log('| Party | Vote | ' + picks.map(([n, s]) => pct(n) + ' nat / ' + pct(s) + ' state').join(' | ') + ' |'); console.log('|---|---:|' + picks.map(() => '---:').join('|') + '|');
  order.forEach(p => console.log('| ' + U.PARTIES[p].short + ' | ' + nat[p].toFixed(1) + '% | ' + picks.map(([n, s]) => { const g = grid[n + '|' + s]; const a = g.national[p] || 0, b = (g.house[p] || 0) - a; return g.house[p] ? g.house[p] + ' (' + a + '+' + b + ')' : '–'; }).join(' | ') + ' |'));
}
run('Opening parliament (1996 electorate)', opening);
run('January 1997 polling', {});
