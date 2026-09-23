/* The Open Mappr transition (book board 16).
 *
 * Pressing Open Mappr drops a plate of glazed tiles out of the band: the row
 * the band sits in fills first, then the rows above and below it, 45ms a row
 * away from the band and 8ms a column away from the button you pressed, so it
 * ripples out from where you are looking. The plate holds 300ms and then the
 * page goes to /mappr/app#glaze=<x>,<y>, the band's offset on screen. The app paints the same plate on its first
 * frame and rolls it back up once the map has drawn, so the plate never just
 * vanishes; an app that does not know about #glaze simply ignores it.
 *
 * Every tile is the button's tool's glaze on an opaque ground (p-<motif> in
 * assets/tiles.svg, which the band has already loaded), turned a quarter by
 * (row * 3 + column), which is the pattern the app lays too. The plate lines
 * up with the band's columns and rows, so it reads as the band carrying on.
 *
 * It is the one moment the ceramic moves on its own: board 06 says nothing
 * moves at rest, and a transition is not rest. Steps, never an ease.
 *
 * With no JS, with reduced motion asked for, or with a modifier held, the link
 * is an ordinary link and nothing here runs. The plate is torn down on the way
 * out and again on the way back, so the back/forward cache cannot restore a
 * screen of solid yellow.
 */
(function () {
  'use strict';

  var M = 68;             // the band's module
  var ROW = 45, COL = 8;  // ms per row away from the band, per column away from the button
  var HOLD = 300;         // ms the whole plate holds before the hand-over
  var SPRITE = '/assets/tiles.svg';
  var NS = 'http://www.w3.org/2000/svg';
  var plate = null, timer = null;

  function clear() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (plate) { plate.remove(); plate = null; }
    var stray = document.querySelector('.glaze-over');
    if (stray) stray.remove();
  }
  window.addEventListener('pagehide', clear);
  window.addEventListener('pageshow', clear);

  function tile(motif, rot) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 120 120');
    var g = document.createElementNS(NS, 'g');
    g.setAttribute('transform', 'rotate(' + rot + ' 60 60)');
    var u = document.createElementNS(NS, 'use');
    u.setAttribute('href', SPRITE + '#p-' + motif);
    g.appendChild(u);
    s.appendChild(g);
    return s;
  }

  function lay(a, motif) {
    var W = window.innerWidth, H = window.innerHeight;
    // anchor the grid to the band, so the plate is the band carrying on
    var row = document.querySelector('.nb-mid .row') || document.querySelector('.tileband .row');
    var ox = 0, oy = 0;
    if (row) {
      var b = row.getBoundingClientRect();
      ox = b.left; oy = b.top;
    }
    var c0 = Math.floor((0 - ox) / M), c1 = Math.ceil((W - ox) / M);
    var r0 = Math.floor((0 - oy) / M), r1 = Math.ceil((H - oy) / M);
    var br = a.getBoundingClientRect();
    var bc = Math.floor((br.left + br.width / 2 - ox) / M);
    var el = document.createElement('div');
    el.className = 'glaze-over';
    el.setAttribute('aria-hidden', 'true');
    var last = 0;
    for (var r = r0; r < r1; r++) {
      for (var c = c0; c < c1; c++) {
        var d = Math.abs(r) * ROW + Math.abs(c - bc) * COL;   // row 0 is the band's row
        if (d > last) last = d;
        var cell = document.createElement('span');
        cell.className = 'gt';
        cell.style.left = (ox + c * M) + 'px';
        cell.style.top = (oy + r * M) + 'px';
        cell.style.animationDelay = d + 'ms';
        cell.appendChild(tile(motif, (((r * 3 + c) % 4) + 4) % 4 * 90));
        el.appendChild(cell);
      }
    }
    document.body.appendChild(el);
    plate = el;
    return { wait: last + HOLD, at: Math.round(ox) + ',' + Math.round(oy) };
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href="/mappr/app"]') : null;
    if (!a) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    e.preventDefault();
    clear();
    var p = lay(a, a.getAttribute('data-plate') || 'quarter-disc');
    // the app lays the same plate at the same offset, so the hand-over has no seam
    var to = a.href.split('#')[0] + '#glaze=' + p.at;
    timer = setTimeout(function () { timer = null; window.location.href = to; }, p.wait);
  });
})();
