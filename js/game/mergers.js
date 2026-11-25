// Party mergers and electoral pacts among small parties.
//  - The United Left: the far left unites before the 2000 election about 75% of
//    the time; the Greens join it then about 25% of the time, and about 70% of
//    the time after 2004. If the left fails to unite by 2000, it may in 2004.
//  - Other mergers: ASP into the CDP, the American Green Alliance into the Greens,
//    the Constitution Party into MAGA, Reform into the ASP (in turn.js), and the
//    Californian Freedom Coalition into the Californian National Party.
//  - Small parties below the 5% national threshold form joint national lists
//    (electoral pacts) so their votes are not wasted.
(function (G) {
  'use strict';
  var U = G.USA, V = U.Votes, C = U.Coalition, S = U.Game, Ev = U.Events;
  var mi = U.monthIndex;
  var LEFT = ['cpusa', 'dsa', 'wfp', 'vpp', 'revsoc'];

  S.plan = function (Q) {
    if (Q.plan) return Q.plan;
    return (Q.plan = {
      ul2000: U.rng(Q) < 0.75, grn2000: U.rng(Q) < 0.25, grn04: U.rng(Q) < 0.7, ul04: U.rng(Q) < 0.6,
      ulAt: mi(1999, 6) + Math.floor(U.rng(Q) * 14), grnAt: mi(2004, 1) + Math.floor(U.rng(Q) * 24)
    });
  };

  // founding the United Left (also used by the talks event)
  S.foundUL = function (Q, withGreens) {
    var join = LEFT.filter(function (p) { return !Q.dormant[p]; });
    if (withGreens && !Q.dormant.grn) join.push('grn');
    if (join.length < 3) return false;
    var w = S.mergeInto(Q, join, 'ul', 1.08);
    Q.ulMembers = {}; for (var p in w) Q.ulMembers[p] = w[p];
    if (Q.ulMembers.grn && Q.year <= 2000) Q.leaders.ul = 'Ralph Nader';
    Q.ulUnity = 65; Q.flags.sanders = Q.flags.sanders || S.now(Q);
    S.note(Q, 'The United Left is founded under Bernie Sanders: ' + join.map(function (p) { return U.PARTIES[p].short; }).join(', ') + ' will run joint lists.' + (join.indexOf('grn') < 0 && !Q.dormant.grn ? ' The Greens stay out.' : ''));
    return join;
  };
  Ev.ulTalks = function (Q) {
    var pl = S.plan(Q), ok = Q.year < 2001 ? pl.ul2000 : (pl.ul2000 || pl.ul04);
    if (!ok) {
      Q.flags.ulTalksFailed = S.now(Q);
      S.note(Q, 'The United Left talks collapse over candidate lists.');
      return 'The talks collapse over candidate lists. The far left stays divided, for now.';
    }
    var join = S.foundUL(Q, Q.year < 2004 ? pl.grn2000 : pl.grn04);
    if (!join) return 'Too few parties are left to form an alliance.';
    return '<b>The United Left is born.</b> ' + join.map(function (p) { return U.PARTIES[p].name; }).join(', ') + ' agree to run as one alliance.';
  };

  function merge(Q, from, into, text) {
    S.mergeInto(Q, [from], into, 0.9);
    S.note(Q, text);
    Q.flags['merged_' + from] = S.now(Q);
  }

  S.mergers = function (Q) {
    var pl = S.plan(Q), now = S.now(Q), n = V.national(Q), live = function (p) { return !Q.dormant[p]; };
    // the far left unites before the 2000 election (or, failing that, by 2004)
    if (Q.dormant.ul && !Q.flags.ulDone) {
      if (pl.ul2000 && now >= pl.ulAt && now <= mi(2000, 9)) { Q.flags.ulDone = 1; S.foundUL(Q, pl.grn2000); }
      else if (!pl.ul2000 && pl.ul04 && now >= mi(2003, 6) + (pl.ulAt - mi(1999, 6))) { Q.flags.ulDone = 1; S.foundUL(Q, pl.grn04); }
    }
    // the Greens join an existing United Left after 2004
    if (live('ul') && live('grn') && pl.grn04 && now >= pl.grnAt && !Q.flags.grnJoined) {
      Q.flags.grnJoined = 1;
      var gs = n.grn || 0; S.mergeInto(Q, ['grn'], 'ul', 0.95);
      Q.ulMembers = Q.ulMembers || {}; Q.ulMembers.grn = gs; Q.ulUnity = 65;
      S.note(Q, 'The Green Party votes to join the United Left. The far left now runs a single list.');
    }
    // the two green parties
    if (live('aga') && live('grn') && Q.year >= 2002 && U.rng(Q) < 0.012)
      merge(Q, 'aga', 'grn', 'The American Green Alliance’s state chapters vote to merge into the Green Party, ending the split in the green vote.');
    else if (live('aga') && !live('grn') && live('ul') && Q.year >= 2005 && U.rng(Q) < 0.006)
      merge(Q, 'aga', 'ul', 'The American Green Alliance joins the United Left as its environmental wing.');
    // the ASP folds into the CDP when it is squeezed
    if (live('asp') && live('cdp') && Q.year >= 2003 && ((n.asp || 0) < 4.5 || (n.cdp || 0) < 13) && U.rng(Q) < 0.01)
      merge(Q, 'asp', 'cdp', 'The American Solidarity Union merges into the Christian Democratic Party: the American Solidarity Party and its Mormon, Catholic and New England partners become regional wings of the CDP.');
    // the Constitution Party into MAGA
    if (live('con') && live('maga') && U.rng(Q) < 0.05)
      merge(Q, 'con', 'maga', 'The Constitution Party dissolves itself into the MAGA Party. Howard Phillips’s heirs say Trump has taken up their cause.');
    // the two Californian parties
    if (live('cfc') && live('cnp') && Q.year >= 2001 && U.rng(Q) < 0.006)
      merge(Q, 'cfc', 'cnp', 'The Californian Freedom Coalition merges into the Californian National Party: a single party for more Californian self-government, left and right.');
  };

  // Electoral pacts: before each election, small parties under the national
  // threshold pair up into joint national lists.
  S.smallPacts = function (Q) {
    if (!Q.electionAt || Q.flags.pactsFor === Q.electionAt) return;
    Q.flags.pactsFor = Q.electionAt;
    var n = V.national(Q), thr = U.RULES.house.nationalThreshold * 100;
    var small = U.NATIONAL.filter(function (p) { return !Q.dormant[p] && p !== Q.player && (n[p] || 0) >= 0.4 && (n[p] || 0) < thr; })
      .sort(function (a, b) { return n[b] - n[a]; });
    var used = {};
    small.forEach(function (a) {
      if (used[a]) return;
      var best = null, bs = -1;
      small.forEach(function (b) {
        if (b === a || used[b] || U.vetoes(a, b)) return;
        var sc = C.compat(Q, a, b) + C.rel(Q, a, b) / 200;
        if (C.compat(Q, a, b) >= 0.5 && C.rel(Q, a, b) >= 25 && sc > bs) { bs = sc; best = b; }
      });
      if (!best) return;
      used[a] = used[best] = 1;
      Q.pacts = (Q.pacts || []).concat([{ parties: [a, best], type: 'list' }]);
      S.note(Q, 'Electoral pact: the ' + U.PARTIES[a].short + ' and ' + U.PARTIES[best].short + ' will run a joint national list, ' + ((n[a] || 0) + (n[best] || 0)).toFixed(1) + '% between them in the polls.');
    });
  };

  // after a merger the government's lists can repeat a party: tidy them
  var mergeInto = S.mergeInto;
  S.mergeInto = function (Q, members, into, retention) {
    var r = mergeInto(Q, members, into, retention), g = Q.gov;
    if (g) {
      g.coalition = g.coalition.filter(function (p, i) { return g.coalition.indexOf(p) === i && !Q.dormant[p]; });
      g.cs = g.cs.filter(function (p, i) { return g.cs.indexOf(p) === i && g.coalition.indexOf(p) < 0 && !Q.dormant[p]; });
      if (g.posts) for (var m in g.posts) if (Q.dormant[m]) { g.posts[into] = (g.posts[into] || 0) + g.posts[m]; delete g.posts[m]; }
    }
    return r;
  };

  // monthly hooks
  var aiParties = S.aiParties;
  S.tidyGov = function (Q) { var g = Q.gov; if (!g) return; g.cs = g.cs.filter(function (p, i) { return g.cs.indexOf(p) === i && g.coalition.indexOf(p) < 0 && p !== g.pmParty && !Q.dormant[p]; }); };
  // careers: each January some figures enter national politics and others retire
  S.careers = function (Q) {
    if (Q.month !== 1 || Q.flags.careersYear === Q.year || !U.CAREERS) return;
    Q.flags.careersYear = Q.year; Q.retired = Q.retired || {};
    var holds = {}; [Q.president && Q.president.name, Q.gov && Q.gov.pm, Q.leader && Q.leader.name].concat(['speaker', 'ppt', 'vp'].map(function (o) { return Q.offices && Q.offices[o] && Q.offices[o].name; })).forEach(function (n) { if (n) holds[n] = 1; });
    var party = function (n) { for (var p in U.PEOPLE) if (U.PEOPLE[p].indexOf(n) >= 0) return p; return null; };
    var ins = [], outs = [];
    for (var n in U.CAREERS) {
      var c = U.CAREERS[n], p = party(n);
      if (c[0] === Q.year && p && !Q.dormant[p]) ins.push(n + ' (' + U.PARTIES[p].short + ')');
      if (c[1] && Q.year >= c[1] && !Q.retired[n] && !holds[n]) {
        Q.retired[n] = 1; if (p) outs.push(n);
        if (p && Q.leaders && Q.leaders[p] === n && p !== Q.player) { var ex = {}; ex[n] = 1; Q.leaders[p] = S.pickPerson(Q, p, ex, 'charisma'); S.note(Q, n + ' steps down as leader of the ' + U.PARTIES[p].short + '; ' + Q.leaders[p] + ' takes over.'); }
        if (Q.senLeaders && Q.senLeaders[p] === n) delete Q.senLeaders[p];
      }
    }
    if (outs.length) S.note(Q, 'Leaving national politics this year: ' + outs.join(', ') + '.');
    if (ins.length) S.note(Q, 'New faces on the national scene: ' + ins.join(', ') + '.');
  };
  // Sanders runs for the Senate from 2006 and moves there only if his party wins a Vermont seat
  var runGen = S.runGeneralElection;
  S.runGeneralElection = function (Q) {
    var wasDeadlocked = !!Q.formation; var r = runGen(Q);
    Q.flags.deadlockElections = wasDeadlocked ? (Q.flags.deadlockElections || 0) + 1 : 0;
    if (!Q.flags.sandersSenator && Q.year >= 2006) {
      var won = (Q.senateSeats || []).some(function (x) { return x.state === 'VT' && x.type === 'pr' && (x.party === 'vpp' || x.party === 'ul'); });
      if (won) { Q.flags.sandersSenator = S.now(Q); S.note(Q, 'Bernie Sanders wins a Senate seat for Vermont and leaves the House.'); }
      else if (!Q.flags.sandersLost) { Q.flags.sandersLost = S.now(Q); S.note(Q, 'Bernie Sanders\u2019s run for the Senate falls short; he remains in the House.'); }
    }
    return r;
  };
  S.aiParties = function (Q) { aiParties(Q); S.mergers(Q); S.smallPacts(Q); S.tidyGov(Q); S.careers(Q); };

  // joint national lists: combined votes pass the threshold together; seats are split by votes
  var X = U.Elections, E = U.Electoral, R = U.RULES;
  X.houseTwoTier = function (Q, opt) {
    opt = opt || {};
    var nt = opt.nationalThreshold != null ? opt.nationalThreshold : R.house.nationalThreshold;
    var st = opt.stateThreshold != null ? opt.stateThreshold : R.house.stateThreshold;
    var stateTier = X.housePure(Q, { nationalThreshold: 0, stateThreshold: st }), nat = U.clone(V.national(Q)), lists = {};
    (Q.pacts || []).forEach(function (pk, i) {
      if (pk.type !== 'list') return;
      var mem = pk.parties.filter(function (p) { return nat[p] != null; }); if (mem.length < 2) return;
      var k = 'L' + i, sub = {}; nat[k] = 0;
      mem.forEach(function (p) { sub[p] = nat[p]; nat[k] += nat[p]; delete nat[p]; });
      lists[k] = sub;
    });
    var tier = E.divisor(nat, R.house.nationalTierSeats, R.house.prFormula, nt), natTier = {};
    for (var p in tier) {
      if (lists[p]) { var sp = E.divisor(lists[p], tier[p], 'dhondt', 0); for (var q in sp) if (sp[q]) natTier[q] = (natTier[q] || 0) + sp[q]; }
      else if (tier[p]) natTier[p] = tier[p];
    }
    var house = U.clone(stateTier.house);
    for (p in natTier) house[p] = (house[p] || 0) + natTier[p];
    return { house: house, districts: [], pr: stateTier.pr, national: natTier, byState: stateTier.byState };
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
