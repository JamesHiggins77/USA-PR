// Events, 2001-2012. Two are fixed: the September 11 attacks (2001) and the
// financial crash of September 2008. Everything else depends on who governs,
// on the LDP's choices, and on earlier outcomes (a war only follows if it is
// chosen; a recession is milder if the housing bubble was tackled, and so on).
(function (G) {
  'use strict';
  var U = G.USA, V = U.Votes, C = U.Coalition, S = U.Game, K = U.Content, H = K.H, Ev = U.Events;
  function at(Q, y, m) { return Q.year > y || (Q.year === y && Q.month >= m); }
  function chance(Q, p) { return U.rng(Q) < p; }
  // a one-off roll: decided the first time it is asked, then remembered
  function once(Q, id, p) { var k = 'roll_' + id; if (Q.flags[k] == null) Q.flags[k] = U.rng(Q) < p; return Q.flags[k]; }
  var F = function (Q) { return Q.flags; };
  var hawk = function (Q, p) { var pos = (Q.pos && Q.pos[p]) || U.PARTIES[p] || {}; return (U.PARTY_PROFILES[p] || { ax: { foreign: 0 } }).ax.foreign + (pos.soc || 0) * 0.2 > 3; };
  var gov = function (Q) { return S.policyGov ? S.policyGov(Q) : S.inGov(Q); };
  var pres = function (Q) { return Q.president.name + ' (' + U.PARTIES[Q.president.party].short + ')'; };
  var approve = function (Q, g, p) { Q.govApproval += g; Q.president.approval += (p == null ? g : p); };

  // ---- fixed: September 11 (replaces the old random attack) ----
  var sec = Ev.byId('security');
  if (sec) {
    sec.title = 'September 11';
    sec.when = function (Q) { return at(Q, 2001, 9) && !Q.flags.securityDone; };
    sec.body = function (Q) { return 'On the morning of 11 September 2001, hijacked airliners destroy the World Trade Center and strike the Pentagon. Nearly three thousand people are killed. President ' + pres(Q) + ' addresses the nation; Prime Minister ' + Q.gov.pm + ' recalls Congress. The country rallies, and the government must decide how far to go at home.'; };
    sec.options.forEach(function (o) { var a = o.act; o.act = function (Q) { Q.flags.sept11 = S.now(Q); return a(Q); }; });
    // put it first so nothing else takes its month
    Ev.LIST.splice(Ev.LIST.indexOf(sec), 1); Ev.LIST.unshift(sec);
  }

  var LIST = [
    // ---- the war on terror ----
    { id: 'afghanistan', title: 'Afghanistan', when: function (Q) { return F(Q).sept11 && S.now(Q) >= F(Q).sept11 + 1; },
      body: function (Q) { return 'Al-Qaeda’s leaders are sheltered by the Taliban in Afghanistan. President ' + pres(Q) + ' and the cabinet propose military action. The House votes on an authorisation.'; },
      options: [
        { label: 'Back the invasion', sub: 'Most voters agree; the far left and Greens object.', act: function (Q) { F(Q).afghan = S.now(Q); approve(Q, 4); H.camp(Q, { suburb: 0.3, rural: 0.3, young: -0.3 }, 'Afghanistan'); H.rel(Q, S.greenId(Q), -6); H.fac(Q, { proglib: 3, heartland: -3 }); return 'Congress authorises force by a wide margin. By December the Taliban have fallen in Kabul.'; } },
        { label: 'Back limited strikes, with allies and a UN mandate', sub: 'A narrower war; hawks call it timid.', act: function (Q) { F(Q).afghan = S.now(Q); F(Q).afghanLimited = 1; approve(Q, 2); H.rel(Q, 'cc', -3); H.rel(Q, 'cdp', 2); H.fac(Q, { proglib: -2, newdem: 2 }); return 'A NATO-led operation goes in with a UN mandate. The CC says it should be bigger.'; } },
        { label: 'Vote against', sub: 'The left approves; most voters do not.', act: function (Q) { F(Q).afghan = S.now(Q); approve(Q, 0, 0); H.camp(Q, { young: 0.4, prof: 0.1, suburb: -0.5, rural: -0.5, retire: -0.4 }, 'Afghanistan'); H.rel(Q, S.greenId(Q), 8); H.fac(Q, { newdem: 10, heartland: 8, proglib: -4 }); return 'The LDP votes no. The war goes ahead anyway, and the CC accuses the LDP of weakness.'; } }
      ] },
    { id: 'enron', title: 'Enron collapses', when: function (Q) { return at(Q, 2001, 12) && once(Q, 'enron', 0.6); },
      body: function () { return 'Enron, the Houston energy giant, collapses amid accounting fraud. Thousands of employees lose their pensions. Calls grow for corporate-governance reform.'; },
      options: [
        { label: 'Push tough corporate-accountability laws', sub: 'Popular; business donors less so.', act: function (Q) { F(Q).corpReform = 1; H.camp(Q, { union: 0.4, prof: 0.3, retire: 0.3 }, 'Enron'); Q.funds -= 1; H.rel(Q, 'sdlp', 4); return 'Auditors and executives face new criminal penalties. Donors grumble.'; } },
        { label: 'Leave it to the regulators', sub: 'Business relieved; voters unimpressed.', act: function (Q) { Q.funds += 1; H.camp(Q, { union: -0.3 }, 'Enron'); return 'The LDP calls for calm. The SDLP calls it a cover-up.'; } }
      ] },
    { id: 'iraq', title: 'The case for war in Iraq', when: function (Q) { return at(Q, 2002, 9) && F(Q).afghan && hawk(Q, Q.president.party) && once(Q, 'iraq', 0.75); },
      body: function (Q) { return 'President ' + pres(Q) + ' says Saddam Hussein has weapons of mass destruction and must be disarmed by force. Allies are split, and the UN inspectors want more time. The House must vote on an authorisation; the LDP’s votes could decide it.'; },
      options: [
        { label: 'Vote for the war', sub: 'Hawks and the New Democrats approve. Risky if it goes wrong.', act: function (Q) { return Ev.iraqVote(Q, 'yes'); } },
        { label: 'Demand a second UN resolution first', sub: 'A middle course.', act: function (Q) { return Ev.iraqVote(Q, 'un'); } },
        { label: 'Vote against', sub: 'The left and the young approve.', act: function (Q) { return Ev.iraqVote(Q, 'no'); } }
      ] },
    { id: 'iraq_insurgency', title: 'Iraq: the insurgency', when: function (Q) { return F(Q).iraq && S.now(Q) >= F(Q).iraq + 14; },
      body: function () { return 'No weapons of mass destruction have been found. The occupation faces a growing insurgency, and American deaths pass one thousand. The war has become unpopular.'; },
      options: [
        { label: 'Call for a timetable to withdraw', sub: 'Popular with most voters; hawks object.', act: function (Q) { F(Q).iraqTimetable = 1; H.camp(Q, { young: 0.5, prof: 0.4, suburb: 0.2 }, 'Iraq'); H.fac(Q, { newdem: 4, proglib: -4 }); Q.morale += 3; return 'The LDP sets out a withdrawal timetable.'; } },
        { label: 'Stay the course', sub: 'Loyal to the war’s backers.', act: function (Q) { H.camp(Q, { young: -0.4, prof: -0.3, rural: 0.2 }, 'Iraq'); H.fac(Q, { proglib: 6 }); return 'The LDP says the job must be finished.'; } }
      ] },
    { id: 'surge', title: 'The surge', when: function (Q) { return F(Q).iraq && at(Q, 2007, 1) && !F(Q).iraqOver; },
      body: function (Q) { return 'With Iraq near civil war, President ' + pres(Q) + ' proposes sending 20,000 more troops.'; },
      options: [
        { label: 'Support the surge', act: function (Q) { if (chance(Q, 0.6)) { approve(Q, 2); F(Q).iraqOver = S.now(Q); return 'Violence falls through 2007. The war fades from the headlines.'; } approve(Q, -3); H.camp(Q, { young: -0.3 }, 'Iraq'); return 'The surge fails to stop the killing.'; } },
        { label: 'Oppose it: bring the troops home', act: function (Q) { H.camp(Q, { young: 0.4, prof: 0.3, rural: -0.2 }, 'Iraq'); H.rel(Q, S.greenId(Q), 4); return 'The LDP votes against more troops.'; } }
      ] },
    { id: 'binladen', title: 'Bin Laden', when: function (Q) { return F(Q).afghan && at(Q, 2010, 6) && chance(Q, 0.06); },
      body: function (Q) { return 'Special forces kill Osama bin Laden in a raid on a compound in Pakistan. President ' + pres(Q) + ' announces it at midnight.'; },
      options: [{ label: 'Praise the operation', act: function (Q) { approve(Q, 5, 8); if (gov(Q)) H.camp(Q, V.all(0.3), 'Bin Laden'); return 'Crowds gather outside the White House. The government’s ratings jump.'; } }] },

    // ---- society ----
    { id: 'marriage', title: 'Same-sex marriage', when: function (Q) { return at(Q, 2003, 11); },
      body: function () { return 'Massachusetts’s highest court rules that same-sex couples have the right to marry. Religious conservatives demand a constitutional amendment banning it; the CC and the Constitution Party campaign on it.'; },
      options: [
        { label: 'Support marriage equality', sub: 'Young and professional voters approve; religious voters do not.', act: function (Q) { F(Q).marriage = 'yes'; H.shift(Q, 0, -1); H.camp(Q, { young: 0.6, prof: 0.4, relig: -0.6, rural: -0.3 }, 'Marriage'); H.fac(Q, { chrlib: 8, heartland: 6, proglib: -6 }); return 'The LDP backs equal marriage. The Christian Liberals are uneasy.'; } },
        { label: 'Civil unions, not marriage', sub: 'The cautious middle.', act: function (Q) { F(Q).marriage = 'unions'; H.camp(Q, { suburb: 0.2, relig: 0.1, young: -0.2 }, 'Marriage'); H.fac(Q, { proglib: 4, chrlib: -2 }); return 'The LDP proposes civil unions with equal rights.'; } },
        { label: 'Leave it to the states', sub: 'Federalist; avoids a national fight.', act: function (Q) { H.camp(Q, { rural: 0.1 }, 'Marriage'); H.fac(Q, { proglib: 3 }); return 'The LDP says each state should decide.'; } }
      ] },
    { id: 'katrina', title: 'Hurricane Katrina', when: function (Q) { return at(Q, 2005, 8) && once(Q, 'katrina', 0.5); },
      body: function (Q) { return 'A huge hurricane breaks the levees of New Orleans. Thousands are trapped on rooftops for days. ' + (gov(Q) ? 'The federal response is the government’s responsibility.' : 'The government’s response is slow.'); },
      options: [
        { label: function (Q) { return gov(Q) ? 'Mobilise everything, whatever the cost' : 'Attack the government’s failure'; }, act: function (Q) {
          if (gov(Q)) { Q.spending = (Q.spending || 0) + 0.3; approve(Q, 2); H.camp(Q, { black: 0.5 }, 'Katrina'); return 'The Army and FEMA flood the Gulf Coast with help. It is slow, but credited.'; }
          approve(Q, -8); H.camp(Q, { black: 0.6, prof: 0.2 }, 'Katrina'); return 'Images of stranded families dominate the news. The government’s approval collapses.'; } }
      ] },
    { id: 'immigration', title: 'Immigration reform', when: function (Q) { return at(Q, 2006, 4) && once(Q, 'immigration', 0.5); },
      body: function () { return 'Huge marches demand a path to citizenship for undocumented immigrants. A cross-party bill pairs legalisation with border security; the CC’s base is furious.'; },
      options: [
        { label: 'Back the bill', sub: 'Hispanic voters approve.', act: function (Q) { F(Q).immReform = 1; H.camp(Q, { hisp: 0.9, prof: 0.2, rural: -0.4, union: -0.2 }, 'Immigration'); H.fac(Q, { heartland: 5 }); return Ev.vote(Q, 'Immigration reform', -2, 2, function () { return 'The bill becomes law: millions can earn citizenship.'; }, function () { return 'The bill fails. Hispanic voters notice who stood with them.'; }); } },
        { label: 'Border security first', sub: 'Rural voters approve; Hispanic voters do not.', act: function (Q) { H.camp(Q, { hisp: -0.7, rural: 0.4 }, 'Immigration'); H.fac(Q, { proglib: 5 }); return 'The LDP backs enforcement first.'; } }
      ] },
    { id: 'sandyhook', title: 'Sandy Hook', when: function (Q) { return at(Q, 2012, 12) && once(Q, 'sandyhook', 0.6); },
      body: function () { return 'A gunman kills twenty children and six staff at an elementary school in Newtown, Connecticut.'; },
      options: [
        { label: 'Push background checks and an assault-weapons ban', act: function (Q) { H.camp(Q, { suburb: 0.4, prof: 0.4, rural: -0.5 }, 'Gun safety'); H.fac(Q, { heartland: 8 }); return 'The LDP puts gun safety at the top of its agenda.'; } },
        { label: 'Mourn, and focus on mental health', act: function (Q) { H.camp(Q, { rural: 0.1, suburb: -0.1 }, 'Gun safety'); H.fac(Q, { proglib: 5 }); return 'The LDP avoids a fight over guns.'; } }
      ] },

    // ---- the economy: housing, the crash (fixed), the response ----
    { id: 'housing', title: 'A housing bubble?', when: function (Q) { return at(Q, 2006, 6); },
      body: function () { return 'House prices have doubled in five years. Subprime mortgages are sold to borrowers who cannot repay, and banks pile up mortgage-backed securities. A few economists warn of a crash.'; },
      options: [
        { label: 'Rein in subprime lending and bank leverage', sub: 'Banks and homebuilders object; it may soften a crash.', act: function (Q) { if (gov(Q)) F(Q).housingCurbed = 1; Q.econ.shock = (Q.econ.shock || 0) - 0.4; Q.funds -= 1; H.camp(Q, { prof: 0.2, suburb: -0.2 }, 'Housing'); return gov(Q) ? 'New lending standards slow the boom.' : 'The LDP proposes curbs; the government ignores them.'; } },
        { label: 'Leave the market alone', sub: 'The boom goes on.', act: function (Q) { Q.funds += 1; return 'The boom continues.'; } }
      ] },
    { id: 'crash', title: 'The crash of 2008', when: function (Q) { return at(Q, 2008, 9) && !F(Q).crash; },
      body: function (Q) { return 'Lehman Brothers collapses. Credit freezes worldwide; the stock market loses a fifth of its value in weeks. ' + (F(Q).housingCurbed ? 'The lending curbs of 2006 have left American banks a little stronger than their rivals.' : 'American banks are drowning in bad mortgages.') + ' The Treasury proposes a $700 billion rescue of the banks. The House votes this week.'; },
      options: [
        { label: 'Vote for the bank rescue', sub: 'Shallower recession; voters furious at bailing out Wall Street.', act: function (Q) { return Ev.crash(Q, 'yes'); } },
        { label: 'Vote for a rescue with strings: pay caps and public stakes', sub: 'Harder to pass.', act: function (Q) { return Ev.crash(Q, 'strings'); } },
        { label: 'Vote against', sub: 'Populist; risks a depression.', act: function (Q) { return Ev.crash(Q, 'no'); } }
      ] },
    { id: 'stimulus', title: 'Stimulus', when: function (Q) { return F(Q).crash && S.now(Q) >= F(Q).crash + 4; },
      body: function (Q) { return 'Unemployment is ' + Q.econ.unemp.toFixed(1) + '% and rising. Economists urge a stimulus package.'; },
      options: [
        { label: 'A large stimulus: infrastructure, aid to states, tax credits', sub: 'Faster recovery; a much bigger deficit.', act: function (Q) { if (gov(Q)) { Q.policyGrowth = (Q.policyGrowth || 0) + 0.6; Q.spending = (Q.spending || 0) + 1.5; F(Q).bigStimulus = 1; } H.camp(Q, { union: 0.4, young: 0.2, retire: -0.2 }, 'Stimulus'); H.rel(Q, 'sdlp', 5); H.rel(Q, 'cdp', -4); return gov(Q) ? 'The government passes an $800 billion package.' : 'The LDP calls for a big package.'; } },
        { label: 'A modest, targeted package', act: function (Q) { if (gov(Q)) { Q.policyGrowth = (Q.policyGrowth || 0) + 0.3; Q.spending = (Q.spending || 0) + 0.6; } return 'A smaller package passes with cross-party support.'; } },
        { label: 'Austerity: balance the budget', sub: 'Pleases the CDP; slows the recovery.', act: function (Q) { if (gov(Q)) Q.policyGrowth = (Q.policyGrowth || 0) - 0.3; H.rel(Q, 'cdp', 5); H.rel(Q, 'sdlp', -6); H.camp(Q, { suburb: 0.2, union: -0.5 }, 'Austerity'); return 'Spending is cut. Unemployment stays high.'; } }
      ] },
    { id: 'autos', title: 'Detroit on the brink', when: function (Q) { return F(Q).crash && S.now(Q) >= F(Q).crash + 3 && once(Q, 'autos', 0.7); },
      body: function () { return 'General Motors and Chrysler are days from bankruptcy. A million jobs in the Great Lakes depend on them.'; },
      options: [
        { label: 'Rescue the car makers', sub: 'Michigan and Ohio grateful.', act: function (Q) { H.camp(Q, { union: 0.6 }, 'Auto rescue'); H.region(Q, 'MW', 0.6, 'Auto rescue'); H.rel(Q, 'sdlp', 4); return 'Washington takes stakes in GM and Chrysler. The industry survives.'; } },
        { label: 'Let them go through bankruptcy', act: function (Q) { H.camp(Q, { union: -0.6, suburb: 0.2 }, 'Auto rescue'); H.region(Q, 'MW', -0.6, 'Auto rescue'); return 'The companies enter bankruptcy. Plants close across the Midwest.'; } }
      ] },
    { id: 'teaparty', title: 'The Tea Party', when: function (Q) { return F(Q).crash && S.now(Q) >= F(Q).crash + 6 && (F(Q).bailout || F(Q).bigStimulus); },
      body: function () { return 'Angry rallies against bailouts, deficits and Washington spread across the country. The movement is loudest on the right, but it frightens every incumbent.'; },
      options: [
        { label: 'Answer with deficit reduction', sub: 'Blue Dogs pleased.', act: function (Q) { H.fac(Q, { heartland: -6, proglib: 5 }); H.camp(Q, { suburb: 0.3, retire: 0.2 }, 'Tea Party'); return 'The LDP promises to cut the deficit once the recovery is secure.'; } },
        { label: 'Dismiss it as an astroturf campaign', act: function (Q) { H.camp(Q, { young: 0.2, rural: -0.4, retire: -0.3 }, 'Tea Party'); return 'The movement grows anyway.'; } }
      ],
      after: true },
    { id: 'healthcare', title: 'Health care for all?', when: function (Q) { return at(Q, 2009, 6) && gov(Q) && !F(Q).healthDone; },
      body: function () { return 'Fifty million Americans have no health insurance. The SDLP demands a public option; the CDP will only back market reforms.'; },
      options: [
        { label: 'Universal coverage with a public option', sub: 'The SDLP and UL approve; the CDP walks.', act: function (Q) { F(Q).healthDone = 1; H.shift(Q, -1, 0); return Ev.vote(Q, 'Universal health care', -5, 0, function () { H.camp(Q, { union: 0.6, black: 0.5, hisp: 0.5, young: 0.3, retire: -0.2 }, 'Health care'); H.rel(Q, 'sdlp', 8); return 'Universal coverage becomes law. It is the government’s biggest achievement.'; }, function () { approve(Q, -4); return 'The bill fails by a handful of votes.'; }); } },
        { label: 'Market-based reform: exchanges and subsidies', sub: 'The CDP may back it.', act: function (Q) { F(Q).healthDone = 1; return Ev.vote(Q, 'Health insurance reform', 1, 0, function () { H.camp(Q, { suburb: 0.3, hisp: 0.3, black: 0.2 }, 'Health care'); H.rel(Q, 'cdp', 6); return 'The reform passes with Christian Democratic votes. Twenty million people gain cover.'; }, function () { return 'The reform fails.'; }); } },
        { label: 'Not now: the economy first', act: function (Q) { F(Q).healthDone = 1; H.rel(Q, 'sdlp', -6); H.fac(Q, { proglib: 8 }); return 'Health reform is shelved.'; } }
      ] },
    { id: 'deepwater', title: 'Oil in the Gulf', when: function (Q) { return at(Q, 2010, 4) && once(Q, 'deepwater', 0.4); },
      body: function () { return 'The Deepwater Horizon rig explodes, killing eleven workers. Oil gushes into the Gulf of Mexico for weeks.'; },
      options: [
        { label: 'Moratorium on deep-water drilling', sub: 'Environmentalists approve; the Gulf states do not.', act: function (Q) { H.camp(Q, { young: 0.3, prof: 0.3 }, 'Oil spill'); H.region(Q, 'SO', -0.3, 'Oil spill'); H.rel(Q, S.greenId(Q), 4); H.rel(Q, 'lsp', -6); return 'Drilling is paused.'; } },
        { label: 'Make BP pay, keep drilling', act: function (Q) { H.region(Q, 'SO', 0.2, 'Oil spill'); return 'BP sets up a $20 billion fund.'; } }
      ] },
    { id: 'wallst', title: 'Wall Street reform', when: function (Q) { return F(Q).crash && at(Q, 2010, 3) && gov(Q) && !F(Q).wallst; },
      body: function () { return 'Two years after the crash, the government drafts new rules for the banks.'; },
      options: [
        { label: 'Break up the big banks', sub: 'Popular on the left; donors furious.', act: function (Q) { F(Q).wallst = 1; return Ev.vote(Q, 'Breaking up the banks', -5, -2, function () { Q.funds -= 3; H.camp(Q, { union: 0.4, young: 0.4, rural: 0.2 }, 'Bank reform'); return 'The big banks will be split up.'; }, function () { return 'The bill fails.'; }); } },
        { label: 'Tougher rules and a consumer protection bureau', act: function (Q) { F(Q).wallst = 1; return Ev.vote(Q, 'Financial regulation', -2, 0, function () { Q.funds -= 1; H.camp(Q, { prof: 0.3, suburb: 0.2 }, 'Bank reform'); return 'New capital rules and a consumer watchdog become law.'; }, function () { return 'The bill fails.'; }); } }
      ] },
    { id: 'arabspring', title: 'The Arab Spring', when: function (Q) { return at(Q, 2011, 3); },
      body: function () { return 'Revolutions sweep the Arab world. In Libya, Gaddafi’s forces advance on Benghazi and promise no mercy. France and Britain propose a no-fly zone.'; },
      options: [
        { label: 'Join the no-fly zone', sub: 'Hawks approve; the far left does not.', act: function (Q) { F(Q).libya = 1; H.rel(Q, S.greenId(Q), -4); H.fac(Q, { newdem: 2 }); return 'NATO jets halt the advance on Benghazi.'; } },
        { label: 'Stay out', act: function (Q) { H.rel(Q, 'lib', 3); return 'America stays out; Europe acts alone.'; } }
      ] },
    { id: 'occupy', title: 'Occupy Wall Street', when: function (Q) { return F(Q).crash && at(Q, 2011, 9); },
      body: function () { return 'Protesters camp in Zuccotti Park under the slogan "We are the 99%". The camps spread to dozens of cities.'; },
      options: [
        { label: 'Embrace the movement’s message on inequality', sub: 'Young voters approve; the far left gains anyway.', act: function (Q) { H.camp(Q, { young: 0.5, union: 0.2, suburb: -0.2 }, 'Occupy'); H.fac(Q, { newdem: 5, proglib: -3 }); return 'The LDP adopts a millionaires’ tax.'; } },
        { label: 'Keep your distance', act: function (Q) { V.campaign(Q, S.greenId(Q), { young: 0.6 }, null); return 'The movement’s energy flows to the far left.'; } }
      ] }
  ];

  // a House and Senate vote on a measure; lean: how far right it sits (negative = left)
  Ev.vote = function (Q, title, econ, soc, yes, no) {
    var pos = U.Elections.pos(Q), b = { econ: econ, soc: soc, fed: 0 }, ppos = Q.pos[Q.player];
    var decide = function (p) { if (p === Q.player) return 'yes'; var d = U.Electoral.dist(pos[p], b), dq = U.Electoral.dist(pos[p], ppos); if (Q.gov && Q.gov.coalition.indexOf(p) >= 0) return d < dq + 3 ? 'yes' : 'abstain'; return d < dq - 0.5 ? 'yes' : d < dq + 1 ? 'abstain' : 'no'; };
    var h = U.Parliament.count(Q, 'house', decide), s = U.Parliament.count(Q, 'senate', decide);
    var proc = S.legislativeProcess ? S.legislativeProcess(Q, h, s, false) : { status: U.simple(h) ? 'law' : 'defeated', text: '' };
    Q.lastVote = { title: title, house: h, senate: s, proc: proc.status, kind: 'bill' };
    var tally = ' (House ' + h.yes + '–' + h.no + ', Senate ' + s.yes + '–' + s.no + ')';
    if (proc.status === 'law') return yes() + tally;
    if (proc.status === 'delayed') { Q.govApproval -= 1; return 'The Senate delays it by up to two years.' + tally; }
    return no() + ' ' + (proc.text || '') + tally;
  };
  Ev.iraqVote = function (Q, line) {
    var pp = Q.president.party;
    var decide = function (p) { if (p === Q.player) return line === 'yes' ? 'yes' : line === 'un' ? 'abstain' : 'no'; if (p === pp) return 'yes'; return hawk(Q, p) ? 'yes' : (U.PARTY_PROFILES[p] || { ax: {} }).ax.foreign > 0 ? 'abstain' : 'no'; };
    var h = U.Parliament.count(Q, 'house', decide); Q.lastVote = { title: 'Iraq war authorisation', house: h };
    if (line === 'yes') H.fac(Q, { proglib: -3, newdem: 8, heartland: -2 }); else if (line === 'no') { H.camp(Q, { young: 0.4, prof: 0.2, rural: -0.3 }, 'Iraq'); H.fac(Q, { proglib: 6 }); H.rel(Q, S.greenId(Q), 5); }
    if (U.simple(h)) { F(Q).iraq = S.now(Q); F(Q).iraqVote = line; approve(Q, 3); return 'The House authorises war, ' + h.yes + ' to ' + h.no + '. In March 2003 the invasion begins; Baghdad falls in three weeks.'; }
    F(Q).noIraq = 1; return 'The House refuses, ' + h.yes + ' to ' + h.no + '. There will be no invasion of Iraq.';
  };
  Ev.crash = function (Q, line) {
    F(Q).crash = S.now(Q);
    var base = F(Q).housingCurbed ? -6 : -9; Q.econ.slowShock = S.now(Q) + 30;
    var decide = function (p) { if (p === Q.player) return line === 'no' ? 'no' : 'yes'; if (Q.gov && Q.gov.coalition.indexOf(p) >= 0) return 'yes'; var pr = (U.PARTY_PROFILES[p] || { ax: {} }).ax; return (pr.pop || 0) > 5 ? 'no' : (pr.econ || 0) > 2 || (pr.econ || 0) < -6 ? 'no' : 'yes'; };
    var h = U.Parliament.count(Q, 'house', decide), pass = U.simple(h) && !(line === 'strings' && chance(Q, 0.3));
    Q.lastVote = { title: 'Bank rescue', house: h };
    if (pass) { F(Q).bailout = 1; Q.econ.shock = (Q.econ.shock || 0) + base * 0.85; approve(Q, -6); if (line !== 'no') H.camp(Q, { union: -0.4, rural: -0.4, young: -0.3 }, 'Bank rescue'); else H.camp(Q, { union: 0.3, rural: 0.4 }, 'Bank rescue');
      return 'The rescue passes, ' + h.yes + ' to ' + h.no + '. The banks survive, but the Great Recession begins: growth turns sharply negative.'; }
    Q.econ.shock = (Q.econ.shock || 0) + base * 1.3; approve(Q, -10);
    if (line === 'no') H.camp(Q, { union: 0.3, rural: 0.4 }, 'Bank rescue');
    return 'The rescue fails, ' + h.yes + ' to ' + h.no + '. Markets crash again and banks fail across the country: the Great Recession will be deep.';
  };

  Ev.LIST.push.apply(Ev.LIST, LIST.filter(function (e) { return e.id !== 'crash'; }));
  // the crash is fixed: it goes first, like September 11
  Ev.LIST.unshift(LIST.filter(function (e) { return e.id === 'crash'; })[0]);
})(typeof globalThis !== 'undefined' ? globalThis : window);
