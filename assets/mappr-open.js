/* The Open Mappr transition.
 *
 * Pressing Open Mappr glazes the screen with solid ceramic tiles, then hands
 * over to the app. It is the one moment on the site where there is a real
 * wait, so it is the one place the ceramic moves: board 06 says nothing moves
 * at rest, and a transition is not rest.
 *
 * The plate takes its colour from the button it fired from, so pressing the
 * yellow Open Mappr button turns the screen Mappr's yellow. That is board
 * 10's settled line made literal: the hero button is the same yellow, shape
 * and ground as the app it opens, so pressing it changes the content and
 * nothing else. It also keeps a tool page to one accent, which the seam rule
 * requires and which a six-colour house plate would break.
 *
 * The other rules it keeps: solid tiles bleeding off every edge, so the field
 * never reads as a decorative box; no motif repeated beside or above itself;
 * the knockout inside a motif is the ground, never white; steps, never an
 * ease, because sliding between drawings is what makes a wobble look like a
 * bug.
 *
 * Progressive enhancement: with no JS, or with reduced motion asked for, the
 * link is an ordinary link and nothing here runs.
 */
(function () {
  'use strict';

  var D = window.ARGH_TILES;
  if (!D) return;

  // Set by eye against tools/preview-transition.html, not derived.
  var MODULE = 80;        // tile pitch
  var STEP = 70;          // ms between waves, stepped
  var HOLD = 300;         // ms the full plate holds before the hand-over
  var NS = 'http://www.w3.org/2000/svg';

  function svgTile(shape, motif, accent) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '-2 -2 104 104');
    s.setAttribute('aria-hidden', 'true');
    var fill = document.createElementNS(NS, 'path');
    fill.setAttribute('d', shape);
    fill.setAttribute('fill', accent);
    fill.setAttribute('stroke', accent);
    fill.setAttribute('stroke-width', '2');
    fill.setAttribute('stroke-linejoin', 'round');
    s.appendChild(fill);
    // the motif, knocked out in the ground
    motif.forEach(function (d) {
      var p = document.createElementNS(NS, 'path');
      // the motif is normalised to a 100 box; sit it at 55 percent, centred
      p.setAttribute('transform', 'translate(22.5,22.5) scale(0.55)');
      p.setAttribute('d', d);
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', D.ground);
      p.setAttribute('stroke-width', '4');
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('stroke-linejoin', 'round');
      s.appendChild(p);
    });
    return s;
  }

  function accentOf(a) {
    var c = window.getComputedStyle(a).color;
    // a link with no accent of its own falls back to the house's yellow
    return (c && c !== 'rgba(0, 0, 0, 0)') ? c : D.accents[2];
  }

  function lay(accent) {
    var cols = Math.ceil(window.innerWidth / MODULE) + 1;
    var rows = Math.ceil(window.innerHeight / MODULE) + 1;
    var names = Object.keys(D.motifs);
    var grid = [];
    var el = document.createElement('div');
    el.className = 'glaze-over';
    el.setAttribute('aria-hidden', 'true');
    el.style.setProperty('--m', MODULE + 'px');
    el.style.gridTemplateColumns = 'repeat(' + cols + ', var(--m))';

    for (var r = 0; r < rows; r++) {
      grid[r] = [];
      for (var c = 0; c < cols; c++) {
        // one accent across the plate, so never two of the same motif adjacent
        var bad = {};
        if (c > 0) bad[grid[r][c - 1].m] = 1;
        if (r > 0) bad[grid[r - 1][c].m] = 1;
        var m, guard = 0;
        do { m = (Math.random() * names.length) | 0; guard++; }
        while (bad[m] && guard < 30);
        grid[r][c] = { m: m };

        var cell = document.createElement('span');
        cell.className = 'gt';
        // stepped in by distance, so the plate arrives as a wave not a fade
        cell.style.animationDelay = (Math.round((r + c) / 2) * STEP) + 'ms';
        cell.appendChild(svgTile(
          D.tiles[(r * 3 + c * 5) % D.tiles.length],
          D.motifs[names[m]],
          accent
        ));
        el.appendChild(cell);
      }
    }
    document.body.appendChild(el);
    return Math.round((rows + cols) / 2) * STEP + HOLD;
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href="/mappr/app"]') : null;
    if (!a) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    e.preventDefault();
    var wait = lay(accentOf(a));
    setTimeout(function () { window.location.href = a.href; }, wait);
  });
})();
