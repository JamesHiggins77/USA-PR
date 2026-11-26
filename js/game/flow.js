// UI-independent game flow, used by the interface and by headless playtests.
(function (G) {
  'use strict';
  var U = G.USA, S = U.Game, K = U.Content, Ev = U.Events, C = U.Coalition, F = U.Flow = {};

  function val(x, Q) { return typeof x === 'function' ? x(Q) : x; }
  F.val = val;

  F.begin = function (Q) { S.migrateFactions(Q); F.ensureDecks(Q); Q.pendingEvent = Q.pendingEvent || Ev.next(Q); return Q.pendingEvent; };

  // ---- the hand ----
  F.ensureDecks = function (Q) { if (!Q.decks) U.Decks.init(Q); };
  F.cardAt = function (Q, slot) { var h = Q.hand[slot]; return h ? U.Decks.card(h.id) : null; };
  F.cardUsable = function (Q, slot) {
    var c = F.cardAt(Q, slot); if (!c) return false;
    if (c.cond && !c.cond(Q)) return 'Not playable at the moment.';
    return F.options(Q, c).some(function (o) { return o.ok; }) ? true : 'No option is available right now.';
  };
  F.options = function (Q, scene) {
    return val(scene.options, Q).map(function (o) {
      var ok = o.cond ? o.cond(Q) : true;
      return { label: val(o.label, Q), sub: val(o.sub, Q), ok: ok === true, why: ok === true ? '' : ok, raw: o };
    });
  };
  // Play option idx of the card in a slot; the month then advances.
  F.playHand = function (Q, slot, idx) {
    var c = F.cardAt(Q, slot), o = c && F.options(Q, c)[idx];
    if (!o || !o.ok || Q.pendingEvent) return null;
    Q.cardBoost = U.RULES.government.cardBoost;
    var t = o.raw.act(Q); Q.cardBoost = 1; F.clampAll(Q);
    Q.log.push({ t: U.dateStr(Q), text: c.title + ': ' + o.label + '.' });
    U.Decks.toDiscard(Q, slot);
    return { text: t, out: F.end(Q) };
  };
  F.discard = function (Q, slot) {
    if (!Q.hand[slot] || Q.pendingEvent) return null;
    U.Decks.toDiscard(Q, slot);
    return { text: 'You set the card aside.', out: F.end(Q) };
  };
  // let a month pass without playing a card (the hand is kept)
  F.skip = function (Q) {
    if (Q.pendingEvent) return null;
    return { text: 'You let the month pass.', out: F.end(Q) };
  };
  // skip several months, stopping at anything that needs the player:
  // an event, an election, government formation talks or an offer
  F.skipAhead = function (Q, max) {
    var n = 0, out = {};
    while (n < (max || 12) && !Q.pendingEvent) {
      out = F.end(Q); n++;
      if (out.general || out.presidential || (Q.formation && (F.canNegotiate(Q) || Q.formation.offer))) break;
    }
    return { text: 'You let ' + n + ' month' + (n > 1 ? 's' : '') + ' pass.', out: out };
  };
  F.discardAll = function (Q) {
    if (Q.pendingEvent) return null;
    for (var i = 0; i < Q.hand.length; i++) U.Decks.toDiscard(Q, i);
    return { text: 'You clear your desk and let the month pass.', out: F.end(Q) };
  };
  // Fill empty slots automatically, cycling through the decks (used by playtests).
  F.autoDraw = function (Q, pick) {
    for (var i = 0; i < Q.hand.length; i++) if (!Q.hand[i]) {
      var ds = U.Decks.ORDER.filter(function (d) { return U.Decks.canDraw(Q, d) === true; });
      if (!ds.length) return; U.Decks.draw(Q, pick ? pick(ds) : ds[i % ds.length], i);
    }
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
    if (due.state) out.state = S.runStateElections(Q, !!out.presidential);
    F.clampAll(Q);
    F.begin(Q);
    return out;
  };

  // ---- player-led negotiations ----
  F.canNegotiate = function (Q) {
    return !!Q.formation && !Q.formation.offer && (Q.house[Q.player] || 0) >= 40 && !(Q.timers.negotiate > 0);
  };
  F.speakerOffered = function (deal) { for (var p in deal.concessions) if (deal.concessions[p].indexOf('speaker') >= 0) return p; return null; };
  F.blankDeal = function (Q) { return { pm: Q.player, coalition: [Q.player], cs: [], abstain: [], posts: {}, concessions: {} }; };
  F.normalisePosts = function (Q, deal) {
    var tot = C.seats(Q, deal.coalition);
    deal.coalition.forEach(function (p) { if (deal.posts[p] == null) deal.posts[p] = Math.max(1, Math.round(20 * Q.house[p] / tot)); });
    for (var p in deal.posts) if (deal.coalition.indexOf(p) < 0) delete deal.posts[p];
    if (U.sum(deal.posts) > 20) C.fitPosts(deal);
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
