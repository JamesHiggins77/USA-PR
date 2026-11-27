// Monthly routine: economy, attribution of responsibility, AI party moves,
// coalition stability, budgets, confidence votes, elections and formation.
(function (G) {
  'use strict';
  var U = G.USA, V = U.Votes, X = U.Elections, C = U.Coalition, S = U.Game = U.Game || {};

  S.now = function (Q) { return U.monthIndex(Q.year, Q.month); };
  S.note = function (Q, text) { Q.log.push({ t: U.dateStr(Q), text: text }); Q.report.push(text); };
  S.inGov = function (Q, p) { return Q.gov && Q.gov.coalition.indexOf(p || Q.player) >= 0; };
  S.supportsGov = function (Q, p) { return S.inGov(Q, p) || (Q.gov && Q.gov.cs.indexOf(p || Q.player) >= 0); };
  S.pmIsPlayer = function (Q) { return Q.gov && Q.gov.pmParty === Q.player; };
  // Whichever organisation currently carries the Green vote
  S.greenId = function (Q) { return Q.dormant.grn ? 'ul' : 'grn'; };
  S.live = function (Q, p) { return !Q.dormant[p]; };

  // Move everything a party holds (seats, senators, state offices, government
  // roles, pacts) to another party when it merges or is absorbed.
  S.remap = function (Q, from, to) {
    if (Q.house[from]) { Q.house[to] = (Q.house[to] || 0) + Q.house[from]; delete Q.house[from]; }
    Q.senateSeats.forEach(function (x) { if (x.party === from) x.party = to; });
    for (var hs in (Q.houseByState || {})) { var dd = Q.houseByState[hs]; if (dd[from]) { dd[to] = (dd[to] || 0) + dd[from]; delete dd[from]; } }
    if (Q.lastPresidential) { Q.lastPresidential.cands.forEach(function (c) { if (c.party === from) c.party = to; }); }
    for (var sid in Q.states) {
      var st = Q.states[sid]; if (st.governor === from) st.governor = to;
      ['house', 'senate'].forEach(function (c) { if (st[c] && st[c][from]) { st[c][to] = (st[c][to] || 0) + st[c][from]; delete st[c][from]; } });
    }
    if (Q.gov) ['coalition', 'cs'].forEach(function (k) {
      if (Q.gov[k].indexOf(from) >= 0) { Q.gov[k] = Q.gov[k].filter(function (p) { return p !== from; }); if (Q.gov.coalition.indexOf(to) < 0 && Q.gov[k].indexOf(to) < 0) Q.gov[k].push(to); }
      if (Q.gov.posts && Q.gov.posts[from]) { Q.gov.posts[to] = (Q.gov.posts[to] || 0) + Q.gov.posts[from]; delete Q.gov.posts[from]; }
    });
    (Q.pacts || []).forEach(function (k) { k.parties = k.parties.map(function (p) { return p === from ? to : p; }); });
    (Q.pendingConcessions || []).forEach(function (c) { if (c.party === from) c.party = to; });
  };

  // Merge member parties into an alliance/party. retention: share of the
  // members' combined vote the merged list keeps.
  S.mergeInto = function (Q, members, into, retention) {
    var n = V.national(Q), X = 0, wsum = 0, pos = { econ: 0, soc: 0, fed: 0 }, w = {};
    members.forEach(function (m) { X += n[m] || 0; });
    if (!Q.dormant[into]) X += n[into] || 0;
    members.forEach(function (m) {
      var s = n[m] || 0.01; w[m] = s; wsum += s;
      ['econ', 'soc', 'fed'].forEach(function (k) { pos[k] += Q.pos[m][k] * s; });
    });
    if (Q.dormant[into]) { ['econ', 'soc', 'fed'].forEach(function (k) { Q.pos[into][k] = pos[k] / wsum; }); }
    U.ALL_PARTIES.forEach(function (q) {
      if (members.indexOf(q) >= 0 || q === into) return;
      var r = 0; members.forEach(function (m) { r += C.rel(Q, m, q) * w[m] / wsum; });
      if (Q.dormant[into]) C.addRel(Q, into, q, r - C.rel(Q, into, q));
    });
    members.forEach(function (m) { Q.dormant[m] = true; S.remap(Q, m, into); });
    Q.dormant[into] = false; Q.mods[into] = Q.mods[into] || {}; Q.calib[into] = Q.calib[into] || 1;
    var n2 = V.national(Q); Q.calib[into] *= (X * retention) / Math.max(0.05, n2[into] || 0.05);
    return w;
  };

  // Whichever organisation currently carries the Green vote
  S.greenId = function (Q) { return Q.dormant.grn ? 'ul' : 'grn'; };
  S.live = function (Q, p) { return !Q.dormant[p]; };

  // Move everything a party holds (seats, senators, state offices, government
  // roles, pacts) to another party when it merges or is absorbed.
  S.remap = function (Q, from, to) {
    if (Q.house[from]) { Q.house[to] = (Q.house[to] || 0) + Q.house[from]; delete Q.house[from]; }
    Q.senateSeats.forEach(function (x) { if (x.party === from) x.party = to; });
    for (var sid in Q.states) {
      var st = Q.states[sid]; if (st.governor === from) st.governor = to;
      ['house', 'senate'].forEach(function (c) { if (st[c] && st[c][from]) { st[c][to] = (st[c][to] || 0) + st[c][from]; delete st[c][from]; } });
    }
    if (Q.gov) ['coalition', 'cs'].forEach(function (k) {
      if (Q.gov[k].indexOf(from) >= 0) { Q.gov[k] = Q.gov[k].filter(function (p) { return p !== from; }); if (Q.gov.coalition.indexOf(to) < 0 && Q.gov[k].indexOf(to) < 0) Q.gov[k].push(to); }
      if (Q.gov.posts && Q.gov.posts[from]) { Q.gov.posts[to] = (Q.gov.posts[to] || 0) + Q.gov.posts[from]; delete Q.gov.posts[from]; }
    });
    (Q.pacts || []).forEach(function (k) { k.parties = k.parties.map(function (p) { return p === from ? to : p; }); });
    (Q.pendingConcessions || []).forEach(function (c) { if (c.party === from) c.party = to; });
  };

  // Merge member parties into an alliance/party. retention: share of the
  // members' combined vote the merged list keeps.
  S.mergeInto = function (Q, members, into, retention) {
    var n = V.national(Q), X = 0, wsum = 0, pos = { econ: 0, soc: 0, fed: 0 }, w = {};
    members.forEach(function (m) { X += n[m] || 0; });
    if (!Q.dormant[into]) X += n[into] || 0;
    members.forEach(function (m) {
      var s = n[m] || 0.01; w[m] = s; wsum += s;
      ['econ', 'soc', 'fed'].forEach(function (k) { pos[k] += Q.pos[m][k] * s; });
    });
    if (Q.dormant[into]) { ['econ', 'soc', 'fed'].forEach(function (k) { Q.pos[into][k] = pos[k] / wsum; }); }
    U.ALL_PARTIES.forEach(function (q) {
      if (members.indexOf(q) >= 0 || q === into) return;
      var r = 0; members.forEach(function (m) { r += C.rel(Q, m, q) * w[m] / wsum; });
      if (Q.dormant[into]) C.addRel(Q, into, q, r - C.rel(Q, into, q));
    });
    members.forEach(function (m) { Q.dormant[m] = true; S.remap(Q, m, into); });
    Q.dormant[into] = false; Q.mods[into] = Q.mods[into] || {}; Q.calib[into] = Q.calib[into] || 1;
    var n2 = V.national(Q); Q.calib[into] *= (X * retention) / Math.max(0.05, n2[into] || 0.05);
    return w;
  };

  S.govSeats = function (Q) { return Q.gov ? C.seats(Q, Q.gov.coalition.concat(Q.gov.cs)) : 0; };

  // ---- economy (brief §8.2). Shocks are probabilistic, never scripted ----
  S.economy = function (Q) {
    var e = Q.econ, now = S.now(Q);
    if (!e.busted && now >= U.monthIndex(2000, 3) && U.rng(Q) < 0.07) {
      e.busted = true; e.shock = -3.5; S.note(Q, 'The technology-stock bubble bursts. Markets fall sharply.');
      Q.flags.bust = now;
    }
    // a financial crash lingers: its shock fades slowly for about two and a half years
    if (e.shock) { e.shock *= (e.slowShock && now < e.slowShock) ? 0.97 : 0.93; if (Math.abs(e.shock) < 0.1) e.shock = 0; }
    var trend = 3.0 + (e.bubble && !e.busted ? 1.2 : 0) + (e.shock || 0) + (Q.policyGrowth || 0);
    e.growth = U.round1(e.growth + (trend - e.growth) * 0.15 + U.gauss(Q) * 0.25);
    var nat = 5.2 - (e.growth - 3) * 0.6;
    e.unemp = U.round1(U.clamp(e.unemp + (nat - e.unemp) * 0.08 + U.gauss(Q) * 0.05, 2.5, 14));
    e.infl = U.round1(U.clamp(e.infl + ((2.3 + (e.growth - 3) * 0.3) - e.infl) * 0.1 + U.gauss(Q) * 0.08, -1, 10));
    var structural = (Q.spending || 0);
    e.deficit = U.round1(e.deficit + ((structural - (e.growth - 3) * 0.6 - 0.5) - e.deficit) * 0.08);
    e.debt = U.round1(e.debt + e.deficit / 12);
  };

  // Voters attribute performance differently by group and office (brief §8.3).
  S.attribution = function (Q) {
    var e = Q.econ;
    var score = { prof: (e.growth - 2.8) * 0.5, suburb: (e.growth - 2.8) * 0.3 - (e.infl - 2.5) * 0.3,
      union: -(e.unemp - 5) * 0.6, rural: (e.growth - 2.8) * 0.2 - (e.infl - 2.5) * 0.2, relig: 0,
      black: -(e.unemp - 5) * 0.5, hisp: -(e.unemp - 5) * 0.5, young: -(e.unemp - 5) * 0.3 + (e.growth - 2.8) * 0.2,
      retire: -(e.infl - 2.5) * 0.6 };
    var g = Q.gov; if (!g) return;
    var parts = [[g.pmParty, 0.5]];
    var others = g.coalition.filter(function (p) { return p !== g.pmParty; });
    others.forEach(function (p) { parts.push([p, 0.3 / Math.max(1, others.length)]); });
    if (Q.president.party && U.PARTIES[Q.president.party]) parts.push([Q.president.party, 0.15]);
    parts.forEach(function (pp) {
      var m = {}; for (var k in score) m[k] = score[k] * pp[1] * 0.08;
      V.campaign(Q, pp[0], m, pp[0] === Q.player ? 'Economy (credit/blame for the government)' : null);
    });
    var econIdx = (e.growth - 2.5) * 4 - (e.unemp - 5) * 4 - Math.max(0, e.infl - 3) * 3;
    Q.govApproval = U.clamp(Q.govApproval + (50 + econIdx - Q.govApproval) * 0.08 + U.gauss(Q) * 1.2 - (Q.scandal || 0), 10, 85);
    Q.president.approval = U.clamp(Q.president.approval + (55 + econIdx * 0.7 - Q.president.approval) * 0.06 + U.gauss(Q), 15, 85);
    Q.scandal = Math.max(0, (Q.scandal || 0) - 0.5);
  };

  // Non-player parties campaign, drift and react (brief §16).
  // Polls move more: each party has a party-wide swing (a mean-reverting random
  // walk). Its voter base sets a floor and a ceiling, which drift slowly with its
  // support; in the Great Recession and the COVID years the bases themselves move fast.
  S.realigning = function (Q) { var t = S.now(Q); return (t >= U.monthIndex(2008, 9) && t <= U.monthIndex(2010, 12)) || (t >= U.monthIndex(2020, 3) && t <= U.monthIndex(2021, 12)); };
  S.pollSwings = function (Q) {
    var n = V.national(Q), re = S.realigning(Q);
    Q.swing = Q.swing || {}; Q.base = Q.base || {};
    if (re && !Q.flags['realign' + Q.year]) { Q.flags['realign' + Q.year] = 1; if (Q.year === 2008 || Q.year === 2020) S.note(Q, (Q.year === 2008 ? 'The financial crash' : 'The pandemic') + ' is shaking up party loyalties: pollsters say voters\u2019 old attachments are breaking down.'); }
    U.ALL_PARTIES.forEach(function (p) {
      if (Q.dormant[p] || n[p] == null) return;
      var P = U.PARTIES[p], m = Q.mods[p] = Q.mods[p] || {}, s = n[p];
      var b = Q.base[p] = Q.base[p] || { lo: s * 0.6, hi: s * 1.6 + 1 };
      var sw = Q.swing[p] || 0, d = -(re ? 0.015 : 0.03) * sw + U.gauss(Q) * (re ? 0.1 : 0.05);
      if (s < b.lo) d += 0.04 * (b.lo - s) / Math.max(0.5, b.lo);    // the base holds
      if (s > b.hi) d -= 0.04 * (s - b.hi) / Math.max(0.5, b.hi);    // and limits growth
      Q.swing[p] = sw + d;
      U.GROUPS.forEach(function (g) { m[g] = (m[g] || 0) + d * ((P.pref && P.pref[g]) || 1); });
      var rate = re ? 0.08 : 0.01;   // bases follow support slowly, fast in a realignment
      b.lo += (s * 0.6 - b.lo) * rate; b.hi += (s * 1.6 + 1 - b.hi) * rate;
    });
  };
  S.aiParties = function (Q) {
    U.ALL_PARTIES.forEach(function (p) {
      if (Q.dormant[p]) return;
      var m = Q.mods[p] = Q.mods[p] || {};
      U.GROUPS.forEach(function (g) {
        m[g] = (m[g] || 0) * 0.985 + (p === Q.player && !Q.zero ? 0 : U.gauss(Q) * 0.2);
      });
      Q.fatigue && Q.fatigue[p] && (Q.fatigue[p] *= 0.8);
      // AI parties campaign too: a monthly push among their best groups,
      // stronger during election campaigns
      if ((p !== Q.player || Q.zero) && U.PARTIES[p].pref) {
        var best = U.GROUPS.slice().sort(function (a, b) { return U.PARTIES[p].pref[b] - U.PARTIES[p].pref[a]; }).slice(0, 3);
        var push = (Q.electionAt ? 0.5 : 0.25) * (0.5 + U.rng(Q)) * Math.sqrt(U.PARTIES[p].target || 2) / 3;
        var o = {}; o[U.pick(Q, best)] = push; o[U.pick(Q, U.GROUPS)] = push * 0.5;
        V.campaign(Q, p, o, null);
      }
      if (U.PARTIES[p].home) Q.homeMult[p] = U.clamp((Q.homeMult[p] == null ? 1 : Q.homeMult[p]) + U.gauss(Q) * 0.015, 0.3, 3);
    });
    S.pollSwings(Q);
    // The Nader surge (designer canon): through 1999-2000 the Greens, or the
    // United Left if the Greens have joined it, climb towards a target of
    // 6-9% (Q.naderTarget, moved by the LDP's responses), drawing mainly on
    // LDP and SDLP voters. The pull fades after 2000.
    S.naderSurge(Q);
    // Discontent accumulates under long, broad coalitions and weak economies
    var gc = Q.gov && Q.gov.coalition.length >= 3 ? 0.15 : 0;
    Q.discontent = U.clamp(Q.discontent + gc + (Q.econ.unemp - 5.5) * 0.1 + (40 - Q.govApproval) * 0.01, 0, 100);
    // Reform fades after the Perot era; if it stays weak it joins the ASP
    if (!Q.dormant.reform && Q.year >= 2000) {
      V.campaign(Q, 'reform', V.all(-0.03), null);
      var rs = V.national(Q).reform || 0;
      Q.reformLow = rs < 2.6 ? (Q.reformLow || 0) + 1 : 0;
      if (Q.reformLow >= 6) {
        var rInto = Q.dormant.asp ? 'cdp' : 'asp';
        S.mergeInto(Q, ['reform'], rInto, 0.85);
        S.note(Q, 'With its polling below 3% for six months, the Reform Party votes to join the ' + U.PARTIES[rInto].name + (rInto === 'asp' ? ' as a constituent party' : '') + '. Its MPs now sit with the ' + U.PARTIES[rInto].short + '.');
        if (rInto === 'asp') Q.flags.reformAbsorbed = S.now(Q); else Q.flags.reformToCdp = S.now(Q);
      }
    }
    // The United Left holds together only while its members agree
    if (!Q.dormant.ul) Q.ulUnity = U.clamp(Q.ulUnity + U.gauss(Q) * 1.5 - (S.inGov(Q, 'ul') ? 0.6 : 0.1), 0, 100);
    // A syncretic communist party emerges only in the 2020s
    if (Q.dormant.acp && Q.year >= 2021 && U.rng(Q) < 0.03 + Q.discontent / 3000) S.activate(Q, 'acp', 1 + Q.discontent / 40);
    // The United Left holds together only while its members agree
    if (!Q.dormant.ul) Q.ulUnity = U.clamp(Q.ulUnity + U.gauss(Q) * 1.5 - (S.inGov(Q, 'ul') ? 0.6 : 0.1), 0, 100);
    // A syncretic communist party emerges only in the 2020s
    if (Q.dormant.acp && Q.year >= 2021 && U.rng(Q) < 0.03 + Q.discontent / 3000) S.activate(Q, 'acp', 1 + Q.discontent / 40);
    // Dormant populist right can emerge from 2015 if conditions allow
    S.magaArc(Q); S.ulSurge(Q); S.uniqueLeaders(Q);
    S.newParties(Q);
  };

  S.naderSurge = function (Q) {
    var start = U.monthIndex(1999, 1), peak = U.monthIndex(2000, 7), end = U.monthIndex(2000, 12), now = S.now(Q);
    var sw = Q.surge = Q.surge || { frac: 0 };
    sw.to = S.greenId(Q);
    if (now > end) { sw.frac *= 0.98; return; }           // after 2000 the switchers drift back slowly
    if (now < start) return;
    if (sw.to === 'ul' && !(Q.ulMembers && Q.ulMembers.grn)) { sw.frac *= 0.9; return; } // Nader is not in the UL
    if (Q.naderTarget == null) Q.naderTarget = 7.5;
    var tgt = U.clamp(Q.naderTarget, 6, 9), base = 2.5;
    var want = base + (tgt - base) * Math.min(1, (now - start) / (peak - start));
    var n = V.national(Q), cur = n[sw.to] || 0, pool = (n.ldp || 0) + (n.sdlp || 0);
    if (pool > 0) sw.frac = U.clamp(sw.frac + (want - cur) / pool * 0.6 + U.gauss(Q) * 0.002, 0, 0.35);
  };

  // MPs who walk out to a new party
  // A repeat election after failed talks: voters punish the caretaker government and
  // the President, and many supporters of small parties lend their vote to the
  // nearest large party to deliver a stable majority (for this election only).
  // After a repeat election, with another one looming, MPs who fear for their seats
  // will back a unity government: a technocratic cabinet under the leader of the
  // largest party, supported by every party that can stomach it.
  S.unityGovernment = function (Q) {
    var hs = Q.house, L = Object.keys(hs).filter(function (p) { return hs[p] && U.PARTIES[p] && !Q.dormant[p]; }).sort(function (a, b) { return hs[b] - hs[a]; })[0];
    if (!L) return false;
    var others = Object.keys(hs).filter(function (p) { return p !== L && hs[p] && U.PARTIES[p] && !Q.dormant[p] && !U.vetoes(L, p) && !U.vetoes(p, L); })
      .sort(function (a, b) { return C.compat(Q, L, b) - C.compat(Q, L, a) || hs[b] - hs[a]; });
    var coal = [L], seats = hs[L], need = U.majority();
    for (var i = 0; i < others.length && seats < need; i++) if (C.compat(Q, L, others[i]) >= 0.2) { coal.push(others[i]); seats += hs[others[i]]; }
    var fear = Math.min(0.8, 0.3 + 0.2 * (Q.repeats || 1));
    var decide = function (p) { if (coal.indexOf(p) >= 0) return 'yes'; if (U.vetoes(p, L)) return 'no'; return U.rng(Q) < fear ? 'abstain' : 'no'; };
    var c = U.Parliament.count(Q, 'house', decide), pm = S.leaderOf(Q, L);
    Q.lastVote = { title: 'Investiture of ' + pm + ' (unity government)', house: c, kind: 'investiture', need: 'simple', passed: c.yes > c.no };
    if (c.yes <= c.no) { S.note(Q, 'A unity government under ' + pm + ' fails in the House, ' + c.yes + ' to ' + c.no + '.'); return false; }
    var deal = { pm: L, coalition: coal, cs: [], abstain: [], posts: {}, concessions: {}, unity: 1 };
    S.formGovernment(Q, deal, pm);
    if (Q.govLog && Q.govLog.length) Q.govLog[Q.govLog.length - 1].unity = 1;
    S.note(Q, 'Facing yet another election, the House invests a unity government: a technocratic cabinet under ' + pm + ' (' + U.PARTIES[L].short + '), ' + c.yes + ' to ' + c.no + ', with ' + c.abstain + ' abstaining.');
    return true;
  };
  S.repeatElection = function (Q) {
    var n = V.national(Q), thr = U.RULES.house.nationalThreshold * 100, pos = U.Elections.pos(Q);
    var inc = (Q.gov ? Q.gov.coalition : []).concat([Q.president.party]).filter(function (p, i, a) { return a.indexOf(p) === i && !Q.dormant[p] && U.PARTIES[p]; });
    inc.forEach(function (p) { Q.calib[p] = (Q.calib[p] || 1) * 0.92; });
    Q.govApproval -= 8; Q.president.approval -= 7;
    var big = Object.keys(n).filter(function (p) { return n[p] >= 12 && U.PARTIES[p]; }), lent = [];
    Q.lendBack = Q.lendBack || [];
    var shift = function (p, amt) { var now = V.national(Q)[p] || 0.01; Q.calib[p] = (Q.calib[p] || 1) * Math.max(0.05, (now + amt) / now); };
    Object.keys(n).forEach(function (s) {
      if (!U.PARTIES[s] || Q.dormant[s] || n[s] >= thr * 1.6 || big.indexOf(s) >= 0) return;
      // lent to the two nearest large parties, more to the nearer one
      var near = big.filter(function (x) { return !U.vetoes(s, x); }).map(function (x) { return [x, U.Electoral.dist(pos[s], pos[x])]; }).sort(function (a, b) { return a[1] - b[1]; }).slice(0, 2);
      if (!near.length) return;
      var moved = n[s] * (n[s] < thr ? 0.35 : 0.2), w = near.map(function (x) { return Math.exp(-x[1] / 2); }), tw = w[0] + (w[1] || 0);
      shift(s, -moved);
      near.forEach(function (x, k) { var a = moved * w[k] / tw; shift(x[0], a); Q.lendBack.push({ s: s, b: x[0], amt: a }); });
      lent.push(U.PARTIES[s].short + ' → ' + near.map(function (x) { return U.PARTIES[x[0]].short; }).join('/'));
    });
    S.note(Q, 'Voters blame the caretaker government and the President for the deadlock. Pollsters see supporters of small parties lending their votes to larger ones to break it: ' + lent.slice(0, 6).join(', ') + '.');
  };
  // once a government is invested, most lent votes (50-90%) go back to their own party; the rest stay
  S.returnLentVotes = function (Q) {
    var L = Q.lendBack; if (!L || !L.length) return; Q.lendBack = null;
    var back = 0.5 + U.rng(Q) * 0.4, shift = function (p, amt) { var now = V.national(Q)[p] || 0.01; Q.calib[p] = (Q.calib[p] || 1) * Math.max(0.05, (now + amt) / now); };
    L.forEach(function (l) { if (Q.dormant[l.s] || Q.dormant[l.b]) return; var a = l.amt * back; shift(l.b, -a); shift(l.s, a); });
    S.note(Q, 'With a government in place, about ' + Math.round(back * 100) + '% of the votes lent to the larger parties drift back to their own parties.');
  };
  // Donald Trump enters politics in 2013 and launches MAGA. It climbs in the polls
  // until 2016, then plateaus; once Trump or MAGA holds power, it slowly declines.
  // A few years into MAGA power, the hard right splits off as the America First Party.
  // After the Great Recession the United Left may surge, in some timelines to about
  // 30%; in many it does not surge at all.
  S.ulSurge = function (Q) {
    var now = S.now(Q), mi = U.monthIndex; if (Q.dormant.ul || now < mi(2009, 1) || now > mi(2014, 12)) return;
    if (Q.flags.ulTop == null) Q.flags.ulTop = U.rng(Q) < 0.55 ? 8 + 22 * Math.pow(U.rng(Q), 2) : 0;
    if (!Q.flags.ulTop) return;
    var n = V.national(Q).ul || 0, target = 3 + Math.min(1, (now - mi(2009, 1)) / 48) * (Q.flags.ulTop - 3);
    Q.base = Q.base || {}; Q.base.ul = { lo: n * 0.7, hi: Math.max(target + 2, n * 1.3) };
    if (n < target) { var m = Q.mods.ul = Q.mods.ul || {}, pr = U.PARTIES.ul.pref || {}, d = Math.min(0.15, (target - n) / Math.max(1, n) * 0.3); U.GROUPS.forEach(function (g) { m[g] = (m[g] || 0) + d * (pr[g] || 1); }); }
    if (Q.flags.ulTop > 15 && !Q.flags.ulSurgeNote && n > 12) { Q.flags.ulSurgeNote = 1; S.note(Q, 'After the crash, the United Left surges: pollsters put it above 12% for the first time.'); }
  };
  S.magaArc = function (Q) {
    var now = S.now(Q), mi = U.monthIndex;
    if (Q.dormant.maga && now >= mi(2013, 6)) {
      S.activate(Q, 'maga', 2.5); Q.leaders.maga = 'Donald Trump';
      if (Q.fig && Q.fig['Donald Trump']) { var f = Q.fig['Donald Trump']; f.status = 'active'; f.since = 2013; f.p = 'maga'; if (f.leave && f.leave < 2030) f.leave = 2030; }
      S.note(Q, 'Donald Trump enters politics, launching MAGA on a platform of border walls, tariffs and "draining the swamp".');
      return;
    }
    if (Q.dormant.maga) return;
    var inPower = Q.president.party === 'maga' || (Q.gov && Q.gov.coalition.indexOf('maga') >= 0);
    if (inPower && !Q.flags.magaPower) Q.flags.magaPower = now;
    if (!inPower && Q.flags.magaPower && now - Q.flags.magaPower < 6) Q.flags.magaPower = 0;
    var n = V.national(Q).maga || 0;
    // a relative push to a party's support, bypassing campaign fatigue
    var push = function (p, d) { var m = Q.mods[p] = Q.mods[p] || {}, pr = U.PARTIES[p].pref || {}; U.GROUPS.forEach(function (g) { m[g] = (m[g] || 0) + d * (pr[g] || 1); }); };
    if (inPower && Q.flags.magaPeak && now >= mi(2016, 11)) Q.flags.magaPeak = Math.min(Q.flags.magaPeak, n);   // what it loses in power stays lost
    if (now < mi(2016, 11)) {   // the rise: its voter base grows with it, even if it already holds office
      // how far it rises differs by timeline: 10-35% by 2016, above 25% only rarely
      if (Q.flags.magaTop == null) Q.flags.magaTop = 10 + 25 * Math.pow(U.rng(Q), 2.5) + Q.discontent / 20;
      var target = 3 + Math.min(1, (now - mi(2013, 6)) / 41) * (Q.flags.magaTop - 3);
      Q.base = Q.base || {}; Q.base.maga = { lo: n * 0.7, hi: Math.max(target + 2, n * 1.3) };
      if (n < target) push('maga', Math.min(0.5, (target - n) / Math.max(1, n) * 0.8));
    }
    else if (inPower) push('maga', -0.008);                                                                               // governing wears it down
    else { if (!Q.flags.magaPeak) Q.flags.magaPeak = n; if (n < Q.flags.magaPeak * 0.9) push('maga', Math.min(0.05, (Q.flags.magaPeak * 0.95 - n) / Math.max(1, n) * 0.15)); }   // out of power: a plateau
    if (Q.dormant.afp && Q.flags.magaPower && now - Q.flags.magaPower >= 24 + (Q.seed0 % 24) && U.rng(Q) < 0.15) {
      S.activate(Q, 'afp', 2); S.note(Q, 'Hardliners who say MAGA has gone soft in power found the America First Party.');
    }
  };
  // nobody leads two parties at once (e.g. Ralph Nader leads the Greens or the United Left, not both)
  S.uniqueLeaders = function (Q) {
    var by = {}; Object.keys(Q.leaders || {}).forEach(function (p) { if (Q.dormant[p] || !U.PARTIES[p]) return; var n = Q.leaders[p]; (by[n] = by[n] || []).push(p); });
    Object.keys(by).forEach(function (n) {
      var ps = by[n]; if (ps.length < 2) return;
      var own = Q.fig && Q.fig[n] && ps.indexOf(Q.fig[n].p) >= 0 ? Q.fig[n].p : ps[0];
      ps.forEach(function (p) { if (p === own) return; var ex = {}; ex[n] = 1; Q.leaders[p] = S.pickPerson(Q, p, ex, 'charisma'); });
    });
  };
  S.defect = function (Q, from, to, frac) {
    var n = Math.round((Q.house[from] || 0) * frac); if (n < 1) return 0;
    Q.house[from] -= n; Q.house[to] = (Q.house[to] || 0) + n;
    var hb = Q.houseByState || {}, left = n; Object.keys(hb).forEach(function (s) { if (left > 0 && hb[s][from] > 1) { hb[s][from]--; hb[s][to] = (hb[s][to] || 0) + 1; left--; } });
    return n;
  };
  // parties founded in the 2010s and 2020s: splits, new movements and mergers
  S.newParties = function (Q) {
    var r = U.rng(Q), y = Q.year, n = V.national(Q);
    if (Q.dormant.fcp && !Q.dormant.cc && y >= 2014 && (S.inGov(Q, 'cc') && S.inGov(Q, 'cdp') ? 0.02 : 0.006) + Q.discontent / 8000 > r) {
      S.activate(Q, 'fcp', 2 + (n.cc || 20) * 0.08); var k = S.defect(Q, 'cc', 'fcp', 0.07);
      S.note(Q, 'The Freedom Caucus walks out of the Conservative Coalition and founds the Freedom Party' + (k ? ', taking ' + k + ' members of the House with it' : '') + '.'); return; }
    if (Q.dormant.jdem && y >= 2017 && r > 0.985) {
      S.activate(Q, 'jdem', 1.5); var k2 = S.defect(Q, 'sdlp', 'jdem', 0.03) + S.defect(Q, 'ldp', 'jdem', 0.02);
      S.note(Q, 'Insurgent progressives launch Justice Democrats as a party of their own' + (k2 ? '; ' + k2 + ' members of the House join' : '') + '.'); return; }
    if (!Q.dormant.jdem && !Q.dormant.ul && Q.ulMembers && !Q.ulMembers.jdem && r > 0.4 && r < 0.406) {
      var w = n.jdem || 1; S.mergeInto(Q, ['jdem'], 'ul', 0.92); Q.ulMembers.jdem = w; S.note(Q, 'Justice Democrats join the United Left lists.'); return; }
    if (Q.dormant.ppl && y >= 2020 && Q.discontent > 35 && r > 0.2 && r < 0.21) { S.activate(Q, 'ppl', 1.2); return; }
    if (Q.dormant.fwd && y >= 2021 && r > 0.6 && r < 0.625) {
      S.activate(Q, 'fwd', 1.5);
      var joined = ['nyfp', 'nenp'].filter(function (p) { return !Q.dormant[p] && U.rng(Q) < 0.6; });
      if (joined.length) S.mergeInto(Q, joined, 'fwd', 0.85);
      S.note(Q, 'The Forward Party is founded from a merger of centrist reform movements' + (joined.length ? ', taking in the ' + joined.map(function (p) { return U.PARTIES[p].name; }).join(' and ') : '') + '.'); }
  };
  S.activate = function (Q, p, share) {
    Q.dormant[p] = false; Q.calib[p] = 1; Q.mods[p] = {};
    var n = V.national(Q); Q.calib[p] = share / Math.max(0.1, n[p]);
    S.note(Q, U.PARTIES[p].name + ' is launched' + (p === 'maga' ? ' by Donald Trump' : '') + '. Early polls give it around ' + Math.round(share) + '%.');
  };

  // Coalition partners grow restless when the government drifts from them.
  S.coalitionStability = function (Q) {
    var g = Q.gov; if (!g || Q.formation) return;
    g.coalition.concat(g.cs).forEach(function (p) {
      if (p === g.pmParty) return;
      var drift = (C.compat(Q, p, g.pmParty) - 0.55) * 1.2 + (Q.govApproval - 45) * 0.03 + U.gauss(Q) * 0.6;
      C.addRel(Q, p, g.pmParty, drift);
      if (C.rel(Q, p, g.pmParty) < 18 && U.rng(Q) < 0.3) {
        var wasCoal = g.coalition.indexOf(p) >= 0;
        g.coalition = g.coalition.filter(function (x) { return x !== p; }); g.cs = g.cs.filter(function (x) { return x !== p; });
        S.note(Q, 'The ' + U.PARTIES[p].name + ' withdraws ' + (wasCoal ? 'from the coalition' : 'its confidence-and-supply support') + '. The government now relies on ' + S.govSeats(Q) + ' seats.');
        Q.flags.partnerLeft = p;
      }
    });
  };

  // Big parties only stand aside on the House list where it costs little:
  // states with 2-4 list seats. Very small parties may stand aside everywhere.
  S.sdSmallStates = function (Q, a) {
    var pr = U.Elections.apportion().pr, n = U.Votes.national(Q)[a.party] || 0;
    return (a.states || []).filter(function (sid) { return n < 2 || (pr[sid] >= 2 && pr[sid] <= 4); });
  };
  // New agreements between compatible parties (the simulation's own deals).
  S.agreementsNew = function (Q) {
    if (U.rng(Q) > 0.03) return;
    var n = U.Votes.national(Q), ps = Object.keys(n).filter(function (p) { return U.PARTIES[p] && !Q.dormant[p] && n[p] >= 0.4 && U.REGIONAL.indexOf(p) < 0; });
    var pairs = []; ps.forEach(function (a) { ps.forEach(function (b) { if (a < b && !U.vetoes(a, b) && C.compat(Q, a, b) > 0.55 && C.rel(Q, a, b) >= 55 && !(Q.standDowns || []).some(function (x) { return (x.party === a && x.partner === b) || (x.party === b && x.partner === a); })) pairs.push([a, b]); }); });
    if (!pairs.length) return;
    var pr = U.pick(Q, pairs), small = n[pr[0]] < n[pr[1]] ? pr[0] : pr[1], big = small === pr[0] ? pr[1] : pr[0], sz = n[small];
    var R = U.Elections.REGION_SETS, regs = Object.keys(R), reg = U.pick(Q, regs);
    var mk = function (party, partner, region, scope) { var a = { party: party, partner: partner, region: region, states: R[region].slice(), pact: pr.join('-') + '-' + S.now(Q), scope: scope }; if (scope.house) a.houseStates = S.sdSmallStates(Q, a); return a; };
    var sc = sz < 3 ? { house: sz < 1.5, senList: true, gov: true } : { house: U.rng(Q) < 0.4, senList: true, gov: true };
    Q.standDowns.push(mk(small, big, reg, sc));
    // larger partners give something back in a region of their own, for the Senate list or governor
    if (sz >= 3 && U.rng(Q) < 0.6) { var reg2 = U.pick(Q, regs.filter(function (r) { return r !== reg; })); Q.standDowns.push(mk(big, small, reg2, { house: false, senList: true, gov: U.rng(Q) < 0.5 })); }
    var what = X2(sc);
    S.note(Q, 'Electoral agreement: the ' + U.PARTIES[small].short + ' will stand aside for the ' + U.PARTIES[big].short + ' in ' + U.Elections.REGION_NAMES[reg] + ' (' + what + ').');
  };
  function X2(sc) { return U.Elections.SCOPES.filter(function (k) { return sc[k[0]]; }).map(function (k) { return k[1]; }).join(', '); }
  S.agreementsCheck = function (Q) {
    S.agreementsNew(Q);
    var seen = {};
    (Q.standDowns || []).forEach(function (a) {
      if (seen[a.pact]) return; seen[a.pact] = 1;
      if (Q.dormant[a.party] || Q.dormant[a.partner]) { Q.standDowns = Q.standDowns.filter(function (x) { return x.pact !== a.pact; }); return; }
      if (C.rel(Q, a.party, a.partner) < 28 && U.rng(Q) < 0.2) {
        Q.standDowns = Q.standDowns.filter(function (x) { return x.pact !== a.pact; });
        S.note(Q, 'The electoral agreement between the ' + U.PARTIES[a.party].short + ' and the ' + U.PARTIES[a.partner].short + ' collapses. Both will contest every district.');
      }
    });
  };

  // Budget vote (brief §8.2). Partners vote yes unless relations collapsed.
  S.budgetVote = function (Q, plan, playerVote) {
    var g = Q.gov, decide = function (p, sub) {
      if (p === Q.player && playerVote) return playerVote;
      if (g.coalition.indexOf(p) >= 0) return 'yes';
      if (g.cs.indexOf(p) >= 0) return C.rel(Q, p, g.pmParty) > 30 ? 'yes' : 'abstain';
      var cp = C.compat(Q, p, g.pmParty) + (plan && plan.lean ? plan.lean(p) : 0);
      if (p === 'aga' && sub && sub !== 'other') return Q.flags['agaDeal' + sub] ? 'yes' : (cp > 0.55 ? 'abstain' : 'no');
      return cp > 0.68 ? 'abstain' : 'no';
    };
    var h = U.Parliament.count(Q, 'house', decide), s = U.Parliament.count(Q, 'senate', decide);
    var passH = U.simple(h), passS = s.yes > s.no, override = !passS && U.absolute(h);
    return { house: h, senate: s, passed: passH && (passS || override), override: override };
  };

  S.applyBudget = function (Q, plan, res) {
    var g = Q.gov;
    if (res.passed) {
      g.budgetFails = 0; Q.spending = (Q.spending || 0) + (plan.spending || 0); Q.policyGrowth = (Q.policyGrowth || 0) * 0.5 + (plan.growth || 0);
      if (plan.groups) V.campaign(Q, g.pmParty, plan.groups, g.pmParty === Q.player ? 'Budget measures' : null);
      Q.govApproval += 2;
    } else {
      g.budgetFails += 1; Q.govApproval -= 4;
    }
  };

  // AI no-confidence motions when the government is weak.
  S.confidenceCheck = function (Q) {
    var g = Q.gov; if (!g || Q.formation || Q.electionAt) return;
    var support = S.govSeats(Q);
    if (support >= U.majority() && g.budgetFails < 2) return;
    if (U.rng(Q) > (g.budgetFails >= 2 ? 0.6 : 0.12)) return;
    var res = U.Parliament.count(Q, 'house', function (p) {
      if (p === Q.player) return S.supportsGov(Q) ? 'no' : (Q.playerNoConf || 'yes');
      if (S.supportsGov(Q, p)) return 'no';
      return C.compat(Q, p, g.pmParty) > 0.6 ? 'abstain' : 'yes';
    });
    S.note(Q, 'A motion of no confidence in ' + g.pm + ': ' + res.yes + ' for, ' + res.no + ' against, ' + res.abstain + ' abstaining.');
    if (U.absolute(res)) { S.note(Q, 'The government falls. A general election is called.'); S.callElection(Q, 2); }
  };

  S.callElection = function (Q, monthsAhead) {
    if (Q.electionAt) return;
    Q.electionAt = S.now(Q) + (monthsAhead || 2);
    // the presidential election is on a fixed date and never moves with a general election
    var d = Q.electionAt, y = Math.floor(d / 12), m = d % 12 + 1;
    S.note(Q, 'A general election is called for ' + U.MONTHS[m - 1] + ' ' + y + '.');
  };

  // AI Prime Ministers call elections when polls favour them or at the deadline.
  S.electionTiming = function (Q) {
    if (Q.electionAt || Q.formation) return;
    var now = S.now(Q);
    if (now >= Q.deadline) { S.note(Q, 'The legislature’s term is ending: the election must now be held.'); S.callElection(Q, 2); return; }
    if (!S.pmIsPlayer(Q) && Q.gov && now >= Q.deadline - 10 && (Q.trend[Q.gov.pmParty] || 0) > 1 && U.rng(Q) < 0.2) S.callElection(Q, 2);
  };

  // ---- the general election ----
  // State by state, for the results maps: House state-list seats, Senate seats
  // (all four, incl. the legislature's) and vote shares; plus the national list.
  // governors after an election: winner and both rounds of each race
  S.govRecord = function (Q) {
    var o = {}; for (var sid in Q.states || {}) { var g = Q.states[sid], r = g.govRace || {}; if (g.governor) o[sid] = { w: g.governor, r1: r.r1 ? U.clone(r.r1) : null, r2: r.r2 ? U.clone(r.r2) : null }; } return o;
  };
  S.stateRecord = function (Q, h) {
    var st = {}, sen = {}, nat = {};
    for (var sid in h.byState) { var b = h.byState[sid], seats = {}, sh = {};
      for (var p in b.pr) if (b.pr[p]) seats[p] = b.pr[p];
      Object.keys(b.shares).sort(function (x, y) { return b.shares[y] - b.shares[x]; }).forEach(function (p) { if (b.shares[p] >= 0.5) sh[p] = Math.round(b.shares[p] * 10) / 10; });
      st[sid] = { seats: seats, shares: sh }; }
    (Q.senateSeats || []).forEach(function (x) { if (!x.party) return; var o = sen[x.state] = sen[x.state] || { stood: (Q.senateStood && Q.senateStood[x.state]) || [], seats: {}, shares: (Q.senateShares && Q.senateShares[x.state]) || (st[x.state] ? st[x.state].shares : {}) }; if (x.type === 'house') o.leg = x.party; else o.seats[x.party] = (o.seats[x.party] || 0) + 1; });
    for (var q in Q.house) { var n = Q.house[q]; for (sid in st) n -= st[sid].seats[q] || 0; if (n > 0) nat[q] = n; }
    return { states: st, senStates: sen, national: nat };
  };

  // State elections: governors and state legislatures on fixed three-year terms,
  // held with each presidential election and again at its midterm.
  S.stateDue = function (Q) {
    if (U.RULES.stateElections !== 'fixed') return false;
    if (Q.nextState == null) { var k = Q.nextPres; while (k - 36 > S.now(Q)) k -= 36; Q.nextState = k; }
    return Q.nextState === S.now(Q);
  };
  S.runStateElections = function (Q, withPres) {
    var old = {}, sid; for (sid in Q.states) old[sid] = Q.states[sid].governor;
    for (sid in U.STATES) Q.states[sid] = X.stateGov(Q, U.STATES[sid], Q.states[sid]);
    // the new legislatures choose their senators
    var flips = Object.keys(old).filter(function (s) { return old[s] !== Q.states[s].governor; });
    var mid = !withPres;
    var res = { date: U.dateStr(Q), flips: flips.map(function (s) { return { s: s, from: old[s], to: Q.states[s].governor }; }), midterm: mid };
    Q.history.push({ kind: 'state', date: res.date, govs: S.govRecord(Q), midterm: mid });
    Q.nextState = S.now(Q) + 36;
    S.note(Q, (mid ? 'Midterm state elections: ' : 'State elections: ') + flips.length + ' governorship' + (flips.length === 1 ? ' changes' : 's change') + ' hands.');
    return res;
  };
  S.runGeneralElection = function (Q) {
    var before = U.clone(Q.house), beforeS = U.Elections.senateCount(Q), shares = V.national(Q);
    var h = X.house(Q);
    Q.house = h.house; Q.agaSeats = S.agaByState(h); Q.houseByState = S.delegations(h);
    var oldGov = {}; for (var sid in Q.states) oldGov[sid] = Q.states[sid].governor;
    if (U.RULES.stateElections === 'with-general') for (sid in U.STATES) Q.states[sid] = X.stateGov(Q, U.STATES[sid], Q.states[sid]);
    Q.electionNo += 1;
    var senateRes = X.senate(Q);
    var res = { date: U.dateStr(Q), shares: shares, house: U.clone(Q.house), before: before, senate: X.senateCount(Q), beforeSenate: beforeS,
      districts: h.districts.length, runoffs: h.districts.filter(function (d) { return d.round === 2; }).length,
      pr: h.pr, byState: {}, govFlips: 0, distWon: {} };
    h.districts.forEach(function (d) { res.distWon[d.winner] = (res.distWon[d.winner] || 0) + 1; });
    for (sid in h.byState) res.byState[sid] = { shares: h.byState[sid].shares, district: h.byState[sid].district, pr: h.byState[sid].pr, governor: Q.states[sid] && Q.states[sid].governor };
    for (sid in oldGov) if (oldGov[sid] !== Q.states[sid].governor) res.govFlips++;
    // close district results for the briefing
    res.close = h.districts.filter(function (d) { return d.round === 2 && Math.abs(d.r2[d.finalists[0]] - d.r2[d.finalists[1]]) < 2; })
      .slice(0, 8).map(function (d) { return { state: d.state, n: d.n, a: d.finalists[0], b: d.finalists[1], va: d.r2[d.finalists[0]], vb: d.r2[d.finalists[1]] }; });
    // full race-by-race detail for election night (kept out of the save file)
    var slim = function (r, sid) { var t = Object.keys(r.r1).sort(function (a, b) { return r.r1[b] - r.r1[a]; }).slice(0, 4).map(function (p) { return [p, Math.round(r.r1[p] * 10) / 10]; });
      return { s: sid || r.state, n: r.n, round: r.round, w: r.winner, f: r.finalists, r2: r.r2, t: t }; };
    var detail = { districts: h.districts.map(function (d) { return slim(d); }), senate: senateRes, pr: {}, governors: [] };
    for (sid in h.byState) if (sid !== 'DC') detail.pr[sid] = h.byState[sid].pr;
    for (sid in U.STATES) if (Q.states[sid].govRace) detail.governors.push(slim(Q.states[sid].govRace, sid));
    Q.lastDistricts = detail.districts.map(function (d) { return { s: d.s, n: d.n, w: d.w, round: d.round, f: d.f }; });
    Q.lastElection = res;
    Q.history = Q.history || [];
    Q.history.push({ kind: 'general', date: res.date, shares: (function () { var o = {}; for (var p in shares) if (shares[p] >= 0.3) o[p] = Math.round(shares[p] * 10) / 10; return o; })(), house: U.clone(res.house), senate: U.clone(res.senate),
      states: S.stateRecord(Q, h).states, senStates: S.stateRecord(Q, h).senStates, national: S.stateRecord(Q, h).national, leaders: U.clone(Q.leaders), senLeaders: (function () { var o = {}; for (var p in U.Elections.senateCount(Q)) o[p] = S.senLeaderOf(Q, p); for (p in Q.house) if (!o[p]) o[p] = S.senLeaderOf(Q, p); return o; })(),
      senShares: (function () { var w = {}, t = 0; for (var sid in (Q.senateShares || {})) { var pop = (U.STATES[sid] || {}).pop || 0; t += pop; for (var p in Q.senateShares[sid]) w[p] = (w[p] || 0) + Q.senateShares[sid][p] * pop; } for (p in w) w[p] = Math.round(w[p] / t * 10) / 10; return w; })() });
    res = Object.assign({}, res, { detail: detail });
    Q.electionAt = null; Q.pacts = [];
    Q.deadline = S.now(Q) + U.RULES.government.maxTermMonths;
    Q.formation = { start: S.now(Q), monthsLeft: U.RULES.government.formationMonthsBeforeRepeat, failed: [] };
    if (Q.gov) Q.gov.caretaker = true;
    Q.causes = {};
    var swing = shares[Q.player] - (Q.prevShare || shares[Q.player]); Q.prevShare = shares[Q.player];
    // party reacts: a bad result raises dissent and the leader's vulnerability
    var seatDelta = (Q.house[Q.player] || 0) - (before[Q.player] || 0);
    if (seatDelta < -30) { for (var k in Q.factions) Q.factions[k].dissent += 10; Q.leader.approval -= 10; Q.unity -= 8; }
    if (seatDelta > 20) { Q.leader.approval += 8; Q.unity += 5; Q.morale += 8; }
    res.swing = swing;
    if (Q.leaders) S.leadershipChanges(Q, before);
    S.note(Q, 'General election: the ' + U.PARTIES[Q.player].short + ' wins ' + Q.house[Q.player] + ' seats (' + (seatDelta >= 0 ? '+' : '') + seatDelta + ') with ' + shares[Q.player].toFixed(1) + '% of the vote.');
    return res;
  };

  // ---- presidential election ----
  S.presidentialDue = function (Q) {
    return S.now(Q) === Q.nextPres;
  };
  S.defaultCandidates = function (Q) {
    var list = [], y = Q.year;
    var L = function (p) { return S.leaderOf(Q, p); };
    var names = { sdlp: L('sdlp'), cdp: L('cdp'), cc: L('cc'), grn: L('grn'),
      ul: L('ul'),
      reform: y <= 2000 ? 'Pat Buchanan' : L('reform'), asp: L('asp'), lib: L('lib'), maga: L('maga') };
    var appeal = { sdlp: 2, cdp: 3, cc: 2, ul: 2, grn: 2, reform: 0, asp: 0, lib: 0, maga: 4 };
    ['sdlp', 'cdp', 'cc', 'ul', 'grn', 'reform', 'lib', 'maga'].concat(Q.dormant.reform ? ['asp'] : []).forEach(function (p) {
      if (Q.dormant[p] || (Q.presWithdrawn && Q.presWithdrawn.indexOf(p) >= 0)) return;
      list.push({ id: p, party: p, name: names[p], backers: [], appeal: appeal[p] || 0 });
    });
    return list;
  };
  // state-level maps for a presidential result: round-one vote shares and the
  // runoff's electors, keyed by party so the map colours match
  S.presMapData = function (res) {
    var pof = {}; res.cands.forEach(function (c) { pof[c.id] = c.party; });
    var pct = function (votes) { var t = 0, o = {}; for (var c in votes) t += votes[c]; for (c in votes) if (votes[c] / t >= 0.005) o[pof[c]] = Math.round(votes[c] / t * 1000) / 10; return o; };
    var r1 = {}, ec = {};
    for (var sid in res.byState) r1[sid] = { seats: {}, shares: pct(res.byState[sid].votes) };
    var b2 = res.byState2 || {};
    for (sid in b2) { var seats = {}; for (var c in b2[sid].ev) if (b2[sid].ev[c]) seats[pof[c]] = b2[sid].ev[c]; ec[sid] = { seats: seats, shares: pct(b2[sid].votes) }; }
    res.r1States = r1; res.ecStates = ec; return res;
  };
  S.runPresidential = function (Q) {
    var cands = S.defaultCandidates(Q), mine = Q.presCandidate;
    if (mine && mine.party === Q.player) cands.unshift({ id: Q.player, party: Q.player, name: mine.name, backers: mine.backers || [], appeal: mine.appeal || 0 });
    else if (mine && mine.endorse) cands.forEach(function (c) { if (c.party === mine.endorse) c.backers.push(Q.player); });
    // regional parties back the nearest candidate
    U.REGIONAL.forEach(function (p) {
      var best = null, bd = 1e9; cands.forEach(function (c) { var d = U.Electoral.dist(X.pos(Q)[p], X.pos(Q)[c.party]); if (d < bd) { bd = d; best = c; } });
      if (best && best.backers.indexOf(p) < 0) best.backers.push(p);
    });
    var res = X.president(Q, cands);
    var w = cands.filter(function (c) { return c.id === res.winner; })[0];
    res.winnerName = w.name; res.winnerParty = w.party; res.date = U.dateStr(Q);
    Q.lastPresidential = res;
    Q.history = Q.history || [];
    S.presMapData(res);
    Q.history.push({ kind: 'pres', date: res.date, total: res.total, winner: res.winner, tiebreak: res.tiebreak || null, r1States: res.r1States, ecStates: res.ecStates,
      cands: cands.map(function (c) { return { id: c.id, name: c.name, party: c.party }; }),
      r1: U.clone(res.r1), r2: U.clone(res.r2 || {}), pop2: U.clone(res.pop2 || {}),
      map: (function () { var o = {}, bs = res.byState2 || res.byState; for (var s in bs) { var e = bs[s].ev, w = Object.keys(e).filter(function (k) { return e[k]; })[0]; if (w) o[s] = w; } return o; })() });
    var oldPres = Q.president;
    var vp = (mine && mine.party === Q.player && w.party === Q.player && mine.vp) ? mine.vp : { name: w.party === Q.player ? 'an LDP running mate' : S.pickPerson(Q, w.party, (function () { var e = {}; e[w.name] = 1; return e; })(), 'charisma'), party: w.party };
    Q.offices = Q.offices || {}; Q.offices.vp = vp;
    var terms = oldPres.name === w.name ? (oldPres.terms || 1) + 1 : 1;
    Q.president = { name: w.name, party: w.party, approval: 58, terms: terms, termLimited: terms >= U.RULES.president.termLimit };
    Q.nextPres = S.now(Q) + 12 * U.RULES.president.termYears;
    Q.flags.clintonEarly = 0;
    S.note(Q, w.name + ' (' + U.PARTIES[w.party].short + ') is elected President, with ' + vp.name + ' (' + U.PARTIES[vp.party].short + ') as Vice President' + (res.round === 2 ? ' in the second round' : ' in the first round') + '.');
    // the LDP leader becomes President: the party needs a new leader (and PM)
    if (w.party === Q.player && Q.leader.name === w.name) { Q.flags.leaderToWhiteHouse = S.now(Q); }
    Q.presCandidate = null; Q.presWithdrawn = [];
    return res;
  };

  // ---- presiding officers ----
  // Someone from a party's roster who holds no other top job.
  S.busy = function (Q) {
    var b = {}; [Q.president, Q.offices && Q.offices.vp, Q.offices && Q.offices.speaker, Q.offices && Q.offices.ppt].forEach(function (o) { if (o) b[o.name] = 1; });
    if (Q.gov) b[Q.gov.pm] = 1; for (var p in (Q.leaders || {})) b[Q.leaders[p]] = 1; if (Q.leader) b[Q.leader.name] = 1;
    (Q.cabinet || []).forEach(function (c) { b[c.name] = 1; });
    return b;
  };
  S.pickPerson = function (Q, p, exclude, byStat) {
    var list = U.PEOPLE[p] || [], busy = S.busy(Q);
    // an alliance draws on its member parties' people
    if (p === 'ul' && Q.ulMembers) Object.keys(Q.ulMembers).forEach(function (m) { list = list.concat((U.PEOPLE[m] || []).filter(function (n) { return list.indexOf(n) < 0 && !(m === 'grn' && !Q.dormant.grn); })); });
    var yr = Q.year || 1997, free = list.filter(function (n) { return !busy[n] && !(exclude && exclude[n]) && !(Q.retired && Q.retired[n]) && S.isActive(Q, n); });
    if (!free.length) free = list.filter(function (n) { return !(exclude && exclude[n]) && !(Q.retired && Q.retired[n]) && S.isActive(Q, n); });
    if (byStat) free.sort(function (a, b) { return U.personStats(b)[byStat] - U.personStats(a)[byStat]; });
    return free[0] || ('a senior ' + U.PARTIES[p].short + ' member');
  };
  S.officeName = function (Q, office, p) {
    var o = Q.offices && Q.offices[office]; if (o) { var tmp = o.name; o.name = '\u0000'; var n = S.pickPerson(Q, p, null, 'competence'); o.name = tmp; return n; }
    return S.pickPerson(Q, p, null, 'competence');
  };
  // Senate party leaders: kept until they become the party's House leader or President
  var SEN0 = { vpp: 'Bernie Sanders', ul: 'Bernie Sanders', ldp: 'Ted Kennedy', cc: 'Trent Lott', cdp: 'Richard Lugar', sdlp: 'Paul Wellstone', srp: 'Strom Thurmond', asp: 'Orrin Hatch', lsp: 'Kinky Friedman', reform: 'Dean Barkley', grn: 'Winona LaDuke' };
  S.senLeaderOf = function (Q, p) {
    if (p === 'revsoc') return '(fragmented)';
    Q.senLeaders = Q.senLeaders || {};
    var bs = (p === 'vpp' || p === 'ul'), senator = Q.flags && Q.flags.sandersSenator && !(Q.retired && Q.retired['Bernie Sanders']);
    var cur = bs && senator ? 'Bernie Sanders' : Q.senLeaders[p] || (bs ? null : SEN0[p]), house = S.leaderOf(Q, p);
    if (bs && !senator && cur === 'Bernie Sanders') cur = null;
    if (!cur || (cur === house && !(bs && senator)) || (Q.president && cur === Q.president.name) || (Q.retired && Q.retired[cur]) || !S.isActive(Q, cur)) { var ex = {}; ex[house] = 1; if (Q.president) ex[Q.president.name] = 1; cur = U.PEOPLE[p] ? S.pickPerson(Q, p, ex, 'competence') : ''; }
    Q.senLeaders[p] = cur; return cur;
  };
  S.leaderOf = function (Q, p) { return p === Q.player ? Q.leader.name : (Q.leaders && Q.leaders[p]) || U.PARTIES[p].leader; };

  // ---- cabinet: 20 portfolios shared by party, best ministers first ----
  S.PORTFOLIOS = ['Deputy Prime Minister', 'Treasury', 'State', 'Defense', 'Attorney General', 'Health and Human Services', 'Labor', 'Commerce',
    'Education', 'Interior', 'Agriculture', 'Energy', 'Transportation', 'Housing and Urban Development', 'Veterans Affairs', 'Environment',
    'Trade', 'Federalism and the States', 'Science and Technology', 'Budget'];
  S.assignCabinet = function (Q) {
    var g = Q.gov; if (!g) return;
    Q.cabinet = [];
    var order = [], left = U.clone(g.posts), tot = U.sum(left);
    // the PM's party picks first, then turns follow each party's share
    var credit = {}; Object.keys(left).forEach(function (p) { credit[p] = p === g.pmParty ? 1 : 0; });
    for (var i = 0; i < Math.min(20, tot); i++) {
      var pick = Object.keys(left).filter(function (p) { return left[p] > 0; }).sort(function (a, b) { return (credit[b] + g.posts[b] / tot) - (credit[a] + g.posts[a] / tot); })[0];
      if (!pick) break;
      order.push(pick); left[pick]--; credit[pick] -= 1; Object.keys(credit).forEach(function (p) { credit[p] += g.posts[p] / tot; });
    }
    var used = {}; used[g.pm] = 1;
    order.forEach(function (p, i) {
      var name = S.pickPerson(Q, p, used, 'competence'); used[name] = 1;
      Q.cabinet.push({ post: S.PORTFOLIOS[i], name: name, party: p });
    });
  };

  // AI parties change leaders after bad elections, or now and then
  S.leadershipChanges = function (Q, before) {
    U.ALL_PARTIES.forEach(function (p) {
      if (p === Q.player || Q.dormant[p] || !U.PEOPLE[p] || U.PEOPLE[p].length < 2) return;
      var b = before[p] || 0, n = Q.house[p] || 0, bad = b >= 8 && n < b * 0.8;
      if (!bad && U.rng(Q) > 0.08) return;
      var old = Q.leaders[p], gov = Q.gov && Q.gov.pmParty === p && !Q.formation;
      if (gov && !bad) return;
      var ex = {}; ex[old] = 1; Q.retired = Q.retired || {}; if (bad) Q.retired[old] = 1;
      var nw = S.pickPerson(Q, p, ex, 'charisma');
      Q.leaders[p] = nw;
      S.note(Q, (bad ? 'After a poor result, ' : '') + old + ' steps down as leader of the ' + U.PARTIES[p].short + '. ' + nw + ' takes over.');
    });
  };
  // Speaker: the PM's party unless the coalition deal gave it away.
  // President pro tempore: the largest governing party in the Senate.
  S.setPresidingOfficers = function (Q, speakerParty) {
    var g = Q.gov, o = Q.offices = Q.offices || {};
    var sp = speakerParty || g.pmParty;
    if (!o.speaker || o.speaker.party !== sp) o.speaker = { name: S.officeName(Q, 'speaker', sp, Q.electionNo), party: sp };
    var sen = X.senateCount(Q), gp = g.coalition.concat(g.cs).filter(function (p) { return sen[p]; }).sort(function (a, b) { return sen[b] - sen[a]; })[0];
    if (!gp) gp = Object.keys(sen).sort(function (a, b) { return sen[b] - sen[a]; })[0];
    if (!o.ppt || o.ppt.party !== gp) o.ppt = { name: S.officeName(Q, 'ppt', gp, Q.electionNo), party: gp };
  };

  // ---- government formation (brief §4.8) ----
  S.formGovernment = function (Q, deal, label) {
    var tot = C.seats(Q, deal.coalition), posts = {};
    deal.coalition.forEach(function (p) { posts[p] = (deal.posts && deal.posts[p]) || Math.max(1, Math.round(20 * Q.house[p] / tot)); });
    var csOnly = deal.cs.filter(function (p, i) { return deal.coalition.indexOf(p) < 0 && deal.cs.indexOf(p) === i; });
    Q.gov = { pm: label, pmParty: deal.pm, coalition: deal.coalition.slice(), cs: csOnly, posts: posts,
      concessions: U.clone(deal.concessions || {}), since: S.now(Q), budgetFails: 0 };
    // concessions shift the government's policy and the partners' trust
    for (var p in deal.concessions) {
      deal.concessions[p].forEach(function (id) {
        var d = C.demandsOf(p).filter(function (x) { return x.id === id; })[0]; if (!d) return;
        Q.spending = (Q.spending || 0) + (d.deficit || 0);
        Q.pendingConcessions = (Q.pendingConcessions || []).concat([{ party: p, id: id, text: d.text, due: S.now(Q) + 18 }]);
      });
      C.addRel(Q, p, deal.pm, 6);
    }
    Q.formation = null; Q.govApproval = 50;
    var spk = null; for (var cp in deal.concessions) if (deal.concessions[cp].indexOf('speaker') >= 0) spk = cp;
    S.setPresidingOfficers(Q, spk);
    S.assignCabinet(Q);
    // giving a top office away costs goodwill inside the player's party
    if (spk && deal.pm === Q.player && spk !== Q.player) {
      for (var fk in Q.factions) Q.factions[fk].dissent += 6; Q.unity -= 4;
      S.note(Q, 'The Speakership goes to the ' + U.PARTIES[spk].short + ' (' + Q.offices.speaker.name + '). LDP members who wanted the job are not pleased.');
    }
    S.note(Q, label + ' is confirmed as Prime Minister, leading ' + deal.coalition.map(function (p) { return U.PARTIES[p].short; }).join('–') +
      (deal.cs.length ? ' with confidence and supply from ' + deal.cs.map(function (p) { return U.PARTIES[p].short; }).join(', ') : '') + '.');
  };

  S.pmName = function (Q, p) {
    if (p === Q.player) return Q.leader.name;
    if (Q.leaders && Q.leaders[p] && !(p === 'maga' && Q.year >= 2016 && Q.president.name === Q.leaders[p])) return Q.leaders[p];
    var y = Q.year;
    var n = { sdlp: 'Bill Bradley', cdp: y <= 2004 ? 'John McCain' : 'the CDP leader', cc: y <= 2004 ? 'George W. Bush' : 'the CC leader',
      maga: 'the MAGA leader' }[p];
    return n || ('the ' + U.PARTIES[p].short + ' leader');
  };

  S.tryInvestiture = function (Q, deal) {
    var c1 = C.investitureVote(Q, deal), ok = C.passes(c1, 1), c2 = null;
    if (!ok) { c2 = C.investitureVote(Q, deal); ok = C.passes(c2, 2); }
    return { first: c1, second: c2, passed: ok };
  };

  // AI formateurs take their turn at the end of each formation month.
  S.aiFormation = function (Q) {
    var F = Q.formation; if (!F) return null;
    var cands = C.formateurs(Q).filter(function (p) { return p !== Q.player && F.failed.indexOf(p) < 0; });
    for (var i = 0; i < cands.length; i++) {
      var pm = cands[i], deal = C.aiDeal(Q, pm, F.playerRefused ? [Q.player] : []);
      var inv = S.tryInvestiture(Q, deal);
      if (inv.passed) {
        if (deal.coalition.indexOf(Q.player) >= 0 || deal.cs.indexOf(Q.player) >= 0) { F.offer = deal; return 'offer'; }
        S.formGovernment(Q, deal, S.pmName(Q, pm)); return 'formed';
      }
      F.failed.push(pm);
      S.note(Q, S.pmName(Q, pm) + ' fails to assemble a majority (' + inv.first.yes + ' yes, ' + inv.first.no + ' no).');
      return 'failed';
    }
    return null;
  };

  // ---- end of month ----
  S.endMonth = function (Q) {
    Q.report = []; Q.causes = Q.causes || {};
    var before = V.national(Q)[Q.player];
    S.economy(Q); S.attribution(Q); S.aiParties(Q); S.coalitionStability(Q); S.agreementsCheck(Q);
    if (Q.formation) {
      var r = S.aiFormation(Q);
      Q.formation && (Q.formation.monthsLeft -= 1);
      if (Q.formation && !Q.formation.offer && (Q.repeats || 0) >= 1 && Q.formation.stage === 'open' && Q.formation.monthsLeft <= 2) S.unityGovernment(Q);
      if (Q.formation && Q.formation.monthsLeft <= 0 && !Q.formation.offer) {
        S.note(Q, 'No government can be formed. A repeat election is called.');
        Q.formation = null; S.callElection(Q, 2); S.repeatElection(Q); Q.repeats = (Q.repeats || 0) + 1;
      }
    } else { S.confidenceCheck(Q); S.electionTiming(Q); }
    // bills delayed by the Senate become law when the delay runs out
    (Q.delayedBills || []).forEach(function (b) { if (!b.done && S.now(Q) >= b.due) { b.done = true; var pol = U.Content.POLICIES.filter(function (x) { return x.id === b.id; })[0];
      if (pol) { Q.passed[pol.id] = S.now(Q); V.campaign(Q, Q.player, pol.groups, 'Legislation: ' + pol.name); Q.spending = (Q.spending || 0) + pol.cost; S.note(Q, 'The Senate’s delay runs out: ' + pol.name + ' becomes law.'); } } });
    // unpaid concessions erode trust
    (Q.pendingConcessions || []).forEach(function (c) {
      if (!c.done && S.now(Q) > c.due) { C.addRel(Q, c.party, Q.gov ? Q.gov.pmParty : Q.player, -1.5); }
    });
    // factions drift and the leader's standing follows the polls
    // factions drift back toward a baseline of grumbling; the leader's standing toward the middle
    for (var k in Q.factions) Q.factions[k].dissent = U.clamp(Q.factions[k].dissent + (25 - Q.factions[k].dissent) * 0.03 + U.gauss(Q) * 1.2, 0, 100);
    Q.funds = U.round1(Math.min(40, Q.funds + 0.35 + Q.morale / 400 - Math.max(0, Q.funds - 20) * 0.03)); // a big war chest is spent on upkeep
    Q.leader.approval = U.clamp(Q.leader.approval + ((Q.trend[Q.player] || 0) * 1.2) + (45 - Q.leader.approval) * 0.03 + U.gauss(Q) * 1.2, 5, 90);
    for (var t in Q.timers) if (Q.timers[t] > 0) Q.timers[t] -= 1;
    // advance the calendar
    Q.month += 1; if (Q.month > 12) { Q.month = 1; Q.year += 1; }
    S.recordPoll(Q);
    var after = V.national(Q)[Q.player];
    Q.lastMonthDelta = after - before;
    var due = { general: Q.electionAt === S.now(Q), president: S.presidentialDue(Q), state: S.stateDue(Q) };
    return due;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
