// Elections: House (435 districts + 365 statewide PR + DC), Senate (4 routes
// per state), state governments, and the two-round Electoral College.
(function (G) {
  'use strict';
  var U = G.USA, E = U.Electoral, V = U.Votes, R = U.RULES, X = U.Elections = {};

  X.apportion = function () {
    if (X._app) return X._app;
    var pops = {}; for (var k in U.STATES) pops[k] = U.STATES[k].pop;
    var d = {};
    if (R.house.apportionment === 'map' && U.DISTRICTS) { for (k in U.STATES) d[k] = U.DISTRICTS[k].cells.length; }
    else d = E.hamilton(pops, R.house.districtSeats, R.house.minDistrictPerState);
    var pr = E.hamilton(pops, R.house.prSeats, R.house.minPrPerState);
    var el = {}; for (k in U.STATES) el[k] = R.president.electors === 'house-plus-senate' ? d[k] + pr[k] + R.senate.perState : d[k] + pr[k];
    el.DC = R.president.dcElectors;
    X._app = { district: d, pr: pr, electors: el };
    return X._app;
  };

  X.pos = function (Q) {
    var o = {}; U.ALL_PARTIES.forEach(function (p) { o[p] = (Q.pos && Q.pos[p]) || U.PARTIES[p]; }); return o;
  };
  // Electoral pacts raise transfers between partners (brief §4.7). Voters do
  // not follow instructions perfectly: the multiplier is bounded.
  X.pactFn = function (Q) {
    return function (a, b) {
      return (Q.pacts || []).some(function (pk) { return pk.parties.indexOf(a) >= 0 && pk.parties.indexOf(b) >= 0; }) ? 2.5 : 1;
    };
  };
  // Joint candidates: in a pact, the weaker party in a district stands down.
  function applyJoint(Q, sh) {
    var out = U.clone(sh);
    (Q.pacts || []).forEach(function (pk) {
      if (pk.type !== 'joint') return;
      var present = pk.parties.filter(function (p) { return out[p] > 0; });
      if (present.length < 2) return;
      present.sort(function (a, b) { return out[b] - out[a]; });
      present.slice(1).forEach(function (w) { out[present[0]] += out[w] * 0.75; delete out[w]; });
    });
    return out;
  }

  // Regional stand-down agreements (brief §4.7): a party does not field
  // district candidates in the agreed states. Its voters mostly follow the
  // agreement (70% to the partner), the rest choose by ideology or abstain.
  X.REGION_SETS = {
    rustbelt: ['MI', 'OH', 'IN', 'WI', 'PA', 'WV'],
    neatlantic: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'DE', 'MD', 'DC'],
    south: ['AL', 'AR', 'FL', 'GA', 'KY', 'LA', 'MS', 'NC', 'OK', 'SC', 'TN', 'VA', 'WV', 'TX'],
    liberal: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'DE', 'MD', 'DC', 'CA', 'OR', 'WA', 'HI', 'IL'],
    pacific: ['CA', 'OR', 'WA', 'HI', 'AK'], midwest: ['IL', 'IN', 'IA', 'MI', 'MN', 'MO', 'OH', 'WI'],
    plains: ['KS', 'NE', 'ND', 'SD', 'IA', 'MO'], mountain: ['AZ', 'CO', 'ID', 'MT', 'NV', 'NM', 'UT', 'WY']
  };
  X.REGION_NAMES = { rustbelt: 'the Rust Belt', neatlantic: 'New England and the Atlantic states', south: 'the South', liberal: 'the liberal states',
    pacific: 'the Pacific states', midwest: 'the Midwest', plains: 'the Plains', mountain: 'the Mountain West' };
  X.standsDown = function (Q, p, sid) {
    return (Q.standDowns || []).filter(function (a) { return a.party === p && X.REGION_SETS[a.region].indexOf(sid) >= 0; })[0];
  };
  function applyStandDowns(Q, sid, sh) {
    var out = sh, pos = X.pos(Q);
    (Q.standDowns || []).forEach(function (a) {
      if (!out[a.party] || X.REGION_SETS[a.region].indexOf(sid) < 0 || !out[a.partner]) return;
      if (out === sh) out = U.clone(sh);
      var v = out[a.party]; delete out[a.party];
      out[a.partner] += v * 0.7;
      var others = Object.keys(out).filter(function (q) { return q !== a.partner; }), ws = others.map(function (q) { return Math.exp(-E.dist(pos[a.party], pos[q]) / 3); }), wt = ws.reduce(function (x, y) { return x + y; }, 0);
      others.forEach(function (q, i) { out[q] += v * 0.15 * ws[i] / wt; }); // 15% elsewhere, 15% stay home
    });
    return out;
  }
  X.applyStandDowns = applyStandDowns;

  // Full House election. Returns {house, districts, pr, byState}.
  X.house = function (Q) {
    var app = X.apportion(), pos = X.pos(Q), pact = X.pactFn(Q), house = {}, byState = {}, districts = [], prOut = {};
    function add(p, n) { house[p] = (house[p] || 0) + n; }
    V.allStates().forEach(function (s) {
      var sh = V.stateShares(Q, s), st = byState[s.id] = { shares: sh, district: {}, pr: {} };
      var nd = s.id === 'DC' ? R.house.dcSeats : app.district[s.id];
      for (var i = 0; i < nd; i++) {
        var ds = applyJoint(Q, applyStandDowns(Q, s.id, V.districtShares(Q, s, sh, i, nd)));
        var r = E.twoRound(ds, pos, { majority: R.house.districtFirstRoundMajority, pactWith: pact });
        r.state = s.id; r.n = i + 1; districts.push(r);
        st.district[r.winner] = (st.district[r.winner] || 0) + 1; add(r.winner, 1);
      }
      if (s.id !== 'DC') {
        var pr = E.divisor(sh, app.pr[s.id], R.house.prFormula, R.house.prThreshold);
        st.pr = pr; for (var p in pr) if (pr[p]) { add(p, pr[p]); prOut[p] = (prOut[p] || 0) + pr[p]; }
      }
    });
    return { house: house, districts: districts, pr: prOut, byState: byState };
  };

  // State governments: governor (two-round), state house (constituency PR),
  // state senate (statewide PR, 5% threshold). Unicameral: house only.
  X.stateGov = function (Q, s, prev) {
    var sh = V.stateShares(Q, s), pos = X.pos(Q), g = {};
    var gs = U.clone(sh);
    if (prev && prev.governor && gs[prev.governor]) gs[prev.governor] *= 1.12; // incumbency
    for (var p in gs) gs[p] *= 1 + 0.15 * U.gauss(Q) / 2;
    g.govRace = E.twoRound(gs, pos, { majority: R.governor.firstRoundMajority, pactWith: X.pactFn(Q) });
    g.governor = g.govRace.winner;
    g.house = {};
    var mags = 4;
    for (var i = 0; i < mags; i++) {
      var cs = V.districtShares(Q, s, sh, i, mags);
      var seats = E.divisor(cs, R.stateHouse.magnitude, R.stateHouse.formula, R.stateHouse.threshold);
      for (p in seats) g.house[p] = (g.house[p] || 0) + seats[p];
    }
    if (!s.unicameral) g.senate = E.divisor(sh, R.stateSenate.seats, R.stateSenate.formula, R.stateSenate.threshold);
    // presiding officers: the party leading the chamber's majority
    g.houseSpeaker = X.chamberChoice(Q, g.house);
    if (g.senate) g.senateSpeaker = X.chamberChoice(Q, g.senate);
    return g;
  };

  // Who a chamber appoints: a majority party, else the largest member of the
  // most compatible majority combination (veto-respecting).
  X.chamberChoice = function (Q, seats) {
    var tot = U.sum(seats), pos = X.pos(Q);
    var order = Object.keys(seats).filter(function (p) { return seats[p] > 0; }).sort(function (a, b) { return seats[b] - seats[a]; });
    if (!order.length) return null;
    if (seats[order[0]] * 2 > tot) return order[0];
    var best = null, bestScore = -1e9;
    order.slice(0, 3).forEach(function (lead) {
      var coal = [lead], n = seats[lead];
      order.filter(function (p) { return p !== lead; })
        .sort(function (a, b) { return E.dist(pos[a], pos[lead]) - E.dist(pos[b], pos[lead]); })
        .forEach(function (p) {
          if (n * 2 > tot) return;
          if (coal.some(function (c) { return U.vetoes(c, p); })) return;
          coal.push(p); n += seats[p];
        });
      if (n * 2 > tot) {
        var score = seats[lead] * 2 - coal.length * 5;
        if (score > bestScore) { bestScore = score; best = lead; }
      }
    });
    return best || order[0];
  };

  X.appointments = function (Q, sid) {
    var sg = Q.states[sid], s = U.STATES[sid];
    var govPick = sg.governor;
    if (s.unicameral) return { gov: govPick, house: govPick, senate: govPick };
    return { gov: govPick, house: X.chamberChoice(Q, sg.house), senate: X.chamberChoice(Q, sg.senate) };
  };

  // Senate update after a general election. Direct seats due by class.
  X.senate = function (Q, electionNo) {
    var pos = X.pos(Q), races = [];
    var dueClass = electionNo % R.senate.directClasses;
    Object.keys(U.STATES).forEach(function (sid, idx) {
      var seats = Q.senateSeats.filter(function (x) { return x.state === sid; });
      var direct = seats.filter(function (x) { return x.type === 'direct'; })[0];
      if (idx % R.senate.directClasses === dueClass) {
        var sh = V.stateShares(Q, U.STATES[sid]);
        if (direct.party && sh[direct.party]) sh[direct.party] *= 1.08;
        var r = E.twoRound(sh, pos, { majority: R.senate.directFirstRoundMajority, pactWith: X.pactFn(Q) });
        r.state = sid; races.push(r); direct.party = r.winner;
      }
      var ap = X.appointments(Q, sid);
      seats.forEach(function (x) { if (x.type !== 'direct' && ap[x.type]) x.party = ap[x.type]; });
    });
    return races;
  };

  X.senateCount = function (Q) {
    var o = {}; Q.senateSeats.forEach(function (x) { o[x.party] = (o[x.party] || 0) + 1; }); return o;
  };

  // ---- Presidential election (two-round Electoral College) ----
  // cands: [{id, party, name, backers:[parties], appeal}]
  X.candidateVotes = function (Q, s, cands) {
    var sh = V.stateShares(Q, s), pos = X.pos(Q), out = {};
    cands.forEach(function (c) { out[c.id] = 0; });
    for (var p in sh) {
      var own = cands.filter(function (c) { return c.party === p; })[0];
      var backed = cands.filter(function (c) { return c.backers.indexOf(p) >= 0; })[0];
      if (own) { out[own.id] += sh[p] * (0.92 + 0.04 * (own.appeal || 0)); continue; }
      if (backed) { out[backed.id] += sh[p] * 0.8; }
      var ws = cands.map(function (c) { return Math.exp(-E.dist(pos[p], pos[c.party]) / 3) * (1 + 0.1 * (c.appeal || 0)); });
      var wt = ws.reduce(function (a, b) { return a + b; }, 0), rest = sh[p] * (backed ? 0.15 : 0.75);
      cands.forEach(function (c, i) { out[c.id] += rest * ws[i] / wt; });
    }
    return out;
  };
  X.allocate = function (votes, electors) {
    if (U.RULES.president.allocation === 'winner-take-all') {
      var w = Object.keys(votes).sort(function (a, b) { return votes[b] - votes[a]; })[0], o = {}; o[w] = electors; return o;
    }
    return E.hamilton(votes, electors, 0);
  };
  // Rank candidates by electors, then national popular vote, then a coin flip.
  function rank(Q, ev, pop, ids) {
    var coin = {}; ids.forEach(function (c) { coin[c] = U.rng(Q); });
    return ids.slice().sort(function (a, b) { return (ev[b] || 0) - (ev[a] || 0) || (pop[b] || 0) - (pop[a] || 0) || coin[b] - coin[a]; });
  }
  function round(Q, cands) {
    var app = X.apportion(), ev = {}, pop = {}, bs = {}, total = 0;
    V.allStates().forEach(function (s) {
      var v = X.candidateVotes(Q, s, cands), el = app.electors[s.id]; total += el;
      var a = X.allocate(v, el); bs[s.id] = { votes: v, ev: a };
      for (var c in a) ev[c] = (ev[c] || 0) + a[c];
      for (c in v) pop[c] = (pop[c] || 0) + v[c] * s.pop;
    });
    var P = 0; V.allStates().forEach(function (s) { P += s.pop; });
    for (var c in pop) pop[c] /= P;
    return { ev: ev, pop: pop, byState: bs, total: total };
  }
  // The presidential election always has two rounds: the top two in electors
  // meet head to head, and the winner of that round takes the presidency.
  X.president = function (Q, cands) {
    var r = round(Q, cands), ids = cands.map(function (c) { return c.id; });
    var order = rank(Q, r.ev, r.pop, ids);
    var res = { total: r.total, need: Math.floor(r.total / 2) + 1, r1: r.ev, pop1: r.pop, byState: r.byState, cands: cands, order1: order };
    var fin = cands.filter(function (c) { return c.id === order[0] || c.id === order[1]; });
    if (fin.length < 2) { res.winner = order[0]; res.round = 1; return res; }
    var r2 = round(Q, fin), o2 = rank(Q, r2.ev, r2.pop, fin.map(function (c) { return c.id; }));
    res.r2 = r2.ev; res.pop2 = r2.pop; res.byState2 = r2.byState; res.round = 2; res.winner = o2[0];
    res.tiebreak = (r2.ev[o2[0]] || 0) === (r2.ev[o2[1]] || 0) ? ((r2.pop[o2[0]] || 0) === (r2.pop[o2[1]] || 0) ? 'coin' : 'popular vote') : null;
    return res;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
