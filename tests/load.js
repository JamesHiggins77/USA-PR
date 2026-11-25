// Loads the browser scripts into Node's global scope.
const path = require('path');
const files = ['core', 'rules', 'data/states', 'data/parties', 'data/people', 'data/lore', 'data/general_history', 'data/districts', 'data/district_lean', 'engine/electoral', 'engine/votes', 'engine/elections',
  'engine/parliament', 'engine/coalition', 'game/state', 'game/turn', 'game/content', 'game/events', 'game/decks', 'game/flow'];
const fs = require('fs');
for (const f of files) { const p = path.join(__dirname, '..', 'js', f + '.js'); if (fs.existsSync(p)) require(p); }
module.exports = globalThis.USA;
