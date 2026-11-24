const test = require('node:test'), assert = require('node:assert');
const U = require('./load.js'), E = U.Electoral;

test('apportionment fills exactly 400 + 400 seats, every state at least one of each', () => {
  const a = U.Elections.apportion();
  const sum = o => Object.values(o).reduce((s, v) => s + v, 0);
  assert.strictEqual(sum(a.district), 400); assert.strictEqual(sum(a.pr), 400);
  for (const k in U.STATES) { assert.ok(a.district[k] >= 1); assert.ok(a.pr[k] >= 1); }
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
