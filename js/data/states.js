// States. Population: 2000 census (millions, rounded). Demographic indices
// (urban, religiosity, union, Black, Hispanic, retirees) are SCENARIO
// ASSUMPTIONS on a 0-1 scale used only to build each state's voter mix.
// x,y = tile-map position. uni = unicameral legislature (brief §4.4.5).
(function (G) {
  'use strict';
  var rows = [
  // abbr name           pop    reg  urb  rel  uni  blk  hsp  old  x  y
  ['AL','Alabama',        4.45,'SO',.55,.85,.09,.26,.02,.13, 6,6],
  ['AK','Alaska',         0.63,'PC',.66,.45,.22,.04,.04,.06, 0,0],
  ['AZ','Arizona',        5.13,'MT',.88,.55,.06,.03,.25,.13, 1,5],
  ['AR','Arkansas',       2.67,'SO',.52,.85,.06,.16,.03,.14, 4,5],
  ['CA','California',    33.87,'PC',.94,.45,.16,.07,.32,.11, 0,4],
  ['CO','Colorado',       4.30,'MT',.84,.50,.08,.04,.17,.10, 2,4],
  ['CT','Connecticut',    3.41,'NE',.88,.45,.18,.09,.09,.14, 9,3],
  ['DE','Delaware',       0.78,'MA',.80,.55,.12,.19,.05,.13, 9,4],
  ['FL','Florida',       15.98,'SO',.89,.60,.07,.15,.17,.18, 8,7],
  ['GA','Georgia',        8.19,'SO',.72,.80,.06,.29,.05,.10, 7,6],
  ['HI','Hawaii',         1.21,'PC',.92,.45,.25,.02,.07,.13, 0,7],
  ['ID','Idaho',          1.29,'MT',.66,.70,.07,.01,.08,.11, 1,2],
  ['IL','Illinois',      12.42,'MW',.88,.55,.19,.15,.12,.12, 5,2],
  ['IN','Indiana',        6.08,'MW',.71,.70,.15,.08,.04,.12, 5,3],
  ['IA','Iowa',           2.93,'PL',.61,.65,.13,.02,.03,.15, 4,3],
  ['KS','Kansas',         2.69,'PL',.71,.70,.09,.06,.07,.13, 3,5],
  ['KY','Kentucky',       4.04,'SO',.56,.80,.11,.07,.01,.13, 5,4],
  ['LA','Louisiana',      4.47,'SO',.73,.80,.08,.32,.02,.12, 4,6],
  ['ME','Maine',          1.27,'NE',.40,.40,.14,.01,.01,.14,10,0],
  ['MD','Maryland',       5.30,'MA',.86,.55,.15,.28,.04,.11, 8,4],
  ['MA','Massachusetts',  6.35,'NE',.91,.40,.16,.05,.07,.14,10,2],
  ['MI','Michigan',       9.94,'MW',.75,.60,.25,.14,.03,.12, 7,2],
  ['MN','Minnesota',      4.92,'MW',.71,.55,.18,.04,.03,.12, 4,2],
  ['MS','Mississippi',    2.84,'SO',.49,.90,.06,.36,.01,.12, 5,6],
  ['MO','Missouri',       5.60,'PL',.69,.70,.13,.11,.02,.14, 4,4],
  ['MT','Montana',        0.90,'MT',.54,.55,.14,.00,.02,.13, 2,2],
  ['NE','Nebraska',       1.71,'PL',.70,.65,.08,.04,.06,.14, 3,4, true],
  ['NV','Nevada',         2.00,'MT',.92,.45,.18,.07,.20,.11, 1,3],
  ['NH','New Hampshire',  1.24,'NE',.59,.40,.10,.01,.02,.12,10,1],
  ['NJ','New Jersey',     8.41,'MA',.94,.50,.20,.14,.13,.13, 8,3],
  ['NM','New Mexico',     1.82,'MT',.75,.60,.07,.02,.42,.12, 2,5],
  ['NY','New York',      18.98,'MA',.88,.45,.26,.16,.15,.13, 8,2],
  ['NC','North Carolina', 8.05,'SO',.60,.80,.04,.22,.05,.12, 6,5],
  ['ND','North Dakota',   0.64,'PL',.56,.70,.08,.01,.01,.15, 3,2],
  ['OH','Ohio',          11.35,'MW',.77,.65,.19,.12,.02,.13, 6,3],
  ['OK','Oklahoma',       3.45,'SO',.65,.85,.08,.08,.05,.13, 3,6],
  ['OR','Oregon',         3.42,'PC',.79,.40,.17,.02,.08,.13, 0,3],
  ['PA','Pennsylvania',  12.28,'MA',.77,.60,.17,.10,.03,.16, 7,3],
  ['RI','Rhode Island',   1.05,'NE',.91,.45,.18,.05,.09,.15, 9,2],
  ['SC','South Carolina', 4.01,'SO',.60,.85,.04,.30,.02,.12, 7,5],
  ['SD','South Dakota',   0.75,'PL',.52,.70,.06,.01,.01,.14, 3,3],
  ['TN','Tennessee',      5.69,'SO',.64,.85,.09,.16,.02,.12, 5,5],
  ['TX','Texas',         20.85,'TX',.83,.75,.06,.12,.32,.10, 3,7],
  ['UT','Utah',           2.23,'MT',.88,.85,.07,.01,.09,.09, 1,4],
  ['VT','Vermont',        0.61,'NE',.38,.35,.11,.01,.01,.13, 9,1],
  ['VA','Virginia',       7.08,'SO',.73,.70,.06,.20,.05,.11, 7,4],
  ['WA','Washington',     5.89,'PC',.82,.40,.20,.03,.08,.11, 0,2],
  ['WV','West Virginia',  1.81,'SO',.46,.75,.14,.03,.01,.15, 6,4],
  ['WI','Wisconsin',      5.36,'MW',.68,.60,.17,.06,.04,.13, 6,2],
  ['WY','Wyoming',        0.49,'MT',.65,.60,.09,.01,.06,.12, 2,3]
  ];
  var S = {};
  rows.forEach(function (r) {
    S[r[0]] = { id: r[0], name: r[1], pop: r[2], region: r[3], urban: r[4], relig: r[5],
      union: r[6], black: r[7], hisp: r[8], old: r[9], x: r[10], y: r[11], unicameral: !!r[12] };
  });
  G.USA.STATES = S;
  G.USA.DC = { id: 'DC', name: 'District of Columbia', pop: 0.57, region: 'MA', urban: 1, relig: .5,
    union: .15, black: .60, hisp: .08, old: .12, x: 8, y: 5 };
  G.USA.REGIONS = { NE: 'New England', MA: 'Mid-Atlantic', SO: 'South', MW: 'Midwest',
    PL: 'Plains', MT: 'Mountain West', PC: 'Pacific', TX: 'Texas' };
})(typeof globalThis !== 'undefined' ? globalThis : window);
