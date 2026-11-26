// Election night. Polls close across the time zones; each race then counts
// gradually ("37% in"), showing provisional numbers that settle as the count
// goes on. A race is called once the lead is safe: blowouts early, close
// races late. Called races get a bold outline. Races without a majority go
// to a second night two weeks later; the presidency always goes to a runoff.
(function (G) {
  'use strict';
  var U = G.USA, Ch = U.Charts, N = U.Night = {};
  var P = function (p) { return U.PARTIES[p]; };
  var esc = function (s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); };

  // poll closing times, minutes after 7pm Eastern
  var CLOSE = { NE: 0, MA: 30, SO: 60, MW: 60, PL: 120, TX: 120, MT: 120, PC: 240 };
  var SPECIAL = { GA: 0, VA: 0, IN: 0, KY: 0, SC: 0, VT: 0, FL: 30, OH: 30, NC: 30, WV: 30, AZ: 120, CO: 120, NM: 120, NV: 180, UT: 180, ID: 180, MT: 180, AK: 300, HI: 300, DC: 60 };
  var END1 = 720; // 7pm to 7am Eastern
  var CURVE = 1.3; // the count is quick at first, then slows

  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; }
  function closeOf(sid) { return SPECIAL[sid] != null ? SPECIAL[sid] : CLOSE[(U.STATES[sid] || U.DC).region]; }
  function clock(t) { var m = 19 * 60 + Math.floor(t), h = Math.floor(m / 60) % 24, mm = m % 60; return ((h + 11) % 12 + 1) + ':' + (mm < 10 ? '0' : '') + mm + (h >= 12 && h < 24 ? ' pm' : ' am'); }
  function pctTxt(v) { return (Math.round(v * 10) / 10).toFixed(1) + '%'; }
  function norm(o) { var t = 0, k, r = {}; for (k in o) t += o[k]; for (k in o) r[k] = t ? o[k] / t * 100 : 0; return r; }

  // Counting window and call time. margin: final lead in points (bigger = earlier call)
  function timing(item, margin) {
    var k = item.state + item.label;
    // first returns 10-40 minutes after polls close; the count takes 2.5-6 hours
    item.t0 = closeOf(item.state) + 10 + Math.floor(hash(k + 'o') * 30);
    item.t1 = Math.min(END1 - 5, item.t0 + 150 + Math.floor(hash(k + 'd') * 210));
    var f = N.callFraction(margin);
    item.need = f * 100;
    item.t = f >= 1 ? item.t1 : Math.max(item.t0 + 2, Math.round(item.t0 + (item.t1 - item.t0) * Math.pow(f, CURVE)));
    item.fullCount = f >= 1;
  }
  function lead(dist) { var a = Object.keys(dist).sort(function (x, y) { return dist[y] - dist[x]; }); return a; }

  // When is it safe to call? A race is called at the smallest counted share f
  // for which the leader's final margin m (points) exceeds the remaining doubt:
  //   m > Z * SIGMA * sqrt((1 - f) / f)  +  LATE * (1 - f)
  // The first term is sampling uncertainty (95% confidence): the counted votes
  // are a sample of the total, so it shrinks as the count grows. The second is
  // the risk that the uncounted votes lean differently (late mail ballots, a
  // big city reporting last): it falls to zero as the count finishes.
  // Results: 40 pts -> 20% in; 30 -> 33%; 20 -> 54%; 10 -> 80%; 5 -> 92%;
  // 3 -> 96%; 1 -> 99.4%; 0.5 -> 99.8%; under ~0.2 -> only after the full count.
  var Z = 1.96, SIGMA = 6, LATE = 20;
  N.callFraction = function (m) {
    for (var f = 0.02; f < 0.9995; f += 0.0005) {
      if (m > Z * SIGMA * Math.sqrt((1 - f) / f) + LATE * (1 - f)) return f;
    }
    return 1;
  };

  var st = null;

  N.build = function (Q, elec) {
    var g = elec.general, pr = elec.presidential, items = [];
    function fromTop(t) { var o = {}; (t || []).forEach(function (x) { o[x[0]] = x[1]; }); return o; }
    function raceItems(tab, list, labelOf) {
      list.forEach(function (d) {
        var dist = fromTop(d.t), a = lead(dist), label = labelOf(d);
        var it = { tab: tab, night: 1, state: d.s, label: label, dist: dist, party: d.round === 1 ? d.w : null, runoff: d.round === 2 ? d.f : null };
        var m = d.round === 1 ? dist[a[0]] - (dist[a[1]] || 0) : Math.min((dist[a[1]] || 0) - (dist[a[2]] || 0), 50 - dist[a[0]]);
        timing(it, Math.max(0, m)); items.push(it);
        if (d.round === 2) {
          var it2 = { tab: tab, night: 2, state: d.s, label: label, dist: d.r2, party: d.w, f: d.f };
          timing(it2, Math.abs(d.r2[d.f[0]] - d.r2[d.f[1]])); items.push(it2);
        }
      });
    }
    if (g && g.detail) {
      raceItems('districts', g.detail.districts, function (d) { return d.s + '-' + d.n; });
      raceItems('governors', g.detail.governors, function (d) { return 'Governor: ' + d.s; });
      Object.keys(g.detail.senate || {}).forEach(function (sid) {
        var it = { tab: 'senate', night: 1, state: sid, label: 'Senate: ' + sid, seats: g.detail.senate[sid].seats, dist: g.detail.senate[sid].shares };
        timing(it, 8); items.push(it);
      });
      Object.keys(g.detail.pr).forEach(function (sid) {
        var it = { tab: 'pr', night: 1, state: sid, label: sid + ' list seats', seats: g.detail.pr[sid], dist: (g.byState[sid] || {}).shares || {} };
        timing(it, 8); items.push(it);
      });
    }
    if (pr) {
      var ec = function (night, bs) {
        Object.keys(bs).forEach(function (sid) {
          var dist = norm(bs[sid].votes), a = lead(dist);
          var it = { tab: 'ec', night: night, state: sid, label: (night === 2 ? 'Electors: ' : 'President, round one: ') + sid, dist: dist, ev: bs[sid].ev, pop: (U.STATES[sid] || U.DC).pop };
          timing(it, dist[a[0]] - (dist[a[1]] || 0)); items.push(it);
        });
      };
      ec(1, pr.byState); if (pr.byState2) ec(2, pr.byState2);
    }
    var tabs = [];
    if (g && g.detail) { if (g.detail.districts.length) tabs.push(['districts', 'House districts']); tabs.push(['pr', g.detail.districts.length ? 'House list seats' : 'House'], ['senate', 'Senate'], ['governors', 'Governors']); }
    if (pr) tabs.push(['ec', 'President']);
    return { items: items, tabs: tabs, tab: pr && !g ? 'ec' : tabs[0][0], night: 1, t: 0, speed: 6, playing: true, hasNight2: items.some(function (i) { return i.night === 2; }) };
  };

  function cands(elec) { var m = {}; (elec.presidential ? elec.presidential.cands : []).forEach(function (c) { m[c.id] = c; }); return m; }
  function colorKey(elec, k) { var c = cands(elec)[k]; return c ? c.party : k; }

  // ---- state of the count ----
  function pctIn(i) {
    if (i.night < st.night) return 100;
    if (i.night > st.night || st.t <= i.t0) return 0;
    return Math.min(100, 100 * Math.pow(Math.min(1, (st.t - i.t0) / (i.t1 - i.t0)), 1 / CURVE));
  }
  function called(i) { return i.night < st.night || (i.night === st.night && st.t >= i.t); }
  // provisional numbers: early returns are skewed; they converge as the count goes on
  function provisional(i) {
    var p = pctIn(i), k = (1 - p / 100) * 0.45, o = {};
    for (var x in i.dist) o[x] = Math.max(0.01, i.dist[x] * (1 + (hash(i.label + x) - 0.5) * 2 * k));
    return norm(o);
  }
  // the item that matters for a race right now (night 2 once it has begun)
  function current(tab, match) {
    var l = st.items.filter(function (i) { return i.tab === tab && match(i); });
    var i2 = l.filter(function (i) { return i.night === 2; })[0], i1 = l.filter(function (i) { return i.night === 1; })[0];
    if (tab === 'ec') return st.night === 2 && i2 ? i2 : i1;
    return st.night === 2 && i2 ? i2 : i1;
  }
  // status for the map: {fill, called}
  function status(elec, i) {
    if (!i) return { fill: '#d6d2c8', none: true };
    var p = pctIn(i);
    if (called(i)) {
      if (i.tab === 'ec') { var w = i.night === 1 ? lead(i.dist)[0] : Object.keys(i.ev).filter(function (c) { return i.ev[c]; })[0]; return { fill: P(colorKey(elec, w)).color, called: true }; }
      if (i.seats) { var tp = lead(i.seats)[0]; return { fill: P(tp).color, called: true }; }
      if (i.night === 1 && i.runoff) return { runoff: i.runoff, called: true };
      return { fill: P(i.party).color, called: true };
    }
    if (p <= 0) return { fill: '#9aa0a6' };
    return { fill: P(colorKey(elec, lead(provisional(i))[0])).color, faint: true };
  }

  function snapshot(elec) {
    var tab = st.tab, tally = {}, done = 0, total = 0, pend = 0, inSum = 0, inN = 0;
    st.items.forEach(function (i) {
      if (i.tab !== tab) return;
      if (tab === 'ec') {
        var nt = st.night === 2 && elec.presidential.byState2 ? 2 : 1; if (i.night !== nt) return;
        inSum += pctIn(i); inN++;
        if (nt === 1) {
          var pin = pctIn(i), pv = provisional(i); total++; if (called(i)) done++;
          for (var c0 in pv) tally[c0] = (tally[c0] || 0) + pv[c0] * i.pop * pin / 100;
          return;
        }
        total += U.sum(i.ev);
        if (called(i)) { done += U.sum(i.ev); for (var c in i.ev) if (i.ev[c]) tally[c] = (tally[c] || 0) + i.ev[c]; }
        return;
      }
      if (i.seats) { total += U.sum(i.seats); inSum += pctIn(i); inN++; if (called(i)) { done += U.sum(i.seats); for (var p in i.seats) if (i.seats[p]) tally[p] = (tally[p] || 0) + i.seats[p]; } return; }
      if (i.night === 1) { total++; if (st.night === 1) { inSum += pctIn(i); inN++; } }
      if (i.night === 2 && st.night === 2) { inSum += pctIn(i); inN++; }
      if (i.night === 1 && i.runoff) { if (called(i)) pend++; return; }
      if (!called(i)) return;
      if (i.night === 2) pend--;
      done++; tally[i.party] = (tally[i.party] || 0) + 1;
    });
    var popular = tab === 'ec' && !(st.night === 2 && elec.presidential.byState2);
    if (popular) { var tt = U.sum(tally); for (var k in tally) tally[k] = tt ? Math.round(tally[k] / tt * 1000) / 10 : 0; }
    return { tally: tally, done: done, total: total, pending: Math.max(0, pend), pctIn: inN ? inSum / inN : 0, popular: popular };
  }

  function feed(elec) {
    var cm = cands(elec), out = [];
    st.items.forEach(function (i) {
      if (i.night !== st.night || i.t > st.t || i.t < st.t - 45 || i.seats) return;
      var txt;
      if (i.tab === 'ec' && i.night === 1) { var w1 = lead(i.dist)[0]; txt = esc(i.label) + ': <b style="color:' + P(colorKey(elec, w1)).color + '">' + esc(cm[w1] ? cm[w1].name : w1) + '</b> wins the state\u2019s popular vote'; }
      else if (i.tab === 'ec') { var w = Object.keys(i.ev).filter(function (c) { return i.ev[c]; })[0]; txt = esc(i.label) + ': <b style="color:' + P(colorKey(elec, w)).color + '">' + esc(cm[w] ? cm[w].name : w) + '</b> takes all ' + i.ev[w] + ' electors'; }
      else if (i.night === 1 && i.runoff) txt = esc(i.label) + ': no majority. Runoff between ' + P(i.runoff[0]).short + ' and ' + P(i.runoff[1]).short + '.';
      else txt = esc(i.label) + ': <b style="color:' + P(i.party).color + '">' + P(i.party).short + '</b> ' + (i.night === 2 ? 'wins the runoff' : 'wins outright') + '.';
      out.push([i.t, txt]);
    });
    // poll closings
    var closes = {}; st.items.forEach(function (i) { if (i.night === st.night) { var c = closeOf(i.state); (closes[c] = closes[c] || {})[i.state] = 1; } });
    Object.keys(closes).forEach(function (c) { c = +c; if (c <= st.t && c > st.t - 45) out.push([c, '<b>Polls close</b> in ' + Object.keys(closes[c]).sort().join(', ') + '.']); });
    return out.sort(function (a, b) { return b[0] - a[0]; }).slice(0, 9).map(function (x) { return '<div class="small"><span class="muted">' + clock(x[0]) + '</span> ' + x[1] + '</div>'; }).join('');
  }

  N.html = function (Q, elec) {
    if (!st || st.elec !== elec) { st = N.build(Q, elec); st.elec = elec; }
    return '<div class="date">Election night</div><h1 id="nt-title"></h1>' +
      '<div class="row nightbar"><button class="btn" data-nt="play"></button><button class="btn ghost" data-nt="skip">Skip to the end of the night</button>' +
      '<label class="small">Speed <input type="range" min="1" max="60" value="' + st.speed + '" data-nt="speed"> <span id="nt-speed"></span></label><b id="nt-clock" class="clock"></b></div>' +
      '<div class="row" style="margin:10px 0">' + st.tabs.map(function (t) { return '<button class="btn ' + (st.tab === t[0] ? '' : 'ghost') + '" data-nttab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' +
      '<div class="nightgrid"><div><div id="nt-map">' + Ch.geoMap(Q, function () { return '#9aa0a6'; }, function () { return ''; }) + '</div><div id="nt-dmap" style="display:none">' + Ch.districtMap(Q, function () { return '#9aa0a6'; }) + '</div>' +
      '<p class="small muted">Grey: polls still open or no votes counted. Pale: counting, shaded by the current leader. Solid with a bold outline: called. Stripes: going to a runoff between those two parties.</p></div>' +
      '<div><div id="nt-progress" class="small"></div><div id="nt-tally"></div><h3>Latest</h3><div id="nt-feed"></div></div></div>' +
      '<div class="endbar" id="nt-end"></div>';
  };

  function paint(el, s, svg) {
    var fill = s.runoff ? 'url(#' + stripes(svg, s.runoff[0], s.runoff[1]) + ')' : s.fill;
    el.querySelectorAll ? null : null;
    var targets = el.tagName === 'path' ? [el] : Array.prototype.slice.call(el.querySelectorAll('path, rect'));
    targets.forEach(function (t) {
      if (t.getAttribute('fill') !== fill) t.setAttribute('fill', fill);
      t.style.fillOpacity = s.faint ? 0.45 : 1;
      t.classList.toggle('called', !!s.called);
    });
    if (s.called && el.tagName === 'g' && !el.__front) { el.__front = true; el.parentNode.appendChild(el); }
  }

  N.update = function (Q, elec) {
    if (!st || !document.getElementById('nt-map')) return;
    var snap = snapshot(elec), cm = cands(elec), pres = elec.presidential, dist = st.tab === 'districts';
    document.getElementById('nt-title').textContent = st.night === 1 ? (elec.general ? 'General election' : 'Presidential election, first round') + ', ' + (elec.general || pres).date : 'Runoff night, two weeks later';
    document.getElementById('nt-clock').textContent = clock(Math.min(st.t, END1));
    document.getElementById('nt-speed').textContent = st.speed + ' min/s';
    document.querySelector('[data-nt=play]').textContent = st.playing ? 'Pause' : 'Play';
    document.getElementById('nt-map').style.display = dist ? 'none' : '';
    document.getElementById('nt-dmap').style.display = dist ? '' : 'none';
    if (dist) {
      var dsvg = document.querySelector('#nt-dmap svg');
      document.querySelectorAll('#nt-dmap path.dist').forEach(function (el) { paint(el, status(elec, current('districts', function (i) { return i.label === el.dataset.d; })), dsvg); });
    } else {
      var svg = document.querySelector('#nt-map svg');
      if (svg && !svg.querySelector('defs')) svg.insertAdjacentHTML('afterbegin', '<defs></defs>');
      document.querySelectorAll('#nt-map .tile').forEach(function (g) { paint(g, status(elec, current(st.tab, function (i) { return i.state === g.dataset.state; })), svg); });
    }
    var unit = st.tab === 'ec' ? (snap.popular ? 'states' : 'electors') : st.tab === 'governors' ? 'governorships' : 'seats';
    var prog = '<b>' + Math.round(snap.pctIn) + '% of the expected vote in</b> · ' + snap.done + ' of ' + snap.total + ' ' + unit + ' called';
    if (snap.pending && st.night === 1) prog += ' · ' + snap.pending + ' going to a runoff';
    if (st.tab === 'ec') prog += snap.popular ? ' \u00b7 round one is a national popular vote: the top two go to the Electoral College runoff' : ' \u00b7 Electoral College runoff: a state\u2019s winner takes all its electors; ' + pres.need + ' for a majority';
    document.getElementById('nt-progress').innerHTML = prog + '<div class="bar"><i style="width:' + snap.pctIn + '%"></i></div>';
    var keys = Object.keys(snap.tally).sort(function (a, b) { return snap.tally[b] - snap.tally[a]; });
    document.getElementById('nt-tally').innerHTML = '<table class="seats"><tr><th>' + (st.tab === 'ec' ? 'Candidate' : 'Party') + '</th><th>' + (st.tab === 'ec' ? (snap.popular ? 'Vote so far' : 'Electors') : st.tab === 'governors' ? 'Won' : 'Seats') + '</th></tr>' + keys.map(function (k) {
      var party = colorKey(elec, k), name = st.tab === 'ec' ? cm[k].name : P(k).name;
      return '<tr><td><i class="chip" style="background:' + P(party).color + '"></i>' + esc(name) + '</td><td><b>' + snap.tally[k] + (snap.popular ? '%' : '') + '</b></td></tr>';
    }).join('') + '</table>';
    document.getElementById('nt-feed').innerHTML = feed(elec) || '<div class="small muted">' + (st.t < 1 ? 'Polls close at 7pm Eastern.' : 'Waiting for results…') + '</div>';
    var end = document.getElementById('nt-end'), finished = st.t >= END1, html;
    if (finished && st.night === 1 && st.hasNight2) html = '<button class="btn" data-nt="night2">Go to the runoffs</button><span class="small muted">Races without a majority are decided two weeks later' + (pres ? ', including the presidential runoff between the top two' : '') + '.</span>';
    else if (finished) html = '<button class="btn" data-nt="final">See the full results</button>';
    else html = '<button class="btn ghost" data-nt="final">Skip to the full results</button>';
    if (end.dataset.h !== html) { end.innerHTML = html; end.dataset.h = html; bindEnd(); }
    if (U.Zoom.refresh) U.Zoom.refresh();
  };

  // ---- hover cards ----
  function row(k, v, elec) { var party = colorKey(elec, k), c = cands(elec)[k]; return '<div class="kv"><span><i class="chip" style="background:' + P(party).color + '"></i>' + esc(c ? c.name : P(k).short) + '</span><b>' + v + '</b></div>'; }
  function raceCard(elec, title, i) {
    var h = '<b>' + esc(title) + '</b><br>';
    if (!i) return h + '<span class="muted">No race this time.</span>';
    var p = pctIn(i);
    if (p <= 0) return h + '<span class="muted">' + (st.t < closeOf(i.state) ? 'Polls close at ' + clock(closeOf(i.state)) + '.' : 'No votes counted yet.') + '</span>';
    var shares = called(i) && p >= 99.9 ? i.dist : provisional(i), order = lead(shares).slice(0, 5);
    if (called(i)) {
      if (i.tab === 'ec' && i.night === 1) h += 'Called: <b>' + esc(cands(elec)[lead(i.dist)[0]].name) + '</b> wins the state (round one counts national votes only)<br>';
      else if (i.tab === 'ec') { var w = Object.keys(i.ev).filter(function (c) { return i.ev[c]; })[0]; h += 'Called: <b>' + esc(cands(elec)[w].name) + '</b> takes all ' + i.ev[w] + ' electors<br>'; }
      else if (i.seats) h += 'Called: ' + lead(i.seats).filter(function (x) { return i.seats[x]; }).map(function (x) { return P(x).short + ' ' + i.seats[x]; }).join(', ') + '<br>';
      else if (i.night === 1 && i.runoff) h += 'Called: runoff between <b>' + P(i.runoff[0]).short + '</b> and <b>' + P(i.runoff[1]).short + '</b><br>';
      else h += 'Called: <b style="color:' + P(i.party).color + '">' + esc(P(i.party).name) + '</b> ' + (i.night === 2 ? 'wins the runoff' : 'wins outright') + (i.fullCount ? ' (after the full count)' : '') + '<br>';
    } else h += '<span class="muted">' + (p > 90 ? 'Too close to call' : 'Too early to call') + '</span><br>';
    h += '<span class="muted">' + Math.round(p) + '% in</span>';
    return h + order.map(function (k) { return row(k, pctTxt(shares[k]), elec); }).join('');
  }
  N.attachHover = function (elec) {
    U.Zoom.attach(document.getElementById('nt-map'), 'night-states', function (t) {
      var sid = t.dataset.state; if (!sid) return null;
      var name = (U.STATES[sid] || U.DC).name, tab = st.tab;
      var title = name + (tab === 'ec' ? (st.night === 2 ? ': presidential runoff (' + (U.Elections.apportion().electors[sid] || '') + ' electors)' : ': president, round one') : tab === 'senate' ? ': U.S. Senate (3 seats by PR)' : tab === 'governors' ? ': Governor' : ': list seats');
      return raceCard(elec, title, current(tab, function (i) { return i.state === sid; }));
    });
    U.Zoom.attach(document.getElementById('nt-dmap'), 'night-districts', function (t) {
      var k = t.dataset.d || (t.dataset.state + '-1'), parts = k.split('-'), name = (U.STATES[parts[0]] || U.DC).name;
      return raceCard(elec, name + ' ' + (U.DISTRICTS[parts[0]] && U.DISTRICTS[parts[0]].cells.length > 1 ? 'district ' + parts[1] : 'at-large'), current('districts', function (i) { return i.label === k; }));
    });
  };

  // diagonal stripes in the two runoff finalists' colours
  function stripes(svg, a, b) {
    var id = (svg.closest('#nt-dmap') ? 'dro' : 'ro') + '-' + a + '-' + b;
    if (!svg.querySelector('#' + id)) svg.querySelector('defs').insertAdjacentHTML('beforeend',
      '<pattern id="' + id + '" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="12" fill="' + P(a).color + '"/><rect x="6" width="6" height="12" fill="' + P(b).color + '"/></pattern>');
    return id;
  }

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
    N.attachHover(elec);
    hooks.update();
  };
  N.stop = function () { if (timer) clearInterval(timer); timer = null; };
  N.reset = function () { N.stop(); st = null; };
  N.speed = function (v) { if (st) st.speed = v; };
  N.done = function () { return !!st && st.t >= END1; };
})(typeof globalThis !== 'undefined' ? globalThis : window);
