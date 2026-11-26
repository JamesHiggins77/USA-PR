// Political blocs (for polls and maps) and the constituent parties of alliances
// (for the parliament views).
(function (G) {
  'use strict';
  var U = G.USA;

  // Left-right score from all of a party's positions: economy and society
  // weigh most, federalism counts slightly right and environmentalism slightly left.
  // Current parties use their live positions, so blocs can shift during the game.
  U.blocScore = function (p, Q) {
    var a = ((U.PARTY_PROFILES || {})[p] || { ax: U.CONSTITUENTS && U.CONSTITUENTS[p] ? { econ: U.CONSTITUENTS[p].econ, soc: U.CONSTITUENTS[p].soc } : {} }).ax, ps = (Q && Q.pos && Q.pos[p]) || {};
    var v = function (k) { var x = ps[k] != null ? ps[k] : a[k]; return x || 0; };
    return 0.4 * v('econ') + 0.4 * v('soc') + 0.1 * v('fed') - 0.1 * (a.env || 0);
  };
  // seven bands of the score
  var BANDS = [[-6.0, 'FL'], [-3.8, 'L'], [-1.5, 'CL'], [1.5, 'C'], [4.5, 'CR'], [6.5, 'R'], [99, 'FR']];
  U.BLOC7_OVERRIDE = { acp: 'FL', cpusa: 'FL', ul: 'L', grn: 'L', dsa: 'L', maga: 'FR', nenp: 'C', lib: 'R' }; // designer placements that override the score
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
    if (U.CONSTITUENTS && U.CONSTITUENTS[k]) return U.CONSTITUENTS[k];
    if (U.PARTIES && U.PARTIES[k]) return U.PARTIES[k];
    var f = U.FORMER_PARTIES && U.FORMER_PARTIES[k];
    if (f) return { name: f.name, short: f.short, color: f.color, econ: ((U.PARTY_PROFILES || {})[k] || { ax: {} }).ax.econ || 0 };
    return base ? base(k) : { name: k, short: k, color: '#888', econ: 0 };
  };

  // alliances and their constituent parties
  U.ALLIANCES = { ul: 'United Left', asp: 'American Solidarity Union', aga: 'American Green Alliance', cc: 'Conservative Coalition' };
  // constituent parties of the alliances that are not parties in their own right elsewhere
  U.CONSTITUENTS = {
    aspp: { name: 'American Solidarity Party', short: 'ASP', color: '#c86a10', alliance: 'asp', econ: -3, soc: 5, desc: 'The largest party in the American Solidarity Union: Christian democracy of the older kind, culturally conservative and fiscally progressive, strongest in the Great Lakes and the Plains.' },
    ccrep: { name: 'Republican Party', short: 'REP', color: '#c0392b', alliance: 'cc', econ: 6, soc: 5, desc: 'The senior partner in the Conservative Coalition since 1978: business conservatives and the religious right outside the South. It still holds its own conventions and chooses its own candidates for the joint lists.' },
    spusa: { name: 'Socialist Party USA', short: 'SPUSA', color: '#b3263d', alliance: 'ul', econ: -9, soc: -6, desc: 'The democratic-socialist heirs of Debs and Norman Thomas who stayed out of the 1953 SDLP merger. A member of the United Left.' },
    pfp: { name: 'Peace and Freedom Party', short: 'PFP', color: '#8e2a7a', alliance: 'ul', econ: -9, soc: -8, desc: 'Founded in California in 1967 against the Vietnam War; a socialist and feminist party strongest on the West Coast. A member of the United Left.' },
    swp: { name: 'Socialist Workers Party', short: 'SWP', color: '#9c1c1c', alliance: 'ul', econ: -10, soc: -5, desc: 'The Trotskyist party founded in 1938, rooted in a handful of union locals and campus groups. A member of the United Left.' },
    wwp: { name: 'Workers World Party', short: 'WWP', color: '#6d0f0f', alliance: 'ul', econ: -10, soc: -5, desc: 'A Marxist-Leninist party that split from the SWP in 1959, known for its anti-war coalitions. A member of the United Left.' },
    ccdem: { name: 'Conservative Democrats', short: 'CDEM', color: '#1f4f8f', alliance: 'cc', econ: 4, soc: 7, desc: 'The heirs of the southern Democrats who stayed in the old Democratic Party after 1966. Since 1978 they run joint lists with the Republicans as the Conservative Coalition, and they dominate it in the South.' }
  };
  // ---- how each alliance fills its lists ----
  // Each alliance agrees who stands where. A list is an order of member parties
  // (repeated as needed); a list that wins n seats elects its first n names.
  var SOUTH = ['AL', 'AR', 'GA', 'KY', 'LA', 'MS', 'NC', 'OK', 'SC', 'TN', 'VA', 'WV'], BIG = ['NY', 'IL', 'FL', 'TX', 'CA'];
  var NEWENG = ['ME', 'NH', 'VT', 'MA', 'RI', 'CT'], SUNBELT = ['FL', 'GA', 'TX', 'AZ', 'NM', 'NV', 'CA', 'AL', 'MS', 'LA', 'SC', 'NC', 'TN', 'AR', 'OK'], PLAINS = ['KS', 'NE', 'ND', 'SD', 'IA', 'MO', 'MN'];
  var cycle = function (order, n) { var o = {}; for (var i = 0; i < n; i++) { var p = order[i % order.length]; o[p] = (o[p] || 0) + 1; } return o; };
  U.LIST_RULES = {
    cc: 'Conservative Democrats head the list across the South and Republicans elsewhere (three Republicans to each Democrat). In the big states (New York, Illinois, Florida, Texas, California) the lists alternate, Democrat first in Florida and Texas, Republican first in the North. The national list alternates, Republican first.',
    asp: 'The ASP alone fills the national list and the Great Plains lists. The Mormon Unity Party runs on its own in Utah and Idaho. In New England the Catholic and Moderate parties alternate; across the Sunbelt it is Catholic, ASP, Catholic, ASP. Elsewhere the ASP leads, alternating with the Catholics and Moderates.',
    ul: 'Member parties share each state list by their strength in the alliance; the Vermont Progressives run only in Vermont, where they head the list. The national list follows the Greens\u2019 terms for joining, when they are members.'
  };
  U.listOrder = function (Q, a, sid) {
    if (a === 'cc') {
      if (sid === 'NAT') return ['ccrep', 'ccdem'];
      if (BIG.indexOf(sid) >= 0) return SOUTH.concat(['FL', 'TX']).indexOf(sid) >= 0 ? ['ccdem', 'ccrep'] : ['ccrep', 'ccdem'];
      if (SOUTH.indexOf(sid) >= 0) return ['ccdem'];
      return ['ccrep', 'ccrep', 'ccrep', 'ccdem'];
    }
    if (a === 'asp') {
      var ref = Q.flags && Q.flags.reformAbsorbed;
      if (sid === 'NAT' || PLAINS.indexOf(sid) >= 0) return ['aspp'];
      if (sid === 'UT' || sid === 'ID') return ['mup'];
      if (NEWENG.indexOf(sid) >= 0) return ['cath', 'mod'];
      if (SUNBELT.indexOf(sid) >= 0) return ref && sid === 'TX' ? ['reform', 'cath', 'aspp'] : ['cath', 'aspp'];
      return ref ? ['aspp', 'cath', 'reform', 'aspp', 'mod'] : ['aspp', 'cath', 'aspp', 'mod'];
    }
    return null;
  };
  // the United Left: by strength, Vermont Progressives only in Vermont, Greens' national-list terms
  function ulList(Q, sid, n) {
    var w = U.clone(Q.ulMembers || { cpusa: 1 });
    if (sid === 'VT' && w.vpp) { var o = { vpp: 1 }; if (n > 1) { delete w.vpp; var r = U.Electoral.hamilton(w, n - 1, 0); for (var k in r) if (r[k]) o[k] = r[k]; } return o; }
    delete w.vpp;
    if (sid === 'NAT' && w.grn && Q.ulGreenDeal) {
      var top = Q.ulGreenDeal === 'all' ? n : Math.min(n, Q.ulGreenDeal), g = {}; g.grn = top;
      if (n > top) { delete w.grn; var rr = U.Electoral.hamilton(w, n - top, 0); for (var q in rr) if (rr[q]) g[q] = rr[q]; }
      return g;
    }
    return U.Electoral.hamilton(w, n, 0);
  }
  U.listSplit = function (Q, a, sid, n) { if (!n) return {}; if (a === 'ul') return ulList(Q, sid, n); var ord = U.listOrder(Q, a, sid); return ord ? cycle(ord, n) : null; };
  // where an alliance's seats came from: state lists (+ the national list) or Senate states
  function seatsByList(Q, a, chamber) {
    var o = {}, t = 0;
    if (chamber === 'senate') (Q.senateSeats || []).forEach(function (x) { if (x.party === a) { o[x.state] = (o[x.state] || 0) + 1; t++; } });
    else { var hb = Q.houseByState || {}; for (var s in hb) if (hb[s][a]) { o[s] = hb[s][a]; t += hb[s][a]; } var nat = (Q.house[a] || 0) - t; if (nat > 0) { o.NAT = nat; t += nat; } }
    return { by: o, total: t };
  }
  // every member party of an alliance, seats or not
  U.allianceMembers = function (Q, a) {
    if (a === 'cc') return ['ccrep', 'ccdem'];
    if (a === 'asp') return ['aspp', 'mup', 'cath', 'mod'].concat(Q && Q.flags && Q.flags.reformAbsorbed ? ['reform'] : []);
    if (a === 'ul') return Object.keys((Q && Q.ulMembers) || {});
    return null;
  };
  // split a result's alliance seats into member parties using that election's
  // own state results: states {sid: {seats, leg}}, national {party: n}
  U.splitResult = function (Q, seats, states, national) {
    var o = {}, p, sid;
    for (p in seats) {
      if (!seats[p]) continue;
      if (!(p === 'cc' || p === 'asp' || p === 'ul') || !states) { o[p] = (o[p] || 0) + seats[p]; continue; }
      var got = {}, t = 0, add = function (sp) { for (var k in sp) { got[k] = (got[k] || 0) + sp[k]; t += sp[k]; } };
      for (sid in states) { var st = states[sid], n = (st.seats || {})[p] || 0; if (n) add(U.listSplit(Q, p, sid, n)); if (st.leg === p) add(U.listSplit(Q, p, sid, 1)); }
      if (national && national[p]) add(U.listSplit(Q, p, 'NAT', national[p]));
      if (t !== seats[p]) { var rest = seats[p] - t; if (rest > 0) add(U.listSplit(Q, p, 'NAT', rest)); }
      U.allianceMembers(Q, p).forEach(function (m) { o[m] = (o[m] || 0) + (got[m] || 0); });
      for (var k in got) if (o[k] == null) o[k] = got[k];
    }
    return o;
  };
  // the fragmented radical left joins the United Left as its separate parties
  U.ORL_STANCE = { spusa: 'hard', pfp: 'hard', swp: 'revolutionary', wwp: 'revolutionary' };
  U.ORL_PARTS = { spusa: 0.34, pfp: 0.24, swp: 0.21, wwp: 0.21 };
  U.splitORL = function (w) { if (!w || !w.revsoc) return w; var v = w.revsoc; delete w.revsoc; for (var k in U.ORL_PARTS) w[k] = (w[k] || 0) + v * U.ORL_PARTS[k]; return w; };
  U.allianceParts = function (Q, p, n, chamber) {
    if (!n) return null;
    if (p === 'ul' || p === 'cc' || p === 'asp') {
      var L = seatsByList(Q, p, chamber), out = {};
      if (L.total === n) { for (var s in L.by) { var sp = U.listSplit(Q, p, s, L.by[s]); for (var k in sp) out[k] = (out[k] || 0) + sp[k]; } return out; }
      // a hypothetical seat count: share it as the lists would on average
      if (L.total) { for (s in L.by) { sp = U.listSplit(Q, p, s, L.by[s]); for (k in sp) out[k] = (out[k] || 0) + sp[k]; } return U.Electoral.hamilton(out, n, 0); }
      return U.listSplit(Q, p, 'NAT', n);
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
