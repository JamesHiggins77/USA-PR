# The American Republic: 1999–2024

A turn-based political strategy game set in an alternate United States with proportional representation, two-round elections and coalition government. You lead the **Liberal Democratic Party** from January 1999, inside Al Gore's Grand Coalition, with a general election due by September 2000.

Built in the style of the *Social Democracy* Spain mod: a monthly hand of action cards, authored and systemic events, faction dissent, voter-group polling, and investiture votes, on top of a real electoral engine.

## Play

Open `index.html` in a browser. No build step and no dependencies. The game autosaves at the end of every month (browser storage); the **Game** tab exports and imports save files.

You hold a **hand of five cards**, drawn from five decks: **National Politics**, **Party Politics**, **State Politics**, **Coalition & Government** and **Campaign**. You choose which deck to draw from to fill each empty slot; only cards that are useful right now are drawn.

Each month you either **play one card** (choose one of its options) or **discard one card**, and the month then advances: other parties act, the economy moves, events fire, and elections and government formation happen when due. You can also **discard the whole hand** to let a month pass without acting and draw five fresh cards.

## What is simulated

- **House (801)**: 435 two-round districts (real 2012 boundaries) + 365 statewide list seats (Sainte-Laguë) + DC, computed separately and added together.
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
js/game/               game state, monthly turn, cards, decks and hand, events, flow controller
js/ui/                 interface and SVG charts
tests/                 node --test suite
tools/playtest.js      headless random playthrough: node tools/playtest.js <seed> <endYear>
tools/build_districts.js  rebuilds js/data/districts.js from the real district boundaries (see the script header)
docs/DESIGN.md         rule defaults, data model, scenario assumptions, open questions
```

Tests: `npm test` (Node 18+).

Adding a playable party should mostly mean data: its factions, cards and events, with `Q.player` set to its id. The election, parliament and coalition systems are shared and party-agnostic.
