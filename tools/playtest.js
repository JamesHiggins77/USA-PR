// Headless playtest: random choices until the given year. Usage: node tools/playtest.js [seed] [endYear]
const U = require('../tests/load.js');
const seed = +(process.argv[2] || 1), endY = +(process.argv[3] || 2005);
const Q = U.Game.newGame(seed); let rs = seed * 7 + 3;
const r = () => { rs = (rs * 1103515245 + 12345) % 2147483648; return rs / 2147483648; };
U.Flow.begin(Q);
while (Q.year < endY) {
  if (Q.pendingEvent) { const e = U.Events.byId(Q.pendingEvent); const ops = U.Flow.options(Q, e).map((o, i) => [o, i]).filter(x => x[0].ok); U.Flow.answerEvent(Q, ops[Math.floor(r() * ops.length)][1]); continue; }
  if (U.Flow.canNegotiate(Q) && r() < 0.7) {
    const d = U.Coalition.aiDeal(Q, Q.player); const res = U.Flow.submitDeal(Q, d);
    console.log(U.dateStr(Q), 'player investiture', res.passed, res.inv.first.yes, res.inv.first.no, 'coal', d.coalition, 'cs', d.cs);
  }
  U.Flow.autoDraw(Q, ds => ds[Math.floor(r() * ds.length)]);
  let res = null;
  const slots = [0, 1, 2, 3, 4].filter(i => U.Flow.cardUsable(Q, i) === true);
  if (slots.length && r() < 0.9) { const sl = slots[Math.floor(r() * slots.length)]; const ops = U.Flow.options(Q, U.Flow.cardAt(Q, sl)).map((o, i) => [o, i]).filter(x => x[0].ok); res = U.Flow.playHand(Q, sl, ops[Math.floor(r() * ops.length)][1]); }
  else res = r() < 0.5 ? U.Flow.discard(Q, 0) : U.Flow.discardAll(Q);
  const out = res ? res.out : {};
  if (out.general) { const g = out.general; console.log(g.date, 'ELECTION', Object.entries(g.house).sort((a, b) => b[1] - a[1]).map(([p, n]) => p + ' ' + n).join(', '), '| senate', JSON.stringify(g.senate)); }
  if (out.presidential) { const p = out.presidential; console.log(p.date, 'PRESIDENT', p.winnerName, p.winnerParty, 'round', p.round, JSON.stringify(p.r1)); }
}
const n = U.Votes.national(Q);
console.log('END', U.dateStr(Q), 'PM', Q.gov && Q.gov.pm, Q.gov && Q.gov.coalition, 'cs', Q.gov && Q.gov.cs, 'Pres', Q.president.name);
console.log(Object.entries(n).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([p, v]) => p + ' ' + v.toFixed(1)).join(' '));
console.log('econ', JSON.stringify(Q.econ), 'leader', Q.leader.name);
Q.log.slice(-12).forEach(l => console.log('  ', l.t, l.text));
