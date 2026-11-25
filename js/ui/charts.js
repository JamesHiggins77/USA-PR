// Small SVG helpers: hemicycle, tile map, poll lines, bars.
(function (G) {
  'use strict';
  var U = G.USA, Ch = U.Charts = {};
  var ORDER = function (Q) { return U.ALL_PARTIES.slice().sort(function (a, b) { var A = (Q.pos[a] || U.PARTIES[a]), B = (Q.pos[b] || U.PARTIES[b]); return (A.econ + A.soc * 0.6) - (B.econ + B.soc * 0.6); }); };
  Ch.order = ORDER;

  // Hemicycle: seats arranged in concentric rows, parties left-to-right.
  Ch.hemicycle = function (Q, seats, opts) {
    opts = opts || {};
    var total = U.sum(seats), rows = Math.max(total < 12 ? 1 : 2, Math.min(Math.round(Math.sqrt(total / 4.2)), 30)), R = 200, r0 = rows === 1 ? 200 : 70;
    var pts = [], rowR = [], k;
    for (k = 0; k < rows; k++) rowR.push(rows === 1 ? R : r0 + (R - r0) * k / (rows - 1));
    var circ = rowR.reduce(function (s, r) { return s + r; }, 0), left = total;
    var counts = rowR.map(function (r, i) { var n = i === rows - 1 ? left : Math.round(total * r / circ); left -= n; return n; });
    rowR.forEach(function (r, i) { for (var j = 0; j < counts[i]; j++) { var a = Math.PI - Math.PI * (counts[i] === 1 ? 0.5 : j / (counts[i] - 1)); pts.push({ a: a, x: 220 + r * Math.cos(a), y: 215 - r * Math.sin(a) }); } });
    pts.sort(function (p, q) { return q.a - p.a; });
    var order = ORDER(Q).filter(function (p) { return seats[p]; }), idx = 0, dot = Math.min(16, Math.max(1.6, 150 / Math.sqrt(Math.max(1, total)) * 0.42)), out = '';
    order.forEach(function (p) { for (var i = 0; i < seats[p]; i++) { var pt = pts[idx++]; if (pt) out += '<circle cx="' + pt.x.toFixed(1) + '" cy="' + pt.y.toFixed(1) + '" r="' + dot.toFixed(2) + '" fill="' + U.PARTIES[p].color + '"><title>' + U.PARTIES[p].short + ' ' + seats[p] + '</title></circle>'; } });
    var maj = Math.floor(total / 2) + 1;
    return '<svg viewBox="0 0 440 230" width="100%" style="max-width:520px">' + out +
      '<text x="220" y="205" text-anchor="middle" font-size="22" font-weight="bold">' + total + '</text>' +
      '<text x="220" y="224" text-anchor="middle" font-size="11" fill="currentColor">majority ' + maj + '</text></svg>';
  };

  // seat list as a table, largest party first (the chart itself runs left to right)
  Ch.seatTable = function (Q, seats, change) {
    var tot = U.sum(seats), maj = Math.floor(tot / 2) + 1;
    var rows = Object.keys(seats).filter(function (p) { return seats[p]; }).sort(function (a, b) { return seats[b] - seats[a] || (a < b ? -1 : 1); });
    return '<table class="seats"><tr><th>Party</th><th>Seats</th><th>Share</th>' + (change ? '<th>+/\u2212</th>' : '') + '</tr>' + rows.map(function (p) {
      var d = change ? change(p) : 0;
      return '<tr><td><i class="chip" style="background:' + U.PARTIES[p].color + '"></i>' + U.PARTIES[p].name + '</td><td><b>' + seats[p] + '</b></td><td>' + (seats[p] / tot * 100).toFixed(1) + '%</td>' +
        (change ? '<td class="' + (d > 0 ? 'up' : d < 0 ? 'down' : '') + '">' + (d > 0 ? '+' : '') + d + '</td>' : '') + '</tr>';
    }).join('') + '<tr><td class="muted">Total (majority ' + maj + ')</td><td><b>' + tot + '</b></td><td></td>' + (change ? '<td></td>' : '') + '</tr></table>';
  };

  Ch.legend = function (Q, seats, extra) {
    return '<div class="legend">' + ORDER(Q).filter(function (p) { return seats[p]; }).map(function (p) {
      return '<span><i class="chip" style="background:' + U.PARTIES[p].color + '"></i>' + U.PARTIES[p].short + ' <b>' + seats[p] + '</b>' + (extra ? extra(p) : '') + '</span>';
    }).join('') + '</div>';
  };

  // dark text on light fills (yellow, orange), white on dark ones
  Ch.ink = function (c) { var m = /^#(..)(..)(..)$/.exec(c); if (!m) return '#fff'; var r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16); return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#1a1a1a' : '#fff'; };
  Ch.map = function (Q, colorOf, labelOf) {
    var s = 46, out = '';
    var all = Object.keys(U.STATES).map(function (k) { return U.STATES[k]; }).concat([U.DC]);
    all.forEach(function (st) {
      var c = colorOf(st.id) || '#888', ink = U.Charts.ink(c);
      out += '<g class="tile" data-state="' + st.id + '"><rect x="' + st.x * s + '" y="' + st.y * s + '" width="' + (s - 3) + '" height="' + (s - 3) + '" rx="4" fill="' + c + '"></rect>' +
        '<text x="' + (st.x * s + (s - 3) / 2) + '" y="' + (st.y * s + 20) + '" text-anchor="middle" font-size="12" font-weight="bold" style="fill:' + ink + '">' + st.id + '</text>' +
        '<text x="' + (st.x * s + (s - 3) / 2) + '" y="' + (st.y * s + 35) + '" text-anchor="middle" font-size="9.5" style="fill:' + ink + '">' + (labelOf ? labelOf(st.id) : '') + '</text><title>' + st.name + '</title></g>';
    });
    return '<svg viewBox="0 0 ' + 11 * s + ' ' + 8 * s + '" width="100%" style="max-width:640px">' + out + '</svg>';
  };

  // Geographical map: real state outlines. Small north-eastern states get
  // labelled boxes at the side, as on printed election maps.
  var SMALL = ['NH', 'VT', 'MA', 'RI', 'CT', 'NJ', 'DE', 'MD', 'DC'];
  Ch.geoMap = function (Q, colorOf, labelOf) {
    var out = '', G = U.GEO;
    Object.keys(G).forEach(function (id) {
      var c = colorOf(id) || '#888', g = G[id], st = U.STATES[id] || U.DC, ink = Ch.ink(c);
      out += '<g class="tile" data-state="' + id + '"><path d="' + g.d + '" fill="' + c + '" stroke="var(--bg)" stroke-width="0.8"></path>';
      if (SMALL.indexOf(id) < 0) out += '<text x="' + g.c[0] + '" y="' + (g.c[1] - 2) + '" text-anchor="middle" font-size="11" font-weight="bold" style="fill:' + ink + ';pointer-events:none">' + id + '</text>' +
        '<text x="' + g.c[0] + '" y="' + (g.c[1] + 10) + '" text-anchor="middle" font-size="9" style="fill:' + ink + ';pointer-events:none">' + (labelOf ? labelOf(id) : '') + '</text>';
      out += '<title>' + st.name + '</title></g>';
    });
    SMALL.forEach(function (id, i) {
      var c = colorOf(id) || '#888', ink = Ch.ink(c), x = 925, y = 175 + i * 38, g = G[id];
      out += '<g class="tile" data-state="' + id + '"><line x1="' + g.c[0] + '" y1="' + g.c[1] + '" x2="' + x + '" y2="' + (y + 16) + '" stroke="currentColor" stroke-opacity=".25"/>' +
        '<rect x="' + x + '" y="' + y + '" width="44" height="32" rx="4" fill="' + c + '"></rect>' +
        '<text x="' + (x + 22) + '" y="' + (y + 14) + '" text-anchor="middle" font-size="11" font-weight="bold" style="fill:' + ink + '">' + id + '</text>' +
        '<text x="' + (x + 22) + '" y="' + (y + 26) + '" text-anchor="middle" font-size="9" style="fill:' + ink + '">' + (labelOf ? labelOf(id) : '') + '</text><title>' + (U.STATES[id] || U.DC).name + '</title></g>';
    });
    return '<svg viewBox="0 0 975 610" width="100%" style="color:var(--ink)">' + out + '</svg>';
  };

  // Shade a colour by vote share: light below 25%, darker above 50% (7 bands).
  var BANDS = [25, 30, 35, 40, 45, 50];
  Ch.band = function (v) { var i = 0; while (i < BANDS.length && v >= BANDS[i]) i++; return i; };
  Ch.shade = function (c, b) {
    var m = /^#(..)(..)(..)$/.exec(c); if (!m) return c;
    var f = [0.62, 0.48, 0.34, 0.2, 0.06, -0.14, -0.32][b], rgb = [1, 2, 3].map(function (i) { var x = parseInt(m[i], 16); return Math.round(f >= 0 ? x + (255 - x) * f : x * (1 + f)); });
    return '#' + rgb.map(function (x) { return ('0' + Math.max(0, Math.min(255, x)).toString(16)).slice(-2); }).join('');
  };
  Ch.bandLabels = ['<25%', '25%', '30%', '35%', '40%', '45%', '50%+'];
  // a block of seat dots centred on (cx, cy); seats: {party: n}
  // seats won first, then vote share
  function byResult(d) { d = d || {}; var se = d.seats || {}, sh = d.shares || {}; return function (ks) { return ks.sort(function (a, b) { return (se[b] || 0) - (se[a] || 0) || (sh[b] || 0) - (sh[a] || 0); }); }; }
  function dots(seats, cx, cy, maxCols, order, colorOf) {
    var list = []; order(Object.keys(seats)).forEach(function (p) { for (var i = 0; i < seats[p]; i++) list.push(p); });
    var n = list.length; if (!n) return { svg: '', h: 0 };
    var cols = Math.min(maxCols, Math.max(1, Math.ceil(Math.sqrt(n * 1.8)))), rows = Math.ceil(n / cols), s = 8, out = '';
    list.forEach(function (p, i) { var r = Math.floor(i / cols), c = i % cols, inRow = r === rows - 1 ? n - r * cols : cols;
      out += '<rect x="' + (cx + (c - (inRow - 1) / 2) * s - 3.2) + '" y="' + (cy + r * s - 3.2) + '" width="6.4" height="6.4" fill="' + colorOf(p) + '" stroke="#fff" stroke-width="1.4"/>'; });
    return { svg: out, h: rows * s };
  }
  // data: {sid: {seats: {p: n}, shares: {p: %}}}. Fill = party with most votes,
  // shaded by its share; dots = seats won in the state. opts.inset: {title, seats}.
  Ch.resultMap = function (Q, data, opts) {
    opts = opts || {};
    var G = U.GEO, out = '', col = function (p) { return U.partyInfo(p).color; };
    var order = function (ks) { return ks.sort(function (a, b) { return (U.partyInfo(a).econ || 0) - (U.partyInfo(b).econ || 0); }); };
    var fill = function (id) { var d = data[id]; if (!d) return '#d6d2c8'; var sh = d.shares || {}, ks = Object.keys(sh);
      if (!ks.length) { ks = Object.keys(d.seats || {}); if (!ks.length) return '#d6d2c8'; var t = ks.sort(function (a, b) { return d.seats[b] - d.seats[a]; })[0]; return Ch.shade(col(t), 3); }
      var w = ks.sort(function (a, b) { return sh[b] - sh[a]; })[0]; return Ch.shade(col(w), Ch.band(sh[w])); };
    Object.keys(G).forEach(function (id) {
      var g = G[id], c = fill(id), ink = Ch.ink(c), small = SMALL.indexOf(id) >= 0;
      out += '<g class="tile" data-state="' + id + '"><path d="' + g.d + '" fill="' + c + '" stroke="var(--bg)" stroke-width="0.8"></path>';
      if (!small) { var d = dots((data[id] || {}).seats || {}, g.c[0], g.c[1] + 2, id === 'CA' || id === 'TX' ? 8 : 6, byResult(data[id]), col);
        out += '<text x="' + g.c[0] + '" y="' + (g.c[1] - 3) + '" text-anchor="middle" font-size="9.5" font-weight="bold" style="fill:' + ink + ';pointer-events:none">' + id + '</text><g style="pointer-events:none">' + d.svg + '</g>'; }
      out += '<title>' + (U.STATES[id] || U.DC).name + '</title></g>';
    });
    var y = 150;
    SMALL.forEach(function (id) {
      var c = fill(id), ink = Ch.ink(c), x = 912, g = G[id], d = dots((data[id] || {}).seats || {}, x + 33, y + 17, 8, byResult(data[id]), col), hgt = Math.max(24, 20 + d.h);
      out += '<g class="tile" data-state="' + id + '"><line x1="' + g.c[0] + '" y1="' + g.c[1] + '" x2="' + x + '" y2="' + (y + 10) + '" stroke="currentColor" stroke-opacity=".25"/>' +
        '<rect x="' + x + '" y="' + y + '" width="62" height="' + hgt + '" rx="4" fill="' + c + '"></rect>' +
        '<text x="' + (x + 33) + '" y="' + (y + 11) + '" text-anchor="middle" font-size="9.5" font-weight="bold" style="fill:' + ink + '">' + id + '</text>' + d.svg + '<title>' + (U.STATES[id] || U.DC).name + '</title></g>';
      y += hgt + 4;
    });
    var bottom = Math.max(610, y + 10);
    if (opts.inset) { var dd = dots(opts.inset.seats, 487, bottom + 28, 34, byResult({ seats: opts.inset.seats, shares: opts.inset.shares }), col);
      out += '<g><rect x="317" y="' + (bottom + 4) + '" width="340" height="' + (dd.h + 32) + '" rx="6" fill="none" stroke="currentColor" stroke-opacity=".3"/><text x="487" y="' + (bottom + 18) + '" text-anchor="middle" font-size="10" font-weight="bold" fill="currentColor">' + opts.inset.title + '</text>' + dd.svg + '</g>';
      bottom += dd.h + 40; }
    return '<svg viewBox="0 0 975 ' + bottom + '" width="100%" style="color:var(--ink)">' + out + '</svg>';
  };
  // inner pie = seats, outer ring = votes
  Ch.ring = function (seats, votes, order) {
    var arc = function (r0, r1, a0, a1, c) { var L = a1 - a0 > Math.PI ? 1 : 0, p = function (r, a) { return (60 + r * Math.sin(a)).toFixed(2) + ' ' + (60 - r * Math.cos(a)).toFixed(2); };
      return '<path d="M' + p(r1, a0) + ' A' + r1 + ' ' + r1 + ' 0 ' + L + ' 1 ' + p(r1, a1) + ' L' + p(r0, a1) + (r0 ? ' A' + r0 + ' ' + r0 + ' 0 ' + L + ' 0 ' + p(r0, a0) : '') + ' Z" fill="' + c + '" stroke="var(--card)" stroke-width="0.6"/>'; };
    var draw = function (obj, r0, r1) { var ks = order(Object.keys(obj).filter(function (k) { return obj[k] > 0; })), tot = 0, a = 0, o = '';
      ks.forEach(function (k) { tot += obj[k]; }); ks.forEach(function (k) { var b = a + obj[k] / tot * 2 * Math.PI; o += arc(r0, r1, a, Math.min(b, a + 2 * Math.PI - 1e-4), U.partyInfo(k).color); a = b; }); return o; };
    return '<svg viewBox="0 0 120 120" width="150" height="150">' + draw(votes, 46, 57) + draw(seats, 0, 42) + '</svg>';
  };

  // District map: each state's synthetic districts clipped to its outline.
  // colorOf(stateId, districtNumber) -> fill (colour or url(#pattern)).
  Ch.districtMap = function (Q, colorOf, defs, titleOf) {
    var G = U.GEO, D = U.DISTRICTS, clips = '', out = '';
    Object.keys(G).forEach(function (sid) {
      var cells = D[sid] ? D[sid].cells : [null], st = U.STATES[sid] || U.DC;
      clips += '<clipPath id="clip-' + sid + '"><path d="' + G[sid].d + '"/></clipPath>';
      out += '<g class="tile" data-state="' + sid + '" clip-path="url(#clip-' + sid + ')">';
      cells.forEach(function (c, i) {
        out += '<path class="dist" data-d="' + sid + '-' + (i + 1) + '" d="' + (c || G[sid].d) + '" fill="' + (colorOf(sid, i + 1) || '#9aa0a6') + '" stroke="var(--card)" stroke-width="0.35"><title>' + (titleOf ? titleOf(sid, i + 1) : st.name + ' district ' + (i + 1)) + '</title></path>';
      });
      out += '</g><path d="' + G[sid].d + '" fill="none" stroke="var(--ink)" stroke-opacity=".55" stroke-width="0.9" pointer-events="none"/>';
    });
    return '<svg viewBox="0 0 975 610" width="100%" style="color:var(--ink)"><defs>' + clips + (defs || '') + '</defs>' + out + '</svg>';
  };
  // diagonal stripes for a pair of parties (runoffs)
  Ch.stripeDef = function (a, b) {
    return '<pattern id="ro-' + a + '-' + b + '" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="8" fill="' + U.PARTIES[a].color + '"/><rect x="4" width="4" height="8" fill="' + U.PARTIES[b].color + '"/></pattern>';
  };

  Ch.polls = function (Q, parties) {
    var P = Q.polls.slice(-60), W = 640, Hh = 240, pad = 30;
    if (P.length < 2) return '<p class="muted small">Polling history will appear after a few months.</p>';
    var max = 0; P.forEach(function (p) { parties.forEach(function (q) { max = Math.max(max, p.v[q] || 0); }); }); max = Math.ceil(max / 5) * 5 + 5;
    var x = function (i) { return pad + (W - pad - 10) * i / (P.length - 1); }, y = function (v) { return Hh - pad + 10 - (Hh - pad) * v / max; };
    var out = '';
    for (var g = 0; g <= max; g += 5) out += '<line x1="' + pad + '" x2="' + (W - 10) + '" y1="' + y(g) + '" y2="' + y(g) + '" stroke="currentColor" stroke-opacity=".12"/><text x="' + (pad - 4) + '" y="' + (y(g) + 4) + '" font-size="10" text-anchor="end">' + g + '</text>';
    parties.forEach(function (q) {
      var d = P.map(function (p, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.v[q] || 0).toFixed(1); }).join(' ');
      out += '<path d="' + d + '" fill="none" stroke="' + U.PARTIES[q].color + '" stroke-width="2"/>';
      var last = P[P.length - 1].v[q] || 0;
      out += '<text x="' + (W - 8) + '" y="' + (y(last) + 4) + '" font-size="10" text-anchor="end" style="fill:' + U.PARTIES[q].color + '">' + U.PARTIES[q].short + '</text>';
    });
    out += '<text x="' + pad + '" y="' + (Hh + 6) + '" font-size="10">' + P[0].label + '</text><text x="' + (W - 10) + '" y="' + (Hh + 6) + '" font-size="10" text-anchor="end">' + P[P.length - 1].label + '</text>';
    return '<svg viewBox="0 0 ' + W + ' ' + (Hh + 12) + '" width="100%" style="color:var(--ink)">' + out + '</svg>';
  };

  Ch.bar = function (v, max, cls) { return '<div class="bar ' + (cls || '') + '"><i style="width:' + U.clamp(v / max * 100, 0, 100) + '%"></i></div>'; };
})(typeof globalThis !== 'undefined' ? globalThis : window);
