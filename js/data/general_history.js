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
      note: 'The first House elected by statewide PR, held on the same day as the first presidential runoff and three months after war broke out in Europe. Democrats held the South; Roosevelt’s Progressives swept the West and the farm belt. Speaker Champ Clark became the first Prime Minister.' },
    { year: 1918, seats: 435, shares: { rep: 36.0, dem: 30.0, prog: 21.0, soc: 8.0, oth: 5.0 }, gov: ['rep', 'dem'], pm: 'Warren G. Harding',
      top: 'rep', map: { dem: SOUTH + ' KY OK MO MD', prog: 'CA WA OR ID MT ND SD MN WI' },
      note: 'Held a week before the Armistice, in the middle of the influenza pandemic, with President Roosevelt gravely ill. Voters tired of wartime controls turned to the Republicans, who formed a government with conservative Democrats after the Progressives refused to join a ministry opposed to the League of Nations. Roosevelt died two months later.' },
    { year: 1922, seats: 435, shares: { prog: 29.0, rep: 30.0, dem: 24.0, fl: 6.0, soc: 5.0, oth: 6.0 }, gov: ['prog', 'dem', 'fl'], pm: 'Robert La Follette',
      top: 'rep', map: { dem: SOUTH + ' KY OK', prog: 'CA WA OR ID MT WY CO ND SD NE KS IA WI', fl: 'MN' },
      note: 'The postwar slump hit farms hardest, and wheat prices halved. The Republicans stayed the largest party, but Harding’s government lost its majority as the Progressives and Minnesota’s Farmer-Labor Party surged. Robert La Follette formed a Progressive–Democratic–Farmer-Labor coalition in early 1923; George Norris succeeded him in 1925.' },
    { year: 1926, seats: 435, shares: { rep: 37.0, dem: 27.0, prog: 21.0, fl: 5.0, soc: 4.0, oth: 6.0 }, gov: ['rep', 'prog'], pm: 'Nicholas Longworth',
      top: 'rep', map: { dem: SOUTH + ' KY OK MO', prog: 'WA OR ID MT ND SD NE WI', fl: 'MN' },
      note: 'Held with the presidential election in the boom years. Frank Lowden’s promise of farm relief won over farm-belt Progressives, and Nicholas Longworth formed a Republican–Progressive government that passed the McNary–Haugen farm bill.' },
    { year: 1930, seats: 435, shares: { dem: 30.0, rep: 29.0, prog: 19.0, soc: 7.5, fl: 6.0, cpusa: 2.0, oth: 6.5 }, gov: ['rep', 'prog'], cs: ['fl'], pm: 'Nicholas Longworth',
      top: 'dem', map: { rep: 'ME VT NH CT RI DE NJ PA OH IN MI IL', prog: 'WA OR ID MT ND SD NE WI', fl: 'MN' },
      note: 'The first election after the Wall Street crash. The Democrats came first for the first time since 1914, but could not agree on a partner. Longworth held on with a minority government, kept alive by Farmer-Labor votes for farm credit, while unemployment passed 15%.' },
    { year: 1932, seats: 435, shares: { dem: 39.0, rep: 22.0, prog: 18.0, soc: 9.0, fl: 5.0, cpusa: 3.0, oth: 4.0 }, gov: ['dem', 'prog'], pm: 'Al Smith',
      top: 'dem', map: { rep: 'ME VT NH PA DE', prog: 'WA OR ID MT ND SD WI', fl: 'MN' },
      note: 'Longworth’s government fell over relief spending, and the snap election was held with the presidential vote at the depth of the Depression. Huey Long’s landslide carried the Democrats to their best result. Al Smith formed a Democratic–Progressive government that wrote the New Deal, and spent six years fighting his own President.' },
    { year: 1936, seats: 435, shares: { dem: 37.0, rep: 23.0, prog: 20.0, soc: 6.0, fl: 6.0, cpusa: 3.0, oth: 5.0 }, gov: ['dem', 'prog'], pm: 'Al Smith',
      top: 'dem', map: { rep: 'ME VT NH PA DE CT KS', prog: 'WA OR ID MT ND SD WI CA', fl: 'MN' },
      note: 'A verdict on the New Deal as the recovery took hold. The Smith coalition was returned, and the Progressives gained from Long’s attacks on Smith as a Wall Street Democrat.' },
    { year: 1938, seats: 435, shares: { dem: 30.0, prog: 29.0, rep: 26.0, fl: 6.0, soc: 4.0, oth: 5.0 }, gov: ['prog', 'dem', 'fl'], pm: 'Henry A. Wallace',
      top: 'dem', map: { rep: 'ME VT NH CT DE PA OH IN MI KS', prog: 'CA WA OR ID MT WY CO ND SD NE IA WI IL NY', fl: 'MN' },
      note: 'Held with Long’s re-election, a year into the 1937 recession and six weeks after Munich. The open war between Smith and Long cost the Democrats seven points. Henry Wallace, the Progressive agriculture secretary, formed a new coalition that rearmed the country and took it into the Second World War.' },
    { year: 1942, seats: 435, shares: { prog: 31.0, dem: 30.0, rep: 27.0, fl: 5.0, soc: 3.0, oth: 4.0 }, gov: ['prog', 'dem', 'fl'], pm: 'Henry A. Wallace',
      top: 'dem', map: { rep: 'ME VT NH CT DE PA OH IN KS NE', prog: 'CA WA OR ID MT WY CO ND SD IA WI IL NY MI', fl: 'MN' },
      note: 'A wartime election, eleven months after Pearl Harbor. Parties agreed not to attack the war effort, and the Wallace coalition was returned almost unchanged.' },
    { year: 1944, seats: 435, shares: { dem: 33.0, rep: 30.0, prog: 25.0, fl: 5.0, soc: 3.0, oth: 4.0 }, gov: ['dem', 'prog'], pm: 'Alben W. Barkley',
      top: 'dem', map: { rep: 'ME VT NH CT DE PA OH IN KS NE NJ', prog: 'CA WA OR ID MT ND SD WI', fl: 'MN' },
      note: 'Held with Garner’s narrow presidential win, five months after D-Day. The Democrats moved back into first place, and Alben Barkley led a Democratic–Progressive coalition through victory and demobilisation.' },
    { year: 1948, seats: 435, shares: { dem: 28.0, rep: 25.0, prog: 21.0, cdp: 9.0, srp: 9.0, fl: 3.0, soc: 2.0, cpusa: 1.0, oth: 2.0 }, gov: ['dem', 'prog', 'fl'], pm: 'Alben W. Barkley',
      top: 'dem', map: { rep: 'ME VT NH CT NJ PA OH IN KS NE', prog: 'CA WA OR ID MT ND SD WI NY', fl: 'MN', srp: 'AL MS SC LA', cdp: 'IA' },
      note: 'Southern Democrats walked out over Barkley’s civil-rights platform and ran as the States’ Rights Democrats, winning four Deep South states. The new Christian Democrats took Midwestern Republicans and Catholic voters. Barkley held on, just, as the Berlin airlift began.' },
    { year: 1950, seats: 435, shares: { rep: 35.0, cdp: 15.0, dem: 22.0, prog: 12.0, srp: 9.0, fl: 2.0, soc: 1.0, oth: 4.0 }, gov: ['rep', 'cdp'], pm: 'Robert A. Taft',
      top: 'rep', map: { dem: 'TX TN NC VA AR FL OK KY WV MO', srp: 'AL MS SC LA GA', prog: 'WA OR WI', cdp: 'IA MN' },
      note: 'Held with Dewey’s first presidential win, five months into the Korean War and at the height of the Red Scare. Wallace’s opposition to the war cost the Progressives nine points. Robert Taft led the first Republican–Christian Democratic coalition.' },
    { year: 1953, seats: 435, shares: { dem: 30.0, sdlp: 22.0, rep: 27.0, cdp: 11.0, srp: 7.0, oth: 3.0 }, gov: ['dem', 'sdlp'], pm: 'Estes Kefauver',
      top: 'dem', map: { rep: 'ME VT NH CT NJ PA OH IN KS NE CO WY ID UT AZ NV', sdlp: 'WA OR MN WI MI ND', srp: 'AL MS SC LA', cdp: 'IA' },
      note: 'Taft’s death in July 1953 broke the coalition, and the snap election came days after the Korean armistice. It was the first for the new Social Democratic Labor Party, the merger of the Progressives, Socialists and Farmer-Labor. Estes Kefauver, the crime-busting Tennessean, formed a Democratic–SDLP government.' },
    { year: 1957, seats: 435, shares: { dem: 31.0, sdlp: 21.0, rep: 26.0, cdp: 12.0, srp: 7.0, oth: 3.0 }, gov: ['dem', 'sdlp'], pm: 'Estes Kefauver',
      top: 'dem', map: { rep: 'ME VT NH CT NJ PA OH IN KS NE CO WY ID UT AZ', sdlp: 'WA OR MN WI MI ND', srp: 'AL MS SC LA', cdp: 'IA' },
      note: 'A month after Sputnik and two months after Little Rock. The government was narrowly returned on a promise of a crash science programme. Kefauver stood down the next year in favour of his Majority Leader, Lyndon Johnson.' },
    { year: 1960, seats: 435, shares: { dem: 29.0, rep: 28.0, sdlp: 19.0, cdp: 12.0, srp: 8.0, oth: 4.0 }, gov: ['dem', 'sdlp', 'cdp'], pm: 'John F. Kennedy',
      top: 'dem', map: { rep: 'ME VT NH NJ PA OH IN KS NE CO WY ID UT AZ CA OR', sdlp: 'WA MN WI MI ND', srp: 'AL MS SC LA', cdp: 'IA' },
      note: 'Johnson led the Democrats into the election, but the young Massachusetts senator John F. Kennedy ran the campaign and won the caucus vote afterwards. With the Democrats and SDLP short of a majority, Kennedy brought in the Christian Democrats: the first Catholic Prime Minister at the head of the first three-party government since the war.' },
    { year: 1963, seats: 435, shares: { dem: 32.0, sdlp: 21.0, rep: 27.0, cdp: 9.0, srp: 8.0, oth: 3.0 }, gov: ['dem', 'sdlp'], pm: 'John F. Kennedy',
      top: 'dem', map: { rep: 'ME VT NH NJ PA OH IN KS NE WY ID UT AZ', sdlp: 'WA MN WI MI ND', srp: 'AL MS SC LA GA', cdp: 'IA' },
      note: 'President Nixon dismissed Kennedy after his civil-rights bill failed and the CDP walked out of the coalition. Kennedy forced a snap election in October, two months after the March on Washington, and won it. He returned at the head of a Democratic–SDLP majority and was assassinated in Dallas thirteen months later.' },
    { year: 1966, seats: 435, shares: { ldp: 29.0, sdlp: 22.0, rep: 23.0, dem: 11.0, cdp: 8.0, srp: 4.0, oth: 3.0 }, gov: ['ldp', 'sdlp'], pm: 'Lyndon B. Johnson',
      top: 'ldp', map: { dem: 'TX GA NC SC TN AR FL VA OK', srp: 'AL MS LA', rep: 'KS NE WY ID UT AZ IN NH VT', sdlp: 'MN WI MI WA ND', cdp: 'IA' },
      note: 'The first election after the Democratic split. Johnson and Humphrey’s Liberal Democrats took the northern, western and Black Democratic vote; the southern rump kept the Democratic name and the South. Johnson’s LDP–SDLP government had a slim majority, as the Vietnam build-up began.' },
    { year: 1968, seats: 435, shares: { sdlp: 25.0, ldp: 26.0, rep: 22.0, srp: 11.0, dem: 7.0, cdp: 7.0, oth: 2.0 }, gov: ['ldp', 'sdlp'], pm: 'Hubert Humphrey',
      top: 'ldp', map: { srp: 'AL MS LA GA SC AR', dem: 'TX NC TN VA FL OK', rep: 'KS NE WY ID UT AZ IN NH VT SD MT CO', sdlp: 'MN WI MI WA ND OH PA WV', cdp: 'IA' },
      note: 'Held with the presidential election after the Tet Offensive, the murders of Martin Luther King and the riots that followed. George Wallace took the SRP to 11%. Robert Kennedy’s coattails nearly made the SDLP the largest party; Hubert Humphrey kept the premiership in an uneasy coalition with the President who had beaten his party.' },
    { year: 1972, seats: 435, shares: { ldp: 27.0, sdlp: 25.0, rep: 23.0, srp: 8.0, cdp: 8.0, dem: 6.0, lib: 1.0, oth: 2.0 }, gov: ['ldp', 'sdlp'], pm: 'Hubert Humphrey',
      top: 'ldp', map: { srp: 'AL MS LA GA SC', dem: 'TX NC TN VA AR OK', rep: 'KS NE WY ID UT AZ IN NH VT SD MT CO FL', sdlp: 'MN WI MI WA ND OH PA WV', cdp: 'IA' },
      note: 'Kennedy’s withdrawal from Vietnam and the opening to China kept the coalition in office. A House of a dozen parties and long nights of coalition talks led to the 1974 reform.' },
    { year: 1974, seats: 600, shares: { rep: 25.0, ldp: 24.0, sdlp: 22.0, cdp: 10.0, srp: 7.0, dem: 6.0, lib: 2.0, oth: 4.0 }, gov: ['ldp', 'sdlp', 'cdp'], pm: 'Edmund Muskie',
      top: 'ldp', map: { srp: 'AL MS LA GA SC', dem: 'TX NC TN AR', rep: 'KS NE WY ID UT AZ IN NH VT SD MT CO FL VA OK NV AK', sdlp: 'MN WI MI WA ND OH PA WV', cdp: 'IA' },
      note: 'The first 600-seat House, held with Kennedy’s re-election a year after the Arab oil embargo. Stagflation pushed the Republicans into first place, but no right-wing majority was possible. Edmund Muskie formed an LDP–SDLP–CDP grand coalition.' },
    { year: 1978, seats: 600, shares: { cc: 29.0, ldp: 28.0, sdlp: 22.0, cdp: 10.0, srp: 4.0, lib: 3.0, oth: 4.0 }, gov: ['ldp', 'sdlp'], pm: 'Walter Mondale',
      top: 'cc', map: { ldp: 'CA OR WA MA RI CT NY NJ MD DE IL HI VT ME NH DC CO NM', sdlp: 'MN WI MI ND OH PA WV', srp: 'MS AL', cdp: 'IA' },
      note: 'The first election for the Conservative Coalition, the merger of the Republicans and the southern Democrats, which topped the poll in the South and the West. The Camp David accords and falling oil prices let the left hold on: Walter Mondale formed an LDP–SDLP government with a narrow majority.' },
    { year: 1982, seats: 600, shares: { cc: 37.0, ldp: 21.0, sdlp: 17.0, cdp: 13.0, lib: 4.0, srp: 3.0, con: 1.5, dsa: 1.0, oth: 2.5 }, gov: ['cc', 'cdp'], pm: 'Bob Dole',
      top: 'cc', map: { ldp: 'MA RI NY HI DC', sdlp: 'MN WI MI WV', cdp: 'IA', srp: 'MS' },
      note: 'The Iran hostage crisis had cost the left the presidency; the 1981–82 recession and the Volcker interest rates cost it the House. The CC won its best result, and Bob Dole formed a CC–CDP government under President Reagan.' },
    { year: 1986, seats: 600, shares: { cc: 34.0, ldp: 20.0, sdlp: 19.0, cdp: 11.0, lib: 5.0, srp: 2.5, con: 2.0, lsp: 1.5, dsa: 1.5, grn: 0.8, oth: 2.7 }, gov: ['cc', 'cdp', 'lib'], pm: 'Jack Kemp',
      top: 'cc', map: { ldp: 'MA RI NY HI DC CA CT', sdlp: 'MN WI MI WV PA IL OH', cdp: 'IA' },
      note: 'Held with Reagan’s re-election, with the economy booming everywhere but the oil patch. The Texas oil bust gave birth to the Lone Star Party. Dole made way for the tax-cutting Jack Kemp, who needed the Libertarians for a majority.' },
    { year: 1990, seats: 600, shares: { ldp: 27.0, cc: 26.0, sdlp: 17.0, cdp: 13.0, lib: 4.0, asp: 3.0, lsp: 2.0, srp: 2.0, con: 2.0, dsa: 1.5, grn: 1.0, oth: 1.5 }, gov: ['ldp', 'cdp'], cs: ['sdlp'], pm: 'Lloyd Bentsen',
      top: 'cc', map: { ldp: 'CA OR WA MA RI CT NY NJ MD DE IL HI VT ME NH DC CO NM', sdlp: 'MN WI MI WV PA OH', cdp: 'IA', lsp: 'TX', asp: 'UT' },
      note: 'Held three months into the Gulf crisis, amid the savings-and-loan collapse and the Iran–Contra hearings. The LDP came first for the first time since 1966. The SDLP refused to serve under a Texan oilman, so Lloyd Bentsen formed an LDP–CDP government, with the SDLP voting for its budgets.' },
    { year: 1992, seats: 600, shares: { ldp: 28.0, cc: 24.0, sdlp: 18.0, cdp: 11.0, asp: 4.0, lib: 3.5, lsp: 2.0, srp: 2.0, con: 2.0, dsa: 1.2, cnp: 1.0, grn: 1.0, oth: 2.3 }, gov: ['ldp', 'sdlp'], cs: ['asp'], pm: 'Tom Foley',
      top: 'ldp', map: { cc: 'TX AL MS GA SC NC TN FL VA OK KS NE SD ND MT WY ID AZ IN KY AK', sdlp: 'MN WI MI WV PA OH', cdp: 'IA', asp: 'UT', lsp: '', srp: '' },
      note: 'Held with Clinton’s presidential win, a year after the Los Angeles riots and the Gulf War. Ross Perot ran only for President, but his voters punished the CC. Tom Foley formed an LDP–SDLP government with ASP confidence and supply.' },
    { year: 1994, seats: 600, shares: { cc: 29.0, ldp: 21.0, cdp: 16.0, sdlp: 15.0, lib: 4.0, asp: 4.0, con: 2.5, lsp: 2.0, srp: 2.0, grn: 1.0, dsa: 1.0, cnp: 1.0, oth: 1.5 }, gov: ['cc', 'cdp'], cs: ['lib', 'lsp'], pm: 'Newt Gingrich',
      top: 'cc', map: { ldp: 'CA OR WA MA RI CT NY NJ MD HI VT DC', sdlp: 'MN WI MI WV', cdp: 'IA DE', asp: 'UT', lsp: 'TX' },
      note: 'The Foley government fell when its health-care bill failed. Newt Gingrich’s Contract with America won the snap election, and he formed a CC–CDP government kept in office by the Libertarians and the Lone Star Party. It fell after the 1995–96 government shutdown, which forced the 1996 election.' }
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
      case 'soc': case 'cpusa': case 'dsa': case 'wfp': return (so ? 0.3 : 0.6) + 1.4 * s.urban * (0.5 + s.union * 2);
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
      case 'grn': return r === 'PC' ? 1.8 : ne ? 1.3 : 0.7;
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
    var states = {}, senStates = {}, house = {}, senate = {}, national = {};
    ids.forEach(function (s) {
      var sh = {}; parties.forEach(function (p) { if (v[s][p] >= 0.5) sh[p] = Math.round(v[s][p] * 10) / 10; });
      var won = D.divisor(v[s], seatsOf[s], 'sainte-lague', 0), seats = {}; for (var p in won) if (won[p]) { seats[p] = won[p]; house[p] = (house[p] || 0) + won[p]; }
      states[s] = { seats: seats, shares: sh };
      if (s === 'DC') return;
      var sw = D.senateSeats(v[s]), ss = {}; for (p in sw) if (sw[p]) ss[p] = sw[p];
      var leg = Object.keys(seats).sort(function (a, b) { return seats[b] - seats[a] || v[s][b] - v[s][a]; })[0];
      for (p in ss) senate[p] = (senate[p] || 0) + ss[p];
      senate[leg] = (senate[leg] || 0) + 1; senStates[s] = { seats: ss, shares: sh, leg: leg };
    });
    if (e.seats === 600) { var nv = {}; parties.forEach(function (p) { nv[p] = e.shares[p]; });
      var nw = D.divisor(nv, 100, 'sainte-lague', 5 / (100 - oth)); for (var q in nw) if (nw[q]) { national[q] = nw[q]; house[q] = (house[q] || 0) + nw[q]; } }
    return (cache[e.year] = { states: states, senStates: senStates, house: house, senate: senate, national: e.seats === 600 ? national : null, mismatched: ids.filter(function (s) { return parties.reduce(function (a, b) { return v[s][b] > v[s][a] ? b : a; }) !== want[s]; }) });
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

  // seats for a historical election (the sum of the state results)
  U.LORE.generalSeats = function (e) { return U.LORE.generalDetail(e).house; };
})(typeof globalThis !== 'undefined' ? globalThis : window);
