// Runs the campaign to the first general election many times with no player
// actions and reports the left/right balance. Usage: node tools/election_spread.js [runs]
const U = require('../tests/load.js');
const runs = +(process.argv[2] || 20), rows = [];
for (let seed = 1; seed <= runs; seed++) {
  const Q = U.Game.newGame(seed * 101); U.Flow.begin(Q); let g = 0, res = null;
  while (!res && g++ < 60) {
    let k = 0; while (Q.pendingEvent && k++ < 20) { const ops = U.Flow.options(Q, U.Events.byId(Q.pendingEvent)); U.Flow.answerEvent(Q, ops.findIndex(o => o.ok)); }
    const o = U.Flow.skip(Q); if (o && o.out.general) res = o.out.general;
  }
  if (!res) continue;
  const h = res.house, L = (h.ldp || 0) + (h.sdlp || 0), R = (h.cc || 0) + (h.cdp || 0);
  const formed = (() => { let m = 0; while (Q.formation && m++ < 6) { let k2 = 0; while (Q.pendingEvent && k2++ < 20) { const ops = U.Flow.options(Q, U.Events.byId(Q.pendingEvent)); U.Flow.answerEvent(Q, ops.findIndex(o => o.ok)); } if (U.Flow.canNegotiate(Q)) { const d = U.Coalition.aiDeal(Q, Q.player); U.Flow.submitDeal(Q, d); } else U.Flow.skip(Q); } return Q.gov ? Q.gov.pm + ' (' + Q.gov.coalition.join('+') + (Q.gov.cs.length ? ' cs:' + Q.gov.cs.join('+') : '') + ')' : 'none'; })();
  const G = (h.grn || 0) + (h.ul || 0);
  rows.push({ date: res.date, L, R, G, other: 600 - L - R - G, ldp: res.shares.ldp, cc: res.shares.cc, grn: (res.shares.grn || 0) + (res.shares.ul || 0), formed });
}
rows.forEach(r => console.log(r.date.padEnd(15), 'L', String(r.L).padStart(3), 'R', String(r.R).padStart(3), 'Greens/UL', String(r.G).padStart(3), 'others', String(r.other).padStart(3), '| LDP', r.ldp.toFixed(1) + '%', 'CC', r.cc.toFixed(1) + '%', 'Greens', r.grn.toFixed(1) + '% |', r.formed));
const lw = rows.filter(r => r.L > r.R).length, maj = rows.filter(r => r.L >= 301 || r.R >= 301).length;
console.log('\nLeft incl. Greens ahead of CC+CDP in', rows.filter(r => r.L + r.G > r.R).length, 'of', rows.length, '| LDP+SDLP ahead in', lw, 'of', rows.length, '| a bloc won a majority alone in', maj, '| average gap', (rows.reduce((a, r) => a + Math.abs(r.L - r.R), 0) / rows.length).toFixed(0), 'seats');
