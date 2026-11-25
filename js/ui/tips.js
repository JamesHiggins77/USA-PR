// Hoverable infoboxes for people, parties, factions, voter groups and key
// terms. After each render, text nodes are scanned and known names wrapped in
// <span class="tip">; the card content is built live from the game state.
(function (G) {
  'use strict';
  var U = G.USA, T = U.Tips = {};
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  // ---- people (party, background). Non-canon roles are scenario assumptions.
  var PEOPLE = {
    'Bill Clinton': ['ldp', 'President since 1993, elected in 1992 for a six-year term; faces re-election in November 1998. Head of state with constitutional powers, but not the head of government.'],
    'Al Gore': ['ldp', 'Leader of the Liberal Democrats and Prime Minister of the LDP\u2013SDLP coalition. Holds the effective executive power.'],
    'Bill Bradley': ['sdlp', 'Leader of the Social Democratic Labor Party. Former basketball star and senator; pushes for universal healthcare.'],
    'Ralph Nader': ['grn', 'Consumer advocate turned Green leader, one of the party’s four MPs in 1999. Drives the Green surge.'],
    'Bernie Sanders': ['vpp', 'Vermont Progressive congressman and former mayor of Burlington; he may run for the Senate. The far left may choose him to lead talks on a United Left.'],
    'Ross Perot': ['reform', 'Billionaire founder of the Reform Party, whose MPs provide confidence and supply to Gore’s government.'],
    'Pat Buchanan': ['reform', 'Paleoconservative commentator; Reform’s likely presidential nominee in 2000.'],
    'John McCain': ['cdp', 'Christian Democrat leader (scenario assumption). Maverick reputation; popular with independents.'],
    'George W. Bush': ['cc', 'Governor of Texas and Conservative Coalition leader (scenario assumption).'],
    'Harry Browne': ['lib', 'Libertarian leader and perennial presidential candidate.'],
    'Howard Phillips': ['con', 'Founder and leader of the Constitution Party.'],
    'Joe Lieberman': ['ldp', 'Leader of the New Democrats, the LDP’s centrist faction.'],
    'Ted Kennedy': ['ldp', 'Leader of the Progressive Liberals, the LDP’s left wing.'],
    'John Lewis': ['ldp', 'Civil-rights icon; the conscience of the LDP’s Progressive Liberals.'],
    'Evan Bayh': ['ldp', 'Leads the Blue Dogs, the LDP’s fiscally conservative, moderate rural and small-town wing.'],
    'Howard Dean': ['ldp', 'Governor of Vermont. Energises the LDP’s left and its younger activists.'],
    'Donald Trump': ['maga', 'New York businessman and celebrity. Endorsed the Reform Party in the 1998 presidential election. Founds the MAGA Party only if conditions allow.'],
    'Mike Pence': ['cc', 'Conservative Coalition figure; Prime Minister of the broad-right coalition in the default timeline. Not guaranteed in a sandbox run.']
  };

  // ---- key terms
  var TERMS = {
    'Speaker of the House': 'Presides over the House and controls its agenda. Normally from the Prime Minister\u2019s party, but it can be offered to a partner in coalition talks, which annoys your own members.',
    'Speaker': 'Presides over the House. Can be offered to a partner in coalition talks.',
    'Vice President': 'Elected with the President on a joint ticket. A running mate from another party can bring that party on board, at the cost of your own members\u2019 hopes.',
    'President pro tempore of the Senate': 'The Senate\u2019s presiding officer: a senior senator from the largest governing party in the Senate.',
    'Grand Coalition': 'A government of the large centre-left and centre-right parties together, such as the LDP with the CDP or CC.',
    'confidence and supply': 'A party outside the cabinet agrees to back the government on confidence votes and budgets, usually in return for concessions. It gets no ministers.',
    'Confidence and supply': 'A party outside the cabinet agrees to back the government on confidence votes and budgets, usually in return for concessions. It gets no ministers.',
    'C&S': 'Confidence and supply: support on confidence votes and budgets from outside the cabinet.',
    'investiture': 'The House vote that installs a Prime Minister: an absolute majority (301 of 600) on the first ballot, or 300 with the President\u2019s tie-breaking vote, or more yes than no on the second.',
    'Investiture': 'The House vote that installs a Prime Minister: an absolute majority (301 of 600) on the first ballot, or 300 with the President\u2019s tie-breaking vote, or more yes than no on the second.',
    'caretaker': 'The outgoing government stays in office with limited authority until a new one is invested.',
    'Caretaker': 'The outgoing government stays in office with limited authority until a new one is invested.',
    'no confidence': 'A House vote to remove the government. an absolute majority against topples it, and an election follows.',
    'runoff': 'Second round between the top two candidates when nobody wins an absolute majority in the first. Eliminated parties’ voters move by ideological closeness, or stay home.',
    'runoffs': 'Second rounds between the top two candidates. Electoral pacts change how voters transfer.',
    'two-round': 'If no candidate wins over 50% in the first round, the top two meet in a runoff. Used for districts, governors, direct senators and the President.',
    'list seats': 'The 365 statewide proportional seats in the House, shared among parties by vote share within each state.',
    'Sainte-Laguë': 'A proportional seat formula (divisors 1, 3, 5…) that treats small and large parties evenly.',
    'sainte-lague': 'A proportional seat formula (divisors 1, 3, 5…) that treats small and large parties evenly.',
    "D'Hondt": 'A proportional seat formula (divisors 1, 2, 3…) that slightly favours larger parties.',
    'Electoral College': 'Elects the President, every six years, in up to two rounds. Decides the presidential runoff between the top two from the first-round national popular vote. Each state has House seats + 4 electors (DC 3), and its winner takes them all. Ties go to the popular vote, then a coin flip.',
    'electors': 'Members of the Electoral College: House seats + 4 per state, DC 3. A state\u2019s plurality winner takes all of them.',
    'red line': 'A party refuses to sit in cabinet with another party. Softer for confidence and supply.',
    'red lines': 'Parties that refuse to sit in cabinet together. Softer for confidence and supply.',
    'Red lines': 'Parties that refuse to sit in cabinet together. Softer for confidence and supply.',
    'unicameral': 'A one-chamber state legislature (Nebraska). It elects the state\u2019s fourth U.S. senator, as the state house does elsewhere.',
    '5% threshold': 'State senate seats go only to parties with at least 5% of the statewide vote.',
    'Government formation': 'After an election, parties negotiate. If no Prime Minister is invested within 3 months, a repeat election is called.',
    'government formation': 'After an election, parties negotiate. If no Prime Minister is invested within 3 months, a repeat election is called.',
    'Unity': 'How disciplined the LDP’s MPs are. High unity reduces rebellions on key votes.',
    'Morale': 'Activists’ enthusiasm. Raises fundraising and campaign energy.',
    'Funds': 'The party’s war chest. Rallies, ads and organising cost funds; it refills slowly each month.',
    'Leader approval': 'How the public and members rate the LDP leader. Below 30, with a restless faction, a leadership challenge becomes likely.',
    'Gov. approval': 'Public approval of the government. Driven by the economy, scandals and events; affects partners’ willingness to stay.',
    'Policy fit': 'How close another party is to the LDP’s current platform on the economic, social and federal axes.',
    'Relations': 'Trust between the LDP and another party (0–100), built by cooperation and damaged by broken promises.',
    'Concessions': 'Policy promises offered in negotiations. Undelivered concessions erode trust month by month.',
    'concessions': 'Policy promises offered in negotiations. Undelivered concessions erode trust month by month.',
    'Actions left': 'Each month you can play three cards (four during an election campaign).',
    'Deficit': 'Government borrowing as a share of GDP. Negative means a surplus.',
    'dissent': 'How unhappy a faction is with the leadership. Above 65 its MPs start to rebel; above 88 it may walk out.',
    'Dissent': 'How unhappy a faction is with the leadership. Above 65 its MPs start to rebel; above 88 it may walk out.'
  };

  var FACTIONS = {};
  var GROUPS = {};

  function build() {
    if (T.re) return;
    for (var k in U.LDP_FACTIONS) FACTIONS[U.LDP_FACTIONS[k].name] = k;
    for (var g in U.GROUP_NAMES) GROUPS[U.GROUP_NAMES[g]] = g;
    // every rostered politician gets a card
    Object.keys(U.PERSON_PARTY || {}).forEach(function (n) { if (!PEOPLE[n]) PEOPLE[n] = [U.PERSON_PARTY[n], '']; });
    var keys = Object.keys(PEOPLE).concat(Object.keys(TERMS), Object.keys(FACTIONS), Object.keys(GROUPS));
    T.partyKey = {};
    U.ALL_PARTIES.forEach(function (p) { var P = U.PARTIES[p]; T.partyKey[P.name] = p; T.partyKey[P.short] = p; });
    keys = keys.concat(Object.keys(T.partyKey));
    keys.sort(function (a, b) { return b.length - a.length; });
    var alt = keys.map(function (k) { return k.replace(/[.*+?^${}()|[\]\\&]/g, '\\$&'); }).join('|');
    T.re = new RegExp('(^|[^\\wÀ-ɏ-])(' + alt + ')(?![\\wÀ-ɏ])', 'g');
  }

  function partyCard(Q, p) {
    var P = U.PARTIES[p], C = U.Coalition, h = '<b>' + esc(P.name) + '</b> <span class="muted">(' + esc(P.short) + ')</span><br>';
    var kind = { party: 'Political party', alliance: 'Electoral alliance', federation: 'Federation of state parties', regional: 'Regional party', bloc: 'Several small parties shown together' }[P.kind] || P.kind;
    var lore = U.LORE && U.LORE.parties[p];
    h += '<span class="muted">' + kind + (lore ? ' · founded ' + esc(lore[0]) : P.founded ? ' · founded ' + esc(P.founded) : '') + '</span><br>';
    if (lore) h += '<span class="muted">' + esc(lore[2]) + '</span><br>';
    if (Q && Q.dormant[p]) return h + 'Does not exist at present.' + (P.note ? '<br>' + esc(P.note) : '');
    h += 'Leader: ' + esc(Q && Q.leaders && Q.leaders[p] ? (p === Q.player ? Q.leader.name : Q.leaders[p]) : P.leader) + '<br>';
    if (Q) {
      var n = U.Votes.national(Q)[p] || 0, pos = Q.pos[p];
      h += 'Polling ' + n.toFixed(1) + '% · House ' + (Q.house[p] || 0) + ' · Senate ' + (U.Elections.senateCount(Q)[p] || 0) + '<br>';
      h += 'Economy ' + pos.econ.toFixed(1) + ', society ' + pos.soc.toFixed(1) + ', federalism ' + pos.fed.toFixed(1) + '<br>';
      if (p !== Q.player) h += 'Relations with LDP ' + Math.round(C.rel(Q, Q.player, p)) + ' · policy fit ' + Math.round(C.compat(Q, Q.player, p) * 100) + '%<br>';
      if (Q.gov) h += Q.gov.coalition.indexOf(p) >= 0 ? 'In government<br>' : Q.gov.cs.indexOf(p) >= 0 ? 'Confidence and supply<br>' : '';
      if (p === 'ul' && Q.ulMembers) h += 'Members: ' + Object.keys(Q.ulMembers).map(function (m) { return U.PARTIES[m].short; }).join(', ') + '<br>';
      var vet = U.ALL_PARTIES.filter(function (q) { return q !== p && !Q.dormant[q] && U.vetoes(p, q); });
      if (vet.length) h += '<span class="muted">Red lines: ' + vet.map(function (q) { return U.PARTIES[q].short; }).join(', ') + '</span>';
    }
    if (P.home) h += '<br><span class="muted">Strongest in: ' + Object.keys(P.home).slice(0, 6).join(', ') + '</span>';
    if (P.note) h += '<br><span class="muted">' + esc(P.note) + '</span>';
    return h;
  }

  function personCard(Q, name) {
    var d = PEOPLE[name], p = d ? d[0] : null, roles = [];
    if (Q) {
      if (Q.president.name === name) roles.push('President');
      if (Q.gov && Q.gov.pm === name) roles.push('Prime Minister');
      if (Q.leader.name === name) roles.push('LDP leader');
      for (var lp in (Q.leaders || {})) if (Q.leaders[lp] === name && lp !== Q.player) roles.push(U.PARTIES[lp].short + ' leader');
      ['vp', 'speaker', 'ppt'].forEach(function (k) { if (Q.offices && Q.offices[k] && Q.offices[k].name === name) roles.push({ vp: 'Vice President', speaker: 'Speaker of the House', ppt: 'President pro tempore' }[k]); });
      (Q.cabinet || []).forEach(function (c) { if (c.name === name) roles.push(c.post); });
    }
    var stt = U.personStats ? U.personStats(name) : null;
    return '<b>' + esc(name) + '</b>' + (p ? ' <span class="muted">(' + esc(U.PARTIES[p].short) + ')</span>' : '') + (stt ? '<br><span class="muted">Competence ' + stt.competence + ' \u00b7 charisma ' + stt.charisma + ' \u00b7 loyalty ' + stt.loyalty + '</span>' : '') +
      (roles.length ? '<br><b>Now:</b> ' + roles.join(', ') : '') + (d ? '<br>' + esc(d[1]) : '');
  }

  T.content = function (Q, key) {
    if (PEOPLE[key]) return personCard(Q, key);
    if (FACTIONS[key]) {
      var k = FACTIONS[key], F = U.LDP_FACTIONS[k], f = Q && Q.factions[k];
      var who = Object.keys(PEOPLE).filter(function (n) { return n === F.figure; });
      return '<b>' + esc(F.name) + '</b> <span class="muted">LDP faction</span><br>Figure: ' + esc(F.figure) + '<br>Wants: ' + esc(F.wants) +
        (f ? '<br>Strength ' + Math.round(f.strength) + '% · dissent ' + Math.round(f.dissent) : '') + (who.length ? '' : '');
    }
    if (GROUPS[key]) {
      var g = GROUPS[key];
      if (!Q) return '<b>' + esc(key) + '</b>';
      var raw = {}, tot = 0;
      U.NATIONAL.forEach(function (p) { if (Q.dormant[p]) return; raw[p] = Math.max(0.05, U.PARTIES[p].pref[g] + ((Q.mods[p] || {})[g] || 0)) * Q.calib[p]; tot += raw[p]; });
      var top = Object.keys(raw).sort(function (a, b) { return raw[b] - raw[a]; }).slice(0, 4);
      return '<b>' + esc(key) + '</b> <span class="muted">voter group</span><br>Leaning: ' + top.map(function (p) { return U.PARTIES[p].short + ' ' + (raw[p] / tot * 100).toFixed(0) + '%'; }).join(', ') + '<br><span class="muted">Groups are not monolithic: these are averages.</span>';
    }
    if (T.partyKey[key]) return partyCard(Q, T.partyKey[key]);
    if (TERMS[key]) return '<b>' + esc(key) + '</b><br>' + esc(TERMS[key]);
    return null;
  };

  var SKIP = { SCRIPT: 1, STYLE: 1, OPTION: 1, SELECT: 1, TEXTAREA: 1, INPUT: 1, TITLE: 1, PRE: 1 };
  T.decorate = function (root) {
    build();
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), nodes = [], n;
    while ((n = walker.nextNode())) {
      var el = n.parentNode, bad = false;
      for (var e = el; e && e !== root; e = e.parentNode) { if (SKIP[e.nodeName] || (e.classList && e.classList.contains('tip')) || e.namespaceURI === 'http://www.w3.org/2000/svg') { bad = true; break; } }
      if (!bad && n.nodeValue.trim()) nodes.push(n);
    }
    nodes.forEach(function (node) {
      var s = node.nodeValue; T.re.lastIndex = 0;
      if (!T.re.test(s)) return;
      T.re.lastIndex = 0;
      var html = esc(s).replace(new RegExp(T.re.source.replace(/&/g, '&amp;'), 'g'), function (m, pre, key) {
        var real = key.replace(/&amp;/g, '&');
        return pre + '<span class="tip" tabindex="0" data-tip="' + esc(real) + '">' + key + '</span>';
      });
      var span = document.createElement('span'); span.innerHTML = html;
      node.parentNode.replaceChild(span, node);
    });
  };

  // ---- the floating card ----
  var box = null, cur = null;
  function show(el, x, y) {
    var Q = T.getState ? T.getState() : null, html = T.content(Q, el.dataset.tip);
    if (!html) return;
    if (!box) { box = document.createElement('div'); box.id = 'tipbox'; box.setAttribute('role', 'tooltip'); document.body.appendChild(box); }
    box.innerHTML = html; box.style.display = 'block'; cur = el;
    var r = el.getBoundingClientRect(), bw = box.offsetWidth, bh = box.offsetHeight;
    var left = Math.min(window.innerWidth - bw - 8, Math.max(8, (x != null ? x : r.left) - bw / 2));
    var top = r.bottom + 6; if (top + bh > window.innerHeight - 8) top = r.top - bh - 6;
    box.style.left = (left + window.scrollX) + 'px'; box.style.top = (Math.max(8, top) + window.scrollY) + 'px';
  }
  function hide() { if (box) box.style.display = 'none'; cur = null; }
  T.install = function (getState) {
    T.getState = getState;
    document.addEventListener('mouseover', function (e) { var t = e.target.closest && e.target.closest('.tip'); if (t) show(t, e.clientX); else if (cur && !(e.target.closest && e.target.closest('#tipbox'))) hide(); });
    document.addEventListener('focusin', function (e) { if (e.target.classList && e.target.classList.contains('tip')) show(e.target); });
    document.addEventListener('focusout', hide);
    // touch: tapping a term outside a button toggles its card
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('.tip');
      if (t && !t.closest('button, label, a')) { if (cur === t) hide(); else show(t); return; }
      if (!(e.target.closest && e.target.closest('#tipbox'))) hide();
    });
    window.addEventListener('scroll', hide, { passive: true });
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
