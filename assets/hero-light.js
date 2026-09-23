/* Light the field (book board 17). Every key in the house hero already holds a
 * motif; the cursor is the light. The keys you are over show theirs at 85
 * percent and the ring round them at 42, and they go out behind you after a
 * short stepped linger, so the light trails the cursor instead of snapping.
 * Behind the type they only reach a third, so the words stay first. Keys that
 * already wear a resting motif keep it and are never lit over.
 *
 * The grid is the one assets/hero-field.svg is drawn on, laid by CSS as a
 * centred cover, so the same maths places each motif in its key. The motifs
 * are the outline set in assets/tiles.svg, each in its owner's colour.
 * tools/build-hero.py deals them and writes window.ARGH_LIGHT.
 *
 * Mouse and trackpad only: touch and reduced motion get the resting field. The
 * layer is built on the first move, so a visitor who never points at the hero
 * never pays for it. */
(function () {
  'use strict';
  var D = window.ARGH_LIGHT;
  var hero = document.querySelector('.hhero');
  if (!D || !hero || !window.matchMedia) return;
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var R1 = 1.2, R2 = 2.2;                 // in keys
  var NS = 'http://www.w3.org/2000/svg';
  var layer = null, els = [], geo = null, lit = {}, raf = 0, px = null, py = null;

  function build() {
    layer = document.createElement('div');
    layer.className = 'lightfield';
    layer.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < D.cols * D.rows; i++) {
      var code = D.k.substr(i * 2, 2);
      if (code === '..') { els.push(null); continue; }
      var c = i % D.cols, r = (i / D.cols) | 0;
      var s = document.createElementNS(NS, 'svg');
      s.setAttribute('viewBox', '0 0 120 120');
      if (c < D.tc && r < D.tr) s.setAttribute('data-t', '');
      var u = document.createElementNS(NS, 'use');
      u.setAttribute('href', '/assets/tiles.svg#o-' + D.names[+code[0]]);
      s.appendChild(u);
      s.style.transform = 'rotate(' + (+code[1] * 90) + 'deg)';
      layer.appendChild(s);
      els.push(s);
    }
    hero.insertBefore(layer, hero.querySelector('.wrap'));
    place();
  }

  function place() {
    var w = hero.clientWidth, h = hero.clientHeight;
    var s = Math.max(w / D.W, h / D.H);
    geo = { s: s, ox: (w - D.W * s) / 2, oy: (h - D.H * s) / 2 };
    // a motif is 55 percent of an 80 percent keycap; the outline fills 70
    // percent of its 120 box, so the box is that over 0.7
    var size = D.M * 0.8 * 0.55 / 0.7 * s;
    for (var i = 0; i < els.length; i++) {
      if (!els[i]) continue;
      var c = i % D.cols, r = (i / D.cols) | 0;
      var st = els[i].style;
      st.width = st.height = size + 'px';
      st.left = (geo.ox + ((c + 0.5) * D.M) * s - size / 2) + 'px';
      st.top = (geo.oy + ((r + 0.5) * D.M) * s - size / 2) + 'px';
    }
  }

  function update() {
    raf = 0;
    var on = {};
    if (px !== null) {
      var k = D.M * geo.s;
      var fc = (px - geo.ox) / k - 0.5, fr = (py - geo.oy) / k - 0.5;
      var c0 = Math.max(0, Math.floor(fc - R2)), c1 = Math.min(D.cols - 1, Math.ceil(fc + R2));
      var r0 = Math.max(0, Math.floor(fr - R2)), r1 = Math.min(D.rows - 1, Math.ceil(fr + R2));
      for (var r = r0; r <= r1; r++) {
        for (var c = c0; c <= c1; c++) {
          var i = r * D.cols + c;
          if (!els[i]) continue;
          var d = Math.sqrt((c - fc) * (c - fc) + (r - fr) * (r - fr));
          if (d <= R1) on[i] = 'l1'; else if (d <= R2) on[i] = 'l2';
        }
      }
    }
    for (var j in lit) if (!(j in on)) els[j].removeAttribute('class');
    for (var n in on) if (lit[n] !== on[n]) els[n].setAttribute('class', on[n]);
    lit = on;
  }

  function ask() { if (!raf) raf = requestAnimationFrame(update); }

  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    if (!layer) build();
    var b = hero.getBoundingClientRect();
    px = e.clientX - b.left; py = e.clientY - b.top;
    ask();
  });
  hero.addEventListener('pointerleave', function () { px = null; ask(); });
  window.addEventListener('resize', function () { if (layer) { place(); ask(); } });
})();
