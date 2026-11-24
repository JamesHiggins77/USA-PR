// Central rules configuration (brief §4.9). Every constitutional default the
// brief leaves open is set here and documented in docs/DESIGN.md. Change
// values here, not in engine code.
(function (G) {
  'use strict';
  G.USA.RULES = {
    house: {
      total: 801, districtSeats: 435, prSeats: 365, dcSeats: 1,   // designer change: real 435 districts, PR reduced to 365
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
      termYears: 6, lastElection: { year: 1998, month: 11 },   // designer canon: 6-year terms; Clinton elected 1992 and 1998
      termLimit: 2,
      electors: 'house-plus-senate',    // state electors = House seats + 4; DC = 3
      dcElectors: 3,
      allocation: 'proportional',       // 'proportional' | 'winner-take-all'
      majority: 0.5,                    // strictly more than half of electors
      runoff: 'top-two-popular'         // round 2: statewide two-way vote, same allocation
    },
    government: {
      investitureFirstBallot: 'absolute', // 401 of 801
      investitureSecondBallot: 'simple',  // more yes than no
      formationMonthsBeforeRepeat: 3,
      maxTermMonths: 48,
      noConfidence: 'absolute',           // 401 votes against topples the PM
      budgetSenate: 'must-pass-or-override', // House can override Senate with 401
      handSize: 5,                      // cards held; one card played or discarded per month
      cardBoost: 2.0                    // card effect multiplier (one action a month)
    },
    governor: { firstRoundMajority: 0.5, termYears: 4 },
    stateHouse: { formula: 'dhondt', magnitude: 5, threshold: 0 },
    stateSenate: { formula: 'sainte-lague', threshold: 0.05, seats: 40 }, // 5% fixed by canon
    stateElections: 'with-general'      // state contests held alongside federal general elections
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
