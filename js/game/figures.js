// Careers of key figures. Nothing is fixed: each game shifts when a figure
// arrives and leaves, and a figure who needs to win a seat only reaches
// national politics if their party can win it in their state (no LDP Senate
// seat in Illinois, no Senator Obama). Losers stay in state politics and may
// try again at the next election.
(function (G) {
  'use strict';
  var U = G.USA, S = U.Game;
  var ROUTE = { H: 'House', S: 'Senate', G: 'Governor', L: 'State legislature', M: 'Local office', A: 'Party figure', X: 'Appointed office' };
  function hh(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  var stName = function (st) { return (U.STATES[st] || U.DC || { name: st }).name; };

  S.initFigures = function (Q) {
    Q.fig = {};
    U.FIGURES_ALL.forEach(function (f) {
      var j = hh((Q.seed0 || 1) + '|' + f.name);
      var prev = Q.fig[f.name];
      if (prev) { prev.later = { party: f.party, year: (f.enters || 2016) + (j % 4) - 1 }; return; }   // a later move to another party
      var enter = f.enters ? f.enters + (j % 6) - 2 : 0;
      var leave = f.leaves ? f.leaves + ((j >>> 4) % 7) - 3 : (f.born ? f.born + 77 + ((j >>> 8) % 11) : 0);
      if (enter && leave && leave < enter + 3) leave = enter + 3;
      Q.fig[f.name] = { p: f.party, born: f.born, st: f.st, route: f.route, enter: enter, leave: leave, tries: 0,
        status: enter && enter > 1997 ? 'waiting' : 'active', since: enter && enter <= 1997 ? enter : (enter ? 0 : 1997) };
    });
    // older roster names without a full record: from U.CAREERS where known, otherwise
    // they leave national politics some time in the 2000s
    Object.keys(U.PEOPLE || {}).forEach(function (p) {
      (U.PEOPLE[p] || []).forEach(function (n) {
        if (Q.fig[n]) return;
        var c = (U.CAREERS || {})[n] || [0, 0], j = hh((Q.seed0 || 1) + '|' + n);
        var enter = c[0] ? c[0] + (j % 6) - 2 : 0, leave = c[1] ? c[1] + ((j >>> 4) % 7) - 3 : 2003 + (j % 12);
        Q.fig[n] = { p: p, born: 0, st: '', route: 'A', enter: enter, leave: leave, tries: 0, status: enter > 1997 ? 'waiting' : 'active', since: enter > 1997 ? 0 : 1997, minor: 1 };
      });
    });
  };

  // can the party win the seat this figure is after?
  function canWin(Q, f) {
    var p = f.p, st = f.st;
    if (Q.dormant[p]) return false;
    if (f.route === 'H') { var d = (Q.houseByState || {})[st] || {}; if (d[p] > 0) return true; var sh = U.Votes.stateShares ? U.Votes.stateShares(Q, U.STATES[st] || U.DC) : null; return !!(sh && sh[p] >= 7); }
    if (f.route === 'S') return (Q.senateSeats || []).some(function (x) { return x.state === st && x.party === p; });
    if (f.route === 'G') return !!(Q.states && Q.states[st] && Q.states[st].governor === p);
    return true;
  }
  S.isActive = function (Q, n) { var f = Q.fig && Q.fig[n]; if (f) return f.status === 'active'; if (Q.fig) return Q.year < 2001; return !U.activeIn || U.activeIn(n, Q.year); };
  // the current champion of an LDP faction: its named figure while active, then a successor
  S.factionChamp = function (Q, k) { var f = U.LDP_FACTIONS[k], who = f.figure; if (S.isActive(Q, who)) return who; Q.champs = Q.champs || {}; if (Q.champs[k] && S.isActive(Q, Q.champs[k])) return Q.champs[k]; var ex = {}; if (Q.leader) ex[Q.leader.name] = 1; for (var c in Q.champs) ex[Q.champs[c]] = 1; return (Q.champs[k] = S.pickPerson(Q, 'ldp', ex, 'charisma')); };

  S.figuresYear = function (Q) {
    if (!Q.fig) S.initFigures(Q);
    if (Q.month !== 1 || Q.flags.figYear === Q.year) return;
    Q.flags.figYear = Q.year; Q.retired = Q.retired || {};
    var holds = {}, ins = [], outs = [], lost = [], moves = [], O = Q.offices || {};
    [Q.president && Q.president.name, Q.gov && Q.gov.pm, O.vp && O.vp.name, O.speaker && O.speaker.name, O.ppt && O.ppt.name].forEach(function (n) { if (n) holds[n] = 1; });
    Object.keys(Q.fig).forEach(function (n) {
      var f = Q.fig[n];
      if (f.status === 'retired') return;
      // moving to another party
      if (f.later && Q.year >= f.later.year && !Q.dormant[f.later.party] && f.p !== f.later.party) { moves.push(n + ' (' + U.partyInfo(f.p).short + ' → ' + U.partyInfo(f.later.party).short + ')'); f.p = f.later.party; f.later = null; }
      // leaving politics (those holding a top office finish first)
      if (f.leave && Q.year >= f.leave && !holds[n]) { f.status = 'retired'; f.out = Q.year; Q.retired[n] = 1; if (f.since || f.enter <= 1997) outs.push(n);
        if (Q.leader && Q.leader.name === n) { var ex0 = {}; ex0[n] = 1; Q.leader.name = S.pickPerson(Q, Q.player, ex0, 'charisma'); if (Q.leaders) Q.leaders[Q.player] = Q.leader.name; S.note(Q, n + ' steps down as leader of the ' + U.partyInfo(Q.player).short + '; ' + Q.leader.name + ' takes over.'); }
        for (var lp in (Q.leaders || {})) if (Q.leaders[lp] === n && lp !== Q.player) { var ex = {}; ex[n] = 1; Q.leaders[lp] = S.pickPerson(Q, lp, ex, 'charisma'); S.note(Q, n + ' steps down as leader of the ' + U.partyInfo(lp).short + '; ' + Q.leaders[lp] + ' takes over.'); }
        for (lp in (Q.senLeaders || {})) if (Q.senLeaders[lp] === n) delete Q.senLeaders[lp];
        return; }
      if (f.status === 'active') return;
      if (Q.year < f.enter) return;
      if (Q.dormant[f.p]) { if (Q.year > f.enter + 8) { f.status = 'retired'; f.never = 1; } return; }
      if (canWin(Q, f)) { f.status = 'active'; f.since = Q.year; ins.push(n + ' (' + U.partyInfo(f.p).short + ')'); }
      else { f.tries++; f.status = 'lost'; f.lastLost = Q.year; lost.push(n);
        if (f.tries >= 4) { f.status = 'retired'; f.never = 1; } }
    });
    if (outs.length) S.note(Q, 'Leaving national politics this year: ' + outs.slice(0, 8).join(', ') + (outs.length > 8 ? ' and others' : '') + '.');
    if (ins.length) S.note(Q, 'New faces on the national scene: ' + ins.slice(0, 8).join(', ') + (ins.length > 8 ? ' and others' : '') + '.');
    if (moves.length) S.note(Q, 'Changing parties: ' + moves.join(', ') + '.');
    if (lost.length) S.note(Q, 'Rising stars held back when their party could not win their state: ' + lost.slice(0, 6).join(', ') + '.');
  };

  // every position a figure holds now
  S.positionsOf = function (Q, n) {
    var o = [], O = Q.offices || {};
    if (Q.president && Q.president.name === n) o.push('President');
    if (O.vp && O.vp.name === n) o.push('Vice President');
    if (Q.gov && Q.gov.pm === n) o.push('Prime Minister');
    if (O.speaker && O.speaker.name === n) o.push('Speaker of the House');
    if (O.ppt && O.ppt.name === n) o.push('President pro tempore');
    (Q.cabinet || []).forEach(function (c) { if (c.name === n) o.push('Cabinet: ' + (c.portfolio || c.post || 'minister')); });
    for (var p in (Q.leaders || {})) if (Q.leaders[p] === n) o.push(U.partyInfo(p).short + ' leader');
    for (p in (Q.senLeaders || {})) if (Q.senLeaders[p] === n) o.push(U.partyInfo(p).short + ' Senate leader');
    var f = Q.fig && Q.fig[n];
    if (f && f.status === 'active' && !o.length) o.push({ H: 'Member of the House, ' + f.st, S: 'Senator, ' + f.st, G: 'Governor of ' + stName(f.st), L: 'State legislator, ' + f.st, M: 'Local office, ' + f.st, A: 'Party figure', X: 'Public office' }[f.route]);
    if (f && (f.status === 'lost' || f.status === 'waiting') && f.route !== 'A' && f.route !== 'X') o.push('State legislator, ' + f.st);
    return o;
  };
  S.nextContest = function (Q, n) {
    var f = Q.fig && Q.fig[n]; if (!f || f.status === 'retired') return '';
    var md = function (m) { return U.MONTHS[m % 12].slice(0, 3) + ' ' + Math.floor(m / 12); };
    var gen = Q.electionAt || Q.deadline, st = Q.nextState;
    if (Q.president && Q.president.name === n) return 'Presidency, ' + md(Q.nextPres);
    if (f.status === 'active') {
      if (f.route === 'H') return 'House list, ' + f.st + ' — ' + md(gen);
      if (f.route === 'S') return 'Senate list, ' + f.st + ' — ' + md(gen);
      if (f.route === 'G') return 'Governor, ' + f.st + (st ? ' — ' + md(st) : '');
      return '';
    }
    if (f.route === 'A' || f.route === 'X') return f.status === 'waiting' ? 'Expected on the national scene around ' + f.enter : '';
    return 'Seeking ' + ({ H: 'a House seat', S: 'a Senate seat', G: 'the governorship', L: 'a legislative seat', M: 'local office' }[f.route]) + ' in ' + stName(f.st) + (f.status === 'waiting' ? ' (from about ' + f.enter + ')' : ' again');
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
