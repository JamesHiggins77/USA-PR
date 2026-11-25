// Government formation talks led by the LDP.
// Every party starts with a stance on an LDP-led government (usually no, or an
// abstention). The LDP has five rounds of talks; in each it makes one party an
// offer: cabinet posts, the Speakership, committee chairs, bills it wants,
// referendums, and for regional parties investment, autonomy or a referendum on
// autonomy or independence. A good offer turns a no into an abstention or a
// yes, or an abstention into a yes. Expected coalition partners (close allies,
// and parties already governing with the LDP) want cabinet posts: snub them and
// they vote no and think less of the LDP. Then the House votes.
(function (G) {
  'use strict';
  var U = G.USA, C = U.Coalition, S = U.Game, F = U.Flow;
  var short = function (p) { return U.PARTIES[p].short; };

  // ---- what each party can be offered ----
  var prof = function (p) { return (U.PARTY_PROFILES[p] || { ax: {} }).ax; };
  var regional = function (p) { var k = U.PARTIES[p].kind; return k === 'regional' || k === 'federation'; };
  var T = U.Talks = {
    MAX_ROUNDS: 5, MAX_POSTS_OFFERED: 14, MAX_CHAIRS: 12,
    // bills the party wants, and a referendum on its cause
    bills: function (p) { return C.demandsOf(p).filter(function (d) { return d.id !== 'local' && d.id !== 'transfers' && d.id !== 'devolve'; }); },
    referendum: function (p) {
      var R = { sdlp: 'Referendum on a national health service', cdp: 'Referendum on a balanced-budget amendment', reform: 'Referendum on term limits', lib: 'Referendum on legalising marijuana',
        con: 'Referendum on a school-prayer amendment', grn: 'Referendum on a carbon tax', ul: 'Referendum on public ownership of utilities', cc: 'Referendum on a flat tax', asp: 'Referendum on family policy',
        dsa: 'Referendum on a wealth tax', wfp: 'Referendum on a living wage', cpusa: 'Referendum on public ownership of utilities', maga: 'Referendum on immigration', afp: 'Referendum on immigration' };
      return R[p] || (regional(p) ? null : 'Referendum on electoral reform');
    },
    canAutonomy: function (p) { return regional(p) || (prof(p).fed || 0) >= 7; },
    canIndependence: function (p) { return regional(p) && (U.PARTIES[p].secession > 0 || ['lsp', 'srp', 'cnp', 'alk', 'aloha', 'nenp'].indexOf(p) >= 0); }
  };

  // expected coalition partners: close allies and parties already in government with the LDP
  T.expected = function (Q, p) {
    if ((Q.house[p] || 0) < 10) return false;
    if (Q.gov && Q.gov.pmParty === Q.player && Q.gov.coalition.indexOf(p) >= 0) return true;
    return C.rel(Q, Q.player, p) >= 60 && C.compat(Q, Q.player, p) >= 0.6;
  };
  // a fair share of the 20 posts among the LDP and its expected partners
  T.fair = function (Q, p) { var ex = U.ALL_PARTIES.filter(function (q) { return q !== Q.player && T.expected(Q, q); }); if (ex.indexOf(p) < 0) ex.push(p); return T.fairPosts(Q, p, ex); };
  T.fairPosts = function (Q, p, partners) {
    var tot = C.seats(Q, [Q.player].concat(partners)); return Math.max(1, Math.round(20 * (Q.house[p] || 0) / Math.max(1, tot)));
  };

  // value of an offer to a party (points on the same scale as C.unprompted's margin)
  T.value = function (Q, p, o) {
    var P = U.PARTIES[p], ax = prof(p), office = P.office || 0.4, v = 0, why = [];
    if (o.posts) { var pv = Math.round(o.posts * (4 + 8 * office)); v += pv - 10; why.push(o.posts + ' cabinet post' + (o.posts > 1 ? 's' : '') + ' (+' + pv + ', less 10 for sharing responsibility)'); }
    if (o.speaker) { var sv = Math.round(8 + 14 * office); v += sv; why.push('the Speakership (+' + sv + ')'); }
    if (o.chairs) { var cv = o.chairs * 3; v += cv; why.push(o.chairs + ' committee chair' + (o.chairs > 1 ? 's' : '') + ' (+' + cv + ')'); }
    (o.bills || []).forEach(function (id) { var d = C.demandsOf(p).filter(function (x) { return x.id === id; })[0]; if (d) { v += d.value; why.push(d.text + ' (+' + d.value + ')'); } });
    if (o.referendum) { var rv = 6 + Math.max(0, ax.pop || 0); v += rv; why.push(T.referendum(p) + ' (+' + rv + ')'); }
    if (o.investment) { var iv = regional(p) ? 14 : 5; v += iv; why.push('investment in its states (+' + iv + ')'); }
    if (o.autonomy) { var av = regional(p) ? 16 : 4; v += av; why.push('more autonomy for its states (+' + av + ')'); }
    if (o.indepRef) { var xv = T.canIndependence(p) ? 26 : 0; v += xv; why.push('a referendum on independence (+' + xv + ')'); }
    return { value: v, why: why };
  };
  // stance from a margin
  T.stanceOf = function (m) { return m >= 0 ? 'yes' : m >= -15 ? 'abstain' : 'no'; };

  // talks belong to one attempt at forming a government
  T.key = function (Q) { var f = Q.formation || {}; return [f.start, f.stage, f.round, S.now(Q)].join('|'); };
  T.start = function (Q) {
    var t = Q.talks = { key: T.key(Q), rounds: T.MAX_ROUNDS, base: {}, stance: {}, offers: {}, notes: {}, round: 0 };
    U.ALL_PARTIES.forEach(function (p) {
      if (p === Q.player || !Q.house[p]) return;
      var un = C.unprompted(Q, p, Q.player);
      t.base[p] = un.margin;
      var st = un.vote;
      if (T.expected(Q, p)) { st = 'abstain'; t.notes[p] = 'Expects to be offered a place in the cabinet'; }
      else t.notes[p] = st === 'yes' ? 'Ready to back an LDP Prime Minister' : st === 'abstain' ? 'Would abstain as things stand' : 'Will vote against as things stand';
      t.stance[p] = st;
    });
    return t;
  };

  // one round of talks with one party
  T.offer = function (Q, p, o) {
    var t = Q.talks; if (!t || t.rounds <= 0) return null;
    var used = 0; for (var q in t.offers) if (q !== p) used += t.offers[q].posts || 0;
    if ((o.posts || 0) + used > T.MAX_POSTS_OFFERED) return { error: 'Only ' + (T.MAX_POSTS_OFFERED - used) + ' cabinet posts are left to offer (the LDP keeps at least six).' };
    if (o.speaker) for (q in t.offers) if (q !== p && t.offers[q].speaker) return { error: 'The Speakership is already promised to the ' + short(q) + '.' };
    t.rounds -= 1; t.round += 1;
    var val = T.value(Q, p, o), m = t.base[p] + val.value, before = t.stance[p];
    var expected = T.expected(Q, p), fair = T.fair(Q, p);
    if (expected && (o.posts || 0) < Math.max(1, fair - 2)) {
      // a snub: an expected partner offered too little office
      C.addRel(Q, Q.player, p, -8);
      t.stance[p] = 'no'; t.offers[p] = o;
      t.notes[p] = 'Snubbed: expected about ' + fair + ' cabinet posts and was offered ' + (o.posts || 0);
      return { party: p, before: before, after: 'no', text: 'The ' + short(p) + ' feels snubbed. It expected a real share of the cabinet, about ' + fair + ' posts, and now says it will vote no.' };
    }
    var st = T.stanceOf(m), rank = { no: 0, abstain: 1, yes: 2 };
    if (rank[st] < rank[before]) st = before; // an offer never makes things worse
    t.stance[p] = st; t.offers[p] = o;
    t.notes[p] = (st === 'yes' ? 'Will vote yes' : st === 'abstain' ? 'Will abstain' : 'Still voting no') + (val.why.length ? ': offered ' + val.why.join(', ') : '');
    var moved = st !== before;
    var need = st === 'no' ? -15 - m : st === 'abstain' ? -m : 0;
    return { party: p, before: before, after: st, text: moved ? 'The ' + short(p) + ' moves from ' + before + ' to ' + st + '.' : 'The ' + short(p) + ' is not persuaded' + (need > 0 ? ' (it wants roughly ' + Math.ceil(need) + ' points more)' : '') + '.' };
  };

  // the deal implied by the talks
  T.deal = function (Q) {
    var t = Q.talks, d = { pm: Q.player, coalition: [Q.player], cs: [], abstain: [], posts: {}, concessions: {} };
    for (var p in t.stance) {
      var o = t.offers[p] || {}, st = T.voteOf(Q, p);
      if (st === 'yes') { if (o.posts) { d.coalition.push(p); d.posts[p] = o.posts; } else d.cs.push(p); }
      else if (st === 'abstain') d.abstain.push(p);
      var cs = [].concat(o.bills || []); if (o.speaker) cs.push('speaker'); if (cs.length) d.concessions[p] = cs;
    }
    var used = 0; for (p in d.posts) used += d.posts[p]; d.posts[Q.player] = 20 - used;
    return d;
  };
  // the stance a party takes at the vote: expected partners left out of the cabinet vote no
  T.voteOf = function (Q, p) {
    var t = Q.talks, st = (t && t.stance[p]) || 'no';
    if (T.expected(Q, p) && !((t.offers[p] || {}).posts)) return 'no';
    return st;
  };
  T.count = function (Q) {
    return U.Parliament.count(Q, 'house', function (p) { if (p === Q.player) return 'yes'; return T.voteOf(Q, p); });
  };

  // the House votes
  T.vote = function (Q) {
    var t = Q.talks, d = T.deal(Q), c = T.count(Q), ballot = S.ballot ? S.ballot(Q) : 2, ok = C.passes(c, ballot);
    Q.timers.negotiate = 1; Q.lastVote = { title: 'Investiture of ' + Q.leader.name, house: c };
    if (Q.formation && Q.formation.stage === 'nominee') Q.formation.playerTried = true;
    // expected partners left out of the cabinet resent it
    for (var p in t.stance) if (T.expected(Q, p) && d.coalition.indexOf(p) < 0) { C.addRel(Q, Q.player, p, -6); S.note(Q, 'The ' + short(p) + ' is left out of the cabinet it expected to join, votes no and resents the snub.'); }
    if (ok) {
      S.formGovernment(Q, d, Q.leader.name);
      for (p in t.offers) {
        var o = t.offers[p];
        if (t.stance[p] === 'no') continue;
        var add = function (txt) { Q.pendingConcessions = (Q.pendingConcessions || []).concat([{ party: p, id: 'talks', text: txt, due: S.now(Q) + 24 }]); };
        if (o.referendum) add(T.referendum(p));
        if (o.investment) { add('Investment in the ' + short(p) + '’s states'); Q.spending = (Q.spending || 0) + 0.1; }
        if (o.autonomy) { add('More autonomy for the ' + short(p) + '’s states'); }
        if (o.indepRef) { add('A referendum on independence for the ' + short(p) + '’s state'); Q.flags['indepRef_' + p] = S.now(Q) + 24; }
        if (o.chairs) Q.chairs = (Q.chairs || {}), Q.chairs[p] = o.chairs;
      }
      Q.talks = null;
      return { passed: true, count: c, ballot: ballot };
    }
    for (p in t.offers) if (t.stance[p] !== 'no') C.addRel(Q, Q.player, p, -3);
    Q.leader.approval -= 4; Q.talks = null;
    if (Q.formation && Q.formation.stage === 'nominee') { S.note(Q, Q.leader.name + ' fails the investiture vote.'); S.formationFailed(Q, Q.player); }
    return { passed: false, count: c, ballot: ballot };
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
