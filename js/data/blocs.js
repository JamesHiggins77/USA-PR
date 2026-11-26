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
  U.ALLIANCES = { ul: 'United Left', asp: 'American Solidarity Union', aga: 'American Green Alliance', cc: 'Conservative Coalition', rbw: 'Rainbow Coalition' };
  // constituent parties of the alliances that are not parties in their own right elsewhere
  U.CONSTITUENTS = {
    aspp: { name: 'American Solidarity Party', short: 'ASP', color: '#c86a10', alliance: 'asp', econ: -3, soc: 5, desc: 'The largest party in the American Solidarity Union: Christian democracy of the older kind, culturally conservative and fiscally progressive, strongest in the Great Lakes and the Plains.' },
    ccrep: { name: 'Republican Party', short: 'REP', color: '#c0392b', alliance: 'cc', econ: 6, soc: 5, desc: 'The senior partner in the Conservative Coalition since 1978: business conservatives and the religious right outside the South. It still holds its own conventions and chooses its own candidates for the joint lists.' },
    spusa: { name: 'Socialist Party USA', short: 'SPUSA', color: '#b3263d', alliance: 'ul', econ: -9, soc: -6, desc: 'The democratic-socialist heirs of Debs and Norman Thomas who stayed out of the 1953 SDLP merger. A member of the United Left.' },
    pfp: { name: 'Peace and Freedom Party', short: 'PFP', color: '#8e2a7a', alliance: 'ul', econ: -9, soc: -8, desc: 'Founded in California in 1967 against the Vietnam War; a socialist and feminist party strongest on the West Coast. A member of the United Left.' },
    swp: { name: 'Socialist Workers Party', short: 'SWP', color: '#9c1c1c', alliance: 'ul', econ: -10, soc: -5, desc: 'The Trotskyist party founded in 1938, rooted in a handful of union locals and campus groups. A member of the United Left.' },
    wwp: { name: 'Workers World Party', short: 'WWP', color: '#6d0f0f', alliance: 'ul', econ: -10, soc: -5, desc: 'A Marxist-Leninist party that split from the SWP in 1959, known for its anti-war coalitions. A member of the United Left.' },
    cpny: { name: 'Conservative Party of New York State', short: 'CPNY', color: '#5b6fa8', alliance: 'cc', econ: 6, soc: 7, desc: 'Founded in 1962 as a check on liberal Republicans; within the Conservative Coalition it alone fills the New York list.' },
    scwp: { name: 'South Carolina Workers Party', short: 'SCWP', color: '#a3242c', alliance: 'ul', econ: -9, soc: -3, desc: 'A small labor party of mill and port workers; a United Left list partner in South Carolina only.' },
    ucp: { name: 'United Citizens Party', short: 'UCP', color: '#7a3b8f', alliance: 'ul', econ: -6, soc: -3, desc: 'Founded in South Carolina in 1969 to elect Black candidates; a United Left list partner in states with large Black populations.' },
    opp: { name: 'Oregon Progressive Party', short: 'OPP', color: '#3c8d63', alliance: 'ul', econ: -7, soc: -6, desc: 'Oregon\u2019s progressive state party; a United Left list partner in Oregon.' },
    wapp: { name: 'Washington Progressive Party', short: 'WAPP', color: '#3c7f8d', alliance: 'ul', econ: -7, soc: -6, desc: 'Washington\u2019s progressive state party; a United Left list partner in Washington.' },
    bpp: { name: 'Black Panther Party', short: 'BPP', color: '#1a1a1a', alliance: 'rbw', econ: -10, soc: -6, desc: 'The Black Panther Party for Self-Defense, founded in Oakland in 1966: community programs and Black self-determination. The largest party in the Rainbow Coalition.' },
    aim: { name: 'American Indian Movement', short: 'AIM', color: '#b5651d', alliance: 'rbw', econ: -7, soc: -4, desc: 'Founded in Minneapolis in 1968 for treaty rights and tribal sovereignty; runs where Native voters are numerous.' },
    ylo: { name: 'Young Lords', short: 'YLO', color: '#8b1a3a', alliance: 'rbw', econ: -9, soc: -6, desc: 'The Puerto Rican movement born in Chicago and New York; runs in the Puerto Rican communities of the Northeast and Illinois.' },
    ypo: { name: 'Young Patriots', short: 'YPO', color: '#6b5a2e', alliance: 'rbw', econ: -8, soc: -2, desc: 'Poor white Southerners and Appalachian migrants in Chicago, the original partners of Fred Hampton\u2019s Rainbow Coalition.' },
    wpn: { name: 'White Panther Party', short: 'WPN', color: '#c9c9c9', alliance: 'rbw', econ: -9, soc: -9, desc: 'The Michigan counterculture party founded in 1968 in solidarity with the Black Panthers.' },
    ccdem: { name: 'Conservative Democrats', short: 'CDEM', color: '#1f4f8f', alliance: 'cc', econ: 4, soc: 7, desc: 'The heirs of the southern Democrats who stayed in the old Democratic Party after 1966. Since 1978 they run joint lists with the Republicans as the Conservative Coalition, and they dominate it in the South.' }
  };
  // ---- how each alliance fills its lists ----
  // Each alliance agrees who stands where. A list is an order of member parties
  // (repeated as needed); a list that wins n seats elects its first n names.
  var SOUTH = ['AL', 'AR', 'GA', 'KY', 'LA', 'MS', 'NC', 'OK', 'SC', 'TN', 'VA', 'WV'], BIG = ['NY', 'IL', 'FL', 'TX', 'CA'];
  var NEWENG = ['ME', 'NH', 'VT', 'MA', 'RI', 'CT'], SUNBELT = ['FL', 'GA', 'TX', 'AZ', 'NM', 'NV', 'CA', 'AL', 'MS', 'LA', 'SC', 'NC', 'TN', 'AR', 'OK'], PLAINS = ['KS', 'NE', 'ND', 'SD', 'IA', 'MO', 'MN'];
  var BLACK = ['MS', 'LA', 'GA', 'MD', 'SC', 'AL', 'NC', 'DE', 'VA', 'TN', 'DC'], NATIVE = ['SD', 'ND', 'MT', 'NM', 'AZ', 'OK', 'AK', 'MN', 'WY'];
  var cycle = function (order, n) { var o = {}; for (var i = 0; i < n; i++) { var p = order[i % order.length]; o[p] = (o[p] || 0) + 1; } return o; };
  U.LIST_RULES = {
    cc: 'Conservative Democrats head the list across the South and Republicans elsewhere (three Republicans to each Democrat). In the big states (New York, Illinois, Florida, Texas, California) the lists alternate, Democrat first in Florida and Texas, Republican first in the North. The national list alternates, Republican first.',
    asp: 'The ASP alone fills the national list and the Great Plains lists. The Mormon Unity Party runs on its own in Utah and Idaho. In New England the Catholic and Moderate parties alternate; across the Sunbelt it is Catholic, ASP, Catholic, ASP. Elsewhere the ASP leads, alternating with the Catholics and Moderates.',
    ul: 'Member parties share each state list by their strength in the alliance; the Vermont Progressives run only in Vermont, where they head the list. The national list follows the Greens\u2019 terms for joining, when they are members.'
  };
  U.listOrder = function (Q, a, sid) {
    if (a === 'cc') {
      if (sid === 'NAT') return ['ccrep', 'ccdem'];
      if (sid === 'NY') return ['cpny'];
      if (BIG.indexOf(sid) >= 0) return SOUTH.concat(['FL', 'TX']).indexOf(sid) >= 0 ? ['ccdem', 'ccrep'] : ['ccrep', 'ccdem'];
      if (SOUTH.indexOf(sid) >= 0) return ['ccdem'];
      return ['ccrep', 'ccrep', 'ccrep', 'ccdem'];
    }
    if (a === 'rbw') {
      var raza = Q && Q.flags && Q.flags.razaInRbw && !(Q.flags.rbwInUL);
      if (raza && ['TX', 'NM', 'CA', 'AZ', 'CO'].indexOf(sid) >= 0) return ['raza', 'bpp', 'ylo'];
      if (BLACK.indexOf(sid) >= 0) return ['bpp'];
      if (NATIVE.indexOf(sid) >= 0) return ['aim', 'bpp'];
      if (['NY', 'NJ', 'IL', 'PA', 'CT', 'MA'].indexOf(sid) >= 0) return ['ylo', 'bpp'];
      if (sid === 'MI') return ['wpn', 'bpp'];
      if (['WV', 'KY', 'TN', 'OH'].indexOf(sid) >= 0) return ['ypo', 'bpp'];
      return ['bpp', 'ylo', 'aim', 'ypo', 'wpn'];
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
  // The United Left: each state list rotates through the members by strength
  // (with the Greens inside: Green, DSA, CPUSA ...). Working Families take 2nd or
  // 3rd place in New York, Connecticut and Oregon; local partners join in their states.
  function hsh(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) % 1000; }
  function ulOrder(Q, sid, len) {
    var w = U.clone(Q.ulMembers || { cpusa: 1 }), seats = {}, out = [];
    delete w.vpp; if (!Object.keys(w).length) w = { cpusa: 1 };
    var local = ['NY', 'CT', 'OR'].indexOf(sid) >= 0 && w.wfp; if (local) delete w.wfp;
    // who heads the list differs from state to state, in proportion to strength
    var tw = 0, k0; for (k0 in w) tw += w[k0]; var x = hsh(sid + 'head') / 1000 * tw;
    for (k0 in w) { x -= w[k0]; if (x <= 0) { seats[k0] = 1; out.push(k0); break; } }
    for (var i = out.length; i < len; i++) { var best = null, bv = -1; for (var k in w) { var v = w[k] / (2 * (seats[k] || 0) + 1); if (v > bv) { bv = v; best = k; } } seats[best] = (seats[best] || 0) + 1; out.push(best); }
    var put = function (key, pos) { out.splice(Math.min(pos, out.length), 0, key); };
    if (local) put('wfp', 1 + hsh(sid + 'wfp') % 2);
    if (sid === 'VT' && Q.ulMembers && Q.ulMembers.vpp) put('vpp', 0);
    if (sid === 'SC') put('scwp', 1);
    if (BLACK.indexOf(sid) >= 0) put('ucp', 2);
    if (sid === 'OR') put('opp', 1);
    if (sid === 'WA') put('wapp', 1);
    return out;
  }
  function ulList(Q, sid, n) {
    var w = U.clone(Q.ulMembers || { cpusa: 1 }), o;
    delete w.vpp;
    if (sid === 'NAT' && w.grn && Q.ulGreenDeal) {
      var top = Q.ulGreenDeal === 'all' ? n : Math.min(n, Q.ulGreenDeal); o = { grn: top };
      if (n > top) { delete w.grn; var rr = U.Electoral.hamilton(w, n - top, 0); for (var q in rr) if (rr[q]) o[q] = rr[q]; }
    } else if (sid === 'NAT') o = U.Electoral.hamilton(w, n, 0);
    else o = cycle(ulOrder(Q, sid, n + 6), n);
    // the Rainbow Coalition, if it has joined, splits its places among its own parties
    if (o.rbw) { var rb = U.listSplit(Q, 'rbw', sid, o.rbw); delete o.rbw; for (var r in rb) o[r] = (o[r] || 0) + rb[r]; }
    return o;
  }

  U.listSplit = function (Q, a, sid, n) { if (!n) return {}; if (a === 'rbw' && Q.flags && Q.flags.rbwParty) return { rbw: n }; if (a === 'ul') return ulList(Q, sid, n); var ord = U.listOrder(Q, a, sid); return ord ? cycle(ord, n) : null; };
  // where an alliance's seats came from: state lists (+ the national list) or Senate states
  function seatsByList(Q, a, chamber) {
    var o = {}, t = 0;
    if (chamber === 'senate') (Q.senateSeats || []).forEach(function (x) { if (x.party === a) { o[x.state] = (o[x.state] || 0) + 1; t++; } });
    else { var hb = Q.houseByState || {}; for (var s in hb) if (hb[s][a]) { o[s] = hb[s][a]; t += hb[s][a]; } var nat = (Q.house[a] || 0) - t; if (nat > 0) { o.NAT = nat; t += nat; } }
    return { by: o, total: t };
  }
  // every member party of an alliance, seats or not
  U.allianceMembers = function (Q, a) {
    if (a === 'cc') return ['ccrep', 'ccdem', 'cpny'];
    if (a === 'rbw') return ['bpp', 'aim', 'ylo', 'ypo', 'wpn'].concat(Q && Q.flags && Q.flags.razaInRbw && !Q.flags.rbwInUL ? ['raza'] : []);
    if (a === 'asp') return ['aspp', 'mup', 'cath', 'mod'].concat(Q && Q.flags && Q.flags.reformAbsorbed ? ['reform'] : []);
    if (a === 'ul') { var um = Object.keys((Q && Q.ulMembers) || {}).filter(function (m) { return m !== 'rbw'; }); if (Q && Q.ulMembers && Q.ulMembers.rbw) um = um.concat(['bpp', 'aim', 'ylo', 'ypo', 'wpn']); return um.concat(['scwp', 'ucp', 'opp', 'wapp']); }
    return null;
  };
  // split a result's alliance seats into member parties using that election's
  // own state results: states {sid: {seats, leg}}, national {party: n}
  U.splitResult = function (Q, seats, states, national) {
    var o = {}, p, sid;
    for (p in seats) {
      if (!seats[p]) continue;
      if (!(p === 'cc' || p === 'asp' || p === 'ul' || p === 'rbw') || !states) { o[p] = (o[p] || 0) + seats[p]; continue; }
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
    if (p === 'ul' || p === 'cc' || p === 'asp' || (p === 'rbw' && !(Q.flags && Q.flags.rbwParty))) {
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
