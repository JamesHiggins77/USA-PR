# Design notes

This document follows the brief's §22 checklist: unresolved rules and their defaults, the data model, and which values are scenario assumptions rather than canon. Every rule default lives in `js/rules.js`.

## 1. Rule defaults (the brief left these open)

| Area | Default chosen | Where |
|---|---|---|
| District/PR apportionment | Hamilton (largest remainder) on 2000 census population, minimum 1 district + 1 list seat per state | `rules.house.apportionment` |
| District first round | Absolute majority of valid votes; otherwise top two go to a runoff | `rules.house.districtFirstRoundMajority` |
| Runoff transfers | Eliminated parties' voters split by ideological distance; voters far from both finalists abstain; pacts boost transfers ×2.5 | `engine/electoral.js` |
| House PR formula / threshold | Sainte-Laguë, **no threshold** (state-senate 5% is not applied) | `rules.house.prFormula`, `prThreshold` |
| No compensatory seats | District and PR results simply add up, as the brief specifies | — |
| Electors per state | House seats + 4 (one per senator); DC = 3; total 1,003, majority 502 | `rules.president.electors` |
| Elector allocation | Proportional (largest remainder) within each state; winner-take-all is a switch | `rules.president.allocation` |
| Presidential runoff | Top two by round-one electors; round two re-runs every state as a two-way race | `rules.president.runoff` |
| Presidential term | 4 years, first election November 2000; a two-term limit is assumed (Clinton cannot run in 2000) | `rules.president` |
| Senate direct seat | Two classes of states; each direct seat is contested every second general election | `rules.senate.directClasses` |
| Appointed senators | Re-appointed after each general election from the new state governments (governor picks own party; chambers pick the largest member of the most compatible majority) | `engine/elections.js` |
| State elections | Held alongside federal general elections | `rules.stateElections` |
| State houses | 4 constituencies × 5 seats, D'Hondt, no threshold | `rules.stateHouse` |
| State senates | 40 seats, Sainte-Laguë, fixed 5% threshold | `rules.stateSenate` |
| Investiture | 401 yes on the first ballot, or more yes than no on the second | `rules.government` |
| Formation deadline | 3 months, then a repeat election | `rules.government.formationMonthsBeforeRepeat` |
| Legislative term | 48 months maximum after an election | `rules.government.maxTermMonths` |
| No confidence | 401 votes to topple (not constructive) | `rules.government.noConfidence` |
| Budgets | Must pass both chambers, or the House overrides the Senate with 401 | `rules.government.budgetSenate` |
| Presidential veto | A President outside the government may veto distant bills; override needs absolute majorities in both chambers | `game/content.js` |
| Turn length | Monthly, 3 actions (4 during a campaign) | `rules.government.actionsPerMonth` |

## 2. Data model

- **Party** (`data/parties.js`): id, name, short name, colour, `kind` (party / alliance / federation / regional), economic, social and federal positions, office-seeking weight, leader, group preferences (national parties) or state home shares (regional parties and the AGA), secession tendency.
- **Alliance members**: `UL_MEMBERS` (seat weight, stance: reformist / hard / revolutionary); `ASP_MEMBERS`; `aga.chapters` (state parties with their own positions).
- **Factions**: `LDP_FACTIONS` (figure, position, strength, dissent, wants). The game state holds the live copy.
- **State** (`data/states.js`): population, region, demographic indices, tile-map position, unicameral flag. The game state holds each state's governor, state house and state senate.
- **Game state** (`Q`, `game/state.js`): calendar, RNG seed, campaign modifiers by party and group, state modifiers, positions, relations (pairwise 0–100), House seats, 200 Senate seat records, government (PM, coalition, confidence and supply, posts, concessions), President, economy, factions, leader, pacts, pending concessions, polls, log, election and formation status. It is plain JSON, so saves are a direct copy.
- **Cards and events** (`game/content.js`, `game/events.js`): `{ id, title, tag, cond, body, options: [{ label, sub, cond, act }] }`, in the same shape as Dendry scenes.

## 3. Scenario assumptions (generated or chosen, NOT canon)

- All opening seat counts, vote shares, state governments and Senate composition are **generated** by running the model on a 1996-style electorate (governing parties slightly stronger, Greens weaker). The tests check that the canon conditions hold: the government controls both chambers and Nader is one of four Green MPs.
- National vote targets at the start: LDP 23, CC 20, SDLP 18, CDP 13.5, ASP 7, UL 6.5, LIB 3, CON 2.5, ACP 1; regional parties by state home share.
- Group preferences, regional affinities, demographic indices, party positions and starting relations.
- **Party leaders other than canon**: CDP John McCain, CC George W. Bush, ASP Ross Perot (Reform), UL coordinator Bernie Sanders, Libertarian Harry Browne, Constitution Howard Phillips; 2000 ASP nominee Pat Buchanan. Regional parties are led by unnamed chairs.
- **LDP**: Al Gore is assumed to be the LDP leader as well as PM, and Clinton an LDP President. The four factions (New Democrats/Lieberman, Progressive Liberals/Kennedy, Civil Rights Caucus/Lewis, Heartland Liberals/Bayh) are a design proposal.
- Economy at the start: growth 4.4%, unemployment 4.3%, inflation 2.2%, a 1% surplus, debt 40% of GDP.

## 4. Decisions flagged for the designer

1. **Reform Party and the ASP.** The canon lists Reform as an ASP constituent and also as the 1999 confidence-and-supply partner. The game models the ASP as one parliamentary actor whose Reform constituent signed the deal. If Reform should sit as a separate group in 1999, it would need its own party entry.
2. **Greens inside the UL.** The UL runs joint lists. The Greens' share of UL seats is tracked inside the alliance (4 at the start, growing with Nader's surge). A Green breakaway from the UL is not yet modelled as a separate list.
3. **MAGA and the America First Party** are defined but dormant. MAGA can launch from mid-2015 if accumulated discontent is high (long grand coalitions, unemployment, low approval); the AFP can appear only if MAGA has entered government. Neither is guaranteed.
4. **Forward and United parties** (ASP constituents) are treated as not yet existing in 1999.
5. **Snap elections** are possible after 12 months of government. The brief says only "must be called by September 2000".

## 5. Not yet built (next steps)

- More authored events for 2002–2024 (the systemic loop runs to 2024 and beyond, but authored content thins out after 2001).
- Media outlets as actors; detailed MP biographies; secession pathway stages beyond grievance and hardliner growth.
- District-level pact negotiation (pacts are currently national, applied in every district).
- Other playable parties (the architecture supports it; content and factions are needed).
