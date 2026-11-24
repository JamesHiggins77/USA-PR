// Writes docs/LORE.md from js/data/lore.js. Usage: node tools/export_lore.js
const U = require('../tests/load.js'), L = U.LORE, fs = require('fs'), path = require('path');
const out = ['# The American Republic: history', '', 'How this America got here. The story diverges from ours with the deadlocked election of 1912; real people appear, but their careers differ. Generated from `js/data/lore.js`, which the game\'s History tab also reads.', '',
  '## The constitution', '', '| When | What happened |', '|---|---|', ...L.constitution.map(r => `| ${r[0]} | ${r[1]} |`), '',
  '## Presidents', '', '| Elected | President | Party | Notes |', '|---|---|---|---|', ...L.presidents.map(r => `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} |`), '',
  '## Prime Ministers and governments', '', '| Years | Prime Minister | Party | Government |', '|---|---|---|---|', ...L.governments.map(r => `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} |`), '',
  '## Presidential elections', '', 'Round one is a national popular vote; the top two meet in an Electoral College runoff, where each state\'s winner takes all its electors.', ''];
const pn = k => (L.oldParties[k] ? L.oldParties[k][0] : U.PARTIES[k] ? U.PARTIES[k].short : '');
L.presElections.forEach(e => { out.push(`### ${e.year}`, '', e.note, '', '| Round one | Party | Vote |', '|---|---|---:|', ...e.r1.map(c => `| ${c[0]} | ${pn(c[1])} | ${c[2].toFixed(1)}% |`), '', `| Runoff (${e.total} electors) | Party | Electors | Vote |`, '|---|---|---:|---:|', ...e.r2.map(c => `| ${c[0]} | ${pn(c[1])} | ${c[2]} | ${c[3].toFixed(1)}% |`), ''); });
out.push('## The parties', '');
U.ALL_PARTIES.filter(p => L.parties[p]).forEach(p => { const x = L.parties[p]; out.push(`### ${U.PARTIES[p].name} (${U.PARTIES[p].short})`, '', `*Founded ${x[0]}.* ${x[1]}`, '', `**Ideology:** ${x[2]}`, ''); });
out.push('## The default timeline', '', L.future, '');
fs.writeFileSync(path.join(__dirname, '../docs/LORE.md'), out.join('\n'));
console.log('wrote docs/LORE.md', out.length, 'lines');
