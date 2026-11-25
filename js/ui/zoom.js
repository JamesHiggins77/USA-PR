// Map zoom and pan (wheel, drag, +/- buttons) and hover cards for maps.
// The zoom level is remembered per map key across re-renders.
(function (G) {
  'use strict';
  var U = G.USA, Z = U.Zoom = { views: {} };

  function base(svg) { var v = svg.getAttribute('data-vb0'); if (!v) { v = svg.getAttribute('viewBox'); svg.setAttribute('data-vb0', v); } return v.split(/\s+/).map(Number); }
  function set(svg, key, vb) {
    var b = base(svg), w = Math.max(b[2] / 12, Math.min(b[2], vb[2])), h = w * b[3] / b[2];
    var x = Math.max(b[0] - w * 0.1, Math.min(b[0] + b[2] - w * 0.9, vb[0])), y = Math.max(b[1] - h * 0.1, Math.min(b[1] + b[3] - h * 0.9, vb[1]));
    var v = [x, y, w, h]; Z.views[key] = v; svg.setAttribute('viewBox', v.join(' '));
    // keep strokes and labels readable when zoomed
    svg.style.setProperty('--zoom', (b[2] / w).toFixed(2));
  }
  function zoomAt(svg, key, k, cx, cy) {
    var v = (Z.views[key] || base(svg)).slice(), r = svg.getBoundingClientRect();
    var px = v[0] + (cx - r.left) / r.width * v[2], py = v[1] + (cy - r.top) / r.height * v[3];
    var w = v[2] / k, h = v[3] / k;
    set(svg, key, [px - (px - v[0]) / k, py - (py - v[1]) / k, w, h]);
  }

  // Attach to the first svg inside `box`. hover(el, target) -> html or null.
  Z.attach = function (box, key, hover) {
    var svg = box.querySelector('svg'); if (!svg) return;
    box.classList.add('zoombox');
    base(svg);
    if (Z.views[key]) set(svg, key, Z.views[key]);
    svg.querySelectorAll('title').forEach(function (t) { if (hover) t.remove(); });
    if (!box.querySelector('.zoomctl')) {
      box.insertAdjacentHTML('beforeend', '<div class="zoomctl"><button title="Zoom in" data-z="in">+</button><button title="Zoom out" data-z="out">−</button><button title="Reset view" data-z="reset">↺</button></div>');
    }
    box.querySelectorAll('[data-z]').forEach(function (b) { b.onclick = function (e) {
      e.stopPropagation(); var r = svg.getBoundingClientRect();
      if (b.dataset.z === 'reset') { delete Z.views[key]; svg.setAttribute('viewBox', base(svg).join(' ')); svg.style.setProperty('--zoom', 1); return; }
      zoomAt(svg, key, b.dataset.z === 'in' ? 1.6 : 1 / 1.6, r.left + r.width / 2, r.top + r.height / 2);
    }; });
    svg.addEventListener('wheel', function (e) { e.preventDefault(); zoomAt(svg, key, e.deltaY < 0 ? 1.25 : 0.8, e.clientX, e.clientY); }, { passive: false });
    // touch: one finger pans, two fingers pinch-zoom; the page does not scroll under the map
    svg.style.touchAction = 'none';
    var pts = {};
    svg.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pts);
      if (ids.length === 2) { var a = pts[ids[0]], b = pts[ids[1]];
        Z.drag = null; Z.pinch = { svg: svg, key: key, d: Math.hypot(a.x - b.x, a.y - b.y), pts: pts }; Z.hide(); return; }
      Z.drag = { svg: svg, key: key, x: e.clientX, y: e.clientY, v: (Z.views[key] || base(svg)).slice(), moved: false };
    });
    svg.addEventListener('pointermove', function (e) {
      if (!pts[e.pointerId]) return; pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var P = Z.pinch; if (!P || P.svg !== svg) return;
      var ids = Object.keys(pts); if (ids.length < 2) return;
      var a = pts[ids[0]], b = pts[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (P.d > 0 && d > 0) zoomAt(svg, key, d / P.d, (a.x + b.x) / 2, (a.y + b.y) / 2);
      P.d = d; P.moved = true;
    });
    var lift = function (e) { delete pts[e.pointerId];
      if (Z.pinch && Z.pinch.svg === svg && Object.keys(pts).length < 2) { svg.__justDragged = true; setTimeout(function () { svg.__justDragged = false; }, 350); if (!Object.keys(pts).length) Z.pinch = null; } };
    svg.addEventListener('pointerup', lift); svg.addEventListener('pointercancel', lift);
    // a drag should not count as a click on a state
    svg.addEventListener('click', function (e) { if (svg.__justDragged) { e.stopPropagation(); e.preventDefault(); } }, true);
    if (hover) {
      // mouse: the card follows the pointer
      svg.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse' || (Z.drag && Z.drag.moved)) return;
        var t = e.target.closest('.dist, .tile');
        var html = t ? hover(t, e) : null;
        if (html) Z.card(html, e.clientX, e.clientY); else Z.hide();
      });
      svg.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') Z.hide(); });
      // touch: a double tap on a state opens its card (pinned at the bottom of
      // the screen); a single tap or a drag closes it
      var lastTap = null;
      svg.addEventListener('pointerup', function (e) {
        if (e.pointerType === 'mouse') return;
        if ((Z.drag && Z.drag.moved) || svg.__justDragged || Z.pinch) { lastTap = null; return; }
        var t = e.target.closest && e.target.closest('.dist, .tile'), now = Date.now();
        if (lastTap && t && lastTap.t === t && now - lastTap.at < 400 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 30) {
          var html = hover(t, e); lastTap = null;
          if (html) Z.sheet(html); return;
        }
        lastTap = { t: t, at: now, x: e.clientX, y: e.clientY }; Z.hide();
      });
      if (matchMedia && matchMedia('(pointer: coarse)').matches && !box.querySelector('.zoomhint')) box.insertAdjacentHTML('beforeend', '<div class="zoomhint">Drag to move \u00b7 pinch to zoom \u00b7 double-tap a state for details</div>');
    }
  };

  // one set of window listeners for panning, whichever map is being dragged
  G.addEventListener && G.addEventListener('pointermove', function (e) {
    var d = Z.drag; if (!d || !d.svg.isConnected) return;
    var dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.moved && Math.abs(dx) + Math.abs(dy) < 5) return;
    d.moved = true; d.svg.classList.add('panning'); Z.hide();
    var r = d.svg.getBoundingClientRect(), v = d.v;
    set(d.svg, d.key, [v[0] - dx / r.width * v[2], v[1] - dy / r.height * v[3], v[2], v[3]]);
  });
  G.addEventListener && G.addEventListener('pointerup', function () {
    var d = Z.drag; Z.drag = null; if (!d || !d.moved) return;
    d.svg.classList.remove('panning'); d.svg.__justDragged = true; setTimeout(function () { d.svg.__justDragged = false; }, 0);
  });

  var box = null;
  Z.card = function (html, x, y) {
    if (!box) { box = document.createElement('div'); box.id = 'mapcard'; document.body.appendChild(box); }
    box.innerHTML = html; box.style.display = 'block';
    var bw = box.offsetWidth, bh = box.offsetHeight;
    var left = x + 16 + bw > window.innerWidth ? x - bw - 12 : x + 16, top = Math.min(window.innerHeight - bh - 8, y + 12);
    box.style.left = (left + window.scrollX) + 'px'; box.style.top = (Math.max(8, top) + window.scrollY) + 'px';
  };
  Z.hide = function () { if (box) { box.style.display = 'none'; box.classList.remove('sheet'); } };
  // touch: the card sits at the bottom of the screen with a close button
  Z.sheet = function (html) {
    if (!box) { box = document.createElement('div'); box.id = 'mapcard'; document.body.appendChild(box); }
    box.innerHTML = '<button class="sheetx" aria-label="Close">\u00d7</button>' + html; box.classList.add('sheet'); box.style.display = 'block'; box.style.left = ''; box.style.top = '';
    box.querySelector('.sheetx').onclick = Z.hide;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
