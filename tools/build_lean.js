// Builds js/data/district_lean.js: the 1998-era partisan lean of every House
// district, from real presidential results.
//
// Lean = the district's two-party Democratic margin minus the national one,
// weighting 1996 (Clinton-Dole) 75% and 1992 (Clinton-Bush) 25%, the
// elections that framed politics in 1998. Positive = more Democratic.
//
// County results are aggregated into district boundaries by area-weighted
// sampling (each sample point carries its county's votes per unit area).
//
// Sources:
//  - 1992/1996 county results: Dave Leip's Atlas via
//    github.com/cilekagaci/us-presidential-county-1960-2016
//    (data/processed/full-us-presidential-counties-1960-2016.tsv; no AK or VA)
//  - Virginia: 2000 county results, MIT Election Data + Science Lab
//    (github.com/MEDSL/county-returns, countypres_2000-2016.csv), used as a proxy
//  - County shapes: us-atlas 3.0.1 counties-albers-10m.json
//  - District shapes: the GeoJSON folder used by tools/build_districts.js
//
//   node tools/build_lean.js <counties tsv> <medsl csv> <us-atlas dir> <district geojson dir> <packages dir>
const fs = require('fs'), path = require('path');
const [tsv, medsl, atlasDir, cdDir, pkgs] = process.argv.slice(2);
const load = (() => { const UMD = { 'd3-array': 'd3-array/dist/d3-array.js', internmap: 'internmap/dist/internmap.js', 'd3-geo': 'd3-geo/dist/d3-geo.js' }, c = {};
  return function L(n) { if (c[n]) return c[n]; const m = { exports: {} }; new Function('exports', 'module', 'require', fs.readFileSync(path.join(pkgs, 'nm', UMD[n]), 'utf8'))(m.exports, m, L); return (c[n] = m.exports); }; })();
const topo = require(path.join(pkgs, 'tc/package/dist/topojson-client.js'));
const proj = load('d3-geo').geoAlbersUsa().scale(1300).translate([487.5, 305]);

// ---- county votes: {fips: {D, R}} weighted 75% 1996 + 25% 1992 (shares of the county total) ----
const votes = {};
function add(fips, party, v, w) { const o = votes[fips] = votes[fips] || { D: 0, R: 0 }; o[party] += v * w; }
const W = { 1996: 0.75, 1992: 0.25 };
const lines = fs.readFileSync(tsv, 'utf8').split('\n'), head = lines[0].split('\t'), ix = n => head.indexOf(n);
for (const l of lines.slice(1)) {
  const c = l.split('\t'); const y = +c[ix('year')]; if (!W[y]) continue;
  const p = c[ix('party')]; if (p !== 'D' && p !== 'R') continue;
  add(String(c[ix('county.fips')]).padStart(5, '0'), p, +c[ix('vote.count')], W[y]);
}
// Virginia from MEDSL 2000
for (const l of fs.readFileSync(medsl, 'utf8').split('\n').slice(1)) {
  const c = l.match(/("[^"]*"|[^,]+)/g); if (!c || c[0] !== '2000' || c[2] !== '"VA"') continue;
  const party = c[7].replace(/"/g, ''); if (party !== 'democrat' && party !== 'republican') continue;
  add(String(c[4]).padStart(5, '0'), party === 'democrat' ? 'D' : 'R', +c[8], 1);
}
// national two-party margin (same weighting)
let nd = 0, nr = 0; for (const f in votes) if (f.slice(0, 2) !== '51') { nd += votes[f].D; nr += votes[f].R; }
const nat = (nd - nr) / (nd + nr) * 100;

// ---- county shapes ----
const atlas = JSON.parse(fs.readFileSync(path.join(atlasDir, 'counties-albers-10m.json'), 'utf8'));
const counties = topo.feature(atlas, atlas.objects.counties).features.map(f => {
  const polys = f.geometry ? (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates) : [];
  const rings = []; polys.forEach(p => p.forEach(r => rings.push(r)));
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, area = 0;
  rings.forEach(r => { r.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }); area += ringArea(r) * (isHole(r, rings) ? -1 : 1); });
  return { id: f.id, rings, bb: [x0, y0, x1, y1], area: Math.abs(area) };
});
function ringArea(r) { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return Math.abs(a / 2); }
function isHole() { return false; }
function inside(rings, x, y) { let c = false; for (const r of rings) for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
// spatial grid index for counties
const G = 10, grid = {};
counties.forEach((c, k) => { for (let gx = Math.floor(c.bb[0] / G); gx <= Math.floor(c.bb[2] / G); gx++) for (let gy = Math.floor(c.bb[1] / G); gy <= Math.floor(c.bb[3] / G); gy++) (grid[gx + ',' + gy] = grid[gx + ',' + gy] || []).push(k); });
function countyAt(x, y) { const l = grid[Math.floor(x / G) + ',' + Math.floor(y / G)] || []; for (const k of l) { const c = counties[k]; if (x >= c.bb[0] && x <= c.bb[2] && y >= c.bb[1] && y <= c.bb[3] && inside(c.rings, x, y)) return c; } return null; }

// ---- districts ----
const out = {}; let miss = 0;
for (const f of fs.readdirSync(cdDir).filter(f => /^[A-Z]{2}-\d+\.json$/.test(f))) {
  const [st, num] = f.replace('.json', '').split('-'), n = +num || 1;
  let g = JSON.parse(fs.readFileSync(path.join(cdDir, f), 'utf8')); g = g.type === 'Feature' ? g.geometry : g;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates, rings = [];
  polys.forEach(p => p.forEach(r => { const pr = r.map(c => proj(c)).filter(Boolean); if (pr.length > 2) rings.push(pr); }));
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, area = 0;
  rings.forEach(r => { area += ringArea(r); r.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }); });
  const step = Math.max(0.01, Math.sqrt(area / 900));
  let D = 0, R = 0;
  for (let x = x0 + step / 2; x < x1; x += step) for (let y = y0 + step / 2; y < y1; y += step) {
    if (!inside(rings, x, y)) continue;
    const c = countyAt(x, y); if (!c) continue;
    const v = votes[c.id]; if (!v || !c.area) continue;
    D += v.D / c.area; R += v.R / c.area;
  }
  let lean = null;
  if (D + R > 0) lean = +((D - R) / (D + R) * 100 - nat).toFixed(1); else miss++;
  (out[st] = out[st] || [])[n - 1] = lean;
}
fs.writeFileSync(path.join(__dirname, '../js/data/district_lean.js'),
  '// 1998-era partisan lean by district (generated by tools/build_lean.js; see its header for sources).\n' +
  '// Two-party Democratic margin minus the national margin, 75% 1996 + 25% 1992 presidential results\n' +
  '// (Virginia: 2000). + = more Democratic than the nation, - = more Republican. null = no data (Alaska).\n' +
  '(function (G) { G.USA.DISTRICT_LEAN = ' + JSON.stringify(out) + '; })(typeof globalThis !== \'undefined\' ? globalThis : window);\n');
console.log('national margin D' + nat.toFixed(1), 'districts', Object.values(out).reduce((s, a) => s + a.length, 0), 'missing', miss);
