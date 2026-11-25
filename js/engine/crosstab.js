// Crosstabs: polling for any geography (nation, region, state) and any
// combination of demographic segments (one per category).
// Each state's vote is split across the nine base voter groups so that, mixed
// by the state's own electorate, it reproduces the state's vote shares. A
// combination of segments is then estimated naive-Bayes style:
//   P(group | picks) ~ P(group | place) x product of P(segment | group).
(function (G) {
  'use strict';
  var U = G.USA, V = U.Votes, X = U.Crosstab = {};

  // Polling regions (they may overlap, e.g. the Sunbelt and the South).
  X.REGIONS = [
    ['New England', 'ME NH VT MA RI CT'],
    ['East Coast', 'NY NJ PA DE MD DC VA'],
    ['Appalachia', 'WV KY TN'],
    ['The South', 'AL MS LA GA SC NC AR'],
    ['Sunbelt', 'FL GA NC SC TX AZ NV NM'],
    ['Midwest', 'OH MI IN IL WI MN IA MO'],
    ['Great Plains', 'ND SD NE KS OK'],
    ['Rockies', 'MT ID WY CO UT'],
    ['West Coast', 'CA OR WA'],
    ['Alaska and Hawaii', 'AK HI']
  ];

  // group vote within one state, raked to the state's actual result
  function stateGroups(Q, s, nat) {
    var mix = V.mix(s), sh = V.stateShares(Q, s), gs = {}, regional = 0, p, g;
    for (p in sh) if (U.REGIONAL.indexOf(p) >= 0) regional += sh[p];
    U.GROUPS.forEach(function (g) {
      var o = {}, t = 0, src = nat.groups[g].shares;
      for (p in src) if (p !== 'regional' && sh[p] != null) { o[p] = src[p]; t += o[p]; }
      for (p in o) o[p] = o[p] / t * (100 - regional);
      for (p in sh) if (U.REGIONAL.indexOf(p) >= 0) o[p] = sh[p];
      gs[g] = o;
    });
    for (var it = 0; it < 6; it++) {
      var est = {};
      U.GROUPS.forEach(function (g) { for (p in gs[g]) est[p] = (est[p] || 0) + gs[g][p] * (mix[g] || 0); });
      U.GROUPS.forEach(function (g) {
        var t = 0; for (p in gs[g]) { gs[g][p] *= est[p] > 0 ? sh[p] / est[p] : 1; t += gs[g][p]; }
        for (p in gs[g]) gs[g][p] = gs[g][p] / t * 100;
      });
    }
    return { mix: mix, shares: gs, pop: s.pop };
  }

  // all states once per call; returns a function geo -> {mix, shares, pop, name}
  X.prepare = function (Q) {
    var nat = V.demographics(Q), per = {};
    V.allStates().forEach(function (s) { per[s.id] = stateGroups(Q, s, nat); });
    var agg = function (ids, name) {
      var mix = {}, shares = {}, pop = 0;
      U.GROUPS.forEach(function (g) { mix[g] = 0; shares[g] = {}; });
      ids.forEach(function (id) { var d = per[id]; if (!d) return; pop += d.pop;
        U.GROUPS.forEach(function (g) { var w = (d.mix[g] || 0) * d.pop; mix[g] += w; for (var p in d.shares[g]) shares[g][p] = (shares[g][p] || 0) + d.shares[g][p] * w; }); });
      U.GROUPS.forEach(function (g) { for (var p in shares[g]) shares[g][p] /= mix[g] || 1; mix[g] /= pop || 1; });
      return { mix: mix, shares: shares, pop: pop, name: name };
    };
    var natGeo = agg(Object.keys(per), 'United States');
    return { nat: nat, natGeo: natGeo, year: Q.year + (Q.month - 1) / 12, geo: function (key) {
      if (!key || key === 'US') return natGeo;
      if (key.indexOf('R:') === 0) { var r = X.REGIONS.filter(function (x) { return x[0] === key.slice(2); })[0]; return agg(r[1].split(' '), r[0]); }
      var st = U.STATES[key] || (key === 'DC' ? U.DC : null);
      return agg([key], st ? st.name : key);
    } };
  };

  // P(group | segment), normalised; 'rest' segments use the national leftover
  X.segMix = function (nat, cat, seg, year) {
    var mix = seg[2], out = {}, t = 0, g;
    if (mix === 'rest') {
      var used = {}; mix = {};
      cat.segs.forEach(function (o) { if (o[2] === 'rest') return; for (var k in o[2]) used[k] = (used[k] || 0) + o[2][k] * U.segSize(o, year); });
      U.GROUPS.forEach(function (k) { mix[k] = Math.max(0.002, nat.groups[k].size - (used[k] || 0)); });
    }
    U.GROUPS.forEach(function (k) { out[k] = mix[k] || 0; t += out[k]; });
    // the base groups are coarse (a young union member exists even though 'young' and
    // 'union' are separate groups), so every segment keeps some presence in every group
    var nt = 0; U.GROUPS.forEach(function (k) { nt += nat.groups[k].size; });
    for (g in out) out[g] = 0.8 * out[g] / t + 0.2 * nat.groups[g].size / nt;
    return out;
  };

  // picks: [[categoryId, segmentIndex], ...]. Returns {shares, size (% of the place's voters), small}
  X.query = function (P, geoKey, picks) {
    var geo = P.geo(geoKey), w = {}, tilt = {}, gsize = {};
    U.GROUPS.forEach(function (g) { w[g] = geo.mix[g]; gsize[g] = P.nat.groups[g].size / 100; });
    (picks || []).forEach(function (pk) {
      var cat = U.DEMO_CATEGORIES.filter(function (c) { return c.id === pk[0]; })[0], seg = cat && cat.segs[pk[1]]; if (!seg) return;
      var m = X.segMix(P.nat, cat, seg, P.year), sz = U.segSize(seg, P.year), tl = U.segTilt(seg, P.year);
      U.GROUPS.forEach(function (g) { w[g] *= (sz / 100) * m[g] / (gsize[g] || 1e-6); }); // P(segment | group), approximately
      for (var p in tl) tilt[p] = (tilt[p] || 1) * tl[p];
    });
    var size = 0; U.GROUPS.forEach(function (g) { size += w[g]; });
    var out = {}, tot = 0;
    U.GROUPS.forEach(function (g) { var k = size ? w[g] / size : 0; for (var p in geo.shares[g]) out[p] = (out[p] || 0) + geo.shares[g][p] * k; });
    for (var p in out) { out[p] *= tilt[p] || 1; tot += out[p]; }
    for (p in out) out[p] = out[p] / tot * 100;
    return { shares: out, size: Math.min(100, size * 100), place: geo.name };
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
