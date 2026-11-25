# The American Republic: 1997–2024

A turn-based political strategy game set in an alternate United States with proportional representation, two-round elections and coalition government. You lead the **Liberal Democratic Party** from January 1997, as the senior partner in Al Gore's LDP–SDLP coalition, with a presidential election in November 1998 and a general election due by September 2000.

Built in the style of the *Social Democracy* Spain mod: a monthly hand of action cards, authored and systemic events, faction dissent, voter-group polling, and investiture votes, on top of a real electoral engine.

## Play

Open `index.html` in a browser. No build step and no dependencies. The game autosaves at the end of every month (browser storage); the **Game** tab exports and imports save files.

You hold a **hand of five cards**, drawn from five decks: **National Politics**, **Party Politics**, **State Politics**, **Coalition & Government** and **Campaign**. You choose which deck to draw from to fill each empty slot; only cards that are useful right now are drawn.

Each month you either **play one card** (choose one of its options) or **discard one card**, and the month then advances: other parties act, the economy moves, events fire, and elections and government formation happen when due. You can also **discard the whole hand** to let a month pass without acting and draw five fresh cards.

## What is simulated

- **House (600)**: two-tier proportional representation. 100 national list seats (5% national threshold) plus 500 state list seats (shared by population, no threshold), by Sainte-Laguë. Majority 301; the President breaks a tie.
- **Senate (200)**: 4 per state. Three are elected statewide at each general election: the largest party wins 2 and the runner-up 1; a lead under 2 points gives 1-1-1, and a landslide (twice the runner-up's vote and 15+ points ahead) gives 3-0. The fourth is chosen by the state house (Nebraska: its unicameral legislature).
- **Separation of powers** (`js/game/constitution.js`): the President nominates the PM (1st nominee needs an absolute House majority, 2nd a simple majority; then 3 months of open talks with a Senate-appointed caretaker, or a new election); appoints State, Defense and Treasury (Senate consent, or 2/3 of the House overturns a rejection) plus judges, CIA, Joint Chiefs and Fed chair with Senate consent; signs executive orders; vetoes bills (override: 2/3 House + Senate majority); cannot dissolve within 4 years of a government forming unless the PM asks and both chambers agree, or a new President takes office. The Senate can veto House bills with 2/3 or delay them 2 years, cannot touch budgets, and impeaches with 2/3. No-confidence votes are constructive (since 1974).
- **States**: two-round governors, constituency-PR state houses, statewide-PR state senates with the fixed 5% threshold. State results determine Senate appointments.
- **President**: a six-year term, elected in two rounds that are always held: a national popular vote, then a head-to-head runoff between the top two decided by the Electoral College, where each state's winner takes all its electors. There are joint tickets and endorsements.
- **Government formation**: investiture votes (401 on the first ballot, more yes than no on the second), coalitions vs confidence and supply, cabinet posts, concessions, red lines, and AI formateurs who can offer the LDP a role.
- **Voters**: nine voter groups across 50 states, with regional affinities and regional/federated parties. The briefing explains what moved the LDP's numbers.
- **Party**: four LDP factions with dissent, rebellions on key votes, walkouts, leadership challenges, funds, unity, morale.
- **Alliances**: United Left seats belong to its constituent organisations (reformist, hard-left, revolutionary) and they vote differently. AGA seats belong to autonomous state Green parties that bargain separately.
- **Economy**: growth, unemployment, inflation, deficit and debt, with probabilistic shocks (e.g. the tech bubble may burst). Voters attribute credit or blame by group and office.

## Project layout

```
js/rules.js            all constitutional/electoral settings (brief §4.9)
js/data/               states, parties, factions (scenario data)
js/engine/             electoral maths, vote model, elections, parliament, coalitions
js/game/               game state, monthly turn, cards, decks and hand, events, flow controller
js/ui/                 interface and SVG charts
tests/                 node --test suite
tools/playtest.js      headless random playthrough: node tools/playtest.js <seed> <endYear>
tools/build_districts.js  rebuilds js/data/districts.js from the real district boundaries (see the script header)
docs/DESIGN.md         rule defaults, data model, scenario assumptions, open questions
```

Tests: `npm test` (Node 18+).

Adding a playable party should mostly mean data: its factions, cards and events, with `Q.player` set to its id. The election, parliament and coalition systems are shared and party-agnostic.
