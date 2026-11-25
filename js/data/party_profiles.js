// Profiles for every current and former party and alliance: ideology, positions
// on seven axes (-10..10) and internal factions [name, leading figure, what they want].
// Axes: econ (left -10, right +10), trade (protectionist -10, free trade +10),
// soc (progressive -10, conservative +10), foreign (isolationist -10, interventionist +10),
// fed (centralist -10, federalist +10), pop (institutionalist -10, populist +10),
// env (growth first -10, environmentalist +10).
(function (G) {
  'use strict';
  var U = G.USA;
  U.AXES = [
    ['econ', 'Economy', 'Left', 'Right'],
    ['trade', 'Trade', 'Protectionist', 'Free trade'],
    ['soc', 'Society', 'Progressive', 'Conservative'],
    ['foreign', 'Foreign policy', 'Non-interventionist', 'Interventionist'],
    ['fed', 'Federalism', 'Centralist', 'Federalist'],
    ['pop', 'Style', 'Institutionalist', 'Populist'],
    ['env', 'Environment', 'Growth first', 'Environmentalist']
  ];
  // former parties not in U.PARTIES
  U.FORMER_PARTIES = {
    dem: { name: 'Democratic Party', short: 'DEM', color: '#3b6fb6', years: '1828–1978' },
    rep: { name: 'Republican Party', short: 'REP', color: '#c0392b', years: '1854–1978' },
    prog: { name: 'Progressive Party', short: 'PROG', color: '#2e8b57', years: '1912–1952' },
    soc: { name: 'Socialist Party of America', short: 'SOC', color: '#9c27b0', years: '1901–1952' },
    fl: { name: 'Farmer-Labor Party', short: 'FLP', color: '#8fbc3f', years: '1918–1952' },
    alp: { name: 'American Labor Party', short: 'ALP', color: '#b5651d', years: '1936–1952' },
    npl: { name: 'Nonpartisan League', short: 'NPL', color: '#6b8e23', years: '1915–1952' },
    mup: { name: 'Mormon Unity Party', short: 'MUP', color: '#d9a441', years: '1946–1988' },
    cath: { name: 'Catholic Party', short: 'CATH', color: '#c9a227', years: '1958–1988' },
    mod: { name: 'Moderate Party', short: 'MOD', color: '#7fa7c9', years: '1970–1988' }
  };
  var P = function (status, ideology, ax, factions, extra) { var o = { status: status, ideology: ideology, ax: ax, factions: factions }; for (var k in extra || {}) o[k] = extra[k]; return o; };
  U.PARTY_PROFILES = {
    // ---- national parties ----
    ldp: P('national', 'Social liberalism, Third Way, civil-rights liberalism', { econ: -2, trade: 6, soc: -4, foreign: 5, fed: -2, pop: -5, env: 3 }, [
      ['New Democrats', 'Joe Lieberman', 'fiscal discipline, free trade, business-friendly growth'],
      ['Progressive Liberals', 'Ted Kennedy', 'universal health care, closer ties with the SDLP'],
      ['Civil Rights Caucus', 'John Lewis', 'voting rights, urban investment, criminal-justice reform'],
      ['Heartland Liberals', 'Evan Bayh', 'rural and Midwestern moderates; guns, farms and manufacturing']]),
    sdlp: P('national', 'Social democracy, labourism', { econ: -6, trade: -5, soc: -2, foreign: 1, fed: -3, pop: 1, env: 2 }, [
      ['Labor Bloc', 'Richard Trumka', 'union power, industrial policy, opposition to NAFTA'],
      ['Progressive Wing', 'Paul Wellstone', 'single-payer health care, campaign finance reform'],
      ['Farm Caucus', 'Tom Harkin', 'heirs of the Farmer-Labor tradition; rural development'],
      ['Blue-Collar Moderates', 'Marcy Kaptur', 'culturally cautious Rust Belt social democrats']]),
    cdp: P('national', 'Christian democracy, social market economy', { econ: 3, trade: 5, soc: 4, foreign: 6, fed: 1, pop: -6, env: 1 }, [
      ['Social Christians', 'Richard Lugar', 'family policy, a strong welfare floor, coalitions with the centre-left'],
      ['Market Conservatives', 'John McCain', 'deficit reduction, defence, reform of government'],
      ['Catholic Caucus', 'Bob Casey Sr.', 'pro-life and pro-labor; uneasy with both big parties'],
      ['Main Street Moderates', 'Chris Shays', 'suburban centrists from the Northeast']]),
    cc: P('national', 'Conservatism, fiscal conservatism, Christian right', { econ: 6, trade: 3, soc: 6, foreign: 7, fed: 4, pop: 2, env: -6 }, [
      ['Business Conservatives', 'George W. Bush', 'tax cuts, deregulation, free trade'],
      ['Religious Right', 'Tom DeLay', 'abortion, school prayer, traditional marriage'],
      ['Southern Populists', 'Trent Lott', 'the old southern Democratic wing: farm subsidies, defence jobs'],
      ['Revolutionaries', 'Newt Gingrich', 'the Contract with America: shrink Washington fast']]),
    reform: P('national', 'Populist centrism', { econ: 0, trade: -7, soc: 2, foreign: -3, fed: 3, pop: 8, env: 0 }, [
      ['Perotistas', 'Ross Perot', 'balanced budgets, term limits, against NAFTA'],
      ['Paleocons', 'Pat Buchanan', 'economic nationalism and cultural conservatism'],
      ['Venturans', 'Jesse Ventura', 'socially liberal, anti-establishment independents']]),
    grn: P('national', 'Green politics, eco-socialism', { econ: -7, trade: -6, soc: -7, foreign: -7, fed: -1, pop: 4, env: 10 }, [
      ['Naderites', 'Ralph Nader', 'consumer protection, anti-corporate politics'],
      ['Eco-socialists', 'Howie Hawkins', 'public ownership and a green economy'],
      ['Fundis', 'Winona LaDuke', 'grassroots democracy, indigenous rights, no coalitions']]),
    cpusa: P('national', 'Communism, Marxism-Leninism', { econ: -9, trade: -6, soc: -3, foreign: -8, fed: -4, pop: 5, env: 2 }, [
      ['Reformers', 'Sam Webb', 'democratic socialism and joining a United Left under Sanders'],
      ['Old Guard', 'Gus Hall', 'loyal to the party line'],
      ['Labor militants', 'Jarvis Tyner', 'strikes and civil rights before ideology']]),
    dsa: P('national', 'Democratic socialism', { econ: -8, trade: -5, soc: -6, foreign: -6, fed: -2, pop: 3, env: 6 }, [
      ['Electoralists', 'Ron Dellums', 'win seats and pull the SDLP left'],
      ['Movement Left', 'Barbara Ehrenreich', 'build social movements first']]),
    wfp: P('national', 'Labor progressivism, fusion politics', { econ: -7, trade: -6, soc: -3, foreign: -2, fed: -2, pop: 3, env: 4 }, [
      ['Union Wing', 'Dan Cantor', 'living wages and paid leave'],
      ['Community Organisers', 'Bertha Lewis', 'housing and neighbourhood campaigns']]),
    lib: P('national', 'Libertarianism, classical liberalism', { econ: 9, trade: 10, soc: -5, foreign: -8, fed: 6, pop: 2, env: -5 }, [
      ['Purists', 'Harry Browne', 'abolish the income tax, end the drug war'],
      ['Pragmatists', 'Bill Weld', 'socially liberal, fiscally conservative centrists'],
      ['Paleolibertarians', 'Murray Rothbard', 'anti-war, anti-state, culturally conservative']]),
    con: P('national', 'Paleoconservatism, Christian right', { econ: 8, trade: -6, soc: 9, foreign: -5, fed: 8, pop: 6, env: -6 }, [
      ['Constitutionalists', 'Howard Phillips', 'strict construction, abolish federal agencies'],
      ['Theocons', 'Roy Moore', 'religion in public life'],
      ['America Firsters', 'Alan Keyes', 'against foreign aid and immigration']]),
    // ---- alliances and blocs ----
    asp: P('alliance', 'Christian democracy (old style): culturally conservative, fiscally progressive', { econ: -3, trade: -2, soc: 5, foreign: 0, fed: 3, pop: -2, env: 3 }, [
      ['Mormon Unity Party', 'Orrin Hatch', 'Utah and Idaho; family, thrift and community'],
      ['Catholic Party', 'Bob Casey Jr.', 'Great Lakes cities; pro-life, pro-labor'],
      ['Moderate Party', 'Lincoln Chafee', 'New England centrists']], { members: ['mup', 'cath', 'mod'] }),
    ul: P('alliance', 'Electoral alliance of the far left', { econ: -8, trade: -6, soc: -6, foreign: -7, fed: -2, pop: 5, env: 6 }, [
      ['Reformists', 'Bernie Sanders', 'govern with the SDLP when it counts'],
      ['Hardliners', 'Gloria La Riva', 'no coalitions with capitalist parties'],
      ['Greens', 'Ralph Nader', 'may leave if the alliance ignores the environment']], { note: 'Does not exist at the start of 1997. Bernie Sanders, Vermont\u2019s Progressive senator, can unite the far left behind it.' }),
    aga: P('alliance', 'Federation of state Green parties; no fixed left-right line', { econ: -1, trade: -2, soc: 0, foreign: -4, fed: 5, pop: 2, env: 9 }, [
      ['Progressive chapters', 'Greg Gerritt', 'Rhode Island and the Northeast'],
      ['Conservationist chapters', 'Carol Miller', 'Virginia’s Independent Greens and rural chapters']]),
    revsoc: P('alliance', 'Fragmented radical left: Trotskyist, Maoist and Black liberation groups (not an electoral list)', { econ: -10, trade: -7, soc: -5, foreign: -9, fed: -3, pop: 6, env: 3 }, [
      ['Socialist Workers', 'James Harris', 'Trotskyism'],
      ['Workers World / PSL', 'Gloria La Riva', 'anti-imperialism'],
      ['Socialist Equality', 'David North', 'world socialist revolution']]),
    // ---- regional parties ----
    lsp: P('regional', 'Texan regionalism, libertarian populism', { econ: 6, trade: 4, soc: 4, foreign: -6, fed: 9, pop: 7, env: -7 }, [
      ['Autonomists', 'Ron Paul', 'Texan control of taxes and resources'],
      ['Independentistas', 'Larry Kilgore', 'a Texan republic']]),
    srp: P('regional', 'Southern regionalism, social conservatism, economic populism', { econ: -1, trade: -4, soc: 9, foreign: 2, fed: 9, pop: 7, env: -5 }, [
      ['Old Dixiecrats', 'Strom Thurmond', 'states’ rights and seniority in Washington'],
      ['Populists', 'Lester Maddox', 'jobs, farm prices and the little man'],
      ['Separatists', 'Michael Hill', 'Southern independence']]),
    cnp: P('regional', 'Californian nationalism, centre-left', { econ: -3, trade: 6, soc: -5, foreign: -3, fed: 9, pop: 3, env: 7 }, [
      ['Sovereigntists', 'Jerry Brown', 'more powers now, independence later'],
      ['Independentistas', 'Marcus Ruiz Evans', 'a referendum on independence']]),
    cfc: P('regional', 'Californian devolutionism, centre-right', { econ: 3, trade: 7, soc: 0, foreign: 2, fed: 7, pop: 1, env: -1 }, [
      ['Tax Revolt', 'Tom McClintock', 'heirs of Proposition 13'],
      ['Moderates', 'Pete Wilson', 'business-friendly devolution']]),
    vpp: P('regional', 'Vermont progressivism', { econ: -7, trade: -4, soc: -5, foreign: -5, fed: 2, pop: 4, env: 7 }, [['Burlington Progressives', 'Peter Clavelle', 'municipal socialism and local democracy'], ['Sanders wing', 'Bernie Sanders', 'democratic socialism, and a United Left he would lead'], ['Fusionists', 'David Zuckerman', 'joint tickets with the SDLP in Vermont']]),
    nyfp: P('regional', 'New York regionalism, independent centrism', { econ: 1, trade: 4, soc: -2, foreign: 3, fed: 7, pop: 4, env: 1 }, [
      ['Independence wing', 'Tom Golisano', 'business-minded reform'],
      ['Fulani wing', 'Lenora Fulani', 'left-wing populists']]),
    alk: P('regional', 'Alaskan regionalism', { econ: 6, trade: 3, soc: 2, foreign: -4, fed: 9, pop: 5, env: -8 }, [['Independence wing', 'Joe Vogler', 'Alaskan independence'], ['Resource populists', 'Walter Hickel', 'state control of oil, gas and land']]),
    aloha: P('regional', 'Hawaiian sovereignty, environmentalism', { econ: -4, trade: -2, soc: -2, foreign: -6, fed: 7, pop: 3, env: 8 }, [['Sovereignty movement', 'Haunani-Kay Trask', 'Native Hawaiian self-government'], ['Land and water', 'George Helm', 'protecting the land from development and the military']]),
    raza: P('regional', 'Chicano nationalism, social democracy', { econ: -5, trade: -4, soc: -1, foreign: -5, fed: 4, pop: 5, env: 2 }, [['Movimiento', 'José Ángel Gutiérrez', 'Mexican-American civil rights in the Southwest'], ['Farmworkers', 'Dolores Huerta', 'labor rights in the fields']]),
    nenp: P('regional', 'New England regionalism', { econ: -2, trade: 2, soc: -4, foreign: -2, fed: 8, pop: 2, env: 6 }, [['Town-meeting regionalists', 'Thomas Naylor', 'New England self-rule'], ['Yankee moderates', 'Angus King', 'regional autonomy without secession']]),
    // ---- future parties (dormant in 1997) ----
    acp: P('future', 'Syncretic far left (2020s)', { econ: -9, trade: -8, soc: 1, foreign: -8, fed: -6, pop: 9, env: -2 }, [['MAGA Communists', 'Jackson Hinkle', 'patriotic socialism'], ['Labor wing', 'Haz Al-Din', 'industrial workers first']]),
    maga: P('future', 'National populism', { econ: 3, trade: -8, soc: 8, foreign: -4, fed: 4, pop: 10, env: -8 }, [['Trumpists', 'Donald Trump', 'America First, tariffs, the wall'], ['Christian nationalists', 'Josh Hawley', 'religious conservatism'], ['National conservatives', 'J. D. Vance', 'industrial policy and a post-liberal right'], ['Freedom Caucus', 'Marjorie Taylor Greene', 'fight the establishment, shut down the government if needed'], ['Tech right', 'Elon Musk', 'deregulation, cutting the federal workforce'], ['MAHA', 'Robert F. Kennedy Jr.', 'health populism and suspicion of big pharma']]),
    afp: P('future', 'Hard-right nationalism', { econ: 4, trade: -9, soc: 10, foreign: -6, fed: 6, pop: 9, env: -9 }, [['Groypers', 'Nick Fuentes', 'white Christian nationalism'], ['Paleoconservatives', 'Pat Buchanan', 'tariffs, immigration restriction, non-intervention']]),
    // ---- former parties ----
    dem: P('former', 'Before 1966: the big-tent party of the Solid South and the northern cities. After 1966: the southern rump, segregationist and conservative', { econ: -1, trade: -2, soc: 4, foreign: 3, fed: 6, pop: 3, env: -4 }, [
      ['Southern Democrats', 'Richard Russell', 'seniority, segregation, states’ rights; stayed in 1966'],
      ['Northern liberals', 'Hubert Humphrey', 'civil rights and the New Deal; left to form the LDP'],
      ['City machines', 'Richard J. Daley', 'patronage and Catholic voters'],
      ['Share Our Wealth', 'Huey Long', 'redistribution and the Kingfish’s personal following']]),
    rep: P('former', 'Business conservatism and moderate Northern Republicanism', { econ: 5, trade: -3, soc: 3, foreign: 4, fed: 2, pop: -4, env: -3 }, [
      ['Old Guard', 'Robert A. Taft', 'small government, tariffs, scepticism of foreign wars'],
      ['Eastern establishment', 'Thomas E. Dewey', 'internationalism and the managed welfare state'],
      ['Western conservatives', 'Barry Goldwater', 'rugged individualism; went into the CC in 1978']]),
    prog: P('former', 'Progressivism and agrarian reform', { econ: -4, trade: -4, soc: -1, foreign: -3, fed: -3, pop: 5, env: 4 }, [
      ['Bull Moose Republicans', 'Theodore Roosevelt', 'trust-busting, conservation, a strong presidency'],
      ['La Follette Progressives', 'Robert La Follette', 'farmers, railroads, direct democracy'],
      ['Wallace Progressives', 'Henry A. Wallace', 'planned agriculture, peace with the Soviet Union']]),
    soc: P('former', 'Democratic socialism', { econ: -8, trade: -4, soc: -3, foreign: -8, fed: -3, pop: 4, env: 1 }, [
      ['Sewer Socialists', 'Daniel Hoan', 'clean municipal government in Milwaukee'],
      ['Militants', 'Norman Thomas', 'pacifism and civil liberties']]),
    fl: P('former', 'Agrarian socialism, cooperativism', { econ: -6, trade: -6, soc: 0, foreign: -6, fed: 0, pop: 7, env: 2 }, [['Olson Farmer-Laborites', 'Floyd Olson', 'cooperatives and public power'], ['Shipstead conservatives', 'Henrik Shipstead', 'isolationist farm populism']]),
    alp: P('former', 'New York labor socialism', { econ: -8, trade: -5, soc: -3, foreign: -2, fed: -3, pop: 4, env: 0 }, [['Garment unions', 'David Dubinsky', 'needle trades'], ['Marcantonio wing', 'Vito Marcantonio', 'pro-Soviet left']]),
    npl: P('former', 'Agrarian populism', { econ: -6, trade: -7, soc: 1, foreign: -7, fed: 2, pop: 8, env: 2 }, [['State-ownership wing', 'William Langer', 'state banks and grain elevators'], ['Townley organisers', 'Arthur C. Townley', 'organise farmers across the Plains']]),
    mup: P('former', 'Latter-day Saint communitarianism (merged into the ASP in 1988)', { econ: -1, trade: 0, soc: 6, foreign: 1, fed: 5, pop: -3, env: 2 }, [['Church loyalists', 'Ezra Taft Benson', 'family and self-reliance'], ['Welfare Mormons', 'George Romney', 'civil rights and cooperative welfare']]),
    cath: P('former', 'Catholic social teaching (merged into the ASP in 1988)', { econ: -4, trade: -3, soc: 5, foreign: 1, fed: 2, pop: 0, env: 2 }, [['Labor Catholics', 'Bob Casey Sr.', 'unions and the unborn'], ['Urban ethnics', 'Barbara Mikulski', 'Polish, Italian and Irish neighbourhoods']]),
    mod: P('former', 'New England moderation (merged into the ASP in 1988)', { econ: 0, trade: 3, soc: -1, foreign: 2, fed: 4, pop: -5, env: 5 }, [['Yankee moderates', 'John Chafee', 'conservation and fiscal prudence'], ['Good-government reformers', 'Lowell Weicker', 'independence from party machines']])
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
