/* The seams on the house page (settled 24 September 2026).
 *
 * The tiles are in the markup (tools/build-seams.py), so a seam is there
 * without this file. This only moves them, and only while you scroll:
 *  - a seam fills in left to right the first time it comes on screen
 *  - it slides sideways as you scroll, alternate seams the other way
 *  - about a quarter of its open tiles spin, each at its own speed
 *  - one solid glaze runs along it, one tile per 46px of scroll
 * Scroll movement eases instead of stepping: stepped movement tied to the
 * scroll reads as lag. Hover and press stay stepped, like the rest of the
 * site. Nothing moves at rest, and reduced motion gets the still seams.
 */
(function () {
  'use strict';
  var els = [].slice.call(document.querySelectorAll('.seam'));
  if (!els.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.documentElement.classList.add('seams-on');

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -10% 0px' });

  var S = els.map(function (el, k) {
    io.observe(el);
    var sts = [].slice.call(el.querySelectorAll('.st'));
    return {
      el: el, row: el.firstElementChild, dir: k % 2 ? 1 : -1, sts: sts, x: null, idx: -1, lit: [],
      spin: sts.filter(function (t) { return t.classList.contains('spin'); })
               .map(function (t) { return { el: t, sp: +t.getAttribute('data-sp'), r: null }; })
    };
  });

  function lerp(a, b, t) { return a == null ? b : a + (b - a) * t; }

  // the runner glazes a tile by pointing its <use> at the solid version
  function glaze(t, on) {
    var u = t.querySelector('use');
    if (!u || t.classList.contains('spin')) return;   // never glaze a tile that is off the grid
    if (!u._h) u._h = u.getAttribute('href');
    u.setAttribute('href', on ? u._h.replace('#o-', '#g-') : u._h);
  }

  var running = false;
  function frame() {
    running = false;
    var sy = window.scrollY, vh = window.innerHeight, again = false;
    // read every rect first, then write
    var tops = S.map(function (o) { return o.el.getBoundingClientRect(); });
    S.forEach(function (o, k) {
      var r = tops[k];
      if (r.bottom < -300 || r.top > vh + 300) return;
      var tx = (r.top + r.height / 2 - vh / 2) * 0.45 * o.dir;
      o.x = lerp(o.x, tx, 0.12);
      if (Math.abs(o.x - tx) > 0.1) again = true;
      o.row.style.transform = 'translate3d(' + o.x.toFixed(2) + 'px,0,0)';

      o.spin.forEach(function (t) {
        var tr = sy * t.sp;
        t.r = lerp(t.r, tr, 0.12);
        if (Math.abs(t.r - tr) > 0.1) again = true;
        t.el.style.setProperty('--r', t.r.toFixed(2) + 'deg');
      });

      var n = o.sts.length, idx = ((Math.floor(sy / 46) * o.dir) % n + n) % n;
      if (idx !== o.idx) {
        o.idx = idx;
        o.lit.forEach(function (t) { t.classList.remove('lit', 'lit2'); glaze(t, false); });
        var a = o.sts[idx], b = o.sts[(idx + 1) % n], c = o.sts[(idx - 1 + n) % n];
        a.classList.add('lit'); b.classList.add('lit2'); c.classList.add('lit2');
        o.lit = [a, b, c];
        o.lit.forEach(function (t) { glaze(t, true); });
      }
    });
    if (again) kick();
  }
  function kick() { if (!running) { running = true; window.requestAnimationFrame(frame); } }

  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick);
  kick();
})();
