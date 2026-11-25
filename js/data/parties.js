// Party roster (brief §5). Identities are canon; every number (positions,
// vote targets, group preferences, relations) is a SCENARIO ASSUMPTION.
// kind: party | alliance (joint lists, seats split among members) |
//       federation (autonomous state parties under one bloc) | regional
(function (G) {
  'use strict';
  var U = G.USA;
  U.GROUPS = ['prof', 'suburb', 'union', 'rural', 'relig', 'black', 'hisp', 'young', 'retire'];
  U.GROUP_NAMES = { prof: 'Urban professionals', suburb: 'Suburban middle class', union: 'Union households',
    rural: 'Rural & small-town', relig: 'Religious traditionalists', black: 'Black voters',
    hisp: 'Hispanic voters', young: 'Young voters & students', retire: 'Retirees' };

  // econ: -10 left .. +10 right; soc: -10 liberal .. +10 traditional;
  // fed: -10 centralist .. +10 states' rights / devolution.
  // pref: relative support by group (shapes movement; national totals are
  // calibrated to `target` at game start).
  var P = {
    ldp: { name: 'Liberal Democratic Party', short: 'LDP', color: '#ffa500', kind: 'party', econ: -2, soc: -4, fed: -2,
      target: 21, office: .8, leader: 'Al Gore', founded: '1960s (Democratic split over civil rights)',
      pref: { prof: 34, suburb: 22, union: 12, rural: 6, relig: 6, black: 40, hisp: 30, young: 24, retire: 18 } },
    sdlp: { name: 'Social Democratic Labor Party', short: 'SDLP', color: '#ff1a75', kind: 'party', econ: -6, soc: -2, fed: -3,
      target: 16.5, office: .8, leader: 'Bill Bradley', founded: '1950s (Progressive + labor merger)',
      pref: { prof: 10, suburb: 14, union: 44, rural: 16, relig: 8, black: 30, hisp: 26, young: 12, retire: 22 } },
    cdp: { name: 'Christian Democratic Party', short: 'CDP', color: '#1a7a7a', kind: 'party', econ: 3, soc: 4, fed: 1,
      target: 15, office: .8, leader: 'John McCain',
      pref: { prof: 14, suburb: 22, union: 8, rural: 22, relig: 30, black: 5, hisp: 14, young: 7, retire: 20 } },
    cc: { name: 'Conservative Coalition', short: 'CC', color: '#0047ab', kind: 'party', econ: 6, soc: 6, fed: 4,
      target: 22, office: .9, leader: 'George W. Bush', founded: 'late 1970s (Southern Democrats + Republicans)',
      pref: { prof: 16, suburb: 24, union: 12, rural: 32, relig: 30, black: 3, hisp: 10, young: 10, retire: 22 } },
    asp: { name: 'American Solidarity Party', short: 'ASP', color: '#e07b16', kind: 'alliance', econ: -3, soc: 5, fed: 3,
      target: 3.8, office: .6, leader: 'Coalition chair',
      members: { asp_core: 0.25, mormon: 0.25, catholic: 0.25, moderate: 0.25 },
      pref: { prof: 4, suburb: 7, union: 9, rural: 10, relig: 14, black: 6, hisp: 8, young: 4, retire: 8 } },
    // Reform: a separate party in 1999 (the government's C&S partner). If its
    // polling stays weak it can be absorbed into the ASP (designer decision).
    reform: { name: 'Reform Party', short: 'REF', color: '#b07ad6', kind: 'party', econ: 0, soc: 2, fed: 3,
      target: 3.4, office: .6, leader: 'Ross Perot', absorbInto: 'asp',
      pref: { prof: 5, suburb: 9, union: 8, rural: 9, relig: 6, black: 2, hisp: 4, young: 6, retire: 8 } },
    // The far left is fragmented in 1999. The United Left does not exist yet:
    // it can be built by its member parties (see events: Sanders, UL talks).
    grn: { name: 'Green Party', short: 'GRN', color: '#5fb336', kind: 'party', econ: -7, soc: -7, fed: -1,
      target: 2.4, office: .3, leader: 'Ralph Nader',
      pref: { prof: 8, suburb: 3, union: 3, rural: 2, relig: 1, black: 3, hisp: 3, young: 18, retire: 2 } },
    cpusa: { name: 'Communist Party USA', short: 'CPUSA', color: '#b3141b', kind: 'party', econ: -9, soc: -3, fed: -4,
      target: 0.8, office: .2, leader: 'Party chair',
      pref: { prof: 1, suburb: .5, union: 4, rural: .5, relig: .3, black: 4, hisp: 2, young: 3, retire: 1 } },
    dsa: { name: 'Democratic Socialists of America', short: 'DSA', color: '#e0457b', kind: 'party', econ: -8, soc: -6, fed: -2,
      target: 1.1, office: .3, leader: 'National director',
      pref: { prof: 4, suburb: 1, union: 4, rural: .5, relig: .3, black: 3, hisp: 2, young: 7, retire: 1 } },
    wfp: { name: 'Working Families Party', short: 'WFP', color: '#7b2d8b', kind: 'party', econ: -7, soc: -3, fed: -2,
      target: 0.9, office: .4, leader: 'State chairs (New York)',
      pref: { prof: 1, suburb: 1.5, union: 6, rural: .5, relig: .5, black: 5, hisp: 4, young: 2, retire: 1.5 } },
    revsoc: { name: 'Other radical left parties (fragmented)', short: 'ORL', color: '#4a0d1e', kind: 'bloc', econ: -10, soc: -5, fed: -3,
      target: 0.7, office: .05, leader: 'Several (PSL, SWP, SEP, WWP, BPP and others)',
      note: 'Separate small parties (PSL, Black Panther Party, Socialist Workers, Socialist Equality, Workers World, Socialist Alternative and others) shown together for readability.',
      pref: { prof: 1, suburb: .3, union: 2, rural: .3, relig: .2, black: 3, hisp: 1.5, young: 4, retire: .3 } },
    ul: { name: 'United Left', short: 'UL', color: '#7f0000', kind: 'alliance', econ: -8, soc: -6, fed: -2,
      target: 0, office: .3, leader: 'Bernie Sanders',
      pref: { prof: 8, suburb: 3, union: 6, rural: 2, relig: 1, black: 10, hisp: 6, young: 18, retire: 2 } },
    acp: { name: 'American Communist Party', short: 'ACP', color: '#4a0000', kind: 'party', econ: -9, soc: 1, fed: -6,
      target: 0, founded: '2020s (emergent)', office: .1, leader: 'Party collective',
      pref: { prof: 1, suburb: .5, union: 2, rural: .5, relig: .2, black: 2, hisp: 1, young: 3, retire: .5 } },
    lib: { name: 'Libertarian Party', short: 'LIB', color: '#ffd700', kind: 'party', econ: 9, soc: -5, fed: 6,
      target: 3, office: .4, leader: 'Harry Browne',
      pref: { prof: 6, suburb: 4, union: 2, rural: 5, relig: 2, black: 1, hisp: 2, young: 9, retire: 2 } },
    con: { name: 'Constitution Party', short: 'CON', color: '#3d0a5c', kind: 'party', econ: 8, soc: 9, fed: 8,
      target: 2.5, office: .3, leader: 'Howard Phillips',
      pref: { prof: 2, suburb: 3, union: 3, rural: 8, relig: 10, black: 1, hisp: 1, young: 2, retire: 4 } },
    // AGA: autonomous state Green parties; home = state-level vote share
    aga: { name: 'American Green Alliance', short: 'AGA', color: '#228b22', kind: 'federation', econ: -1, soc: 0, fed: 5,
      office: .5, leader: 'Alliance caucus chair',
      home: { AK: 11, RI: 9, VA: 5, OR: 2.5, WA: 2, VT: 2, ME: 2.5, NM: 2, CO: 1.5, MT: 2, MN: 1.5, WI: 1.5 },
      chapters: { AK: { name: 'Green Party of Alaska', econ: 0, soc: 1 }, RI: { name: 'Green Party of Rhode Island', econ: -4, soc: -4 },
        VA: { name: 'Independent Greens of Virginia', econ: 4, soc: 4 } } },
    lsp: { name: 'Lone Star Party', short: 'LSP', color: '#8888cc', kind: 'regional', econ: 6, soc: 4, fed: 9,
      office: .6, leader: 'Party chair (Austin)', home: { TX: 17 }, secession: .15 },
    srp: { name: 'Southern Rights Party', short: 'SRP', color: '#0f1a3a', kind: 'regional', econ: -1, soc: 9, fed: 9,
      office: .5, leader: 'Party chair (Jackson)', secession: .2,
      home: { MS: 12, AL: 11, SC: 10, GA: 7, LA: 8, AR: 6, TN: 6, NC: 4, FL: 2.5, VA: 2, OK: 3, KY: 3, WV: 2 } },
    cnp: { name: 'Californian National Party', short: 'CNP', color: '#e5a3c6', kind: 'regional', econ: -3, soc: -5, fed: 9,
      office: .3, leader: 'Party chair (Oakland)', home: { CA: 3.5 }, secession: .8 },
    cfc: { name: 'Californian Freedom Coalition', short: 'CFC', color: '#c98a3e', kind: 'regional', econ: 3, soc: 0, fed: 7,
      office: .5, leader: 'Party chair (Sacramento)', home: { CA: 3 }, secession: 0 },
    alk: { name: 'Alaskan Party', short: 'ALK', color: '#4a7f8c', kind: 'regional', econ: 6, soc: 2, fed: 9,
      office: .4, leader: 'Party chair (Wasilla)', home: { AK: 9 }, secession: .3 },
    aloha: { name: 'Aloha ʻĀina Party', short: 'AʻĀ', color: '#21a6a0', kind: 'regional', econ: -4, soc: -2, fed: 7,
      office: .3, leader: 'Party chair (Honolulu)', home: { HI: 6 }, secession: .2 },
    raza: { name: 'Raza Unida Party', short: 'RUP', color: '#c4572b', kind: 'regional', econ: -5, soc: -1, fed: 4,
      office: .4, leader: 'Party chair (San Antonio)', home: { TX: 3, NM: 5, CA: 1.2, AZ: 2, CO: 1.2, FL: 1.5, NY: 0.6, IL: 0.6, NV: 0.8 }, secession: 0 },
    nenp: { name: 'New England National Party', short: 'NENP', color: '#6d8fb0', kind: 'regional', econ: -2, soc: -4, fed: 8,
      office: .3, leader: 'Party chair (Boston)', home: { ME: 4, NH: 3, VT: 5, MA: 2.5, RI: 2.5, CT: 2 }, secession: .3 },
    vpp: { name: 'Vermont Progressive Party', short: 'VPP', color: '#d4712a', kind: 'regional', econ: -7, soc: -5, fed: 2,
      office: .3, leader: 'Party chair (Burlington)', home: { VT: 9 }, secession: 0 },
    nyfp: { name: 'New York Freedom Party', short: 'NYFP', color: '#8c8c3a', kind: 'regional', econ: 1, soc: -2, fed: 7,
      office: .4, leader: 'Party chair (Albany)', home: { NY: 3 }, secession: .05 }
  };
  // The general election that elected the opening parliament (late 1996).
  // Fixed, so the opening seats do not move when the 1997 polling is tuned.
  // Scenario assumption.
  U.ELECTION_1996 = { ldp: 24.9, sdlp: 19.0, cdp: 14.5, cc: 18.2, asp: 3.8, reform: 4.0, grn: 0.9, cpusa: 0.8, dsa: 1.1, wfp: 0.9, revsoc: 0.7, lib: 3.0, con: 2.5 };
  U.PARTIES = P;
  U.NATIONAL = ['ldp', 'sdlp', 'cdp', 'cc', 'asp', 'reform', 'ul', 'grn', 'cpusa', 'dsa', 'wfp', 'revsoc', 'acp', 'lib', 'con'];
  U.REGIONAL = ['aga', 'lsp', 'srp', 'cnp', 'cfc', 'alk', 'aloha', 'raza', 'nenp', 'nyfp', 'vpp'];
  // Potential United Left members and how they behave on confidence votes.
  U.LEFT_MEMBERS = { grn: 'reformist', dsa: 'reformist', wfp: 'reformist', vpp: 'reformist', cpusa: 'hard', revsoc: 'revolutionary' };
  U.ALL_PARTIES = U.NATIONAL.concat(U.REGIONAL);

  U.ASP_MEMBERS = { asp_core: 'American Solidarity Party', mormon: 'Mormon Unity Party',
    catholic: 'Catholic Party', moderate: 'Moderate Party' };
  // Forward and United parties appear later in the timeline (dormant in 1999).

  // Pairs that will not sit in the same cabinet (soft for confidence & supply).
  U.RED_LINES = [
    ['cc', 'ul'], ['cc', 'acp'], ['cdp', 'ul'], ['cdp', 'acp'], ['lib', 'ul'], ['lib', 'acp'],
    ['con', 'ul'], ['con', 'acp'], ['con', 'sdlp'], ['con', 'ldp'], ['ul', 'srp'], ['ul', 'lsp'],
    ['acp', 'ldp'], ['acp', 'sdlp'], ['acp', 'asp'], ['srp', 'raza'], ['srp', 'acp'], ['ul', 'con']
  ];
  // the United Left's potential members inherit its red lines
  U.RED_LINES.slice().forEach(function (r) {
    ['ul'].forEach(function (u) { var i = r.indexOf(u); if (i < 0) return; var o = r[1 - i];
      Object.keys(U.LEFT_MEMBERS).forEach(function (m) { if (m !== o) U.RED_LINES.push([m, o]); }); });
  });
  ['grn', 'dsa', 'wfp', 'cpusa', 'revsoc'].forEach(function (m) { U.RED_LINES.push([m, 'cdp']); });
  U.RED_LINES.push(['revsoc', 'ldp'], ['revsoc', 'sdlp'], ['revsoc', 'asp'], ['cpusa', 'asp'], ['reform', 'acp'], ['reform', 'ul'], ['reform', 'revsoc']);
  U.vetoes = function (a, b) {
    return U.RED_LINES.some(function (r) { return (r[0] === a && r[1] === b) || (r[0] === b && r[1] === a); });
  };

  // LDP internal factions (player party). Scenario assumption.
  U.LDP_FACTIONS = {
    newdem: { name: 'New Democrats', figure: 'Joe Lieberman', econ: 2, soc: -2, strength: 32, dissent: 15,
      wants: 'fiscal discipline, business-friendly growth, openness to the CDP' },
    proglib: { name: 'Progressive Liberals', figure: 'Ted Kennedy', econ: -5, soc: -6, strength: 38, dissent: 22,
      wants: 'universal healthcare, civil and voting rights, urban investment, closer ties with the SDLP' },
    chrlib: { name: 'Christian Liberals', figure: 'Jimmy Carter', econ: -3, soc: 1, strength: 14, dissent: 15,
      wants: 'faith-based social justice, help for the poor, caution on cultural issues' },
    heartland: { name: 'Blue Dogs', figure: 'Evan Bayh', econ: 2, soc: 2, strength: 16, dissent: 20,
      wants: 'balanced budgets, rural investment, moderate social policy, a deal with the CDP' }
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
// Parties that do not exist in 1999 and may emerge (brief §5.5). Dormant until
// conditions activate them; nothing guarantees their rise.
(function (G) {
  'use strict';
  var U = G.USA;
  U.PARTIES.maga = { name: 'MAGA Party', short: 'MAGA', color: '#6b2400', kind: 'party', econ: 3, soc: 8, fed: 4,
    target: 0, office: .8, leader: 'Donald Trump', dormantUntil: 'conditions (2015+)',
    pref: { prof: 4, suburb: 14, union: 20, rural: 30, relig: 24, black: 3, hisp: 8, young: 8, retire: 20 } };
  U.PARTIES.afp = { name: 'America First Party', short: 'AFP', color: '#000000', kind: 'party', econ: 4, soc: 10, fed: 6,
    target: 0, office: .3, leader: 'Party chair',
    pref: { prof: 1, suburb: 4, union: 8, rural: 12, relig: 10, black: .5, hisp: 1, young: 5, retire: 5 } };
  U.NATIONAL.push('maga', 'afp');
  U.ALL_PARTIES = U.NATIONAL.concat(U.REGIONAL);
  ['grn', 'dsa', 'wfp', 'cpusa', 'revsoc', 'vpp'].forEach(function (m) { U.RED_LINES.push(['maga', m], ['afp', m]); });
  U.RED_LINES.push(['maga', 'ul'], ['maga', 'acp'], ['maga', 'sdlp'], ['afp', 'ldp'], ['afp', 'sdlp'], ['afp', 'ul'],
    ['afp', 'acp'], ['afp', 'cdp'], ['maga', 'raza']);
})(typeof globalThis !== 'undefined' ? globalThis : window);
