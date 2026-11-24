// UI-independent game flow, used by the interface and by headless playtests.
(function (G) {
  'use strict';
  var U = G.USA, S = U.Game, K = U.Content, Ev = U.Events, C = U.Coalition, F = U.Flow = {};

  function val(x, Q) { return typeof x === 'function' ? x(Q) : x; }
  F.val = val;

  F.begin = function (Q) { Q.pendingEvent = Q.pendingEvent || Ev.next(Q); return Q.pendingEvent; };

  F.cards = function (Q) {
    return K.CARDS.filter(function (c) {
      if (c.cond && !c.cond(Q)) return false;
      return !(Q.timers['card_' + c.id] > 0);
    });
  };
  F.options = function (Q, scene) {
    return val(scene.options, Q).map(function (o) {
      var ok = o.cond ? o.cond(Q) : true;
      return { label: val(o.label, Q), sub: val(o.sub, Q), ok: ok === true, why: ok === true ? '' : ok, raw: o };
    });
  };
  F.playCard = function (Q, card, idx) {
    var o = F.options(Q, card)[idx];
    if (!o || !o.ok || Q.actionsLeft <= 0) return null;
    Q.actionsLeft -= 1; Q.timers['card_' + card.id] = card.cooldown || 0;
    var t = o.raw.act(Q); F.clampAll(Q); return t;
  };
  F.answerEvent = function (Q, idx) {
    var e = Ev.byId(Q.pendingEvent), o = F.options(Q, e)[idx];
    if (!o || !o.ok) return null;
    Q.pendingEvent = null;
    var t = o.raw.act(Q); F.clampAll(Q);
    Q.log.push({ t: U.dateStr(Q), text: e.title + ': ' + o.label + '.' });
    return t;
  };
  F.clampAll = function (Q) {
    Q.unity = U.clamp(Q.unity, 0, 100); Q.morale = U.clamp(Q.morale, 0, 100);
    Q.govApproval = U.clamp(Q.govApproval, 5, 95); Q.leader.approval = U.clamp(Q.leader.approval, 0, 100);
    for (var k in Q.factions) Q.factions[k].dissent = U.clamp(Q.factions[k].dissent, 0, 100);
    Q.funds = Math.max(-5, U.round1(Q.funds));
  };

  // End the month. Returns {general, presidential} results when held.
  F.end = function (Q) {
    var due = S.endMonth(Q), out = {};
    if (due.general) out.general = S.runGeneralElection(Q);
    if (due.president) out.presidential = S.runPresidential(Q);
    F.clampAll(Q);
    F.begin(Q);
    return out;
  };

  // ---- player-led negotiations ----
  F.canNegotiate = function (Q) {
    return !!Q.formation && !Q.formation.offer && (Q.house[Q.player] || 0) >= 40 && !(Q.timers.negotiate > 0);
  };
  F.blankDeal = function (Q) { return { pm: Q.player, coalition: [Q.player], cs: [], posts: {}, concessions: {} }; };
  F.normalisePosts = function (Q, deal) {
    var tot = C.seats(Q, deal.coalition);
    deal.coalition.forEach(function (p) { if (deal.posts[p] == null) deal.posts[p] = Math.max(1, Math.round(20 * Q.house[p] / tot)); });
    for (var p in deal.posts) if (deal.coalition.indexOf(p) < 0) delete deal.posts[p];
  };
  F.submitDeal = function (Q, deal) {
    Q.timers.negotiate = 1;
    var inv = S.tryInvestiture(Q, deal);
    Q.lastVote = { title: 'Investiture of ' + Q.leader.name, house: inv.second || inv.first };
    if (inv.passed) { S.formGovernment(Q, deal, Q.leader.name); return { passed: true, inv: inv }; }
    deal.coalition.concat(deal.cs).forEach(function (p) { if (p !== Q.player) C.addRel(Q, Q.player, p, -3); });
    Q.leader.approval -= 4;
    return { passed: false, inv: inv };
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
