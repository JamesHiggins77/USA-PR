// Events from the LDP's position. Policy events are decided by the Prime
// Minister's party: if that is the LDP it chooses; as a junior coalition
// partner or a confidence-and-supply partner it can back the cabinet, press
// for another course (with a chance based on its leverage) or break ranks /
// withdraw support; in opposition the government acts and the LDP only picks
// its stance.
// Each wrapped event's original options are read two ways: their policy
// effects (economy, flags, approval: run with Q._policyOnly, which mutes the
// LDP's own voter, faction and relation effects) and their stance effects
// (run with Q._stanceOnly, which mutes the government's policy effects).
(function (G) {
  'use strict';
  var U = G.USA, C = U.Coalition, S = U.Game, K = U.Content, H = K.H, Ev = U.Events, V = U.Votes;

  S.role = function (Q) {
    var g = Q.gov; if (!g || !Q.player) return 'opposition';
    if (g.pmParty === Q.player) return 'pm';
    if (g.coalition.indexOf(Q.player) >= 0) return 'junior';
    if (g.cs.indexOf(Q.player) >= 0) return 'support';
    return 'opposition';
  };
  // does a policy take effect in this call (the government enacting it)?
  S.policyGov = function (Q) { return !!Q._policyOnly || (S.inGov(Q) && !Q._stanceOnly); };

  // mute the LDP's own effects while a government decision is applied
  ['camp', 'fac', 'rel', 'shift', 'region', 'str'].forEach(function (k) {
    var f = H[k]; H[k] = function (Q) { if (Q && Q._policyOnly) return; return f.apply(H, arguments); };
  });

  var short = function (p) { return (U.PARTIES[p] || {}).short || p; };
  var left = function (Q, p) { var x = (Q.pos && Q.pos[p]) || U.PARTIES[p] || { econ: 0 }; return x.econ; };
  var hawkish = function (p) { return ((U.PARTY_PROFILES[p] || { ax: {} }).ax.foreign || 0) > 3; };
  var labelOf = function (Q, o) { return typeof o.label === 'function' ? o.label(Q) : o.label; };

  function roleify(id, aiPick) {
    var e = Ev.byId(id); if (!e || typeof e.options === 'function') return;
    var orig = e.options, body = e.body;
    var pick = function (Q) { var k = 'ai_' + id; if (Q.flags[k] == null) Q.flags[k] = Math.max(0, Math.min(orig.length - 1, aiPick(Q, Q.gov ? Q.gov.pmParty : 'cc'))); return Q.flags[k]; };
    var policy = function (Q, i) { Q._policyOnly = true; try { orig[i].act(Q); } finally { Q._policyOnly = false; } };
    var stance = function (Q, i) { Q._stanceOnly = true; try { return orig[i].act(Q); } finally { Q._stanceOnly = false; } };
    var full = function (Q, i) { return orig[i].act(Q); };
    e.body = function (Q) {
      var r = S.role(Q), b = body(Q), g = Q.gov;
      if (r === 'pm') return b + ' <b>As the governing party, the LDP decides.</b>';
      var k = pick(Q), gl = labelOf(Q, orig[k]).toLowerCase();
      if (r === 'junior') return b + ' <b>The cabinet, led by ' + g.pm + ' (' + short(g.pmParty) + '), favours: ' + gl + '.</b> As a junior partner the LDP can back it, press for another course, or break ranks.';
      if (r === 'support') return b + ' <b>The government of ' + g.pm + ' (' + short(g.pmParty) + ') favours: ' + gl + '.</b> It relies on LDP votes: the LDP can back it, make another course the price of its support, or withdraw support.';
      return b + ' <b>The government of ' + (g ? g.pm + ' (' + short(g.pmParty) + ')' : 'the day') + ' has decided: ' + gl + '.</b> In opposition, the LDP can only choose its response.';
    };
    e.options = function (Q) {
      var r = S.role(Q); if (r === 'pm') return orig;
      var k = pick(Q), g = Q.gov, kl = labelOf(Q, orig[k]);
      var others = orig.map(function (o, i) { return i; }).filter(function (i) { return i !== k; });
      if (r === 'opposition') {
        return [{ label: 'Back the government’s response', sub: kl, act: function (Q) { full(Q, k); return 'The government goes ahead (' + kl.toLowerCase() + '), and the LDP supports it.'; } }]
          .concat(others.map(function (j) { var jl = labelOf(Q, orig[j]); return { label: 'Call for another course: ' + jl.toLowerCase(), sub: orig[j].sub, act: function (Q) { policy(Q, k); stance(Q, j); return 'The government goes ahead (' + kl.toLowerCase() + '). The LDP argues instead: ' + jl.toLowerCase() + '.'; } }; }));
      }
      var mine = C.seats(Q, [Q.player]), all = Math.max(1, (S.govSeats && S.govSeats(Q)) || C.seats(Q, g.coalition));
      var p = U.clamp(0.2 + 0.9 * mine / all + (r === 'support' ? 0.1 : 0), 0.15, 0.75);
      var opts = [{ label: 'Back the cabinet’s line: ' + kl.toLowerCase(), sub: orig[k].sub, act: function (Q) { C.addRel(Q, Q.player, g.pmParty, 3); return 'The LDP backs the government. ' + full(Q, k); } }];
      others.forEach(function (j) {
        var jl = labelOf(Q, orig[j]);
        opts.push({ label: (r === 'support' ? 'Make it the price of support: ' : 'Press the cabinet for: ') + jl.toLowerCase(), sub: 'About ' + Math.round(p * 100) + '% chance the ' + short(g.pmParty) + ' gives way.', act: function (Q) {
          if (U.rng(Q) < p) { C.addRel(Q, Q.player, g.pmParty, -2); return 'The ' + short(g.pmParty) + ' gives way. ' + full(Q, j); }
          C.addRel(Q, Q.player, g.pmParty, -4); policy(Q, k); stance(Q, j); return 'The ' + short(g.pmParty) + ' holds firm (' + kl.toLowerCase() + '). The LDP’s objection is on the record.'; } });
      });
      if (r === 'junior') opts.push({ label: 'Break ranks: vote against the cabinet', sub: 'Strains the coalition.', act: function (Q) {
        policy(Q, k); C.addRel(Q, Q.player, g.pmParty, -10); Q.unity = (Q.unity || 50) + 2; H.camp(Q, V.all(0.05), 'Breaking ranks');
        return 'LDP ministers vote against their own government. The ' + short(g.pmParty) + ' is furious; the coalition survives, for now.'; } });
      else opts.push({ label: 'Withdraw support from the government', sub: 'The government loses its majority.', act: function (Q) {
        policy(Q, k); C.addRel(Q, Q.player, g.pmParty, -10); g.cs = g.cs.filter(function (x) { return x !== Q.player; });
        S.note(Q, 'The LDP withdraws its confidence-and-supply support from ' + g.pm + '’s government.');
        return 'The LDP withdraws its support. ' + g.pm + ' now leads a minority government.'; } });
      return opts;
    };
  }

  // AI choices: which option a government led by party p takes
  roleify('kyoto', function (Q, p) { return left(Q, p) < -1 ? 0 : left(Q, p) < 3 ? 1 : 2; });
  roleify('bust_response', function (Q, p) { return left(Q, p) < 1 ? 0 : 1; });
  roleify('california_power', function (Q, p) { return (U.PARTIES[p] || {}).fed > 3 ? 1 : 0; });
  roleify('texas', function (Q, p) { return Q.house.lsp >= 10 && ((U.PARTIES[p] || {}).econ > 2) ? 0 : 1; });
  roleify('security', function (Q, p) { return hawkish(p) || left(Q, p) > 0 ? 0 : 1; });
  roleify('afghanistan', function (Q, p) { return hawkish(p) ? 0 : left(Q, p) > -6 ? 1 : 2; });
  roleify('enron', function (Q, p) { return left(Q, p) < 2 ? 0 : 1; });
  roleify('housing', function (Q, p) { return left(Q, p) < -3 && U.rng(Q) < 0.6 ? 0 : 1; });
  roleify('stimulus', function (Q, p) { return left(Q, p) < -1 ? 0 : left(Q, p) < 7 ? 1 : 2; });
  roleify('autos', function (Q, p) { return left(Q, p) < 5 ? 0 : 1; });
  roleify('deepwater', function (Q, p) { return left(Q, p) < 0 ? 0 : 1; });
  roleify('arabspring', function (Q, p) { return hawkish(p) || left(Q, p) < 0 ? 0 : 1; });
})(typeof globalThis !== 'undefined' ? globalThis : window);
