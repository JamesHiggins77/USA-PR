// Decks and the hand (Dendry-style card play). Five decks; the player holds
// five cards. Each month the player plays one card or discards one, and the
// month advances. Discarding the whole hand passes a month with no action.
(function (G) {
  'use strict';
  var U = G.USA, S = U.Game, K = U.Content, H = K.H, C = U.Coalition, V = U.Votes, D = U.Decks = {};

  // ---------------- State Politics cards ----------------
  function stateName(id) { return (U.STATES[id] || U.DC).name; }
  function lead2(Q, sid) { var sh = V.stateShares(Q, U.STATES[sid]); var o = Object.keys(sh).sort(function (a, b) { return sh[b] - sh[a]; }); return { sh: sh, order: o }; }
  // states where the LDP is first or second and the top two are close
  function battlegrounds(Q) {
    return Object.keys(U.STATES).map(function (sid) { var l = lead2(Q, sid), i = l.order.indexOf(Q.player); if (i < 0 || i > 1) return null;
      return { sid: sid, gap: Math.abs(l.sh[l.order[0]] - l.sh[l.order[1]]), rival: l.order[i === 0 ? 1 : 0], weight: U.STATES[sid].pop }; })
      .filter(Boolean).sort(function (a, b) { return (a.gap - b.gap) - (b.weight - a.weight) * 0.05; }).slice(0, 6);
  }
  function addStateMod(Q, p, sid, v, reason) {
    var before = V.national(Q)[Q.player];
    Q.stateMods[p] = Q.stateMods[p] || {}; Q.stateMods[p][sid] = (Q.stateMods[p][sid] || 0) + v * (Q.cardBoost || 1);
    if (reason) Q.causes[reason] = (Q.causes[reason] || 0) + V.national(Q)[Q.player] - before;
  }

  K.CARDS.push(
    { id: 'state_tour', title: 'Campaign in a battleground state', tag: 'State',
      body: function (Q) { return 'Where the LDP is in a close race for first place, a sustained local campaign can flip runoffs, a governorship and Senate appointments. Costs 1.'; },
      options: function (Q) { return battlegrounds(Q).map(function (b) {
        return { label: stateName(b.sid), sub: 'Gap with the ' + U.PARTIES[b.rival].short + ': ' + b.gap.toFixed(1) + ' points. Costs 1.', cond: function (Q) { return H.funds(Q, 1); },
          act: function (Q) { H.spend(Q, 1); addStateMod(Q, Q.player, b.sid, 2.5, 'State campaigns'); return 'Weeks of town halls and local radio across ' + stateName(b.sid) + '. The local polls tighten.'; } };
      }); } },

    { id: 'gov_project', title: 'A project with an LDP governor', tag: 'State',
      cond: function (Q) { return Object.keys(Q.states).some(function (s) { return Q.states[s].governor === Q.player; }); },
      body: function (Q) { return 'LDP governors want something to show their voters. ' + (S.inGov(Q) ? 'As a governing party, the LDP can steer federal money to them, but partners will call it pork.' : 'In opposition, the party can only lend its national figures and its organisation.'); },
      options: function (Q) { return Object.keys(Q.states).filter(function (s) { return Q.states[s].governor === Q.player; })
        .sort(function (a, b) { return U.STATES[b].pop - U.STATES[a].pop; }).slice(0, 6).map(function (sid) {
          return { label: stateName(sid), sub: S.inGov(Q) ? 'Federal grant: strong local boost; deficit up slightly; partners grumble.' : 'Joint campaign with the governor: modest boost.',
            act: function (Q) { if (S.inGov(Q)) { addStateMod(Q, Q.player, sid, 3, 'Projects with LDP governors'); Q.spending = (Q.spending || 0) + 0.05; Q.gov.coalition.forEach(function (p) { if (p !== Q.player) H.rel(Q, p, -2); }); return 'A new transit line, a hospital wing and a ribbon-cutting with the Governor of ' + stateName(sid) + '.'; }
              addStateMod(Q, Q.player, sid, 1.5, 'Projects with LDP governors'); Q.morale += 2; return 'The Governor of ' + stateName(sid) + ' and the national leadership tour the state together.'; } };
        }); } },

    { id: 'appointment', title: 'Senate appointment talks', tag: 'State',
      cond: function (Q) { return D.appointmentTargets(Q).length > 0; },
      body: function (Q) { return 'Where no party controls a state chamber, the senator it appoints is up for negotiation. A deal with the chamber’s other parties could put a Liberal Democrat in the U.S. Senate.'; },
      options: function (Q) { return D.appointmentTargets(Q).map(function (t) {
        return { label: stateName(t.sid) + ' state ' + t.chamber + ' (now ' + U.PARTIES[t.seat.party].short + ')', sub: 'LDP holds ' + t.mine + ' of ' + t.total + ' seats. Partner needed: ' + U.PARTIES[t.partner].short + ' (relations ' + Math.round(C.rel(Q, Q.player, t.partner)) + '). Chance about ' + Math.round(t.p * 100) + '%.',
          act: function (Q) {
            if (U.rng(Q) < t.p) { var old = t.seat.party; t.seat.party = Q.player; H.rel(Q, t.partner, -4); C.addRel(Q, Q.player, old, -6);
              Q.pendingConcessions = (Q.pendingConcessions || []).concat([{ party: t.partner, id: 'local', text: 'State projects for the ' + U.PARTIES[t.partner].short + ' in ' + stateName(t.sid), due: S.now(Q) + 12 }]);
              return 'The ' + U.PARTIES[t.partner].short + ' votes with the LDP. ' + stateName(t.sid) + '’s state ' + t.chamber + ' appoints a Liberal Democrat to the U.S. Senate. The price: a promise of state projects.'; }
            H.rel(Q, t.partner, -3); return 'The talks fail. The ' + U.PARTIES[t.partner].short + ' takes a better offer, and the seat stays with the ' + U.PARTIES[t.seat.party].short + '.'; } };
      }); } },

    { id: 'regional_deal', title: 'A deal with a regionalist party', tag: 'State',
      body: function (Q) { return 'Regionalist parties are small nationally but can be pivotal in a close parliament, and they control votes in state legislatures. Not all of them want independence: most want money and powers.'; },
      options: function (Q) { return ['lsp', 'srp', 'aga', 'cnp', 'cfc', 'nenp', 'alk', 'raza'].filter(function (p) { return !Q.dormant[p]; }).map(function (p) {
        var f = { lsp: { civil: 4, heartland: -2 }, srp: { civil: 14, proglib: 6 }, aga: { heartland: -2 }, cnp: { newdem: 3 }, cfc: { proglib: 2 }, nenp: {}, alk: { proglib: 2 }, raza: { civil: -4, heartland: 3 } }[p];
        return { label: U.PARTIES[p].name + ' (relations ' + Math.round(C.rel(Q, Q.player, p)) + ')', sub: 'Promise ' + C.demandsOf(p)[0].text.toLowerCase() + '. ' + (p === 'srp' ? 'The Civil Rights Caucus will be furious.' : ''),
          act: function (Q) { H.rel(Q, p, 14); H.fac(Q, f); Q.pendingConcessions = (Q.pendingConcessions || []).concat([{ party: p, id: C.demandsOf(p)[0].id, text: C.demandsOf(p)[0].text + ' (' + U.PARTIES[p].short + ')', due: S.now(Q) + 15 }]);
            return 'The ' + U.PARTIES[p].short + ' leadership shakes on it. Their votes will be easier to find, as long as the promise is kept.'; } };
      }); } },

    { id: 'fed_dispute', title: 'A federal–state dispute', tag: 'State',
      body: function (Q) { var i = D.disputeIssue(Q); return i.text; },
      options: function (Q) { var i = D.disputeIssue(Q); return [
        { label: 'Back the states', sub: 'Moves the LDP toward devolution. Regional parties approve. ' + i.statesSub, act: function (Q) { H.shift(Q, 0, 0, 1); U.REGIONAL.forEach(function (p) { C.addRel(Q, Q.player, p, 3); }); H.fac(Q, i.statesFac); H.camp(Q, i.statesGroups, 'Federal–state disputes'); Q.seen['dispute_' + i.id] = 1; return i.statesText; } },
        { label: 'Back federal authority', sub: 'Moves the LDP toward the centre. Regionalists object. ' + i.fedSub, act: function (Q) { H.shift(Q, 0, 0, -1); U.REGIONAL.forEach(function (p) { C.addRel(Q, Q.player, p, -3); }); H.fac(Q, i.fedFac); H.camp(Q, i.fedGroups, 'Federal–state disputes'); Q.seen['dispute_' + i.id] = 1; return i.fedText; } }
      ]; } },

    { id: 'gov_recruit', title: 'Recruit a candidate for governor', tag: 'State',
      body: function () { return 'A strong candidate can win a governorship, and with it a Senate appointment. Costs 1.'; },
      options: function (Q) { return battlegrounds(Q).filter(function (b) { return Q.states[b.sid].governor !== Q.player; }).slice(0, 5).map(function (b) {
        return { label: stateName(b.sid) + ' (governor: ' + U.PARTIES[Q.states[b.sid].governor].short + ')', sub: 'Costs 1. Lasting boost in the state.', cond: function (Q) { return H.funds(Q, 1); },
          act: function (Q) { H.spend(Q, 1); addStateMod(Q, Q.player, b.sid, 1.8, 'State campaigns'); Q.govCandidates = Q.govCandidates || {}; Q.govCandidates[b.sid] = 1; return 'A popular local figure agrees to run for Governor of ' + stateName(b.sid) + ' as a Liberal Democrat.'; } };
      }); } }
  );

  // ---- regional stand-down agreements ----
  var SD_DEALS = [
    { partner: 'sdlp', mine: 'midwest', theirs: 'pacific', need: 60, fac: { proglib: -3, newdem: 4 }, text: 'Extend the deal with the SDLP: it stands aside in the Pacific states, the LDP in the wider Midwest' },
    { partner: 'cdp', mine: 'plains', theirs: 'neatlantic', need: 55, fac: { proglib: 8, newdem: -4, heartland: -3 }, text: 'A deal with the CDP: it stands aside in New England and the Atlantic, the LDP on the Plains' },
    { partner: 'grn', mine: null, theirs: 'rustbelt', need: 50, fac: { newdem: 6, proglib: -3 }, conc: 'climate', text: 'Ask the Greens to stand aside in the Rust Belt, for a climate pledge' },
    { partner: 'ul', mine: null, theirs: 'rustbelt', need: 50, fac: { newdem: 8, proglib: -3 }, conc: 'climate', text: 'Ask the United Left to stand aside in the Rust Belt, for a climate pledge' },
    { partner: 'reform', mine: null, theirs: 'midwest', need: 55, fac: { heartland: -2 }, conc: 'transfers', text: 'Ask Reform to stand aside in the Midwest, for regional investment' },
    { partner: 'aga', mine: 'mountain', theirs: 'pacific', need: 55, fac: { heartland: 2 }, text: 'A deal with the AGA: its chapters stand aside in the Pacific states, the LDP in the Mountain West' }
  ];
  D.pactsOf = function (Q, p) { var o = {}; (Q.standDowns || []).forEach(function (a) { if (a.party === p || a.partner === p) o[a.pact] = true; }); return Object.keys(o); };
  K.CARDS.push({ id: 'standdown', title: 'Regional electoral agreements', tag: 'Coalition', cond: function () { return !U.pure(); },
    body: function (Q) {
      var mine = (Q.standDowns || []).filter(function (a) { return a.party === Q.player || a.partner === Q.player; });
      return 'Parties can agree not to field district candidates in each other’s regions, so their voters stop splitting. Voters do not follow perfectly: about 70% go to the partner. Current LDP agreements: ' +
        (mine.length ? mine.map(function (a) { return U.PARTIES[a.party].short + ' stands aside in ' + U.Elections.REGION_NAMES[a.region]; }).join('; ') : 'none') + '.';
    },
    options: function (Q) {
      var opts = SD_DEALS.filter(function (d) { return !Q.dormant[d.partner] && !(Q.standDowns || []).some(function (a) { return a.party === d.partner && a.region === d.theirs; }); }).map(function (d) {
        return { label: d.text, sub: 'Needs relations ' + d.need + '+ with the ' + U.PARTIES[d.partner].short + '.',
          cond: function (Q) { var r = C.rel(Q, Q.player, d.partner); return r >= d.need ? true : 'The ' + U.PARTIES[d.partner].short + ' will not agree (relations ' + Math.round(r) + ').'; },
          act: function (Q) {
            var pact = Q.player + '-' + d.partner + '-' + S.now(Q);
            Q.standDowns.push({ party: d.partner, partner: Q.player, region: d.theirs, pact: pact });
            if (d.mine) Q.standDowns.push({ party: Q.player, partner: d.partner, region: d.mine, pact: pact });
            if (d.conc) Q.pendingConcessions = (Q.pendingConcessions || []).concat([{ party: d.partner, id: d.conc, text: C.demandsOf(d.partner).filter(function (x) { return x.id === d.conc; })[0].text + ' (stand-down deal)', due: S.now(Q) + 18 }]);
            H.fac(Q, d.fac); H.rel(Q, d.partner, 3);
            // existing partners of the other party resent it
            D.pactsOf(Q, d.partner).forEach(function (pk) { (Q.standDowns || []).forEach(function (a) { if (a.pact === pk && a.party !== d.partner && a.party !== Q.player) C.addRel(Q, a.party, d.partner, -5); }); });
            return 'The agreement is signed. Local branches that lose their candidates are not happy, but the arithmetic is better.';
          } };
      });
      D.pactsOf(Q, Q.player).forEach(function (pk) {
        var a = Q.standDowns.filter(function (x) { return x.pact === pk; }), other = a[0].party === Q.player ? a[0].partner : a[0].party;
        opts.push({ label: 'End the agreement with the ' + U.PARTIES[other].short, sub: 'The LDP runs everywhere again. Relations suffer; activists cheer.',
          act: function (Q) { Q.standDowns = Q.standDowns.filter(function (x) { return x.pact !== pk; }); H.rel(Q, other, -12); Q.morale += 5; return 'The LDP will contest every district. The ' + U.PARTIES[other].short + ' calls it a betrayal.'; } });
      });
      return opts;
    } });

  D.appointmentTargets = function (Q) {
    var out = [];
    Object.keys(U.STATES).forEach(function (sid) {
      var sg = Q.states[sid]; if (!sg || U.STATES[sid].unicameral) return;
      [['house', 'house'], ['senate', 'senate']].forEach(function (c) {
        var seats = sg[c[0]], tot = U.sum(seats), mine = seats[Q.player] || 0;
        var seat = Q.senateSeats.filter(function (x) { return x.state === sid && x.type === c[1]; })[0];
        if (!seat || seat.party === Q.player || mine / tot < 0.2) return;
        if (Object.keys(seats).some(function (p) { return seats[p] * 2 > tot; })) return;
        var partners = Object.keys(seats).filter(function (p) { return p !== Q.player && p !== seat.party && seats[p] && !U.vetoes(p, Q.player); })
          .sort(function (a, b) { return seats[b] - seats[a]; });
        var partner = partners.filter(function (p) { return (mine + seats[p]) * 2 > tot; })[0] || partners[0];
        if (!partner) return;
        var reach = (mine + seats[partner]) * 2 > tot ? 1 : 0.5;
        var p = U.clamp(reach * (0.25 + C.rel(Q, Q.player, partner) / 140 + C.compat(Q, Q.player, partner) * 0.25), 0.05, 0.9);
        out.push({ sid: sid, chamber: c[0], seat: seat, mine: mine, total: tot, partner: partner, p: p });
      });
    });
    return out.sort(function (a, b) { return b.p - a.p; }).slice(0, 5);
  };

  D.ISSUES = [
    { id: 'tx', text: 'Texas demands control of federal royalties from its oil and gas fields. The Lone Star Party is watching your answer.', statesSub: 'LSP pleased; Civil Rights Caucus uneasy.', fedSub: 'LSP hardliners gain.',
      statesFac: { civil: 3 }, fedFac: { heartland: 2 }, statesGroups: { rural: 0.3 }, fedGroups: { prof: 0.2 }, statesText: 'Texas gets a larger share of royalties. The LSP calls it a start.', fedText: 'The royalties stay federal. The LSP fills a stadium in Houston.' },
    { id: 'imm', text: 'Arizona and California clash with Washington over who enforces immigration law.', statesSub: 'Hispanic voters and the Civil Rights Caucus wary.', fedSub: 'Rural voters unhappy.',
      statesFac: { civil: 6 }, fedFac: { heartland: 4 }, statesGroups: { rural: 0.3, hisp: -0.5 }, fedGroups: { hisp: 0.5, rural: -0.3 }, statesText: 'States get more say over enforcement. Immigrant groups protest.', fedText: 'Enforcement stays federal. Border-state legislators complain.' },
    { id: 'edu', text: 'Several states refuse new federal education standards attached to school funding.', statesSub: 'Popular in rural areas.', fedSub: 'Teachers’ unions pleased.',
      statesFac: { proglib: 4 }, fedFac: { heartland: 4 }, statesGroups: { rural: 0.4, relig: 0.2 }, fedGroups: { union: 0.3, prof: 0.2 }, statesText: 'States can opt out of the standards and keep most of the money.', fedText: 'The standards stay, with the money attached.' },
    { id: 'env', text: 'Coal and oil states challenge federal environmental rules in court.', statesSub: 'Coal country grateful; Greens furious.', fedSub: 'Green voters approve.',
      statesFac: { proglib: 6 }, fedFac: { heartland: 5 }, statesGroups: { rural: 0.4, union: 0.2, young: -0.4 }, fedGroups: { young: 0.4, prof: 0.3, rural: -0.4 }, statesText: 'The LDP backs flexibility for the states. Environmental groups call it a betrayal.', fedText: 'The LDP defends the federal rules. West Virginia and Wyoming are not pleased.' },
    { id: 'police', text: 'The Justice Department wants oversight of police departments in several cities; state attorneys general object.', statesSub: 'Civil Rights Caucus angry.', fedSub: 'Black voters and the Civil Rights Caucus approve.',
      statesFac: { civil: 10 }, fedFac: { civil: -6, heartland: 3 }, statesGroups: { suburb: 0.2, black: -0.6 }, fedGroups: { black: 0.6, suburb: -0.2 }, statesText: 'Policing stays a state matter.', fedText: 'Federal oversight goes ahead in four cities.' }
  ];
  D.disputeIssue = function (Q) {
    var open = D.ISSUES.filter(function (i) { return !Q.seen['dispute_' + i.id]; });
    var list = open.length ? open : D.ISSUES;
    return list[(Q.year * 12 + Q.month) % list.length];
  };

  // ---------------- decks ----------------
  D.DECKS = {
    national: { name: 'National Politics', cards: [['interview', 3], ['ads', 2], ['platform', 2], ['bill', 3], ['noconf', 1]] },
    party: { name: 'Party Politics', cards: [['funds', 3], ['faction', 3], ['whip', 2], ['candidates', 2], ['organise', 2]] },
    state: { name: 'State Politics', cards: [['state_tour', 3], ['gov_project', 2], ['appointment', 2], ['regional_deal', 2], ['fed_dispute', 2], ['gov_recruit', 1]] },
    coalition: { name: 'Coalition & Government', cards: [['court', 3], ['pact', 2], ['standdown', 2], ['summit', 2], ['budget', 1], ['dissolve', 1]] },
    campaign: { name: 'Campaign', cards: [['rally', 3], ['debate', 1], ['gotv', 3], ['ads', 1]] }
  };
  D.ORDER = ['national', 'party', 'state', 'coalition', 'campaign'];
  D.HAND = 5;
  D.card = function (id) { return K.CARDS.filter(function (c) { return c.id === id; })[0]; };
  D.deckOf = function (Q, cardRef) { return cardRef.deck; };

  function shuffle(Q, a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(U.rng(Q) * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  D.init = function (Q) {
    Q.decks = {};
    D.ORDER.forEach(function (d) {
      var pile = []; D.DECKS[d].cards.forEach(function (c) { for (var i = 0; i < c[1]; i++) pile.push(c[0]); });
      Q.decks[d] = { draw: shuffle(Q, pile), discard: [] };
    });
    Q.hand = [null, null, null, null, null];
  };

  function playable(Q, id) { var c = D.card(id); return c && (!c.cond || c.cond(Q)) && D.hasOptions(Q, c); }
  D.hasOptions = function (Q, c) { var o = typeof c.options === 'function' ? c.options(Q) : c.options; return o && o.length > 0; };
  D.inHand = function (Q, id) { return Q.hand.some(function (h) { return h && h.id === id; }); };

  // Draw the first card of a deck that is playable now and not already held.
  D.canDraw = function (Q, d) {
    var dk = Q.decks[d], all = dk.draw.concat(dk.discard);
    return all.some(function (id) { return playable(Q, id) && !D.inHand(Q, id); }) ? true : (d === 'campaign' && !Q.electionAt ? 'No campaign cards are useful outside an election.' : 'Nothing in this deck is useful right now.');
  };
  D.draw = function (Q, d, slot) {
    if (Q.hand[slot]) return null;
    var dk = Q.decks[d];
    for (var pass = 0; pass < 2; pass++) {
      for (var i = 0; i < dk.draw.length; i++) {
        var id = dk.draw[i];
        if (playable(Q, id) && !D.inHand(Q, id)) { dk.draw.splice(i, 1); Q.hand[slot] = { id: id, deck: d }; return id; }
      }
      if (pass === 0) { dk.draw = dk.draw.concat(shuffle(Q, dk.discard)); dk.discard = []; }
    }
    return null;
  };
  // draw from a deck into the first empty slot
  D.drawAny = function (Q, d) { var i = Q.hand.indexOf(null); return i < 0 ? null : D.draw(Q, d, i); };
  D.handFull = function (Q) { return Q.hand.every(Boolean); };
  // the player may act once every empty slot is filled or nothing can be drawn
  D.ready = function (Q) { return Q.hand.every(function (h) { return h; }) || !D.ORDER.some(function (d) { return D.canDraw(Q, d) === true; }); };
  D.toDiscard = function (Q, slot) { var h = Q.hand[slot]; if (!h) return; Q.decks[h.deck].discard.push(h.id); Q.hand[slot] = null; };
})(typeof globalThis !== 'undefined' ? globalThis : window);
