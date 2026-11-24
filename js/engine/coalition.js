// Coalition negotiations (brief §10). Partners weigh policy, trust, office,
// red lines, factional pressure and concessions; a majority never forms
// automatically. Every assessment returns human-readable reasons.
(function (G) {
  'use strict';
  var U = G.USA, E = U.Electoral, C = U.Coalition = {};

  C.compat = function (Q, a, b) {
    var pos = U.Elections.pos(Q);
    return U.clamp(1 - E.dist(pos[a], pos[b]) / 18, 0, 1);
  };
  C.rel = function (Q, a, b) {
    var k = a < b ? a + '|' + b : b + '|' + a; return Q.rel[k] != null ? Q.rel[k] : 40;
  };
  C.addRel = function (Q, a, b, d) {
    var k = a < b ? a + '|' + b : b + '|' + a; Q.rel[k] = U.clamp(C.rel(Q, a, b) + d, 0, 100);
  };

  // Concessions a party can ask for (brief §8, §10). value: how much it moves them.
  C.DEMANDS = {
    sdlp: [{ id: 'health', text: 'Universal health coverage bill', value: 14, econ: -1.5 }, { id: 'wage', text: 'Minimum wage rise', value: 9, econ: -1 }],
    cdp: [{ id: 'balanced', text: 'Balanced-budget rule', value: 12, econ: 1.5 }, { id: 'family', text: 'Family tax credit', value: 8, soc: 0.5 }],
    asp: [{ id: 'transfers', text: 'Regional investment for constituent states', value: 14, deficit: 0.2 }, { id: 'family', text: 'Family tax credit', value: 8, soc: 0.5 }],
    ul: [{ id: 'climate', text: 'Climate and clean-energy programme', value: 15, econ: -1 }, { id: 'health', text: 'Universal health coverage bill', value: 10, econ: -1.5 }],
    reform: [{ id: 'transfers', text: 'Regional investment for Reform\u2019s states', value: 14, deficit: 0.2 }, { id: 'balanced', text: 'Balanced-budget pledge', value: 10, econ: 1 }],
    cc: [{ id: 'taxcut', text: 'Across-the-board tax cut', value: 15, econ: 2, deficit: 0.5 }, { id: 'defence', text: 'Defence spending increase', value: 8, deficit: 0.2 }],
    lib: [{ id: 'taxcut', text: 'Across-the-board tax cut', value: 14, econ: 2, deficit: 0.5 }, { id: 'civlib', text: 'Civil-liberties package', value: 8, soc: -0.5 }],
    aga: [{ id: 'local', text: 'Alaska, Rhode Island and Virginia projects', value: 16, deficit: 0.1 }, { id: 'climate', text: 'Climate and clean-energy programme', value: 8, econ: -1 }],
    lsp: [{ id: 'texas', text: 'Texan control over resource revenues', value: 22, fed: 1 }],
    srp: [{ id: 'states', text: 'States’ rights package', value: 18, fed: 1.5, soc: 1 }],
    default: [{ id: 'local', text: 'Regional investment package', value: 14, deficit: 0.1 }, { id: 'devolve', text: 'Devolution commission', value: 10, fed: 1 }]
  };
  C.demandsOf = function (p) { if (U.LEFT_MEMBERS[p] && p !== 'vpp') return C.DEMANDS.ul; return C.DEMANDS[p] || C.DEMANDS.default; };

  // keep the cabinet at 20 posts: trim the party holding most, then pad the PM's
  C.fitPosts = function (deal) {
    var sum = function () { return U.sum(deal.posts); }, guard = 0;
    while (sum() > 20 && guard++ < 100) { var big = Object.keys(deal.posts).sort(function (a, b) { return deal.posts[b] - deal.posts[a]; })[0]; if (deal.posts[big] <= 1) break; deal.posts[big]--; }
    if (sum() < 20 && deal.posts[deal.pm] != null) deal.posts[deal.pm] += 20 - sum();
    return deal;
  };
  C.seats = function (Q, list) { return list.reduce(function (s, p) { return s + (Q.house[p] || 0); }, 0); };

  // deal: {pm, coalition:[...incl pm], cs:[...], posts:{p:n}, concessions:{p:[ids]}}
  // Returns {score, ok, reasons}
  C.assess = function (Q, p, deal, role) {
    var reasons = [], pm = deal.pm, P = U.PARTIES[p], score = 0;
    var cp = C.compat(Q, p, pm);
    score += cp * 55; reasons.push('Policy distance to ' + U.PARTIES[pm].short + ': ' + Math.round(cp * 100) + '% compatible');
    var r = C.rel(Q, p, pm); score += (r - 50) * 0.4;
    if (r < 35) reasons.push('Distrusts the ' + U.PARTIES[pm].short + ' (' + Math.round(r) + ')'); else if (r > 60) reasons.push('Good relations with the ' + U.PARTIES[pm].short);
    var veto = deal.coalition.filter(function (q) { return q !== p && U.vetoes(p, q); });
    if (role === 'coalition') {
      if (veto.length) { score -= 100; reasons.push('Red line: will not sit in cabinet with ' + veto.map(function (q) { return U.PARTIES[q].short; }).join(', ')); }
      var others = deal.coalition.filter(function (q) { return q !== p && q !== pm; });
      others.forEach(function (q) { var c = C.compat(Q, p, q); if (c < 0.45) { score -= 10; reasons.push('Uneasy alongside the ' + U.PARTIES[q].short); } });
      var posts = (deal.posts && deal.posts[p]) || 0, fair = Math.max(1, Math.round(20 * (Q.house[p] || 0) / Math.max(1, C.seats(Q, deal.coalition))));
      score += P.office * 25 + (posts - fair) * 4;
      reasons.push(posts + ' cabinet posts offered (proportional share: ' + fair + ')');
      score -= 18; // cost of shared responsibility
    } else {
      if (veto.length && veto.indexOf(pm) >= 0) { score -= 60; reasons.push('Will not sustain a ' + U.PARTIES[pm].short + ' Prime Minister'); }
      else if (veto.length) { score -= 15; reasons.push('Dislikes the presence of ' + veto.map(function (q) { return U.PARTIES[q].short; }).join(', ')); }
      score -= 5;
    }
    var conc = (deal.concessions && deal.concessions[p]) || [];
    conc.forEach(function (id) {
      var d = C.demandsOf(p).filter(function (x) { return x.id === id; })[0];
      if (d) { score += d.value; reasons.push('Concession: ' + d.text + ' (+' + d.value + ')'); }
    });
    // voters punish parties that prop up an unpopular government
    if (Q.govApproval < 35 && p !== pm) { score -= 8; reasons.push('Government is unpopular: voters may punish partners'); }
    // parties that are surging prefer opposition / fresh elections
    var trend = (Q.trend && Q.trend[p]) || 0;
    if (trend > 1.5) { score -= 8; reasons.push('Rising in the polls: tempted by opposition'); }
    var ok = score >= (role === 'coalition' ? 45 : 30);
    return { score: Math.round(score), ok: ok, reasons: reasons };
  };

  // How each party will vote on a PM candidate under a deal.
  C.investitureVote = function (Q, deal) {
    var verdicts = {};
    U.ALL_PARTIES.forEach(function (p) {
      if (!Q.house[p]) return;
      if (deal.coalition.indexOf(p) >= 0 && p === deal.pm) { verdicts[p] = 'yes'; return; }
      var inC = deal.coalition.indexOf(p) >= 0, inS = (deal.cs || []).indexOf(p) >= 0;
      if (inC || inS) { verdicts[p] = C.assess(Q, p, deal, inC ? 'coalition' : 'cs').ok ? 'yes' : 'no'; return; }
      var cp = C.compat(Q, p, deal.pm), r = C.rel(Q, p, deal.pm);
      verdicts[p] = (cp > 0.62 && r > 55) ? 'abstain' : (cp > 0.5 && r > 45 ? 'abstain' : 'no');
    });
    return U.Parliament.count(Q, 'house', function (p, sub) {
      var v = verdicts[p] || 'no';
      if (p === 'ul' && v === 'yes') { var st = U.LEFT_MEMBERS[sub] || 'hard'; return st === 'reformist' ? 'yes' : st === 'hard' ? 'abstain' : 'no'; }
      if (p === 'aga' && sub && sub !== 'other' && U.PARTIES.aga.chapters[sub]) {
        var ch = U.PARTIES.aga.chapters[sub], pmPos = U.Elections.pos(Q)[deal.pm];
        var d = E.dist(ch, pmPos);
        if (v === 'yes' && d > 9) return 'abstain';
        if (v === 'no' && d < 4) return 'abstain';
      }
      return v;
    });
  };

  C.passes = function (count, ballot) {
    var need = Math.floor(U.RULES.house.total / 2) + 1;
    if (ballot === 1) return count.yes >= need;
    return count.yes > count.no;
  };

  // AI builds the most plausible deal for a PM party.
  C.aiDeal = function (Q, pm, exclude) {
    exclude = exclude || [];
    var need = Math.floor(U.RULES.house.total / 2) + 1;
    var deal = { pm: pm, coalition: [pm], cs: [], posts: {}, concessions: {} };
    var cands = U.ALL_PARTIES.filter(function (p) { return p !== pm && Q.house[p] && exclude.indexOf(p) < 0; })
      .sort(function (a, b) { return (C.compat(Q, b, pm) + C.rel(Q, b, pm) / 200) - (C.compat(Q, a, pm) + C.rel(Q, a, pm) / 200); });
    function alloc() {
      var tot = C.seats(Q, deal.coalition); deal.posts = {};
      deal.coalition.forEach(function (p) { deal.posts[p] = Math.max(1, Math.round(20 * Q.house[p] / tot)); });
      C.fitPosts(deal);
    }
    cands.forEach(function (p) {
      if (C.seats(Q, deal.coalition) >= need) return;
      if (deal.coalition.some(function (q) { return U.vetoes(p, q); })) return;
      deal.coalition.push(p); deal.concessions[p] = [C.demandsOf(p)[0].id]; alloc();
      if (!C.assess(Q, p, deal, 'coalition').ok) { deal.coalition.pop(); delete deal.concessions[p]; alloc(); }
    });
    alloc();
    // fill with confidence & supply
    cands.forEach(function (p) {
      if (deal.coalition.indexOf(p) >= 0 || C.seats(Q, deal.coalition.concat(deal.cs)) >= need) return;
      deal.concessions[p] = [C.demandsOf(p)[0].id];
      deal.cs.push(p);
      if (!C.assess(Q, p, deal, 'cs').ok) { deal.cs.pop(); delete deal.concessions[p]; }
    });
    return deal;
  };

  // Which parties would plausibly try to form a government, best first.
  C.formateurs = function (Q) {
    var big = U.NATIONAL.filter(function (p) { return (Q.house[p] || 0) >= 60; })
      .sort(function (a, b) { return Q.house[b] - Q.house[a]; });
    return big.slice(0, 4);
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
