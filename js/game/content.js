// Action cards (the player's monthly hand, Dendry-style). Each choice costs
// one action unless marked free. Effects are small and explained.
(function (G) {
  'use strict';
  var U = G.USA, V = U.Votes, C = U.Coalition, S = U.Game, K = U.Content = {};

  // ---- effect helpers ----
  var H = K.H = {
    camp: function (Q, groups, reason) { V.campaign(Q, Q.player, groups, reason); },
    other: function (Q, p, groups) { V.campaign(Q, p, groups, null); },
    fac: function (Q, o) { for (var k in o) Q.factions[k].dissent = U.clamp(Q.factions[k].dissent + o[k], 0, 100); },
    str: function (Q, o) { for (var k in o) Q.factions[k].strength = U.clamp(Q.factions[k].strength + o[k], 5, 70); },
    rel: function (Q, p, d) { C.addRel(Q, Q.player, p, d); },
    shift: function (Q, e, s) { var P = Q.pos[Q.player]; P.econ = U.clamp(P.econ + e, -10, 10); P.soc = U.clamp(P.soc + s, -10, 10); },
    region: function (Q, reg, v, reason) {
      var before = V.national(Q)[Q.player];
      Q.stateMods[Q.player] = Q.stateMods[Q.player] || {};
      for (var sid in U.STATES) if (U.STATES[sid].region === reg) Q.stateMods[Q.player][sid] = (Q.stateMods[Q.player][sid] || 0) + v;
      Q.causes[reason] = (Q.causes[reason] || 0) + V.national(Q)[Q.player] - before;
    },
    funds: function (Q, n) { return Q.funds >= n ? true : 'Not enough party funds (need ' + n + ').'; },
    spend: function (Q, n) { Q.funds = U.round1(Q.funds - n); },
    era: function (Q) { return Q.year < 2004 ? 0 : Q.year < 2010 ? 1 : 2; } // media era: TV / web / social
  };
  K.player = function (Q) { return U.PARTIES[Q.player].short; };

  var REG_OPTS = ['NE', 'MA', 'SO', 'MW', 'PL', 'MT', 'PC', 'TX'];

  K.CARDS = [
    { id: 'interview', title: 'A prime-time interview', tag: 'Media', cooldown: 2,
      body: function (Q) { return 'The networks want ' + Q.leader.name + ' on the Sunday shows' + (H.era(Q) >= 1 ? ', and the political blogs will dissect every word.' : '.') + ' What is the message?'; },
      options: [
        { label: 'Prosperity and competence', sub: 'Suburban, retired and professional voters. Pleases the New Democrats.',
          act: function (Q) { H.camp(Q, { suburb: 0.8, retire: 0.6, prof: 0.5 }, 'Interviews'); H.fac(Q, { newdem: -4, proglib: 2 });
            if (S.inGov(Q) && Q.econ.growth > 3) { H.camp(Q, { suburb: 0.4 }, 'Interviews'); return 'With growth above 3%, the message lands. Viewers credit the LDP, not just the coalition.'; }
            return 'Viewers ask whose competence this is. The coalition shares the credit.'; } },
        { label: 'Social justice and civil rights', sub: 'Black, Hispanic and young voters. Pleases the Civil Rights Caucus.',
          act: function (Q) { H.camp(Q, { black: 0.9, hisp: 0.7, young: 0.4 }, 'Interviews'); H.fac(Q, { civil: -5, heartland: 2 }); H.shift(Q, -0.2, -0.2); return 'A strong performance. Some Heartland Liberals think it was aimed at somebody else’s voters.'; } },
        { label: 'Take on the Greens', sub: 'Argue a Green vote is a wasted vote. Costs relations with the United Left.',
          act: function (Q) { var k = Q.flags.naderSurge ? 1 : 0.5; H.camp(Q, { young: 0.4 * k, prof: 0.5 * k }, 'Attacks on the Greens'); H.other(Q, 'ul', { young: -0.6 * k, prof: -0.4 * k }); H.rel(Q, 'ul', -8); H.fac(Q, { proglib: 3, newdem: -2 }); return 'Nader replies that the LDP is the reason people vote Green. Some young viewers agree with him; more agree with you.'; } },
        { label: 'Take on the Conservative Coalition', sub: 'Draw a clear line with the main right-wing alternative.',
          act: function (Q) { H.camp(Q, { suburb: 0.5, prof: 0.4, black: 0.3 }, 'Attacks on the CC'); H.other(Q, 'cc', { suburb: -0.4 }); H.rel(Q, 'cc', -6); H.rel(Q, 'cdp', -2); return 'The CC accuses you of fear-mongering. The CDP, which sits in cabinet with you and courts the same suburbs, says nothing.'; } }
      ] },

    { id: 'rally', title: 'A rally', tag: 'Campaign', cooldown: 2,
      body: function (Q) { return 'The hall is booked. Where does ' + Q.leader.name + ' speak? A big rally costs 1 in party funds.'; },
      options: REG_OPTS.map(function (r) {
        return { label: U.REGIONS[r], sub: 'Lifts the LDP in ' + U.REGIONS[r] + '. Costs 1.',
          cond: function (Q) { return H.funds(Q, 1); },
          act: function (Q) { H.spend(Q, 1); H.region(Q, r, Q.electionAt ? 0.9 : 0.5, 'Rallies'); Q.morale += 2;
            return 'A packed hall in ' + U.REGIONS[r] + '. Local press coverage is good.'; } };
      }) },

    { id: 'ads', title: 'An advertising campaign', tag: 'Campaign', cooldown: 2,
      body: function (Q) { return ['Television airtime is expensive but reaches everyone.', 'Television still dominates, but online ads are cheaper and reach younger voters.', 'Social-media ads can be targeted precisely, and can backfire publicly.'][H.era(Q)] + ' Who is the target?'; },
      options: U.GROUPS.map(function (g) {
        return { label: U.GROUP_NAMES[g], sub: 'Costs 2.', cond: function (Q) { return H.funds(Q, 2); },
          act: function (Q) { H.spend(Q, 2); var o = {}; var eff = 1.2 * (g === 'young' && H.era(Q) >= 1 ? 1.5 : 1) * (Q.electionAt ? 1.4 : 1);
            if (H.era(Q) === 2 && U.rng(Q) < 0.15) { o[g] = -0.6; H.camp(Q, o, 'Advertising'); return 'An ad goes viral for the wrong reasons. Opponents share it more than you do.'; }
            o[g] = eff; H.camp(Q, o, 'Advertising'); return 'The campaign runs for three weeks. Focus groups say it was noticed.'; } };
      }) },

    { id: 'funds', title: 'Fundraising', tag: 'Party', cooldown: 2,
      body: function (Q) { return 'The treasurer reports ' + Q.funds.toFixed(1) + ' in the war chest. How do you raise more?'; },
      options: [
        { label: 'A dinner with major donors', sub: '+3 funds. The Progressive Liberals dislike it.', act: function (Q) { Q.funds += 3; H.fac(Q, { proglib: 5, newdem: -2 }); if (U.rng(Q) < 0.08) { Q.scandal = (Q.scandal || 0) + 3; H.camp(Q, V.all(-0.3), 'Donor controversy'); return 'A reporter publishes the guest list. Questions follow about access.'; } return 'Wall Street and Silicon Valley are generous this year.'; } },
        { label: 'Small donors and the membership', sub: function (Q) { return '+' + (H.era(Q) >= 1 ? 2.5 : 1.5) + ' funds. Raises morale.'; }, act: function (Q) { Q.funds += H.era(Q) >= 1 ? 2.5 : 1.5; Q.morale += 3; return H.era(Q) >= 1 ? 'The online appeal outperforms the direct-mail campaign.' : 'The envelopes come in slowly, but they come in.'; } },
        { label: 'Union political funds', sub: '+2 funds. Pulls the party toward labor; the SDLP notices.', act: function (Q) { Q.funds += 2; H.shift(Q, -0.3, 0); H.rel(Q, 'sdlp', -3); H.fac(Q, { newdem: 3, proglib: -2 }); return 'The unions give, and they will remember.'; } }
      ] },

    { id: 'platform', title: 'Policy platform', tag: 'Party', cooldown: 4,
      body: function (Q) { var p = Q.pos[Q.player]; return 'The LDP’s current position: economy ' + p.econ.toFixed(1) + ' (left − / right +), society ' + p.soc.toFixed(1) + ' (liberal − / traditional +). Positions shape coalition compatibility and which voters you reach. What does the next policy paper say?'; },
      options: [
        { label: 'Move left on the economy', sub: 'Closer to the SDLP and United Left. Progressive Liberals pleased; New Democrats not.', act: function (Q) { H.shift(Q, -1, 0); H.camp(Q, { union: 0.6, young: 0.4, prof: -0.3, suburb: -0.2 }, 'Platform changes'); H.fac(Q, { proglib: -6, newdem: 6 }); return 'The paper promises public investment and labor protections.'; } },
        { label: 'Move right on the economy', sub: 'Closer to the CDP. New Democrats pleased; Progressive Liberals not.', act: function (Q) { H.shift(Q, 1, 0); H.camp(Q, { suburb: 0.6, prof: 0.3, union: -0.5, young: -0.2 }, 'Platform changes'); H.fac(Q, { newdem: -6, proglib: 6 }); return 'The paper promises fiscal discipline and lower taxes for small business.'; } },
        { label: 'A bolder socially liberal stance', sub: 'Civil rights and personal freedom. Heartland Liberals uneasy.', act: function (Q) { H.shift(Q, 0, -1); H.camp(Q, { young: 0.6, prof: 0.5, relig: -0.6, rural: -0.3 }, 'Platform changes'); H.fac(Q, { civil: -5, heartland: 6 }); return 'The paper is praised in the cities and burned on talk radio.'; } },
        { label: 'A more traditional social tone', sub: 'Faith and family language. Closer to the CDP and ASP.', act: function (Q) { H.shift(Q, 0, 1); H.camp(Q, { relig: 0.6, rural: 0.4, young: -0.4, prof: -0.3 }, 'Platform changes'); H.fac(Q, { heartland: -6, civil: 4, proglib: 3 }); return 'The paper talks about values. The CDP calls it imitation.'; } }
      ] },

    { id: 'faction', title: 'Meet a faction', tag: 'Party', cooldown: 1,
      body: function (Q) { return 'Each faction wants something. Meeting one costs a little standing with the others.'; },
      options: ['newdem', 'proglib', 'civil', 'heartland'].map(function (k) {
        return { label: function (Q) { return U.LDP_FACTIONS[k].name + ' (' + U.LDP_FACTIONS[k].figure + ')'; },
          sub: function (Q) { return 'Dissent ' + Math.round(Q.factions[k].dissent) + '. Wants: ' + U.LDP_FACTIONS[k].wants + '.'; },
          act: function (Q) { var o = { newdem: 1, proglib: 1, civil: 1, heartland: 1 }; o[k] = -12; H.fac(Q, o); Q.unity += 1; return U.LDP_FACTIONS[k].figure + ' leaves the meeting satisfied, for now.'; } };
      }) },

    { id: 'whip', title: 'Party discipline', tag: 'Party', cooldown: 6,
      body: function () { return 'The whips report grumbling in the parliamentary group. Rebels cost votes on confidence motions and budgets.'; },
      options: [
        { label: 'Crack down on rebels', sub: '+10 unity; the most rebellious faction resents it.', act: function (Q) { Q.unity += 10; var worst = Object.keys(Q.factions).sort(function (a, b) { return Q.factions[b].dissent - Q.factions[a].dissent; })[0]; Q.factions[worst].dissent += 8; return 'The whip’s office is busy. ' + U.LDP_FACTIONS[worst].name + ' complain loudly.'; } },
        { label: 'A members’ conference', sub: 'Costs 1. +4 unity, +5 morale, all factions a little calmer.', cond: function (Q) { return H.funds(Q, 1); }, act: function (Q) { H.spend(Q, 1); Q.unity += 4; Q.morale += 5; H.fac(Q, { newdem: -3, proglib: -3, civil: -3, heartland: -3 }); return 'A weekend of speeches and workshops. Nobody storms out.'; } }
      ] },

    { id: 'candidates', title: 'Candidate recruitment', tag: 'Party', cooldown: 6,
      body: function () { return 'Strong local candidates win runoffs. Recruitment costs money, and the factions want their people.'; },
      options: [
        { label: 'Recruit across the country', sub: 'Costs 2. Small boost everywhere.', cond: function (Q) { return H.funds(Q, 2); }, act: function (Q) { H.spend(Q, 2); REG_OPTS.forEach(function (r) { H.region(Q, r, 0.25, 'Candidate recruitment'); }); return 'A class of mayors, veterans and teachers sign up.'; } },
        { label: 'Target the South and Plains', sub: 'Costs 2. Heartland Liberals pleased.', cond: function (Q) { return H.funds(Q, 2); }, act: function (Q) { H.spend(Q, 2); H.region(Q, 'SO', 0.6, 'Candidate recruitment'); H.region(Q, 'PL', 0.6, 'Candidate recruitment'); H.fac(Q, { heartland: -6, civil: 2 }); return 'Moderate sheriffs and county commissioners agree to run as Liberal Democrats.'; } },
        { label: 'Diverse urban candidates', sub: 'Costs 2. Civil Rights Caucus pleased.', cond: function (Q) { return H.funds(Q, 2); }, act: function (Q) { H.spend(Q, 2); H.camp(Q, { black: 0.6, hisp: 0.6, young: 0.3 }, 'Candidate recruitment'); H.fac(Q, { civil: -6, heartland: 2 }); return 'The new candidates look like the cities they want to represent.'; } }
      ] },

    { id: 'court', title: 'Court another party', tag: 'Coalition', cooldown: 2,
      body: function (Q) { return 'Relations matter in negotiations. Who do you invite for dinner?'; },
      options: ['sdlp', 'cdp', 'asp', 'ul', 'cc', 'aga', 'lsp', 'srp', 'lib'].map(function (p) {
        return { label: function (Q) { return U.PARTIES[p].name + ' (relations ' + Math.round(C.rel(Q, Q.player, p)) + ')'; },
          sub: { sdlp: 'Progressive Liberals approve.', cdp: 'New Democrats and Heartland approve; Progressive Liberals do not.', asp: 'Heartland Liberals approve.', ul: 'Progressive Liberals approve; New Democrats appalled.', cc: 'Most factions are uneasy.', aga: 'A federation: its state parties bargain separately.', lsp: 'The Texas regionalists want resource rights. Civil Rights Caucus uneasy.', srp: 'The Civil Rights Caucus will be furious.', lib: 'New Democrats curious.' }[p],
          act: function (Q) {
            H.rel(Q, p, 7 + Math.round(U.rng(Q) * 4));
            var f = { sdlp: { proglib: -2 }, cdp: { newdem: -2, heartland: -2, proglib: 3 }, asp: { heartland: -2 }, ul: { proglib: -2, newdem: 6 }, cc: { proglib: 5, civil: 5, newdem: 1 }, aga: {}, lsp: { civil: 3 }, srp: { civil: 15, proglib: 6 }, lib: { newdem: -1, proglib: 2 } }[p];
            H.fac(Q, f);
            return 'A long dinner with the ' + U.PARTIES[p].short + ' leadership. ' + (C.compat(Q, Q.player, p) < 0.4 ? 'The food was better than the conversation.' : 'There is common ground.');
          } };
      }) },

    { id: 'pact', title: 'An electoral pact', tag: 'Coalition', cooldown: 3,
      cond: function (Q) { return S.now(Q) >= Q.deadline - 14 || Q.electionAt; },
      body: function (Q) { var cur = (Q.pacts || []).map(function (p) { return p.parties.map(function (x) { return U.PARTIES[x].short; }).join('+') + ' (' + p.type + ')'; }).join(', ');
        return 'District runoffs reward parties that cooperate. A transfer pact asks voters to back the partner in the runoff; a joint-candidate pact means the weaker party stands down in each district. Voters do not always follow. ' + (cur ? 'Current pacts: ' + cur + '.' : 'No pacts yet.'); },
      options: [['sdlp', 'transfer'], ['sdlp', 'joint'], ['cdp', 'transfer'], ['ul', 'transfer'], ['aga', 'transfer']].map(function (o) {
        var p = o[0], type = o[1];
        return { label: (type === 'joint' ? 'Joint candidates with the ' : 'Runoff transfer pact with the ') + U.PARTIES[p].short,
          sub: type === 'joint' ? 'Needs relations 60+. Strong effect; the weaker partner’s activists resent it.' : 'Needs relations 50+.',
          cond: function (Q) { if ((Q.pacts || []).some(function (k) { return k.parties.indexOf(p) >= 0; })) return 'Already agreed.'; return C.rel(Q, Q.player, p) >= (type === 'joint' ? 60 : 50) ? true : 'The ' + U.PARTIES[p].short + ' is not interested (relations ' + Math.round(C.rel(Q, Q.player, p)) + ').'; },
          act: function (Q) { Q.pacts.push({ parties: [Q.player, p], type: type });
            var f = { sdlp: { newdem: 5, proglib: -4 }, cdp: { proglib: 6, newdem: -4, heartland: -3 }, ul: { newdem: 10, proglib: -5 }, aga: { heartland: -2 } }[p]; H.fac(Q, f);
            if (type === 'joint') Q.morale -= 4;
            return 'The pact is signed. Local party branches start working out the details, and some of them object.'; } };
      }) },

    { id: 'organise', title: 'Build the state parties', tag: 'Party', cooldown: 4,
      body: function () { return 'A permanent organisation in a region lasts longer than a rally. Costs 2.'; },
      options: REG_OPTS.map(function (r) {
        return { label: U.REGIONS[r], sub: 'Costs 2. Lasting gain in ' + U.REGIONS[r] + '.', cond: function (Q) { return H.funds(Q, 2); },
          act: function (Q) { H.spend(Q, 2); H.region(Q, r, 0.9, 'State party organisation'); Q.orgs = Q.orgs || {}; Q.orgs[r] = (Q.orgs[r] || 0) + 1; return 'Offices open, volunteers are trained, and county chairs are appointed in ' + U.REGIONS[r] + '.'; } };
      }) },

    // ---- government ----
    { id: 'bill', title: 'Push a bill', tag: 'Government', cooldown: 2,
      cond: function (Q) { return S.inGov(Q) && !Q.formation; },
      body: function (Q) { return 'As a governing party, the LDP can put legislation on the coalition agenda. Partners can resist, and the President can refuse to sign.'; },
      options: function (Q) { return K.POLICIES.filter(function (p) { return !(Q.passed || {})[p.id]; }).map(function (pol) {
        return { label: pol.name, sub: pol.sub, act: function (Q) { return K.legislate(Q, pol); } };
      }); } },

    { id: 'summit', title: 'Coalition summit', tag: 'Government', cooldown: 3,
      cond: function (Q) { return S.inGov(Q) && !Q.formation && Q.gov.coalition.length > 1; },
      body: function (Q) { return 'Partners’ trust: ' + Q.gov.coalition.concat(Q.gov.cs).filter(function (p) { return p !== Q.player; }).map(function (p) { return U.PARTIES[p].short + ' ' + Math.round(C.rel(Q, Q.player, p)); }).join(', ') + '.'; },
      options: [
        { label: 'Hold a summit and share the credit', sub: 'Partners’ trust up; the LDP gets less of the credit.', act: function (Q) { Q.gov.coalition.concat(Q.gov.cs).forEach(function (p) { if (p !== Q.player) H.rel(Q, p, 6); }); Q.govApproval += 2; H.camp(Q, V.all(-0.15), 'Sharing credit with partners'); return 'A joint press conference. The photos are friendly.'; } },
        { label: 'Deliver a promised concession', sub: function (Q) { var c = (Q.pendingConcessions || []).filter(function (x) { return !x.done; })[0]; return c ? 'Implement: ' + c.text + ' (' + U.PARTIES[c.party].short + ').' : 'Nothing outstanding.'; },
          cond: function (Q) { return (Q.pendingConcessions || []).some(function (x) { return !x.done; }) ? true : 'No outstanding commitments.'; },
          act: function (Q) { var c = Q.pendingConcessions.filter(function (x) { return !x.done; })[0]; c.done = true; H.rel(Q, c.party, 12); Q.spending = (Q.spending || 0) + 0.1; return 'The ' + U.PARTIES[c.party].short + ' gets what it was promised: ' + c.text + '.'; } }
      ] },

    { id: 'budget', title: 'The budget', tag: 'Government', cooldown: 0,
      cond: function (Q) { return S.pmIsPlayer(Q) && !Q.formation && Q.month >= 9 && Q.month <= 11 && Q.budgetYear !== Q.year; },
      body: function (Q) { return 'The fiscal year starts in October. Deficit: ' + Q.econ.deficit.toFixed(1) + '% of GDP (negative = surplus). Debt ' + Q.econ.debt.toFixed(0) + '%. Which budget does the Treasury present?'; },
      options: [
        { label: 'Prudent: pay down the debt', sub: 'CDP pleased, SDLP not. Slight growth drag.', act: function (Q) { return K.budget(Q, { name: 'prudent', spending: -0.3, growth: -0.1, groups: { suburb: 0.4, retire: 0.3 }, lean: function (p) { return U.PARTIES[p].econ > 2 ? 0.1 : 0; }, rel: { cdp: 5, sdlp: -5, asp: -2 }, fac: { newdem: -4, proglib: 4 } }); } },
        { label: 'Investment: schools, health, infrastructure', sub: 'SDLP and ASP pleased, CDP not.', act: function (Q) { return K.budget(Q, { name: 'investment', spending: 0.5, growth: 0.2, groups: { union: 0.5, young: 0.3, black: 0.3, hisp: 0.3 }, lean: function (p) { return U.PARTIES[p].econ < -3 ? 0.1 : 0; }, rel: { sdlp: 6, asp: 4, cdp: -5 }, fac: { proglib: -5, newdem: 4 } }); } },
        { label: 'Middle-class tax cut', sub: 'Popular in the suburbs. CDP pleased, Progressive Liberals not.', act: function (Q) { return K.budget(Q, { name: 'taxcut', spending: 0.6, growth: 0.15, groups: { suburb: 0.8, retire: 0.2, rural: 0.2 }, lean: function (p) { return U.PARTIES[p].econ > 4 ? 0.12 : 0; }, rel: { cdp: 4, sdlp: -3 }, fac: { newdem: -3, proglib: 5 } }); } }
      ] },

    { id: 'dissolve', title: 'Ask the Prime Minister to dissolve', tag: 'Government', cooldown: 2,
      cond: function (Q) { return S.pmIsPlayer(Q) && !Q.electionAt && !Q.formation && S.now(Q) >= Q.gov.since + 12; },
      body: function (Q) { var d = Q.deadline, y = Math.floor(d / 12), m = d % 12 + 1; return Q.gov.pm + ' leads the government. The election must be called by ' + U.MONTHS[m - 1] + ' ' + y + '. Calling early can catch opponents unprepared, but partners may resent it.'; },
      options: [
        { label: 'Call the election for two months from now', sub: 'Partners lose trust if they are behind in the polls.', act: function (Q) { S.callElection(Q, 2); Q.gov.coalition.concat(Q.gov.cs).forEach(function (p) { if (p !== Q.player && (Q.trend[p] || 0) < 0) H.rel(Q, p, -6); }); Q.morale += 4; return 'The President receives the Prime Minister’s request and dissolves the House.'; } }
      ] },

    // ---- opposition ----
    { id: 'noconf', title: 'A motion of no confidence', tag: 'Opposition', cooldown: 6,
      cond: function (Q) { return Q.gov && !S.supportsGov(Q) && !Q.formation && !Q.electionAt; },
      body: function (Q) { return 'The government relies on ' + S.govSeats(Q) + ' of 801 seats. A motion needs 401 votes.'; },
      options: [
        { label: 'Table the motion', sub: 'If it fails, the government is strengthened.', act: function (Q) {
          var res = U.Parliament.count(Q, 'house', function (p) { if (p === Q.player) return 'yes'; if (S.supportsGov(Q, p)) return C.rel(Q, p, Q.gov.pmParty) < 25 ? 'abstain' : 'no'; return C.compat(Q, p, Q.gov.pmParty) > 0.6 ? 'abstain' : (C.rel(Q, p, Q.player) > 35 ? 'yes' : 'abstain'); });
          if (res.yes >= 401) { S.callElection(Q, 2); return 'The motion passes, ' + res.yes + ' to ' + res.no + '. The government falls and an election is called.'; }
          Q.govApproval += 3; Q.morale -= 3; return 'The motion fails: ' + res.yes + ' for, ' + res.no + ' against, ' + res.abstain + ' abstaining.'; } }
      ] },

    // ---- campaign season ----
    { id: 'debate', title: 'The televised debate', tag: 'Campaign', cooldown: 99,
      cond: function (Q) { return Q.electionAt && !Q.flags['debate' + Q.electionAt]; },
      body: function (Q) { return 'Five party leaders on one stage. ' + Q.leader.name + ' has to stand out without looking arrogant.'; },
      options: [
        { label: 'Prepare thoroughly', sub: 'Costs 1. Safer.', cond: function (Q) { return H.funds(Q, 1); }, act: function (Q) { H.spend(Q, 1); Q.flags['debate' + Q.electionAt] = 1; var r = U.gauss(Q) + 0.6 + Q.leader.charisma * 0.3; H.camp(Q, V.all(r * 0.25), 'Televised debate'); Q.leader.approval += r * 3; return r > 0.5 ? 'Snap polls give ' + Q.leader.name + ' the win.' : 'A solid, forgettable performance.'; } },
        { label: 'Go on the attack', sub: 'Higher risk, higher reward.', act: function (Q) { Q.flags['debate' + Q.electionAt] = 1; var r = U.gauss(Q) * 1.8 + 0.2 + Q.leader.charisma * 0.3; H.camp(Q, V.all(r * 0.35), 'Televised debate'); Q.leader.approval += r * 4; return r > 0.8 ? 'A line from the debate leads every news bulletin. It is yours.' : r < -0.5 ? 'The attack looks petty. The moderators pile on.' : 'Lively, but no knockout.'; } }
      ] },

    { id: 'gotv', title: 'Get out the vote', tag: 'Campaign', cooldown: 1,
      cond: function (Q) { return !!Q.electionAt; },
      body: function () { return 'Turnout decides runoffs. Costs 2.'; },
      options: [
        { label: 'Union halls and churches', sub: 'Union households and Black voters.', cond: function (Q) { return H.funds(Q, 2); }, act: function (Q) { H.spend(Q, 2); H.camp(Q, { union: 0.8, black: 0.9 }, 'Turnout operation'); return 'Buses, phone banks and Sunday sermons.'; } },
        { label: 'Campuses and city centres', sub: 'Young voters and professionals.', cond: function (Q) { return H.funds(Q, 2); }, act: function (Q) { H.spend(Q, 2); H.camp(Q, { young: 1.1, prof: 0.4 }, 'Turnout operation'); return 'Registration drives in every student union.'; } },
        { label: 'Retirement communities and suburbs', sub: 'Retirees and suburban voters.', cond: function (Q) { return H.funds(Q, 2); }, act: function (Q) { H.spend(Q, 2); H.camp(Q, { retire: 0.8, suburb: 0.6 }, 'Turnout operation'); return 'Absentee ballots, rides to the polls, and a lot of coffee.'; } }
      ] }
  ];

  // ---- policies (brief §8.1) ----
  K.POLICIES = [
    { id: 'chip', name: 'Children’s health coverage', sub: 'Left on economy. SDLP and UL like it; CDP wary.', econ: -4, soc: -1, cost: 0.2, groups: { union: 0.5, black: 0.5, hisp: 0.5, young: 0.2 }, fac: { proglib: -6, newdem: 2 } },
    { id: 'wage', name: 'Minimum wage increase', sub: 'Unions cheer; small business and CDP do not.', econ: -4, soc: 0, cost: 0, groups: { union: 0.8, young: 0.3, suburb: -0.2 }, fac: { proglib: -4, newdem: 4 } },
    { id: 'cfr', name: 'Campaign finance reform', sub: 'Popular with professionals; donors grumble.', econ: -1, soc: -2, cost: 0, groups: { prof: 0.6, young: 0.4 }, fac: { proglib: -3, civil: -2, newdem: 2 }, funds: -1 },
    { id: 'hate', name: 'Hate crimes and civil rights act', sub: 'Socially liberal. CDP and ASP uneasy.', econ: 0, soc: -6, cost: 0, groups: { black: 0.6, young: 0.4, prof: 0.3, relig: -0.5 }, fac: { civil: -8, heartland: 4 } },
    { id: 'climate', name: 'Clean energy and climate programme', sub: 'Draws Green voters; costs money; coal states object.', econ: -3, soc: -3, cost: 0.3, groups: { young: 0.7, prof: 0.5, rural: -0.4, union: -0.2 }, fac: { proglib: -4, heartland: 5 }, ulDrain: true },
    { id: 'infra', name: 'Infrastructure for the states', sub: 'Regional investment. ASP and AGA like it.', econ: -2, soc: 0, cost: 0.4, groups: { union: 0.4, rural: 0.4, suburb: 0.2 }, fac: { heartland: -5 }, growth: 0.15 },
    { id: 'balanced', name: 'Balanced-budget rule', sub: 'Right on economy. CDP delighted, SDLP furious.', econ: 4, soc: 0, cost: -0.4, groups: { suburb: 0.5, retire: 0.4, union: -0.4 }, fac: { newdem: -8, proglib: 7 } },
    { id: 'welfare', name: 'Welfare-to-work expansion', sub: 'Centrist. CDP likes it; UL calls it punitive.', econ: 2, soc: 2, cost: 0.1, groups: { suburb: 0.4, rural: 0.3, black: -0.2 }, fac: { newdem: -5, civil: 5 } },
    { id: 'guns', name: 'Gun safety legislation', sub: 'Divisive. Cities for, rural areas against.', econ: 0, soc: -4, cost: 0, groups: { prof: 0.5, suburb: 0.3, black: 0.3, rural: -0.8 }, fac: { civil: -4, heartland: 8 } },
    { id: 'devolve', name: 'Federalism and devolution commission', sub: 'Regional parties welcome it; centralists worry.', econ: 0, soc: 0, fed: 4, cost: 0, groups: {}, fac: { newdem: 1 }, regional: true }
  ];

  K.legislate = function (Q, pol) {
    var g = Q.gov, ppos = { econ: 1, soc: 1, fed: 0 }, bpos = { econ: pol.econ, soc: pol.soc, fed: pol.fed || 0 };
    var pos = U.Elections.pos(Q), out = [];
    var decide = function (p) {
      var dq = U.Electoral.dist(pos[p], ppos), db = U.Electoral.dist(pos[p], bpos);
      if (p === Q.player) return 'yes';
      if (pol.regional && U.REGIONAL.indexOf(p) >= 0) return 'yes';
      if (g.coalition.indexOf(p) >= 0) {
        if (db > dq + 4) { C.addRel(Q, Q.player, p, -6); return 'abstain'; }
        if (db > dq) C.addRel(Q, Q.player, p, -3);
        return 'yes';
      }
      return db < dq - 0.5 ? 'yes' : db < dq + 1.5 ? 'abstain' : 'no';
    };
    var h = U.Parliament.count(Q, 'house', decide), s = U.Parliament.count(Q, 'senate', decide);
    var passed = h.yes > h.no && (s.yes > s.no || h.yes >= 401);
    var vetoed = false;
    if (passed && Q.president.party !== Q.player && !S.inGov(Q, Q.president.party)) {
      var pd = U.Electoral.dist(pos[Q.president.party] || ppos, bpos);
      if (pd > 7 && U.rng(Q) < 0.6) vetoed = !(h.yes >= 401 && s.yes >= 101);
    }
    out.push('House: ' + h.yes + ' yes, ' + h.no + ' no, ' + h.abstain + ' abstaining. Senate: ' + s.yes + '–' + s.no + '.');
    if (passed && !vetoed) {
      Q.passed = Q.passed || {}; Q.passed[pol.id] = S.now(Q);
      H.camp(Q, pol.groups, 'Legislation: ' + pol.name);
      H.fac(Q, pol.fac); Q.spending = (Q.spending || 0) + pol.cost; Q.policyGrowth = (Q.policyGrowth || 0) + (pol.growth || 0);
      if (pol.funds) Q.funds += pol.funds;
      if (pol.ulDrain) V.campaign(Q, 'ul', { young: -0.4, prof: -0.3 }, null);
      if (pol.regional) U.REGIONAL.forEach(function (p) { C.addRel(Q, Q.player, p, 6); });
      (Q.pendingConcessions || []).forEach(function (c) { if (!c.done && c.text.toLowerCase().indexOf(pol.name.split(' ')[0].toLowerCase()) >= 0) { c.done = true; C.addRel(Q, Q.player, c.party, 10); } });
      Q.govApproval += 1;
      out.push('<b>The bill becomes law.</b>');
    } else if (vetoed) {
      out.push('<b>President ' + Q.president.name + ' vetoes the bill.</b> Parliament lacks the absolute majorities to override.');
      C.addRel(Q, Q.player, Q.president.party, -5);
    } else { out.push('<b>The bill is defeated.</b>'); Q.govApproval -= 2; H.fac(Q, { proglib: 2, newdem: 2 }); }
    Q.lastVote = { title: pol.name, house: h, senate: s };
    return out.join(' ');
  };

  K.budget = function (Q, plan) {
    Q.budgetYear = Q.year;
    var res = S.budgetVote(Q, plan); S.applyBudget(Q, plan, res);
    for (var p in plan.rel || {}) H.rel(Q, p, plan.rel[p]);
    H.fac(Q, plan.fac || {});
    Q.lastVote = { title: 'Budget ' + (Q.year + 1), house: res.house, senate: res.senate };
    var txt = 'House: ' + res.house.yes + ' yes, ' + res.house.no + ' no. Senate: ' + res.senate.yes + '–' + res.senate.no + (res.override ? ' (House override)' : '') + '. ';
    if (res.passed) return txt + '<b>The budget passes.</b>';
    return txt + '<b>The budget is defeated.</b> ' + (Q.gov.budgetFails >= 2 ? 'Two failed budgets: the government is in serious danger.' : 'Spending rolls over from last year.');
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
