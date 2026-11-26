// Historical general (House) elections, 1914-1994. The 1996 election is the
// game's own opening parliament and is read from the game state.
// shares: % of the national vote ('oth' = others, who win no seats here).
// Seats are allocated by Sainte-Lague over the parties with at least 1%
// (statewide PR has a natural threshold; 435 seats until 1972, 600 after).
// gov/cs: the government formed after the election (must hold a majority with cs).
// map: {party: 'states where it topped the poll'}; every other state goes to `top`.
(function (G) {
  var U = G.USA = G.USA || {};
  U.LORE = U.LORE || {};
  var SOUTH = 'AL AR FL GA LA MS NC SC TN TX VA';
  U.LORE.oldParties = U.LORE.oldParties || {};
  U.LORE.oldParties.fl = ['Farmer-Labor Party', '#8fbc3f'];

  U.LORE.generalElections = [
    { year: 1914, seats: 435, shares: { dem: 35.0, prog: 31.0, rep: 24.0, soc: 7.0, oth: 3.0 }, gov: ['dem', 'prog'], pm: 'Champ Clark',
      top: 'prog', map: { dem: SOUTH + ' KY OK MO MD WV AZ NM', rep: 'ME VT NH CT RI DE NJ PA OH IN' },
      sen: {'prog': -3, 'dem': 2, 'rep': 1},
      note: 'The first House elected by statewide PR, on the day of the first presidential runoff and three months into the war in Europe. Democrats held the South; Roosevelt\u2019s Progressives swept the West and the farm belt. Progressive Senate candidates, new names everywhere, ran behind their party. Roosevelt appointed Speaker Champ Clark as the first Prime Minister.' },
    { year: 1918, seats: 435, shares: { rep: 36.0, dem: 30.0, prog: 21.0, soc: 8.0, oth: 5.0 }, gov: ['rep', 'dem'], pm: 'Warren G. Harding',
      top: 'rep', map: { dem: SOUTH + ' KY OK MO MD', prog: 'CA WA OR ID MT ND SD MN WI' },
      sen: {'rep': 1, 'dem': 2, 'prog': -2},
      note: 'Held a week before the Armistice, in the influenza pandemic, with President Roosevelt gravely ill. Voters tired of wartime controls turned to the Republicans. Roosevelt appointed Warren Harding at the head of a Republican government with conservative Democrats; two months later Roosevelt was dead, and President Hiram Johnson spent two years fighting his own Prime Minister over the League of Nations.' },
    { year: 1922, seats: 435, shares: { prog: 29.0, rep: 30.0, dem: 24.0, fl: 6.0, soc: 5.0, oth: 6.0 }, gov: ['prog', 'dem', 'fl'], pm: 'Robert La Follette',
      top: 'rep', map: { dem: SOUTH + ' KY OK', prog: 'CA WA OR ID MT WY CO ND SD NE KS IA WI', fl: 'MN' },
      sen: {'rep': 3, 'prog': -3},
      note: 'The postwar slump halved wheat prices. Harding\u2019s government lost its majority to a farm revolt, and President Hughes had to appoint the Progressive Robert La Follette at the head of a Progressive\u2013Democratic-Farmer-Labor coalition. Republican senators, better known than their party, held up well.' },
    { year: 1926, seats: 435, shares: { rep: 37.0, dem: 27.0, prog: 21.0, fl: 5.0, soc: 4.0, oth: 6.0 }, gov: ['rep', 'prog'], pm: 'Nicholas Longworth',
      top: 'rep', map: { dem: SOUTH + ' KY OK MO', prog: 'WA OR ID MT ND SD NE WI', fl: 'MN' },
      sen: {'rep': 1, 'fl': 1, 'dem': -1},
      note: 'Held with Lowden\u2019s presidential win in the boom years. His promise of farm relief won over farm-belt Progressives, and Nicholas Longworth formed a Republican\u2013Progressive government that passed the McNary-Haugen farm bill.' },
    { year: 1930, seats: 435, shares: { dem: 30, rep: 29, prog: 19, soc: 7.5, fl: 6, cpusa: 2.5, oth: 6 }, gov: ['rep', 'prog'], cs: ['fl'], pm: 'Nicholas Longworth',
      top: 'dem', map: { rep: 'ME VT NH CT RI DE NJ PA OH IN MI IL', prog: 'WA OR ID MT ND SD NE WI', fl: 'MN' },
      sen: {'rep': 2, 'dem': -1},
      note: 'The first election after the Wall Street crash. The Democrats came first but could not agree on a partner, and President Lowden kept Longworth on at the head of a minority, kept alive by Farmer-Labor votes for farm credit. Lowden refused to dissolve again while unemployment passed 15%.' },
    { year: 1932, seats: 435, shares: { dem: 39, rep: 22, prog: 18, soc: 9, fl: 5, cpusa: 3.5, oth: 3.5 }, gov: ['dem', 'prog'], pm: 'Al Smith',
      top: 'dem', map: { rep: 'ME VT NH PA DE', prog: 'WA OR ID MT ND SD WI', fl: 'MN' },
      sen: {'dem': -2, 'prog': 1, 'rep': 1},
      note: 'Longworth\u2019s government fell over relief spending, and Lowden dissolved Congress to coincide with the presidential vote at the depth of the Depression. Huey Long\u2019s landslide carried the Democrats to their best result, though millions of Long voters chose Progressives or Socialists for the House. Long appointed Al Smith, his party\u2019s leader and his rival, at the head of a Democratic\u2013Progressive government.' },
    { year: 1936, seats: 435, shares: { dem: 37, rep: 23, prog: 20, soc: 6, fl: 6, cpusa: 4.5, oth: 3.5 }, gov: ['dem', 'prog'], pm: 'Al Smith',
      top: 'dem', map: { rep: 'ME VT NH PA DE CT KS', prog: 'WA OR ID MT ND SD WI CA', fl: 'MN' },
      sen: {'dem': -1, 'prog': 1}, senInd: {'NE': 34},
      note: 'A verdict on the New Deal as recovery took hold. The Smith coalition was returned. In Nebraska, George Norris won as an independent senator after leaving the Progressives.' },
    { year: 1938, seats: 435, shares: { dem: 30, prog: 29, rep: 26, fl: 6, soc: 4, cpusa: 4, oth: 1 }, gov: ['prog', 'dem', 'fl'], pm: 'Henry A. Wallace',
      top: 'dem', map: { rep: 'ME VT NH CT DE PA OH IN MI KS', prog: 'CA WA OR ID MT WY CO ND SD NE IA WI IL NY', fl: 'MN' },
      sen: {'dem': 1, 'prog': -1}, senInd: {'NE': 31},
      note: 'In March Long dismissed Smith, appointed the Arkansas senator Hattie Caraway as caretaker and dissolved Congress for the November presidential vote. The feud cost the Democrats seven points, Munich was six weeks old, and Long, re-elected, appointed the Progressive Henry Wallace to lead a new coalition.' },
    { year: 1942, seats: 435, shares: { prog: 31, dem: 30, rep: 27, fl: 5, soc: 2.5, cpusa: 4.5, oth: 0 }, gov: ['prog', 'dem', 'fl'], pm: 'Henry A. Wallace',
      top: 'dem', map: { rep: 'ME VT NH CT DE PA OH IN KS NE', prog: 'CA WA OR ID MT WY CO ND SD IA WI IL NY MI', fl: 'MN' },
      sen: {'rep': 1},
      note: 'A wartime election eleven months after Japan\u2019s attacks on Pearl Harbor and the Philippines. Parties agreed not to attack the war effort and the Wallace coalition was returned almost unchanged. Norris lost his Nebraska seat.' },
    { year: 1944, seats: 435, shares: { dem: 33, rep: 30, prog: 25, fl: 5, soc: 2.5, cpusa: 4.5, oth: 0 }, gov: ['dem', 'prog'], pm: 'Alben W. Barkley',
      top: 'dem', map: { rep: 'ME VT NH CT DE PA OH IN KS NE NJ', prog: 'CA WA OR ID MT ND SD WI', fl: 'MN' },
      sen: {'dem': -1, 'rep': 1},
      note: 'Held with Garner\u2019s narrow presidential win, five months after D-Day. Garner, who carried Texas Republicans with him, did not carry the House: the Democrats only edged back into first place. He appointed Alben Barkley to lead a Democratic\u2013Progressive coalition through victory and demobilisation.' },
    { year: 1948, seats: 435, shares: { dem: 28, rep: 25, prog: 21, cdp: 9, srp: 9, fl: 3, soc: 2, cpusa: 2, oth: 1 }, gov: ['dem', 'prog', 'fl'], pm: 'Alben W. Barkley',
      top: 'dem', map: { rep: 'ME VT NH CT NJ PA OH IN KS NE', prog: 'CA WA OR ID MT ND SD WI NY', fl: 'MN', srp: 'AL MS SC LA', cdp: 'IA' },
      sen: {'srp': 2, 'prog': -2},
      note: 'Barkley asked Garner for an early election after Southern Democrats walked out over his civil-rights platform; they ran as the States\u2019 Rights Democrats and won four Deep South states. The new Christian Democrats took Midwestern Republicans and Catholic voters. Barkley held on, just, as the Berlin airlift began.' },
    { year: 1950, seats: 435, shares: { rep: 35, cdp: 15, dem: 22, prog: 12, srp: 9, fl: 2, soc: 1, cpusa: 1, oth: 3 }, gov: ['rep', 'cdp'], pm: 'Robert A. Taft',
      top: 'rep', map: { dem: 'TX TN NC VA AR FL OK KY WV MO', srp: 'AL MS SC LA GA', prog: 'WA OR WI', cdp: 'IA MN' },
      sen: {'rep': 1, 'cdp': -1},
      note: 'Held with Dewey\u2019s first presidential win, five months into the Korean War and at the height of the Red Scare. Wallace\u2019s opposition to the war cost the Progressives nine points. Dewey appointed Robert Taft at the head of the first Republican\u2013Christian Democratic coalition.' },
    { year: 1953, seats: 435, shares: { dem: 30, sdlp: 22, rep: 27, cdp: 11, srp: 7, cpusa: 0.6, oth: 2.4 }, gov: ['dem', 'sdlp'], pm: 'Estes Kefauver',
      top: 'dem', map: { rep: 'ME VT NH CT NJ PA OH IN KS NE CO WY ID UT AZ NV', sdlp: 'WA OR MN WI MI ND', srp: 'AL MS SC LA', cdp: 'IA' },
      sen: {'rep': 1, 'sdlp': -1}, senInd: {'OR': 33},
      note: 'Taft\u2019s death in July broke the coalition, and Dewey dissolved Congress days after the Korean armistice. It was the first election for the Social Democratic Labor Party, the merger of the Progressives, Socialists and Farmer-Labor. Dewey had to appoint the Tennessee Democrat Estes Kefauver at the head of a Democratic\u2013SDLP government. Wayne Morse, who had left the Republicans over Korea, held his Oregon Senate seat as an independent.' },
    { year: 1957, seats: 435, shares: { dem: 31, sdlp: 21, rep: 26, cdp: 12, srp: 7, cpusa: 0.4, oth: 2.6 }, gov: ['dem', 'sdlp'], pm: 'Estes Kefauver',
      top: 'dem', map: { rep: 'ME VT NH CT NJ PA OH IN KS NE CO WY ID UT AZ', sdlp: 'WA OR MN WI MI ND', srp: 'AL MS SC LA', cdp: 'IA' },
      sen: {'dem': 1}, senInd: {'OR': 30},
      note: 'Called by Dewey a month after Sputnik and two months after Little Rock, hoping to evict Kefauver. The government was narrowly returned on a promise of a crash science programme; the next year Kefauver made way for his Majority Leader, Lyndon Johnson.' },
    { year: 1960, seats: 435, shares: { dem: 29, rep: 28, sdlp: 19, cdp: 12, srp: 8, cpusa: 0.6, oth: 3.4 }, gov: ['dem', 'sdlp', 'cdp'], pm: 'John F. Kennedy',
      top: 'dem', map: { rep: 'ME VT NH NJ PA OH IN KS NE CO WY ID UT AZ CA OR', sdlp: 'WA MN WI MI ND', srp: 'AL MS SC LA', cdp: 'IA' },
      sen: {'dem': -1, 'rep': 1},
      note: 'Dewey dissolved Congress once more in his last year. Johnson led the Democrats, but John F. Kennedy ran the campaign and won the caucus vote afterwards. With the Democrats and SDLP short of a majority, Dewey appointed Kennedy, who brought in the Christian Democrats: the first Catholic Prime Minister.' },
    { year: 1963, seats: 435, shares: { dem: 32, sdlp: 21, rep: 27, cdp: 9, srp: 8, cpusa: 2.5, oth: 0.5 }, gov: ['dem', 'sdlp'], pm: 'John F. Kennedy',
      top: 'dem', map: { rep: 'ME VT NH NJ PA OH IN KS NE WY ID UT AZ', sdlp: 'WA MN WI MI ND', srp: 'AL MS SC LA GA', cdp: 'IA' },
      sen: {'dem': 1, 'rep': -1},
      note: 'President Nixon dismissed Kennedy in June after his civil-rights bill failed, appointed Everett Dirksen as caretaker and dissolved Congress. Kennedy fought the October election on civil rights and won it, and Nixon had to reappoint him. In November Kennedy was shot in Dallas and survived; his health, never strong, gave way, and he retired in April 1964. Nixon appointed Lyndon Johnson.' },
    { year: 1966, seats: 435, shares: { ldp: 29, sdlp: 22, rep: 23, dem: 11, cdp: 8, srp: 4, cpusa: 3, oth: 0 }, gov: ['ldp', 'sdlp'], pm: 'Lyndon B. Johnson',
      top: 'ldp', map: { dem: 'TX GA NC SC TN AR FL VA OK', srp: 'AL MS LA', rep: 'KS NE WY ID UT AZ IN NH VT', sdlp: 'MN WI MI WA ND', cdp: 'IA' },
      sen: {'dem': 4, 'ldp': -2, 'sdlp': -1},
      note: 'The first election after the Democratic split over the Civil Rights and Voting Rights Acts. Johnson\u2019s Liberal Democrats took the northern, western and Black Democratic vote; the southern rump kept the Democratic name, and its veteran senators ran far ahead of it. Johnson\u2019s LDP\u2013SDLP government had a slim majority as the Vietnam build-up began.' },
    { year: 1968, seats: 435, shares: { sdlp: 25, ldp: 26, rep: 19, srp: 11, dem: 7, cdp: 7, cpusa: 5, oth: 0 }, gov: ['ldp', 'sdlp'], pm: 'Hubert Humphrey',
      top: 'ldp', map: { srp: 'AL MS LA GA SC AR', dem: 'TX NC TN VA FL OK', rep: 'KS NE WY ID UT AZ IN NH VT SD MT CO', sdlp: 'MN WI MI WA ND OH PA WV', cdp: 'IA' },
      sen: {'srp': 2, 'sdlp': -2},
      note: 'Held with the presidential election, after the Tet Offensive, the murder of Martin Luther King and the riots that followed. George Wallace took the SRP to 11%. Robert Kennedy\u2019s coattails nearly made the SDLP the largest party. Kennedy, who had beaten Johnson, appointed Hubert Humphrey to keep the LDP inside the government.' },
    { year: 1972, seats: 435, shares: { ldp: 27, sdlp: 25, rep: 19, srp: 8, cdp: 8, dem: 6, lib: 1, cpusa: 6, oth: 0 }, gov: ['ldp', 'sdlp'], pm: 'Hubert Humphrey',
      top: 'ldp', map: { srp: 'AL MS LA GA SC', dem: 'TX NC TN VA AR OK', rep: 'KS NE WY ID UT AZ IN NH VT SD MT CO FL', sdlp: 'MN WI MI WA ND OH PA WV', cdp: 'IA' },
      sen: {'dem': 1, 'srp': 1}, senInd: {'VA': 38},
      note: 'Kennedy dissolved Congress after pulling out of Vietnam and opening to China, and the coalition held. In Virginia, Harry Byrd Jr. won as an independent senator. A House of a dozen parties and the next year\u2019s budget crisis led to the 1974 reform.' },
    { year: 1974, seats: 600, shares: { rep: 24.4, ldp: 24, sdlp: 22, cdp: 10, srp: 7, dem: 6, lib: 2, raza: 0.3, cpusa: 4, revsoc: 0.3, oth: 0 }, gov: ['ldp', 'sdlp', 'cdp'], pm: 'Edmund Muskie',
      top: 'ldp', map: { srp: 'AL MS LA GA SC', dem: 'TX NC TN AR', rep: 'KS NE WY ID UT AZ IN NH VT SD MT CO FL VA OK NV AK', sdlp: 'MN WI MI WA ND OH PA WV', cdp: 'IA' },
      sen: {'rep': 1, 'ldp': -1}, senInd: {'VA': 36},
      note: 'The first 600-seat House, held with Kennedy\u2019s re-election a year after the oil embargo and the budget crisis. Stagflation put the Republicans first, but no right-wing majority was possible. Kennedy\u2019s nominee, Edmund Muskie, passed the new absolute-majority vote at the head of an LDP\u2013SDLP\u2013CDP grand coalition.' },
    { year: 1978, seats: 600, shares: { cc: 29, ldp: 28, sdlp: 22, cdp: 10, srp: 4, lib: 3, raza: 0.3, cfc: 0.4, cpusa: 2.5, revsoc: 0.3, oth: 0.5 }, gov: ['ldp', 'sdlp'], pm: 'Walter Mondale',
      top: 'cc', map: { ldp: 'CA OR WA MA RI CT NY NJ MD DE IL HI VT ME NH DC CO NM', sdlp: 'MN WI MI ND OH PA WV', srp: 'MS AL', cdp: 'IA' },
      sen: {'cc': 3, 'ldp': -1, 'sdlp': -1}, senInd: {'VA': 34},
      note: 'The four-year lock expired in November, and Muskie asked for an election. It was the first for the Conservative Coalition, the merger of the Republicans and the southern Democrats, which topped the poll in the South and West and did better still in Senate races. Kennedy nominated Walter Mondale, who scraped an absolute majority for an LDP\u2013SDLP government.' },
    { year: 1982, seats: 600, shares: { cc: 37, ldp: 20.4, sdlp: 17, cdp: 13, lib: 4, srp: 3, con: 1.5, dsa: 1, raza: 0.4, cfc: 0.4, cpusa: 2, revsoc: 0.3, oth: 0 }, gov: ['cc', 'cdp'], pm: 'Bob Dole',
      top: 'cc', map: { ldp: 'MA RI NY HI DC', sdlp: 'MN WI MI WV', cdp: 'IA', srp: 'MS' },
      sen: {'cc': -1, 'cdp': 1},
      note: 'Reagan used his right as a new President to dissolve Congress in his second year, in the 1981\u201382 recession. The CC won its best result and Reagan\u2019s nominee, Bob Dole, won the absolute-majority vote at the head of a CC\u2013CDP government.' },
    { year: 1986, seats: 600, shares: { cc: 34, ldp: 19.6, sdlp: 18.9, cdp: 11, lib: 5, srp: 2.5, con: 2, lsp: 1.5, dsa: 1.5, grn: 0.8, raza: 0.4, cfc: 0.4, alk: 0.1, cpusa: 2, revsoc: 0.3, oth: 0 }, gov: ['cc', 'cdp', 'lib'], pm: 'Jack Kemp',
      top: 'cc', map: { ldp: 'MA RI NY HI DC CA CT', sdlp: 'MN WI MI WV PA IL OH', cdp: 'IA' },
      sen: {'cc': -1, 'lsp': 1},
      note: 'The lock expired and Dole asked for an election to coincide with Reagan\u2019s re-election; both chambers agreed. The economy boomed everywhere but the oil patch, where the Texas oil bust gave birth to the Lone Star Party. Reagan nominated the tax-cutter Jack Kemp, who needed the Libertarians for a majority.' },
    { year: 1990, seats: 600, shares: { ldp: 27, cc: 25.8, sdlp: 16.32, cdp: 13, lib: 4, asp: 3, lsp: 2, srp: 2, con: 2, dsa: 1.5, grn: 1, vpp: 0.05, raza: 0.4, cfc: 0.3, alk: 0.1, nyfp: 0.2, nenp: 0.1, aloha: 0.03, cpusa: 1.2, oth: 0 }, gov: ['ldp', 'cdp'], cs: ['sdlp'], pm: 'Lloyd Bentsen',
      top: 'cc', map: { ldp: 'CA OR WA MA RI CT NY NJ MD DE IL HI VT ME NH DC CO NM', sdlp: 'MN WI MI WV PA OH', cdp: 'IA', lsp: 'TX', asp: 'UT' },
      sen: {'cc': 2, 'ldp': -1}, senInd: {'CT': 33},
      note: 'Called when the lock expired, three months into the Gulf crisis and amid the savings-and-loan collapse and Iran-Contra. The LDP came first for the first time since 1966. Reagan\u2019s first nominee, Kemp again, failed to win an absolute majority; his second, the Texan Lloyd Bentsen (LDP), passed by simple majority at the head of an LDP\u2013CDP minority with SDLP votes for its budgets. Lowell Weicker won Connecticut\u2019s Senate race as an independent.' },
    { year: 1992, seats: 600, shares: { ldp: 28, cc: 23.9, sdlp: 17.72, cdp: 11, asp: 4, lib: 3.5, lsp: 2, srp: 2, con: 2, dsa: 1.2, cnp: 1, grn: 1, vpp: 0.05, raza: 0.5, cfc: 0.4, alk: 0.1, nyfp: 0.2, nenp: 0.1, aloha: 0.03, aga: 0.3, cpusa: 0.8, revsoc: 0.2, oth: 0 }, gov: ['ldp', 'sdlp', 'cdp'], pm: 'Tom Foley',
      top: 'ldp', map: { cc: 'TX AL MS GA SC NC TN FL VA OK KS NE SD ND MT WY ID AZ IN KY AK', sdlp: 'MN WI MI WV PA OH', cdp: 'IA', asp: 'UT', lsp: '', srp: '' },
      sen: {'ldp': -1, 'cc': 1},
      note: 'Bentsen asked for an early election to coincide with the presidential vote, and both chambers agreed. Ross Perot ran only for President, and many of his voters skipped the House ballot. Clinton had won on a joint ticket with the Christian Democrats, and he nominated Tom Foley at the head of an LDP\u2013SDLP\u2013CDP coalition, which won an absolute majority.' },
    { year: 1994, seats: 600, shares: { cc: 36, ldp: 15.5, cdp: 16.5, sdlp: 12.32, lib: 5.5, asp: 3.2, con: 2, lsp: 1.5, srp: 1.5, grn: 1, dsa: 1, cnp: 1, vpp: 0.05, raza: 0.5, cfc: 0.3, alk: 0.1, nyfp: 0.2, nenp: 0.1, aloha: 0.03, aga: 0.2, cpusa: 1.5, oth: 0 }, gov: ['cc', 'cdp'], cs: ['lib', 'lsp'], pm: 'Newt Gingrich',
      top: 'cc', map: { ldp: 'MA RI HI VT DC', sdlp: 'MN WI WV', cdp: 'IA DE CT', asp: 'UT' },
      sen: {'cdp': 1, 'ldp': -1},
      note: 'Foley\u2019s health-care bill died in the Senate, and the CDP walked out of the coalition. A constructive vote to replace him with Newt Gingrich fell twelve votes short, so with Congress deadlocked Foley asked for an early election and both chambers agreed. Gingrich\u2019s Contract with America won a relative landslide: the CC took 36% of the vote, its best since Reagan\u2019s 1982 peak, while the LDP slumped to third behind the CDP and the Libertarians cleared the 5% threshold for the first time with 5.5%. Clinton had no choice but to nominate Gingrich, who won an absolute majority at the head of a CC\u2013CDP coalition, with Libertarian and Lone Star support.' }
  ];

  // Party info for old parties as well as the game's own.
  var OLD = { dem: ['DEM', 0], rep: ['REP', 5], prog: ['PROG', -4], soc: ['SOC', -8], fl: ['FLP', -6], ind: ['IND', 0] };
  U.partyInfo = function (k) {
    if (OLD[k] && U.LORE.oldParties[k]) return { name: U.LORE.oldParties[k][0], short: OLD[k][0], color: U.LORE.oldParties[k][1], econ: OLD[k][1] };
    var p = U.PARTIES && U.PARTIES[k]; return p ? p : { name: k, short: k.toUpperCase(), color: '#888', econ: 0 };
  };

  // ---- State-by-state detail, generated from the national result ----
  // Each party gets an affinity for each state (region and demography of the
  // period); vote shares are then raked to match both 100% per state and the
  // national share, and nudged until the state's largest party matches `map`.
  var DEEP = 'AL MS SC LA GA', BORDER = 'KY OK MO MD WV', CATH = 'MA RI CT NY NJ PA OH IL MI WI MN IA';
  function has(list, s) { return (' ' + list + ' ').indexOf(' ' + s + ' ') >= 0; }
  function aff(p, s, y) {
    var r = s.region, so = r === 'SO' || r === 'TX', w = r === 'PC' || r === 'MT', pl = r === 'PL', ne = r === 'NE' || r === 'MA', mw = r === 'MW';
    switch (p) {
      case 'dem': return y < 1966 ? (so ? 2.6 : has(BORDER, s.id) ? 1.5 : 0.7 + 0.5 * s.urban) : (so ? 3.2 : has(BORDER, s.id) ? 1 : 0.12);
      case 'rep': return y < 1966 ? (so ? 0.25 : ne || mw ? 1.35 : pl ? 1.3 : 1) : (so ? 0.7 : ne ? 1.2 : 1.1);
      case 'prog': return w ? 1.7 : pl ? 1.5 : mw ? 1.2 : so ? 0.3 : 0.8;
      case 'soc': case 'cpusa': case 'dsa': case 'wfp': case 'revsoc': return (so ? 0.3 : 0.6) + 1.4 * s.urban * (0.5 + s.union * 2);
      case 'fl': return s.id === 'MN' ? 9 : s.id === 'ND' ? 5 : has('WI SD', s.id) ? 2 : 0.05;
      case 'srp': return has(DEEP, s.id) ? 4.5 : so ? 1.8 : 0.04;
      case 'cdp': return has(CATH, s.id) ? 1.5 : pl ? 1.3 : so ? 0.4 : 0.9;
      case 'sdlp': return (mw ? 1.5 : ne ? 1.1 : so ? 0.55 : 1) * (0.7 + s.union * 2);
      case 'ldp': return (ne ? 1.35 : r === 'PC' ? 1.3 : so ? 0.75 : 1) * (0.7 + 0.5 * s.urban + s.black);
      case 'cc': return so ? 1.6 : w || pl ? 1.3 : ne ? 0.55 : 0.9;
      case 'lib': return w ? 1.6 : pl ? 1.1 : 0.8;
      case 'con': return so || pl ? 1.5 : 0.7;
      case 'lsp': return s.id === 'TX' ? 14 : 0.02;
      case 'asp': return has('UT ID', s.id) ? 7 : has('MI OH MA RI WI', s.id) ? 1.6 : 0.4;
      case 'cnp': case 'cfc': return s.id === 'CA' ? 30 : 0.01;
      case 'raza': return has('NM TX AZ CA CO FL', s.id) ? (s.id === 'NM' ? 14 : 8) : 0.01;
      case 'alk': return s.id === 'AK' ? 500 : 0.001;
      case 'aloha': return s.id === 'HI' ? 400 : 0.001;
      case 'nenp': return has('ME NH VT MA RI CT', s.id) ? 20 : 0.005;
      case 'nyfp': return s.id === 'NY' ? 60 : 0.005;
      case 'aga': return has('RI VA ME', s.id) ? 4 : 1;
      case 'grn': return r === 'PC' ? 1.8 : ne ? 1.3 : 0.7;
      case 'vpp': return s.id === 'VT' ? 400 : 0.001;
      default: return 1;
    }
  }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 1000) / 1000; }
  function houseSeats(e) {
    if (e.seats === 600) { var a = U.Elections.apportion().pr, o = {}; for (var k in a) if (a[k]) o[k] = a[k]; return o; }
    var era = e.year < 1932 ? '1910' : e.year < 1942 ? '1930' : e.year < 1952 ? '1940' : e.year < 1962 ? '1950' : '1960', el = U.LORE.ecEras[era], out = {};
    for (var s in el) if (s !== 'DC') out[s] = el[s] - 4;
    return out;
  }
  var cache = {};
  U.LORE.generalDetail = function (e) {
    if (cache[e.year]) return cache[e.year];
    var D = U.Electoral, seatsOf = houseSeats(e), ids = Object.keys(seatsOf), W = 0;
    var parties = Object.keys(e.shares).filter(function (p) { return p !== 'oth'; }), want = {}, A = {}, v = {};
    var mp = {}; for (var k in e.map) e.map[k].split(' ').forEach(function (s) { if (s) mp[s] = k; });
    ids.forEach(function (s) { W += seatsOf[s]; want[s] = mp[s] || e.top; var st = U.STATES[s] || U.DC; A[s] = {};
      parties.forEach(function (p) { A[s][p] = aff(p, st, e.year) * (0.85 + 0.3 * hash(e.year + s + p)); }); });
    var oth = e.shares.oth || 0;
    for (var round = 0; round < 60; round++) {
      for (var it = 0; it < 25; it++) {
        ids.forEach(function (s) { var t = 0; parties.forEach(function (p) { t += e.shares[p] * A[s][p]; }); v[s] = {}; parties.forEach(function (p) { v[s][p] = e.shares[p] * A[s][p] / t * (100 - oth); }); });
        parties.forEach(function (p) { var n = 0; ids.forEach(function (s) { n += v[s][p] * seatsOf[s]; }); var f = e.shares[p] * W / n; ids.forEach(function (s) { A[s][p] *= f; }); });
      }
      var bad = 0;
      ids.forEach(function (s) { var top = parties.reduce(function (a, b) { return v[s][b] > v[s][a] ? b : a; }); if (top !== want[s] && v[s][want[s]] != null) { bad++; A[s][want[s]] *= 1.1; A[s][top] *= 0.95; } });
      if (!bad) break;
    }
    var states = {}, senStates = {}, house = {}, senate = {}, national = {}, senW = {}, senT = 0;
    ids.forEach(function (s) {
      var sh = {}; parties.forEach(function (p) { if (v[s][p] >= 0.5) sh[p] = Math.round(v[s][p] * 10) / 10; });
      var won = D.divisor(v[s], seatsOf[s], 'sainte-lague', 0), seats = {}; for (var p in won) if (won[p]) { seats[p] = won[p]; house[p] = (house[p] || 0) + won[p]; }
      states[s] = { seats: seats, shares: sh };
      if (s === 'DC') return;
      // Senate races: national shifts (e.sen), candidates' personal votes, independents (e.senInd)
      var sv = {}, st0 = 0, st1 = 0, ind = (e.senInd || {})[s] || 0;
      parties.forEach(function (p) { st0 += v[s][p]; sv[p] = Math.max(0, v[s][p] * (1 + ((e.sen || {})[p] || 0) / e.shares[p]) * (1 + 0.4 * (hash('s' + e.year + s + p) - 0.5)) * (((e.senBoost || {})[s] || {})[p] || 1)); st1 += sv[p]; });
      parties.forEach(function (p) { sv[p] = sv[p] * (st0 - ind) / st1; }); if (ind) sv.ind = ind;
      var ssh = {}; for (p in sv) { if (sv[p] >= 0.5) ssh[p] = Math.round(sv[p] * 10) / 10; senW[p] = (senW[p] || 0) + sv[p] * seatsOf[s]; } senT += seatsOf[s];
      var sw = D.senateSeats(ssh), ss = {}; for (p in sw) if (sw[p]) ss[p] = sw[p];
      var leg = Object.keys(seats).sort(function (a, b) { return seats[b] - seats[a] || v[s][b] - v[s][a]; })[0];
      for (p in ss) senate[p] = (senate[p] || 0) + ss[p];
      senate[leg] = (senate[leg] || 0) + 1; senStates[s] = { seats: ss, shares: ssh, leg: leg };
    });
    if (e.seats === 600) { var nv = {}; parties.forEach(function (p) { nv[p] = e.shares[p]; });
      var nw = D.divisor(nv, 100, 'sainte-lague', 5 / (100 - oth)); for (var q in nw) if (nw[q]) { national[q] = nw[q]; house[q] = (house[q] || 0) + nw[q]; } }
    return (cache[e.year] = { states: states, senStates: senStates, house: house, senate: senate, national: e.seats === 600 ? national : null, senShares: (function () { var o = {}; for (var k in senW) o[k] = Math.round(senW[k] / senT * 10) / 10; return o; })(), mismatched: ids.filter(function (s) { return parties.reduce(function (a, b) { return v[s][b] > v[s][a] ? b : a; }) !== want[s]; }) });
  };
  // First round of a historical presidential election, state by state.
  // Candidates' parties carry the same regional affinities; the runoff
  // winner's states lean to the winner and the loser's states to the loser.
  var pcache = {};
  U.LORE.presR1Detail = function (e) {
    if (pcache[e.year]) return pcache[e.year];
    var el = e.era === 'modern' ? U.Elections.apportion().electors : U.LORE.ecEras[e.era], ids = Object.keys(el), W = 0;
    var nat = {}, oth = 0; e.r1.forEach(function (c) { if (c[1]) nat[c[1]] = c[2]; else oth += c[2]; });
    var parties = Object.keys(nat), win = e.r2[0][1], lose = e.r2[1][1], lost = e.lose.split(' '), A = {}, v = {};
    ids.forEach(function (s) { W += el[s]; var st = U.STATES[s] || U.DC; A[s] = {};
      parties.forEach(function (p) { A[s][p] = aff(p, st, e.year) * (0.85 + 0.3 * hash('p' + e.year + s + p)); });
      A[s][lost.indexOf(s) >= 0 ? lose : win] *= 1.35; });
    for (var it = 0; it < 40; it++) {
      ids.forEach(function (s) { var t = 0; parties.forEach(function (p) { t += nat[p] * A[s][p]; }); v[s] = {}; parties.forEach(function (p) { v[s][p] = nat[p] * A[s][p] / t * (100 - oth); }); });
      parties.forEach(function (p) { var n = 0; ids.forEach(function (s) { n += v[s][p] * el[s]; }); var f = nat[p] * W / n; ids.forEach(function (s) { A[s][p] *= f; }); });
    }
    var out = {}; ids.forEach(function (s) { var sh = {}; parties.forEach(function (p) { if (v[s][p] >= 0.5) sh[p] = Math.round(v[s][p] * 10) / 10; }); out[s] = { seats: {}, shares: sh }; });
    return (pcache[e.year] = out);
  };

  // The runoff, state by state: each state's two-candidate vote follows its
  // round-one lean, scaled to the national runoff vote; electors then go to
  // each state's winner. Electoral votes come from the votes, not a fixed map.
  var p2cache = {};
  U.LORE.presR2Detail = function (e) {
    if (p2cache[e.year]) return p2cache[e.year];
    var el = e.era === 'modern' ? U.Elections.apportion().electors : U.LORE.ecEras[e.era], r1 = U.LORE.presR1Detail(e);
    var w = e.r2[0][1], l = e.r2[1][1], nat1 = {}; e.r1.forEach(function (c) { if (c[1]) nat1[c[1]] = c[2]; });
    var t2 = e.r2[0][3] + e.r2[1][3], target = e.r2[0][3] / t2 * 100, ids = Object.keys(el), W = 0; ids.forEach(function (s) { W += el[s]; });
    var lean = {}; ids.forEach(function (s) { var sh = (r1[s] || {}).shares || {}; lean[s] = 1.4 * (((sh[w] || 0) - (nat1[w] || 0)) - ((sh[l] || 0) - (nat1[l] || 0))) + 16 * (hash('r2' + e.year + s) - 0.5); });
    var share = function (s, off) { return U.clamp(target + lean[s] + off, 3, 97); };
    var off = 0; for (var it = 0; it < 30; it++) { var n = 0; ids.forEach(function (s) { n += share(s, off) * el[s]; }); off += target - n / W; }
    var ev = function (o) { var a = 0; ids.forEach(function (s) { if (share(s, o) > 50) a += el[s]; }); return a; };
    // the runoff winner of record must carry the Electoral College
    while (ev(off) * 2 <= W && off < 20) off += 0.2;
    var states = {}, tot = {}; tot[w] = 0; tot[l] = 0;
    ids.forEach(function (s) { var x = share(s, off), win = x > 50 ? w : l, seats = {}, sh = {}; seats[win] = el[s]; sh[w] = Math.round(x * 10) / 10; sh[l] = Math.round((100 - x) * 10) / 10; tot[win] += el[s]; states[s] = { seats: seats, shares: sh }; });
    return (p2cache[e.year] = { states: states, ev: tot, total: W });
  };
  // Governors since 1914, elected at each general election in two rounds.
  // Governors are judged on state issues: a candidate's personal vote counts for
  // more, incumbent parties have an edge, smaller and regional parties do better
  // than in federal races, and independents sometimes run strong campaigns.
  var gcache = null;
  U.LORE.govHistory = function () {
    if (gcache) return gcache;
    var out = [], prev = null, GE = U.LORE.generalElections;
    // fixed three-year terms on the presidential cycle: 1914, 1917, 1920 ... 1992;
    // each uses the state votes of the latest general election
    var years = []; for (var yy = 1914; yy <= 1992; yy += 3) years.push(yy); // 1995 is the game's own starting set
    years.forEach(function (Y) {
      var e = GE.filter(function (x) { return x.year <= Y; }).slice(-1)[0] || GE[0];
      e = Object.assign({}, e, { year: Y, _src: e }); var d = U.LORE.generalDetail(e._src), govs = {};
      Object.keys(d.states).forEach(function (s) {
        if (s === 'DC') return;
        var base = d.states[s].shares, v = {}, t = 0, inc = prev && prev[s] ? prev[s].w : null;
        for (var p in base) {
          var x = base[p] * (1 + 0.8 * (hash('g' + e.year + s + p) - 0.5));          // personal vote
          if (p === inc) x *= 1.18;                                                       // incumbency
          if (base[p] < 12) x *= 1.3;                                                     // minor parties do better locally
          v[p] = x; t += x; }
        var hi = hash('gi' + e.year + s);
        if (hi > 0.93) { v.ind = t * (0.12 + 0.35 * hash('gx' + e.year + s)); t += v.ind; }  // a strong independent
        var r1 = {}; for (p in v) { var q = v[p] / t * 100; if (q >= 0.5) r1[p] = Math.round(q * 10) / 10; }
        var ord = Object.keys(r1).sort(function (a, b) { return r1[b] - r1[a]; }), w = ord[0], r2 = null;
        if (ord.length > 1 && r1[ord[0]] <= 50) {
          var a = ord[0], b = ord[1], va = r1[a], vb = r1[b], ec = function (p) { return p === 'ind' ? (U.partyInfo(a).econ + U.partyInfo(b).econ) / 2 : (U.partyInfo(p).econ || 0); };
          ord.slice(2).forEach(function (p) { var wa = Math.exp(-Math.abs(ec(p) - ec(a)) / 3), wb = Math.exp(-Math.abs(ec(p) - ec(b)) / 3); va += r1[p] * 0.75 * wa / (wa + wb); vb += r1[p] * 0.75 * wb / (wa + wb); });
          // runoffs are about the candidates too
          va *= 1 + 0.16 * (hash('gr' + e.year + s) - 0.5);
          r2 = {}; r2[a] = Math.round(va / (va + vb) * 1000) / 10; r2[b] = Math.round((100 - r2[a]) * 10) / 10; w = r2[a] >= r2[b] ? a : b;
        }
        govs[s] = { w: w, r1: r1, r2: r2 };
      });
      out.push({ year: Y, govs: govs, midterm: (Y - 1914) % 6 === 3 }); prev = govs;
    });
    return (gcache = out);
  };
  // seats for a historical election (the sum of the state results)
  U.LORE.generalSeats = function (e) { return U.LORE.generalDetail(e).house; };
})(typeof globalThis !== 'undefined' ? globalThis : window);
