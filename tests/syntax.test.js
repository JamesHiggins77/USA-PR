// Every script the page loads must parse (the engine tests do not load the UI).
const test = require('node:test'), assert = require('node:assert');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const scripts = [...fs.readFileSync(path.join(root, 'index.html'), 'utf8').matchAll(/src="([^"]+)"/g)].map(m => m[1]);
test('all page scripts parse', () => {
  assert.ok(scripts.length > 10);
  for (const s of scripts) execFileSync(process.execPath, ['--check', path.join(root, s)]);
});
