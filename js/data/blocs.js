// Political blocs (for polls and maps) and the constituent parties of alliances
// (for the parliament views).
(function (G) {
  'use strict';
  var U = G.USA;

  // five-bloc placement of every party, current and former
  U.BLOC5 = {
    cpusa: 'L', dsa: 'L', wfp: 'L', revsoc: 'L', ul: 'L', grn: 'L', acp: 'L', vpp: 'L', soc: 'L',
    ldp: 'CL', sdlp: 'CL', prog: 'CL', fl: 'CL', raza: 'CL', aloha: 'CL', cnp: 'CL', alp: 'CL', npl: 'CL',
    asp: 'C', reform: 'C', aga: 'C', nyfp: 'C', nenp: 'C', ind: 'C', dem: 'C', mup: 'C', cath: 'C', mod: 'C',
    cdp: 'CR', cfc: 'CR', alk: 'CR',
    cc: 'R', lib: 'R', lsp: 'R', rep: 'R', con: 'R', maga: 'R', afp: 'R', srp: 'R'
  };
  // parties placed differently in the three-bloc view
  U.BLOC3_OVERRIDE = { ldp: 'C' };
  U.BLOC_INFO = {
    b2L: { name: 'Left bloc', short: 'Left', color: '#d1495b', econ: -5 }, b2R: { name: 'Right bloc', short: 'Right', color: '#2f5d9e', econ: 5 },
    b3L: { name: 'Left', short: 'Left', color: '#d1495b', econ: -5 }, b3C: { name: 'Centre', short: 'Centre', color: '#d9a62e', econ: 0 }, b3R: { name: 'Right', short: 'Right', color: '#2f5d9e', econ: 5 },
    b5L: { name: 'Left', short: 'Left', color: '#8e1b2b', econ: -9 }, b5CL: { name: 'Centre-left', short: 'Centre-left', color: '#e0697a', econ: -4 },
    b5C: { name: 'Centre', short: 'Centre', color: '#d9a62e', econ: 0 }, b5CR: { name: 'Centre-right', short: 'Centre-right', color: '#5b86c4', econ: 4 }, b5R: { name: 'Right', short: 'Right', color: '#1b2f5a', econ: 9 }
  };
  U.BLOC_ORDER = { 2: ['b2L', 'b2R'], 3: ['b3L', 'b3C', 'b3R'], 5: ['b5L', 'b5CL', 'b5C', 'b5CR', 'b5R'] };
  var econOf = function (Q, p) { var x = (Q && Q.pos && Q.pos[p]) || (U.PARTIES && U.PARTIES[p]) || ((U.PARTY_PROFILES || {})[p] || {}).ax || { econ: 0 }; return x.econ || 0; };
  U.blocOf = function (p, mode, Q) {
    if (p === 'nonvote') return 'nonvote';
    var b = U.BLOC5[p] || (p === 'regional' ? 'C' : 'C');
    if (String(mode) === '5') return 'b5' + b;
    if (String(mode) === '3') { b = U.BLOC3_OVERRIDE[p] || b; return b === 'L' || b === 'CL' ? 'b3L' : b === 'C' ? 'b3C' : 'b3R'; }
    if (b === 'C') return econOf(Q, p) < 0 ? 'b2L' : 'b2R';
    return b === 'L' || b === 'CL' ? 'b2L' : 'b2R';
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
