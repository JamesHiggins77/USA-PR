// Builds js/data/districts.js: a synthetic map of the 400 House districts.
// Real 1990s boundaries do not fit this game's 400-district apportionment, so
// each state is divided into its number of districts by weighted Lloyd
// relaxation: districts are small where population is dense (around the
// major cities) and large in rural areas. Each district also gets an
// urbanity index (0 rural .. 1 urban core) used by the vote model.
//
// Usage: node tools/build_districts.js <dir with us-atlas, topojson-client, d3-delaunay, d3-geo packages>
// (npm pack us-atlas@3.0.1 topojson-client@3.1.0 d3-delaunay@6.0.4 d3-geo@3.1.1 and their dependencies)
const path = require('path'), fs = require('fs');
const dir = process.argv[2];
if (!dir) { console.error('usage: node tools/build_districts.js <packages dir>'); process.exit(1); }
// load the packages' UMD bundles directly (their package.json says "type": "module")
const UMD = { 'd3-array': 'd3-array/dist/d3-array.js', 'internmap': 'internmap/dist/internmap.js', 'robust-predicates': 'robust-predicates/umd/orient2d.js',
  'delaunator': 'delaunator/delaunator.js', 'd3-delaunay': 'd3-delaunay/dist/d3-delaunay.js', 'd3-geo': 'd3-geo/dist/d3-geo.js' };
const cache = {};
function load(name) {
  if (cache[name]) return cache[name];
  const file = path.join(dir, 'nm', UMD[name]), mod = { exports: {} };
  new Function('exports', 'module', 'require', fs.readFileSync(file, 'utf8'))(mod.exports, mod, load);
  return (cache[name] = mod.exports);
}
const topo = require(path.join(dir, 'tc/package/dist/topojson-client.js'));
const atlas = JSON.parse(fs.readFileSync(path.join(dir, 'package/states-albers-10m.json'), 'utf8'));
const { Delaunay } = load('d3-delaunay');
const d3geo = load('d3-geo');
const U = require('../tests/load.js');
const proj = d3geo.geoAlbersUsa().scale(1300).translate([487.5, 305]);

// Major cities: [name, lon, lat, metro population (millions, c. 2000)]
const CITIES = [
  ['New York', -74.0, 40.71, 18], ['Los Angeles', -118.24, 34.05, 12], ['Chicago', -87.63, 41.88, 9], ['Washington', -77.04, 38.9, 4.8],
  ['San Francisco', -122.42, 37.77, 4], ['San Jose', -121.89, 37.34, 1.7], ['Philadelphia', -75.16, 39.95, 5.7], ['Boston', -71.06, 42.36, 4.4],
  ['Detroit', -83.05, 42.33, 4.4], ['Dallas', -96.8, 32.78, 3.5], ['Fort Worth', -97.33, 32.75, 1.7], ['Houston', -95.37, 29.76, 4.7],
  ['Atlanta', -84.39, 33.75, 4.1], ['Miami', -80.19, 25.76, 2.3], ['Fort Lauderdale', -80.14, 26.12, 1.6], ['West Palm Beach', -80.05, 26.71, 1.1],
  ['Seattle', -122.33, 47.61, 3], ['Phoenix', -112.07, 33.45, 3.2], ['Minneapolis', -93.27, 44.98, 2.9], ['Cleveland', -81.69, 41.5, 2.1],
  ['San Diego', -117.16, 32.72, 2.8], ['St. Louis', -90.2, 38.63, 2.6], ['Denver', -104.99, 39.74, 2.4], ['Tampa', -82.46, 27.95, 2.4],
  ['Pittsburgh', -79.99, 40.44, 2.4], ['Portland', -122.68, 45.52, 1.9], ['Cincinnati', -84.51, 39.1, 2], ['Sacramento', -121.49, 38.58, 1.8],
  ['Kansas City', -94.58, 39.1, 1.8], ['Milwaukee', -87.91, 43.04, 1.7], ['Orlando', -81.38, 28.54, 1.6], ['Indianapolis', -86.16, 39.77, 1.6],
  ['San Antonio', -98.49, 29.42, 1.6], ['Norfolk', -76.29, 36.85, 1.6], ['Las Vegas', -115.14, 36.17, 1.6], ['Columbus', -83.0, 39.96, 1.5],
  ['Charlotte', -80.84, 35.23, 1.5], ['New Orleans', -90.07, 29.95, 1.3], ['Salt Lake City', -111.89, 40.76, 1.3], ['Greensboro', -79.79, 36.07, 1.3],
  ['Austin', -97.74, 30.27, 1.2], ['Nashville', -86.78, 36.16, 1.2], ['Providence', -71.41, 41.82, 1.2], ['Raleigh', -78.64, 35.78, 1.2],
  ['Hartford', -72.69, 41.76, 1.2], ['Buffalo', -78.88, 42.89, 1.2], ['Memphis', -90.05, 35.15, 1.1], ['Jacksonville', -81.66, 30.33, 1.1],
  ['Oklahoma City', -97.52, 35.47, 1.1], ['Louisville', -85.76, 38.25, 1], ['Richmond', -77.44, 37.54, 1], ['Rochester', -77.61, 43.16, 1.1],
  ['Birmingham', -86.8, 33.52, 0.9], ['Baltimore', -76.61, 39.29, 2.6], ['Newark', -74.17, 40.74, 2], ['Albany', -73.76, 42.65, 0.9],
  ['Tucson', -110.97, 32.22, 0.8], ['Honolulu', -157.86, 21.31, 0.9], ['Tulsa', -95.99, 36.15, 0.8], ['Fresno', -119.79, 36.74, 0.9],
  ['Omaha', -95.94, 41.26, 0.7], ['Albuquerque', -106.65, 35.08, 0.7], ['El Paso', -106.49, 31.76, 0.7], ['Grand Rapids', -85.67, 42.96, 1],
  ['Allentown', -75.49, 40.6, 0.6], ['Knoxville', -83.92, 35.96, 0.7], ['Columbia', -81.03, 34.0, 0.5], ['Charleston', -79.93, 32.78, 0.5],
  ['Little Rock', -92.29, 34.75, 0.6], ['Wichita', -97.34, 37.69, 0.6], ['Des Moines', -93.61, 41.59, 0.5], ['Boise', -116.2, 43.62, 0.4],
  ['Jackson', -90.18, 32.3, 0.4], ['Spokane', -117.43, 47.66, 0.4], ['Baton Rouge', -91.15, 30.45, 0.6], ['Madison', -89.4, 43.07, 0.4],
  ['Lexington', -84.5, 38.04, 0.5], ['Anchorage', -149.9, 61.22, 0.26], ['Portland ME', -70.26, 43.66, 0.25], ['Manchester', -71.46, 42.99, 0.4],
  ['Burlington', -73.21, 44.48, 0.15], ['Wilmington', -75.55, 39.74, 0.6], ['Charleston WV', -81.63, 38.35, 0.3], ['Billings', -108.5, 45.78, 0.13],
  ['Sioux Falls', -96.73, 43.55, 0.17], ['Fargo', -96.79, 46.88, 0.17], ['Cheyenne', -104.82, 41.14, 0.08], ['Reno', -119.81, 39.53, 0.34],
  ['Bakersfield', -119.02, 35.37, 0.66], ['Riverside', -117.4, 33.95, 3.2], ['Toledo', -83.54, 41.65, 0.6], ['Dayton', -84.19, 39.76, 0.95],
  ['Akron', -81.52, 41.08, 0.7], ['Syracuse', -76.15, 43.05, 0.7], ['Harrisburg', -76.88, 40.27, 0.6], ['Scranton', -75.66, 41.41, 0.6],
  ['Springfield MA', -72.59, 42.1, 0.6], ['Worcester', -71.8, 42.26, 0.75], ['Mobile', -88.04, 30.69, 0.5], ['Chattanooga', -85.31, 35.05, 0.45],
  ['Corpus Christi', -97.4, 27.8, 0.4], ['McAllen', -98.23, 26.2, 0.57], ['Colorado Springs', -104.82, 38.83, 0.5], ['Lansing', -84.56, 42.73, 0.45],
  ['Flint', -83.69, 43.01, 0.44], ['Gary', -87.35, 41.6, 0.63], ['Savannah', -81.1, 32.08, 0.3], ['Augusta', -81.97, 33.47, 0.48]
].map(c => { const p = proj([c[1], c[2]]); return p ? { name: c[0], x: p[0], y: p[1], pop: c[3] } : null; }).filter(Boolean);

const NAMES = {}; for (const k in U.STATES) NAMES[U.STATES[k].name] = k; NAMES['District of Columbia'] = 'DC';
const fc = topo.feature(atlas, atlas.objects.states);
const app = U.Elections.apportion();
let seed = 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };

function rings(geom) { const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates; const r = []; polys.forEach(p => p.forEach(x => r.push(x))); return r; }
function inside(rs, x, y) { let c = false; for (const r of rs) for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
function density(x, y, pop) {
  let d = 0.12 * pop;
  for (const c of CITIES) { const s = 7 + 6 * Math.sqrt(c.pop); const dx = x - c.x, dy = y - c.y; d += c.pop * 4 * Math.exp(-(dx * dx + dy * dy) / (2 * s * s)); }
  return d;
}

const out = {};
for (const f of fc.features) {
  const sid = NAMES[f.properties.name]; if (!sid) continue;
  const n = sid === 'DC' ? 1 : app.district[sid], rs = rings(f.geometry);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  rs.forEach(r => r.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }));
  if (n === 1) { out[sid] = { cells: [null], u: [0.5] }; continue; }
  const step = Math.max(0.6, Math.sqrt((x1 - x0) * (y1 - y0) / 6000)), grid = [];
  const pop = U.STATES[sid].pop;
  for (let x = x0; x <= x1; x += step) for (let y = y0; y <= y1; y += step) if (inside(rs, x, y)) grid.push([x, y, density(x, y, 1)]);
  // weighted initial seeds
  const tot = grid.reduce((s, g) => s + g[2], 0); let seeds = [];
  for (let i = 0; i < n; i++) { let t = rnd() * tot; for (const g of grid) { t -= g[2]; if (t <= 0) { seeds.push([g[0] + rnd() * step, g[1] + rnd() * step]); break; } } }
  // weighted Lloyd relaxation, with a capacity penalty to equalise population
  for (let it = 0; it < 40; it++) {
    const acc = seeds.map(() => [0, 0, 0]), load = seeds.map(() => 0);
    const bias = seeds.map((_, i) => 0);
    for (let pass = 0; pass < 2; pass++) {
      acc.forEach(a => { a[0] = a[1] = a[2] = 0; }); load.fill(0);
      for (const g of grid) {
        let best = 0, bd = 1e18;
        for (let i = 0; i < seeds.length; i++) { const dx = g[0] - seeds[i][0], dy = g[1] - seeds[i][1]; const d = dx * dx + dy * dy + bias[i]; if (d < bd) { bd = d; best = i; } }
        acc[best][0] += g[0] * g[2]; acc[best][1] += g[1] * g[2]; acc[best][2] += g[2]; load[best] += g[2];
      }
      const avg = tot / n; load.forEach((l, i) => { bias[i] += (l / avg - 1) * step * step * 3; });
    }
    seeds = seeds.map((s, i) => acc[i][2] ? [acc[i][0] / acc[i][2], acc[i][1] / acc[i][2]] : [s[0] + (rnd() - .5) * step * 4, s[1] + (rnd() - .5) * step * 4]);
  }
  const v = Delaunay.from(seeds).voronoi([x0 - 2, y0 - 2, x1 + 2, y1 + 2]);
  const dens = seeds.map(s => density(s[0], s[1], 1));
  const order = seeds.map((_, i) => i).sort((a, b) => dens[b] - dens[a]);
  const lo = Math.log(Math.min(...dens) + 0.01), hi = Math.log(Math.max(...dens) + 0.01);
  out[sid] = {
    cells: order.map(i => { const poly = v.cellPolygon(i); return poly ? 'M' + poly.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L') + 'Z' : ''; }),
    u: order.map(i => +(hi > lo ? (Math.log(dens[i] + 0.01) - lo) / (hi - lo) : 0.5).toFixed(2)),
    c: order.map(i => [Math.round(seeds[i][0]), Math.round(seeds[i][1])])
  };
}
fs.writeFileSync(path.join(__dirname, '../js/data/districts.js'),
  '// Synthetic House district map (generated by tools/build_districts.js; do not edit).\n' +
  '// cells: SVG paths clipped to the state outline at render time; u: urbanity 0..1; c: centre.\n' +
  '(function (G) { G.USA.DISTRICTS = ' + JSON.stringify(out) + '; })(typeof globalThis !== \'undefined\' ? globalThis : window);\n');
console.log('states', Object.keys(out).length, 'districts', Object.values(out).reduce((s, o) => s + o.cells.length, 0));
