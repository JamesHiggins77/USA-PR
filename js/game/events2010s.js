// Events, 2013-2028. COVID-19 (March 2020) and Russia's invasion of Ukraine
// (February 2022) are fixed; the rest depend on who governs and on chance.
// The government's choices move its parties' support among the groups affected.
(function (G) {
  'use strict';
  var U = G.USA, V = U.Votes, S = U.Game, Ev = U.Events;
  function at(Q, y, m) { return Q.year > y || (Q.year === y && Q.month >= m); }
  function once(Q, id, p) { var k = 'roll_' + id; if (Q.flags[k] == null) Q.flags[k] = U.rng(Q) < p; return Q.flags[k]; }
  var F = function (Q) { return Q.flags; };
  var pmp = function (Q) { return Q.gov ? Q.gov.pm + ' (' + U.PARTIES[Q.gov.pmParty].short + ')' : 'the caretaker government'; };
  var pres = function (Q) { return Q.president.name + ' (' + U.PARTIES[Q.president.party].short + ')'; };
  var approve = function (Q, g, p) { Q.govApproval += g; Q.president.approval += (p == null ? g : p); };
  // the governing parties gain or lose among groups (the PM's party most)
  var gov = function (Q, groups, reason) { (Q.gov ? Q.gov.coalition : []).forEach(function (p, i) { var o = {}; for (var g in groups) o[g] = groups[g] * (i ? 0.6 : 1); V.campaign(Q, p, o, reason || null); }); };
  var party = function (Q, p, groups) { if (!Q.dormant[p] && U.PARTIES[p]) V.campaign(Q, p, groups, null); };
  var done = function (id) { return function (Q) { F(Q)[id] = S.now(Q); }; };
  var mk = function (id, title, y, m, p, body, options) {
    return { id: id, title: title, when: function (Q) { return at(Q, y, m) && !F(Q)[id] && (p >= 1 || once(Q, id, p)); }, body: body,
      options: options.map(function (o) { return { label: o[0], sub: o[1], act: function (Q) { F(Q)[id] = S.now(Q); return o[2](Q); } }; }) };
  };

  var LIST = [
    mk('fiscal_cliff', 'The fiscal cliff', 2013, 1, 0.8, function (Q) { return 'Tax cuts expire and automatic spending cuts loom at once. Prime Minister ' + pmp(Q) + ' must find a deal in the House.'; }, [
      ['A balanced deal: higher taxes on the rich, slower spending', 'Most voters approve; both wings grumble.', function (Q) { approve(Q, 2); gov(Q, { prof: .2, suburb: .1, union: .1, rural: -.1 }); return 'A deal passes at the last minute. Markets rally.'; }],
      ['Let the spending cuts happen', 'Deficit hawks cheer; the military and the poor take the hit.', function (Q) { approve(Q, -2); Q.econ.shock = (Q.econ.shock || 0) - 0.6; gov(Q, { suburb: .2, union: -.3, black: -.2, retire: -.1 }); return 'The sequester begins. Growth slows by half a point.'; }]]),
    mk('ferguson', 'Ferguson', 2014, 8, 0.75, function () { return 'A police officer kills Michael Brown, an unarmed Black teenager, in Ferguson, Missouri. Protests spread across the country, and Black Lives Matter becomes a national movement.'; }, [
      ['Federal police reform: body cameras and civil-rights inquiries', 'Black and young voters approve; police unions and rural voters object.', function (Q) { approve(Q, 0); gov(Q, { black: .4, young: .2, hisp: .1, rural: -.2, retire: -.1 }); return 'The Justice Department opens inquiries into police departments across the country.'; }],
      ['Back the police and call for calm', 'Suburban and older voters approve; Black voters are angry.', function (Q) { gov(Q, { suburb: .2, retire: .2, rural: .1, black: -.5, young: -.3 }); party(Q, 'rbw', { black: .3, young: .2 }); return 'The National Guard restores order. The Rainbow Coalition and the far left gain.'; }]]),
    mk('refugees15', 'Refugees from Syria', 2015, 9, 0.7, function () { return 'A million refugees from Syria’s civil war reach Europe. Allies ask the United States to take its share.'; }, [
      ['Take 100,000 refugees', 'Humanitarians cheer; immigration hawks campaign against it.', function (Q) { gov(Q, { young: .2, prof: .2, rural: -.3, retire: -.2 }); party(Q, 'maga', { rural: .2 }); party(Q, 'afp', { rural: .2 }); return 'The first refugee flights land in December.'; }],
      ['Take a token number with tough vetting', 'A cautious middle course.', function (Q) { gov(Q, { suburb: .1 }); return 'Ten thousand are admitted after two years of vetting.'; }]]),
    mk('opioids', 'The opioid epidemic', 2017, 10, 0.8, function () { return 'Overdose deaths pass seventy thousand a year, highest in Appalachia, New England and the Rust Belt. The President declares a public-health emergency.'; }, [
      ['Fund treatment and sue the drug makers', 'Popular across the board; costs $30 billion.', function (Q) { approve(Q, 2); gov(Q, { rural: .3, union: .2, retire: .1 }); Q.spending = (Q.spending || 0) + 1; return 'Purdue Pharma is driven into bankruptcy; treatment centres open across the Midwest.'; }],
      ['Crack down on dealers and the border', 'Rural and older voters approve; reformers say it repeats the drug war.', function (Q) { gov(Q, { rural: .2, retire: .2, black: -.2, young: -.2 }); return 'Mandatory sentences return for fentanyl dealing.'; }]]),
    mk('metoo', '#MeToo', 2017, 10, 0.7, function () { return 'Accusations against the film producer Harvey Weinstein unleash a wave of testimony about sexual harassment. Several members of Congress resign.'; }, [
      ['Overhaul Congress’s harassment rules', 'Professional women and young voters approve.', function (Q) { gov(Q, { prof: .2, young: .2, suburb: .1 }); return 'Settlements paid with public money end; complaints go to an independent office.'; }],
      ['Leave it to the parties', 'Saves embarrassment, for now.', function (Q) { approve(Q, -1); gov(Q, { prof: -.1, young: -.1 }); return 'Each party handles its own cases. Two more resignations follow anyway.'; }]]),
    mk('tradewar', 'Tariffs on China', 2018, 3, 0.6, function (Q) { return 'Steel towns and soybean farmers both blame China. President ' + pres(Q) + ' proposes tariffs on $250 billion of Chinese goods.'; }, [
      ['Impose the tariffs', 'Industrial workers cheer; farmers fear retaliation.', function (Q) { gov(Q, { union: .3, rural: -.2, prof: -.2 }); Q.econ.infl += 0.3; return 'China retaliates against American soybeans; the government sends farmers $28 billion in aid.'; }],
      ['Negotiate with allies instead', 'Free traders approve; the Rust Belt is unimpressed.', function (Q) { gov(Q, { prof: .2, suburb: .1, union: -.2 }); return 'A joint complaint goes to the WTO. Little changes.'; }]]),
    mk('gnd', 'A Green New Deal', 2019, 2, 0.6, function () { return 'Young activists occupy congressional offices demanding a Green New Deal: clean energy, jobs and a ten-year transition.'; }, [
      ['Pass a clean-energy investment bill', 'Young and professional voters approve; coal country and drivers worry.', function (Q) { gov(Q, { young: .4, prof: .2, rural: -.3, union: -.1 }); return 'Wind, solar and battery plants are subsidised for a decade. Coal states fight back in the courts.'; }],
      ['Promise a study', 'Activists denounce it.', function (Q) { gov(Q, { young: -.3, rural: .1 }); party(Q, 'grn', { young: .2 }); party(Q, 'ul', { young: .2 }); return 'A commission is appointed. The Greens and the United Left gain.'; }]]),
    { id: 'covid', title: 'COVID-19', when: function (Q) { return at(Q, 2020, 3) && !F(Q).covid; },
      body: function (Q) { return 'A new coronavirus from Wuhan spreads around the world. Hospitals in New York are overwhelmed. Prime Minister ' + pmp(Q) + ' must decide how far to shut the country down.'; },
      options: [
        { label: 'Lockdowns, with huge relief payments', sub: 'Saves lives; the deficit explodes; small business and rural voters chafe.', act: function (Q) { F(Q).covid = S.now(Q); Q.econ.shock = (Q.econ.shock || 0) - 7; Q.econ.slowShock = S.now(Q) + 18; approve(Q, 5); gov(Q, { retire: .4, prof: .2, black: .2, rural: -.4, relig: -.2 }); return 'Most of the country stays home for two months. Checks go to every household; unemployment briefly passes 14%.'; } },
        { label: 'Keep the economy open and protect the vulnerable', sub: 'Fewer job losses, more deaths.', act: function (Q) { F(Q).covid = S.now(Q); Q.econ.shock = (Q.econ.shock || 0) - 4; approve(Q, -5); gov(Q, { rural: .3, relig: .2, retire: -.5, black: -.3, prof: -.2 }); return 'Businesses stay open. Hospitals in the cities are overwhelmed through the winter.'; } }] },
    mk('floyd', 'George Floyd', 2020, 6, 0.85, function () { return 'A Minneapolis police officer kneels on George Floyd’s neck for nine minutes. The largest protests in American history follow.'; }, [
      ['Pass the Justice in Policing Act', 'Black and young voters approve; police unions and suburbs split.', function (Q) { gov(Q, { black: .5, young: .3, hisp: .2, suburb: -.1, rural: -.3 }); party(Q, 'rbw', { black: .3 }); return 'Chokeholds are banned nationwide and police misconduct becomes easier to prosecute.'; }],
      ['Promise law and order', 'Older and rural voters approve; Black voters turn away.', function (Q) { gov(Q, { retire: .3, rural: .3, black: -.6, young: -.4 }); party(Q, 'rbw', { black: .5, young: .3 }); party(Q, 'ul', { young: .2 }); return 'Troops are deployed in several cities. The left surges in the polls.'; }]]),
    { id: 'capitol', title: 'The Capitol riot', when: function (Q) { return at(Q, 2021, 1) && !F(Q).capitol && !Q.dormant.maga && once(Q, 'capitol', 0.5); },
      body: function () { return 'A crowd of MAGA supporters, told the election was stolen, storms the Capitol as Congress meets. Five people die.'; },
      options: [
        { label: 'Prosecute the rioters and investigate the organisers', sub: 'Most voters approve; MAGA calls it persecution.', act: function (Q) { F(Q).capitol = S.now(Q); approve(Q, 3); party(Q, 'maga', { suburb: -.4, prof: -.3, rural: .1 }); return 'Over a thousand people are charged. A select committee holds televised hearings.'; } },
        { label: 'Turn the page', sub: 'Avoids a fight; critics say it invites a repeat.', act: function (Q) { F(Q).capitol = S.now(Q); approve(Q, -2); party(Q, 'maga', { rural: .2 }); return 'There are few prosecutions. MAGA recovers within months.'; } }] },
    { id: 'ukraine', title: 'Russia invades Ukraine', when: function (Q) { return at(Q, 2022, 2) && !F(Q).ukraine; },
      body: function (Q) { return 'Russian forces invade Ukraine from three sides. Kyiv holds. President ' + pres(Q) + ' and the cabinet must decide how far to help.'; },
      options: [
        { label: 'Arm Ukraine and sanction Russia', sub: 'Most voters approve; isolationists object; energy prices rise.', act: function (Q) { F(Q).ukraine = S.now(Q); approve(Q, 3); Q.econ.infl += 1.5; gov(Q, { prof: .2, suburb: .2, retire: .1, rural: -.1 }); party(Q, 'maga', { rural: .2 }); return 'Weapons and money flow to Kyiv. Gas prices pass $5 a gallon by June.'; } },
        { label: 'Sanctions only; no weapons', sub: 'Avoids escalation; hawks call it weakness.', act: function (Q) { F(Q).ukraine = S.now(Q); approve(Q, -2); Q.econ.infl += 0.8; gov(Q, { rural: .1, prof: -.2, retire: -.1 }); return 'Europe takes the lead. The war grinds on.'; } }] },
    mk('dobbs', 'Abortion and the courts', 2022, 6, 0.7, function () { return 'The Supreme Court overturns Roe v. Wade. Abortion law returns to the states, and half of them ban it.'; }, [
      ['Write abortion rights into federal law', 'Professional and young women surge to the governing parties; religious voters are furious.', function (Q) { gov(Q, { prof: .4, young: .4, suburb: .3, relig: -.5, rural: -.3 }); return 'The Women’s Health Protection Act passes the House; the Senate decides its fate.'; }],
      ['Leave it to the states', 'Religious voters approve; suburban women are angry.', function (Q) { gov(Q, { relig: .4, rural: .2, prof: -.4, suburb: -.3, young: -.3 }); return 'Ballot measures follow in a dozen states. Most protect abortion rights.'; }]]),
    mk('ai', 'Artificial intelligence', 2023, 4, 0.8, function () { return 'Chatbots that write, code and draw reach a hundred million users in weeks. Workers fear for their jobs; investors pour in billions.'; }, [
      ['Regulate: safety tests and labelling', 'Unions and older voters approve; the tech industry warns of falling behind.', function (Q) { gov(Q, { union: .2, retire: .2, prof: -.1, young: -.1 }); return 'An AI Safety Office is created to test the most powerful models.'; }],
      ['Back the industry to beat China', 'Investors and young professionals approve.', function (Q) { gov(Q, { prof: .3, young: .2, union: -.2 }); Q.econ.growth += 0.3; return 'Data-centre building booms; electricity prices rise in Virginia and Texas.'; }]]),
    mk('border24', 'A crisis at the border', 2024, 1, 0.65, function () { return 'Record numbers of migrants cross the southern border. Cities from New York to Chicago run out of shelter space.'; }, [
      ['Tougher border rules and faster hearings', 'Popular with most voters; Hispanic and young voters object.', function (Q) { gov(Q, { rural: .3, retire: .3, suburb: .2, hisp: -.3, young: -.2 }); return 'Crossings fall by half within six months.'; }],
      ['A path to citizenship with more judges', 'Hispanic voters approve; immigration hawks campaign against it.', function (Q) { gov(Q, { hisp: .4, young: .2, rural: -.4, retire: -.2 }); party(Q, 'maga', { rural: .3 }); return 'Eleven million people can now apply for legal status.'; }]]),
    mk('tariffs25', 'A tariff war', 2025, 4, 0.5, function () { return 'Tariffs and counter-tariffs spread between the United States, China, Canada and Europe. Markets fall sharply.'; }, [
      ['Raise tariffs further', 'Protectionists approve; prices climb.', function (Q) { gov(Q, { union: .2, rural: .1, prof: -.3, suburb: -.2 }); Q.econ.infl += 1; Q.econ.growth -= 0.5; return 'Prices rise and growth slows; some factories return.'; }],
      ['Negotiate a truce', 'Markets recover; protectionists cry betrayal.', function (Q) { gov(Q, { prof: .2, suburb: .2, union: -.2 }); return 'A truce cuts most new tariffs by half.'; }]]),
    mk('america250', 'America at 250', 2026, 7, 1, function () { return 'The country marks the 250th anniversary of the Declaration of Independence with fireworks, a tall ships parade and a national day of service.'; }, [
      ['A celebration of unity', 'A brief lift in the mood.', function (Q) { approve(Q, 3); return 'Millions attend events across the country. The President gives a speech in Philadelphia.'; }],
      ['A celebration with a new civil-rights bill', 'The left approves; the right calls it politicising the day.', function (Q) { approve(Q, 1); gov(Q, { black: .3, young: .2, rural: -.2 }); return 'The bill is signed on the steps of Independence Hall.'; }]]),
    mk('recession27', 'A downturn', 2027, 1, 0.4, function () { return 'Rising rates, a fall in property prices and the end of the AI investment boom tip the economy into recession.'; }, [
      ['Stimulus spending', 'Cushions the blow; the deficit grows.', function (Q) { Q.econ.shock = (Q.econ.shock || 0) - 1.5; approve(Q, -2); gov(Q, { union: .2, young: .1, suburb: -.1 }); return 'Infrastructure projects are brought forward. The recession is short.'; }],
      ['Hold the line on spending', 'Bond markets approve; unemployment rises.', function (Q) { Q.econ.shock = (Q.econ.shock || 0) - 3; approve(Q, -5); gov(Q, { prof: .1, union: -.3 }); return 'Unemployment reaches 7%. Bond yields fall.'; }]]),
    mk('la28', 'The Los Angeles Olympics', 2028, 7, 1, function () { return 'Los Angeles hosts the Summer Olympics for the third time. The opening ceremony is held at the new stadium in Inglewood.'; }, [
      ['The government takes a back seat', 'No politics, just sport.', function (Q) { approve(Q, 1); return 'Team USA tops the medal table.'; }],
      ['The President opens the Games', 'A moment in the spotlight before the election.', function (Q) { Q.president.approval += 2; return 'The President opens the Games to cheers, and some boos.'; }]])
  ];
  Ev.LIST.push.apply(Ev.LIST, LIST.filter(function (e) { return e.id !== 'covid' && e.id !== 'ukraine'; }));
  // the fixed events go first so nothing else takes their month
  LIST.filter(function (e) { return e.id === 'covid' || e.id === 'ukraine'; }).forEach(function (e) { Ev.LIST.unshift(e); });
})(typeof globalThis !== 'undefined' ? globalThis : window);
