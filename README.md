# The American Republic: 1999–2024

A turn-based political strategy game set in an alternate United States with proportional representation, two-round elections and coalition government. You lead the **Liberal Democratic Party** from January 1999, inside Al Gore's Grand Coalition, with a general election due by September 2000.

Built in the style of the *Social Democracy* Spain mod: a monthly hand of action cards, authored and systemic events, faction dissent, voter-group polling, and investiture votes, on top of a real electoral engine.

## Play

Open `index.html` in a browser. No build step and no dependencies. The game autosaves at the end of every month (browser storage); the **Game** tab exports and imports save files.

Each month you get three actions (four during a campaign). Use them on cards: interviews, rallies, ads, fundraising, platform changes, faction meetings, courting other parties, electoral pacts, bills, budgets. Then **End month**: other parties act, the economy moves, events fire, and elections and government formation happen when due.

## What is simulated

- **House (801)**: 400 two-round districts + 400 statewide list seats (Sainte-Laguë) + DC, computed separately and added together.
- **Senate (200)**: per state, one directly elected seat (two rounds, staggered), plus appointments by the governor, state house and state senate. Nebraska is unicameral, so its governor appoints three.
- **States**: two-round governors, constituency-PR state houses, statewide-PR state senates with the fixed 5% threshold. State results determine Senate appointments.
- **President**: a two-round Electoral College with proportional elector allocation, joint tickets and endorsements.
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
js/game/               game state, monthly turn, cards, events, flow controller
js/ui/                 interface and SVG charts
tests/                 node --test suite
tools/playtest.js      headless random playthrough: node tools/playtest.js <seed> <endYear>
docs/DESIGN.md         rule defaults, data model, scenario assumptions, open questions
```

Tests: `npm test` (Node 18+).

Adding a playable party should mostly mean data: its factions, cards and events, with `Q.player` set to its id. The election, parliament and coalition systems are shared and party-agnostic.
