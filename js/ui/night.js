// Election night: results come in state by state as polls close across the
// time zones. Night one decides outright winners and list seats; races that
// need a runoff are declared on a second night two weeks later.
(function (G) {
  'use strict';
  var U = G.USA, Ch = U.Charts, N = U.Night = {};
  var P = function (p) { return U.PARTIES[p]; };
  var esc = function (s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); };

  // Poll closing times, minutes after 7pm Eastern
  var CLOSE = { NE: 0, MA: 30, SO: 60, MW: 60, PL: 120, TX: 120, MT: 120, PC: 240 };
  var SPECIAL = { GA: 0, VA: 0, IN: 0, KY: 0, SC: 0, VT: 0, FL: 30, OH: 30, NC: 30, WV: 30, AZ: 120, CO: 120, NM: 120, NV: 180, UT: 180, ID: 180, MT: 180, AK: 300, HI: 300, DC: 60 };
  var END1 = 600; // the night runs from 7pm to 5am Eastern

  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; }
  function closeOf(sid) { return SPECIAL[sid] != null ? SPECIAL[sid] : CLOSE[(U.STATES[sid] || U.DC).region]; }
  // when an item in a state is called: after polls close, spread over ~3 hours
  function callTime(sid, key) { var c = closeOf(sid); return Math.min(END1 - 5, c + 10 + Math.floor(hash(sid + key) * 170 + hash(sid) * 60)); }
  function clock(t) { var m = 19 * 60 + Math.floor(t), h = Math.floor(m / 60) % 24, mm = m % 60; return ((h + 11) % 12 + 1) + ':' + (mm < 10 ? '0' : '') + mm + (h >= 12 && h < 24 ? ' pm' : ' am'); }

  var st = null;

  // Build the timeline of calls from the election results.
  N.build = function (Q, elec) {
    var g = elec.general, pr = elec.presidential, items = [];
    if (g && g.detail) {
      g.detail.districts.forEach(function (d) {
        var t = callTime(d.s, 'd' + d.n);
        items.push({ tab: 'districts', night: 1, t: t, state: d.s, party: d.round === 1 ? d.w : null, runoff: d.round === 2 ? d.f : null, label: d.s + '-' + d.n, top: d.top });
        if (d.round === 2) items.push({ tab: 'districts', night: 2, t: callTime(d.s, 'r' + d.n), state: d.s, party: d.w, label: d.s + '-' + d.n, r2: d.r2, f: d.f });
      });
      Object.keys(g.detail.pr).forEach(function (sid) {
        var t = callTime(sid, 'pr') + 20, seats = g.detail.pr[sid];
        items.push({ tab: 'pr', night: 1, t: Math.min(END1 - 5, t), state: sid, seats: seats, label: sid + ' list seats' });
      });
      g.detail.senate.forEach(function (r) {
        items.push({ tab: 'senate', night: 1, t: callTime(r.s, 'sen'), state: r.s, party: r.round === 1 ? r.w : null, runoff: r.round === 2 ? r.f : null, label: 'Senate: ' + r.s, top: r.top });
        if (r.round === 2) items.push({ tab: 'senate', night: 2, t: callTime(r.s, 'sen2'), state: r.s, party: r.w, label: 'Senate: ' + r.s, f: r.f, r2: r.r2 });
      });
      g.detail.governors.forEach(function (r) {
        items.push({ tab: 'governors', night: 1, t: callTime(r.s, 'gov'), state: r.s, party: r.round === 1 ? r.w : null, runoff: r.round === 2 ? r.f : null, label: 'Governor: ' + r.s, top: r.top });
        if (r.round === 2) items.push({ tab: 'governors', night: 2, t: callTime(r.s, 'gov2'), state: r.s, party: r.w, label: 'Governor: ' + r.s, f: r.f, r2: r.r2 });
      });
    }
    if (pr) {
      Object.keys(pr.byState).forEach(function (sid) { items.push({ tab: 'ec', night: 1, t: callTime(sid, 'ec'), state: sid, ev: pr.byState[sid].ev, votes: pr.byState[sid].votes, label: 'Electors: ' + sid }); });
      if (pr.byState2) Object.keys(pr.byState2).forEach(function (sid) { items.push({ tab: 'ec', night: 2, t: callTime(sid, 'ec2'), state: sid, ev: pr.byState2[sid].ev, votes: pr.byState2[sid].votes, label: 'Electors (runoff): ' + sid }); });
    }
    var tabs = [];
    if (g && g.detail) tabs.push(['districts', 'House districts'], ['pr', 'House list seats'], ['senate', 'Senate (direct)'], ['governors', 'Governors']);
    if (pr) tabs.push(['ec', 'Electoral College']);
    var hasNight2 = items.some(function (i) { return i.night === 2; });
    return { items: items, tabs: tabs, tab: tabs[0][0], night: 1, t: 0, speed: 6, playing: true, hasNight2: hasNight2, feed: [] };
  };

  function cands(elec) { var m = {}; (elec.presidential ? elec.presidential.cands : []).forEach(function (c) { m[c.id] = c; }); return m; }

  // Tallies and per-state map colours for the current tab at time t.
  function snapshot(elec) {
    var night = st.night, t = st.t, tab = st.tab, tally = {}, byState = {}, pending = 0, called = 0, total = 0, cm = cands(elec);
    function done(i) { return i.night < night || (i.night === night && i.t <= t); }
    st.items.forEach(function (i) {
      if (i.tab !== tab) return;
      if (tab === 'ec') {
        if (i.night !== (night === 2 && elec.presidential.byState2 ? 2 : 1)) return;
        total += U.sum(i.ev);
        if (!done(i)) return;
        called += U.sum(i.ev);
        for (var c in i.ev) if (i.ev[c]) tally[c] = (tally[c] || 0) + i.ev[c];
        var best = Object.keys(i.votes).sort(function (a, b) { return i.votes[b] - i.votes[a]; })[0];
        byState[i.state] = cm[best] ? cm[best].party : best;
        return;
      }
      if (tab === 'pr') { total += U.sum(i.seats); if (!done(i)) return; called += U.sum(i.seats); for (var p in i.seats) if (i.seats[p]) tally[p] = (tally[p] || 0) + i.seats[p];
        var top = Object.keys(i.seats).sort(function (a, b) { return i.seats[b] - i.seats[a]; })[0]; byState[i.state] = top; return; }
      if (i.night === 1) total++;
      // a race is decided by its night-2 item if it had a runoff
      if (i.night === 1 && i.runoff) { if (done(i)) { pending++; byState[i.state] = byState[i.state] || { runoff: true }; } return; }
      if (!done(i)) return;
      if (i.night === 2) pending--;
      called++; tally[i.party] = (tally[i.party] || 0) + 1;
      var s = byState[i.state]; if (!s || s.runoff) s = byState[i.state] = { c: {} }; s.c[i.party] = (s.c[i.party] || 0) + 1;
    });
    if (tab === 'districts' || tab === 'senate' || tab === 'governors') {
      for (var sid in byState) { var b = byState[sid]; byState[sid] = b.runoff ? 'runoff' : Object.keys(b.c).sort(function (a, c) { return b.c[c] - b.c[a]; })[0]; }
    }
    return { tally: tally, byState: byState, pending: Math.max(0, pending), called: called, total: total };
  }

  function feed(elec) {
    var cm = cands(elec);
    return st.items.filter(function (i) { return i.night === st.night && i.t <= st.t && i.t > st.t - 40 && i.tab !== 'pr'; })
      .sort(function (a, b) { return b.t - a.t; }).slice(0, 8).map(function (i) {
        var txt;
        if (i.tab === 'ec') { var w = Object.keys(i.ev).filter(function (c) { return i.ev[c]; }).map(function (c) { return (cm[c] ? cm[c].name : c) + ' ' + i.ev[c]; }).join(', '); txt = esc(i.label) + ': ' + w; }
        else if (i.runoff) txt = esc(i.label) + ': no majority. Runoff between ' + P(i.runoff[0]).short + ' and ' + P(i.runoff[1]).short + '.';
        else txt = esc(i.label) + ': <b style="color:' + P(i.party).color + '">' + P(i.party).short + '</b> ' + (i.night === 2 ? 'wins the runoff' : 'wins outright') + '.';
        return '<div class="small"><span class="muted">' + clock(i.t) + '</span> ' + txt + '</div>';
      }).join('');
  }

  N.html = function (Q, elec) {
    if (!st || st.elec !== elec) { st = N.build(Q, elec); st.elec = elec; }
    return '<div class="date">Election night</div><h1 id="nt-title"></h1>' +
      '<div class="row nightbar"><button class="btn" data-nt="play"></button><button class="btn ghost" data-nt="skip">Skip to the end of the night</button>' +
      '<label class="small">Speed <input type="range" min="1" max="60" value="' + st.speed + '" data-nt="speed"> <span id="nt-speed"></span></label><b id="nt-clock" class="clock"></b></div>' +
      '<div class="row" style="margin:10px 0">' + st.tabs.map(function (t) { return '<button class="btn ' + (st.tab === t[0] ? '' : 'ghost') + '" data-nttab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' +
      '<div class="nightgrid"><div id="nt-map">' + Ch.geoMap(Q, function () { return '#9aa0a6'; }, function () { return ''; }) + '</div><div><div id="nt-progress" class="small"></div><div id="nt-tally"></div><h3>Latest</h3><div id="nt-feed"></div></div></div>' +
      '<div class="endbar" id="nt-end"></div>';
  };

  N.update = function (Q, elec) {
    if (!st || !document.getElementById('nt-map')) return;
    var snap = snapshot(elec), cm = cands(elec);
    var pres = elec.presidential;
    document.getElementById('nt-title').textContent = st.night === 1 ? (elec.general ? 'General election' : 'Presidential election') + ', ' + (elec.general || pres).date : 'Runoff night, two weeks later';
    document.getElementById('nt-clock').textContent = clock(Math.min(st.t, END1));
    document.getElementById('nt-speed').textContent = st.speed + ' min/s';
    document.querySelector('[data-nt=play]').textContent = st.playing ? 'Pause' : 'Play';
    document.querySelectorAll('#nt-map .tile').forEach(function (g) {
      var sid = g.dataset.state, v = snap.byState[sid], fill = '#9aa0a6';
      if (v === 'runoff') fill = 'url(#hatch)'; else if (v && U.PARTIES[v]) fill = U.PARTIES[v].color;
      g.querySelectorAll('path, rect').forEach(function (el) { el.setAttribute('fill', fill); });
    });
    var svg = document.querySelector('#nt-map svg');
    if (svg && !svg.querySelector('#hatch')) svg.insertAdjacentHTML('afterbegin', '<defs><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#c9c4b8"/><line x1="0" y1="0" x2="0" y2="8" stroke="#6b6b6b" stroke-width="3"/></pattern></defs>');
    var unit = st.tab === 'ec' ? 'electors' : 'seats';
    var prog = snap.called + ' of ' + snap.total + ' ' + (st.tab === 'governors' ? 'governorships' : unit) + ' declared';
    if (snap.pending && st.night === 1) prog += ' · <b>' + snap.pending + ' going to a runoff</b>';
    if (st.tab === 'ec') prog += ' · ' + pres.need + ' needed to win';
    document.getElementById('nt-progress').innerHTML = prog + '<div class="bar"><i style="width:' + (snap.total ? snap.called / snap.total * 100 : 0) + '%"></i></div>';
    var keys = Object.keys(snap.tally).sort(function (a, b) { return snap.tally[b] - snap.tally[a]; });
    document.getElementById('nt-tally').innerHTML = '<table class="seats"><tr><th>' + (st.tab === 'ec' ? 'Candidate' : 'Party') + '</th><th>' + (st.tab === 'ec' ? 'Electors' : st.tab === 'governors' ? 'Won' : 'Seats') + '</th></tr>' + keys.map(function (k) {
      var party = st.tab === 'ec' ? cm[k].party : k, name = st.tab === 'ec' ? cm[k].name : P(k).name;
      return '<tr><td><i class="chip" style="background:' + P(party).color + '"></i>' + esc(name) + '</td><td><b>' + snap.tally[k] + '</b></td></tr>';
    }).join('') + '</table>';
    document.getElementById('nt-feed').innerHTML = feed(elec) || '<div class="small muted">' + (st.t < 1 ? 'Polls close at 7pm Eastern.' : 'Waiting for results…') + '</div>';
    var end = document.getElementById('nt-end'), finished = st.t >= END1;
    var html = '';
    if (finished && st.night === 1 && st.hasNight2) html = '<button class="btn" data-nt="night2">Go to the runoffs</button><span class="small muted">Races without a majority are decided two weeks later' + (pres && pres.round === 2 ? ', including the presidential second round' : '') + '.</span>';
    else if (finished) html = '<button class="btn" data-nt="final">See the full results</button>';
    else html = '<button class="btn ghost" data-nt="final">Skip to the full results</button>';
    if (end.dataset.h !== html) { end.innerHTML = html; end.dataset.h = html; bindEnd(); }
  };

  var timer = null, hooks = {};
  function bindEnd() {
    document.querySelectorAll('#nt-end [data-nt]').forEach(function (b) { b.onclick = function () {
      if (b.dataset.nt === 'night2') { st.night = 2; st.t = 0; st.playing = true; hooks.update(); }
      if (b.dataset.nt === 'final') { N.stop(); hooks.final(); }
    }; });
  }
  N.start = function (Q, elec, onFinal) {
    hooks.final = onFinal; hooks.update = function () { N.update(Q, elec); };
    document.querySelectorAll('[data-nttab]').forEach(function (b) { b.onclick = function () { st.tab = b.dataset.nttab; document.querySelectorAll('[data-nttab]').forEach(function (x) { x.classList.toggle('ghost', x !== b); }); hooks.update(); }; });
    var sp = document.querySelector('[data-nt=speed]'); sp.oninput = function () { st.speed = +sp.value; hooks.update(); };
    document.querySelector('[data-nt=play]').onclick = function () { st.playing = !st.playing; hooks.update(); };
    document.querySelector('[data-nt=skip]').onclick = function () { st.t = END1; hooks.update(); };
    N.stop();
    var last = Date.now();
    timer = setInterval(function () {
      var now = Date.now(), dt = (now - last) / 1000; last = now;
      if (!document.getElementById('nt-map')) { N.stop(); return; }
      if (st.playing && st.t < END1) { st.t = Math.min(END1, st.t + dt * st.speed); hooks.update(); }
    }, 250);
    hooks.update();
  };
  N.stop = function () { if (timer) clearInterval(timer); timer = null; };
  N.reset = function () { N.stop(); st = null; };
})(typeof globalThis !== 'undefined' ? globalThis : window);
