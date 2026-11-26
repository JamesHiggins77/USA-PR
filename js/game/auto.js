// Zero-player mode: the simulation plays every party, the LDP included.
// U.Auto.step advances one month, resolving any decision by AI choice,
// and records what happened in Q.chronicle for the live feed.
(function (G) {
  'use strict';
  var U = G.USA, F = U.Flow, Ev = U.Events, C = U.Coalition, A = U.Auto = {};
  var strip = function (s) { return String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); };

  // pick an option: earlier options (usually the mainstream line) weigh more
  A.choose = function (Q, e, opts) {
    var ok = opts.map(function (o, i) { return o.ok ? i : -1; }).filter(function (i) { return i >= 0; });
    if (!ok.length) return -1;
    if (e.id === 'offer') { // accept an AI deal unless the partner is distant
      var d = Q.formation && Q.formation.offer, pm = d && d.pm, c = pm ? C.compat(Q, Q.player, pm) : 0.5;
      var acc = ok.indexOf(0) >= 0 ? 0 : ok[0];
      return U.rng(Q) < 0.35 + 0.6 * c ? acc : ok[ok.length - 1];
    }
    var w = ok.map(function (i, k) { return 1 / (k + 1.2); }), t = U.sum(w), x = U.rng(Q) * t;
    for (var k = 0; k < ok.length; k++) { x -= w[k]; if (x <= 0) return ok[k]; }
    return ok[0];
  };

  A.record = function (Q, item) { Q.chronicle = Q.chronicle || []; item.t = U.dateStr(Q); Q.chronicle.push(item); if (Q.chronicle.length > 400) Q.chronicle.shift(); };

  // resolve pending events; returns the list of events handled this month
  A.resolve = function (Q) {
    var done = [], k = 0;
    while (Q.pendingEvent && k++ < 20) {
      var e = Ev.byId(Q.pendingEvent); if (!e) { Q.pendingEvent = null; break; }
      var opts = F.options(Q, e), i = A.choose(Q, e, opts);
      if (i < 0) { Q.pendingEvent = null; break; }
      var title = e.title, body = strip(e.body ? e.body(Q) : '');
      var txt = F.answerEvent(Q, i);
      var item = { kind: 'event', id: e.id, title: title, body: body, choice: opts[i].label, text: strip(txt) };
      A.record(Q, item); done.push(item);
    }
    if (F.canNegotiate(Q)) {
      var r = F.submitDeal(Q, C.aiDeal(Q, Q.player, []));
      var it = { kind: 'event', title: 'Investiture of ' + Q.leader.name, text: r.passed ? Q.leader.name + ' becomes Prime Minister.' : 'The investiture fails.' };
      A.record(Q, it); done.push(it);
      A.resolve(Q).forEach(function (x) { done.push(x); });
    }
    return done;
  };

  A.step = function (Q) {
    Q.zero = true;
    var pre = A.resolve(Q), res = F.skip(Q) || { out: {} };
    var post = A.resolve(Q);
    if (Q.report && Q.report.length) A.record(Q, { kind: 'news', title: 'News', text: Q.report.map(strip).join(' ') });
    if (res.out.general) A.record(Q, { kind: 'election', title: 'General election', text: res.out.general.date || '' });
    if (res.out.presidential) A.record(Q, { kind: 'election', title: 'Presidential election', text: Q.president.name + ' (' + U.partyInfo(Q.president.party).short + ') wins' });
    return { out: res.out, events: pre.concat(post) };
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
