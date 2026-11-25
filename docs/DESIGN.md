# Design notes

This document follows the brief's §22 checklist: unresolved rules and their defaults, the data model, and which values are scenario assumptions rather than canon. Every rule default lives in `js/rules.js`.

## 1. Rule defaults (the brief left these open)

| Area | Default chosen | Where |
|---|---|---|
| District/PR apportionment | Districts: the real 435-district map (2012 boundaries). List seats: 365, Hamilton (largest remainder) on 2000 census population, minimum 1 per state | `rules.house.apportionment` |
| District first round | Absolute majority of valid votes; otherwise top two go to a runoff | `rules.house.districtFirstRoundMajority` |
| Runoff transfers | Eliminated parties' voters split by ideological distance; voters far from both finalists abstain; pacts boost transfers ×2.5 | `engine/electoral.js` |
| House PR formula / threshold | Sainte-Laguë, **no threshold** (state-senate 5% is not applied) | `rules.house.prFormula`, `prThreshold` |
| No compensatory seats | District and PR results simply add up, as the brief specifies | — |
| Electors per state | House seats + 4 (one per senator); DC = 3; total 1,003, majority 502 | `rules.president.electors` |
| Elector allocation | **Winner-take-all** (designer canon), used in the round-two Electoral College vote | `rules.president.allocation` |
| Presidential rounds | **Always two** (designer canon). Round one is a national popular vote; the top two advance. Round two is decided by the Electoral College, winner-take-all by state. Ties are broken by the national popular vote, then a coin flip | `rules.president.runoff` |
| Presidential term | **6 years** (designer canon): Clinton elected 1992; elections November 1998, 2004, 2010, 2016. Two-term limit. A President may resign so that an early presidential election is held with a general election (Clinton's 1999 option), which restarts the cycle | `rules.president` |
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

### House: two-tier proportional representation (designer choice)

The House has **600 seats in two tiers, added together**: **100 national list seats**, shared by Sainte-Laguë on the nationwide vote among parties with at least **5%** nationally, and **500 state list seats**, shared among the 50 states and DC by population (minimum 1) and allocated within each state with **no threshold**. A majority is 301; on a 300–300 tie the President casts the deciding vote. Alternatives (single-tier 600, other thresholds, 300 + 300) were compared in `docs/threshold_runs.md` and `docs/two_tier_runs.md` and remain available in `js/rules.js`.

### Earlier option: single-tier pure proportional representation

The House has **600 seats**, all elected by statewide party-list PR (Sainte-Laguë). They are shared among the 50 states and DC by population, with at least one each. A majority is 301; on a 300–300 tie the President casts the deciding vote, following their party's line. Thresholds are set in `rules.house.nationalThreshold` and `rules.house.stateThreshold`; the default is none until the designer picks one. `docs/threshold_runs.md` compares the options. The earlier mixed system (435 districts + 365 list seats + DC) is still available as `rules.house.system = 'mixed'`. Under pure PR, district stand-down agreements and the district map are switched off.

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
6. **Regional stand-down agreements.** At the start the SDLP does not run district candidates in New England and the Atlantic states, and the LDP stands aside in the Rust Belt. The CDP stands aside in the South, and the CC in the liberal states. About 70% of the stood-down party's voters go to the partner, 15% choose by ideology and 15% stay home. Agreements can be negotiated or ended with the "Regional electoral agreements" card, and they collapse if the partners' relations fall below 28. Region definitions are in `engine/elections.js` (`REGION_SETS`). The "liberal states" are taken to be New England, NY, NJ, DE, MD, DC, the Pacific coast and Illinois (a design choice). Agreements apply to House districts only, not to list seats or statewide races.
7. **435 real districts, 365 list seats** (designer change). The House uses the real congressional district map: the 2012 boundaries from the @unitedstates/districts project, which is public domain and derived from Census data. These give 435 districts apportioned as after the 2010 census. To keep the House at 801, the statewide list seats are reduced to 365, apportioned by population with at least one per state. Each district has a fixed character (urbanity from its area, plus persistent local demographic variation), so safe seats exist. The 1992–2002 boundaries would match a 1999 start more closely, but no source for them was reachable from the build environment. `tools/build_districts.js` rebuilds the map.
8. **1998 partisan lean** (designer request). Each district's vote is shaped by its real partisan lean, computed by `tools/build_lean.js`. It is the two-party Democratic margin relative to the nation, 75% from 1996 and 25% from 1992 presidential results. County results (Dave Leip's Atlas via the public `cilekagaci/us-presidential-county-1960-2016` dataset) are area-weighted into the district boundaries. Virginia uses 2000 county results (MIT Election Data + Science Lab), because the 1990s Virginia data is missing from that set; Alaska has a single district and needs none. In play, left parties gain in districts that lean Democratic relative to their state and right parties gain in Republican-leaning ones, scaled by how far left or right each party is (`V.leanShift`, `V.leftWeight` in `engine/votes.js`). State totals, and so the list seats, are unaffected. Limitation: counties are uniform inside, so districts within one county (such as New York City's boroughs) share their county's lean.

Still flagged:
- Bernie Sanders is a **Vermont Progressive** and one of Vermont's senators (canon, with a personal vote that keeps his seat). He does not lead the CPUSA; the far left chooses him as the uniting figure for United Left talks.
- The revolutionary socialist parties (PSL, Black Panther Party, SWP, SEP, WWP, Socialist Alternative and others) are separate parties, but for readability they share one entry ("RSP") with aggregated seats.
- **MAGA and the America First Party** remain dormant until conditions allow: MAGA from mid-2015 with high discontent, and the AFP only after MAGA has been in government.
- **Snap elections** are possible after 12 months of government.

## 4b. Offices (designer request)

- **Speaker of the House**: from the Prime Minister's party, unless the coalition deal offers it to a partner (the "Speaker of the House" concession at the negotiating table). Offering it raises every LDP faction's dissent and lowers unity.
- **President pro tempore of the Senate**: a senior senator from the largest governing party in the Senate.
- **Vice President**: elected with the President. The LDP's nominee can take a running mate from another party (SDLP, CDP or Reform) in return for that party standing down; this also costs goodwill among LDP members.
- **State legislative speakers**: each state house and state senate is presided over by the party leading its majority.
- Officeholders' names (Gephardt, Kennedy, Kerrey and later appointees) are scenario assumptions.

## 4c. Politicians (designer request)

- `js/data/people.js` lists 4–25 real historical figures per party, placed by their real-world politics. The first name in each list leads the party at the start. For regionalist, secessionist and far-right parties, only people who publicly held matching views are used.
- Party leaders change after a bad election (losing 20% of seats) or occasionally otherwise. New leaders, Speakers, Vice Presidents and the 20-member cabinet are drawn from these rosters, and nobody holds two top jobs at once.
- Competence, charisma and loyalty ratings are derived deterministically from the name. They are game values, not judgements about the real people.
- The American Communist Party has only four names: the real party was founded in 2024, and the game activates it only in the 2020s.

## 4d. Opening (designer canon, revised)

- The game starts in **January 1997** (the brief said 1999; changed by the designer).
- The government is a **coalition of the LDP and the SDLP** under Prime Minister Al Gore, with Reform's confidence and supply. It replaces the brief's LDP–SDLP–CDP Grand Coalition; the CDP is in opposition.
- Presidential elections are on a six-year cycle: Clinton was elected in 1992 and faces re-election in **November 1998**.

- The **opening parliament is fixed**: it was elected in late 1996 on fixed national shares (`U.ELECTION_1996` in `data/parties.js`) with no random swings, so every game starts with the same legislature (LDP + SDLP 300 of 600 in the House, needing Reform; 101 of 200 in the Senate). The 1997 polling is calibrated separately.
- **A tight race** (designer request): the 1997 polling targets put the CC ahead of the LDP (22% to 21%) and the CDP at 15%, so at the 2000 election the left (including the Greens) and CC + CDP each hold about 260 seats and smaller parties hold the balance. `node tools/election_spread.js` reruns this check.
- **The Nader surge** (designer canon): from 1999 to mid-2000, a growing share of LDP and SDLP voters switch to the Greens (or to the United Left, if the Greens have joined it, with Nader as its leader), aiming for a target of 6–9% (7.5% by default). The LDP's responses move the target: ignoring Nader raises it; adopting his agenda, winning a debate with him, or passing the climate bill lowers it. After 2000 the switchers drift back slowly.

## 4e. 1998 background (designer canon)

- January 1998: the Lewinsky scandal breaks during Clinton's re-election campaign (a fixed event; the LDP can stand by him, keep its distance, or push him not to run).
- September 1998: Donald Trump endorses the Reform Party in the presidential election (a fixed event). In autumn 1999 he may explore Reform's next nomination.
- February 1999 (only if Clinton won in 1998): Clinton considers resigning so that a presidential election is held on the same day as the general election, to win a fresh mandate and move the news on from the scandal. If he does, he stands again.

## 5. Not yet built (next steps)

- More authored events for 2002–2024 (the systemic loop runs to 2024 and beyond, but authored content thins out after 2001).
- Media outlets as actors; detailed MP biographies; secession pathway stages beyond grievance and hardliner growth.
- District-level pact negotiation (pacts are currently national, applied in every district).
- Other playable parties (the architecture supports it; content and factions are needed).
