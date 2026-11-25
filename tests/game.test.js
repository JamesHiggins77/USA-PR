const test = require('node:test'), assert = require('node:assert');
const U = require('./load.js');
const sum = o => Object.values(o).reduce((s, v) => s + v, 0);

test('the 1997 opening matches the canon', () => {
  const Q = U.Game.newGame(7);
  assert.strictEqual(sum(Q.house), 600);
  assert.strictEqual(Q.senateSeats.length, 200);
  assert.strictEqual(Q.president.name, 'Bill Clinton');
  assert.strictEqual(Q.gov.pm, 'Al Gore');
  assert.deepStrictEqual(Q.gov.coalition, ['ldp', 'cdp', 'sdlp']);
  assert.deepStrictEqual(Q.gov.cs, []);
  assert.strictEqual(Q.offices.vp.name, 'Colin Powell');
  assert.ok(Q.dormant.ul && Q.dormant.acp, 'no United Left or ACP at the start');
  assert.strictEqual(Q.house.grn, 4, 'Nader is one of four Green MPs');
  const g = ['ldp', 'cdp', 'sdlp'];
  assert.ok(g.reduce((s, p) => s + Q.house[p], 0) >= U.majority(), 'the government controls the House');
  const sen = U.Elections.senateCount(Q);
  assert.ok(g.reduce((s, p) => s + (sen[p] || 0), 0) >= 101, 'government controls the Senate');
  assert.strictEqual(Q.player, 'ldp');
  assert.strictEqual(Q.year, 1997);
  assert.strictEqual(Q.nextPres, U.monthIndex(1998, 11), 'presidential election in November 1998');
});

test('Senate: in each state 3 seats by PR and 1 elected by the state house', () => {
  const Q = U.Game.newGame(3);
  for (const sid of Object.keys(U.STATES)) {
    const seats = Q.senateSeats.filter(s => s.state === sid);
    assert.strictEqual(seats.filter(s => s.type === 'pr').length, 3);
    const h = seats.filter(s => s.type === 'house');
    assert.strictEqual(h.length, 1); assert.strictEqual(h[0].party, U.Elections.chamberChoice(Q, Q.states[sid].house));
  }
  assert.strictEqual(Q.states.NE.senate, undefined, 'Nebraska is unicameral');
});

test('general elections always produce 600 seats and a multiparty House', () => {
  for (const seed of [1, 2, 3]) {
    const Q = U.Game.newGame(seed);
    const r = U.Game.runGeneralElection(Q);
    assert.strictEqual(sum(r.house), 600);
    assert.ok(Object.keys(r.house).length >= 6);
    assert.ok(Math.max(...Object.values(r.house)) < U.majority(), 'no single-party majority in a typical opening');
  }
});

test('red lines block cabinets but not every arrangement', () => {
  const Q = U.Game.newGame(5);
  const deal = { pm: 'cc', coalition: ['cc', 'ul'], cs: [], posts: { cc: 15, ul: 5 }, concessions: {} };
  assert.strictEqual(U.Coalition.assess(Q, 'ul', deal, 'coalition').ok, false);
});

test('a numerical majority does not form automatically', () => {
  const Q = U.Game.newGame(5);
  // CC + SDLP + LDP would be a majority but the SDLP has no reason to join a CC cabinet on these terms
  const deal = { pm: 'cc', coalition: ['cc', 'sdlp', 'ldp'], cs: [], posts: { cc: 16, sdlp: 2, ldp: 2 }, concessions: {} };
  assert.strictEqual(U.Coalition.assess(Q, 'sdlp', deal, 'coalition').ok, false);
});

test('United Left and AGA members vote separately', () => {
  const Q = U.Game.newGame(9); Q.ulMembers = { grn: 3, dsa: 2, cpusa: 1, revsoc: 1 }; Q.house.ul = 30; Q.house.aga = 5; Q.agaSeats = { AK: 2, RI: 1, VA: 2 };
  const res = U.Parliament.count(Q, 'house', (p, sub) => p === 'ul' ? (U.LEFT_MEMBERS[sub] === 'reformist' ? 'yes' : 'no') : p === 'aga' ? (sub === 'VA' ? 'no' : 'yes') : 'abstain');
  const ul = res.by.filter(b => b.party === 'ul'); assert.ok(ul.some(b => b.vote === 'yes') && ul.some(b => b.vote === 'no'));
  const aga = res.by.filter(b => b.party === 'aga'); assert.ok(aga.some(b => b.vote === 'no') && aga.some(b => b.vote === 'yes'));
});

test('the campaign runs headless to 2005 without errors and MAGA stays dormant before 2015', () => {
  const Q = U.Game.newGame(11); U.Flow.begin(Q);
  let guard = 0;
  while (Q.year < 2005 && guard++ < 2000) {
    if (Q.pendingEvent) { const ops = U.Flow.options(Q, U.Events.byId(Q.pendingEvent)); U.Flow.answerEvent(Q, ops.findIndex(o => o.ok)); continue; }
    if (U.Flow.canNegotiate(Q)) U.Flow.submitDeal(Q, U.Coalition.aiDeal(Q, Q.player));
    U.Flow.autoDraw(Q); U.Flow.discardAll(Q);
  }
  assert.ok(Q.year >= 2005);
  assert.strictEqual(Q.dormant.maga, true);
  assert.strictEqual(Q.dormant.acp, true, 'ACP only appears in the 2020s');
  assert.ok(Q.electionNo >= 1);
});

test('the far left can unite into the United Left, and the Greens can leave it', () => {
  const Q = U.Game.newGame(4); U.Flow.begin(Q);
  const before = sum(Q.house);
  const w = U.Game.mergeInto(Q, ['grn', 'cpusa', 'dsa', 'wfp', 'revsoc'], 'ul', 1.05); Q.ulMembers = w;
  assert.strictEqual(sum(Q.house), before);
  assert.ok(Q.dormant.grn && Q.dormant.cpusa && !Q.dormant.ul);
  const n = U.Votes.national(Q); assert.ok(n.ul > 4 && n.ul < 9, 'UL keeps roughly the members\' vote: ' + n.ul);
  Q.house.ul = 20; U.Events.greenSplit(Q);
  assert.ok(!Q.dormant.grn && Q.house.grn > 0 && !Q.ulMembers.grn);
});

test('Reform is absorbed into the ASP, keeping its seats and its C&S role', () => {
  const Q = U.Game.newGame(4); Q.gov.cs = ['reform'];
  const r = Q.house.reform, a = Q.house.asp || 0;
  U.Game.mergeInto(Q, ['reform'], 'asp', 0.85);
  assert.strictEqual(Q.house.asp, r + a); assert.ok(Q.dormant.reform);
  assert.ok(Q.gov.cs.indexOf('asp') >= 0 && Q.gov.cs.indexOf('reform') < 0);
  assert.ok(!Q.senateSeats.some(x => x.party === 'reform'));
});

test('the hand holds five cards from five decks; playing or discarding advances one month', () => {
  const Q = U.Game.newGame(21); U.Flow.begin(Q);
  while (Q.pendingEvent) U.Flow.answerEvent(Q, U.Flow.options(Q, U.Events.byId(Q.pendingEvent)).findIndex(o => o.ok));
  assert.strictEqual(Object.keys(Q.decks).length, 5);
  for (const d of ['national', 'party', 'state', 'coalition']) U.Decks.draw(Q, d, Q.hand.indexOf(null));
  U.Flow.autoDraw(Q);
  assert.ok(Q.hand.every(Boolean), 'five cards held');
  assert.ok(new Set(Q.hand.map(h => h.id)).size === 5, 'no duplicates in hand');
  const m = U.monthIndex(Q.year, Q.month);
  const slot = [0, 1, 2, 3, 4].find(i => U.Flow.cardUsable(Q, i) === true);
  const idx = U.Flow.options(Q, U.Flow.cardAt(Q, slot)).findIndex(o => o.ok);
  U.Flow.playHand(Q, slot, idx);
  assert.strictEqual(U.monthIndex(Q.year, Q.month), m + 1);
  assert.strictEqual(Q.hand.filter(Boolean).length, 4);
  while (Q.pendingEvent) U.Flow.answerEvent(Q, U.Flow.options(Q, U.Events.byId(Q.pendingEvent)).findIndex(o => o.ok));
  U.Flow.discardAll(Q);
  assert.strictEqual(U.monthIndex(Q.year, Q.month), m + 2);
  assert.ok(Q.hand.every(h => h === null));
});

test('historical election maps add up to the stated electors', () => {
  const L = U.LORE;
  for (const e of L.presElections) {
    const el = e.era === 'modern' ? U.Elections.apportion().electors : L.ecEras[e.era];
    const lose = e.lose.split(' '), tot = Object.values(el).reduce((a, b) => a + b, 0);
    for (const s of lose) assert.ok(el[s] != null, e.year + ': ' + s + ' had no electors');
    const b = lose.reduce((a, s) => a + el[s], 0);
    assert.strictEqual(e.total, tot, e.year + ' total');
    assert.strictEqual(e.r2[1][2], b, e.year + ' runoff loser');
    assert.strictEqual(e.r2[0][2], tot - b, e.year + ' runoff winner');
    assert.ok(e.r2[0][2] > e.r2[1][2], e.year + ' winner has more electors');
    assert.ok(Math.abs(e.r1.reduce((a, c) => a + c[2], 0) - 100) < 0.05, e.year + ' round one adds to 100%');
  }
});

test('historical general elections: every government holds a majority', () => {
  for (const e of U.LORE.generalElections) {
    const s = U.LORE.generalSeats(e), n = Object.values(s).reduce((a, b) => a + b, 0);
    assert.strictEqual(n, e.seats, e.year + ' seats');
    assert.ok(Math.abs(Object.values(e.shares).reduce((a, b) => a + b, 0) - 100) < 0.05, e.year + ' shares add to 100');
    const g = e.gov.concat(e.cs || []).reduce((a, p) => a + (s[p] || 0), 0);
    assert.ok(g > e.seats / 2, e.year + ' government majority');
  }
});

test('senate: 2-1 normally, 1-1-1 in near-ties, 3-0 in landslides', () => {
  const S = U.Electoral.senateSeats;
  assert.deepStrictEqual(S({ a: 30, b: 25, c: 20 }), { a: 2, b: 1 });
  assert.deepStrictEqual(S({ a: 26, b: 25, c: 20 }), { a: 1, b: 1, c: 1 });
  assert.deepStrictEqual(S({ a: 50, b: 20, c: 10 }), { a: 3 });
});

test('constitution: Senate veto/delay, presidential veto override, budgets bypass the Senate', () => {
  const Q = U.Game.newGame(3), S = U.Game;
  const sen = U.sum(U.Elections.senateCount(Q));
  const h = (y, n) => ({ yes: y, no: n, abstain: 600 - y - n });
  assert.strictEqual(S.legislativeProcess(Q, h(250, 300), { yes: 150, no: 50 }, false).status, 'defeated');
  assert.strictEqual(S.legislativeProcess(Q, h(320, 280), { yes: 50, no: Math.ceil(sen * 2 / 3) }, false).status, 'senateVeto');
  assert.strictEqual(S.legislativeProcess(Q, h(320, 280), { yes: 80, no: 120 }, false).status, 'delayed');
  assert.strictEqual(S.legislativeProcess(Q, h(320, 280), { yes: 120, no: 80 }, true).status, 'presVeto');
  assert.strictEqual(S.legislativeProcess(Q, h(400, 200), { yes: 120, no: 80 }, true).status, 'law');
  assert.strictEqual(U.RULES.government.budgetSenate, 'none');
});

test('every party has a profile with seven axes and factions', () => {
  for (const k of Object.keys(U.PARTIES)) { const p = U.PARTY_PROFILES[k]; assert.ok(p, k); assert.strictEqual(Object.keys(p.ax).length, 7, k); assert.ok(p.factions.length >= 2, k); }
});

test('LDP factions and placed figures are consistent', () => {
  assert.deepStrictEqual(Object.keys(U.LDP_FACTIONS), ['newdem', 'proglib', 'chrlib', 'heartland']);
  for (const f of U.FIGURES) assert.ok(U.PARTY_PROFILES[f[1]].factions.some(x => x[0] === f[2]), f[0]);
});

test('demographic categories add up and every segment has a vote', () => {
  const Q = U.Game.newGame(1), D = U.Votes.demographics(Q);
  for (const c of U.DEMO_CATEGORIES) {
    for (const y of [1997, 2010, 2024]) assert.ok(Math.abs(c.segs.reduce((a, s) => a + U.segSize(s, y), 0) - 100) < 0.01, c.name + ' ' + y);
    for (const s of c.segs) { const v = U.segmentVote(D, c, s); assert.ok(Math.abs(Object.values(v).reduce((a, b) => a + b, 0) - 100) < 0.01, s[0]); }
  }
});

test('crosstab: single segments keep their size; combinations shrink and still sum to 100%', () => {
  const Q = U.Game.newGame(1), P = U.Crosstab.prepare(Q);
  const idx = (c, n) => [c, U.DEMO_CATEGORIES.find(x => x.id === c).segs.findIndex(s => s[0].startsWith(n))];
  assert.ok(Math.abs(U.Crosstab.query(P, 'US', [idx('union', 'Union')]).size - 23) < 0.5);
  const r = U.Crosstab.query(P, 'TX', [idx('race', 'White'), idx('union', 'Union'), idx('religion', 'Catholic'), idx('age', '18'), idx('home', 'Renter')]);
  assert.ok(r.size > 0 && r.size < 1);
  assert.ok(Math.abs(Object.values(r.shares).reduce((a, b) => a + b, 0) - 100) < 0.01);
  for (const reg of U.Crosstab.REGIONS) assert.ok(U.Crosstab.query(P, 'R:' + reg[0], []).shares);
});

test('demographics change over time', () => {
  const Q = U.Game.newGame(1); const idx = (c, n) => [c, U.DEMO_CATEGORIES.find(x => x.id === c).segs.findIndex(s => s[0].startsWith(n))];
  const at = (y, q) => { Q.year = y; return U.Crosstab.query(U.Crosstab.prepare(Q), 'US', q); };
  assert.ok(at(2024, [idx('race', 'Hisp')]).size > at(1997, [idx('race', 'Hisp')]).size * 1.8);
  assert.ok(at(2024, [idx('education', 'Post')]).shares.ldp > at(1997, [idx('education', 'Post')]).shares.ldp + 5);
  assert.ok(at(2024, [idx('education', 'High')]).shares.cc > at(1997, [idx('education', 'High')]).shares.cc + 5);
});

test('crosstab with non-voters: party shares plus non-voters make 100%', () => {
  const Q = U.Game.newGame(1), P = U.Crosstab.prepare(Q);
  const r = U.Crosstab.query(P, 'US', [], true), y = U.Crosstab.query(P, 'US', [['age', 0]], true);
  assert.ok(Math.abs(Object.values(r.shares).reduce((a, b) => a + b, 0) - 100) < 0.01);
  assert.ok(r.turnout > 50 && r.turnout < 75); assert.ok(y.turnout < r.turnout);
});

test('polling regions cover every state exactly once', () => {
  const seen = {}; for (const r of U.Crosstab.REGIONS) for (const s of r[1].split(' ')) { assert.ok(!seen[s], s); seen[s] = 1; }
  for (const s of Object.keys(U.STATES).concat(['DC'])) assert.ok(seen[s], s);
});

test('mergers: the plan rolls the United Left and Green decisions; joint lists pass the threshold together', () => {
  let ul = 0; for (let s = 1; s <= 200; s++) { const Q = U.Game.newGame(s); if (U.Game.plan(Q).ul2000) ul++; }
  assert.ok(ul > 130 && ul < 170, 'about 75% unite: ' + ul);
  const Q = U.Game.newGame(5); Q.pacts = [{ parties: ['wfp', 'dsa'], type: 'list' }];
  const h = U.Elections.houseTwoTier(Q); assert.ok(h.house);
});

test('2001-2012: September 11 and the 2008 crash always happen', () => {
  const Q = U.Game.newGame(9); U.Flow.begin(Q); let g = 0;
  while (Q.year < 2009 && g++ < 200) { let k = 0; while (Q.pendingEvent && k++ < 20) { const o = U.Flow.options(Q, U.Events.byId(Q.pendingEvent)); U.Flow.answerEvent(Q, Math.max(0, o.findIndex(x => x.ok))); } U.Flow.skip(Q); }
  assert.strictEqual(Q.flags.sept11, U.monthIndex(2001, 9)); assert.strictEqual(Q.flags.crash, U.monthIndex(2008, 9));
});

test('policy events depend on the LDP\'s role: PM, junior partner, support, opposition', () => {
  const Q = U.Game.newGame(4), e = U.Events.byId('security'), opt = () => U.Flow.options(Q, e).map(o => o.label);
  assert.strictEqual(U.Game.role(Q), 'pm'); assert.ok(opt()[0].startsWith('National unity'));
  Q.gov.pmParty = 'sdlp'; Q.gov.pm = 'Bill Bradley'; assert.strictEqual(U.Game.role(Q), 'junior'); assert.ok(opt()[0].startsWith('Back the cabinet')); assert.ok(opt().some(l => l.startsWith('Break ranks')));
  Q.gov.coalition = ['sdlp']; Q.gov.cs = ['ldp']; assert.strictEqual(U.Game.role(Q), 'support'); assert.ok(opt().some(l => l.startsWith('Withdraw support')));
  Q.gov.cs = []; assert.strictEqual(U.Game.role(Q), 'opposition'); assert.ok(opt()[0].startsWith('Back the government'));
  const before = Q.econ.shock || 0; Q.gov.pmParty = 'sdlp'; const s = U.Events.byId('stimulus'); Q.flags.crash = 1; U.Flow.options(Q, s)[1].raw.act(Q);
  assert.ok((Q.spending || 0) > 0, 'the government\'s stimulus still happens with the LDP in opposition');
});

test('careers: politicians retire and newcomers arrive over time', () => {
  const Q = U.Game.newGame(2); U.Flow.begin(Q); let g = 0;
  while (Q.year < 2010 && g++ < 200) { let k = 0; while (Q.pendingEvent && k++ < 20) { const o = U.Flow.options(Q, U.Events.byId(Q.pendingEvent)); U.Flow.answerEvent(Q, Math.max(0, o.findIndex(x => x.ok))); } U.Flow.skip(Q); }
  assert.ok(Q.retired['Strom Thurmond'] && Q.retired['Ted Kennedy']);
  assert.ok(U.activeIn('Barack Obama', 2008) && !U.activeIn('Barack Obama', 2000));
  assert.notStrictEqual(Q.leaders.cpusa, 'Gus Hall');
});

test('opening parliament: Sanders holds a Vermont House seat for the VPP, the Greens have 4 seats', () => {
  const Q = U.Game.newGame(7); assert.strictEqual(Q.houseByState.VT.vpp, 1); assert.strictEqual(Q.house.grn, 4);
  assert.ok(!Q.senateSeats.some(x => x.state === 'VT' && x.party === 'vpp'));
  const o = Q.open1996, sum = {}; for (const s in o.states) for (const p in o.states[s].seats) sum[p] = (sum[p] || 0) + o.states[s].seats[p]; for (const p in o.national) sum[p] = (sum[p] || 0) + o.national[p];
  assert.deepStrictEqual(sum, Object.fromEntries(Object.entries(o.house).filter(e => e[1])));
});

test('Sanders is only a senator once his party wins a Vermont Senate seat', () => {
  const Q = U.Game.newGame(1); assert.notStrictEqual(U.Game.senLeaderOf(Q, 'vpp'), 'Bernie Sanders'); assert.ok(!Q.flags.sandersSenator);
});

test('blocs and alliances: every party maps into 2, 3 and 5 blocs; alliances split into their parties', () => {
  const Q = U.Game.newGame(1), n = U.Votes.national(Q);
  for (const m of ['2', '3', '5', '7']) { const b = U.blocAgg(n, m, Q); assert.ok(Math.abs(Object.values(b).reduce((a, c) => a + c, 0) - Object.values(n).reduce((a, c) => a + c, 0)) < 1e-6); assert.deepStrictEqual(Object.keys(b).sort(), U.BLOC_ORDER[m].slice().sort()); }
  const s = U.splitAlliances(Q, Q.house, 'house'); assert.strictEqual(Object.values(s).reduce((a, c) => a + c, 0), 600); assert.ok(!s.asp && s.mup && s.cath);
});

test('negotiating table: stances, five rounds, snubbing an expected partner, the House vote', () => {
  const Q = U.Game.newGame(3), T = U.Talks; Q.formation = { start: 1, stage: 'open', round: 2, monthsLeft: 3, failed: [] };
  const t = T.start(Q); assert.strictEqual(t.rounds, 5); assert.ok(T.expected(Q, 'sdlp')); assert.strictEqual(t.stance.sdlp, 'abstain');
  const snub = T.offer(Q, 'sdlp', { bills: ['health'] }); assert.strictEqual(snub.after, 'no'); assert.strictEqual(t.rounds, 4);
  const r = T.offer(Q, 'cdp', { posts: 5, bills: ['balanced'] }); assert.ok(['yes', 'abstain'].includes(r.after));
  for (let i = 0; i < 3; i++) T.offer(Q, 'reform', { referendum: true, investment: true }); assert.strictEqual(t.rounds, 0); assert.strictEqual(T.offer(Q, 'asp', {}), null);
  const v = T.vote(Q); assert.ok(typeof v.passed === 'boolean'); assert.strictEqual(Q.talks, null);
});
test('the presidential election date is fixed', () => {
  const Q = U.Game.newGame(3); const np = Q.nextPres; U.Game.callElection(Q, 2); assert.strictEqual(Q.nextPres, np);
});

test('talks odds: a fair coalition offer to the SDLP is near-certain; rebels appear in a left-right coalition', () => {
  const Q = U.Game.newGame(3), T = U.Talks; Q.formation = { start: 1, stage: 'open', round: 2, monthsLeft: 3, failed: [] }; T.start(Q);
  T.offer(Q, 'sdlp', { posts: 6, bills: ['health'] }); assert.ok(T.dist(Q, 'sdlp').yes > 0.95);
  assert.ok(T.rebelShare(Q, 'sdlp', ['ldp', 'sdlp', 'cc']) > T.rebelShare(Q, 'sdlp', ['ldp', 'sdlp']));
  const pr = T.project(Q); assert.ok(pr.chance >= 0 && pr.chance <= 1);
});

test('the CC never votes for an LDP PM outside a grand coalition', () => {
  const Q = U.Game.newGame(3), T = U.Talks; Q.formation = { start: 1, stage: 'nominee', round: 1, monthsLeft: 99, failed: [] }; T.start(Q);
  T.offer(Q, 'cc', { bills: ['taxcut', 'defence'], speaker: true, chairs: 6 }); assert.strictEqual(T.dist(Q, 'cc').yes, 0); assert.ok(T.dist(Q, 'cc').abstain < 0.2);
  Q.formation.stage = 'open'; assert.ok(T.dist(Q, 'cc').abstain > 0.2);
  T.offer(Q, 'cc', { posts: 8, bills: ['taxcut'] }); assert.ok(T.dist(Q, 'cc').yes > 0.5);
});
