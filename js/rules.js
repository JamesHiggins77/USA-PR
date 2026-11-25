// Central rules configuration (brief §4.9). Every constitutional default the
// brief leaves open is set here and documented in docs/DESIGN.md. Change
// values here, not in engine code.
(function (G) {
  'use strict';
  G.USA.RULES = {
    house: {
      // designer change: pure proportional representation, 600 seats shared
      // among the states and DC by population, statewide party lists.
      system: 'two-tier',                // 'pure-pr' | 'two-tier' | 'mixed' (435 two-round districts + 365 list seats + DC)
      nationalTierSeats: 100, stateTierSeats: 500, // designer choice: 100 national list seats + 500 state list seats, added together
      total: 600, pureSeats: 600,         // majority 301; on a 300-300 tie the President casts the deciding vote
      nationalThreshold: 0.05,          // two-tier: applies to the national list only
      stateThreshold: 0,                // two-tier: applies to the state lists
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
      total: 200, perState: 4,          // designer canon: per state, 3 elected by PR + 1 by the state house
      prSeatsPerState: 3,               // elected statewide by PR at every general election
      prFormula: 'majority-minority', prThreshold: 0,
      // majority-minority: the state's largest party wins 2 seats and the runner-up 1;
      // a near-tie (lead under closeLead points) gives 1-1-1, and a landslide
      // (at least sweepRatio x the runner-up and sweepLead points ahead) gives 3-0
      closeLead: 2, sweepRatio: 2, sweepLead: 15,
      legislatureSeat: 'state-house'    // the 4th senator is elected by the lower house (Nebraska: its legislature)
    },
    constitution: {
      dissolutionLockMonths: 48,        // no dissolution for 4 years after a government forms (unless the PM asks and both chambers agree, or a new President)
      openTalksMonths: 3,               // after both presidential nominees fail
      senateVetoShare: 2 / 3,           // the Senate kills a House bill with two-thirds
      senateDelayMonths: 24,            // or delays it with a simple majority
      vetoOverrideHouseShare: 2 / 3,    // a presidential veto falls to 2/3 of the House plus a simple Senate majority
      secretaryOverrideHouseShare: 2 / 3, // the House can overturn the Senate's rejection of a Secretary
      impeachShare: 2 / 3,              // the Senate removes the President with two-thirds
      noConfidence: 'constructive'      // since 1974: the motion names a new PM, who needs an absolute majority
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
      maxTermMonths: 60,               // the latest a general election can be held after the last
      noConfidence: 'constructive',       // see constitution
      budgetSenate: 'none',               // the Senate cannot delay or veto budgets
      handSize: 5,                      // cards held; one card played or discarded per month
      cardBoost: 2.0                    // card effect multiplier (one action a month)
    },
    governor: { firstRoundMajority: 0.5, termYears: 4 },
    stateHouse: { formula: 'dhondt', magnitude: 5, threshold: 0 },
    stateSenate: { formula: 'sainte-lague', threshold: 0.05, seats: 40 }, // 5% fixed by canon
    stateElections: 'with-general'      // state contests held alongside federal general elections
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
