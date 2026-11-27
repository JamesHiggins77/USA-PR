// Zero-player mode: the simulation plays every party, the LDP included.
// U.Auto.step advances one month, resolving any decision by AI choice,
// and records what happened in Q.chronicle for the live feed.
(function (G) {
  'use strict';
  var U = G.USA, F = U.Flow, Ev = U.Events, C = U.Coalition, A = U.Auto = {};
  var strip = function (s) { return String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); };

  // pick an option: earlier options (usually the mainstream line) weigh more
  // when a government is invested, voters lent to larger parties in a repeat election mostly go home
  var formGov = U.Game.formGovernment;
  U.Game.formGovernment = function (Q, deal, label) { var r = formGov.apply(this, arguments); Q.repeats = 0; A.logGov(Q, null, true); if (Q.lendBack && U.Game.returnLentVotes) U.Game.returnLentVotes(Q); return r; };
  // the record of governments in this timeline
  A.logGov = function (Q, start, invested) {
    var g = Q.gov; if (!g) return; Q.govLog = Q.govLog || [];
    var last = Q.govLog[Q.govLog.length - 1], now = start || U.dateStr(Q);
    if (last && last.pm === g.pm && last.coalition.join() === g.coalition.join() && last.cs.join() === g.cs.join() && !last.end) return;
    if (last && !last.end) last.end = now;
    var lv = invested && Q.lastVote && Q.lastVote.kind === 'investiture' ? Q.lastVote.house : null;
    Q.govLog.push({ how: invested ? 'invested' : last ? 'reshuffled' : '', start: now, pm: g.pm, party: g.pmParty, coalition: g.coalition.slice(), cs: g.cs.slice(), seats: U.Game.govSeats ? U.Game.govSeats(Q) : 0, president: Q.president.name, vote: lv ? lv.yes + '\u2013' + lv.no : '' });
  };
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
    if (r.out.state) { var fl = r.out.state.flips, tg = {}; for (var gs in Q.states) tg[Q.states[gs].governor] = (tg[Q.states[gs].governor] || 0) + 1;
      items.push({ kind: 'states', tier: 'key', head: (r.out.state.midterm ? 'Midterms: ' : 'Governors: ') + fl.length + ' statehouse' + (fl.length === 1 ? ' changes' : 's change') + ' hands', story: 'Governors and state legislatures were elected in all fifty states' + (r.out.state.midterm ? ', halfway through the presidential term' : ', alongside the presidential election') + '. ' + (fl.length ? 'Changed hands: ' + fl.slice(0, 12).map(function (f) { return (U.STATES[f.s] || {}).name + ' (' + PI(f.from).short + ' \u2192 ' + PI(f.to).short + ')'; }).join(', ') + '. ' : '') + 'Governors now: ' + Object.keys(tg).sort(function (a, b) { return tg[b] - tg[a]; }).map(function (p) { return PI(p).short + ' ' + tg[p]; }).join(', ') + '.' }); }
    if (r.out.general) { var g = r.out.general, ord = Object.keys(g.house).sort(function (a, b) { return g.house[b] - g.house[a]; });
      items.push({ kind: 'election', teaser: 'AMERICA VOTES: A NEW CONGRESS', teaserStory: 'The polls have closed in the general election. The results are coming in state by state.', head: PI(ord[0]).short + ' FIRST AS VOTERS ELECT A NEW CONGRESS', story: 'House seats: ' + ord.slice(0, 7).map(function (p) { return PI(p).short + ' ' + g.house[p] + ((g.before && g.before[p] != null) ? ' (' + (g.house[p] - g.before[p] >= 0 ? '+' : '') + (g.house[p] - g.before[p]) + ')' : ''); }).join(', ') + '. ' + U.majority() + ' are needed for a majority.', elec: 'g' }); }
    r.events.forEach(function (e) {
      items.push({ kind: e.vote ? 'vote' : 'event', vtype: e.vtype, id: e.id, teaser: e.teaser, teaserStory: e.teaserStory, tier: e.teaser ? 'breaking' : undefined, head: e.title, story: [e.body, e.choice ? 'Outcome: ' + e.choice + '.' : '', e.text].filter(Boolean).join(' '), vote: e.vote });
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
    pool.sort(function (a, b) { return b.w * (0.5 + U.rng(Q)) - a.w * (0.5 + U.rng(Q)); }).slice(0, 3).forEach(function (it) { delete it.w; items.push(it); });
    // the polls
    var mv = Object.keys(n).map(function (p) { return [p, n[p] - (before[p] || 0)]; }).sort(function (a, b) { return Math.abs(b[1]) - Math.abs(a[1]); })[0];
    var top = Object.keys(n).sort(function (a, b) { return n[b] - n[a]; });
    if (mv) items.push({ kind: 'polls', head: 'Poll: ' + (Math.abs(mv[1]) < 0.3 ? 'little movement, ' + PI(top[0]).short + ' still leads on ' + n[top[0]].toFixed(1) + '%' : PI(mv[0]).short + (mv[1] > 0 ? ' gains ' : ' slips ') + Math.abs(mv[1]).toFixed(1) + ' points'), story: 'Latest national poll: ' + top.slice(0, 6).map(function (p) { return PI(p).short + ' ' + n[p].toFixed(1) + '%'; }).join(', ') + '.' });
    if (U.News) U.News.generate(Q, { y: Q.year, m: Q.month }).forEach(function (it) { items.push(it); });
    var BREAK = ['security', 'afghanistan', 'iraq', 'katrina', 'crash', 'sandyhook', 'binladen', 'deepwater', 'impeach', 'surge'];
    items.forEach(function (it) {
      it.head = it.head.charAt(0).toUpperCase() + it.head.slice(1);
      if (it.tier) return;
      if (it.kind === 'election') it.tier = 'breaking';
      else if (it.kind === 'event') it.tier = BREAK.indexOf(it.id) >= 0 ? 'breaking' : 'key';
      else if (it.kind === 'economy') it.tier = /recession|slump|shrinks/i.test(it.head) ? (Q.econ.growth < -1.5 ? 'breaking' : 'key') : /Boom|roars|highs/.test(it.head) ? 'minor' : 'key';
      else it.tier = 'key';
    });
    Q.papers = Q.papers || []; Q.papers.push({ date: date, items: items }); if (Q.papers.length > 120) Q.papers.shift();
    return items;
  };

  // a recorded vote as a news item, with both chambers' tallies
  var OUTCOME = { law: 'The bill becomes law.', defeated: 'The House rejects the bill.', senateVeto: 'The Senate vetoes it with a two-thirds majority.', delayed: 'The Senate votes it down: it is delayed by up to two years, then becomes law.', presVeto: 'The President vetoes it.' };
  // "How they voted: LDP 160 yes; CC 140 no; CDP 50 yes, 41 abstain ..."
  A.partyLine = function (c) {
    if (!c || !c.by || !U.Roll) return '';
    return ' How they voted: ' + U.Roll.rows(c).map(function (r) { var nm = r.name; var parts = []; if (r.yes) parts.push(r.yes + ' yes'); if (r.no) parts.push(r.no + ' no'); if (r.abstain) parts.push(r.abstain + ' abstaining'); return nm + ' ' + parts.join(', '); }).join('; ') + '.';
  };
  A.tally = function (c) { return c ? c.yes + ' yes, ' + c.no + ' no' + (c.abstain ? ', ' + c.abstain + ' abstaining' : '') : ''; };
  A.voteItem = function (Q, lv) {
    var t = strip(lv.title), inv = lv.kind === 'investiture' || /^Investiture/.test(t), flag = inv || lv.kind === 'budget' || lv.kind === 'bill' || /Iraq war|Bank rescue/.test(t);
    var passed = lv.house.yes > lv.house.no, sen = lv.senate && lv.kind !== 'budget' && lv.kind !== 'investiture';
    var text = 'House: ' + A.tally(lv.house) + '. ' + (sen ? 'Senate: ' + A.tally(lv.senate) + '. ' : lv.kind === 'budget' ? 'Senate: no vote (budgets are for the House alone). ' : lv.kind === 'investiture' ? 'Senate: no vote (the House alone confirms a Prime Minister). ' : 'Senate: not required. ') + (OUTCOME[lv.proc] || (passed ? 'Carried.' : 'Not carried.'));
    if (inv) { var nc = /no-confidence/i.test(t), who = t.replace(/^(Investiture of|Constructive no-confidence:)\s*/, ''), ok = lv.passed != null ? lv.passed : passed;
      if (nc) return { title: ok ? 'No-confidence vote topples the government: ' + who + ' takes over' : 'Government survives a no-confidence vote', text: 'House: ' + A.tally(lv.house) + '. The motion named ' + who + ' as the new Prime Minister and needed an absolute majority (' + U.majority() + ').', vote: lv, vtype: 'noconf',
        teaser: 'NO-CONFIDENCE VOTE IN THE HOUSE', teaserStory: 'The opposition moves to replace the government with one led by ' + who + '. It needs ' + U.majority() + ' votes.' };
      return { vtype: 'investiture', title: ok ? who + ' confirmed as Prime Minister' : who + ' fails the investiture vote', text: 'House: ' + A.tally(lv.house) + '. ' + (lv.need === 'absolute' ? 'An absolute majority (' + U.majority() + ') was needed. ' : 'More yes than no votes were needed. ') + 'Senate: no vote (the House alone confirms a Prime Minister).', vote: lv,
        teaser: 'THE HOUSE VOTES ON A NEW PRIME MINISTER', teaserStory: who + ' faces the House' + (lv.need === 'absolute' ? ', needing an absolute majority of ' + U.majority() + '.' : '.') + ' The whips are still counting.' }; }
    return { vtype: 'bills', title: (lv.kind === 'budget' ? 'Budget vote: ' : 'Vote: ') + t + (passed ? ' passes the House' : ' fails in the House'), text: text, vote: lv,
      teaser: flag ? (lv.kind === 'budget' ? 'THE HOUSE VOTES ON THE BUDGET' : 'CONGRESS VOTES: ' + t.toUpperCase()) : null,
      teaserStory: flag ? 'Members are filing in to vote on ' + t + '. The whips are still counting.' : null };
  };
  var voteItem0 = A.voteItem;
  A.voteItem = function (Q, lv) { var it = voteItem0(Q, lv); it.text = (it.text || '') + A.partyLine(lv.house); return it; };
  A.step = function (Q) {
    Q.zero = true;
    var before = U.Votes.national(Q), lv0 = Q.lastVote;
    before.ym = { y: Q.year, m: Q.month };
    before.x = { unemp: Q.econ.unemp, infl: Q.econ.infl, gov: Q.govApproval, pres: Q.president.approval };
    var pre = A.resolve(Q), res = F.skip(Q) || { out: {} };
    if (Q.gov && !Q.formation) A.logGov(Q);   // partners leaving or joining
    var post = A.resolve(Q);
    if (Q.report && Q.report.length) A.record(Q, { kind: 'news', title: 'News', text: Q.report.map(strip).join(' ') });
    if (res.out.general) A.record(Q, { kind: 'election', title: 'General election', text: res.out.general.date || '' });
    if (res.out.presidential) A.record(Q, { kind: 'election', title: 'Presidential election', text: Q.president.name + ' (' + U.partyInfo(Q.president.party).short + ') wins' });
    var r = { out: res.out, events: pre.concat(post), news: (Q.report || []).map(strip) };
    if (Q.lastVote && Q.lastVote !== lv0 && Q.lastVote.house && Q.lastVote.house.by) r.events.push(A.voteItem(Q, Q.lastVote));
    r.items = A.edition(Q, r, before, U.dateStr(Q));
    return r;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
