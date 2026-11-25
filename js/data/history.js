// The reconstructed history of the American Republic, 1912-1996, written
// against its constitution: before 1974 the President could dismiss the Prime
// Minister and dissolve Congress at will, and a bare House majority could
// topple a government; the 1974 reform brought presidential nomination rounds,
// constructive no-confidence votes and the four-year dissolution lock.
// Loaded after lore.js and general_history.js; replaces their narrative parts.
(function (G) {
  'use strict';
  var U = G.USA, L = U.LORE;

  L.constitution = [
    ['1789–1912', 'The same republic as ours: a President elected every four years, a House elected by districts, and two dominant parties, the Democrats and the Republicans.'],
    ['1912', 'Theodore Roosevelt’s breakaway Progressives beat the Republicans for second place. Woodrow Wilson wins the presidency with 42%, and no party controls the House. A year of deadlock follows: three appropriations bills fail and the Army goes unpaid for six weeks.'],
    ['1913–1914', 'The Reconstruction Amendments. A Prime Minister runs the government, appointed by the President and answerable to the House. The House is elected by statewide PR. The President serves six years, elected in two rounds: a national popular vote, then an Electoral College runoff between the top two. Each state elects three senators at every general election (two for the largest party, one for the runner-up) and its state house chooses a fourth. Under this first constitution the President may dismiss the Prime Minister and dissolve Congress at any time, and a majority of the House can bring a government down. Wilson resigns to seek a fresh mandate under the new rules, and loses the runoff to Theodore Roosevelt.'],
    ['1938', 'President Long dismisses Prime Minister Al Smith, his own party’s leader, and dissolves Congress: the first open clash between the two halves of the executive.'],
    ['1963', 'President Nixon dismisses Prime Minister John F. Kennedy after his civil-rights bill fails. Kennedy wins the snap election and Nixon has to reappoint him: the dismissal power never recovers its authority.'],
    ['1973', 'The budget crisis. Humphrey’s government is voted down by an opposition that cannot agree on a successor. Humphrey stays on as caretaker and the country goes five months without a budget.'],
    ['1974', 'The 1974 reform. The House is fixed at 600 seats: 500 state list seats with no threshold and 100 national list seats for parties with at least 5% nationally. Votes of no confidence become constructive: the motion must name a new Prime Minister, who needs an absolute majority. The President loses the power to dismiss a Prime Minister and may not dissolve Congress within four years of a government forming, unless the Prime Minister asks and both chambers agree, or a new President takes office. The President now nominates the Prime Minister: the first nominee needs an absolute majority, the second a simple one; if both fail, the House has three months to agree a government while a Senate-appointed caretaker governs.'],
    ['Today', 'The separation of powers. The PM picks most of the cabinet; the President appoints the Secretaries of State, Defense and the Treasury, who are confirmed with the cabinet in the House investiture vote, and, with the Senate’s advice and consent, judges, the CIA director, the Joint Chiefs and the chair of the Federal Reserve. The President signs executive orders and may veto bills, which two-thirds of the House plus a Senate majority can override. The Senate can kill a House bill with two-thirds or delay it up to two years with a simple majority, but cannot touch budgets; it removes a President by a two-thirds vote. Voters split their tickets freely: senators run on their own names, and many Americans vote only for President.'],
    ['1990s', 'Regional parties are on the rise and the far left is fragmented. The presidency remains the one office every voter fills on the same day.']
  ];

  L.presidents = [
    ['1914', 'Theodore Roosevelt', 'Progressive', 'Beat Woodrow Wilson in the first runoff under the new constitution. Died in office in January 1919; Vice President Hiram Johnson served out the term and fought Prime Minister Harding over the League of Nations.'],
    ['1920', 'Charles Evans Hughes', 'Republican', 'Won on a promise of calm after the war. Had to accept a Progressive Prime Minister, Robert La Follette, after the 1922 farm revolt.'],
    ['1926', 'Frank Lowden', 'Republican', 'The Illinois governor and farm-relief champion. The Wall Street crash came three years into his term.'],
    ['1932', 'Huey Long', 'Democratic', 'Swept to power on Share Our Wealth in the depths of the Depression, and spent six years at war with his own party’s Prime Minister, Al Smith, whom he finally dismissed in 1938.'],
    ['1938', 'Huey Long', 'Democratic', 'Re-elected, having survived a 1935 shooting in the Louisiana capitol. Appointed the Progressive Henry Wallace as Prime Minister and led the country into the Second World War.'],
    ['1944', 'John Nance Garner', 'Democratic', 'Cactus Jack, the Texan conservative, won a wartime cliffhanger. He kept Barkley’s government and rarely used his powers.'],
    ['1950', 'Thomas E. Dewey', 'Republican', 'The New York governor won at the start of the Korean War and appointed Robert Taft.'],
    ['1956', 'Thomas E. Dewey', 'Republican', 'Re-elected, but governed alongside Democratic–SDLP Prime Ministers for his whole second term.'],
    ['1962', 'Richard Nixon', 'Republican', 'Inherited John F. Kennedy as Prime Minister, dismissed him in 1963 and had to take him back after the snap election. When Kennedy, wounded in an assassination attempt in Dallas, retired through illness in 1964, Nixon appointed Lyndon Johnson, expecting a moderate, and got the Civil Rights Act.'],
    ['1968', 'Robert F. Kennedy', 'Social Democratic Labor', 'Lost the LDP nomination to Lyndon Johnson, joined the SDLP and beat George Wallace (SRP) in the runoff. The SDLP’s first President; he ended the Vietnam war.'],
    ['1974', 'Robert F. Kennedy', 'Social Democratic Labor', 'Re-elected over Gerald Ford (Republican). Signed the 1974 reform and was the first President to nominate a Prime Minister under it.'],
    ['1980', 'Ronald Reagan', 'Conservative Coalition', 'Beat Ted Kennedy (SDLP) in a close runoff, 361 electors to 340. Many CC voters for Reagan backed independents or the CDP for the House.'],
    ['1986', 'Ronald Reagan', 'Conservative Coalition', 'Re-elected over Jesse Jackson (SDLP). In 1990 his first nominee for Prime Minister, Jack Kemp, failed the absolute-majority vote, and Reagan turned to the Texan Lloyd Bentsen (LDP).'],
    ['1992', 'Bill Clinton', 'Liberal Democratic', 'Beat George H. W. Bush (CC) in the runoff; Ross Perot took 18.6% of the first round, mostly from voters who did not vote in the House election.'],
    ['1998', '—', '', 'The next election, due in November 1998.']
  ];

  L.governments = [
    ['1915–1919', 'Champ Clark', 'Democratic', 'Democratic–Progressive coalition, appointed by President Roosevelt'],
    ['1919–1923', 'Warren G. Harding', 'Republican', 'Republicans with conservative Democrats; in open conflict with President Hiram Johnson over the League of Nations'],
    ['1923–1927', 'Robert La Follette, then George Norris', 'Progressive', 'Progressive–Democratic–Farmer-Labor coalition; La Follette retired ill in 1925'],
    ['1927–1932', 'Nicholas Longworth', 'Republican', 'Republican–Progressive farm pact, then a minority after the crash'],
    ['1932–1938', 'Al Smith', 'Democratic', 'Democratic–Progressive coalition; wrote the New Deal; dismissed by President Long in March 1938'],
    ['1938', 'Hattie Caraway', 'Democratic', 'Caretaker appointed by Long until the November election; the first woman to lead a government'],
    ['1939–1944', 'Henry A. Wallace', 'Progressive', 'Progressive–Democratic–Farmer-Labor coalition; took the country into the Second World War'],
    ['1945–1950', 'Alben W. Barkley', 'Democratic', 'Democratic–Progressive coalition; victory, demobilisation and the start of the Cold War'],
    ['1950–1953', 'Robert A. Taft', 'Republican', 'Republican–CDP coalition; Taft died in office'],
    ['1953–1958', 'Estes Kefauver', 'Democratic', 'Democratic–SDLP coalition'],
    ['1958–1960', 'Lyndon B. Johnson', 'Democratic', 'Democratic–SDLP coalition'],
    ['1960–1963', 'John F. Kennedy', 'Democratic', 'Democratic–SDLP–CDP coalition; dismissed by President Nixon after his civil-rights bill failed'],
    ['1963', 'Everett Dirksen', 'Republican', 'Caretaker appointed by Nixon for the snap election'],
    ['1963–1964', 'John F. Kennedy', 'Democratic', 'Democratic–SDLP majority after the snap election; wounded in Dallas in November 1963, retired through illness in April 1964'],
    ['1964–1966', 'Lyndon B. Johnson', 'Democratic', 'Appointed by Nixon; forced through the Civil Rights Act and the Voting Rights Act, splitting the Democratic Party'],
    ['1966–1968', 'Lyndon B. Johnson', 'Liberal Democratic', 'LDP–SDLP coalition; Johnson stood down to run for President and lost'],
    ['1968–1974', 'Hubert Humphrey', 'Liberal Democratic', 'LDP–SDLP coalition under President Robert Kennedy; voted down in the 1973 budget crisis, caretaker until 1974'],
    ['1974–1978', 'Edmund Muskie', 'Liberal Democratic', 'LDP–SDLP–CDP grand coalition, the first government formed under the 1974 rules'],
    ['1978–1982', 'Walter Mondale', 'Liberal Democratic', 'LDP–SDLP coalition'],
    ['1982–1986', 'Bob Dole', 'Conservative Coalition', 'CC–CDP coalition under President Reagan'],
    ['1986–1990', 'Jack Kemp', 'Conservative Coalition', 'CC–CDP–Libertarian coalition'],
    ['1990–1992', 'Lloyd Bentsen', 'Liberal Democratic', 'LDP–CDP minority with SDLP confidence and supply; Reagan’s second nominee, confirmed by simple majority'],
    ['1992–1994', 'Tom Foley', 'Liberal Democratic', 'LDP–SDLP coalition with ASP confidence and supply, nominated by President Clinton'],
    ['1994–1996', 'Newt Gingrich', 'Conservative Coalition', 'CC–CDP coalition with Libertarian and Lone Star support; the CDP walked out over the 1995–96 shutdown'],
    ['1996–', 'Al Gore', 'Liberal Democratic', 'LDP–SDLP coalition with Reform confidence and supply']
  ];

  // party histories that mention Kennedy’s fate
  if (L.parties && L.parties.ldp) L.parties.ldp[1] = L.parties.ldp[1].replace(/after John F\. Kennedy’s assassination/, 'after John F. Kennedy, wounded in Dallas, retired through illness');
  (L.presElections || []).forEach(function (e) {
    if (e.year === 1962) e.note = 'Nixon won, and inherited John F. Kennedy as his Prime Minister. Many Democratic voters backed Nixon in the runoff over Humphrey while voting Democratic for the House.';
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
