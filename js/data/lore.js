// Setting history (designer-requested lore). The point of divergence is the
// 1912 election. Real people appear, but their careers differ from our world.
// Canon anchors from the brief are kept: the LDP from the 1960s civil-rights
// split, the SDLP from the 1950s Progressive-labor merger, the CC from the
// late-1970s merger, the SRP from the Dixiecrats, Clinton elected 1992 and up
// for re-election in 1998 on a six-year cycle, Gore PM since December 1996.
(function (G) {
  'use strict';
  var U = G.USA;

  U.LORE = {};

  U.LORE.constitution = [
    ['1789–1912', 'The same republic as ours: a President elected every four years, a House elected by districts, and two dominant parties, the Democrats and the Republicans.'],
    ['1912', 'Theodore Roosevelt’s breakaway Progressive Party beats the Republicans for second place. Woodrow Wilson wins the presidency with 42% of the vote, and no party controls the House. A year of deadlock follows: three appropriations bills fail, and the Army goes unpaid for six weeks.'],
    ['1913–1914', 'The Reconstruction Amendments of 1914. A Prime Minister takes over the day-to-day running of the government. The President appoints and may dismiss the Prime Minister, who also needs the confidence of the House. The House is elected by statewide proportional representation. The President serves a six-year term, elected in two rounds: a national popular vote, then an Electoral College runoff between the top two. Three senators per state are elected by proportional representation and the fourth by the state house. Presidents may serve two terms. Wilson resigns to seek a fresh mandate under the new rules, and loses the runoff to Theodore Roosevelt.'],
    ['1974', 'After a decade in which a dozen parties sat in the House, the House is fixed at 600 seats: 500 state list seats with no threshold, and 100 national list seats for parties with at least 5% of the nationwide vote.'],
    ['1990s', 'Regional parties are on the rise and the far left is fragmented. The presidency remains the one office every voter fills on the same day.']
  ];

  // Party histories: founded, roots, ideology
  U.LORE.parties = {
    ldp: ['1966', 'Born when the old Democratic Party broke apart over the Civil Rights and Voting Rights Acts, which Prime Minister Lyndon Johnson forced through against President Nixon\u2019s wishes after John F. Kennedy\u2019s assassination. Johnson and Hubert Humphrey led the northern, western and Black Democratic wings out of a party whose southern caucus had fought the laws to the end. The conservative southern Democrats who stayed behind later merged into the Conservative Coalition.',
      'Liberal and socially progressive; pro-market but committed to a welfare state; internationalist. A broad church running from Third Way New Democrats to civil-rights liberals, held together by opposition to segregation and later by government office.'],
    sdlp: ['1952', 'A merger of the heirs of Theodore Roosevelt’s Progressive Party with the labor and socialist parties that had grown up beside it: the Socialist Party of Norman Thomas, Minnesota’s Farmer-Labor Party, New York’s American Labor Party and the Nonpartisan League of the Plains. Its strength lies in the industrial Midwest, the unions and the Rust Belt. Its high point came in 1968, when Robert F. Kennedy, beaten for the LDP nomination by Lyndon Johnson, joined the party and won the presidency, which he held for two terms.',
      'Mainstream social democracy and labor politics: collective bargaining, public health insurance, industrial policy and a mixed economy. It is wary of free trade and more culturally moderate than the LDP.'],
    cdp: ['1946', 'Founded after the Second World War by Midwestern moderate Republicans, Catholic Democrats uneasy with the New Deal’s urban machines, and Protestant reformers, on the model of the Christian democratic parties then rebuilding Europe. It served as the balancing party of the 1950s.',
      'Pragmatic, centre-right Christian democracy: market economics with a social conscience, family policy, subsidiarity and federalism, Atlanticism. Culturally Christian but not sectarian.'],
    cc: ['1978', 'A merger of the rump southern Democratic Party, left behind by the 1966 split, with the Republican Party, after a decade in which the two had voted together in the House and taken turns blocking each other in the South. Ronald Reagan’s 1980 presidential win made it the main party of the right for a generation.',
      'Conservative: lower taxes, deregulation, a strong military and traditional values, with a southern populist streak and a business wing that do not always agree.'],
    asp: ['1988', 'A confederation of centrist, faith-based regional parties that kept finding themselves on the same side of budget votes: the Mormon Unity Party in Utah and Idaho, the Catholic Party in the Great Lakes cities, and the Moderate Party in New England. After the 1974 reform they formed a joint list to reach the 5% needed for national list seats.',
      'Christian democratic in the older sense: culturally conservative and fiscally progressive. Pro-family, pro-labor and devolutionist, it bargains with left or right for its constituent states.'],
    reform: ['1995', 'Founded by Ross Perot after his 1992 presidential campaign won 19% of the first-round vote. It drew in independents, deficit hawks and opponents of free trade, and agreed confidence and supply for Gore’s government in 1996. Its best days may already be behind it.',
      'Populist centrism: balanced budgets, term limits, campaign finance reform, opposition to NAFTA, and a distrust of both big parties.'],
    grn: ['1984', 'Grew out of the anti-nuclear and environmental movements of the 1970s and early 1980s, alongside the state Green parties that later formed the American Green Alliance. A marginal force until Ralph Nader took the leadership in the late 1990s.',
      'Eco-socialist and progressive: environmental protection, grassroots democracy, social justice and non-violence, with deep hostility to corporate power.'],
    cpusa: ['1919', 'The Communist Party USA, founded in the wake of the Russian Revolution. It peaked in the 1930s labor struggles, was hounded in the 1950s, and lost most of its members after 1956. It held one or two House seats under PR in most decades.',
      'Marxist-Leninist, though by the 1990s mainly a party of labor militancy and civil rights.'],
    dsa: ['1982', 'Democratic Socialists of America, formed by left-wing SDLP dissidents and New Left veterans who thought the SDLP had made its peace with capitalism.',
      'Democratic socialism: social ownership, union power, universal public services, achieved through elections.'],
    wfp: ['1994', 'The Working Families Party, built by New York unions and community organizations as a pressure party that endorses candidates of other parties as often as it runs its own.',
      'Labor-progressive: living wages, paid leave, affordable housing.'],
    revsoc: ['various', 'The fragmented revolutionary left: the Socialist Workers, Workers World, the Party for Socialism and Liberation, the Socialist Equality Party, the Black Panther Party and others, each with its own newspaper and its own split.',
      'Revolutionary socialism and communism in rival Trotskyist, Maoist and Black liberation traditions.'],
    vpp: ['1981', 'Grew from the coalition that elected Bernie Sanders mayor of Burlington. The strongest third force in Vermont politics.',
      'Progressive and populist, with deep local roots.'],
    ul: ['(not yet founded)', 'A United Left alliance has been proposed many times since the 1970s and has never got off the ground.', 'An electoral alliance of the far left.'],
    acp: ['(2020s)', 'Does not exist in this period.', 'Syncretic far left.'],
    lib: ['1971', 'Founded in Colorado by activists angry at price controls and the Vietnam draft. It benefits from PR, which gives it seats in most parliaments.',
      'Classical liberal: low taxes, minimal government, civil liberties, a non-interventionist foreign policy.'],
    con: ['1980', 'Founded as the American Constitutional Party by conservatives who refused to follow the Republicans into the 1978 merger with the southern Democrats, which they saw as an unprincipled power grab. It is the main protest party of the hard right.',
      'Paleoconservative and Christian-right: strict constitutionalism, states’ rights, opposition to abortion and immigration.'],
    maga: ['(2016 in the default timeline)', 'Does not exist in this period.', 'National populism.'],
    afp: ['(later)', 'Does not exist in this period.', 'Hard-right nationalism.'],
    aga: ['1991', 'A federation of state Green parties that would not join a national party run from Washington, ranging from progressive Rhode Island Greens to Virginia’s conservationist Independent Greens.',
      'Environmentalism without a fixed left-right position; every chapter sets its own line.'],
    lsp: ['1986', 'Born in the Texas oil bust of the mid-1980s, when Texans blamed federal energy policy and Washington’s banks for the state’s ruin. Ron Paul brought it national attention.',
      'Texan regionalism with a libertarian-populist streak: state control of resources and taxes, gun rights, low federal taxes. A hardline minority wants independence.'],
    srp: ['1948', 'The States’ Rights Democratic Party, the Dixiecrats, which walked out of the Democratic convention over Truman’s civil-rights platform and nominated Strom Thurmond for President. Unlike in our history it never went back, and George Wallace made it a force in 1968.',
      'Southern regionalism: social conservatism, economic populism, states’ rights. Its hardliners still talk of Southern independence.'],
    cnp: ['1992', 'Founded after the Los Angeles riots and the recession of the early 1990s by Californians who felt the state paid Washington far more than it got back.',
      'Centre-left Californian nationalism, seeking independence in the long run.'],
    cfc: ['1978', 'Grew out of the Proposition 13 tax revolt. Its founders wanted Sacramento, not Washington, to set taxes, water and land policy.',
      'Centre-right devolutionism: more powers for California within the Union.'],
    alk: ['1984', 'Founded by Joe Vogler as the Alaskan Independence Party. Walter Hickel won the governorship on its ticket in 1990.',
      'Alaskan nationalism, libertarian and conservative; it calls for a referendum on Alaska’s status.'],
    aloha: ['1993', 'Founded after the centenary of the overthrow of the Hawaiian Kingdom and Congress’s apology for it.',
      'Native Hawaiian sovereignty and self-determination, land rights, environmental protection.'],
    raza: ['1970', 'La Raza Unida Party, founded in Crystal City, Texas, during the Chicano movement. PR kept it alive after the movement faded.',
      'Mexican-American civil rights, community control, labor rights.'],
    nenp: ['1990', 'A New England regionalist party founded during the region’s banking crisis by Yankee independents and Vermont separatists.',
      'Regional autonomy for New England, town-meeting democracy, decentralism.'],
    nyfp: ['1975', 'Founded during New York City’s fiscal crisis by New Yorkers who believed the state sent Washington and the rest of the country far more than it got back.',
      'New York regionalism: fiscal autonomy and a better deal for the state within the Union.']
  };

  // Presidents since the 1914 reconstruction (six-year terms)
  U.LORE.presidents = [
    ['1914', 'Theodore Roosevelt', 'Progressive', 'Beat Woodrow Wilson in the first runoff under the new constitution, after Wilson resigned to seek a fresh mandate. Died in office in January 1919; Vice President Hiram Johnson served out the term.'],
    ['1920', 'Charles Evans Hughes', 'Republican', 'Won on a promise of calm after the war and the fight over the League of Nations.'],
    ['1926', 'Frank Lowden', 'Republican', 'The Illinois governor and farm-relief champion, the choice of the farm belt. The Wall Street crash came three years into his term.'],
    ['1932', 'Huey Long', 'Democratic', 'The Louisiana Kingfish swept to power on Share Our Wealth in the depths of the Depression, and spent his first term at war with his own party’s Prime Minister, Al Smith.'],
    ['1938', 'Huey Long', 'Democratic', 'Re-elected. Survived a 1935 shooting in the Louisiana capitol that killed him in our history.'],
    ['1944', 'John Nance Garner', 'Democratic', 'Cactus Jack, the Texan conservative, won as a steady wartime choice.'],
    ['1950', 'Thomas E. Dewey', 'Republican', 'The New York governor won at the start of the Cold War.'],
    ['1956', 'Thomas E. Dewey', 'Republican', 'Re-elected.'],
    ['1962', 'Richard Nixon', 'Republican', 'Inherited John F. Kennedy as his Prime Minister. In 1963 he dismissed Kennedy, who had embarrassed him by trying to force through a civil-rights bill, only to see Kennedy return to office after new elections. After Kennedy\u2019s assassination in 1964 he appointed Lyndon Johnson, expecting a moderate, and was forced to accept the Civil Rights Act.'],
    ['1968', 'Robert F. Kennedy', 'Social Democratic Labor', 'Lost the LDP nomination to Prime Minister Lyndon Johnson, left the party for the SDLP, and won. He beat George Wallace (SRP) in the runoff after Johnson came third in the first round. The SDLP\u2019s first President.'],
    ['1974', 'Robert F. Kennedy', 'Social Democratic Labor', 'Re-elected over Gerald Ford (Republican).'],
    ['1980', 'Ronald Reagan', 'Conservative Coalition', 'His runoff win over Jimmy Carter (LDP) made the new CC the main party of the right.'],
    ['1986', 'Ronald Reagan', 'Conservative Coalition', 'Re-elected over Walter Mondale (LDP).'],
    ['1992', 'Bill Clinton', 'Liberal Democratic', 'Beat Vice President George H. W. Bush (CC) in the runoff. Ross Perot won 19% of the first-round vote.'],
    ['1998', '—', '', 'The next election, due in November 1998.']
  ];

  // Prime Ministers and their governments
  U.LORE.governments = [
    ['1915–1919', 'Champ Clark', 'Democratic', 'Democratic–Progressive coalition under President Roosevelt'],
    ['1919–1923', 'Warren G. Harding', 'Republican', 'Republicans with conservative Democrats; died in office'],
    ['1923–1927', 'Robert La Follette, then George Norris', 'Progressive', 'Progressive–Democratic–Farmer-Labor coalition'],
    ['1927–1932', 'Nicholas Longworth', 'Republican', 'Republican-led government under President Lowden'],
    ['1932–1938', 'Al Smith', 'Democratic', 'Democratic–Progressive coalition; the New Deal, written by Smith’s cabinet and fought over with President Long'],
    ['1939–1944', 'Henry A. Wallace', 'Progressive', 'Progressive–Democratic–Farmer-Labor coalition; took the country into the Second World War'],
    ['1945–1950', 'Alben W. Barkley', 'Democratic', 'Democratic–Progressive coalition; demobilisation and the start of the Cold War'],
    ['1950–1953', 'Robert A. Taft', 'Republican', 'Republican–CDP coalition; Taft died in office'],
    ['1953–1958', 'Estes Kefauver', 'Democratic', 'Democratic–SDLP coalition'],
    ['1958\u20131961', 'Lyndon B. Johnson', 'Democratic', 'Democratic\u2013SDLP coalition'],
    ['1961\u20131963', 'John F. Kennedy', 'Democratic', 'Democratic\u2013SDLP\u2013CDP coalition; dismissed by President Nixon after his civil-rights bill failed, and the coalition broke up'],
    ['1963\u20131964', 'John F. Kennedy', 'Democratic', 'Democratic\u2013SDLP\u2013Progressive and centrist majority after the snap election, despite Democratic infighting; Kennedy was assassinated in Dallas in November 1964'],
    ['1964–1966', 'Lyndon B. Johnson', 'Democratic', 'Appointed by Nixon as a safe pair of hands; forced through the Civil Rights Act (1965) and the Voting Rights Act, splitting the Democratic Party'],
    ['1966–1968', 'Lyndon B. Johnson', 'Liberal Democratic', 'LDP–SDLP coalition; Johnson stood down to run for President and lost'],
    ['1968–1974', 'Hubert Humphrey', 'Liberal Democratic', 'LDP–SDLP coalition under President Robert Kennedy, an uneasy partnership after the bitter 1968 race'],
    ['1974–1978', 'Edmund Muskie', 'Liberal Democratic', 'LDP–SDLP–CDP grand coalition during Kennedy’s second term'],
    ['1978–1982', 'Walter Mondale', 'Liberal Democratic', 'LDP–SDLP coalition'],
    ['1982–1986', 'Bob Dole', 'Conservative Coalition', 'CC–CDP coalition under President Reagan'],
    ['1986–1990', 'Jack Kemp', 'Conservative Coalition', 'CC–CDP–Libertarian coalition'],
    ['1990–1992', 'Lloyd Bentsen', 'Liberal Democratic', 'LDP–CDP grand coalition'],
    ['1992–1994', 'Tom Foley', 'Liberal Democratic', 'LDP–SDLP coalition, with ASP confidence and supply'],
    ['1994–1996', 'Newt Gingrich', 'Conservative Coalition', 'CC–CDP coalition; fell after the 1995–96 government shutdown'],
    ['1996–', 'Al Gore', 'Liberal Democratic', 'LDP–SDLP coalition, with Reform confidence and supply']
  ];

  // Historical presidential elections: round one is a national popular vote
  // (top two advance); round two is the Electoral College, winner-take-all by
  // state. r1: [name, party, %]; r2: [[name, party, electors, % of two-way vote], ...]
  U.LORE.presElections = [
    { year: 1914, total: 627, r1: [['Woodrow Wilson', 'dem', 36.1], ['Theodore Roosevelt', 'prog', 33.4], ['Elihu Root', 'rep', 22.0], ['Eugene V. Debs', 'soc', 6.2], ['Others', null, 2.3]],
      r2: [['Theodore Roosevelt', 'prog', 412, 51.8], ['Woodrow Wilson', 'dem', 215, 48.2]], era: '1910', lose: 'AL AR FL GA LA MS NC SC TN TX VA KY OK MD MO AZ NM', note: 'Republicans backed Roosevelt in the runoff; the South held for Wilson.' },
    { year: 1920, total: 627, r1: [['Charles Evans Hughes', 'rep', 34.8], ['William McAdoo', 'dem', 27.5], ['Hiram Johnson', 'prog', 24.1], ['Eugene V. Debs', 'soc', 6.0], ['Others', null, 7.6]],
      r2: [['Charles Evans Hughes', 'rep', 452, 55.6], ['William McAdoo', 'dem', 175, 44.4]], era: '1910', lose: 'AL AR FL GA LA MS NC SC TN TX VA KY OK', note: 'A vote for calm after the war and the League of Nations fight.' },
    { year: 1926, total: 627, r1: [['Frank Lowden', 'rep', 31.2], ['Al Smith', 'dem', 29.6], ['Robert La Follette Jr.', 'prog', 25.9], ['Norman Thomas', 'soc', 4.1], ['Others', null, 9.2]],
      r2: [['Frank Lowden', 'rep', 420, 51.2], ['Al Smith', 'dem', 207, 48.8]], era: '1910', lose: 'AL AR GA LA MS SC TX NY MA RI NJ CT MD', note: 'Farm-belt Progressives swung behind Lowden, the farm-relief champion, over the New York Catholic.' },
    { year: 1932, total: 627, r1: [['Huey Long', 'dem', 34.7], ['Frank Lowden', 'rep', 26.3], ['Floyd Olson', 'prog', 21.0], ['Norman Thomas', 'soc', 8.8], ['William Z. Foster', 'cpusa', 2.1], ['Others', null, 7.1]],
      r2: [['Huey Long', 'dem', 556, 61.4], ['Frank Lowden', 'rep', 71, 38.6]], era: '1930', lose: 'ME VT NH PA DE CT', note: 'A Depression landslide on Share Our Wealth.' },
    { year: 1938, total: 627, r1: [['Huey Long', 'dem', 38.2], ['Robert A. Taft', 'rep', 28.5], ['Robert La Follette Jr.', 'prog', 19.4], ['Norman Thomas', 'soc', 5.0], ['Others', null, 8.9]],
      r2: [['Huey Long', 'dem', 440, 55.9], ['Robert A. Taft', 'rep', 187, 44.1]], era: '1930', lose: 'ME VT NH CT DE PA OH MI IN IA KS NE NJ', note: 'Re-elected despite the 1937 recession and his feud with Prime Minister Smith.' },
    { year: 1944, total: 627, r1: [['John Nance Garner', 'dem', 33.0], ['Thomas E. Dewey', 'rep', 31.6], ['Henry A. Wallace', 'prog', 24.8], ['Norman Thomas', 'soc', 3.2], ['Others', null, 7.4]],
      r2: [['John Nance Garner', 'dem', 331, 50.6], ['Thomas E. Dewey', 'rep', 296, 49.4]], era: '1940', lose: 'ME VT NH MA RI CT NY NJ PA DE MI IN IL WI IA MN KS NE ND SD', note: 'A wartime cliffhanger: Ohio decided the runoff by 41,000 votes.' },
    { year: 1950, total: 627, r1: [['Thomas E. Dewey', 'rep', 34.1], ['Adlai Stevenson', 'dem', 28.4], ['Henry A. Wallace', 'prog', 14.9], ['Strom Thurmond', 'srp', 8.7], ['Robert Taft (CDP backing)', 'cdp', 9.6], ['Others', null, 4.3]],
      r2: [['Thomas E. Dewey', 'rep', 455, 56.8], ['Adlai Stevenson', 'dem', 172, 43.2]], era: '1950', lose: 'AL AR FL GA LA MS NC SC TN TX VA KY WV', note: 'The Dixiecrats’ Strom Thurmond carried four southern states’ first-round votes.' },
    { year: 1956, total: 627, r1: [['Thomas E. Dewey', 'rep', 36.8], ['Estes Kefauver', 'dem', 27.2], ['Walter Reuther', 'sdlp', 18.6], ['Strom Thurmond', 'srp', 7.9], ['Others', null, 9.5]],
      r2: [['Thomas E. Dewey', 'rep', 440, 54.4], ['Estes Kefauver', 'dem', 187, 45.6]], era: '1950', lose: 'AL AR FL GA LA MS NC SC TN TX VA KY WV MO', note: 'Re-elected in the first presidential race for the new SDLP.' },
    { year: 1962, total: 638, r1: [['Richard Nixon', 'rep', 30.9], ['Hubert Humphrey', 'dem', 27.4], ['Nelson Rockefeller', 'cdp', 19.8], ['Walter Reuther', 'sdlp', 13.6], ['Others', null, 8.3]],
      r2: [['Richard Nixon', 'rep', 329, 51.6], ['Hubert Humphrey', 'dem', 309, 48.4]], era: '1960', lose: 'AL AR FL GA LA MS NC SC TN TX VA MN WI MI MA RI NY PA WV DC', note: 'Nixon won narrowly, and found himself sharing power with a Democratic Prime Minister, John F. Kennedy.' },
    { year: 1968, total: 638, r1: [['Robert F. Kennedy', 'sdlp', 24.6], ['George Wallace', 'srp', 22.1], ['Lyndon B. Johnson', 'ldp', 21.0], ['Nelson Rockefeller', 'cdp', 18.2], ['Ronald Reagan', 'rep', 10.4], ['Others', null, 3.7]],
      r2: [['Robert F. Kennedy', 'sdlp', 545, 64.2], ['George Wallace', 'srp', 93, 35.8]], era: '1960', lose: 'AL MS GA LA SC AR NC TN', note: 'Kennedy, beaten for the LDP nomination by Johnson, ran for the SDLP and topped a five-way first round. The LDP, CDP and Republicans backed him against Wallace in the runoff.' },
    { year: 1974, total: 701, r1: [['Robert F. Kennedy', 'sdlp', 33.1], ['Gerald Ford', 'rep', 25.0], ['Walter Mondale', 'ldp', 17.9], ['Nelson Rockefeller', 'cdp', 13.6], ['George Wallace', 'srp', 7.2], ['Others', null, 3.2]],
      r2: [['Robert F. Kennedy', 'sdlp', 402, 56.0], ['Gerald Ford', 'rep', 299, 44.0]], era: 'modern', lose: 'AL AR FL GA LA MS NC SC TN TX VA OK KS NE SD ND MT WY ID UT AZ NV IN AK', note: 'Re-elected comfortably; Watergate sank the Republicans\u2019 hopes.' },
    { year: 1980, total: 701, r1: [['Ronald Reagan', 'cc', 35.4], ['Jimmy Carter', 'ldp', 26.2], ['Ted Kennedy', 'sdlp', 14.8], ['John B. Anderson', 'cdp', 12.1], ['Ed Clark', 'lib', 3.6], ['Others', null, 7.9]],
      r2: [['Ronald Reagan', 'cc', 562, 56.9], ['Jimmy Carter', 'ldp', 139, 43.1]], era: 'modern', lose: 'MA RI NY MN WI MD DC HI WV GA VT', note: 'The new CC’s breakthrough.' },
    { year: 1986, total: 701, r1: [['Ronald Reagan', 'cc', 37.9], ['Walter Mondale', 'ldp', 27.5], ['Jesse Jackson', 'sdlp', 13.4], ['Bob Dole (CDP backing)', 'cdp', 10.2], ['Others', null, 11.0]],
      r2: [['Ronald Reagan', 'cc', 570, 57.8], ['Walter Mondale', 'ldp', 131, 42.2]], era: 'modern', lose: 'MN NY MA RI MD DC HI WI VT WV IA', note: 'Re-elected comfortably.' },
    { year: 1992, total: 701, r1: [['Bill Clinton', 'ldp', 29.1], ['George H. W. Bush', 'cc', 25.3], ['Ross Perot', 'ind', 19.0], ['Bill Bradley', 'sdlp', 12.4], ['CDP nominee', 'cdp', 8.6], ['Others', null, 5.6]],
      r2: [['Bill Clinton', 'ldp', 420, 53.1], ['George H. W. Bush', 'cc', 281, 46.9]], era: 'modern', lose: 'AL FL GA MS NC SC TN TX VA OK KS NE SD ND MT WY ID UT AZ IN KY AK', note: 'Perot’s voters split almost evenly; Clinton’s runoff win came on the SDLP’s votes.' }
  ];
  // Electors per state by apportionment era (the real Electoral College plus 2 per state for the
  // four-senator Senate; DC 3 from 1962). 'modern' (1974 on) uses the game's own apportionment.
  U.LORE.ecEras = {"1910":{"AL":14,"AZ":5,"AR":11,"CA":15,"CO":8,"CT":9,"DE":5,"FL":8,"GA":16,"ID":6,"IL":31,"IN":17,"IA":15,"KS":12,"KY":15,"LA":12,"ME":8,"MD":10,"MA":20,"MI":17,"MN":14,"MS":12,"MO":20,"MT":6,"NE":10,"NV":5,"NH":6,"NJ":16,"NM":5,"NY":47,"NC":14,"ND":7,"OH":26,"OK":12,"OR":7,"PA":40,"RI":7,"SC":11,"SD":7,"TN":14,"TX":22,"UT":6,"VT":6,"VA":14,"WA":9,"WV":10,"WI":15,"WY":5},"1930":{"AL":13,"AZ":5,"AR":11,"CA":24,"CO":8,"CT":10,"DE":5,"FL":9,"GA":14,"ID":6,"IL":31,"IN":16,"IA":13,"KS":11,"KY":13,"LA":12,"ME":7,"MD":10,"MA":19,"MI":21,"MN":13,"MS":11,"MO":17,"MT":6,"NE":9,"NV":5,"NH":6,"NJ":18,"NM":5,"NY":49,"NC":15,"ND":6,"OH":28,"OK":13,"OR":7,"PA":38,"RI":6,"SC":10,"SD":6,"TN":13,"TX":25,"UT":6,"VT":5,"VA":13,"WA":10,"WV":10,"WI":14,"WY":5},"1940":{"AL":13,"AZ":6,"AR":11,"CA":27,"CO":8,"CT":10,"DE":5,"FL":10,"GA":14,"ID":6,"IL":30,"IN":15,"IA":12,"KS":10,"KY":13,"LA":12,"ME":7,"MD":10,"MA":18,"MI":21,"MN":13,"MS":11,"MO":17,"MT":6,"NE":8,"NV":5,"NH":6,"NJ":18,"NM":6,"NY":49,"NC":16,"ND":6,"OH":27,"OK":12,"OR":8,"PA":37,"RI":6,"SC":10,"SD":6,"TN":14,"TX":25,"UT":6,"VT":5,"VA":13,"WA":10,"WV":10,"WI":14,"WY":5},"1950":{"AL":13,"AZ":6,"AR":10,"CA":34,"CO":8,"CT":10,"DE":5,"FL":12,"GA":14,"ID":6,"IL":29,"IN":15,"IA":12,"KS":10,"KY":12,"LA":12,"ME":7,"MD":11,"MA":18,"MI":22,"MN":13,"MS":10,"MO":15,"MT":6,"NE":8,"NV":5,"NH":6,"NJ":18,"NM":6,"NY":47,"NC":16,"ND":6,"OH":27,"OK":10,"OR":8,"PA":34,"RI":6,"SC":10,"SD":6,"TN":13,"TX":26,"UT":6,"VT":5,"VA":14,"WA":11,"WV":10,"WI":14,"WY":5},"1960":{"AL":12,"AK":5,"AZ":7,"AR":8,"CA":42,"CO":8,"CT":10,"DE":5,"DC":3,"FL":16,"GA":14,"HI":6,"ID":6,"IL":28,"IN":15,"IA":11,"KS":9,"KY":11,"LA":12,"ME":6,"MD":12,"MA":16,"MI":23,"MN":12,"MS":9,"MO":14,"MT":6,"NE":7,"NV":5,"NH":6,"NJ":19,"NM":6,"NY":45,"NC":15,"ND":6,"OH":28,"OK":10,"OR":8,"PA":31,"RI":6,"SC":10,"SD":6,"TN":13,"TX":27,"UT":6,"VT":5,"VA":14,"WA":11,"WV":9,"WI":14,"WY":5}};

  // Historical parties that no longer exist (for colours in the election records)
  U.LORE.oldParties = { dem: ['Democratic Party', '#3b6fb6'], rep: ['Republican Party', '#c0392b'], prog: ['Progressive Party', '#2e8b57'], soc: ['Socialist Party of America', '#b22222'], ind: ['Independent', '#888888'] };

  U.LORE.future = 'In the default timeline, Donald Trump founds the MAGA Party and wins the presidency in 2016, and Mike Pence (CC) leads a broad-right coalition of the CC, MAGA, CDP, ASP and Libertarians. In this game, none of that is guaranteed.';
})(typeof globalThis !== 'undefined' ? globalThis : window);
