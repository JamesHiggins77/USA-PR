// Central rules configuration (brief §4.9). Every constitutional default the
// brief leaves open is set here and documented in docs/DESIGN.md. Change
// values here, not in engine code.
(function (G) {
  'use strict';
  G.USA.RULES = {
    house: {
      // designer change: pure proportional representation, 600 seats shared
      // among the states and DC by population, statewide party lists.
      system: 'pure-pr',                // 'pure-pr' | 'mixed' (435 two-round districts + 365 list seats + DC)
      total: 600, pureSeats: 600,         // majority 301; on a 300-300 tie the President casts the deciding vote
      nationalThreshold: 0,             // share of the national vote needed to win any seats (e.g. 0.05)
      stateThreshold: 0,                // share of a state's vote needed to win seats there
      thresholdExemptRegional: false,   // if true, regional parties skip the national threshold
      mixedTotal: 801, districtSeats: 435, prSeats: 365, dcSeats: 1,
      apportionment: 'map',             // districts: the real (2012) district map; PR: largest remainder on population, min 1
      minDistrictPerState: 1, minPrPerState: 1,
      districtFirstRoundMajority: 0.5,  // absolute majority of valid votes
      prFormula: 'sainte-lague',        // or 'dhondt'
      prThreshold: 0.0,                 // statewide share; NOT the state-senate 5%
      dcMethod: 'two-round'
    },
    senate: {
      total: 200, perState: 4,
      directTermElections: 2,           // direct seat contested every 2nd general election
      directClasses: 2,                 // states split into class A / B (staggered)
      directFirstRoundMajority: 0.5,
      appointedReconsidered: 'on-state-government-change'
    },
    president: {
      termYears: 6, lastElection: { year: 1992, month: 11 },   // designer canon: 6-year terms; Clinton elected 1992, up again November 1998
      termLimit: 2,
      electors: 'house-plus-senate',    // state electors = House seats + 4; DC = 3
      dcElectors: 3,
      allocation: 'winner-take-all',    // designer canon: a state's plurality winner takes all its electors
      alwaysRunoff: true,               // designer canon: there is always a second round
      runoff: 'popular-then-electoral'  // round 1: national popular vote, top two advance; round 2: Electoral College; ties: popular vote, then coin
    },
    government: {
      investitureFirstBallot: 'absolute', // a majority of the House
      investitureSecondBallot: 'simple',  // more yes than no
      formationMonthsBeforeRepeat: 3,
      maxTermMonths: 48,
      noConfidence: 'absolute',           // a majority of the House topples the PM
      budgetSenate: 'must-pass-or-override', // House can override the Senate with a majority of its members
      handSize: 5,                      // cards held; one card played or discarded per month
      cardBoost: 2.0                    // card effect multiplier (one action a month)
    },
    governor: { firstRoundMajority: 0.5, termYears: 4 },
    stateHouse: { formula: 'dhondt', magnitude: 5, threshold: 0 },
    stateSenate: { formula: 'sainte-lague', threshold: 0.05, seats: 40 }, // 5% fixed by canon
    stateElections: 'with-general'      // state contests held alongside federal general elections
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
