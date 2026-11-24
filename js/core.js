// Shared namespace, seeded RNG and helpers. Works in the browser and in Node.
(function (G) {
  'use strict';
  var U = G.USA = G.USA || {};

  // mulberry32: the seed lives in the game state so saves replay identically
  U.rng = function (Q) {
    var t = (Q.seed = (Q.seed + 0x6D2B79F5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  U.gauss = function (Q) { // approx normal(0,1)
    var s = 0; for (var i = 0; i < 6; i++) s += U.rng(Q); return s - 3;
  };
  U.pick = function (Q, arr) { return arr[Math.floor(U.rng(Q) * arr.length)]; };
  U.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  U.sum = function (o) { var s = 0; for (var k in o) s += o[k]; return s; };
  U.round1 = function (v) { return Math.round(v * 10) / 10; };
  U.keys = Object.keys;
  U.majority = function () { return Math.floor(U.RULES.house.total / 2) + 1; };
  // House votes. On an exact tie the President casts the deciding vote
  // (res.pres: how the President's party voted).
  U.absolute = function (res) { var m = U.majority(); return res.yes >= m || (U.RULES.house.total % 2 === 0 && res.yes === m - 1 && res.pres === 'yes'); };
  U.simple = function (res) { return res.yes > res.no || (res.yes === res.no && res.yes > 0 && res.pres === 'yes'); };
  U.pure = function () { return U.RULES.house.system === 'pure-pr'; };
  U.clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  U.MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];
  U.dateStr = function (Q) { return U.MONTHS[Q.month - 1] + ' ' + Q.year; };
  U.monthIndex = function (y, m) { return y * 12 + (m - 1); };
})(typeof globalThis !== 'undefined' ? globalThis : window);
