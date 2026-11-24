// Events (brief §13): authored and systemic, with causes, choices and
// lasting consequences. At most one fires at the start of each month.
(function (G) {
  'use strict';
  var U = G.USA, V = U.Votes, C = U.Coalition, S = U.Game, K = U.Content, H = K.H, Ev = U.Events = {};
  function at(Q, y, m) { return Q.year > y || (Q.year === y && Q.month >= m); }
  function chance(Q, p) { return U.rng(Q) < p; }

  Ev.LIST = [
    { id: 'nader', title: 'Nader on campus', when: function (Q) { return at(Q, 1999, 3) && chance(Q, 0.5); },
      body: function () { return 'Ralph Nader, one of only four Green MPs, is filling university halls. His message: the Grand Coalition is a single corporate party with three logos. Students are listening, and so are some of your own activists.'; },
      options: [
        { label: 'Ignore him: he has four seats', act: function (Q) { Q.flags.naderSurge = S.now(Q); return 'The surge continues. The Greens’ numbers climb slowly but steadily.'; } },
        { label: 'Adopt part of his agenda', sub: 'Campaign finance and environment. Moves the LDP left.', act: function (Q) { Q.flags.naderSurge = S.now(Q) + 6; H.shift(Q, -0.6, -0.4); H.camp(Q, { young: 0.6, prof: 0.4 }, 'Response to the Green surge'); H.fac(Q, { proglib: -5, newdem: 5 }); return 'The LDP takes some of the Greens’ clothes. Nader calls it theft; his surge slows.'; } },
        { label: 'Debate him publicly', sub: 'Risky: raises his profile.', act: function (Q) { var r = U.gauss(Q) + Q.leader.charisma * 0.3; Q.flags.naderSurge = S.now(Q) + (r > 0 ? 8 : -4); H.camp(Q, { young: r * 0.5, prof: r * 0.4 }, 'Response to the Green surge'); return r > 0 ? 'A clear win for ' + Q.leader.name + '. Nader looks like a protest candidate.' : 'Nader wins the room and the headlines. The Greens surge.'; } }
      ] },

    { id: 'bradley_health', title: 'Bradley’s healthcare ultimatum', when: function (Q) { return at(Q, 1999, 5) && S.inGov(Q) && S.inGov(Q, 'sdlp'); },
      body: function () { return 'SDLP leader Bill Bradley demands a universal health coverage bill before the election. "We did not join this coalition to manage the status quo." The CDP says the country cannot afford it.'; },
      options: [
        { label: 'Back Bradley', sub: 'SDLP relations up, CDP down. Progressive Liberals pleased.', act: function (Q) { H.rel(Q, 'sdlp', 10); H.rel(Q, 'cdp', -10); H.fac(Q, { proglib: -8, newdem: 6 }); Q.pendingConcessions = (Q.pendingConcessions || []).concat([{ party: 'sdlp', id: 'health', text: 'Children’s health coverage (SDLP)', due: S.now(Q) + 10 }]); return 'The LDP backs a phased plan, starting with children. The CDP threatens to vote against it.'; } },
        { label: 'Broker a compromise: children first', sub: 'Both partners partly satisfied.', act: function (Q) { H.rel(Q, 'sdlp', 3); H.rel(Q, 'cdp', -2); Q.govApproval += 1; return 'A modest children’s coverage plan. Bradley calls it a first step; the CDP calls it the last one.'; } },
        { label: 'Side with fiscal caution', sub: 'CDP pleased, SDLP angry.', act: function (Q) { H.rel(Q, 'sdlp', -12); H.rel(Q, 'cdp', 8); H.fac(Q, { proglib: 8, newdem: -5 }); V.campaign(Q, 'sdlp', { union: 0.5, young: 0.3 }, null); return 'Bradley takes the fight to the country. SDLP voters rally to him.'; } }
      ] },

    { id: 'reform_cs', title: 'The Reform Party’s price', when: function (Q) { return at(Q, 1999, 8) && Q.gov && Q.gov.cs.indexOf('asp') >= 0; },
      body: function () { return 'The Reform Party, the ASP constituent that signed the confidence-and-supply deal, wants more for its states before the budget: federal money for Minnesota, Utah and the Plains, and a balanced-budget pledge.'; },
      options: [
        { label: 'Pay: a regional investment package', sub: 'ASP relations up; deficit up.', act: function (Q) { H.rel(Q, 'asp', 10); Q.spending = (Q.spending || 0) + 0.2; H.region(Q, 'PL', 0.3, 'Regional investment'); return 'Bridges, rural hospitals and broadband pilots. The CDP grumbles about pork.'; } },
        { label: 'Offer the balanced-budget pledge instead', sub: 'Cheaper. SDLP unhappy.', act: function (Q) { H.rel(Q, 'asp', 5); H.rel(Q, 'sdlp', -5); H.shift(Q, 0.3, 0); return 'Perot’s people accept, for now.'; } },
        { label: 'Refuse', sub: 'The ASP may withdraw support.', act: function (Q) { H.rel(Q, 'asp', -15); return 'Reform leaders tell reporters the deal is "under review".'; } }
      ] },

    { id: 'seattle', title: 'The battle of Seattle', when: function (Q) { return at(Q, 1999, 11); },
      body: function () { return 'Tens of thousands of trade unionists, environmentalists and anarchists shut down the WTO ministerial meeting in Seattle. Police use tear gas. The Greens and the United Left are on the streets; the SDLP’s unions too.'; },
      options: [
        { label: 'Defend free trade and order', sub: 'New Democrats pleased; UL and SDLP angry.', act: function (Q) { H.camp(Q, { suburb: 0.4, prof: 0.2, union: -0.6, young: -0.5 }, 'Seattle protests'); H.rel(Q, 'ul', -8); H.rel(Q, 'sdlp', -3); H.fac(Q, { newdem: -5, proglib: 6 }); V.campaign(Q, 'ul', { young: 0.5 }, null); return 'Business groups praise the government. The protesters’ photos dominate the news anyway.'; } },
        { label: 'Call for labor and environmental standards in trade', sub: 'SDLP pleased; moves the LDP slightly left.', act: function (Q) { H.camp(Q, { union: 0.5, young: 0.2 }, 'Seattle protests'); H.rel(Q, 'sdlp', 5); H.shift(Q, -0.4, 0); return 'A speech on fair trade. The protesters are unimpressed, the unions less so.'; } },
        { label: 'Sympathise with the protesters', sub: 'Young voters respond; the CDP is appalled.', act: function (Q) { H.camp(Q, { young: 0.8, prof: 0.2, suburb: -0.4 }, 'Seattle protests'); H.rel(Q, 'cdp', -8); H.rel(Q, 'ul', 6); H.fac(Q, { proglib: -4, newdem: 8 }); return 'The coalition’s centre-right partners ask whose side the LDP is on.'; } }
      ] },

    { id: 'y2k', title: 'The millennium bug', when: function (Q) { return at(Q, 2000, 1); },
      body: function (Q) { return 'Midnight passes. The power grid holds, the planes stay in the air, the banks open. Billions were spent on preparation. Who gets the credit?'; },
      options: [
        { label: 'Thank the civil servants and engineers', act: function (Q) { Q.govApproval += 3; return 'A gracious statement. Approval of the government ticks up.'; } },
        { label: 'Claim it for the government’s planning', sub: 'Small LDP gain; partners notice.', act: function (Q) { H.camp(Q, { suburb: 0.3, retire: 0.3 }, 'Y2K'); H.rel(Q, 'sdlp', -2); H.rel(Q, 'cdp', -2); return 'Commentators ask whether nothing happening is an achievement.'; } }
      ] },

    { id: 'flag', title: 'A flag over Columbia', when: function (Q) { return at(Q, 2000, 1) && chance(Q, 0.3); },
      body: function () { return 'Mass marches demand the removal of the Confederate battle flag from the South Carolina State House. The Southern Rights Party calls it heritage and is gaining in the polls across the Deep South.'; },
      options: [
        { label: 'Demand it comes down', sub: 'Black voters respond; SRP mobilises.', act: function (Q) { H.camp(Q, { black: 0.8, prof: 0.3, rural: -0.3 }, 'Confederate flag dispute'); Q.homeMult.srp = (Q.homeMult.srp || 1) * 1.1; H.rel(Q, 'srp', -12); H.fac(Q, { civil: -8, heartland: 3 }); return 'The LDP stands with the marchers. The SRP’s rallies get bigger.'; } },
        { label: 'Call it a matter for South Carolina', sub: 'Federalist. The Civil Rights Caucus is furious.', act: function (Q) { H.fac(Q, { civil: 15 }); H.rel(Q, 'srp', 4); H.camp(Q, { black: -0.6, rural: 0.2 }, 'Confederate flag dispute'); return 'John Lewis says publicly he is ashamed of his party’s answer.'; } }
      ] },

    { id: 'nomination', title: 'The presidential nomination', repeat: true,
      when: function (Q) { var f = U.RULES.president.firstElection; return (Q.year - f.year) % U.RULES.president.termYears === 0 && Q.month >= 2 && Q.month < 11 && !Q.presCandidate; },
      body: function (Q) { return (Q.president.party === Q.player && Q.president.termLimited ? 'President ' + Q.president.name + ' cannot run again. ' : '') +
        'The Electoral College has two rounds: if the centre-left splits its vote between several candidates, the runoff could be fought on the right\u2019s terms. Who carries the LDP\u2019s banner?'; },
      options: function (Q) {
        var y2000 = Q.year === 2000, list = [];
        var names = y2000 ? [['Al Gore', 2, 'Best known. If he wins, the LDP needs a new leader and Prime Minister.', null], ['Joe Lieberman', 1, 'Centrist; could attract CDP voters in a runoff. Progressive Liberals cool.', { newdem: -6, proglib: 5 }], ['Howard Dean', 1, 'Energises the left and competes with Nader.', { proglib: -6, newdem: 6 }]]
          : [[Q.leader.name, Q.leader.charisma + 1, 'The party leader. If elected, the LDP needs a new leader.', null]].concat(Object.keys(U.LDP_FACTIONS).filter(function (k) { return U.LDP_FACTIONS[k].figure !== Q.leader.name; }).slice(0, 2).map(function (k) { var f = {}; f[k] = -6; return [U.LDP_FACTIONS[k].figure, 0, 'Champion of the ' + U.LDP_FACTIONS[k].name + '.', f]; }));
        names.forEach(function (n) { list.push({ label: n[0], sub: n[2], act: function (Q) { Q.presCandidate = { party: Q.player, name: n[0], appeal: n[1], backers: [] }; if (n[3]) H.fac(Q, n[3]); return n[0] + ' wins the nomination and starts touring the swing states.'; } }); });
        list.push({ label: 'Offer the SDLP a joint centre-left ticket', sub: 'Your nominee, with the SDLP standing down for a policy pledge. Needs SDLP relations 60+.',
          cond: function (Q) { return C.rel(Q, Q.player, 'sdlp') >= 60 ? true : 'The SDLP will not stand down (relations ' + Math.round(C.rel(Q, Q.player, 'sdlp')) + ').'; },
          act: function (Q) { var nm = names[0][0]; Q.presCandidate = { party: Q.player, name: nm, appeal: names[0][1], backers: ['sdlp'] }; Q.presWithdrawn = ['sdlp']; H.rel(Q, 'sdlp', 4); H.fac(Q, { newdem: 5, proglib: -5 }); Q.pendingConcessions = (Q.pendingConcessions || []).concat([{ party: 'sdlp', id: 'wage', text: 'Minimum wage increase (joint ticket)', due: S.now(Q) + 12 }]); return 'The SDLP\u2019s candidate stands down and endorses ' + nm + '. Not every SDLP voter will follow.'; } });
        list.push({ label: 'Endorse the SDLP candidate', sub: 'The LDP stays out; the SDLP owes you.', act: function (Q) { Q.presCandidate = { endorse: 'sdlp' }; H.rel(Q, 'sdlp', 15); Q.leader.approval -= 4; H.fac(Q, { newdem: 10, proglib: -6 }); return 'An extraordinary gesture. LDP activists feel sidelined.'; } });
        list.push({ label: 'Endorse the CDP candidate', sub: 'A Grand Coalition gesture to the centre-right. Progressive Liberals appalled.', act: function (Q) { Q.presCandidate = { endorse: 'cdp' }; H.rel(Q, 'cdp', 15); H.fac(Q, { proglib: 14, civil: 8, newdem: -4 }); return 'The CDP\u2019s nominee thanks the LDP warmly. Your left wing does not.'; } });
        return list;
      } },

    { id: 'bust_response', title: 'After the crash', when: function (Q) { return Q.flags.bust && S.now(Q) >= Q.flags.bust + 1; },
      body: function (Q) { return 'The technology crash is wiping out savings and jobs in California, Washington and the Northeast. Growth is ' + Q.econ.growth.toFixed(1) + '%. ' + (S.inGov(Q) ? 'As a governing party, the LDP will be blamed or credited.' : 'The government is under pressure.'); },
      options: [
        { label: 'Call for stimulus', sub: 'Higher deficit, softer landing.', act: function (Q) { if (S.inGov(Q)) { Q.econ.shock = (Q.econ.shock || 0) + 0.8; Q.spending = (Q.spending || 0) + 0.5; } H.camp(Q, { union: 0.4, young: 0.3 }, 'Response to the crash'); H.rel(Q, 'sdlp', 4); H.rel(Q, 'cdp', -3); return S.inGov(Q) ? 'The coalition agrees a stimulus package after long nights.' : 'The LDP proposes a stimulus plan.'; } },
        { label: 'Hold the line on the budget', sub: 'Markets reassured; unemployment rises.', act: function (Q) { H.camp(Q, { suburb: 0.3, retire: 0.3, union: -0.4 }, 'Response to the crash'); H.rel(Q, 'cdp', 4); return 'Discipline now, recovery later, the Treasury says.'; } }
      ] },

    { id: 'california_power', title: 'California in the dark', when: function (Q) { return at(Q, 2000, 12) && chance(Q, 0.35); },
      body: function () { return 'Rolling blackouts hit California as energy traders manipulate a deregulated market. The Californian National Party says Washington failed the state; the Californian Freedom Coalition says Sacramento should run its own grid.'; },
      options: [
        { label: 'Federal price caps and investigation', sub: 'Centralist. Cuts the regionalists’ momentum.', act: function (Q) { H.region(Q, 'PC', 0.5, 'California energy crisis'); Q.homeMult.cnp = (Q.homeMult.cnp || 1) * 0.9; Q.homeMult.cfc = (Q.homeMult.cfc || 1) * 0.9; H.rel(Q, 'cnp', -5); H.rel(Q, 'cfc', -5); return 'Federal regulators move in. Prices fall; Californian nationalists call it occupation.'; } },
        { label: 'Back Sacramento’s right to run its own market', sub: 'Devolutionist. Regionalists welcome it.', act: function (Q) { H.rel(Q, 'cfc', 10); H.rel(Q, 'cnp', 6); Q.homeMult.cfc = (Q.homeMult.cfc || 1) * 1.15; H.fac(Q, { newdem: 2 }); return 'The state takes control. The CFC claims the victory.'; } }
      ] },

    { id: 'texas', title: 'Texas wants its oil money', when: function (Q) { return at(Q, 2000, 6) && (Q.house.lsp || 0) >= 4 && chance(Q, 0.3); },
      body: function (Q) { return 'The Lone Star Party introduces a bill giving Texas control of federal royalties from its oil and gas fields. It has ' + (Q.house.lsp || 0) + ' MPs; its hardliners talk openly of independence. Its leaders privately say their votes are available to any government that helps.'; },
      options: [
        { label: 'Negotiate a revenue-sharing deal', sub: 'LSP relations up sharply; other states object.', act: function (Q) { H.rel(Q, 'lsp', 15); H.fac(Q, { civil: 4, proglib: 3 }); Q.flags.texasDeal = 1; Q.homeMult.lsp = (Q.homeMult.lsp || 1) * 0.95; return 'A compromise on a share of royalties. Hardliners call it a down payment.'; } },
        { label: 'Refuse: federal resources stay federal', sub: 'Hardliners gain.', act: function (Q) { H.rel(Q, 'lsp', -10); Q.homeMult.lsp = (Q.homeMult.lsp || 1) * 1.12; Q.secessionTX = (Q.secessionTX || 0) + 5; return 'The bill fails. LSP hardliners fill a stadium in Houston.'; } }
      ] },

    { id: 'scandal', title: 'A fundraising scandal', when: function (Q) { return at(Q, 1999, 6) && chance(Q, 0.03); }, repeat: true,
      body: function () { return 'A newspaper reports that an LDP fundraiser promised access to ministers in exchange for donations. The documents look genuine.'; },
      options: [
        { label: 'Come clean and return the money', sub: 'Costs 2 funds; damage contained.', act: function (Q) { Q.funds -= 2; H.camp(Q, V.all(-0.2), 'Fundraising scandal'); return 'An apology and a refund. The story fades in a week.'; } },
        { label: 'Deny and attack the newspaper', sub: 'May work. If more comes out, much worse.', act: function (Q) { if (U.rng(Q) < 0.5) { H.camp(Q, V.all(-1), 'Fundraising scandal'); Q.scandal = (Q.scandal || 0) + 6; Q.leader.approval -= 10; return 'More documents appear. The cover-up becomes the story.'; } return 'The paper fails to follow up. The story dies.'; } },
        { label: 'Blame a rogue staffer', sub: 'Some damage; the Civil Rights Caucus dislikes the scapegoating.', act: function (Q) { H.camp(Q, V.all(-0.4), 'Fundraising scandal'); H.fac(Q, { civil: 4 }); return 'The staffer resigns. Few believe it was only him.'; } }
      ] },

    { id: 'security', title: 'An attack on American soil', when: function (Q) { return at(Q, 2001, 6) && !Q.flags.securityDone && chance(Q, 0.06); },
      body: function () { return 'A coordinated terrorist attack kills thousands. The country is in shock. Every party suspends campaigning. In the days that follow, the government must decide how to respond, at home and abroad, and the civil-liberties debate will shape politics for years.'; },
      options: [
        { label: 'National unity: support broad security powers', sub: 'Government rallies; Libertarians and UL object.', act: function (Q) { Q.flags.securityDone = 1; Q.govApproval += 15; Q.president.approval += 15; H.shift(Q, 0, 1); H.rel(Q, 'ul', -10); H.rel(Q, 'lib', -6); H.rel(Q, 'cc', 6); H.fac(Q, { civil: 8, proglib: 6, newdem: -4 }); return 'Parliament passes sweeping security legislation within weeks.'; } },
        { label: 'Security with strict civil-liberties safeguards', sub: 'Harder to pass; the CC attacks it as weak.', act: function (Q) { Q.flags.securityDone = 1; Q.govApproval += 8; H.rel(Q, 'lib', 6); H.rel(Q, 'ul', 4); H.rel(Q, 'cc', -6); H.fac(Q, { civil: -6, proglib: -4, heartland: 4 }); return 'Sunset clauses and judicial oversight are written in. The CC says the LDP is soft.'; } }
      ] },

    // ---- systemic events ----
    { id: 'ai_budget', title: 'The government’s budget', repeat: true,
      when: function (Q) { return Q.gov && !S.pmIsPlayer(Q) && !Q.formation && Q.month === 10 && Q.budgetYear !== Q.year; },
      body: function (Q) { return S.inGov(Q) ? Q.gov.pm + '’s Treasury presents its budget. As a coalition member, the LDP is expected to vote for it.' : Q.gov.pm + '’s government presents its budget. How do LDP MPs vote?'; },
      options: [
        { label: 'Vote yes', act: function (Q) { return Ev.aiBudget(Q, 'yes'); } },
        { label: 'Abstain', act: function (Q) { return Ev.aiBudget(Q, 'abstain'); } },
        { label: 'Vote no', act: function (Q) { return Ev.aiBudget(Q, 'no'); } }
      ] },

    { id: 'offer', title: 'An offer to govern', repeat: true, when: function (Q) { return Q.formation && Q.formation.offer; },
      body: function (Q) { var d = Q.formation.offer, role = d.coalition.indexOf(Q.player) >= 0 ? 'join the cabinet with ' + (d.posts[Q.player] || 1) + ' posts' : 'provide confidence and supply';
        return S.pmName(Q, d.pm) + ' of the ' + U.PARTIES[d.pm].short + ' asks the LDP to ' + role + '. The proposed government: ' + d.coalition.map(function (p) { return U.PARTIES[p].short; }).join(', ') + (d.cs.length ? '; supported by ' + d.cs.map(function (p) { return U.PARTIES[p].short; }).join(', ') : '') + '.'; },
      options: [
        { label: 'Accept', act: function (Q) { var d = Q.formation.offer; Q.formation.offer = null; var inv = S.tryInvestiture(Q, d); if (inv.passed) { S.formGovernment(Q, d, S.pmName(Q, d.pm)); H.fac(Q, { proglib: d.pm === 'cdp' || d.pm === 'cc' ? 10 : 0 }); return 'The investiture passes. The LDP ' + (d.coalition.indexOf(Q.player) >= 0 ? 'enters government' : 'sustains the new government from outside') + '.'; } Q.formation.failed.push(d.pm); return 'Even with LDP votes, the investiture fails.'; } },
        { label: 'Refuse: the LDP will not prop up this government', act: function (Q) { var d = Q.formation.offer; Q.formation.offer = null; Q.formation.playerRefused = true; H.rel(Q, d.pm, -6); Q.morale += 3; return 'The LDP declines. ' + S.pmName(Q, d.pm) + ' will have to look elsewhere.'; } }
      ] },

    { id: 'new_leader', title: 'The Prime Minister moves to the White House', when: function (Q) { return Q.flags.leaderToWhiteHouse && !Q.flags.leaderReplaced; },
      body: function (Q) { return Q.leader.name + ' will be President. The LDP needs a new leader' + (S.pmIsPlayer(Q) ? ', and the government a new Prime Minister. Coalition partners will judge the choice.' : '.'); },
      options: ['newdem', 'proglib', 'civil', 'heartland'].map(function (k) { return { label: function (Q) { return U.LDP_FACTIONS[k].figure + ' (' + U.LDP_FACTIONS[k].name + ')'; }, sub: function (Q) { return 'Faction strength ' + Math.round(Q.factions[k].strength) + '%.'; }, act: function (Q) { return Ev.newLeader(Q, k); } }; }) },

    { id: 'challenge', title: 'A leadership challenge', repeat: true,
      when: function (Q) { return !Q.timers.challenge && Q.leader.approval < 30 && Object.keys(Q.factions).some(function (k) { return Q.factions[k].dissent > 70; }); },
      body: function (Q) { var k = Ev.rebel(Q); return U.LDP_FACTIONS[k].figure + ' of the ' + U.LDP_FACTIONS[k].name + ' announces a challenge to ' + Q.leader.name + '. Members and MPs will vote.'; },
      options: [
        { label: 'Fight it', act: function (Q) { Q.timers.challenge = 12; var k = Ev.rebel(Q), p = Q.leader.approval / 100 + Q.unity / 200 + (1 - Q.factions[k].strength / 100) * 0.3 + U.gauss(Q) * 0.1; if (p > 0.6) { Q.factions[k].dissent -= 20; Q.unity -= 5; Q.leader.approval += 5; return Q.leader.name + ' survives the vote. The rebels retreat.'; } return Ev.newLeader(Q, k, 'The challenger wins. '); } },
        { label: 'Stand down', act: function (Q) { Q.timers.challenge = 12; return Ev.newLeader(Q, Ev.rebel(Q), Q.leader.name + ' resigns. '); } }
      ] },

    { id: 'faction_revolt', title: 'A faction threatens to walk out', repeat: true,
      when: function (Q) { return !Q.timers.revolt && Object.keys(Q.factions).some(function (k) { return Q.factions[k].dissent > 88; }); },
      body: function (Q) { var k = Ev.rebel(Q); return 'The ' + U.LDP_FACTIONS[k].name + ' say the party no longer represents them. Some of their MPs are talking to ' + (k === 'newdem' || k === 'heartland' ? 'the CDP' : 'the SDLP') + '.'; },
      options: [
        { label: 'Give them what they want', sub: 'Dissent falls; the other factions notice.', act: function (Q) { Q.timers.revolt = 6; var k = Ev.rebel(Q); Q.factions[k].dissent = 50; for (var o in Q.factions) if (o !== k) Q.factions[o].dissent += 6; return 'A policy U-turn and two promotions keep them in.'; } },
        { label: 'Let them go', sub: 'Lose a share of MPs and voters to a rival.', act: function (Q) { Q.timers.revolt = 12; var k = Ev.rebel(Q), to = (k === 'newdem' || k === 'heartland') ? 'cdp' : 'sdlp', n = Math.round((Q.house[Q.player] || 0) * Q.factions[k].strength / 100 * 0.15);
          Q.house[Q.player] -= n; Q.house[to] = (Q.house[to] || 0) + n; V.campaign(Q, Q.player, V.all(-0.6), 'Defections'); V.campaign(Q, to, V.all(0.5), null); Q.factions[k].strength -= 8; Q.factions[k].dissent = 40; Q.unity += 5;
          return n + ' MPs cross the floor to the ' + U.PARTIES[to].short + '. The party is smaller, and more united.'; } }
      ] },

    { id: 'partner_left', title: 'A partner walks out', repeat: true, when: function (Q) { return Q.flags.partnerLeft; },
      body: function (Q) { return 'The ' + U.PARTIES[Q.flags.partnerLeft].name + ' has left the government. ' + (S.govSeats(Q) >= 401 ? 'The government still has a majority.' : 'The government no longer has a majority: ' + S.govSeats(Q) + ' of 801.'); },
      options: [
        { label: 'Try to win them back', sub: 'Concessions; relations improve.', act: function (Q) { var p = Q.flags.partnerLeft; Q.flags.partnerLeft = null; H.rel(Q, p, 12); Q.spending = (Q.spending || 0) + 0.2; if (C.rel(Q, p, Q.gov.pmParty) > 35) { Q.gov.cs.push(p); return 'They agree to support the government from outside, at a price.'; } return 'They take the concessions and stay out.'; } },
        { label: 'Carry on as a minority', act: function (Q) { Q.flags.partnerLeft = null; return 'The government will have to find votes bill by bill.'; } },
        { label: 'Push for an early election', sub: 'Only if the LDP leads the government.', cond: function (Q) { return S.pmIsPlayer(Q) ? true : 'The LDP does not hold the premiership.'; }, act: function (Q) { Q.flags.partnerLeft = null; S.callElection(Q, 2); return 'The voters will decide.'; } }
      ] },

    { id: 'ul_strain', title: 'Strain in the United Left', when: function (Q) { return at(Q, 2001, 1) && (Q.house.ul || 0) >= 25 && chance(Q, 0.08); },
      body: function () { return 'The United Left’s reformist wing (Greens, DSA, Working Families) wants to negotiate with centre-left governments. Its revolutionary organisations threaten to leave the alliance if it does. Nader’s Greens are now its biggest component.'; },
      options: [
        { label: 'Quietly encourage the reformists', sub: 'UL relations up; New Democrats uneasy.', act: function (Q) { H.rel(Q, 'ul', 8); H.fac(Q, { newdem: 4 }); Q.ulUnity -= 10; return 'Back-channel talks begin with the Green and DSA leaderships.'; } },
        { label: 'Stay out of it', act: function () { return 'The alliance argues in public for weeks.'; } }
      ] }
  ];

  Ev.rebel = function (Q) { return Object.keys(Q.factions).sort(function (a, b) { return Q.factions[b].dissent - Q.factions[a].dissent; })[0]; };

  Ev.newLeader = function (Q, k, prefix) {
    var f = U.LDP_FACTIONS[k];
    Q.leader = { name: f.figure, approval: 50, charisma: k === 'proglib' ? 1 : 0 };
    Q.flags.leaderReplaced = 1; Q.flags.leaderToWhiteHouse = null;
    Q.factions[k].dissent = 20; Q.factions[k].strength += 5;
    for (var o in Q.factions) if (o !== k) Q.factions[o].dissent += 5;
    H.shift(Q, (f.econ - Q.pos[Q.player].econ) * 0.25, (f.soc - Q.pos[Q.player].soc) * 0.25);
    var txt = (prefix || '') + f.figure + ' becomes leader of the LDP.';
    if (S.pmIsPlayer(Q)) {
      Q.gov.pm = f.figure;
      Q.gov.coalition.concat(Q.gov.cs).forEach(function (p) { if (p !== Q.player) C.addRel(Q, Q.player, p, (C.compat(Q, p, Q.player) - 0.55) * 20); });
      txt += ' Parliament confirms ' + f.figure + ' as Prime Minister; partners react according to the new leader’s politics.';
    }
    return txt;
  };

  Ev.aiBudget = function (Q, v) {
    Q.budgetYear = Q.year;
    var plan = { spending: 0.1, groups: {} }, res = S.budgetVote(Q, plan, v);
    S.applyBudget(Q, plan, res);
    if (S.inGov(Q) && v !== 'yes') { C.addRel(Q, Q.player, Q.gov.pmParty, v === 'no' ? -20 : -8); }
    if (!S.supportsGov(Q) && v === 'yes') { C.addRel(Q, Q.player, Q.gov.pmParty, 6); H.fac(Q, { proglib: 4 }); }
    Q.lastVote = { title: 'Budget ' + (Q.year + 1), house: res.house, senate: res.senate };
    return 'House: ' + res.house.yes + ' yes, ' + res.house.no + ' no. <b>' + (res.passed ? 'The budget passes.' : 'The budget is defeated.') + '</b>';
  };

  // Pick this month's event: first eligible, not yet seen (unless repeatable).
  Ev.next = function (Q) {
    Q.seen = Q.seen || {};
    for (var i = 0; i < Ev.LIST.length; i++) {
      var e = Ev.LIST[i];
      if (!e.repeat && Q.seen[e.id]) continue;
      if (e.when(Q)) { Q.seen[e.id] = S.now(Q); return e.id; }
    }
    return null;
  };
  Ev.byId = function (id) { return Ev.LIST.filter(function (e) { return e.id === id; })[0]; };
})(typeof globalThis !== 'undefined' ? globalThis : window);
