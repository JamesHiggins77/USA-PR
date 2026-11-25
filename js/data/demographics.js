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
      ['Men', 47, 'rest', { cc: 1.12, lib: 1.4, con: 1.2, reform: 1.2, ldp: 0.9, grn: 0.9 }],
      ['Women', 52, 'rest', { ldp: 1.1, sdlp: 1.05, cc: 0.9, lib: 0.6, con: 0.8 }],
      ['Other / non-binary', 1, { young: 0.7, prof: 0.3 }, { grn: 2, dsa: 2, ldp: 1.2, cc: 0.3, con: 0.1 }]] },
    { id: 'race', name: 'Race and ethnicity', segs: [
      ['White', 80, 'rest', {}],
      ['Black', 11, { black: 1 }, {}],
      ['Hispanic', 6, { hisp: 1 }, {}],
      ['Asian American', 2.3, { prof: 0.6, suburb: 0.3, young: 0.1 }, { ldp: 1.25, cc: 0.85, con: 0.3 }],
      ['Native American', 0.7, { rural: 0.5, young: 0.2, union: 0.3 }, { grn: 1.8, ldp: 1.6, sdlp: 1.3, cc: 0.55, con: 0.5 }]] },
    { id: 'age', name: 'Age', segs: [
      ['18–29', 17, { young: 0.7, prof: 0.1, hisp: 0.1, black: 0.1 }, {}],
      ['30–44', 31, { prof: 0.25, suburb: 0.25, union: 0.15, black: 0.12, hisp: 0.12, rural: 0.11 }, {}],
      ['45–64', 33, { suburb: 0.25, union: 0.15, rural: 0.15, relig: 0.15, prof: 0.1, black: 0.1, hisp: 0.1 }, {}],
      ['65+', 19, { retire: 0.8, relig: 0.1, rural: 0.1 }, {}]] },
    { id: 'union', name: 'Union household', segs: [
      ['Union household', 23, { union: 1 }, {}],
      ['Non-union household', 77, 'rest', {}]] },
    { id: 'military', name: 'Military household', segs: [
      ['Military or veteran household', 14, { rural: 0.35, suburb: 0.3, relig: 0.2, union: 0.15 }, { cc: 1.2, con: 1.3, cdp: 1.05, grn: 0.5, dsa: 0.5 }],
      ['No military link', 86, 'rest', {}]] },
    { id: 'education', name: 'Education', segs: [
      ['No high-school diploma', 9, { rural: 0.3, hisp: 0.3, black: 0.2, retire: 0.2 }, {}],
      ['High-school graduate', 32, { union: 0.35, rural: 0.3, relig: 0.2, retire: 0.15 }, {}],
      ['Some college', 28, { suburb: 0.35, young: 0.3, black: 0.15, hisp: 0.2 }, {}],
      ['College graduate', 21, { prof: 0.5, suburb: 0.4, young: 0.1 }, {}],
      ['Postgraduate', 10, { prof: 0.8, young: 0.2 }, { ldp: 1.15, grn: 1.2, cc: 0.85 }]] },
    { id: 'income', name: 'Household income', segs: [
      ['Under $30,000', 28, { black: 0.25, hisp: 0.25, young: 0.25, rural: 0.15, retire: 0.1 }, {}],
      ['$30,000–50,000', 24, { union: 0.35, rural: 0.25, hisp: 0.15, retire: 0.25 }, {}],
      ['$50,000–100,000', 33, { suburb: 0.45, union: 0.2, prof: 0.2, relig: 0.15 }, {}],
      ['Over $100,000', 15, { prof: 0.55, suburb: 0.45 }, { cc: 1.1, lib: 1.3, sdlp: 0.8 }]] },
    { id: 'occupation', name: 'Occupation', segs: [
      ['Professional and managerial', 21, { prof: 0.7, suburb: 0.3 }, {}],
      ['Blue-collar and manufacturing', 17, { union: 0.7, rural: 0.3 }, {}],
      ['Service and retail', 15, { hisp: 0.3, black: 0.3, young: 0.4 }, {}],
      ['Public sector', 9, { union: 0.5, prof: 0.3, black: 0.2 }, { ldp: 1.1, sdlp: 1.15, cc: 0.85, lib: 0.6 }],
      ['Small business owner', 7, { suburb: 0.5, rural: 0.3, relig: 0.2 }, { cc: 1.2, lib: 1.4, reform: 1.2, sdlp: 0.7 }],
      ['Farmer and agricultural', 2, { rural: 1 }, { cc: 1.1, cdp: 1.15, srp: 1.2 }],
      ['Student', 4, { young: 1 }, {}],
      ['Homemaker', 6, { relig: 0.5, suburb: 0.5 }, {}],
      ['Retired', 19, { retire: 1 }, {}]] },
    { id: 'home', name: 'Housing', segs: [
      ['Homeowner', 68, { suburb: 0.3, rural: 0.2, retire: 0.25, relig: 0.15, union: 0.1 }, {}],
      ['Renter', 32, { young: 0.35, black: 0.25, hisp: 0.25, prof: 0.15 }, {}]] },
    { id: 'immig', name: 'Immigrant generation', segs: [
      ['First generation (born abroad)', 8, { hisp: 0.5, prof: 0.3, young: 0.2 }, { ldp: 1.15, reform: 0.6, con: 0.4, cc: 0.9 }],
      ['Second generation', 9, { hisp: 0.4, prof: 0.2, union: 0.2, young: 0.2 }, {}],
      ['Third generation or more', 83, 'rest', {}]] },
    { id: 'religion', name: 'Religion', segs: [
      ['Evangelical Protestant', 24, { relig: 0.55, rural: 0.35, suburb: 0.1 }, { cc: 1.15, con: 1.4, ldp: 0.8 }],
      ['Mainline Protestant', 17, { suburb: 0.5, retire: 0.3, rural: 0.2 }, { cdp: 1.1 }],
      ['Catholic', 24, { union: 0.3, hisp: 0.35, suburb: 0.35 }, { cdp: 1.25, asp: 1.6, sdlp: 1.1 }],
      ['Black Protestant', 8, { black: 1 }, {}],
      ['Jewish', 2, { prof: 0.6, retire: 0.4 }, { ldp: 1.3, cc: 0.6 }],
      ['Latter-day Saint', 2, { relig: 0.5, rural: 0.5 }, { asp: 5, cc: 1.2, ldp: 0.5 }],
      ['Muslim', 1, { young: 0.4, prof: 0.3, black: 0.3 }, { ldp: 1.2, cc: 0.4, con: 0.2 }],
      ['Other faith', 3, { prof: 0.5, young: 0.5 }, {}],
      ['No religion', 19, { young: 0.5, prof: 0.5 }, { ldp: 1.15, grn: 1.4, lib: 1.3, cc: 0.55, con: 0.2, cdp: 0.6 }]] },
    { id: 'marital', name: 'Marital status', segs: [
      ['Married', 58, { suburb: 0.3, relig: 0.2, rural: 0.2, retire: 0.2, union: 0.1 }, { cc: 1.1, cdp: 1.05 }],
      ['Never married', 24, { young: 0.5, black: 0.2, hisp: 0.15, prof: 0.15 }, {}],
      ['Divorced or separated', 11, { union: 0.3, suburb: 0.3, retire: 0.2, black: 0.2 }, {}],
      ['Widowed', 7, { retire: 1 }, {}]] },
    { id: 'children', name: 'Children', segs: [
      ['Children under 18 at home', 36, { suburb: 0.35, hisp: 0.2, black: 0.15, relig: 0.15, union: 0.15 }, { cdp: 1.1 }],
      ['No children at home', 64, 'rest', {}]] }
  ];

  // Vote shares (%) of a segment, given V.demographics(Q).
  U.segmentVote = function (D, cat, seg) {
    var mix = seg[2];
    if (mix === 'rest') {
      var used = {}, usedT = 0; mix = {};
      cat.segs.forEach(function (o) { if (o[2] === 'rest') return; for (var g in o[2]) used[g] = (used[g] || 0) + o[2][g] * o[1]; usedT += o[1]; });
      var t = 0; U.GROUPS.forEach(function (g) { mix[g] = Math.max(0.002, D.groups[g].size - (used[g] || 0) * (usedT ? 1 : 0)); t += mix[g]; });
      for (var g2 in mix) mix[g2] /= t;
    }
    var out = {}, tot = 0;
    for (var g in mix) { var sh = D.groups[g].shares; for (var p in sh) out[p] = (out[p] || 0) + sh[p] * mix[g]; }
    for (p in out) { out[p] *= (seg[3][p] || 1); tot += out[p]; }
    for (p in out) out[p] = out[p] / tot * 100;
    return out;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
