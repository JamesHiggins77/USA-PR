// Small SVG helpers: hemicycle, tile map, poll lines, bars.
(function (G) {
  'use strict';
  var U = G.USA, Ch = U.Charts = {};
  var ORDER = function (Q) { return U.ALL_PARTIES.slice().sort(function (a, b) { var A = (Q.pos[a] || U.PARTIES[a]), B = (Q.pos[b] || U.PARTIES[b]); return (A.econ + A.soc * 0.6) - (B.econ + B.soc * 0.6); }); };
  Ch.order = ORDER;

  // Hemicycle: seats arranged in concentric rows, parties left-to-right.
  Ch.hemicycle = function (Q, seats, opts) {
    opts = opts || {};
    var total = U.sum(seats), rows = Math.max(4, Math.round(Math.sqrt(total / 4.2))), R = 200, r0 = 70;
    var pts = [], rowR = [], k;
    for (k = 0; k < rows; k++) rowR.push(r0 + (R - r0) * k / (rows - 1));
    var circ = rowR.reduce(function (s, r) { return s + r; }, 0), left = total;
    var counts = rowR.map(function (r, i) { var n = i === rows - 1 ? left : Math.round(total * r / circ); left -= n; return n; });
    rowR.forEach(function (r, i) { for (var j = 0; j < counts[i]; j++) { var a = Math.PI - Math.PI * (counts[i] === 1 ? 0.5 : j / (counts[i] - 1)); pts.push({ a: a, x: 220 + r * Math.cos(a), y: 215 - r * Math.sin(a) }); } });
    pts.sort(function (p, q) { return q.a - p.a; });
    var order = ORDER(Q).filter(function (p) { return seats[p]; }), idx = 0, dot = Math.max(1.6, 150 / Math.sqrt(total) * 0.42), out = '';
    order.forEach(function (p) { for (var i = 0; i < seats[p]; i++) { var pt = pts[idx++]; if (pt) out += '<circle cx="' + pt.x.toFixed(1) + '" cy="' + pt.y.toFixed(1) + '" r="' + dot.toFixed(2) + '" fill="' + U.PARTIES[p].color + '"><title>' + U.PARTIES[p].short + ' ' + seats[p] + '</title></circle>'; } });
    var maj = Math.floor(total / 2) + 1;
    return '<svg viewBox="0 0 440 230" width="100%" style="max-width:520px">' + out +
      '<text x="220" y="205" text-anchor="middle" font-size="22" font-weight="bold">' + total + '</text>' +
      '<text x="220" y="224" text-anchor="middle" font-size="11" fill="currentColor">majority ' + maj + '</text></svg>';
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
