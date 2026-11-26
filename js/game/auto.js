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

  // the month's newspaper: headlines, each with a story behind it
  var PI = function (p) { return U.partyInfo(p); };
  A.edition = function (Q, r, before, date) {
    var items = [], V = U.Votes, n = V.national(Q);
    if (r.out.presidential) items.push({ kind: 'election', teaser: 'AMERICA VOTES: THE RACE FOR THE WHITE HOUSE', teaserStory: 'The polls have closed in the presidential election. The results are coming in state by state.', head: Q.president.name.toUpperCase() + ' WINS THE PRESIDENCY', story: Q.president.name + ' (' + PI(Q.president.party).name + ') is elected President' + (Q.offices && Q.offices.vp ? ', with ' + Q.offices.vp.name + ' as Vice President' : '') + '.', elec: 'p' });
    if (r.out.general) { var g = r.out.general, ord = Object.keys(g.house).sort(function (a, b) { return g.house[b] - g.house[a]; });
      items.push({ kind: 'election', teaser: 'AMERICA VOTES: A NEW CONGRESS', teaserStory: 'The polls have closed in the general election. The results are coming in state by state.', head: PI(ord[0]).short + ' FIRST AS VOTERS ELECT A NEW CONGRESS', story: 'House seats: ' + ord.slice(0, 7).map(function (p) { return PI(p).short + ' ' + g.house[p] + ((g.before && g.before[p] != null) ? ' (' + (g.house[p] - g.before[p] >= 0 ? '+' : '') + (g.house[p] - g.before[p]) + ')' : ''); }).join(', ') + '. ' + U.majority() + ' are needed for a majority.', elec: 'g' }); }
    r.events.forEach(function (e) {
      items.push({ kind: 'event', head: e.title, story: [e.body, e.choice ? 'Outcome: ' + e.choice + '.' : '', e.text].filter(Boolean).join(' '), vote: e.vote });
    });
    (r.news || []).forEach(function (t) { t.split(/(?<=[a-z\)]{2}\.)\s+(?=[A-Z])/).forEach(function (x) { if (x.length > 8 && !(r.out.presidential && /elected President/.test(x))) items.push({ kind: 'news', head: x.length > 90 ? x.slice(0, 87).replace(/\s\S*$/, '') + '…' : x, story: x }); }); });
    // the regular pages: polls, economy, the government, the parties
    var x = before.x || {}, ec = Q.econ, pick = function (a) { return a[Math.floor(U.rng(Q) * a.length)]; }, pool = [];
    var gpm = Q.gov && Q.gov.pm, gp = Q.gov && Q.gov.pmParty;
    if (x.unemp != null && Math.abs(ec.unemp - x.unemp) >= 0.1) pool.push({ w: 3, kind: 'economy', head: 'Jobless rate ' + (ec.unemp > x.unemp ? 'rises' : 'falls') + ' to ' + ec.unemp.toFixed(1) + '%', story: 'The economy is growing at ' + ec.growth.toFixed(1) + '% a year; inflation is ' + ec.infl.toFixed(1) + '%. The federal deficit stands at ' + ec.deficit.toFixed(1) + '% of GDP, and debt at ' + Math.round(ec.debt) + '%.' });
    if (x.infl != null && Math.abs(ec.infl - x.infl) >= 0.15) pool.push({ w: 2, kind: 'economy', head: 'Prices ' + (ec.infl > x.infl ? 'climb: inflation at ' : 'cool: inflation down to ') + ec.infl.toFixed(1) + '%', story: 'Annual inflation is ' + ec.infl.toFixed(1) + '%, with growth at ' + ec.growth.toFixed(1) + '% and unemployment at ' + ec.unemp.toFixed(1) + '%.' });
    if (ec.growth < 0) pool.push({ w: 3, kind: 'economy', head: pick(['Economy shrinks as recession bites', 'Recession deepens', 'Factories idle as the slump goes on']), story: 'Output is falling at ' + Math.abs(ec.growth).toFixed(1) + '% a year. Unemployment is ' + ec.unemp.toFixed(1) + '%.' });
    else if (ec.growth > 4 && U.rng(Q) < 0.25) pool.push({ w: 1, kind: 'economy', head: pick(['Boom times: growth tops 4%', 'Economy roars ahead', 'Markets hit new highs']), story: 'Growth is running at ' + ec.growth.toFixed(1) + '% a year and unemployment is ' + ec.unemp.toFixed(1) + '%.' });
    if (x.gov != null && Math.abs(Q.govApproval - x.gov) >= 2 && gpm) pool.push({ w: 3, kind: 'gov', head: (Q.govApproval > x.gov ? 'Good month for the ' : 'Bad month for the ') + gpm + ' government', story: 'Approval of the government led by Prime Minister ' + gpm + ' (' + PI(gp).short + ') is ' + Math.round(Q.govApproval) + '%, ' + (Q.govApproval > x.gov ? 'up' : 'down') + ' ' + Math.abs(Q.govApproval - x.gov).toFixed(0) + ' points. Coalition: ' + Q.gov.coalition.map(function (p) { return PI(p).short; }).join(', ') + (Q.gov.cs.length ? '; supported by ' + Q.gov.cs.map(function (p) { return PI(p).short; }).join(', ') : '') + '.' });
    if (x.pres != null && Math.abs(Q.president.approval - x.pres) >= 2) pool.push({ w: 2, kind: 'gov', head: 'President ' + Q.president.name.split(' ').pop() + (Q.president.approval > x.pres ? ' rides higher' : ' loses ground') + ' in approval', story: 'President ' + Q.president.name + ' (' + PI(Q.president.party).short + ') has an approval rating of ' + Math.round(Q.president.approval) + '%.' });
    if (Q.formation) pool.push({ w: 5, kind: 'gov', head: pick(['Talks drag on with no government in sight', 'Coalition talks: still no deal', 'Capitol Hill waits for a government']), story: Q.formation.stage === 'open' ? Q.formation.monthsLeft + ' months remain before a new election would be called.' : 'The President\u2019s nominee now faces the House.' });
    if (Q.electionAt) { var mo = Q.electionAt - U.monthIndex(Q.year, Q.month); if (mo >= 0 && mo <= 3) pool.push({ w: 5, kind: 'polls', head: 'Campaign trail: ' + (mo ? mo + ' month' + (mo > 1 ? 's' : '') + ' to election day' : 'voters go to the polls this month'), story: 'The parties are in campaign mode. ' + Object.keys(n).sort(function (a, b) { return n[b] - n[a]; }).slice(0, 4).map(function (p) { return PI(p).short + ' ' + n[p].toFixed(1) + '%'; }).join(', ') + '.' }); }
    if ((Q.scandal || 0) > 1) pool.push({ w: 3, kind: 'gov', head: pick(['Scandal shadows the White House', 'More questions for the administration', 'Hearings loom as the scandal grows']), story: 'The President\u2019s approval stands at ' + Math.round(Q.president.approval) + '%.' });
    pool.sort(function (a, b) { return b.w * (0.5 + U.rng(Q)) - a.w * (0.5 + U.rng(Q)); }).slice(0, Math.max(2, 5 - items.length)).forEach(function (it) { delete it.w; items.push(it); });
    // the polls
    var mv = Object.keys(n).map(function (p) { return [p, n[p] - (before[p] || 0)]; }).sort(function (a, b) { return Math.abs(b[1]) - Math.abs(a[1]); })[0];
    var top = Object.keys(n).sort(function (a, b) { return n[b] - n[a]; });
    if (mv) items.push({ kind: 'polls', head: 'Poll: ' + (Math.abs(mv[1]) < 0.3 ? 'little movement, ' + PI(top[0]).short + ' still leads on ' + n[top[0]].toFixed(1) + '%' : PI(mv[0]).short + (mv[1] > 0 ? ' gains ' : ' slips ') + Math.abs(mv[1]).toFixed(1) + ' points'), story: 'Latest national poll: ' + top.slice(0, 6).map(function (p) { return PI(p).short + ' ' + n[p].toFixed(1) + '%'; }).join(', ') + '.' });
    if (items.length < 2) items.push({ kind: 'polls', head: 'A quiet month in Washington', story: 'Latest national poll: ' + top.slice(0, 6).map(function (p) { return PI(p).short + ' ' + n[p].toFixed(1) + '%'; }).join(', ') + '. Government approval ' + Math.round(Q.govApproval) + '%. Unemployment ' + Q.econ.unemp.toFixed(1) + '%.' });
    Q.papers = Q.papers || []; Q.papers.push({ date: date, items: items }); if (Q.papers.length > 120) Q.papers.shift();
    return items;
  };

  A.step = function (Q) {
    Q.zero = true;
    var before = U.Votes.national(Q), lv0 = Q.lastVote;
    before.x = { unemp: Q.econ.unemp, infl: Q.econ.infl, gov: Q.govApproval, pres: Q.president.approval };
    var pre = A.resolve(Q), res = F.skip(Q) || { out: {} };
    var post = A.resolve(Q);
    if (Q.report && Q.report.length) A.record(Q, { kind: 'news', title: 'News', text: Q.report.map(strip).join(' ') });
    if (res.out.general) A.record(Q, { kind: 'election', title: 'General election', text: res.out.general.date || '' });
    if (res.out.presidential) A.record(Q, { kind: 'election', title: 'Presidential election', text: Q.president.name + ' (' + U.partyInfo(Q.president.party).short + ') wins' });
    var r = { out: res.out, events: pre.concat(post), news: (Q.report || []).map(strip) };
    if (Q.lastVote && Q.lastVote !== lv0 && Q.lastVote.house && Q.lastVote.house.by) r.events.push({ title: 'Vote: ' + strip(Q.lastVote.title), text: 'The House voted ' + Q.lastVote.house.yes + ' to ' + Q.lastVote.house.no + '.', vote: Q.lastVote });
    r.items = A.edition(Q, r, before, U.dateStr(Q));
    return r;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
