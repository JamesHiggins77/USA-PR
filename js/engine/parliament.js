// Parliamentary votes. Alliances and federations do not vote as one block:
// United Left seats belong to constituent organisations; AGA seats belong to
// autonomous state Green parties (brief §5.1-5.2, §20).
(function (G) {
  'use strict';
  var U = G.USA, P = U.Parliament = {};

  P.ulSplit = function (Q, seats) {
    var out = {}, left = seats, keys = Object.keys(U.UL_MEMBERS);
    var g = Math.min(seats, Q.greenSeats != null ? Q.greenSeats : Math.round(seats * U.UL_MEMBERS.green.w));
    out.green = g; left -= g;
    var rest = {}; keys.forEach(function (k) { if (k !== 'green') rest[k] = U.UL_MEMBERS[k].w; });
    var a = U.Electoral.hamilton(rest, Math.max(0, left), 0);
    for (var k in a) out[k] = a[k];
    return out;
  };

  // decide(party, sub) -> 'yes' | 'no' | 'abstain'
  P.count = function (Q, chamber, decide) {
    var seats = chamber === 'senate' ? U.Elections.senateCount(Q) : Q.house;
    var res = { yes: 0, no: 0, abstain: 0, by: [] };
    function tally(label, party, n, v) {
      if (!n) return; res[v] += n; res.by.push({ label: label, party: party, n: n, vote: v });
    }
    Object.keys(seats).forEach(function (p) {
      var n = seats[p];
      if (p === 'ul') {
        var split = P.ulSplit(Q, n);
        for (var k in split) tally(U.UL_MEMBERS[k].name, 'ul', split[k], decide('ul', k));
      } else if (p === 'aga' && chamber !== 'senate') {
        var ag = Q.agaSeats || {}, used = 0;
        ['AK', 'RI', 'VA'].forEach(function (st) { var m = Math.min(n - used, ag[st] || 0); used += m; tally(U.PARTIES.aga.chapters[st].name, 'aga', m, decide('aga', st)); });
        tally('Other AGA state parties', 'aga', n - used, decide('aga', 'other'));
      } else if (p === Q.player) {
        var v = decide(p), rebels = 0;
        if (v !== 'abstain') rebels = Math.round(n * P.rebelShare(Q, v));
        tally(U.PARTIES[p].short, p, n - rebels, v);
        tally(U.PARTIES[p].short + ' rebels', p, rebels, 'abstain');
      } else tally(U.PARTIES[p].short, p, n, decide(p));
    });
    return res;
  };

  // Share of the player's MPs who defy the whip (factions with high dissent).
  P.rebelShare = function (Q, v) {
    var s = 0;
    for (var k in Q.factions) { var f = Q.factions[k]; if (f.dissent > 65) s += f.strength / 100 * (f.dissent - 65) / 70; }
    return U.clamp(s - Q.unity / 400, 0, 0.3);
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
