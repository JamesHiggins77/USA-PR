// Political blocs (for polls and maps) and the constituent parties of alliances
// (for the parliament views).
(function (G) {
  'use strict';
  var U = G.USA;

  // Left-right score from all of a party's positions: economy and society
  // weigh most, federalism counts slightly right and environmentalism slightly left.
  // Current parties use their live positions, so blocs can shift during the game.
  U.blocScore = function (p, Q) {
    var a = ((U.PARTY_PROFILES || {})[p] || { ax: {} }).ax, ps = (Q && Q.pos && Q.pos[p]) || {};
    var v = function (k) { var x = ps[k] != null ? ps[k] : a[k]; return x || 0; };
    return 0.4 * v('econ') + 0.4 * v('soc') + 0.1 * v('fed') - 0.1 * (a.env || 0);
  };
  // seven bands of the score
  var BANDS = [[-6.0, 'FL'], [-3.8, 'L'], [-1.5, 'CL'], [1.5, 'C'], [4.5, 'CR'], [6.5, 'R'], [99, 'FR']];
  U.BLOC7_OVERRIDE = { acp: 'FL' }; // the syncretic communists sit on the far left whatever their social views
  U.bloc7 = function (p, Q) { if (p === 'regional') return 'C'; if (U.BLOC7_OVERRIDE[p]) return U.BLOC7_OVERRIDE[p]; var sc = U.blocScore(p, Q); for (var i = 0; i < BANDS.length; i++) if (sc < BANDS[i][0]) return BANDS[i][1]; return 'FR'; };
  // parties placed differently in the three-bloc view (the governing centre)
  U.BLOC3_OVERRIDE = { ldp: 'C', cdp: 'C' };
  U.BLOC_INFO = {
    b2L: { name: 'Left bloc', short: 'Left', color: '#d1495b', econ: -5 }, b2R: { name: 'Right bloc', short: 'Right', color: '#2f5d9e', econ: 5 },
    b3L: { name: 'Left', short: 'Left', color: '#d1495b', econ: -5 }, b3C: { name: 'Centre', short: 'Centre', color: '#d9a62e', econ: 0 }, b3R: { name: 'Right', short: 'Right', color: '#2f5d9e', econ: 5 },
    b5L: { name: 'Left', short: 'Left', color: '#a3162b', econ: -8 }, b5CL: { name: 'Centre-left', short: 'Centre-left', color: '#e0697a', econ: -3 },
    b5C: { name: 'Centre', short: 'Centre', color: '#d9a62e', econ: 0 }, b5CR: { name: 'Centre-right', short: 'Centre-right', color: '#6a92cc', econ: 3 }, b5R: { name: 'Right', short: 'Right', color: '#1f3f7a', econ: 8 },
    b7FL: { name: 'Far left', short: 'Far left', color: '#6b0f1f', econ: -9 }, b7L: { name: 'Left', short: 'Left', color: '#c8323f', econ: -6 }, b7CL: { name: 'Centre-left', short: 'Centre-left', color: '#ec8a96', econ: -3 },
    b7C: { name: 'Centre', short: 'Centre', color: '#d9a62e', econ: 0 }, b7CR: { name: 'Centre-right', short: 'Centre-right', color: '#8aaee0', econ: 3 }, b7R: { name: 'Right', short: 'Right', color: '#2f5d9e', econ: 6 }, b7FR: { name: 'Far right', short: 'Far right', color: '#14264d', econ: 9 }
  };
  U.BLOC_ORDER = { 2: ['b2L', 'b2R'], 3: ['b3L', 'b3C', 'b3R'], 5: ['b5L', 'b5CL', 'b5C', 'b5CR', 'b5R'], 7: ['b7FL', 'b7L', 'b7CL', 'b7C', 'b7CR', 'b7R', 'b7FR'] };
  U.blocOf = function (p, mode, Q) {
    if (p === 'nonvote') return 'nonvote';
    var b = U.bloc7(p, Q), m = String(mode);
    if (m === '7') return 'b7' + b;
    if (m === '5') return 'b5' + (b === 'FL' ? 'L' : b === 'FR' ? 'R' : b);
    if (m === '3') { b = U.BLOC3_OVERRIDE[p] || b; return b === 'FL' || b === 'L' || b === 'CL' ? 'b3L' : b === 'C' ? 'b3C' : 'b3R'; }
    return U.blocScore(p, Q) < 0 ? 'b2L' : 'b2R';
  };
  // shares (or seats) by party -> by bloc; mode 'party' returns the input
  U.blocAgg = function (sh, mode, Q) {
    if (!mode || mode === 'party') return sh;
    var o = {}; U.BLOC_ORDER[mode].forEach(function (b) { o[b] = 0; });
    for (var p in sh) { var b = U.blocOf(p, mode, Q); o[b] = (o[b] || 0) + sh[p]; }
    return o;
  };

  // party info for every key the views can show: parties, former parties, blocs, AGA chapters
  var base = U.partyInfo;
  U.partyInfo = function (k) {
    if (U.BLOC_INFO[k]) return U.BLOC_INFO[k];
    if (k === 'nonvote') return { name: 'Would not vote', short: 'Not voting', color: '#9aa0a6', econ: 0 };
    if (/^aga:/.test(k)) { var sid = k.slice(4), ch = ((U.PARTIES.aga || {}).chapters || {})[sid]; return { name: ch ? ch.name : 'Green chapter (' + sid + ')', short: 'AGA-' + sid, color: '#2e8b57', econ: ch ? ch.econ : 0 }; }
    if (U.PARTIES && U.PARTIES[k]) return U.PARTIES[k];
    var f = U.FORMER_PARTIES && U.FORMER_PARTIES[k];
    if (f) return { name: f.name, short: f.short, color: f.color, econ: ((U.PARTY_PROFILES || {})[k] || { ax: {} }).ax.econ || 0 };
    return base ? base(k) : { name: k, short: k, color: '#888', econ: 0 };
  };

  // alliances and their constituent parties
  U.ALLIANCES = { ul: 'United Left', asp: 'American Solidarity Party', aga: 'American Green Alliance' };
  U.allianceParts = function (Q, p, n, chamber) {
    if (!n) return null;
    if (p === 'ul') return U.Parliament.ulSplit(Q, n);
    if (p === 'asp') {
      var w = { mup: 0.35, cath: 0.4, mod: 0.25 }; if (Q.flags && Q.flags.reformAbsorbed) w.reform = 0.25;
      return U.Electoral.hamilton(w, n, 0);
    }
    if (p === 'aga') {
      var bs = chamber === 'senate' ? null : Q.agaSeats, o = {}, t = 0, s;
      if (bs) for (s in bs) if (bs[s]) { o['aga:' + s] = bs[s]; t += bs[s]; }
      if (t === n) return o;
      // otherwise share the seats among the strongest chapters
      var ch = Object.keys(((U.PARTIES.aga || {}).chapters) || {}); if (!ch.length) return null;
      var ww = {}; ch.forEach(function (c) { ww['aga:' + c] = 1; }); return U.Electoral.hamilton(ww, n, 0);
    }
    return null;
  };
  // seats with every alliance broken into its parties
  U.splitAlliances = function (Q, seats, chamber) {
    var o = {};
    for (var p in seats) { var parts = U.ALLIANCES[p] && U.allianceParts(Q, p, seats[p], chamber); if (parts) { for (var q in parts) if (parts[q]) o[q] = (o[q] || 0) + parts[q]; } else o[p] = (o[p] || 0) + seats[p]; }
    return o;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
