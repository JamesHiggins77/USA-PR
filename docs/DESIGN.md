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
- National vote targets at the start: LDP 23, CC 20, SDLP 18, CDP 13.5, ASP 3.8, Reform 3.4, Greens 2.4, DSA 1.1, WFP 0.9, CPUSA 0.8, revolutionary parties 0.7, LIB 3, CON 2.5; regional parties by state home share.
- Group preferences, regional affinities, demographic indices, party positions and starting relations.
- **Party leaders other than canon**: CDP John McCain, CC George W. Bush, Reform Ross Perot (2000 nominee Pat Buchanan), ASP an unnamed coalition chair, United Left Bernie Sanders, Libertarian Harry Browne, Constitution Howard Phillips; Regional parties are led by unnamed chairs.
- **LDP**: Al Gore is assumed to be the LDP leader as well as PM, and Clinton an LDP President. The four factions (New Democrats/Lieberman, Progressive Liberals/Kennedy, Civil Rights Caucus/Lewis, Heartland Liberals/Bayh) are a design proposal.
- Economy at the start: growth 4.4%, unemployment 4.3%, inflation 2.2%, a 1% surplus, debt 40% of GDP.

## 4. Designer decisions and remaining flags

Decided by the designer:
1. **Reform Party** starts as a separate party and is the 1999 confidence-and-supply partner. From 2000 its support drifts down slightly each month. If it polls below 2.6% for six consecutive months, it is absorbed into the ASP as a constituent party, and its seats, senators, state offices and government role pass to the ASP. If its support holds, it survives.
2. **Non-canon leaders** are fine as long as they are plausible.
3. **No United Left in 1999.** The far left is fragmented: Greens (Nader, exactly 4 MPs), CPUSA, DSA, Working Families, the Vermont Progressives, and the small revolutionary parties. A Sanders leadership win in the Communist Party (an event, not a fixed date) opens United Left talks. Each party decides whether to join, the player can try to keep the Greens out, and the talks can fail and be retried after 18 months. Once the UL exists, its seats are split among its members by their weight when it formed. The Greens can later walk out if UL unity falls.
4. **The ACP does not exist until the 2020s.** It can be launched from 2021, more likely when discontent is high.
5. **Party colours** follow the designer's reference map.
6. **Regional stand-down agreements.** In 1999 the SDLP does not run district candidates in New England and the Atlantic states, and the LDP stands aside in the Rust Belt. The CDP stands aside in the South, and the CC in the liberal states. About 70% of the stood-down party's voters go to the partner, 15% choose by ideology and 15% stay home. Agreements can be negotiated or ended with the "Regional electoral agreements" card, and they collapse if the partners' relations fall below 28. Region definitions are in `engine/elections.js` (`REGION_SETS`). The "liberal states" are taken to be New England, NY, NJ, DE, MD, DC, the Pacific coast and Illinois (a design choice). Agreements apply to House districts only, not to list seats or statewide races.
7. **District map.** Real 1990s boundaries do not fit the game's 400-district apportionment, so `tools/build_districts.js` generates districts for each state: small ones around the major cities, large ones in rural areas. Each district has a fixed urbanity and demographic character that persists between elections, so safe seats exist.

Still flagged:
- "The Communist Party" that Sanders leads is taken to be the **CPUSA** (a UL member), not the ACP.
- The revolutionary socialist parties (PSL, Black Panther Party, SWP, SEP, WWP, Socialist Alternative and others) are separate parties, but for readability they share one entry ("RSP") with aggregated seats.
- **MAGA and the America First Party** remain dormant until conditions allow: MAGA from mid-2015 with high discontent, and the AFP only after MAGA has been in government.
- **Snap elections** are possible after 12 months of government.

## 5. Not yet built (next steps)

- More authored events for 2002–2024 (the systemic loop runs to 2024 and beyond, but authored content thins out after 2001).
- Media outlets as actors; detailed MP biographies; secession pathway stages beyond grievance and hardliner growth.
- District-level pact negotiation (pacts are currently national, applied in every district).
- Other playable parties (the architecture supports it; content and factions are needed).
