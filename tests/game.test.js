const test = require('node:test'), assert = require('node:assert');
const U = require('./load.js');
const sum = o => Object.values(o).reduce((s, v) => s + v, 0);

test('the 1999 opening matches the canon', () => {
  const Q = U.Game.newGame(7);
  assert.strictEqual(sum(Q.house), 801);
  assert.strictEqual(Q.senateSeats.length, 200);
  assert.strictEqual(Q.president.name, 'Bill Clinton');
  assert.strictEqual(Q.gov.pm, 'Al Gore');
  assert.deepStrictEqual(Q.gov.coalition, ['ldp', 'sdlp', 'cdp']);
  assert.deepStrictEqual(Q.gov.cs, ['reform']);
  assert.ok(Q.dormant.ul && Q.dormant.acp, 'no United Left or ACP in 1999');
  assert.strictEqual(Q.house.grn, 4, 'Nader is one of four Green MPs');
  const g = ['ldp', 'sdlp', 'cdp'];
  assert.ok(g.reduce((s, p) => s + Q.house[p], 0) >= 401, 'government controls the House');
  const sen = U.Elections.senateCount(Q);
  assert.ok(g.reduce((s, p) => s + (sen[p] || 0), 0) >= 101, 'government controls the Senate');
  assert.strictEqual(Q.player, 'ldp');
});

test('Nebraska is unicameral and its governor appoints three senators', () => {
  const Q = U.Game.newGame(3);
  const ne = Q.senateSeats.filter(s => s.state === 'NE' && s.type !== 'direct');
  assert.ok(ne.every(s => s.party === Q.states.NE.governor));
  assert.strictEqual(Q.states.NE.senate, undefined);
});

test('general elections always produce 801 seats and a multiparty House', () => {
  for (const seed of [1, 2, 3]) {
    const Q = U.Game.newGame(seed);
    const r = U.Game.runGeneralElection(Q);
    assert.strictEqual(sum(r.house), 801);
    assert.ok(Object.keys(r.house).length >= 6);
    assert.ok(Math.max(...Object.values(r.house)) < 401, 'no single-party majority in a typical opening');
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
  const Q = U.Game.newGame(4);
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
