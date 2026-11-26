// The roll call: a vote counted state by state, like election night.
// Stages: the House, then the Senate if it has a say, then any override.
(function (G) {
  'use strict';
  var U = G.USA, R = U.Roll = {};
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var NAMES = function (sid) { return (U.STATES[sid] || U.DC).name; };

  // spread each party's yes / abstain / no votes over the states where it holds seats
  function byState(count, seatsByState) {
    var pool = {};
    (count.by || []).forEach(function (b) { if (!b.n) return; var v = b.vote === 'abstain/no' ? 'abstain' : b.vote; var o = pool[b.party] = pool[b.party] || { yes: 0, abstain: 0, no: 0 }; o[v] += b.n; });
    var states = Object.keys(seatsByState).sort(function (a, b) { return NAMES(a) < NAMES(b) ? -1 : 1; }), out = [];
    states.forEach(function (sid) {
      var row = { sid: sid, yes: 0, abstain: 0, no: 0, parties: [] }, d = seatsByState[sid];
      for (var p in d) { var k = d[p], o = pool[p]; if (!k || !o) continue;
        var take = { yes: 0, abstain: 0, no: 0 };
        ['yes', 'abstain', 'no'].forEach(function (v) { var x = Math.min(k, o[v]); take[v] = x; o[v] -= x; k -= x; });
        row.yes += take.yes; row.abstain += take.abstain; row.no += take.no; row.parties.push({ p: p, t: take });
      }
      if (row.yes + row.abstain + row.no) out.push(row);
    });
    // anything left over (rounding) goes on the last line
    var rest = { yes: 0, abstain: 0, no: 0 }; for (var p in pool) for (var v in rest) rest[v] += pool[p][v];
    if (rest.yes + rest.abstain + rest.no) out.push({ sid: 'other', yes: rest.yes, abstain: rest.abstain, no: rest.no, parties: [] });
    return out;
  }
  function senateByState(Q) { var o = {}; (Q.senateSeats || []).forEach(function (x) { if (!x.party) return; var d = o[x.state] = o[x.state] || {}; d[x.party] = (d[x.party] || 0) + 1; }); return o; }

  // how each party voted: one row per party (alliance members and split delegations included)
  R.rows = function (count) {
    var rows = {}, order = [];
    (count.by || []).forEach(function (b) {
      if (!b.n) return;
      var name = String(b.label).replace(/ \((aye|nay|abstaining)\)$/, '').replace(/ rebels$/, ''), key = name + '|' + b.party;
      if (!rows[key]) { rows[key] = { name: name, party: b.party, yes: 0, no: 0, abstain: 0 }; order.push(key); }
      rows[key][b.vote === 'abstain/no' ? 'abstain' : b.vote] += b.n;
    });
    return order.map(function (k) { return rows[k]; }).sort(function (a, b) { return (b.yes + b.no + b.abstain) - (a.yes + a.no + a.abstain); });
  };
  R.breakdown = function (count) {
    var rows = R.rows(count); if (!rows.length) return '';
    return '<details class="small" style="margin-top:6px" open><summary>How each party voted</summary><table class="seats" style="width:100%"><tr><th>Party</th><th>Yes</th><th>No</th><th>Abstain</th></tr>' +
      rows.map(function (r) { var P = U.partyInfo(r.party); return '<tr><td><i class="chip" style="background:' + P.color + '"></i>' + esc(r.name.length <= 6 ? P.name : r.name) + '</td><td class="up">' + (r.yes || '') + '</td><td class="down">' + (r.no || '') + '</td><td>' + (r.abstain || '') + '</td></tr>'; }).join('') + '</table></details>';
  };
  R.build = function (Q, lv) {
    var st = [], kind = lv.kind || 'bill', total = U.RULES.house.total;
    var houseNeed = lv.need === 'absolute' ? { text: 'Needs an absolute majority: ' + U.majority() + ' yes votes', ok: function (c) { return U.absolute(c); } } : { text: 'Needs more yes votes than no votes', ok: function (c) { return U.simple(c); } };
    st.push({ label: 'House of Representatives', total: total, rows: byState(lv.house, Q.houseByState || {}), need: houseNeed, count: lv.house });
    if (lv.senate && kind !== 'budget' && kind !== 'investiture') {
      var sTot = U.sum(U.Elections.senateCount(Q)) || 250, two = Math.ceil(sTot * 2 / 3);
      st.push({ label: 'Senate', total: sTot, rows: byState(lv.senate, senateByState(Q)), count: lv.senate,
        need: { text: 'A simple majority passes it; two-thirds against (' + two + ') would veto it', ok: function (c) { return c.yes > c.no; } } });
    }
    var outcome = '';
    if (lv.proc === 'senateVeto') outcome = 'The Senate vetoes the bill with a two-thirds majority.';
    else if (lv.proc === 'delayed') outcome = 'The Senate votes it down: the bill is delayed by up to two years, then becomes law.';
    else if (lv.proc === 'presVeto') { outcome = 'The President vetoes the bill. Back to the House: an override needs two-thirds (' + Math.ceil(total * 2 / 3) + ') and a Senate majority.';
      st.push({ label: 'House: veto override', total: total, rows: byState(lv.house, Q.houseByState || {}), count: lv.house, need: { text: 'Needs two-thirds: ' + Math.ceil(total * 2 / 3) + ' yes votes', ok: function (c) { return c.yes >= Math.ceil(total * 2 / 3); } } }); }
    else if (lv.proc === 'law') outcome = 'The bill becomes law.';
    else if (lv.proc === 'defeated') outcome = 'The House rejects the bill.';
    else if (lv.kind === 'investiture') { var ok = lv.passed != null ? lv.passed : (lv.need === 'absolute' ? U.absolute(lv.house) : U.simple(lv.house)); outcome = ok ? 'The House confirms the new Prime Minister and cabinet.' : 'The nominee fails to win the House\u2019s confidence.'; }
    else if (lv.kind === 'budget') outcome = U.simple(lv.house) ? 'The budget passes.' : 'The budget is defeated.';
    return { title: lv.title, stages: st, outcome: outcome };
  };

  // ---- view and animation ----
  var S = null, timer = null;
  R.reset = function (Q, lv) { R.stop(); S = R.build(Q, lv); S.si = 0; S.i = 0; S.speed = S.speed || 4; S.done = false; S.pause = 0; };
  R.done = function () { return !S || S.done; };
  R.stop = function () { if (timer) clearInterval(timer); timer = null; };
  R.html = function () {
    if (!S) return '<p>No vote to show.</p>';
    var h = '<div class="date">Roll call</div><h1>' + esc(S.title) + '</h1>';
    S.stages.forEach(function (stg, k) {
      if (k > S.si) return;
      var n = k < S.si ? stg.rows.length : S.i, c = { yes: 0, abstain: 0, no: 0 }, shown = stg.rows.slice(0, n);
      shown.forEach(function (r) { c.yes += r.yes; c.abstain += r.abstain; c.no += r.no; });
      var fin = n >= stg.rows.length, pass = fin && stg.need.ok(fin ? stg.count : c), w = function (v) { return (v / stg.total * 100).toFixed(2) + '%'; };
      var maj = U.majority(), mark = stg.label.indexOf('override') >= 0 ? Math.ceil(stg.total * 2 / 3) : stg.label === 'Senate' ? Math.floor(stg.total / 2) + 1 : maj;
      h += '<div class="panel rollstage"><div class="row" style="justify-content:space-between"><b>' + esc(stg.label) + '</b><span class="small muted">' + esc(stg.need.text) + '</span></div>' +
        '<div class="rollbar"><i class="vy" style="width:' + w(c.yes) + '"></i><i class="va" style="width:' + w(c.abstain) + '"></i><i class="vn" style="width:' + w(c.no) + '"></i><span class="rollmark" style="left:' + (mark / stg.total * 100) + '%"></span></div>' +
        '<div class="rollnums"><span class="up">Yes <b>' + c.yes + '</b></span><span>Abstain <b>' + c.abstain + '</b></span><span class="down">No <b>' + c.no + '</b></span><span class="muted">' + (stg.total - c.yes - c.abstain - c.no) + ' still to vote</span></div>';
      if (!fin) {
        h += '<div class="rollfeed">' + shown.slice(-6).reverse().map(function (r, j) {
          return '<div class="' + (j === 0 ? 'now' : '') + '"><b>' + esc(r.sid === 'other' ? 'Remaining members' : NAMES(r.sid)) + '</b>: ' + r.parties.map(function (x) { var t = x.t, P = U.partyInfo(x.p); return '<span><i class="chip" style="background:' + P.color + '"></i>' + esc(P.short) + ' ' + (t.yes ? '<span class="up">' + t.yes + ' yes</span> ' : '') + (t.abstain ? t.abstain + ' abstain ' : '') + (t.no ? '<span class="down">' + t.no + ' no</span>' : '') + '</span>'; }).join(' · ') + '</div>'; }).join('') + '</div>';
      } else h += '<div class="rollresult ' + (pass ? 'up' : 'down') + '"><b>' + (pass ? 'Carried' : 'Not carried') + '</b> — ' + stg.count.yes + ' yes, ' + stg.count.no + ' no, ' + stg.count.abstain + ' abstaining</div>';
      if (fin) h += R.breakdown(stg.count);
      h += '</div>';
    });
    if (S.done) h += '<div class="result">' + esc(S.outcome || '') + '</div><div class="endbar"><button class="btn" data-act="rolldone">Continue</button></div>';
    else h += '<div class="row" style="margin-top:8px"><span class="small">Speed</span><input type="range" min="1" max="12" value="' + S.speed + '" data-rollspeed><button class="btn ghost" data-act="rollskip">Skip to the result</button></div>';
    return h;
  };
  R.start = function (redraw) {
    R.stop(); if (!S || S.done) return;
    timer = setInterval(function () {
      if (S.pause > 0) { S.pause--; return; }
      var stg = S.stages[S.si];
      S.i = Math.min(stg.rows.length, S.i + Math.max(1, Math.round(S.speed / 4)));
      if (S.i >= stg.rows.length) { if (S.si < S.stages.length - 1) { S.si++; S.i = 0; S.pause = 6; } else { S.done = true; R.stop(); } }
      redraw();
    }, 1400 / Math.max(1, S.speed));
  };
  R.skip = function () { if (!S) return; S.si = S.stages.length - 1; S.i = S.stages[S.si].rows.length; S.done = true; R.stop(); };
  R.setSpeed = function (v, redraw) { if (S) { S.speed = v; R.start(redraw); } };
})(typeof globalThis !== 'undefined' ? globalThis : window);
