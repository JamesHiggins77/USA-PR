// Interface. Renders the game state; all rules live in js/engine and js/game.
(function (G) {
  'use strict';
  var U = G.USA, S = U.Game, F = U.Flow, C = U.Coalition, V = U.Votes, Ch = U.Charts, K = U.Content, Ev = U.Events;
  var electSel = null, sideOpen = typeof matchMedia === 'function' ? !matchMedia('(max-width: 820px)').matches : true, mapHover = null, Q = null, view = 'office', openCard = null, openSlot = null, Dk = U.Decks, lastText = null, elec = null, deal = null, mapMode = 'lead', mapSel = null, mapStyle = 'geo';
  var $ = function (id) { return document.getElementById(id); };
  var P = function (p) { return U.PARTIES[p]; };
  var chip = function (p) { return '<i class="chip" style="background:' + P(p).color + '"></i>'; };
  var esc = function (s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); };
  var pct = function (v) { return v.toFixed(1) + '%'; };
  var sign = function (v, d) { var s = v.toFixed(d == null ? 1 : d); return (v > 0 ? '+' : '') + s; };

  var TABS = [['office', 'Office'], ['parliament', 'Parliament'], ['coalition', 'Coalition'], ['map', 'States'], ['polls', 'Polls & voters'], ['party', 'LDP'], ['parties', 'Parties'], ['history', 'History'], ['elections', 'Elections'], ['log', 'Timeline'], ['system', 'Game']];

  function save() { if (Q) S.save(Q); }
  function go(v) { if (U.Night) U.Night.stop(); view = v; openCard = null; openSlot = null; render(); window.scrollTo(0, 0); }

  function render() {
    if (!Q) return renderStart();
    $('tabs').innerHTML = TABS.map(function (t) { return '<button data-tab="' + t[0] + '" class="' + (view === t[0] ? 'on' : '') + '">' + t[1] + '</button>'; }).join('');
    renderSide();
    var m = $('main');
    var fn = { office: office, parliament: parliament, coalition: coalition, map: map, polls: polls, party: party, parties: parties, log: log, system: system, history: history, elections: elections, election: election, negotiate: negotiate, electionchoice: electionChoice, night: night }[view];
    m.innerHTML = fn();
    if (view !== 'night') U.Tips.decorate(m); U.Tips.decorate($('side'));
    bind();
    if (view === 'elections' && $('genmap')) {
      var PI = U.partyInfo, ochipK = function (p) { return '<i class="chip" style="background:' + PI(p).color + '"></i>'; };
      U.Zoom.attach($('genmap'), 'genmap', function (t) {
        var sid = t.dataset.state, st = genData && genData[sid]; if (!st) return null;
        return '<b>' + esc((U.STATES[sid] || U.DC).name) + '</b>' + (U.sum(st.seats) ? '<div class="muted">' + U.sum(st.seats) + (genMode === 'senate' ? ' senators elected statewide' : ' House seats') + '</div>' : '') +
          Object.keys(st.seats).sort(function (a, b) { return st.seats[b] - st.seats[a]; }).map(function (p) { return '<div class="kv"><span>' + ochipK(p) + PI(p).short + '</span><b>' + st.seats[p] + '</b></div>'; }).join('') +
          (st.leg ? '<div class="muted" style="margin-top:4px">Chosen by the legislature</div><div class="kv"><span>' + ochipK(st.leg) + PI(st.leg).short + '</span><b>1</b></div>' : '') + '<div class="muted" style="margin-top:4px">Vote</div>' + Object.keys(st.shares).sort(function (a, b) { return st.shares[b] - st.shares[a]; }).map(function (p) { return '<div class="kv"><span>' + ochipK(p) + PI(p).short + '</span><b>' + st.shares[p].toFixed(1) + '%</b></div>'; }).join('');
      });
    }
    if (view === 'map' && $('mapbox')) U.Zoom.attach($('mapbox'), 'states-' + mapMode + '-' + (mapMode === 'districts' ? 'geo' : mapStyle), mapHover);
    if (view === 'night') U.Night.start(Q, elec, function () { go('election'); });
  }

  // ---------- start ----------
  function renderStart() {
    $('tabs').innerHTML = ''; $('side').innerHTML = '<p class="small muted">A political strategy game in an alternate United States with proportional representation, two-round elections and coalition government.</p>';
    $('main').innerHTML = '<div class="scene"><div class="date">January 1997</div><h1>The American Republic</h1>' +
      '<p>President <b>Bill Clinton</b> is popular, and faces re-election in November 1998. But in this America, the President is not the one who runs the country day to day: that is <b>Prime Minister Al Gore</b>, who governs through a coalition of the <b>Liberal Democrats</b> and the <b>Social Democratic Labor Party</b> of Bill Bradley, with Ross Perot\u2019s <b>Reform Party</b> providing confidence and supply. The <b>Christian Democrats</b> sit in opposition alongside the Conservative Coalition.</p>' +
      '<p>Ralph Nader has taken over the Greens, one of only four Green MPs, and they are surging. The far left is fragmented into a dozen parties. The Conservative Coalition wants its old place back. In Texas and the Deep South, regionalists are counting the seats they could trade.</p>' +
      '<p>You lead the <b style="color:' + P('ldp').color + '">Liberal Democratic Party</b>. You do not control the government, your partners, or the voters. The presidential election is in <b>November 1998</b>; the general election must be called by <b>September 2000</b>.</p>' +
      '<div class="choices"><button class="choice" data-act="new">New campaign<small>A fresh 1997 start. The simulation decides what happens next.</small></button>' +
      (S.hasSave() ? '<button class="choice" data-act="continue">Continue saved campaign<small>Autosaved at the end of each month.</small></button>' : '') +
      '</div><p class="small muted" style="margin-top:14px">Hover over (or tap) underlined names and terms for details. Seat counts, vote shares and finances at the start are generated by the game’s model and are scenario assumptions, not canon. See docs/DESIGN.md.</p></div>';
    U.Tips.decorate($('main'));
    bind();
  }

  // ---------- sidebar ----------
  function renderSide() {
    var n = V.national(Q), g = Q.gov, prev = Q.polls[Q.polls.length - 2];
    var top = Object.keys(n).sort(function (a, b) { return n[b] - n[a]; }).slice(0, 8);
    var h = '<div class="date">' + U.dateStr(Q) + '</div>';
    h += '<div class="kv"><span>Cards in hand</span><b>' + Q.hand.filter(Boolean).length + ' / ' + Dk.HAND + '</b></div>';
    h += '<h4>Government</h4>';
    if (Q.formation) h += '<div>' + (Q.gov && Q.gov.senateCaretaker ? 'Senate-appointed caretaker. ' : 'Caretaker. ') + '<b>Government formation</b> under way' + (Q.formation.stage === 'open' ? ' (' + Q.formation.monthsLeft + ' months before a new election)' : ' (presidential nomination ' + Q.formation.round + ' of 2)') + '.</div>';
    else if (g) h += '<div>PM <b>' + esc(g.pm) + '</b> (' + P(g.pmParty).short + ')</div><div class="small">' + g.coalition.map(function (p) { return chip(p) + P(p).short; }).join(' ') + (g.cs.length ? ' &middot; C&amp;S: ' + g.cs.map(function (p) { return P(p).short; }).join(', ') : '') + '</div><div class="kv"><span>Seats</span><b>' + S.govSeats(Q) + ' / ' + U.RULES.house.total + '</b></div>';
    h += '<div class="kv"><span>Gov. approval</span><b>' + Math.round(Q.govApproval) + '%</b></div>';
    h += '<div class="kv"><span>President</span><b>' + esc(Q.president.name) + ' (' + P(Q.president.party).short + ')</b></div>';
    if (Q.offices) h += '<div class="kv"><span>Vice President</span><b>' + esc(Q.offices.vp.name) + ' (' + P(Q.offices.vp.party).short + ')</b></div><div class="kv"><span>Speaker</span><b>' + esc(Q.offices.speaker.name) + ' (' + P(Q.offices.speaker.party).short + ')</b></div>';
    var ed = Q.electionAt || Q.deadline, y = Math.floor(ed / 12), m = ed % 12 + 1;
    h += '<div class="kv"><span>' + (Q.electionAt ? 'Election day' : 'Election due by') + '</span><b>' + U.MONTHS[m - 1].slice(0, 3) + ' ' + y + '</b></div>';
    h += '<h4>Polls</h4>';
    top.forEach(function (p) { var d = prev ? n[p] - (prev.v[p] || 0) : 0; h += '<div class="kv"><span>' + chip(p) + P(p).short + '</span><b>' + pct(n[p]) + ' <span class="small ' + (d > 0.2 ? 'up' : d < -0.2 ? 'down' : 'muted') + '">' + sign(d) + '</span></b></div>'; });
    h += '<h4>' + P(Q.player).short + '</h4>';
    h += '<div class="kv"><span>Leader</span><b>' + esc(Q.leader.name) + '</b></div>';
    h += '<div class="kv"><span>Leader approval</span><b>' + Math.round(Q.leader.approval) + '</b></div>' + Ch.bar(Q.leader.approval, 100, Q.leader.approval < 35 ? 'bad' : '');
    h += '<div class="kv"><span>Funds</span><b>' + Q.funds.toFixed(1) + '</b></div>';
    h += '<div class="kv"><span>Unity</span><b>' + Math.round(Q.unity) + '</b></div>' + Ch.bar(Q.unity, 100, Q.unity < 40 ? 'warn' : 'good');
    h += '<div class="kv"><span>Morale</span><b>' + Math.round(Q.morale) + '</b></div>' + Ch.bar(Q.morale, 100);
    h += '<h4>Factions (dissent)</h4>';
    for (var k in Q.factions) { var f = Q.factions[k]; h += '<div class="kv"><span>' + U.LDP_FACTIONS[k].name + '</span><b>' + Math.round(f.dissent) + '</b></div>' + Ch.bar(f.dissent, 100, f.dissent > 70 ? 'bad' : f.dissent > 50 ? 'warn' : ''); }
    h += '<h4>Economy</h4><div class="kv"><span>Growth</span><b>' + Q.econ.growth.toFixed(1) + '%</b></div><div class="kv"><span>Unemployment</span><b>' + Q.econ.unemp.toFixed(1) + '%</b></div><div class="kv"><span>Inflation</span><b>' + Q.econ.infl.toFixed(1) + '%</b></div><div class="kv"><span>Deficit</span><b>' + Q.econ.deficit.toFixed(1) + '% GDP</b></div>';
    // on phones the sidebar is a collapsible status panel with a one-line summary
    var summary = esc(U.dateStr(Q)) + ' \u00b7 ' + P(Q.player).short + ' ' + pct(n[Q.player] || 0) + (g && !Q.formation ? ' \u00b7 Gov. ' + S.govSeats(Q) + '/' + U.RULES.house.total : Q.formation ? ' \u00b7 Forming a government' : '');
    $('side').innerHTML = '<details class="sidebox"' + (sideOpen ? ' open' : '') + '><summary><span>Status</span><span class="small">' + summary + '</span></summary><div class="side">' + h + '</div></details>';
    $('side').querySelector('details').ontoggle = function (e) { sideOpen = e.target.open; };
  }

  // ---------- office: events, cards, month end ----------
  function sceneHtml(sc, kind) {
    var opts = F.options(Q, sc);
    return '<div class="scene"><div class="date">' + U.dateStr(Q) + ' &middot; ' + (kind === 'event' ? 'Event' : esc(Dk.DECKS[Q.hand[openSlot].deck].name) + ' &middot; playing this card ends the month') + '</div><h1>' + esc(sc.title) + '</h1><p>' + sc.body(Q) + '</p>' +
      '<div class="choices">' + opts.map(function (o, i) {
        return '<button class="choice" data-' + kind + '="' + i + '"' + (o.ok ? '' : ' disabled') + '>' + esc(o.label) + (o.sub || o.why ? '<small>' + esc(o.ok ? (o.sub || '') : o.why) + '</small>' : '') + '</button>';
      }).join('') + (kind === 'card' ? '<button class="choice" data-act="close"><b>Back to the hand</b><small>Keep the card for later. No time passes.</small></button>' : '') + '</div></div>';
  }

  function briefing() {
    var h = '';
    if (Q.report && Q.report.length) h += '<div class="panel"><h3 style="margin-top:0">Last month</h3>' + Q.report.map(function (r) { return '<p style="margin:3px 0">' + esc(r) + '</p>'; }).join('') + '</div>';
    var causes = Object.keys(Q.causes || {}).filter(function (k) { return Math.abs(Q.causes[k]) >= 0.05; }).sort(function (a, b) { return Math.abs(Q.causes[b]) - Math.abs(Q.causes[a]); }).slice(0, 6);
    if (causes.length) h += '<div class="panel"><h3 style="margin-top:0">Why the ' + P(Q.player).short + '’s numbers moved</h3><table>' + causes.map(function (k) { return '<tr><td>' + esc(k) + '</td><td class="' + (Q.causes[k] > 0 ? 'up' : 'down') + '">' + sign(Q.causes[k], 2) + ' pts</td></tr>'; }).join('') + '</table><p class="small muted">Since the last general election, estimated effect on national vote share. Other parties’ campaigning and random drift also move the polls.</p></div>';
    return h;
  }

  function office() {
    if (Q.pendingEvent) return sceneHtml(Ev.byId(Q.pendingEvent), 'event');
    if (openCard) return sceneHtml(openCard, 'card');
    var h = '<div class="date">' + U.dateStr(Q) + '</div><h1>The LDP’s office</h1>';
    if (lastText) h += '<div class="result">' + lastText + '</div>';
    if (Q.formation) {
      var fm = Q.formation, stageTxt = fm.stage === 'nominee'
        ? (fm.round === 1 ? 'First presidential nomination: the nominee needs an absolute majority (' + U.majority() + ').' : 'Second nomination: a simple majority is enough. If it fails, the House gets three months and the Senate appoints a caretaker.') + ' ' + (fm.nominee ? 'Nominee: <b>' + esc(fm.nominee === Q.player ? Q.leader.name : S.pmName(Q, fm.nominee)) + '</b> (' + P(fm.nominee).short + ').' : 'Waiting for the President\u2019s nomination.')
        : 'Open talks: ' + fm.monthsLeft + ' month' + (fm.monthsLeft === 1 ? '' : 's') + ' left before a new election.';
      h += '<div class="panel"><b>Government formation.</b> ' + stageTxt + ' ' + (F.canNegotiate(Q) ? 'You can open negotiations for ' + esc(Q.leader.name) + ' to become Prime Minister.' : fm.stage === 'nominee' ? '' : ((Q.house[Q.player] || 0) < 40 ? 'The LDP is too small to lead a government.' : 'Talks resume next month.')) +
        '<div class="row" style="margin-top:8px"><button class="btn" data-act="negotiate"' + (F.canNegotiate(Q) ? '' : ' disabled') + '>Open the negotiating table</button></div></div>';
    }
    var empty = Q.hand.filter(function (x) { return !x; }).length;
    h += '<h2>Decks</h2><p class="small muted">Click a deck to draw a card into your hand' + (empty ? ' (' + empty + ' empty slot' + (empty > 1 ? 's' : '') + ')' : ' (your hand is full)') + '. Drawing takes no time.</p><div class="decks">';
    Dk.ORDER.forEach(function (d) {
      var ok = empty ? Dk.canDraw(Q, d) : 'Your hand is full: play or discard a card first.';
      h += '<button class="deck deck-' + d + '" data-deck="' + d + '"' + (ok === true ? '' : ' disabled title="' + esc(ok) + '"') + '><span class="deckname">' + Dk.DECKS[d].name + '</span><span class="small">' + Q.decks[d].draw.length + ' cards' + (Q.decks[d].discard.length ? ' · ' + Q.decks[d].discard.length + ' used' : '') + '</span>' + (ok === true ? '' : '<span class="small why">' + esc(ok) + '</span>') + '</button>';
    });
    h += '</div>';
    h += '<h2>Your hand <span class="small muted">' + (5 - empty) + ' / 5</span></h2><p class="small muted">Play a card or discard one, and the month ends. Or skip the month and keep your cards.</p><div class="hand">';
    Q.hand.forEach(function (hc, i) {
      if (!hc) { h += '<div class="slot empty"><span class="small muted">Empty — click a deck above</span></div>'; return; }
      var c = Dk.card(hc.id), use = F.cardUsable(Q, i), body = c.body(Q).replace(/<[^>]+>/g, '');
      h += '<div class="slot deck-' + hc.deck + '"><div class="tag">' + esc(Dk.DECKS[hc.deck].name) + '</div><div class="t">' + esc(c.title) + '</div><div class="small muted cardtext">' + esc(body.length > 150 ? body.slice(0, 147) + '…' : body) + '</div>' +
        (use === true ? '' : '<div class="small down">' + esc(use) + '</div>') +
        '<div class="row" style="margin-top:auto;padding-top:8px"><button class="btn" data-play="' + i + '"' + (use === true ? '' : ' disabled') + '>Play</button><button class="btn ghost" data-discard="' + i + '">Discard</button></div></div>';
    });
    h += '</div>';
    h += '<div class="endbar"><button class="btn" data-act="skip">Skip month</button><button class="btn ghost" data-act="skipahead">Skip ahead</button><span class="small muted">Skip ahead runs up to 12 months and stops at the next event, election or negotiation.</span>' +
      '<button class="btn ghost" data-act="discardall" style="margin-left:auto"' + (Q.hand.some(Boolean) ? '' : ' disabled') + '>Discard hand &amp; skip</button></div>';
    h += briefing();
    return h;
  }

  // ---------- election night ----------
  function election() {
    var h = '<div class="date">Election night</div>';
    if (elec.general) {
      var r = elec.general, seats = r.house, order = Object.keys(seats).sort(function (a, b) { return seats[b] - seats[a]; });
      h += '<h1>General election, ' + r.date + '</h1><div class="grid2"><div>' + Ch.hemicycle(Q, seats) + '</div><div><table><tr><th>Party</th><th>Vote</th><th>Districts</th><th>List</th><th>Seats</th><th>+/−</th></tr>' +
        order.map(function (p) { var d = seats[p] - (r.before[p] || 0); return '<tr><td>' + chip(p) + P(p).short + '</td><td>' + pct(r.shares[p] || 0) + '</td><td>' + (r.distWon[p] || 0) + '</td><td>' + (r.pr[p] || 0) + '</td><td><b>' + seats[p] + '</b></td><td class="' + (d > 0 ? 'up' : d < 0 ? 'down' : '') + '">' + sign(d, 0) + '</td></tr>'; }).join('') + '</table>' +
        '<p class="small muted">' + (r.districts ? r.runoffs + ' of ' + r.districts + ' district seats went to a second round. ' : '') + r.govFlips + ' governorships changed hands; ' + 'In each state, the largest party won two Senate seats and the runner-up one (1-1-1 in near-ties, 3-0 in landslides); the state house elected the fourth.</p></div></div>';
      h += '<h2>Senate</h2>' + Ch.hemicycle(Q, r.senate) + Ch.seatTable(Q, r.senate, function (p) { return r.senate[p] - (r.beforeSenate[p] || 0); });
      if (r.close.length) h += '<h3>Closest runoffs</h3><table><tr><th>District</th><th>Result</th></tr>' + r.close.map(function (c) { return '<tr><td>' + c.state + '-' + c.n + '</td><td>' + chip(c.a) + P(c.a).short + ' ' + c.va.toFixed(1) + ' – ' + c.vb.toFixed(1) + ' ' + P(c.b).short + chip(c.b) + '</td></tr>'; }).join('') + '</table>';
      h += '<h3>Coalition arithmetic</h3>' + arithmetic(seats);
    }
    if (elec.presidential) {
      var pr = elec.presidential;
      h += '<h1 style="margin-top:28px">Presidential election</h1><p><b>' + esc(pr.winnerName) + '</b> (' + P(pr.winnerParty).short + ') wins the Electoral College runoff' + (pr.tiebreak ? ' (tie broken by ' + pr.tiebreak + ')' : '') + '. Round one was a national popular vote; the top two went head to head in the Electoral College, where a state\u2019s winner takes all its electors.</p>';
      h += '<table><tr><th>Candidate</th><th>Round 1 (popular vote)</th>' + (pr.r2 ? '<th>Round 2 electors</th><th>Round 2 vote</th>' : '') + '</tr>' + pr.cands.slice().sort(function (a, b) { return (pr.r1[b.id] || 0) - (pr.r1[a.id] || 0); }).map(function (c) { return '<tr><td>' + chip(c.party) + esc(c.name) + (c.backers.length ? ' <span class="small muted">(backed by ' + c.backers.map(function (b) { return P(b).short; }).join(', ') + ')</span>' : '') + '</td><td>' + (pr.r1[c.id] || 0).toFixed(1) + '%</td>' + (pr.r2 ? '<td>' + (pr.r2[c.id] != null ? '<b>' + pr.r2[c.id] + '</b>' : '') + '</td><td>' + (pr.pop2 && pr.pop2[c.id] != null ? pr.pop2[c.id].toFixed(1) + '%' : '') + '</td>' : '') + '</tr>'; }).join('') + '</table>';
    }
    h += '<div class="endbar"><button class="btn" data-act="closeelec">Continue</button></div>';
    return h;
  }

  function arithmetic(seats) {
    var combos = [['ldp', 'sdlp'], ['ldp', 'sdlp', 'cdp'], ['ldp', 'cdp', 'asp'], ['ldp', 'sdlp', S.greenId(Q)], ['ldp', 'sdlp', 'asp'], ['ldp', 'sdlp', 'reform'], ['cc', 'cdp', 'asp'], ['cc', 'cdp', 'lib', 'asp'], ['cc', 'cdp', 'srp', 'lsp', 'lib']]
      .filter(function (c) { return c.every(function (p) { return !Q.dormant[p]; }); });
    return '<table>' + combos.map(function (c) { var n = c.reduce(function (s, p) { return s + (seats[p] || 0); }, 0); var veto = c.some(function (a) { return c.some(function (b) { return U.vetoes(a, b); }); });
      return '<tr><td>' + c.map(function (p) { return P(p).short; }).join(' + ') + (veto ? ' <span class="small down">red line</span>' : '') + '</td><td class="' + (n >= 401 ? 'up' : '') + '">' + n + '</td></tr>'; }).join('') + '</table><p class="small muted">401 seats are needed for a first-ballot investiture; on the second ballot, more yes than no votes is enough.</p>';
  }

  function electionChoice() {
    var what = elec.general && elec.presidential ? 'The general and presidential elections' : elec.general ? 'The general election' : 'The presidential election';
    return '<div class="scene"><div class="date">' + U.dateStr(Q) + '</div><h1>The polls are about to close</h1><p>' + what + ' are over. How do you want to see the results?</p>' +
      '<div class="choices"><button class="choice" data-act="seenight">Experience election night<small>Watch results come in state by state as polls close across the time zones, with a speed control. Races without a majority go to a second night of runoffs.</small></button>' +
      '<button class="choice" data-act="seefinal">See the final result<small>Go straight to the full results.</small></button></div></div>';
  }
  function night() { return U.Night.html(Q, elec); }

  // ---------- negotiation ----------
  function negotiate() {
    if (!deal) { deal = F.blankDeal(Q); }
    F.normalisePosts(Q, deal);
    var parties = U.ALL_PARTIES.filter(function (p) { return p !== Q.player && Q.house[p]; }).sort(function (a, b) { return Q.house[b] - Q.house[a]; });
    var postsUsed = U.sum(deal.posts);
    var h = '<div class="date">Government formation</div><h1>The negotiating table</h1><p>Build a government for <b>' + esc(Q.leader.name) + '</b>. Give each party a role (an agreement to abstain is enough on the second ballot), share out the 20 cabinet posts, and offer concessions (including the Speakership of the House). Each party shows a score: <b class="up">positive means it agrees</b>, <b class="down">negative means it refuses</b>, by that margin.</p>';
    h += '<div class="negs">';
    parties.forEach(function (p) {
      deal.abstain = deal.abstain || [];
      var role = deal.coalition.indexOf(p) >= 0 ? 'coalition' : deal.cs.indexOf(p) >= 0 ? 'cs' : deal.abstain.indexOf(p) >= 0 ? 'abstain' : 'none';
      var a = role === 'none' ? null : C.assess(Q, p, deal, role), un = C.unprompted(Q, p, Q.player);
      h += '<div class="neg"><div class="neghead"><span>' + chip(p) + '<b>' + esc(P(p).name) + '</b> <span class="muted small">' + Q.house[p] + ' seats</span></span>' +
        (a ? '<span class="margin ' + (a.ok ? 'yes' : 'no') + '">' + (a.margin > 0 ? '+' : '') + a.margin + '</span>' : '<span class="small">Without a deal: <b class="' + (un.vote === 'yes' ? 'up' : un.vote === 'no' ? 'down' : '') + '">' + { yes: 'votes yes', abstain: 'abstains', no: 'votes no' }[un.vote] + '</b> <span class="muted">(' + (un.margin > 0 ? '+' : '') + un.margin + ')</span></span>') + '</div>';
      // grey out roles the party will never accept, and pointless ones
      var rank = { none: 0, abstain: 1, cs: 2, coalition: 3 }, given = un.vote === 'yes' ? 2 : un.vote === 'abstain' ? 1 : 0;
      var noneLabel = un.vote === 'yes' ? 'Backs you anyway' : un.vote === 'abstain' ? 'Abstains anyway' : 'No deal';
      h += '<div class="seg">' + [['none', noneLabel], ['abstain', 'Abstain'], ['cs', 'Confidence & supply'], ['coalition', 'Coalition']].map(function (r) {
        var why = '';
        if (r[0] !== 'none' && rank[r[0]] <= given && r[0] !== 'cs') why = 'Not needed: this party already ' + (un.vote === 'yes' ? 'votes for you' : 'abstains') + ' without a deal.';
        else if (r[0] !== 'none' && C.bestCase(Q, deal, p, r[0]).margin < 0) why = 'Impossible: they refuse even with every concession on offer.';
        return '<button data-role="' + p + '|' + r[0] + '" class="' + (role === r[0] ? 'on' : '') + '"' + (why && role !== r[0] ? ' disabled title="' + esc(why) + '"' : '') + '>' + r[1] + '</button>';
      }).join('') + '</div>';
      if (role === 'coalition') h += '<div class="row small" style="margin-top:6px">Cabinet posts <button class="mini" data-posts="' + p + '|-1">−</button><b>' + (deal.posts[p] || 0) + '</b><button class="mini" data-posts="' + p + '|1"' + (postsUsed >= 20 ? ' disabled' : '') + '>+</button></div>';
      if (role !== 'none') {
        h += '<div class="concs">' + C.demandsOf(p).concat([{ id: 'speaker', text: 'Speaker of the House' }]).map(function (d) {
          var on = (deal.concessions[p] || []).indexOf(d.id) >= 0, taken = d.id === 'speaker' && !on && F.speakerOffered(deal);
          return '<button class="conc' + (on ? ' on' : '') + '" data-conc="' + p + '|' + d.id + '"' + (taken ? ' disabled title="Already offered to another party"' : '') + '>' + (on ? '✓ ' : '+ ') + esc(d.text) + '</button>';
        }).join('') + '</div>';
        if (role === 'abstain' && un.vote === 'yes') a.reasons.unshift('Would vote yes anyway');
        h += '<ul class="reasons">' + a.reasons.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>';
      }
      else h += '<ul class="reasons">' + un.reasons.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>';
      h += '</div>';
    });
    h += '</div>';
    h += '<p class="small muted">The LDP keeps ' + (deal.posts[Q.player] || 0) + ' posts; ' + postsUsed + ' of 20 allocated. Concessions become commitments: if they are not delivered, trust erodes.' + (F.speakerOffered(deal) ? '' : ' The Speakership stays with the LDP unless you offer it.') + '</p>';
    var inv = C.investitureVote(Q, deal);
    h += '<div class="panel"><b>Projected investiture vote:</b> ' + inv.yes + ' yes, ' + inv.no + ' no, ' + inv.abstain + ' abstaining. ' + (C.passes(inv, 1) ? '<span class="up">Passes on the first ballot.</span>' : C.passes(inv, 2) ? '<span class="up">Fails the first ballot, passes the second.</span>' : '<span class="down">Fails.</span>') +
      '<div class="small muted" style="margin-top:4px">' + inv.by.filter(function (b) { return b.n; }).map(function (b) { return esc(b.label) + ' ' + b.n + ' ' + b.vote; }).join(' &middot; ') + '</div></div>';
    h += '<div class="endbar"><button class="btn" data-act="submitdeal"' + (postsUsed > 20 ? ' disabled' : '') + '>Sign and go to the vote</button><button class="btn ghost" data-act="aideal">Suggest a deal</button><button class="btn ghost" data-act="back">Leave the table</button></div>';
    return h;
  }

  // ---------- parliament ----------
  function parliament() {
    var sen = U.Elections.senateCount(Q);
    var O = Q.offices || {}, off = function (label, o) { return o ? '<div class="kv"><span>' + label + '</span><b>' + esc(o.name) + ' ' + chip(o.party) + P(o.party).short + '</b></div>' : ''; };
    var h0 = '<div class="panel" style="max-width:560px"><b>Officeholders</b>' + off('President', Q.president) + off('Vice President', O.vp) + (Q.gov ? off('Prime Minister', { name: Q.gov.pm, party: Q.gov.pmParty }) : '') + off('Speaker of the House', O.speaker) + off('President pro tempore of the Senate', O.ppt) + '</div>';
    var h = '<h1>Parliament</h1>' + h0 + '<div class="grid2"><div><h2>House of Representatives</h2>' + Ch.hemicycle(Q, Q.house) + Ch.seatTable(Q, Q.house) + '<p class="small muted">' + (U.pure() ? U.RULES.house.total + ' seats by statewide proportional representation (' + U.RULES.house.prFormula + '; national threshold ' + (U.RULES.house.nationalThreshold * 100) + '%, state threshold ' + (U.RULES.house.stateThreshold * 100) + '%). Majority ' + U.majority() + '; the President breaks a tie.' : '435 two-round districts, 365 statewide list seats and the DC seat.') + '</p></div>' +
      '<div><h2>Senate</h2>' + Ch.hemicycle(Q, sen) + Ch.seatTable(Q, sen) + '<p class="small muted">Four per state: three elected statewide by proportional representation at each general election, and one elected by the state house (in Nebraska, by its single-chamber legislature).</p></div></div>';
    if (Q.house.ul) { var ul = U.Parliament.ulSplit(Q, Q.house.ul); h += '<h3>Inside the United Left</h3><p class="small">' + Object.keys(ul).filter(function (k) { return ul[k]; }).map(function (k) { return esc(P(k).name) + ' <b>' + ul[k] + '</b> <span class="muted">(' + U.LEFT_MEMBERS[k] + ')</span>'; }).join(' &middot; ') + ' &middot; Unity ' + Math.round(Q.ulUnity) + '</p>'; }
    if (Q.house.revsoc) h += '<p class="small muted">' + esc(P('revsoc').note) + '</p>';
    if (Q.house.aga) h += '<h3>American Green Alliance</h3><p class="small">A federation of autonomous state parties. House seats by state: ' + Object.keys(Q.agaSeats || {}).filter(function (s) { return Q.agaSeats[s]; }).map(function (s) { return s + ' ' + Q.agaSeats[s]; }).join(', ') + '. Each chapter decides its own votes on confidence and budgets.</p>';
    if (Q.lastVote) {
      var lv = Q.lastVote;
      h += '<h2>Last vote: ' + esc(lv.title) + '</h2><table><tr><th>Group</th><th>Seats</th><th>Vote</th></tr>' + lv.house.by.filter(function (b) { return b.n; }).map(function (b) { return '<tr><td>' + chip(b.party) + esc(b.label) + '</td><td>' + b.n + '</td><td><span class="pill ' + (b.vote === 'yes' ? 'yes' : b.vote === 'no' ? 'no' : '') + '">' + b.vote + '</span></td></tr>'; }).join('') + '<tr><td><b>Total</b></td><td></td><td>' + lv.house.yes + ' / ' + lv.house.no + ' / ' + lv.house.abstain + '</td></tr></table>';
    }
    return h;
  }

  // ---------- coalition ----------
  function coalition() {
    var g = Q.gov, h = '<h1>Coalition and relations</h1>';
    if (g) {
      h += '<div class="panel"><b>' + (Q.formation ? 'Caretaker government' : 'Government') + ':</b> ' + esc(g.pm) + ' (' + P(g.pmParty).short + '). Cabinet: ' + Object.keys(g.posts).map(function (p) { return P(p).short + ' ' + g.posts[p]; }).join(', ') + '. ' + (g.cs.length ? 'Confidence and supply: ' + g.cs.map(function (p) { return P(p).short; }).join(', ') + '. ' : '') + 'Since ' + U.MONTHS[g.since % 12] + ' ' + Math.floor(g.since / 12) + '.</div>';
      if (Q.cabinet && Q.cabinet.length) h += '<h3>Cabinet</h3><table><tr><th>Portfolio</th><th>Minister</th><th>Party</th></tr><tr><td>Prime Minister</td><td>' + esc(g.pm) + '</td><td>' + chip(g.pmParty) + P(g.pmParty).short + '</td></tr>' +
        Q.cabinet.map(function (c) { return '<tr><td>' + esc(c.post) + '</td><td>' + esc(c.name) + (c.by === 'president' ? ' <span class="small muted">(President’s appointee)</span>' : '') + '</td><td>' + chip(c.party) + P(c.party).short + '</td></tr>'; }).join('') + '</table>';
      var pend = (Q.pendingConcessions || []).filter(function (c) { return !c.done; });
      if (pend.length) h += '<h3>Outstanding commitments</h3><table>' + pend.map(function (c) { var due = c.due; return '<tr><td>' + esc(c.text) + '</td><td>' + P(c.party).short + '</td><td class="' + (S.now(Q) > due ? 'down' : '') + '">due ' + U.MONTHS[due % 12].slice(0, 3) + ' ' + Math.floor(due / 12) + '</td></tr>'; }).join('') + '</table>';
    }
    h += '<h2>Other parties</h2><table><tr><th>Party</th><th>Seats</th><th>Relations</th><th>Policy fit</th><th>Leader</th><th>Red lines with</th></tr>' +
      U.ALL_PARTIES.filter(function (p) { return p !== Q.player && !Q.dormant[p]; }).map(function (p) {
        var r = C.rel(Q, Q.player, p), c = C.compat(Q, Q.player, p), vet = U.ALL_PARTIES.filter(function (q) { return q !== p && !Q.dormant[q] && U.vetoes(p, q); });
        return '<tr><td>' + chip(p) + esc(P(p).name) + ' <span class="small muted">' + P(p).kind + '</span></td><td>' + (Q.house[p] || 0) + '</td><td class="' + (r > 55 ? 'up' : r < 35 ? 'down' : '') + '">' + Math.round(r) + '</td><td>' + Math.round(c * 100) + '%</td><td class="small">' + esc(P(p).leader) + '</td><td class="small">' + vet.map(function (q) { return P(q).short; }).join(', ') + '</td></tr>';
      }).join('') + '</table><p class="small muted">Relations come from past cooperation, broken promises and your actions. Policy fit is distance on the economic, social and federal axes from the LDP’s current platform.</p>';
    return h;
  }

  // ---------- map ----------
  function map() {
    if (mapMode === 'districts' && U.pure()) mapMode = 'lead';
    var colorOf, labelOf, sh = {};
    V.allStates().forEach(function (s) { sh[s.id] = V.stateShares(Q, s); });
    var lead = function (id) { var o = sh[id]; return Object.keys(o).sort(function (a, b) { return o[b] - o[a]; })[0]; };
    if (mapMode === 'lead') { colorOf = function (id) { return P(lead(id)).color; }; labelOf = function (id) { return P(lead(id)).short; }; }
    else if (mapMode === 'ldp') { colorOf = function (id) { var v = sh[id][Q.player] || 0; return 'rgba(255,165,0,' + U.clamp(v / 40, 0.12, 1) + ')'; }; labelOf = function (id) { return Math.round(sh[id][Q.player] || 0) + '%'; }; }
    else { colorOf = function (id) { return Q.states[id] ? P(Q.states[id].governor).color : '#777'; }; labelOf = function (id) { return Q.states[id] ? P(Q.states[id].governor).short : 'DC'; }; }
    var h = '<h1>The states</h1><div class="row"><span class="small">Show:</span>' + [['lead', 'Leading party'], ['ldp', 'LDP strength'], ['gov', 'Governors']].concat(U.pure() ? [] : [['districts', 'House districts']]).map(function (m) { return '<button class="btn ' + (mapMode === m[0] ? '' : 'ghost') + '" data-map="' + m[0] + '">' + m[1] + '</button>'; }).join('') + '</div>';
    h += '<span class="small" style="margin-left:12px">Map:</span>' + [['geo', 'Geographical'], ['topo', 'Topographical']].map(function (m) { return '<button class="btn ' + (mapStyle === m[0] ? '' : 'ghost') + '" data-mapstyle="' + m[0] + '">' + m[1] + '</button>'; }).join('');
    var dw = {}; (Q.lastDistricts || []).forEach(function (d) { dw[d.s + '-' + d.n] = d.w; });
    var leanTxt = function (v) { return v == null ? 'n/a' : (v >= 0 ? 'D+' : 'R+') + Math.abs(v).toFixed(1); };
    var dTitle = function (sid, n) {
      return '';
    };
    mapHover = function (t) {
      if (t.dataset.d) { var a = t.dataset.d.split('-'); return districtCard(a[0], +a[1]); }
      return t.dataset.state ? stateCard(t.dataset.state) : null;
    };
    var districtCard = function (sid, n) {
      var st = U.STATES[sid] || U.DC, L = U.DISTRICT_LEAN && U.DISTRICT_LEAN[sid], nd = U.DISTRICTS[sid] ? U.DISTRICTS[sid].cells.length : 1;
      var est = V.districtShares(Q, st, sh[sid], n - 1, nd, true), top = Object.keys(est).sort(function (a, b) { return est[b] - est[a]; }).slice(0, 4);
      var ld = (Q.lastDistricts || []).filter(function (d) { return d.s === sid && d.n === n; })[0];
      return '<b>' + esc(st.name) + ' ' + (nd === 1 ? 'at-large' : 'district ' + n) + '</b><br>1998 lean: <b>' + leanTxt(L && L[n - 1]) + '</b><br>Last winner: ' + (ld ? chip(ld.w) + P(ld.w).short + (ld.round === 2 ? ' (runoff v ' + P(ld.f.filter(function (x) { return x !== ld.w; })[0]).short + ')' : ' (first round)') : 'n/a') +
        '<div class="muted" style="margin-top:4px">Estimated first round now:</div>' + top.map(function (p) { return '<div class="kv"><span>' + chip(p) + P(p).short + '</span><b>' + est[p].toFixed(1) + '%</b></div>'; }).join('');
    };
    var stateCard = function (sid) {
      var st = U.STATES[sid] || U.DC, o = sh[sid], top = Object.keys(o).sort(function (a, b) { return o[b] - o[a]; }).slice(0, 5), sg = Q.states[sid], del = (Q.houseByState || {})[sid] || {};
      var h = '<b>' + esc(st.name) + '</b><div class="muted">Polling now</div>' + top.map(function (p) { return '<div class="kv"><span>' + chip(p) + P(p).short + '</span><b>' + o[p].toFixed(1) + '%</b></div>'; }).join('');
      h += '<div class="muted" style="margin-top:4px">House delegation (' + U.sum(del) + ')</div><div>' + Object.keys(del).filter(function (p) { return del[p]; }).sort(function (a, b) { return del[b] - del[a]; }).map(function (p) { return chip(p) + P(p).short + ' ' + del[p]; }).join(' ') + '</div>';
      if (sg) h += '<div style="margin-top:4px">Governor: ' + chip(sg.governor) + P(sg.governor).short + ' · Senators: ' + Q.senateSeats.filter(function (x) { return x.state === sid; }).map(function (x) { return chip(x.party) + P(x.party).short; }).join(' ') + '</div>';
      return h;
    };
    var mp = mapMode === 'districts' ? Ch.districtMap(Q, function (sid, n) { var w = dw[sid + '-' + n]; return w ? P(w).color : '#9aa0a6'; }, '', dTitle) + '<p class="small muted">Winners at the last general election. Boundaries are the real congressional districts drawn after the 2010 census (2012 maps, from the public-domain @unitedstates/districts project). Hover over a district for its 1998 partisan lean and estimated vote. Each district\u2019s vote follows its real lean from the 1992 and 1996 presidential elections.</p>'
      : mapStyle === 'geo' ? Ch.geoMap(Q, colorOf, labelOf) : Ch.map(Q, colorOf, labelOf);
    h += '<div id="mapbox" style="margin-top:10px' + (mapStyle === 'geo' || mapMode === 'districts' ? '' : ';max-width:640px') + '">' + mp + '</div><p class="small muted">Scroll, or use + / \u2212 buttons to zoom, drag to pan. Hover (or tap) for details; click a state for its full results and delegations.</p><div id="statedetail" class="panel">' + stateDetail(mapSel || 'CA', sh) + '</div>';
    return h;
  }
  function seatTable(o) {
    return Object.keys(o).filter(function (p) { return o[p]; }).sort(function (a, b) { return o[b] - o[a]; })
      .map(function (p) { return '<span style="margin-right:10px">' + chip(p) + P(p).short + ' <b>' + o[p] + '</b></span>'; }).join('');
  }
  function stateDetail(id, sh) {
    var s = U.STATES[id] || U.DC, o = sh[id], app = U.Elections.apportion(), sg = Q.states[id];
    var order = Object.keys(o).sort(function (a, b) { return o[b] - o[a]; });
    var h = '<h2>' + s.name + '</h2><p class="small muted">' + U.REGIONS[s.region] + ' &middot; population ' + s.pop + 'm' + (U.STATES[id] ? ' &middot; ' + (U.pure() ? app.pr[id] + ' state list seats, ' : app.district[id] + ' districts, ' + app.pr[id] + ' list seats, ') + app.electors[id] + ' electors' + (s.unicameral ? ' &middot; unicameral legislature' : '') : ' &middot; 1 House seat, 3 electors') + '</p>';
    h += '<div class="grid2">';
    // last presidential election
    var lp = Q.lastPresidential, box = '';
    if (lp && lp.byState[id]) {
      var bs = lp.byState[id], tot = U.sum(bs.votes), cands = lp.cands.slice().sort(function (a, b) { return (bs.votes[b.id] || 0) - (bs.votes[a.id] || 0); });
      box = '<h3>Presidential election, ' + esc(lp.date) + (lp.generated ? ' <span class="small muted">(generated)</span>' : '') + '</h3><table><tr><th>Candidate</th><th>Vote</th><th>Electors</th>' + (lp.byState2 ? '<th>Runoff</th>' : '') + '</tr>' +
        cands.filter(function (c) { return (bs.votes[c.id] || 0) / tot >= 0.005; }).map(function (c) {
          var r2 = lp.byState2 && lp.byState2[id] && lp.byState2[id].votes[c.id] != null ? lp.byState2[id] : null;
          return '<tr><td>' + chip(c.party) + esc(c.name) + '</td><td>' + pct(bs.votes[c.id] / tot * 100) + '</td><td>' + (bs.ev[c.id] || 0) + '</td>' + (lp.byState2 ? '<td>' + (r2 ? pct(r2.votes[c.id] / U.sum(r2.votes) * 100) + ' (' + (r2.ev[c.id] || 0) + ')' : '') + '</td>' : '') + '</tr>';
        }).join('') + '</table><p class="small muted">Nationally: ' + esc(lp.winnerName) + ' (' + P(lp.winnerParty).short + ') won' + (lp.round === 2 ? ' in the runoff' : '') + '.</p>';
    }
    h += '<div>' + box + '<h3>Polling now</h3><table><tr><th>Party</th><th>Share</th></tr>' + order.slice(0, 8).map(function (p) { return '<tr><td>' + chip(p) + P(p).name + '</td><td>' + pct(o[p]) + '</td></tr>'; }).join('') + '</table></div>';
    // delegations and government
    var del = (Q.houseByState || {})[id] || {};
    h += '<div><h3>Congressional delegation <span class="small muted">(' + U.sum(del) + ' seats)</span></h3>' + Ch.hemicycle(Q, del) + Ch.seatTable(Q, del);
    if (sg) {
      var sen = Q.senateSeats.filter(function (x) { return x.state === id; });
      h += '<h3>Senate delegation</h3>' + sen.map(function (x) { return '<div class="kv"><span>' + { pr: 'Elected statewide (PR)', house: s.unicameral ? 'Elected by the Legislature' : 'Elected by the State House' }[x.type] + '</span><b>' + chip(x.party) + P(x.party).name + '</b></div>'; }).join('');
      h += '<h3>Legislative speakers</h3><div class="kv"><span>' + (s.unicameral ? 'Speaker of the Legislature' : 'Speaker of the State House') + '</span><b>' + (sg.houseSpeaker ? chip(sg.houseSpeaker) + P(sg.houseSpeaker).short : 'n/a') + '</b></div>' + (sg.senate ? '<div class="kv"><span>President of the State Senate</span><b>' + (sg.senateSpeaker ? chip(sg.senateSpeaker) + P(sg.senateSpeaker).short : 'n/a') + '</b></div>' : '');
      h += '<h3>Governor</h3><div class="kv"><span>' + (sg.govRace && sg.govRace.round === 2 ? 'Won in a runoff' : 'Won outright') + '</span><b>' + chip(sg.governor) + P(sg.governor).name + '</b></div>';
    }
    h += '</div></div>';
    if (sg) {
      h += '<div class="grid2"><div><h3>' + (s.unicameral ? 'Legislature' : 'State house') + ' <span class="small muted">(' + U.sum(sg.house) + ' seats, constituency PR)</span></h3>' + Ch.hemicycle(Q, sg.house) + Ch.seatTable(Q, sg.house) + '</div>';
      h += sg.senate ? '<div><h3>State senate <span class="small muted">(' + U.sum(sg.senate) + ' seats, statewide PR, 5% threshold)</span></h3>' + Ch.hemicycle(Q, sg.senate) + Ch.seatTable(Q, sg.senate) + '</div>' : '<div><h3>State senate</h3><p class="small muted">Nebraska has a single-chamber legislature. Its governor appoints three of the state’s four U.S. senators.</p></div>';
      h += '</div>';
    }
    return h;
  }

  // ---------- polls & voters ----------
  function polls() {
    var n = V.national(Q), top = Object.keys(n).sort(function (a, b) { return n[b] - n[a]; }).slice(0, 8);
    var h = '<h1>Polls and voters</h1>' + Ch.polls(Q, top);
    h += '<h2>Support by voter group</h2><p class="small muted">Estimated vote among each group nationally. Groups are not monolithic: these are averages.</p><table><tr><th>Group</th>' + top.slice(0, 7).map(function (p) { return '<th>' + P(p).short + '</th>'; }).join('') + '</tr>';
    U.GROUPS.forEach(function (g) {
      var raw = {}, tot = 0;
      U.NATIONAL.forEach(function (p) { if (Q.dormant[p]) return; raw[p] = Math.max(0.05, P(p).pref[g] + ((Q.mods[p] || {})[g] || 0)) * Q.calib[p]; tot += raw[p]; });
      h += '<tr><td>' + U.GROUP_NAMES[g] + '</td>' + top.slice(0, 7).map(function (p) { return '<td>' + (raw[p] ? pct(raw[p] / tot * 100) : '–') + '</td>'; }).join('') + '</tr>';
    });
    h += '</table>';
    return h;
  }

  // ---------- party ----------
  function party() {
    var p = Q.pos[Q.player], h = '<h1>Liberal Democratic Party</h1>';
    h += '<p>Leader: <b>' + esc(Q.leader.name) + '</b>. Platform: economy ' + p.econ.toFixed(1) + ', society ' + p.soc.toFixed(1) + ' (negative is left/liberal). Founded ' + P('ldp').founded + '.</p>';
    h += '<h2>Factions</h2><table><tr><th>Faction</th><th>Figure</th><th>Strength</th><th>Dissent</th></tr>' + Object.keys(Q.factions).map(function (k) { var f = Q.factions[k]; return '<tr><td>' + U.LDP_FACTIONS[k].name + '<div class="small muted">' + U.LDP_FACTIONS[k].wants + '</div></td><td>' + U.LDP_FACTIONS[k].figure + '</td><td>' + Math.round(f.strength) + '%</td><td class="' + (f.dissent > 70 ? 'down' : '') + '">' + Math.round(f.dissent) + '</td></tr>'; }).join('') + '</table>';
    h += '<p class="small muted">Factions with dissent above 65 start defying the whip on key votes. Above 88 they may walk out. A weak leader facing a restless faction can be challenged.</p>';
    h += '<h2>Regional stand-down agreements</h2><p class="small muted">Parties that do not field district candidates in a partner\u2019s region. Includes agreements between other parties.</p><table><tr><th>Party standing aside</th><th>In favour of</th><th>Where</th></tr>' + (Q.standDowns || []).map(function (a) { return '<tr><td>' + chip(a.party) + P(a.party).name + '</td><td>' + chip(a.partner) + P(a.partner).name + '</td><td>' + U.Elections.REGION_NAMES[a.region] + '</td></tr>'; }).join('') + '</table>';
    h += '<h2>Electoral pacts</h2><p>' + ((Q.pacts || []).length ? Q.pacts.map(function (k) { return k.parties.map(function (x) { return P(x).short; }).join(' + ') + ' (' + k.type + ')'; }).join(', ') : 'None.') + '</p>';
    return h;
  }

  // ---- every party and alliance: ideology, positions, factions ----
  var partyFilter = 'all';
  function parties() {
    var PR = U.PARTY_PROFILES, groups = [['national', 'National parties'], ['alliance', 'Alliances and blocs'], ['regional', 'Regional parties'], ['future', 'Future parties (not yet founded in 1997)'], ['former', 'Former parties']];
    var info = function (k) { return U.PARTIES[k] ? { name: U.PARTIES[k].name, short: U.PARTIES[k].short, color: U.PARTIES[k].color } : U.FORMER_PARTIES[k]; };
    var h = '<h1>Parties</h1><p class="small muted">Every party and alliance, current and former, with its positions on seven axes and its internal factions.</p><div class="row" style="margin-bottom:10px">' +
      [['all', 'All']].concat(groups).map(function (g) { return '<button class="btn ' + (partyFilter === g[0] ? '' : 'ghost') + '" data-pfilter="' + g[0] + '">' + g[1].split(' (')[0] + '</button>'; }).join('') + '</div>';
    groups.forEach(function (g) {
      if (partyFilter !== 'all' && partyFilter !== g[0]) return;
      var keys = Object.keys(PR).filter(function (k) { return PR[k].status === g[0] && info(k); });
      if (g[0] !== 'former') keys.sort(function (a, b) { return (Q.house[b] || 0) - (Q.house[a] || 0); });
      if (!keys.length) return;
      h += '<h2>' + g[1] + '</h2><div class="pcards">';
      keys.forEach(function (k) {
        var pr = PR[k], i = info(k), lore = (U.LORE.parties || {})[k], seats = Q.house[k] || 0, sen = (U.Elections.senateCount(Q) || {})[k] || 0;
        var dormant = Q.dormant && Q.dormant[k];
        h += '<div class="pcard" style="border-top:4px solid ' + i.color + '"><div class="row" style="justify-content:space-between;align-items:baseline"><b>' + esc(i.name) + '</b><span class="small muted">' + esc(i.short) + '</span></div>' +
          '<div class="small muted">' + esc(i.years || (lore ? 'Founded ' + lore[0] : '')) + (g[0] === 'former' ? '' : dormant ? ' · not active' : ' · ' + seats + ' House, ' + sen + ' Senate seats') + '</div>' +
          '<p class="small" style="margin:6px 0"><b>' + esc(pr.ideology) + '</b></p>' +
          U.AXES.map(function (a) { var live = U.PARTIES[k] && (U.Elections.pos(Q) || {})[k], v = live && live[a[0]] != null ? live[a[0]] : pr.ax[a[0]], x = U.clamp((v + 10) / 20 * 100, 0, 100);
            return '<div class="axis"><div class="axl"><span>' + a[2] + '</span><b>' + a[1] + '</b><span>' + a[3] + '</span></div><div class="axbar"><i style="left:' + x + '%;background:' + i.color + '"></i></div></div>'; }).join('') +
          '<div class="small" style="margin-top:8px"><b>Factions</b></div><ul class="factions">' + pr.factions.map(function (f) { return '<li><b>' + esc(f[0]) + '</b> <span class="muted">(' + esc(f[1]) + ')</span>: ' + esc(f[2]) + '</li>'; }).join('') + '</ul>' +
          (pr.members ? '<div class="small muted">Members: ' + pr.members.map(function (m) { return esc(info(m).name); }).join(', ') + '</div>' : '') +
          (pr.note ? '<div class="small muted">' + esc(pr.note) + '</div>' : '') +
          (lore && lore[1] && g[0] !== 'future' ? '<details class="small"><summary>History</summary>' + esc(lore[1]) + '</details>' : '') + '</div>';
      });
      h += '</div>';
    });
    return h;
  }

  function history() {
    var L = U.LORE, h = '<h1>History</h1><p class="small muted">How this America got here. The story diverges from ours with the deadlocked election of 1912; real people appear, but their careers differ.</p>';
    h += '<h2>The constitution</h2><table><tr><th>When</th><th>What happened</th></tr>' + L.constitution.map(function (r) { return '<tr><td>' + r[0] + '</td><td style="text-align:left">' + esc(r[1]) + '</td></tr>'; }).join('') + '</table>';
    h += '<h2>Presidents</h2><table><tr><th>Elected</th><th>President</th><th>Party</th><th>Notes</th></tr>' + L.presidents.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td><td style="text-align:left">' + esc(r[3]) + '</td></tr>'; }).join('') + '</table>';
    h += '<h2>Prime Ministers and governments</h2><table><tr><th>Years</th><th>Prime Minister</th><th>Party</th><th>Government</th></tr>' + L.governments.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td><td style="text-align:left">' + esc(r[3]) + '</td></tr>'; }).join('') + '</table>';
    h += '<h2>The parties</h2>' + U.ALL_PARTIES.filter(function (p) { return L.parties[p]; }).map(function (p) { var x = L.parties[p];
      return '<div class="panel"><h3 style="margin-top:0">' + chip(p) + esc(P(p).name) + ' <span class="small muted">founded ' + esc(x[0]) + '</span></h3><p>' + esc(x[1]) + '</p><p class="small"><b>Ideology:</b> ' + esc(x[2]) + '</p></div>'; }).join('');
    h += '<h2>The default timeline</h2><p>' + esc(L.future) + '</p>';
    return h;
  }

  // ---------- past elections ----------
  function oldParty(k) { var o = U.LORE.oldParties[k]; return o ? { name: o[0], short: o[0], color: o[1] } : U.PARTIES[k] ? { name: P(k).name, short: P(k).short, color: P(k).color } : { name: '', short: '', color: '#888' }; }
  function ochip(k) { return '<i class="chip" style="background:' + oldParty(k).color + '"></i>'; }
  function bar(pct, color) { return '<div class="bar" style="margin:2px 0 0"><i style="width:' + U.clamp(pct, 0, 100) + '%;background:' + color + '"></i></div>'; }
  // Results map in the style of Spanish election maps: shaded winner, seat dots, legend, ring
  var genMode = 'house', genData = null;
  function resultsBlock(r) {
    var P = U.partyInfo, sen = genMode === 'senate' && r.senStates, data = sen ? r.senStates : r.states, seats = sen ? r.senate : r.house, tot = U.sum(seats);
    if (sen && r.senShares) r = Object.assign({}, r, { shares: r.senShares });
    var ord = Object.keys(seats).filter(function (p) { return seats[p] > 0; }).sort(function (a, b) { return seats[b] - seats[a] || (r.shares[b] || 0) - (r.shares[a] || 0); });
    var winners = {}; for (var sid in data) { var sh = data[sid].shares || {}, w = Object.keys(sh).sort(function (a, b) { return sh[b] - sh[a]; })[0]; if (w) winners[w] = 1; }
    var lead = (sen ? r.senLeaders : r.leaders) || (sen ? {} : Q.leaders) || {};
    var econ = function (ks) { return ks.sort(function (a, b) { return (P(a).econ || 0) - (P(b).econ || 0); }); };
    var h = '<div class="row" style="margin:14px 0 6px"><h3 style="margin:0">Results by state</h3><button class="btn ' + (sen ? 'ghost' : '') + '" data-gmode="house">House</button>' + (r.senStates ? '<button class="btn ' + (sen ? '' : 'ghost') + '" data-gmode="senate">Senate</button>' : '') + '</div>';
    h += '<div class="resgrid"><div class="resring">' + Ch.ring(seats, r.shares, econ) + '<div class="small muted">Inner: seats &middot; outer: votes</div></div><table class="seats reslegend"><tr><th>Party</th><th>' + (sen ? 'Senate leader' : 'House leader') + '</th><th>Vote</th><th>Seats</th></tr>' +
      ord.map(function (p) { return '<tr><td><span class="lgname" style="background:' + P(p).color + ';color:' + Ch.ink(P(p).color) + '">' + P(p).short + '</span>' +
        (winners[p] ? '<div class="lgscale">' + [0, 1, 2, 3, 4, 5, 6].map(function (b) { return '<i style="background:' + Ch.shade(P(p).color, b) + '"></i>'; }).join('') + '</div>' : '') + '</td><td class="small"><i>' + esc(p === 'revsoc' ? '(fragmented)' : p === 'ind' ? '(independents)' : lead[p] || '') + '</i></td><td>' + (r.shares[p] != null ? (+r.shares[p]).toFixed(2) + '%' : '') + '</td><td><b>' + seats[p] + '</b></td></tr>'; }).join('') +
      '<tr><td colspan="4" class="small muted">Shading: ' + Ch.bandLabels.join(' · ') + ' for the party with the most votes in the state.</td></tr></table></div>';
    genData = data;
    var legs = null; if (sen) { legs = {}; for (var ls in data) if (data[ls].leg) legs[data[ls].leg] = (legs[data[ls].leg] || 0) + 1; if (!U.sum(legs)) legs = null; }
    h += '<div id="genmap">' + Ch.resultMap(Q, data, sen ? (legs ? { inset: { title: 'Chosen by state legislatures (' + U.sum(legs) + ' senators)', seats: legs, shares: r.shares } } : null) : r.national ? { inset: { title: 'National list (' + U.sum(r.national) + ' seats)', seats: r.national, shares: r.shares } } : null) + '</div>';
    h += '<p class="small muted">' + (sen ? 'Each dot on the map is a senator elected statewide (largest party 2, runner-up 1; 1-1-1 if within 2 points, 3-0 in a landslide); the senators chosen by state legislatures are in the box below (' + tot + ' in all).' : r.national ? 'Each dot is a state list seat; the 100 national list seats are shown in the box.' : 'Each dot is a House seat, elected by statewide PR.') + (r.generated ? ' State figures for elections before 1996 are reconstructed from the national result.' : '') + ' Hover or tap a state for details.</p>';
    return h;
  }

  function elections() {
    var hist = U.LORE.presElections.map(function (e, i) { return { key: 'h' + i, label: e.year + ' presidential', rec: e, kind: 'hist' }; });
    var game = (Q.history || []).map(function (e, i) { return { key: 'g' + i, label: e.date + (e.kind === 'pres' ? ' presidential' : ' general'), rec: e, kind: e.kind }; });
    var gens = U.LORE.generalElections.map(function (e, i) { return { key: 'e' + i, label: String(e.year), rec: e, kind: 'histgen' }; });
    if (Q.open1996) gens.push({ key: 'e96', label: '1996', rec: { year: 1996, seats: 600, shares: U.ELECTION_1996, house: Q.open1996.house, byState: Q.open1996.byState, open: Q.open1996, gov: ['ldp', 'sdlp'], cs: ['reform'], pm: 'Al Gore', modern: true,
      note: 'The 1995\u201396 shutdown broke Gingrich\u2019s coalition: the CDP walked out, and a constructive vote to install Al Gore failed by four votes. With his budgets defeated in the House, Gingrich asked for an early election, gambling that voters would blame Clinton; both chambers agreed. The CC fell to its worst result since its founding, losing votes to the new Reform Party and the Constitution Party. Clinton nominated Gore, who won an absolute majority at the head of an LDP\u2013SDLP government with Reform confidence and supply. This is the parliament the game starts with.' }, kind: 'histgen' });
    var all = hist.concat(gens, game);
    if (!electSel || !all.some(function (x) { return x.key === electSel; })) electSel = all[all.length - 1].key;
    var h = '<h1>Elections</h1><div class="row" style="margin-bottom:8px"><span class="small">Before the game:</span>' + hist.map(function (x) { return '<button class="btn ' + (x.key === electSel ? '' : 'ghost') + '" data-elect="' + x.key + '">' + x.rec.year + '</button>'; }).join('') + '</div>';
    h += '<div class="row" style="margin-bottom:8px"><span class="small">General, before the game:</span>' + gens.map(function (x) { return '<button class="btn ' + (x.key === electSel ? '' : 'ghost') + '" data-elect="' + x.key + '">' + x.label + '</button>'; }).join('') + '</div>';
    h += '<div class="row" style="margin-bottom:12px"><span class="small">In this game:</span>' + (game.length ? game.map(function (x) { return '<button class="btn ' + (x.key === electSel ? '' : 'ghost') + '" data-elect="' + x.key + '">' + esc(x.label) + '</button>'; }).join('') : '<span class="small muted">Elections you play will be kept here.</span>') + '</div>';
    var sel = all.filter(function (x) { return x.key === electSel; })[0], r = sel.rec;
    if (sel.kind === 'hist') {
      var w = r.r2[0];
      h += '<div class="panel"><h2 style="margin-top:0">' + r.year + ' presidential election</h2><p><b>' + esc(w[0]) + '</b> (' + esc(oldParty(w[1]).name) + ') elected. ' + esc(r.note) + '</p>';
      h += '<h3>Round one: national popular vote</h3><table class="seats">' + r.r1.map(function (c, i) { return '<tr><td>' + (c[1] ? ochip(c[1]) : '') + esc(c[0]) + (c[1] ? ' <span class="small muted">' + esc(oldParty(c[1]).short) + '</span>' : '') + (i < 2 ? ' <span class="pill yes">advances</span>' : '') + bar(c[2] * 2.5, c[1] ? oldParty(c[1]).color : '#888') + '</td><td><b>' + c[2].toFixed(1) + '%</b></td></tr>'; }).join('') + '</table>';
      h += '<h3>Round two: Electoral College (' + r.total + ' electors)</h3><table class="seats"><tr><th>Candidate</th><th>Electors</th><th>Vote</th></tr>' + r.r2.map(function (c) { return '<tr><td>' + ochip(c[1]) + esc(c[0]) + bar(c[2] / r.total * 100, oldParty(c[1]).color) + '</td><td><b>' + c[2] + '</b></td><td>' + c[3].toFixed(1) + '%</td></tr>'; }).join('') + '</table>';
      // runoff map: electors by state for the period; greyed states had no electors yet
      var el = r.era === 'modern' ? U.Elections.apportion().electors : U.LORE.ecEras[r.era], lose = r.lose.split(' ');
      var colorOfH = function (sid) { return el[sid] == null ? '#d6d2c8' : oldParty(lose.indexOf(sid) >= 0 ? r.r2[1][1] : r.r2[0][1]).color; };
      h += '<div id="electmap" style="margin-top:10px">' + Ch.geoMap(Q, colorOfH, function (sid) { return el[sid] == null ? '' : String(el[sid]); }) + '</div><p class="small muted">Runoff winner in each state, with its electors.' + (el.AK == null ? ' Alaska and Hawaii were not yet states, and DC had no electors.' : '') + '</p>';
      genData = U.LORE.presR1Detail(r);
      h += '<h3>Round one by state</h3><div class="row small" style="gap:10px;flex-wrap:wrap">' + r.r1.filter(function (c) { return c[1]; }).map(function (c) { var pi = U.partyInfo(c[1]); return '<span><span class="lgname" style="background:' + pi.color + ';color:' + Ch.ink(pi.color) + '">' + esc(c[0]) + '</span><span class="lgscale">' + [0, 1, 2, 3, 4, 5, 6].map(function (b) { return '<i style="background:' + Ch.shade(pi.color, b) + '"></i>'; }).join('') + '</span></span>'; }).join('') + '</div>' +
        '<div id="genmap">' + Ch.resultMap(Q, genData) + '</div><p class="small muted">The candidate with the most first-round votes in each state, shaded ' + Ch.bandLabels.join(' · ') + '. Hover or tap a state for the full vote. State figures are reconstructed from the national result.</p></div>';
      return h;
    }
    if (sel.kind === 'histgen') {
      var seats = r.house || U.LORE.generalSeats(r), maj = Math.floor(r.seats / 2) + 1;
      var ord = Object.keys(r.shares).filter(function (k) { return k !== 'oth'; }).sort(function (a, b) { return (seats[b] || 0) - (seats[a] || 0) || (r.shares[b] || 0) - (r.shares[a] || 0); });
      var gs = r.gov.reduce(function (a, k) { return a + (seats[k] || 0); }, 0), cs = (r.cs || []).reduce(function (a, k) { return a + (seats[k] || 0); }, 0);
      var AB = { dem: 'DEM', rep: 'REP', prog: 'PROG', soc: 'SOC', fl: 'FLP' }, nm = function (k) { return esc(AB[k] || oldParty(k).short); };
      h += '<div class="panel"><h2 style="margin-top:0">' + r.year + ' general election</h2><p>' + esc(r.note) + '</p>';
      h += '<p><b>Government:</b> ' + esc(r.pm) + ' (' + r.gov.map(nm).join('\u2013') + ', ' + gs + ' seats' + (r.cs ? '; confidence and supply from ' + r.cs.map(nm).join(' and ') + ', ' + (gs + cs) + ' in all' : '') + '). Majority: ' + maj + ' of ' + r.seats + '.</p>';
      h += '<div class="bar" style="height:14px;display:flex;margin:6px 0">' + ord.map(function (k) { return seats[k] ? '<i style="position:static;display:block;height:100%;width:' + (seats[k] / r.seats * 100) + '%;background:' + oldParty(k).color + '" title="' + esc(oldParty(k).name) + '"></i>' : ''; }).join('') + '</div>';
      h += '<table class="seats"><tr><th>Party</th><th>Vote</th><th>Seats</th></tr>' + ord.map(function (k) { return '<tr><td>' + ochip(k) + esc(oldParty(k).name) + (r.gov.indexOf(k) >= 0 ? ' <span class="pill yes">gov</span>' : '') + '</td><td>' + (r.shares[k] != null ? (+r.shares[k]).toFixed(1) + '%' : '') + '</td><td><b>' + (seats[k] || 0) + '</b></td></tr>'; }).join('') + (r.shares.oth ? '<tr><td class="muted">Others</td><td>' + r.shares.oth.toFixed(1) + '%</td><td>0</td></tr>' : '') + '</table>';
      var gd = U.LORE.generalDetail(r), lf = U.LORE.leadersFor(r.year), lead = lf.house;
      return h + resultsBlock({ states: gd.states, senStates: gd.senStates, national: gd.national, house: gd.house, senate: gd.senate, shares: r.shares, senShares: gd.senShares, leaders: lead, senLeaders: lf.senate, generated: true }) + '</div>';
      var topH;
      if (r.byState) topH = function (sid) { var d = r.byState[sid]; if (!d) return null; return Object.keys(d).sort(function (a, b) { return d[b] - d[a]; })[0]; };
      else { var mp = {}; for (var k in r.map) r.map[k].split(' ').forEach(function (sid) { if (sid) mp[sid] = k; }); topH = function (sid) { return (r.seats < 600 && (sid === 'AK' || sid === 'HI') && r.year < 1959) ? null : (mp[sid] || r.top); }; }
      if (r.open && r.open.states) { var o = r.open; return h + resultsBlock({ states: o.states, senStates: o.senStates, national: o.national, house: o.house, senate: o.senate, shares: r.shares, leaders: U.LORE.leadersFor(1996).house, senLeaders: U.LORE.leadersFor(1996).senate }) + '</div>'; }
      h += '<h3>Largest party by state</h3><div id="electmap">' + Ch.geoMap(Q, function (sid) { var t = topH(sid); return t ? oldParty(t).color : '#d6d2c8'; }, function (sid) { var t = topH(sid); return t ? nm(t) : ''; }) + '</div><p class="small muted">' + (r.byState ? 'The party with the most House seats in each state.' : 'The party with the most votes in each state.') + (r.year < 1959 ? ' Alaska and Hawaii were not yet states.' : '') + '</p></div>';
      return h;
    }
    if (sel.kind === 'pres') {
      var cm = {}; r.cands.forEach(function (c) { cm[c.id] = c; });
      var order1 = Object.keys(r.r1).sort(function (a, b) { return r.r1[b] - r.r1[a]; });
      h += '<div class="panel"><h2 style="margin-top:0">' + esc(r.date) + ' presidential election</h2><p><b>' + esc(cm[r.winner].name) + '</b> (' + esc(P(cm[r.winner].party).name) + ') elected' + (r.tiebreak ? ' (tie broken by ' + r.tiebreak + ')' : '') + '.</p>';
      h += '<h3>Round one: national popular vote</h3><table class="seats">' + order1.map(function (k, i) { var c = cm[k]; return '<tr><td>' + chip(c.party) + esc(c.name) + (i < 2 ? ' <span class="pill yes">advances</span>' : '') + bar(r.r1[k] * 2.5, P(c.party).color) + '</td><td><b>' + (+r.r1[k]).toFixed(1) + '%</b></td></tr>'; }).join('') + '</table>';
      h += '<h3>Round two: Electoral College (' + r.total + ' electors)</h3><table class="seats"><tr><th>Candidate</th><th>Electors</th><th>Vote</th></tr>' + Object.keys(r.r2).sort(function (a, b) { return r.r2[b] - r.r2[a]; }).map(function (k) { var c = cm[k]; return '<tr><td>' + chip(c.party) + esc(c.name) + '</td><td><b>' + r.r2[k] + '</b></td><td>' + (r.pop2[k] != null ? r.pop2[k].toFixed(1) + '%' : '') + '</td></tr>'; }).join('') + '</table>';
      h += '<div id="electmap" style="margin-top:10px">' + Ch.geoMap(Q, function (sid) { var k = r.map[sid]; return k && cm[k] ? P(cm[k].party).color : '#9aa0a6'; }, function (sid) { var k = r.map[sid]; return k && cm[k] ? P(cm[k].party).short : ''; }) + '</div><p class="small muted">Runoff winner in each state.</p></div>';
      return h;
    }
    var order = Object.keys(r.house).sort(function (a, b) { return r.house[b] - r.house[a]; });
    h += '<div class="panel"><h2 style="margin-top:0">' + esc(r.date) + ' general election</h2><div class="grid2"><div><h3>House</h3>' + Ch.hemicycle(Q, r.house) + '</div><div><table class="seats"><tr><th>Party</th><th>Vote</th><th>Seats</th></tr>' + order.map(function (p) { return '<tr><td>' + chip(p) + P(p).name + '</td><td>' + (r.shares[p] != null ? r.shares[p].toFixed(1) + '%' : '') + '</td><td><b>' + r.house[p] + '</b></td></tr>'; }).join('') + '</table></div></div>';
    if (r.states) h += resultsBlock(r);
    h += '<h3>Senate</h3>' + Ch.seatTable(Q, r.senate) + '</div>';
    return h;
  }

  function log() {
    return '<h1>Timeline</h1><div class="log">' + Q.log.slice().reverse().map(function (l) { return '<p><span class="t">' + esc(l.t) + '</span>' + esc(l.text) + '</p>'; }).join('') + '</div>';
  }

  function system() {
    return '<h1>Game</h1><div class="choices" style="max-width:420px"><button class="choice" data-act="savefile">Export save file<small>Download the campaign as JSON.</small></button><label class="choice">Import save file<small>Load a JSON save.</small><input type="file" accept=".json" data-act="loadfile" style="margin-top:6px"></label><button class="choice" data-act="restart">Start a new campaign<small>The current autosave will be replaced.</small></button></div>' +
      '<h2>Rules in force</h2><pre class="small" style="white-space:pre-wrap">' + esc(JSON.stringify(U.RULES, null, 1)) + '</pre>';
  }

  // after a card is played or discarded: the month has advanced
  function after(res) {
    if (!res) return;
    lastText = (res.text || '') + ' <span class="muted">\u2014 The month passes. It is now ' + U.dateStr(Q) + '.</span>';
    save();
    if (res.out && (res.out.general || res.out.presidential)) { elec = res.out; U.Night.reset(); go('electionchoice'); } else go('office');
  }

  // ---------- events ----------
  function bind() {
    document.querySelectorAll('[data-tab]').forEach(function (b) { b.onclick = function () { go(b.dataset.tab); }; });
    // hand buttons carry the card id; option buttons inside a card scene carry an index
    document.querySelectorAll('[data-deck]').forEach(function (b) { b.onclick = function () { Dk.drawAny(Q, b.dataset.deck); save(); render(); }; });
    document.querySelectorAll('[data-play]').forEach(function (b) { b.onclick = function () { openSlot = +b.dataset.play; openCard = F.cardAt(Q, openSlot); lastText = null; render(); window.scrollTo(0, 0); }; });
    document.querySelectorAll('[data-discard]').forEach(function (b) { b.onclick = function () { after(F.discard(Q, +b.dataset.discard)); }; });
    document.querySelectorAll('.scene button[data-card]').forEach(function (b) { b.onclick = function () { var slot = openSlot; openCard = null; openSlot = null; after(F.playHand(Q, slot, +b.dataset.card)); }; });
    document.querySelectorAll('button[data-event]').forEach(function (b) { b.onclick = function () { lastText = F.answerEvent(Q, +b.dataset.event); save(); render(); }; });
    document.querySelectorAll('[data-mapstyle]').forEach(function (b) { b.onclick = function () { mapStyle = b.dataset.mapstyle; try { localStorage.setItem('usa-pr-mapstyle', mapStyle); } catch (e) {} render(); }; });
    document.querySelectorAll('[data-pfilter]').forEach(function (b) { b.onclick = function () { partyFilter = b.dataset.pfilter; render(); }; });
    document.querySelectorAll('[data-elect]').forEach(function (b) { b.onclick = function () { electSel = b.dataset.elect; render(); }; });
    document.querySelectorAll('[data-gmode]').forEach(function (b) { b.onclick = function () { genMode = b.dataset.gmode; render(); }; });
    document.querySelectorAll('[data-map]').forEach(function (b) { b.onclick = function () { mapMode = b.dataset.map; render(); }; });
    if (view === 'map') document.querySelectorAll('.tile').forEach(function (t) { t.onclick = function () { mapSel = t.dataset.state; render(); var d = $('statedetail'); if (d) d.scrollIntoView({ behavior: 'smooth', block: 'start' }); }; });
    document.querySelectorAll('[data-role]').forEach(function (b) { b.onclick = function () { var a = b.dataset.role.split('|'), p = a[0]; deal.coalition = deal.coalition.filter(function (x) { return x !== p; }); deal.cs = deal.cs.filter(function (x) { return x !== p; }); deal.abstain = (deal.abstain || []).filter(function (x) { return x !== p; }); delete deal.posts[p]; if (a[1] === 'coalition') deal.coalition.push(p); if (a[1] === 'cs') deal.cs.push(p); if (a[1] === 'abstain') deal.abstain.push(p); if (a[1] === 'none') delete deal.concessions[p]; else if (!deal.concessions[p]) deal.concessions[p] = []; deal.posts = {}; render(); }; });
    document.querySelectorAll('[data-posts]').forEach(function (b) { b.onclick = function () { var a = b.dataset.posts.split('|'); deal.posts[a[0]] = U.clamp((deal.posts[a[0]] || 0) + +a[1], 1, 12); var mine = deal.posts[Q.player] || 0; if (+a[1] > 0 && U.sum(deal.posts) > 20 && mine > 1) deal.posts[Q.player] = mine - 1; if (+a[1] < 0) deal.posts[Q.player] = mine + 1; render(); }; });
    document.querySelectorAll('[data-conc]').forEach(function (b) { b.onclick = function () { var a = b.dataset.conc.split('|'), l = deal.concessions[a[0]] = deal.concessions[a[0]] || [], i = l.indexOf(a[1]); if (i >= 0) l.splice(i, 1); else l.push(a[1]); render(); }; });
    document.querySelectorAll('[data-act]').forEach(function (b) {
      var a = b.dataset.act;
      if (a === 'loadfile') { b.onchange = function () { var f = b.files[0]; if (!f) return; f.text().then(function (t) { Q = JSON.parse(t); save(); go('office'); }); }; return; }
      b.onclick = function () {
        if (a === 'new' || a === 'restart') { if (a === 'restart' && !confirm('Start a new campaign? The autosave will be replaced.')) return; Q = S.newGame(); F.begin(Q); lastText = null; save(); go('office'); }
        if (a === 'continue') { Q = S.load(); F.begin(Q); go('office'); }
        if (a === 'close') { openCard = null; openSlot = null; render(); }
        if (a === 'discardall') { after(F.discardAll(Q)); }
        if (a === 'skip') { after(F.skip(Q)); }
        if (a === 'skipahead') { after(F.skipAhead(Q, 12)); }
        if (a === 'seenight') { go('night'); }
        if (a === 'seefinal') { go('election'); }
        if (a === 'closeelec') { elec = null; go('office'); }
        if (a === 'negotiate') { deal = null; go('negotiate'); }
        if (a === 'aideal') { deal = C.aiDeal(Q, Q.player); render(); }
        if (a === 'back') { go('office'); }
        if (a === 'submitdeal') { var r = F.submitDeal(Q, deal); deal = null; lastText = r.passed ? '<b>' + esc(Q.leader.name) + ' is confirmed as Prime Minister.</b> ' + (r.inv.second ? 'Second ballot: ' + r.inv.second.yes + ' yes, ' + r.inv.second.no + ' no.' : 'First ballot: ' + r.inv.first.yes + ' yes.') : '<b>The investiture fails.</b> ' + (r.inv.second || r.inv.first).yes + ' yes, ' + (r.inv.second || r.inv.first).no + ' no. Partners who were asked feel used; you can try again next month.'; save(); go('office'); }
        if (a === 'savefile') { var blob = new Blob([JSON.stringify(Q)], { type: 'application/json' }); var u = URL.createObjectURL(blob), l = document.createElement('a'); l.href = u; l.download = 'american-republic-' + Q.year + '-' + Q.month + '.json'; l.click(); }
      };
    });
  }

  U.Tips.install(function () { return Q; });
  try { mapStyle = localStorage.getItem('usa-pr-mapstyle') || 'geo'; } catch (e) {}
  render();
})(typeof globalThis !== 'undefined' ? globalThis : window);
