// Vote model: voter groups -> state shares -> national shares.
// Layer 1: group preferences (+ campaign modifiers Q.mods[party][group]).
// Layer 2: state voter mix built from demographic indices + regional affinity.
// Layer 3: regional/federated parties take a home share in their states.
(function (G) {
  'use strict';
  var U = G.USA, V = U.Votes = {};

  // Regional affinity of national parties (multiplier). Scenario assumption.
  var REGION_AFF = {
    ldp: { NE: 1.25, MA: 1.15, PC: 1.2, SO: .85, PL: .8, MT: .9, MW: 1, TX: .9 },
    sdlp: { MW: 1.25, MA: 1.15, NE: 1.05, PC: 1.0, SO: .8, PL: .9, MT: .85, TX: .8 },
    cdp: { MW: 1.2, PL: 1.25, MA: 1.0, SO: .95, NE: .85, PC: .85, MT: 1.0, TX: .9 },
    cc: { SO: 1.25, PL: 1.1, MT: 1.2, TX: 1.1, MW: .95, MA: .85, NE: .75, PC: .75 },
    asp: { MT: 1.5, PL: 1.2, MW: 1.1, SO: .9, NE: .9, MA: .9, PC: .8, TX: .9 },
    ul: { PC: 1.4, NE: 1.3, MA: 1.1, MW: .95, SO: .7, PL: .7, MT: .9, TX: .7 },
    grn: { PC: 1.4, NE: 1.35, MA: 1.05, MW: .95, SO: .7, PL: .7, MT: 1.0, TX: .7 },
    dsa: { PC: 1.3, NE: 1.2, MA: 1.25, MW: 1.0, SO: .7, PL: .7, MT: .8, TX: .7 },
    wfp: { MA: 1.7, NE: 1.3, MW: 1.0, PC: .9, SO: .7, PL: .6, MT: .6, TX: .6 },
    cpusa: { MA: 1.3, MW: 1.25, PC: 1.1, NE: 1.0, SO: .8, PL: .6, MT: .6, TX: .7 },
    revsoc: { PC: 1.3, MA: 1.25, MW: 1.0, NE: 1.0, SO: .9, PL: .6, MT: .6, TX: .8 },
    reform: { MW: 1.25, PL: 1.2, TX: 1.2, MT: 1.1, SO: .9, MA: .9, NE: .9, PC: .8 },
    acp: { PC: 1.2, MA: 1.2, MW: 1.1, SO: .8, PL: .7, MT: .8, NE: 1.0, TX: .8 },
    lib: { MT: 1.4, PC: 1.1, NE: 1.15, PL: 1.0, SO: .85, MW: .9, MA: .85, TX: 1.1 },
    con: { SO: 1.3, PL: 1.2, MT: 1.2, MW: 1.0, TX: .9, MA: .7, NE: .6, PC: .7 }
  };
  // Utah/Idaho Mormon vote boosts the ASP (its Mormon Unity constituent).
  var STATE_AFF = { ASP_UT: 2.2, ASP_ID: 1.5 };

  V.mix = function (s) {
    var young = 0.09 + 0.06 * s.urban, m = { black: s.black, hisp: s.hisp, retire: s.old, young: young };
    var rest = Math.max(0.15, 1 - s.black - s.hisp - s.old - young);
    m.relig = rest * U.clamp((s.relig - 0.35) * 0.65, 0, 0.4);
    m.union = rest * s.union * 1.3;
    m.rural = rest * (1 - s.urban) * 0.85;
    m.prof = rest * s.urban * 0.3;
    m.suburb = Math.max(0, rest - m.relig - m.union - m.rural - m.prof);
    return m;
  };

  function allStates() { var a = []; for (var k in U.STATES) a.push(U.STATES[k]); a.push(U.DC); return a; }
  V.allStates = allStates;

  // Home share of a regional/federated party in a state (pct points).
  V.homeShare = function (Q, p, sid) {
    var h = U.PARTIES[p].home && U.PARTIES[p].home[sid];
    if (!h) { if (p === 'aga') h = 0.8; else return 0; }      // AGA has small chapters everywhere
    var m = (Q.homeMult && Q.homeMult[p] != null) ? Q.homeMult[p] : 1;
    var sm = (Q.stateMods && Q.stateMods[p] && Q.stateMods[p][sid]) || 0;
    return Math.max(0, h * m + sm);
  };

  // Vote shares (pct) of every active party in a state.
  V.stateShares = function (Q, s) {
    var mix = V.mix(s), raw = {}, tot = 0, reg = 0, out = {};
    U.NATIONAL.forEach(function (p) {
      if (Q.dormant && Q.dormant[p]) return;
      var P = U.PARTIES[p], v = 0;
      U.GROUPS.forEach(function (g) {
        var pref = P.pref[g] + ((Q.mods && Q.mods[p] && Q.mods[p][g]) || 0);
        v += mix[g] * Math.max(0.05, pref);
      });
      v *= (Q.calib ? Q.calib[p] : 1) * ((REGION_AFF[p] && REGION_AFF[p][s.region]) || 1);
      v *= STATE_AFF[P.short + '_' + s.id] || 1;
      var sm = (Q.stateMods && Q.stateMods[p] && Q.stateMods[p][s.id]) || 0;
      v *= Math.max(0.2, 1 + sm / 20);
      raw[p] = v; tot += v;
    });
    U.REGIONAL.forEach(function (p) { if (Q.dormant && Q.dormant[p]) return; var h = V.homeShare(Q, p, s.id); if (h > 0) { out[p] = h; reg += h; } });
    reg = Math.min(reg, 60);
    for (var p in raw) out[p] = raw[p] / tot * (100 - reg);
    return out;
  };

  V.national = function (Q) {
    var out = {}, P = 0;
    allStates().forEach(function (s) {
      var sh = V.stateShares(Q, s); P += s.pop;
      for (var p in sh) out[p] = (out[p] || 0) + sh[p] * s.pop;
    });
    for (var p in out) out[p] /= P;
    return out;
  };

  // Calibrate national parties to their target shares (run once at start).
  V.calibrate = function (Q) {
    Q.calib = {}; U.NATIONAL.forEach(function (p) { Q.calib[p] = 1; });
    var live = U.NATIONAL.filter(function (p) { return !(Q.dormant && Q.dormant[p]); });
    var tTot = live.reduce(function (s, p) { return s + U.PARTIES[p].target; }, 0);
    for (var it = 0; it < 6; it++) {
      var n = V.national(Q), nTot = live.reduce(function (s, p) { return s + (n[p] || 0); }, 0);
      live.forEach(function (p) { Q.calib[p] *= (U.PARTIES[p].target / tTot) / (n[p] / nTot); });
    }
  };

  // Add campaign effect: groups = {group: points}. Records the cause of the
  // change in the player's national share so briefings can explain it.
  V.campaign = function (Q, p, groups, reason) {
    var before = reason ? V.national(Q)[Q.player] : 0;
    Q.mods[p] = Q.mods[p] || {};
    // diminishing returns: repeated gains tire voters (fatigue decays monthly)
    Q.fatigue = Q.fatigue || {};
    var k = 1, tot = 0;
    for (var g in groups) if (groups[g] > 0) tot += groups[g];
    if (tot > 0) { k = 1 / (1 + (Q.fatigue[p] || 0) / 4); Q.fatigue[p] = (Q.fatigue[p] || 0) + tot; }
    for (g in groups) Q.mods[p][g] = (Q.mods[p][g] || 0) + (groups[g] > 0 ? groups[g] * k : groups[g]);
    if (reason) {
      var d = V.national(Q)[Q.player] - before;
      Q.causes[reason] = (Q.causes[reason] || 0) + d;
    }
  };
  V.all = function (v) { var o = {}; U.GROUPS.forEach(function (g) { o[g] = v; }); return o; };

  // Shares by district: each district is a pseudo-state whose demography is
  // drawn around the state's (urban core -> rural fringe, union towns, Black-
  // and Hispanic-majority seats), plus a local candidate-quality factor.
  // Deterministic per-district noise: a district keeps its character from one
  // election to the next (safe seats exist); only candidates vary.
  function hg(key) { var h = 2166136261; for (var i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
    var x = 0; for (var k = 0; k < 6; k++) { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; x += (h >>> 0) / 4294967296; } return x - 3; }
  V.hg = hg;
  V.districtProfile = function (s, i, n) {
    var D = U.DISTRICTS && U.DISTRICTS[s.id], u = D && D.u[i] != null ? D.u[i] : (n === 1 ? 0.5 : 1 - i / (n - 1));
    var d = 1 - 2 * u, key = s.id + i, g = function (t, k) { return hg(key + t) * k; };
    return {
      id: s.id, region: s.region,
      urban: U.clamp(s.urban - d * 0.7 + g('u', 0.12), 0.03, 1),
      relig: U.clamp(s.relig + d * 0.3 + g('r', 0.14), 0.05, 1),
      union: U.clamp(s.union * (1 + g('n', 0.5)), 0.01, 0.7),
      black: U.clamp(s.black * (1 - d * 1.1 + g('b', 0.5)), 0, 0.85),
      hisp: U.clamp(s.hisp * (1 - d * 0.8 + g('h', 0.5)), 0, 0.85),
      old: U.clamp(s.old + g('o', 0.04), 0.04, 0.32)
    };
  };
  // Real partisan lean (FiveThirtyEight, from presidential and legislative
  // results) relative to the state's average district: left parties gain
  // where the district votes more Democratic, right parties where it votes
  // more Republican. State totals are unaffected; variation within the state
  // follows real voting patterns.
  V.leanShift = function (s, i) {
    var L = U.DISTRICT_LEAN && U.DISTRICT_LEAN[s.id];
    if (!L || L[i] == null) return 0;
    var m = 0; L.forEach(function (x) { m += x; }); m /= L.length;
    return L[i] - m;
  };
  V.leftWeight = function (Q, p) { var P = (Q.pos && Q.pos[p]) || U.PARTIES[p]; return U.clamp(-(P.econ + P.soc) / 12, -1, 1); };
  // noNoise: deterministic estimate (for display; does not use the game RNG)
  V.districtShares = function (Q, s, sh, i, n, noNoise) {
    var base = V.stateShares(Q, V.districtProfile(s, i, n)), out = {}, tot = 0, lean = V.leanShift(s, i);
    for (var p in sh) {
      var v = base[p] != null ? base[p] : sh[p];
      v *= Math.exp(0.013 * lean * V.leftWeight(Q, p));
      // local strongholds and the candidate on the ballot
      v *= (1 + hg(s.id + i + p) * 0.15) * (noNoise ? 1 : 1 + U.gauss(Q) * 0.08);
      out[p] = Math.max(0.01, v); tot += out[p];
    }
    for (p in out) out[p] = out[p] / tot * 100;
    return out;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
