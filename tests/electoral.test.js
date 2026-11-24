const test = require('node:test'), assert = require('node:assert');
const U = require('./load.js'), E = U.Electoral;

function withSystem(sys, nat, st, fn) {
  const R = U.RULES.house, old = [R.system, R.nationalTierSeats, R.stateTierSeats];
  R.system = sys; if (nat != null) { R.nationalTierSeats = nat; R.stateTierSeats = st; } U.Elections.resetApportion();
  try { fn(); } finally { R.system = old[0]; R.nationalTierSeats = old[1]; R.stateTierSeats = old[2]; U.Elections.resetApportion(); }
}

test('two-tier default: 100 national seats (5% threshold) + 500 state seats', () => {
  const sum = o => Object.values(o).reduce((s, v) => s + v, 0), Q = U.Game.newGame(3), r = U.Elections.house(Q);
  assert.strictEqual(sum(r.national), 100); assert.strictEqual(sum(r.house), 600); assert.strictEqual(sum(U.Elections.apportion().pr), 500);
  const nat = U.Votes.national(Q); for (const p in r.national) assert.ok(nat[p] >= 5, p + ' cleared 5% nationally');
});

test('pure PR: 600 seats shared by population, every state and DC at least one', () => withSystem('pure-pr', null, null, () => {
  const a = U.Elections.apportion();
  const sum = o => Object.values(o).reduce((s, v) => s + v, 0);
  assert.strictEqual(sum(a.pr), 600); assert.strictEqual(sum(a.district), 0);
  for (const k in U.STATES) assert.ok(a.pr[k] >= 1); assert.ok(a.pr.DC >= 1);
}));

test('thresholds exclude small parties nationally or state by state', () => withSystem('pure-pr', null, null, () => {
  const Q = U.Game.newGame(3), sum = o => Object.values(o).reduce((s, v) => s + v, 0);
  const free = U.Elections.housePure(Q, { nationalThreshold: 0, stateThreshold: 0 }).house, nat5 = U.Elections.housePure(Q, { nationalThreshold: 0.05, stateThreshold: 0 }).house, st10 = U.Elections.housePure(Q, { nationalThreshold: 0, stateThreshold: 0.10 }).house;
  assert.strictEqual(sum(free), 600); assert.strictEqual(sum(nat5), 600); assert.strictEqual(sum(st10), 600);
  assert.ok(Object.keys(nat5).length < Object.keys(free).length);
  assert.ok(st10.lsp > 0, 'a 10% state threshold still seats a strong regional party');
  assert.ok(!nat5.lsp, 'a 5% national threshold does not');
}));

test('the President breaks a 300-300 tie', () => {
  assert.strictEqual(U.absolute({ yes: 300, no: 300, pres: 'yes' }), true);
  assert.strictEqual(U.absolute({ yes: 300, no: 300, pres: 'no' }), false);
  assert.strictEqual(U.simple({ yes: 250, no: 250, pres: 'yes' }), true);
  assert.strictEqual(U.simple({ yes: 250, no: 250, pres: 'abstain' }), false);
});

test('Sainte-Laguë and D\'Hondt allocate the textbook example', () => {
  const v = { A: 53000, B: 24000, C: 23000 };
  assert.deepStrictEqual(E.divisor(v, 7, 'sainte-lague', 0), { A: 3, B: 2, C: 2 });
  assert.deepStrictEqual(E.divisor(v, 7, 'dhondt', 0), { A: 4, B: 2, C: 1 });
});

test('the 5% state-senate threshold excludes small parties', () => {
  const r = E.divisor({ A: 60, B: 36, C: 4 }, 40, 'sainte-lague', 0.05);
  assert.strictEqual(r.C, undefined); assert.strictEqual(r.A + r.B, 40);
});

test('two-round: an absolute majority wins outright, otherwise the top two meet', () => {
  const pos = { a: { econ: 0, soc: 0 }, b: { econ: 5, soc: 5 }, c: { econ: -1, soc: 0 } };
  assert.strictEqual(E.twoRound({ a: 55, b: 30, c: 15 }, pos).round, 1);
  const r = E.twoRound({ a: 35, b: 40, c: 25 }, pos);
  assert.strictEqual(r.round, 2); assert.deepStrictEqual(r.finalists.sort(), ['a', 'b']);
  assert.strictEqual(r.winner, 'a', 'c voters are closer to a and transfer to it');
});

test('two-tier House with 300 national + 300 state seats', () => withSystem('two-tier', 300, 300, () => {
  const sum = o => Object.values(o).reduce((s, v) => s + v, 0);
  const Q = U.Game.newGame(3), r = U.Elections.houseTwoTier(Q, { nationalThreshold: 0.05, stateThreshold: 0.05 });
  assert.strictEqual(sum(r.national), 300); assert.strictEqual(sum(r.house), 600);
  assert.ok(!r.national.lsp && r.house.lsp > 0, 'a regional party can win state seats without national ones');
}));
