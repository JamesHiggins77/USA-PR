// Demographic polling categories. The game's vote model has nine base voter
// groups; every segment below is a blend of those groups (mix), with optional
// party multipliers (tilt) for effects the base groups miss, such as the gender
// gap or Latter-day Saint support for the ASP. Sizes are % of the electorate.
// A segment with mix 'rest' is the electorate minus the other segments in its category.
(function (G) {
  'use strict';
  var U = G.USA;
  U.DEMO_CATEGORIES = [
    { id: 'gender', name: 'Gender', segs: [
      ['Men', [47, 47], 'rest', { cc: 1.12, lib: 1.4, con: 1.2, reform: 1.2, ldp: 0.9, grn: 0.9 }, { from: 2000, cc: 0.006, maga: 0.012, lib: 0.004, ldp: -0.004 }],
      ['Women', [52, 51.5], 'rest', { ldp: 1.1, sdlp: 1.05, cc: 0.9, lib: 0.6, con: 0.8 }, { from: 2000, ldp: 0.005, sdlp: 0.002, cc: -0.004 }],
      ['Other / non-binary', [1, 1.5], { young: 0.7, prof: 0.3 }, { grn: 2, dsa: 2, ldp: 1.2, cc: 0.3, con: 0.1 }]] },
    { id: 'race', name: 'Race and ethnicity', segs: [
      ['White', [80, 69.7], 'rest', {}],
      ['Black', [11, 12], { black: 1 }, {}],
      ['Hispanic', [6, 12.5], { hisp: 1 }, {}, { from: 2012, cc: 0.012, maga: 0.015, ldp: -0.008 }],
      ['Asian American', [2.3, 5], { prof: 0.6, suburb: 0.3, young: 0.1 }, { ldp: 1.25, cc: 0.85, con: 0.3 }],
      ['Native American', [0.7, 0.8], { rural: 0.5, young: 0.2, union: 0.3 }, { grn: 1.8, ldp: 1.6, sdlp: 1.3, cc: 0.55, con: 0.5 }]] },
    { id: 'age', name: 'Age', segs: [
      ['18–24', [10, 8.5], { young: 0.8, hisp: 0.1, black: 0.1 }, {}, { from: 2004, ldp: 0.006, grn: 0.012, dsa: 0.015, cc: -0.008 }],
      ['25–29', [7, 7.5], { young: 0.4, prof: 0.2, hisp: 0.15, black: 0.1, suburb: 0.15 }, {}],
      ['30–44', [31, 24], { prof: 0.25, suburb: 0.25, union: 0.15, black: 0.12, hisp: 0.12, rural: 0.11 }, {}],
      ['45–64', [33, 33], { suburb: 0.25, union: 0.15, rural: 0.15, relig: 0.15, prof: 0.1, black: 0.1, hisp: 0.1 }, {}],
      ['65+', [19, 27], { retire: 0.8, relig: 0.1, rural: 0.1 }, {}]] },
    { id: 'union', name: 'Union household', segs: [
      ['Union household', [23, 16], { union: 1 }, {}, { from: 2008, cc: 0.008, sdlp: -0.006 }],
      ['Non-union household', [77, 84], 'rest', {}]] },
    { id: 'military', name: 'Military household', segs: [
      ['Military or veteran household', [14, 11], { rural: 0.35, suburb: 0.3, relig: 0.2, union: 0.15 }, { cc: 1.2, con: 1.3, cdp: 1.05, grn: 0.5, dsa: 0.5 }],
      ['No military link', [86, 89], 'rest', {}]] },
    { id: 'education', name: 'Education', segs: [
      ['No high-school diploma', [9, 5], { rural: 0.3, hisp: 0.3, black: 0.2, retire: 0.2 }, {}, { from: 2004, cc: 0.008, maga: 0.015, ldp: -0.006 }],
      ['High-school graduate', [32, 24], { union: 0.35, rural: 0.3, relig: 0.2, retire: 0.15 }, {}, { from: 2004, cc: 0.012, maga: 0.02, ldp: -0.01, sdlp: -0.006 }],
      ['Some college', [28, 28], { suburb: 0.35, young: 0.3, black: 0.15, hisp: 0.2 }, {}],
      ['College graduate', [21, 27], { prof: 0.5, suburb: 0.4, young: 0.1 }, {}, { from: 2000, ldp: 0.01, cc: -0.01, cdp: 0.002 }],
      ['Postgraduate', [10, 16], { prof: 0.8, young: 0.2 }, { ldp: 1.15, grn: 1.2, cc: 0.85 }, { from: 2000, ldp: 0.014, grn: 0.006, cc: -0.014 }]] },
    { id: 'income', name: 'Household income', segs: [
      ['Under $30,000', [28, 17], { black: 0.25, hisp: 0.25, young: 0.25, rural: 0.15, retire: 0.1 }, {}],
      ['$30,000–50,000', [24, 15], { union: 0.35, rural: 0.25, hisp: 0.15, retire: 0.25 }, {}],
      ['$50,000–100,000', [33, 33], { suburb: 0.45, union: 0.2, prof: 0.2, relig: 0.15 }, {}],
      ['Over $100,000', [15, 35], { prof: 0.55, suburb: 0.45 }, { cc: 1.1, lib: 1.3, sdlp: 0.8 }]] },
    { id: 'occupation', name: 'Occupation', segs: [
      ['Professional and managerial', [21, 25], { prof: 0.7, suburb: 0.3 }, {}],
      ['Blue-collar and manufacturing', [17, 12], { union: 0.7, rural: 0.3 }, {}, { from: 2004, cc: 0.012, maga: 0.02, sdlp: -0.008, ldp: -0.008 }],
      ['Service and retail', [15, 17], { hisp: 0.3, black: 0.3, young: 0.4 }, {}],
      ['Public sector', [9, 9], { union: 0.5, prof: 0.3, black: 0.2 }, { ldp: 1.1, sdlp: 1.15, cc: 0.85, lib: 0.6 }],
      ['Small business owner', [7, 6], { suburb: 0.5, rural: 0.3, relig: 0.2 }, { cc: 1.2, lib: 1.4, reform: 1.2, sdlp: 0.7 }],
      ['Farmer and agricultural', [2, 1], { rural: 1 }, { cc: 1.1, cdp: 1.15, srp: 1.2 }],
      ['Student', [4, 4], { young: 1 }, {}],
      ['Homemaker', [6, 4], { relig: 0.5, suburb: 0.5 }, {}],
      ['Retired', [19, 22], { retire: 1 }, {}]] },
    { id: 'home', name: 'Housing', segs: [
      ['Homeowner', [68, 66], { suburb: 0.3, rural: 0.2, retire: 0.25, relig: 0.15, union: 0.1 }, {}],
      ['Renter', [32, 34], { young: 0.35, black: 0.25, hisp: 0.25, prof: 0.15 }, {}]] },
    { id: 'immig', name: 'Immigrant generation', segs: [
      ['First generation (born abroad)', [8, 11], { hisp: 0.5, prof: 0.3, young: 0.2 }, { ldp: 1.15, reform: 0.6, con: 0.4, cc: 0.9 }],
      ['Second generation', [9, 11], { hisp: 0.4, prof: 0.2, union: 0.2, young: 0.2 }, {}],
      ['Third generation or more', [83, 78], 'rest', {}]] },
    { id: 'religion', name: 'Religion', segs: [
      ['Evangelical Protestant', [24, 21], { relig: 0.55, rural: 0.35, suburb: 0.1 }, { cc: 1.15, con: 1.4, ldp: 0.8 }, { from: 2000, cc: 0.006, maga: 0.02, cdp: -0.006 }],
      ['Mainline Protestant', [17, 11], { suburb: 0.5, retire: 0.3, rural: 0.2 }, { cdp: 1.1 }],
      ['Catholic', [24, 20], { union: 0.3, hisp: 0.35, suburb: 0.35 }, { cdp: 1.25, asp: 1.6, sdlp: 1.1 }],
      ['Black Protestant', [8, 8], { black: 1 }, {}],
      ['Jewish', [2, 2], { prof: 0.6, retire: 0.4 }, { ldp: 1.3, cc: 0.6 }],
      ['Latter-day Saint', [2, 2], { relig: 0.5, rural: 0.5 }, { asp: 5, cc: 1.2, ldp: 0.5 }],
      ['Muslim', [1, 1.5], { young: 0.4, prof: 0.3, black: 0.3 }, { ldp: 1.2, cc: 0.4, con: 0.2 }],
      ['Other faith', [3, 4.5], { prof: 0.5, young: 0.5 }, {}],
      ['No religion', [19, 30], { young: 0.5, prof: 0.5 }, { ldp: 1.15, grn: 1.4, lib: 1.3, cc: 0.55, con: 0.2, cdp: 0.6 }, { from: 2000, ldp: 0.008, grn: 0.006, cc: -0.01 }]] },
    { id: 'marital', name: 'Marital status', segs: [
      ['Married', [58, 52], { suburb: 0.3, relig: 0.2, rural: 0.2, retire: 0.2, union: 0.1 }, { cc: 1.1, cdp: 1.05 }],
      ['Never married', [24, 30], { young: 0.5, black: 0.2, hisp: 0.15, prof: 0.15 }, {}, { from: 2004, ldp: 0.006, cc: -0.006 }],
      ['Divorced or separated', [11, 11], { union: 0.3, suburb: 0.3, retire: 0.2, black: 0.2 }, {}],
      ['Widowed', [7, 7], { retire: 1 }, {}]] },
    { id: 'children', name: 'Children', segs: [
      ['Children under 18 at home', [36, 31], { suburb: 0.35, hisp: 0.2, black: 0.15, relig: 0.15, union: 0.15 }, { cdp: 1.1 }],
      ['No children at home', [64, 69], 'rest', {}]] }
  ];

  // A segment's size (% of the electorate) in a given year: linear between 1997 and 2024, then flat.
  U.segSize = function (seg, year) {
    var v = seg[1]; if (typeof v === 'number') return v;
    var t = Math.max(0, Math.min(1, ((year || 1997) - 1997) / 27)); return v[0] + (v[1] - v[0]) * t;
  };
  // A segment's party multipliers in a given year: base tilt times its trend since trend.from.
  U.segTilt = function (seg, year) {
    var o = {}, tr = seg[4], p; for (p in seg[3]) o[p] = seg[3][p];
    if (tr && year > tr.from) for (p in tr) if (p !== 'from') o[p] = (o[p] || 1) * Math.max(0.2, 1 + tr[p] * (year - tr.from));
    return o;
  };

  // Vote shares (%) of a segment, given V.demographics(Q).
  U.segmentVote = function (D, cat, seg) {
    var mix = seg[2];
    if (mix === 'rest') {
      var used = {}, usedT = 0; mix = {};
      cat.segs.forEach(function (o) { if (o[2] === 'rest') return; for (var g in o[2]) used[g] = (used[g] || 0) + o[2][g] * U.segSize(o); usedT += U.segSize(o); });
      var t = 0; U.GROUPS.forEach(function (g) { mix[g] = Math.max(0.002, D.groups[g].size - (used[g] || 0) * (usedT ? 1 : 0)); t += mix[g]; });
      for (var g2 in mix) mix[g2] /= t;
    }
    var out = {}, tot = 0;
    for (var g in mix) { var sh = D.groups[g].shares; for (var p in sh) out[p] = (out[p] || 0) + sh[p] * mix[g]; }
    var tl = U.segTilt(seg); for (p in out) { out[p] *= (tl[p] || 1); tot += out[p]; }
    for (p in out) out[p] = out[p] / tot * 100;
    return out;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
