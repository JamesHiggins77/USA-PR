// The newspaper's wider world: campaigns, speeches, state bills, judges, reports,
// candidate selection, disasters, weather, holidays, diplomacy, foreign news,
// culture and sport. Uses its own seeded generator so it never changes the
// course of the simulation itself. Every item has a tier: breaking, key or minor.
(function (G) {
  'use strict';
  var U = G.USA, N = U.News = {};

  function mk(seed) { var s = seed >>> 0 || 1; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var R, pick = function (a) { return a[Math.floor(R() * a.length)]; }, chance = function (p) { return R() < p; };
  var PI = function (p) { return U.partyInfo(p); };
  var stName = function (sid) { return (U.STATES[sid] || U.DC).name; };
  var nat = function (Q) { return U.Votes.national(Q); };
  var bigParties = function (Q, n) { var v = nat(Q); return Object.keys(v).filter(function (p) { return U.PARTIES[p] && !Q.dormant[p]; }).sort(function (a, b) { return v[b] - v[a]; }).slice(0, n || 6); };
  var leader = function (Q, p) { return U.Game.leaderOf(Q, p); };
  var REGION_STATES = function (cond) { return Object.keys(U.STATES).filter(cond); };

  var TOPICS = ['health care', 'jobs and wages', 'the deficit', 'education', 'crime', 'immigration', 'trade', 'energy', 'the environment', 'taxes', 'Social Security', 'veterans', 'farm policy', 'national security', 'infrastructure', 'housing', 'civil rights', 'campaign finance'];
  var STATE_BILLS = ['a school funding overhaul', 'a minimum wage increase', 'a highway bond', 'a tax cut for small business', 'tougher sentencing rules', 'a clean-air standard', 'a charter schools expansion', 'a children’s health program', 'a water rights compact', 'a gun safety measure', 'a property tax freeze', 'a state lottery for education', 'a renewable energy mandate', 'a balanced-budget law', 'a prescription drug program', 'a teachers’ pay raise', 'a welfare-to-work program', 'a broadband expansion'];
  var FED_BILLS = [['the Highway Reauthorization Act', 'infrastructure'], ['the Farm Bill', 'agriculture'], ['the Clean Water Amendments', 'the environment'], ['the Small Business Tax Relief Act', 'taxes'], ['the Veterans Health Act', 'veterans'], ['the Student Loan Reform Act', 'education'], ['the Patients’ Bill of Rights', 'health care'], ['the Defense Authorization Act', 'defense'], ['the Campaign Finance Reform Act', 'campaign finance'], ['the Energy Security Act', 'energy'], ['the Juvenile Justice Act', 'crime'], ['the Housing Opportunity Act', 'housing'], ['the Trade Adjustment Assistance Act', 'trade'], ['the Rural Broadband Act', 'technology'], ['the Mental Health Parity Act', 'health care'], ['the Border Security Act', 'immigration'], ['the Child Care Act', 'families'], ['the Pension Protection Act', 'retirement']];
  var REPORTS = [['The Congressional Budget Office', 'projects ' + '{x}' + ' in the deficit over the next decade'], ['The Government Accountability Office', 'finds billions lost to waste in defense contracting'], ['A bipartisan commission', 'warns that Social Security faces a shortfall within a generation'], ['The Census Bureau', 'reports that median household income has {dir}'], ['The Federal Reserve’s Beige Book', 'describes {pace} growth across most districts'], ['The National Academy of Sciences', 'calls for urgent action on climate change'], ['The Surgeon General', 'issues a warning on childhood obesity'], ['The Justice Department’s inspector general', 'criticizes the FBI’s handling of informants'], ['The Bureau of Labor Statistics', 'reports {unemp}% unemployment'], ['A Senate select committee', 'publishes its report on intelligence failures']];
  var COURTS = ['the First Circuit', 'the Second Circuit', 'the Third Circuit', 'the Fourth Circuit', 'the Fifth Circuit', 'the Sixth Circuit', 'the Seventh Circuit', 'the Eighth Circuit', 'the Ninth Circuit', 'the Tenth Circuit', 'the Eleventh Circuit', 'the D.C. Circuit', 'the Federal Circuit'];
  var FIRST = ['Margaret', 'Robert', 'Linda', 'James', 'Patricia', 'Michael', 'Susan', 'David', 'Carol', 'Richard', 'Elena', 'Thomas', 'Diane', 'William', 'Maria', 'Joseph', 'Karen', 'Luis', 'Janet', 'Charles', 'Ann', 'Daniel', 'Grace', 'Kenneth'];
  var LAST = ['Whitfield', 'Okafor', 'Delgado', 'Brennan', 'Castellano', 'Hutchins', 'Nakamura', 'Ferraro', 'Lindqvist', 'Abernathy', 'Thornton', 'Reyes', 'Gallagher', 'Underwood', 'Kowalski', 'Ashford', 'Moreland', 'Pruitt', 'Sandoval', 'Whitaker', 'Hollis', 'Vance', 'Mercer', 'Calloway'];
  var person = function () { return pick(FIRST) + ' ' + pick(LAST); };
  var COUNTRIES = ['the United Kingdom', 'France', 'Germany', 'Japan', 'China', 'Russia', 'India', 'Mexico', 'Canada', 'Brazil', 'South Korea', 'Italy', 'Israel', 'Egypt', 'Saudi Arabia', 'Turkey', 'South Africa', 'Australia', 'Indonesia', 'Nigeria', 'Poland', 'Spain', 'Argentina', 'Vietnam', 'Pakistan', 'Kenya', 'Colombia', 'Ukraine'];
  var TENSIONS = [['the Taiwan Strait', 'Chinese military exercises near Taiwan raise alarm in the region'], ['the Korean peninsula', 'North Korea test-fires missiles over the Sea of Japan'], ['Kashmir', 'Shelling across the Line of Control between India and Pakistan'], ['the Caucasus', 'Clashes flare along disputed borders in the Caucasus'], ['the Persian Gulf', 'Naval incidents in the Strait of Hormuz push up oil prices'], ['the Balkans', 'Ethnic tensions rise again in the Balkans'], ['Central Africa', 'Fighting in the Great Lakes region drives refugees across borders'], ['the South China Sea', 'Rival claims over reefs and islands in the South China Sea'], ['the Horn of Africa', 'Border war fears between Ethiopia and Eritrea'], ['the Andes', 'Guerrilla attacks and the drug war in Colombia'], ['the Sahel', 'Insurgents seize towns across the Sahel'], ['Eastern Europe', 'Moscow and its neighbors trade threats over gas supplies']];
  var FILMS = ['a space epic', 'a superhero sequel', 'an animated family comedy', 'a period drama', 'a disaster blockbuster', 'a courtroom thriller', 'a war film', 'a romantic comedy', 'a fantasy saga', 'an indie drama'];
  var MUSIC = ['a pop star’s comeback album', 'a hip-hop debut', 'a country crossover hit', 'a rock reunion tour', 'a Latin pop single', 'a boy band’s new record', 'a jazz legend’s farewell concert', 'a grunge revival'];
  var HOLIDAYS = { 1: ['Martin Luther King Jr. Day', 'Towns across the country hold marches and service projects.'], 2: ['Presidents’ Day', 'Washington’s birthday is marked with parades and sales.'], 3: ['St. Patrick’s Day', 'Parades turn Chicago’s river green and fill Fifth Avenue.'], 5: ['Memorial Day', 'Flags line the graves at Arlington.'], 7: ['The Fourth of July', 'Fireworks over the National Mall as the country celebrates Independence Day.'], 9: ['Labor Day', 'Unions march as summer ends.'], 10: ['Columbus Day', 'Parades, and protests over the holiday’s name.'], 11: ['Thanksgiving', 'Millions travel home; the President pardons a turkey.'], 12: ['The holiday season', 'Retailers report on Christmas shopping as families gather.'] };
  // sport and world events in the real calendar (the world outside the US is unchanged)
  var SB = { 1997: 'Green Bay Packers', 1998: 'Denver Broncos', 1999: 'Denver Broncos', 2000: 'St. Louis Rams', 2001: 'Baltimore Ravens', 2002: 'New England Patriots', 2003: 'Tampa Bay Buccaneers', 2004: 'New England Patriots', 2005: 'New England Patriots', 2006: 'Pittsburgh Steelers', 2007: 'Indianapolis Colts', 2008: 'New York Giants', 2009: 'Pittsburgh Steelers', 2010: 'New Orleans Saints', 2011: 'Green Bay Packers', 2012: 'New York Giants' };
  var WS = { 1997: 'Florida Marlins', 1998: 'New York Yankees', 1999: 'New York Yankees', 2000: 'New York Yankees', 2001: 'Arizona Diamondbacks', 2002: 'Anaheim Angels', 2003: 'Florida Marlins', 2004: 'Boston Red Sox', 2005: 'Chicago White Sox', 2006: 'St. Louis Cardinals', 2007: 'Boston Red Sox', 2008: 'Philadelphia Phillies', 2009: 'New York Yankees', 2010: 'San Francisco Giants', 2011: 'St. Louis Cardinals', 2012: 'San Francisco Giants' };
  var NBA = { 1997: 'Chicago Bulls', 1998: 'Chicago Bulls', 1999: 'San Antonio Spurs', 2000: 'Los Angeles Lakers', 2001: 'Los Angeles Lakers', 2002: 'Los Angeles Lakers', 2003: 'San Antonio Spurs', 2004: 'Detroit Pistons', 2005: 'San Antonio Spurs', 2006: 'Miami Heat', 2007: 'San Antonio Spurs', 2008: 'Boston Celtics', 2009: 'Los Angeles Lakers', 2010: 'Los Angeles Lakers', 2011: 'Dallas Mavericks', 2012: 'Miami Heat' };
  // [year, month, tier, kind, head, story]
  var WORLD = [
    [1997, 7, 'key', 'foreign', 'Hong Kong returns to China', 'The Union flag is lowered at midnight; Beijing promises "one country, two systems".'],
    [1997, 7, 'key', 'foreign', 'Asian currency crisis begins in Thailand', 'The baht collapses after Bangkok abandons its dollar peg; markets across Asia fall.'],
    [1997, 8, 'breaking', 'foreign', 'Princess Diana killed in Paris car crash', 'The Princess of Wales dies after a crash in a tunnel in Paris. Crowds gather at Kensington Palace.'],
    [1997, 9, 'minor', 'foreign', 'Mother Teresa dies in Calcutta', 'The Nobel laureate was 87.'],
    [1997, 12, 'minor', 'culture', '"Titanic" opens to packed theaters', 'James Cameron’s epic is on its way to becoming the biggest film ever made.'],
    [1998, 4, 'key', 'foreign', 'Good Friday Agreement signed in Belfast', 'Northern Ireland’s parties agree a power-sharing settlement.'],
    [1998, 5, 'key', 'foreign', 'India and Pakistan test nuclear weapons', 'Pokhran, then Chagai: South Asia enters the nuclear age.'],
    [1998, 5, 'minor', 'culture', 'Frank Sinatra dies at 82', 'Ol’ Blue Eyes is mourned from Hoboken to Las Vegas.'],
    [1998, 8, 'key', 'foreign', 'Russia defaults on its debt', 'The ruble collapses; a hedge fund crisis follows on Wall Street.'],
    [1999, 1, 'key', 'foreign', 'The euro is launched', 'Eleven European countries adopt a single currency.'],
    [1999, 3, 'breaking', 'foreign', 'NATO bombs Yugoslavia over Kosovo', 'Air strikes begin on Serbian forces.'],
    [1999, 4, 'breaking', 'disaster', 'Massacre at Columbine High School', 'Two students kill thirteen people in Littleton, Colorado.'],
    [1999, 12, 'key', 'foreign', 'Yeltsin resigns; Putin takes over in Moscow', 'Boris Yeltsin hands power to his prime minister on New Year’s Eve.'],
    [2000, 3, 'key', 'economy', 'Nasdaq peaks above 5,000', 'Technology stocks hit a record. Analysts warn of a bubble.'],
    [2000, 9, 'minor', 'sport', 'Sydney Olympics open', 'Cathy Freeman lights the cauldron.'],
    [2001, 6, 'minor', 'culture', '"Shrek" is the summer’s hit', 'An ogre conquers the box office.'],
    [2002, 1, 'key', 'foreign', 'Euro notes and coins in circulation', 'Twelve countries say goodbye to the franc, the mark and the lira.'],
    [2002, 5, 'key', 'foreign', 'East Timor becomes independent', 'The world’s newest nation is born.'],
    [2003, 2, 'breaking', 'disaster', 'Space Shuttle Columbia breaks up over Texas', 'All seven astronauts are killed on re-entry.'],
    [2003, 3, 'key', 'foreign', 'SARS spreads from southern China', 'The World Health Organization issues a global alert.'],
    [2003, 8, 'key', 'disaster', 'Blackout across the Northeast', 'Fifty million people lose power from Ohio to New York.'],
    [2004, 3, 'breaking', 'foreign', 'Madrid train bombings kill 191', 'Spain mourns; the Socialists win the election three days later.'],
    [2004, 12, 'breaking', 'disaster', 'Indian Ocean tsunami kills over 200,000', 'An undersea earthquake devastates coasts from Indonesia to Somalia.'],
    [2004, 11, 'key', 'foreign', 'Orange Revolution in Ukraine', 'Protesters fill Kyiv over a rigged runoff.'],
    [2005, 4, 'key', 'foreign', 'Pope John Paul II dies', 'Cardinal Ratzinger is elected Pope Benedict XVI.'],
    [2005, 7, 'breaking', 'foreign', 'Bombs on London’s transport network', 'Fifty-two people are killed in attacks on the Tube and a bus.'],
    [2006, 7, 'key', 'foreign', 'War between Israel and Hezbollah', 'Rockets on northern Israel; air strikes on Lebanon.'],
    [2006, 10, 'breaking', 'foreign', 'North Korea tests a nuclear weapon', 'An underground test draws condemnation from the UN.'],
    [2007, 1, 'minor', 'culture', 'Apple unveils the iPhone', 'Steve Jobs shows off a phone with no keyboard.'],
    [2007, 4, 'breaking', 'disaster', 'Shooting at Virginia Tech', 'Thirty-two people are killed in Blacksburg.'],
    [2007, 12, 'key', 'foreign', 'Benazir Bhutto assassinated', 'The former Pakistani prime minister is killed at a rally in Rawalpindi.'],
    [2008, 5, 'breaking', 'disaster', 'Earthquake in Sichuan kills tens of thousands', 'China’s worst earthquake in a generation.'],
    [2008, 8, 'key', 'foreign', 'War in Georgia', 'Russian forces pour into South Ossetia.'],
    [2008, 11, 'breaking', 'foreign', 'Terror attacks in Mumbai', 'Gunmen attack hotels and a railway station; 166 are killed.'],
    [2009, 6, 'minor', 'culture', 'Michael Jackson dies at 50', 'Fans gather outside his Los Angeles home.'],
    [2009, 6, 'key', 'foreign', 'Protests in Iran after disputed election', 'Hundreds of thousands march in Tehran.'],
    [2009, 4, 'key', 'disaster', 'Swine flu outbreak', 'A new H1N1 influenza strain spreads from Mexico.'],
    [2010, 1, 'breaking', 'disaster', 'Earthquake devastates Haiti', 'Port-au-Prince is in ruins; deaths in the hundreds of thousands.'],
    [2010, 5, 'key', 'foreign', 'Greece gets an emergency bailout', 'The eurozone debt crisis begins.'],
    [2010, 12, 'key', 'foreign', 'Unrest in Tunisia', 'Protests spread after a street vendor sets himself on fire.'],
    [2011, 3, 'breaking', 'disaster', 'Earthquake and tsunami in Japan', 'Reactors fail at Fukushima Daiichi.'],
    [2011, 3, 'breaking', 'foreign', 'Civil war in Libya', 'Rebels hold Benghazi as Gaddafi’s forces advance.'],
    [2011, 4, 'minor', 'culture', 'Prince William marries Kate Middleton', 'Two billion people watch the royal wedding.'],
    [2011, 10, 'minor', 'culture', 'Steve Jobs dies', 'Apple’s co-founder was 56.'],
    [2011, 12, 'key', 'foreign', 'Kim Jong-il dies', 'His son Kim Jong-un succeeds him.'],
    [2012, 7, 'minor', 'sport', 'London Olympics open', 'Danny Boyle’s opening ceremony delights the crowd.'],
    [2012, 7, 'breaking', 'disaster', 'Cinema shooting in Aurora, Colorado', 'Twelve people are killed at a midnight screening.'],
    [2012, 10, 'breaking', 'disaster', 'Hurricane Sandy hits the East Coast', 'New York and New Jersey are flooded; millions lose power.'],
    [2012, 11, 'key', 'foreign', 'Xi Jinping takes over in China', 'The Communist Party names a new leadership.']
  ];
  // after the calendar runs out, foreign elections follow their real cycles
  var NFL_T = ['Green Bay Packers', 'Denver Broncos', 'Dallas Cowboys', 'San Francisco 49ers', 'Pittsburgh Steelers', 'New England Patriots', 'New York Giants', 'Kansas City Chiefs', 'Baltimore Ravens', 'Philadelphia Eagles', 'Seattle Seahawks', 'Indianapolis Colts', 'Minnesota Vikings', 'Buffalo Bills'];
  var NBA_T = ['Chicago Bulls', 'Los Angeles Lakers', 'San Antonio Spurs', 'Boston Celtics', 'Miami Heat', 'Detroit Pistons', 'Utah Jazz', 'New York Knicks', 'Golden State Warriors', 'Dallas Mavericks', 'Phoenix Suns', 'Indiana Pacers', 'Sacramento Kings'];
  var MLB_T = ['New York Yankees', 'Boston Red Sox', 'Atlanta Braves', 'St. Louis Cardinals', 'Los Angeles Dodgers', 'San Francisco Giants', 'Cleveland Indians', 'Chicago Cubs', 'Houston Astros', 'Philadelphia Phillies', 'Seattle Mariners', 'New York Mets', 'Oakland Athletics'];
  // in this timeline the real champion is the favorite, not a certainty
  function champ(real, pool) { return real && R() < 0.55 ? real : pick(pool); }

  // Foreign elections. While a country's history still matches ours, the real
  // winner is the favorite (with odds reflecting how close the real race was);
  // once it has diverged, incumbency and time in office decide.
  // real: [year, month, winner, probability the real winner wins]
  var FE = {
    UK: { name: 'Britain', office: 'Prime Minister', parties: { L: 'Labour', C: 'the Conservatives' }, start: 'C', terms: 5, cycle: 5,
      real: [[1997, 5, 'L', 0.9], [2001, 6, 'L', 0.85], [2005, 5, 'L', 0.7], [2010, 5, 'C', 0.65], [2015, 5, 'C', 0.6], [2017, 6, 'C', 0.6], [2019, 12, 'C', 0.65], [2024, 7, 'L', 0.8]],
      lead: { '1997L': 'Tony Blair', '1997C': 'John Major', '2001L': 'Tony Blair', '2001C': 'William Hague', '2005L': 'Tony Blair', '2005C': 'Michael Howard', '2010C': 'David Cameron', '2010L': 'Gordon Brown', '2015C': 'David Cameron', '2015L': 'Ed Miliband', '2017C': 'Theresa May', '2017L': 'Jeremy Corbyn', '2019C': 'Boris Johnson', '2019L': 'Jeremy Corbyn', '2024L': 'Keir Starmer', '2024C': 'Rishi Sunak' } },
    DE: { name: 'Germany', office: 'Chancellor', parties: { L: 'the Social Democrats', C: 'the Christian Democrats' }, start: 'C', terms: 4, cycle: 4,
      real: [[1998, 9, 'L', 0.7], [2002, 9, 'L', 0.55], [2005, 9, 'C', 0.65], [2009, 9, 'C', 0.7], [2013, 9, 'C', 0.75], [2017, 9, 'C', 0.65], [2021, 9, 'L', 0.55], [2025, 2, 'C', 0.65]],
      lead: { '1998L': 'Gerhard Schröder', '1998C': 'Helmut Kohl', '2002L': 'Gerhard Schröder', '2002C': 'Edmund Stoiber', '2005C': 'Angela Merkel', '2005L': 'Gerhard Schröder', '2009C': 'Angela Merkel', '2013C': 'Angela Merkel', '2017C': 'Angela Merkel', '2021L': 'Olaf Scholz', '2021C': 'Armin Laschet', '2025C': 'Friedrich Merz' } },
    CA: { name: 'Canada', office: 'Prime Minister', parties: { L: 'the Liberals', C: 'the Conservatives' }, start: 'L', terms: 1, cycle: 4,
      real: [[1997, 6, 'L', 0.8], [2000, 11, 'L', 0.75], [2004, 6, 'L', 0.6], [2006, 1, 'C', 0.6], [2008, 10, 'C', 0.65], [2011, 5, 'C', 0.65], [2015, 10, 'L', 0.65], [2019, 10, 'L', 0.6], [2021, 9, 'L', 0.6], [2025, 4, 'L', 0.55]],
      lead: { '1997L': 'Jean Chrétien', '2000L': 'Jean Chrétien', '2004L': 'Paul Martin', '2006C': 'Stephen Harper', '2008C': 'Stephen Harper', '2011C': 'Stephen Harper', '2015L': 'Justin Trudeau', '2019L': 'Justin Trudeau', '2021L': 'Justin Trudeau', '2025L': 'Mark Carney' } },
    JP: { name: 'Japan', office: 'Prime Minister', parties: { C: 'the Liberal Democrats', L: 'the Democratic Party' }, start: 'C', terms: 6, cycle: 3,
      real: [[2000, 6, 'C', 0.8], [2003, 11, 'C', 0.8], [2005, 9, 'C', 0.8], [2009, 8, 'L', 0.65], [2012, 12, 'C', 0.75], [2014, 12, 'C', 0.8], [2017, 10, 'C', 0.8], [2021, 10, 'C', 0.8], [2024, 10, 'C', 0.65]],
      lead: { '2005C': 'Junichiro Koizumi', '2009L': 'Yukio Hatoyama', '2012C': 'Shinzo Abe', '2014C': 'Shinzo Abe', '2017C': 'Shinzo Abe' } },
    IN: { name: 'India', office: 'Prime Minister', parties: { L: 'Congress', C: 'the BJP' }, start: 'L', terms: 1, cycle: 5,
      real: [[1998, 3, 'C', 0.6], [1999, 10, 'C', 0.65], [2004, 5, 'L', 0.55], [2009, 5, 'L', 0.6], [2014, 5, 'C', 0.75], [2019, 5, 'C', 0.75], [2024, 6, 'C', 0.65]],
      lead: { '1998C': 'Atal Bihari Vajpayee', '1999C': 'Atal Bihari Vajpayee', '2004L': 'Manmohan Singh', '2009L': 'Manmohan Singh', '2014C': 'Narendra Modi', '2019C': 'Narendra Modi', '2024C': 'Narendra Modi' } },
    MX: { name: 'Mexico', office: 'President', parties: { L: 'the PRI', C: 'the PAN' }, extra: { M: 'Morena' }, start: 'L', terms: 12, cycle: 6,
      real: [[2000, 7, 'C', 0.6], [2006, 7, 'C', 0.5], [2012, 7, 'L', 0.6], [2018, 7, 'M', 0.65], [2024, 6, 'M', 0.75]],
      lead: { '2000C': 'Vicente Fox', '2006C': 'Felipe Calderón', '2012L': 'Enrique Peña Nieto', '2018M': 'Andrés Manuel López Obrador', '2024M': 'Claudia Sheinbaum' } },
    BR: { name: 'Brazil', office: 'President', parties: { C: 'the PSDB', L: 'the Workers’ Party' }, start: 'C', terms: 1, cycle: 4,
      real: [[1998, 10, 'C', 0.75], [2002, 10, 'L', 0.7], [2006, 10, 'L', 0.7], [2010, 10, 'L', 0.7], [2014, 10, 'L', 0.55], [2018, 10, 'C', 0.55], [2022, 10, 'L', 0.5]],
      lead: { '1998C': 'Fernando Henrique Cardoso', '2002L': 'Lula da Silva', '2006L': 'Lula da Silva', '2010L': 'Dilma Rousseff', '2014L': 'Dilma Rousseff', '2018C': 'Jair Bolsonaro', '2022L': 'Lula da Silva' } },
    AU: { name: 'Australia', office: 'Prime Minister', parties: { L: 'Labor', C: 'the Coalition' }, start: 'C', terms: 1, cycle: 3,
      real: [[1998, 10, 'C', 0.6], [2001, 11, 'C', 0.65], [2004, 10, 'C', 0.65], [2007, 11, 'L', 0.7], [2010, 8, 'L', 0.5], [2013, 9, 'C', 0.7], [2016, 7, 'C', 0.55], [2019, 5, 'C', 0.5], [2022, 5, 'L', 0.6], [2025, 5, 'L', 0.65]],
      lead: { '1998C': 'John Howard', '2001C': 'John Howard', '2004C': 'John Howard', '2007L': 'Kevin Rudd', '2010L': 'Julia Gillard', '2013C': 'Tony Abbott' } },
    FR: { name: 'France', office: 'President', parties: { C: 'the Gaullist right', L: 'the Socialists' }, extra: { M: 'the centrists' }, start: 'C', terms: 1, cycle: 5,
      real: [[2002, 5, 'C', 0.75], [2007, 5, 'C', 0.6], [2012, 5, 'L', 0.6], [2017, 5, 'M', 0.55], [2022, 4, 'M', 0.65]],
      lead: { '2002C': 'Jacques Chirac', '2007C': 'Nicolas Sarkozy', '2012L': 'François Hollande', '2017M': 'Emmanuel Macron', '2022M': 'Emmanuel Macron' } }
  };
  var POOL = {
    UK: { L: ['Gordon Brown', 'David Miliband', 'Alan Johnson', 'Ed Balls', 'Yvette Cooper'], C: ['William Hague', 'Michael Portillo', 'Kenneth Clarke', 'David Davis', 'David Cameron', 'Theresa May'] },
    DE: { L: ['Frank-Walter Steinmeier', 'Peer Steinbr\u00fcck', 'Sigmar Gabriel', 'Olaf Scholz'], C: ['Angela Merkel', 'Edmund Stoiber', 'Roland Koch', 'Wolfgang Sch\u00e4uble'] },
    FR: { L: ['Lionel Jospin', 'S\u00e9gol\u00e8ne Royal', 'Dominique Strauss-Kahn', 'Fran\u00e7ois Hollande'], C: ['Nicolas Sarkozy', 'Alain Jupp\u00e9', 'Fran\u00e7ois Fillon', 'Dominique de Villepin'] },
    CA: { L: ['Paul Martin', 'Michael Ignatieff', 'Bob Rae', 'Justin Trudeau'], C: ['Stephen Harper', 'Peter MacKay', 'Jim Prentice'] },
    AU: { L: ['Kim Beazley', 'Kevin Rudd', 'Julia Gillard'], C: ['John Howard', 'Peter Costello', 'Malcolm Turnbull'] }
  };
  var cap = function (t) { t = t.replace(/^the /, ''); return t.charAt(0).toUpperCase() + t.slice(1); };
  function foreignElections(Q, out, prev) {
    var W = Q.world = Q.world || {};
    Object.keys(FE).forEach(function (k) {
      var c = FE[k], st = W[k] = W[k] || { gov: c.start, terms: c.terms, diverged: false, next: null, who: null };
      var r = st.diverged ? null : c.real.filter(function (e) { return e[0] === prev.y && e[1] === prev.m; })[0];
      var lastReal = c.real[c.real.length - 1];
      if (!r && !st.diverged && !st.next && (prev.y > lastReal[0] || (prev.y === lastReal[0] && prev.m > lastReal[1]))) st.next = [lastReal[0] + c.cycle, lastReal[1]];
      if (!r && st.next && st.next[0] === prev.y && st.next[1] === prev.m) r = [prev.y, prev.m, null, 0];
      if (!r) return;
      var name = function (x) { return c.parties[x] || (c.extra || {})[x]; }, win;
      if (r[2]) win = R() < r[3] ? r[2] : pick(Object.keys(c.parties).filter(function (x) { return x !== r[2]; }));   // upsets go to a mainstream rival, never a fringe party
      else { var inc = Math.max(0.25, 0.62 - 0.08 * Math.max(0, st.terms - 1)), main = Object.keys(c.parties).concat(st.gov === 'M' ? ['M'] : []); win = R() < inc ? st.gov : pick(main.filter(function (x) { return x !== st.gov; })); }
      if (r[2] && win !== r[2]) st.diverged = true;
      var held = win === st.gov; st.terms = held ? st.terms + 1 : 1; st.gov = win;
      if (st.diverged) st.next = [prev.y + c.cycle, prev.m];
      var who = !st.diverged && c.lead[prev.y + win] ? c.lead[prev.y + win] : null;
      if (!who && st.diverged && POOL[k] && POOL[k][win]) who = held && st.who && st.terms <= 3 ? st.who : pick(POOL[k][win]);
      var again = held && who && who === st.who; st.who = who;
      var big = R() < 0.3;
      out.push({ tier: 'key', kind: 'foreign',
        head: (k === 'UK' && prev.y === 1997 && win === 'L' ? 'Labour landslide in Britain' : cap(name(win)) + (held ? ' hold on in ' : ' win power in ') + c.name) + (who ? ': ' + who + (again ? ' re-elected' : ' is ' + c.office) : ''),
        story: 'Voters in ' + c.name + ' ' + (held ? 'return ' + name(win) + ' for another term' : 'turn to ' + name(win)) + (big ? ' by a wide margin' : ', in a closer result than the polls suggested') + '.' + (who ? ' ' + who + ' will be ' + c.office + '.' : '') + (k === 'UK' && prev.y === 1997 && win === 'L' ? ' Tony Blair’s sky-high ratings carried Labour to its biggest win ever.' : k === 'UK' && prev.y === 1997 ? ' A stunning upset: John Major’s Conservatives cling on despite Tony Blair’s commanding poll lead.' : '') });
    });
  }
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // how each party picks its presidential candidate
  var METHOD = {
    ldp: ['primary', 'wins the Liberal Democratic primaries, sweeping the big states on Super Tuesday'],
    cc: ['primary', 'clinches the Conservative Coalition nomination after a bruising primary season'],
    sdlp: ['convention', 'is chosen by delegates at the SDLP national convention, with strong union backing'],
    cdp: ['acclamation', 'is nominated by acclamation at the Christian Democrats’ convention'],
    ul: ['ballot', 'wins a ballot of United Left members'],
    grn: ['ballot', 'wins a vote of Green members by mail'],
    reform: ['convention', 'takes the Reform Party nomination after a chaotic convention'],
    lib: ['convention', 'wins the Libertarian nomination on the fourth ballot'],
    maga: ['appointment', 'is named the party’s candidate by its leadership'],
    asp: ['smoke', 'emerges as the candidate after closed-door talks among party elders'],
    con: ['convention', 'is nominated by the Constitution Party convention']
  };
  function nominations(Q, out) {
    var now = U.Game.now(Q), to = Q.nextPres - now; if (!(to >= 1 && to <= 9)) return;
    var cyc = Q.nextPres, done = (Q.newsNoms = Q.newsNoms || {})[cyc] = (Q.newsNoms[cyc] || {});
    var cands = U.Game.defaultCandidates(Q), mine = Q.presCandidate;
    if (mine && mine.party === Q.player) cands.unshift({ party: Q.player, name: mine.name });
    var left = cands.filter(function (c) { return !done[c.party]; });
    // the big parties announce later, after their primaries; smaller ones go first
    left.sort(function (a, b) { return (nat(Q)[a.party] || 0) - (nat(Q)[b.party] || 0); });
    var n = to <= 2 ? left.length : to <= 5 ? 2 : 1;
    left.slice(0, n).forEach(function (c) {
      done[c.party] = c.name;
      var m = METHOD[c.party] || [pick(['appointment', 'smoke', 'convention']), pick(['is personally chosen by the party leader', 'emerges from a smoke-filled room as the party’s choice', 'is nominated at a small convention'])];
      var inc = Q.president.party === c.party && Q.president.name === c.name && !Q.president.termLimited;
      var big = (nat(Q)[c.party] || 0) > 12;
      out.push({ tier: big ? 'key' : 'minor', kind: 'campaign', head: c.name + (inc ? ' launches re-election bid' : ' wins ' + PI(c.party).short + ' presidential nomination'), story: inc ? 'President ' + c.name + ' will run again for the ' + PI(c.party).name + ', unopposed for the nomination.' : c.name + ' ' + m[1] + '.' + (m[0] === 'smoke' ? ' Rank-and-file members were not consulted.' : m[0] === 'appointment' ? ' The leadership’s choice was not put to a vote.' : '') });
    });
  }

  function disasters(Q, out, m) {
    var r = R();
    var gulf = ['TX', 'LA', 'MS', 'AL', 'FL', 'GA', 'SC', 'NC'], plains = ['OK', 'KS', 'NE', 'TX', 'MO', 'AR', 'IA'], west = ['CA', 'OR', 'WA', 'CO', 'AZ', 'MT', 'ID', 'NM'], north = ['NY', 'MA', 'MI', 'MN', 'WI', 'IL', 'PA', 'OH', 'ME'], river = ['MO', 'IA', 'IL', 'MN', 'ND', 'MS', 'LA', 'TN', 'KY'];
    if (m >= 8 && m <= 10 && r < 0.35) { var s = pick(gulf), cat = 1 + Math.floor(R() * 5); out.push({ tier: cat >= 4 ? 'breaking' : 'key', kind: 'disaster', head: (cat >= 4 ? 'Major hurricane' : 'Hurricane') + ' strikes ' + stName(s), story: 'A Category ' + cat + ' storm makes landfall in ' + stName(s) + '. ' + (cat >= 4 ? 'Whole neighborhoods are under water and the Governor asks for federal aid.' : 'Damage is mostly limited to the coast.') }); return; }
    if (m >= 3 && m <= 6 && r < 0.3) { var t = pick(plains); out.push({ tier: r < 0.06 ? 'breaking' : 'minor', kind: 'weather', head: (r < 0.06 ? 'Deadly tornado outbreak in ' : 'Tornadoes touch down in ') + stName(t), story: 'Storms tear across ' + stName(t) + (r < 0.06 ? '; dozens are killed and FEMA teams are on the way.' : '. No deaths are reported.') }); return; }
    if (m >= 6 && m <= 9 && r < 0.3) { var w = pick(west); out.push({ tier: r < 0.05 ? 'key' : 'minor', kind: 'weather', head: 'Wildfires burn across ' + stName(w), story: 'Thousands of acres burn and residents are evacuated in ' + stName(w) + '.' }); return; }
    if ((m === 12 || m <= 2) && r < 0.3) { var b = pick(north); out.push({ tier: 'minor', kind: 'weather', head: 'Blizzard buries ' + stName(b), story: 'Schools and airports close as snow piles up in ' + stName(b) + '.' }); return; }
    if ((m === 4 || m === 5) && r < 0.12) { var f = pick(river); out.push({ tier: 'key', kind: 'disaster', head: 'Floods along the Mississippi in ' + stName(f), story: 'The river crests at record levels; the National Guard fills sandbags.' }); return; }
    if (r > 0.985) out.push({ tier: 'breaking', kind: 'disaster', head: 'Earthquake rocks ' + pick(['California', 'the Pacific Northwest', 'Alaska']), story: 'A powerful earthquake brings down buildings and highways. Rescue teams search the rubble.' });
  }

  N.generate = function (Q, prev) {
    var y = Q.year, m = Q.month, out = [];
    R = mk((Q.seed0 || 1) * 7919 + y * 13 + m * 104729);
    var parties = bigParties(Q, 7), g = Q.gov;
    // ---- real calendar ----
    WORLD.forEach(function (w) { if (w[0] === prev.y && w[1] === prev.m) out.push({ tier: w[2], kind: w[3], head: w[4], story: w[5] }); });
    if (prev.m === 2) { var sb = champ(SB[prev.y], NFL_T); out.push({ tier: 'minor', kind: 'sport', head: 'Super Bowl: ' + sb + ' are champions', story: 'The ' + sb + ' win the Super Bowl in front of a record television audience.' }); }
    if (prev.m === 6) { var nb = champ(NBA[prev.y], NBA_T); out.push({ tier: 'minor', kind: 'sport', head: 'NBA title for the ' + nb, story: 'The ' + nb + ' win the NBA Finals.' }); }
    if (prev.m === 10) { var ws = champ(WS[prev.y], MLB_T); out.push({ tier: 'minor', kind: 'sport', head: ws + ' win the World Series', story: 'The ' + ws + ' take baseball’s championship.' }); }
    if (prev.m === 8 && prev.y % 4 === 0) { var gold = 30 + Math.floor(R() * 16), top = R() < 0.7; out.push({ tier: 'minor', kind: 'sport', head: 'Team USA ' + (top ? 'tops' : 'finishes second in') + ' the Olympic medal table', story: 'American athletes bring home ' + gold + ' gold medals' + (prev.y === 2008 ? ', ' + (5 + Math.floor(R() * 4)) + ' of them won by swimmer Michael Phelps' : '') + (top ? '.' : '; ' + pick(['China', 'Russia']) + ' takes first place.') }); }
    if (prev.m === 9 && prev.y === 1998) out.push(R() < 0.6 ? { tier: 'minor', kind: 'sport', head: 'McGwire passes Maris: ' + (62 + Math.floor(R() * 9)) + ' home runs', story: 'Mark McGwire breaks the single-season record; Sammy Sosa is close behind.' } : { tier: 'minor', kind: 'sport', head: 'Sosa breaks the home run record', story: 'Sammy Sosa passes Roger Maris’s 61 as Mark McGwire falls just short.' });
    foreignElections(Q, out, prev);
    if (HOLIDAYS[prev.m] && chance(0.55)) out.push({ tier: 'minor', kind: 'culture', head: HOLIDAYS[prev.m][0], story: HOLIDAYS[prev.m][1] });
    // ---- the presidential race ----
    nominations(Q, out);
    // ---- campaign events and speeches ----
    var p1 = pick(parties), st1 = pick(Object.keys(U.STATES)), soon = Q.electionAt && Q.electionAt - U.Game.now(Q) <= 4;
    if (chance(soon ? 0.95 : 0.55)) out.push({ tier: soon ? 'key' : 'minor', kind: 'campaign', head: leader(Q, p1) + ' rallies ' + PI(p1).short + ' supporters in ' + stName(st1), story: 'Speaking to a crowd in ' + stName(st1) + ', ' + leader(Q, p1) + ' focuses on ' + pick(TOPICS) + ' and attacks the ' + (g && g.pmParty !== p1 ? PI(g.pmParty).short + '-led government' : 'opposition') + '.' });
    if (chance(0.5)) { var who = pick(['pm', 'pres', 'lead']), spk, role; if (who === 'pm' && g) { spk = g.pm; role = 'Prime Minister'; } else if (who === 'pres') { spk = Q.president.name; role = 'President'; } else { var p2 = pick(parties); spk = leader(Q, p2); role = PI(p2).short + ' leader'; }
      var tp = pick(TOPICS); out.push({ tier: 'key', kind: 'speech', head: role + ' ' + spk.split(' ').pop() + ' sets out plan on ' + tp, story: role + ' ' + spk + ' gives a major speech on ' + tp + ' at ' + pick(['a university in Ohio', 'the National Press Club', 'a union hall in Pittsburgh', 'a town hall in Iowa', 'the Chamber of Commerce', 'a church in Atlanta', 'a factory in Michigan']) + '.' }); }
    // ---- the states ----
    var govs = Object.keys(Q.states || {}).filter(function (s) { return Q.states[s].governor; });
    if (govs.length && chance(0.7)) { var gs = pick(govs), gp = Q.states[gs].governor, bill = pick(STATE_BILLS);
      out.push({ tier: chance(0.2) ? 'key' : 'minor', kind: 'states', head: stName(gs) + ' governor signs ' + bill, story: 'The ' + PI(gp).short + ' Governor of ' + stName(gs) + ' signs ' + bill + ' into law. Other states are watching.' }); }
    // ---- Congress: bills, repeals, expansions ----
    if (g && chance(0.6)) { var fb = pick(FED_BILLS), act = pick(['passes', 'passes', 'fails', 'repeal', 'expand']), gov = U.Game.govSeats ? U.Game.govSeats(Q) : 300, yes = Math.round(U.clamp(gov + (R() - 0.4) * 80, 150, 520)), no = 600 - yes - Math.floor(R() * 20);
      if (act === 'repeal') out.push({ tier: 'key', kind: 'congress', head: 'House votes to repeal parts of ' + fb[0], story: 'By ' + yes + ' to ' + no + ', the House strikes provisions on ' + fb[1] + ' that the ' + PI(g.pmParty).short + ' had called a failure.' });
      else if (act === 'expand') out.push({ tier: 'key', kind: 'congress', head: fb[0] + ' expanded', story: 'Congress extends the program on ' + fb[1] + ', ' + yes + ' votes to ' + no + '. The cost is put at $' + (5 + Math.floor(R() * 60)) + ' billion over ten years.' });
      else { var pass = act === 'passes' && yes > no; out.push({ tier: 'key', kind: 'congress', head: fb[0] + (pass ? ' clears the House' : ' defeated in the House'), story: 'The bill on ' + fb[1] + ' ' + (pass ? 'passes' : 'fails') + ', ' + (pass ? yes + ' to ' + no : Math.min(yes, no) + ' to ' + Math.max(yes, no)) + '. ' + (pass ? 'It now goes to the Senate.' : 'The government says it will try again.') }); } }
    // ---- reports ----
    if (chance(0.4)) { var rp = pick(REPORTS), txt = rp[1].replace('{x}', (Q.econ.deficit > 0 ? 'a rise' : 'a fall')).replace('{dir}', Q.econ.growth > 2 ? 'risen' : 'fallen').replace('{pace}', Q.econ.growth > 3 ? 'solid' : Q.econ.growth > 0 ? 'modest' : 'weak').replace('{unemp}', Q.econ.unemp.toFixed(1));
      out.push({ tier: 'key', kind: 'report', head: rp[0] + ' ' + txt.split(' ').slice(0, 7).join(' ') + (txt.split(' ').length > 7 ? '…' : ''), story: rp[0] + ' ' + txt + '.' }); }
    // ---- judges ----
    Q.newsJudges = Q.newsJudges || [];
    var due = Q.newsJudges.filter(function (j) { return j.due <= U.Game.now(Q) && !j.done; })[0];
    if (due) { due.done = true; var ok = R() < 0.8; out.push({ tier: 'key', kind: 'courts', head: 'Senate ' + (ok ? 'confirms ' : 'rejects ') + due.name + ' to ' + due.court, story: 'The Senate votes ' + (ok ? 140 + Math.floor(R() * 80) + ' to ' + (20 + Math.floor(R() * 80)) + ' to confirm' : 'down the nomination of') + ' ' + due.name + (ok ? ' as a judge on ' + due.court + '.' : ', a setback for President ' + Q.president.name + '.') }); }
    else if (chance(0.25)) { var jn = { name: person(), court: pick(COURTS), due: U.Game.now(Q) + 2 + Math.floor(R() * 3) }; Q.newsJudges.push(jn); if (Q.newsJudges.length > 40) Q.newsJudges.shift();
      out.push({ tier: 'minor', kind: 'courts', head: 'President ' + Q.president.name.split(' ').pop() + ' nominates ' + jn.name + ' to ' + jn.court, story: jn.name + ', a ' + pick(['former prosecutor', 'state supreme court justice', 'law professor', 'district judge', 'appellate lawyer']) + ', faces Senate hearings in the coming months.' }); }
    // ---- disasters and weather ----
    disasters(Q, out, prev.m);
    // ---- diplomacy ----
    if (chance(0.5)) { var c = pick(COUNTRIES), d = R();
      out.push(d < 0.5 ? { tier: 'key', kind: 'diplomacy', head: 'President ' + Q.president.name.split(' ').pop() + ' visits ' + c, story: 'Talks in ' + c + ' focus on ' + pick(['trade', 'security', 'climate', 'nuclear proliferation', 'migration', 'energy']) + '.' }
        : { tier: 'minor', kind: 'diplomacy', head: 'Leader of ' + c + ' at the White House', story: 'A state dinner and talks on ' + pick(['trade', 'security', 'aid', 'investment']) + (g ? '; Prime Minister ' + g.pm + ' also meets the delegation.' : '.') }); }
    // ---- foreign tensions ----
    if (chance(0.45)) { var t = pick(TENSIONS); out.push({ tier: 'key', kind: 'foreign', head: 'Tensions in ' + t[0], story: t[1] + '.' }); }
    // ---- culture ----
    if (chance(0.7)) out.push({ tier: 'minor', kind: 'culture', head: pick(['Box office: ', 'At the movies: ']) + pick(FILMS) + ' tops the charts', story: 'Audiences flock to ' + pick(FILMS) + ' as the weekend’s biggest release.' });
    if (chance(0.4)) out.push({ tier: 'minor', kind: 'culture', head: 'Music: ' + pick(MUSIC), story: 'Critics are divided; fans are not.' });
    if (prev.m === 3 && chance(0.8)) out.push({ tier: 'minor', kind: 'culture', head: 'Oscars night in Hollywood', story: 'Stars on the red carpet; a surprise for Best Picture.' });
    if (prev.m === 3 && chance(0.6)) out.push({ tier: 'minor', kind: 'sport', head: 'March Madness: college basketball’s Final Four set', story: 'Brackets across the country are busted.' });
    return out;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
