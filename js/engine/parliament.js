// Parliamentary votes. Alliances and federations do not vote as one block:
// United Left seats belong to constituent organisations; AGA seats belong to
// autonomous state Green parties (brief §5.1-5.2, §20).
(function (G) {
  'use strict';
  var U = G.USA, P = U.Parliament = {};

  // United Left seats are split among its member parties by their weight in
  // the alliance when it was formed (Q.ulMembers).
  P.ulSplit = function (Q, seats) {
    var w = Q.ulMembers || { cpusa: 1 };
    return U.Electoral.hamilton(w, seats, 0);
  };

  // decide(party, sub) -> 'yes' | 'no' | 'abstain'
  P.count = function (Q, chamber, decide) {
    var seats = chamber === 'senate' ? U.Elections.senateCount(Q) : Q.house;
    var res = { yes: 0, no: 0, abstain: 0, by: [] };
    // the President breaks ties in the House by their party's line
    if (chamber !== 'senate' && Q.president && U.PARTIES[Q.president.party]) res.pres = decide(Q.president.party);
    function tally(label, party, n, v) {
      if (!n) return;
      // a split party: v = { yes: share, no: share, abstain: share }
      if (v && typeof v === 'object') { var parts = U.Electoral.hamilton(v, n, 0); ['yes', 'no', 'abstain'].forEach(function (k) { if (parts[k]) tally(label + (k === 'yes' ? ' (aye)' : k === 'no' ? ' (nay)' : ' (abstaining)'), party, parts[k], k); }); return; }
      res[v] += n; res.by.push({ label: label, party: party, n: n, vote: v });
    }
    Object.keys(seats).forEach(function (p) {
      var n = seats[p];
      if (p === 'cc' || p === 'asp') {
        var al = U.allianceParts(Q, p, n, chamber) || {}; var put = 0;
        for (var ak in al) if (al[ak]) { tally(U.partyInfo(ak).name, p, al[ak], decide(p, ak)); put += al[ak]; }
        if (put < n) tally(U.PARTIES[p].short, p, n - put, decide(p));
      } else if (p === 'ul') {
        var split = U.allianceParts(Q, 'ul', n, chamber) || P.ulSplit(Q, n);
        for (var k in split) tally(U.partyInfo(k).name, 'ul', split[k], decide('ul', k));
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
