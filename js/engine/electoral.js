// Pure electoral arithmetic: apportionment, divisor methods, two-round contests.
(function (G) {
  'use strict';
  var U = G.USA;
  var E = U.Electoral = {};

  // Largest-remainder (Hamilton) apportionment with a per-unit minimum.
  E.hamilton = function (pops, total, min) {
    min = min || 0;
    var ids = Object.keys(pops), out = {}, left = total;
    ids.forEach(function (id) { out[id] = min; left -= min; });
    var P = ids.reduce(function (s, id) { return s + pops[id]; }, 0);
    var quotas = ids.map(function (id) { return { id: id, q: pops[id] / P * left }; });
    var used = 0;
    quotas.forEach(function (o) { var f = Math.floor(o.q); out[o.id] += f; used += f; o.r = o.q - f; });
    quotas.sort(function (a, b) { return b.r - a.r || (a.id < b.id ? -1 : 1); });
    for (var i = 0; i < left - used; i++) out[quotas[i].id] += 1;
    return out;
  };

  // Divisor methods. votes: {party: share}. Returns {party: seats}.
  E.divisor = function (votes, seats, formula, threshold) {
    var tot = 0, k; for (k in votes) tot += votes[k];
    var elig = Object.keys(votes).filter(function (p) { return votes[p] > 0 && votes[p] / tot >= (threshold || 0); });
    var out = {}; elig.forEach(function (p) { out[p] = 0; });
    if (!elig.length) return out;
    var div = formula === 'dhondt' ? function (s) { return s + 1; } : function (s) { return 2 * s + 1; };
    for (var i = 0; i < seats; i++) {
      var best = null, bv = -1;
      elig.forEach(function (p) { var v = votes[p] / div(out[p]); if (v > bv || (v === bv && p < best)) { bv = v; best = p; } });
      out[best] += 1;
    }
    return out;
  };

  // Ideological distance between two parties (positions object {econ, soc, fed}).
  E.dist = function (a, b) {
    var de = a.econ - b.econ, ds = a.soc - b.soc, df = (a.fed || 0) - (b.fed || 0);
    return Math.sqrt(de * de + ds * ds + 0.35 * df * df);
  };

  // Two-round contest. shares: {party: pct}. pos: {party: position}.
  // opts.pactWith(a,b) -> transfer multiplier; opts.majority (0.5).
  // Returns {winner, round, r1, r2, finalists}.
  E.twoRound = function (shares, pos, opts) {
    opts = opts || {};
    var maj = opts.majority == null ? 0.5 : opts.majority;
    var tot = 0, p; for (p in shares) tot += shares[p];
    var r1 = {}; for (p in shares) r1[p] = shares[p] / tot * 100;
    var order = Object.keys(r1).sort(function (a, b) { return r1[b] - r1[a]; });
    if (r1[order[0]] > maj * 100) return { winner: order[0], round: 1, r1: r1, finalists: [order[0]] };
    var A = order[0], B = order[1], r2 = {}; r2[A] = r1[A]; r2[B] = r1[B];
    order.slice(2).forEach(function (e) {
      var wa = Math.exp(-E.dist(pos[e], pos[A]) / 4) * (opts.pactWith ? opts.pactWith(e, A) : 1);
      var wb = Math.exp(-E.dist(pos[e], pos[B]) / 4) * (opts.pactWith ? opts.pactWith(e, B) : 1);
      var stay = 0.25 + 0.5 * Math.exp(-Math.max(wa, wb) * 3); // far from both -> abstain
      var moving = r1[e] * (1 - Math.min(0.9, stay));
      r2[A] += moving * wa / (wa + wb); r2[B] += moving * wb / (wa + wb);
    });
    var t2 = r2[A] + r2[B]; r2[A] = r2[A] / t2 * 100; r2[B] = r2[B] / t2 * 100;
    return { winner: r2[A] >= r2[B] ? A : B, round: 2, r1: r1, r2: r2, finalists: [A, B] };
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
